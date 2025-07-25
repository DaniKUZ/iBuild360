import os
import base64
import io
import re
import shutil
from flask import Flask, render_template, request, redirect, url_for, session
from dotenv import load_dotenv
from openai import OpenAI
import pandas as pd
import fitz  # PyMuPDF
from werkzeug.utils import secure_filename

# Загрузка переменных окружения из .env
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
app.secret_key = "super_secret_key_for_session"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def clear_uploads():
    if os.path.exists(UPLOAD_FOLDER):
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"Ошибка удаления {file_path}: {e}")

def extract_gantt_data(gantt_file_path):
    filename = gantt_file_path.lower()
    if filename.endswith(('.png', '.jpg', '.jpeg')):
        with open(gantt_file_path, "rb") as f:
            image_bytes = f.read()
        mime = "image/png" if filename.endswith(".png") else "image/jpeg"
        data_url = f"data:{mime};base64," + base64.b64encode(image_bytes).decode("utf-8")
        return {"type": "image", "data_url": data_url}
    elif filename.endswith('.pdf'):
        with open(gantt_file_path, "rb") as f:
            pdf_bytes = f.read()
        doc = fitz.open(stream=pdf_bytes, filetype='pdf')
        text_content = ""
        for page in doc:
            text_content += page.get_text().strip() + "\n"
        if text_content.strip():
            return {"type": "text", "text": text_content}
        page = doc.load_page(0)
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes()
        data_url = "data:image/png;base64," + base64.b64encode(img_bytes).decode("utf-8")
        return {"type": "image", "data_url": data_url}
    elif filename.endswith(('.xls', '.xlsx')):
        with open(gantt_file_path, "rb") as f:
            file_bytes = f.read()
        df = pd.read_excel(io.BytesIO(file_bytes), sheet_name=0)
        df = df.fillna("")
        csv_data = df.to_csv(index=False)
        return {"type": "text", "text": csv_data}
    else:
        return {"type": "unsupported"}

@app.route("/")
def index():
    # При возврате на главную — ОЧИСТИТЬ uploads и session
    clear_uploads()
    session.pop("gantt_filename", None)
    return render_template("index.html")

@app.route("/result", methods=["POST"])
def result():
    gantt_file = request.files.get("gantt")
    photo_file = request.files.get("photo")
    gantt_path = None

    # Если диаграмма Ганта не пришла - используем файл из сессии
    if not gantt_file:
        gantt_filename = session.get("gantt_filename")
        if not gantt_filename:
            return redirect(url_for("index"))
        gantt_path = os.path.join(UPLOAD_FOLDER, gantt_filename)
    else:
        filename = secure_filename(gantt_file.filename)
        gantt_path = os.path.join(UPLOAD_FOLDER, filename)
        gantt_file.save(gantt_path)
        session["gantt_filename"] = filename

    if not photo_file:
        return "Пожалуйста, загрузите фото объекта.", 400

    # Фото НЕ сохраняется на диск, только читается в память
    photo_filename = secure_filename(photo_file.filename)
    photo_bytes = photo_file.read()

    # Дата из названия фото
    photo_date = ""
    match = re.search(r'(\d{4}-\d{2}-\d{2})', photo_filename)
    if match:
        photo_date = match.group(1)

    # Обработка диаграммы Ганта
    gantt = extract_gantt_data(gantt_path)
    if gantt["type"] == "unsupported":
        return "Формат диаграммы Ганта не поддерживается.", 400

    photo_mime = "image/png" if photo_filename.endswith(".png") else "image/jpeg"
    photo_data_url = f"data:{photo_mime};base64," + base64.b64encode(photo_bytes).decode("utf-8")

    system_message = {
        "role": "system",
        "content": (
            "Ты — строительный аналитик. Проанализируй план (диаграмму Ганта) и фото объекта. "
            "В анализе обязательно учитывай:\n"
            "- Дату, указанную в названии файла фото (используй её для понимания ожидаемой стадии работ по календарю),\n"
            "- Время года, погодные условия и детали фото,\n"
            "- Логичный порядок выполнения работ,\n"
            "- Какие этапы вероятнее всего уже завершены до этого момента,\n"
            "- Процент выполнения рассчитывай по текущему этапу работ, а не по всему проекту.\n\n"
            "Структурируй ответ по шаблону:\n"
            "Текущий этап: ...\n"
            "Процент выполнения этапа: ...\n"
            "Сделано:\n"
            "- ...\n"
            "Осталось:\n"
            "- ...\n"
            "Комментарий: ... (поясни, почему ты сделал такие выводы, с учётом даты и сезона)\n\n"
            "Делай вывод структурированным, для удобства пользователя."
        )
    }

    if gantt["type"] == "image":
        user_content = [
            {"type": "text", "text": f"План работ (диаграмма Ганта):"},
            {"type": "image_url", "image_url": {"url": gantt["data_url"]}},
            {"type": "text", "text":
                f"Текущее фото объекта (имя файла с датой: {photo_filename}, дата фото: {photo_date if photo_date else 'не определена'}):"},
            {"type": "image_url", "image_url": {"url": photo_data_url}},
            {"type": "text", "text":
                "Обрати внимание на дату в названии файла фото. Определи, какие этапы уже должны быть завершены к этому времени года, и оцени текущий этап."}
        ]
    elif gantt["type"] == "text":
        user_text = (
            f"План работ (диаграмма Ганта, таблица или список):\n{gantt['text']}\n\n"
            f"Текущее фото объекта (имя файла с датой: {photo_filename}, дата фото: {photo_date if photo_date else 'не определена'}):"
        )
        user_content = [
            {"type": "text", "text": user_text},
            {"type": "image_url", "image_url": {"url": photo_data_url}},
            {"type": "text", "text":
                "Обрати внимание на дату в названии файла фото. Определи, какие этапы уже должны быть завершены к этому времени года, и оцени текущий этап."}
        ]
    else:
        return "Ошибка обработки файла.", 500

    messages = [
        system_message,
        {"role": "user", "content": user_content}
    ]

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        analysis = response.choices[0].message.content.strip()
    except Exception as e:
        analysis = f"Ошибка анализа: {e}"

    return render_template("result.html",
                           analysis=analysis.replace('\n', '<br>'),
                           allow_new_photo=True)

if __name__ == "__main__":
    app.run(debug=True)

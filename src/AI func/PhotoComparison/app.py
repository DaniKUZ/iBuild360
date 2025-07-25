import os
import base64
import requests
from flask import Flask, request, render_template
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OpenAI API key not found. Please set OPENAI_API_KEY in .env file.")

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        file1 = request.files.get('photo1')
        file2 = request.files.get('photo2')
        if not file1 or not file2:
            return render_template('index.html', result="Ошибка: загрузите оба изображения.")

        img_data1 = base64.b64encode(file1.read()).decode('utf-8')
        img_data2 = base64.b64encode(file2.read()).decode('utf-8')

        system_message = "Ты - строительный аналитик."
        user_prompt = (
            "Перед тобой две фотографии со строительной площадки, снятые с одинаковых ракурсов. "
            "Определи, какой прогресс сделан в строительных работах и выдай свой анализ. "
            "Анализируй фото максимально детально и точно, вывод напиши не очень объемный "
            "(вывод должен содержать, какие работы были завершены в промежутке между двумя фото)."
        )

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": [
                {"type": "text", "text": user_prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_data1}"}},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_data2}"}}
            ]}
        ]

        api_url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o",
            "messages": messages,
            "max_tokens": 400,
            "temperature": 0.2
        }

        response = requests.post(api_url, headers=headers, json=payload)
        if response.status_code != 200:
            return render_template('index.html', result=f"Ошибка OpenAI API: {response.status_code} - {response.text}")

        data = response.json()
        analysis_text = data['choices'][0]['message']['content'].strip()

        return render_template('index.html', result=analysis_text)

    return render_template('index.html', result=None)

if __name__ == '__main__':
    app.run(debug=False)

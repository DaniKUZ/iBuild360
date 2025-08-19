# iBuild360 Docker Setup

## Описание
Полная настройка Docker для iBuild360 с секцией Smart Lab Assistant (LIMS).

## Структура
- `web` контейнер (порт 8080) - React фронтенд с nginx
- `server` контейнер (порт 3001) - Node.js прокси сервер с LIMS API

## API для LIMS
Фронт пуллит GET `/api/lims/orchestrator/state` каждые 2 секунды для получения состояния лабораторных измерений.

### Основной endpoint
```
GET /api/lims/orchestrator/state
```

Возвращает JSON со структурой:
```json
{
  "sessionId": "S-xxx",
  "step": { "code": "say_mass_and_confirm", "sampleId": 6 },
  "samples": [
    {
      "id": 6,
      "masses": { "m1": 2.3, "m2": null, "m3": null },
      "density": null,
      "status": "done"
    }
  ],
  "progress": {
    "samplesDone": 3,
    "samplesTotal": 3,
    "steps": [...]
  }
}
```

### Логика фронтенда
- m1 приходит с бэка (в демо: 2.3г)
- m2/m3 рассчитываются на фронте как демо данные (>=100г)
- density рассчитывается на фронте по формуле: m1 / (m2 - m3)
- Статусы обновляются на фронте согласно правилам:
  - 0 масс → pending
  - 1-2 массы → in_progress  
  - 3 массы без density → ready_for_density_calc
  - с density → done

## Запуск

### Быстрый старт
```bash
docker compose build
docker compose up -d
```

### Проверка
```bash
# Веб интерфейс
curl http://localhost:8080

# LIMS API
curl http://localhost:8080/api/lims/orchestrator/state
```

### Остановка
```bash
docker compose down
```

## Настройка переменных окружения

Создайте файл `.env` в корне проекта:
```env
# OpenAI или Hugging Face для AI анализа
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_hf_key

# n8n webhook для Agent360
N8N_WEBHOOK_URL=your_webhook_url
N8N_AUTH_HEADER=X-Auth
N8N_AUTH_KEY=your_auth_key
```

## Разработка

### Локальный запуск (без Docker)
```bash
# Фронтенд
npm install
npm start

# Сервер (в отдельном терминале)
cd server
npm install  
npm start
```

Фронтенд: http://localhost:3000  
Сервер: http://localhost:3001

### Структура серверного API
- `/api/lims/orchestrator/state` - основной endpoint для SmartLab
- `/api/openai/chat/completions` - прокси для AI анализа
- `/api/agent360/chat/completions` - прокси для n8n Agent360

## Особенности SmartLab секции
- Автоматический пуллинг состояния каждые 2 сек
- Демо-данные для m2/m3 (детерминированный расчет)
- Расчет плотности на фронте
- Полный UI согласно ГОСТ P 58401.1-2019

## Порты
- Web: 8080
- Server: 3001

## Troubleshooting

### Проблемы с доступом к веб-интерфейсу
Если curl возвращает 404, но контейнеры запущены:
```bash
# Проверить, что контейнеры работают
docker compose ps

# Проверить изнутри контейнера
docker exec ibuild360-web curl http://localhost/

# Открыть в браузере (обычно работает даже если curl не работает)
start http://localhost:8080
```

### Проблемы с билдом
```bash
docker compose build --no-cache
```

### Просмотр логов
```bash
docker compose logs web
docker compose logs server
```

### Очистка
```bash
docker compose down --rmi local --volumes
```

### Сетевые проблемы в Windows
- Попробуйте отключить/включить VPN
- Проверьте настройки Docker Desktop
- Попробуйте браузер вместо curl
- Убедитесь, что брандмауэр не блокирует порты

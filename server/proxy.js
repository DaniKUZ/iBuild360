const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const path = require('path');
const dotenv = require('dotenv');
// Try loading env from server/.env first, then fallback to project root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
if (!process.env.N8N_WEBHOOK_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// -------------------------------
// LIMS mock API (in-memory) for local development
// -------------------------------
const limsDb = {
  sessions: new Map(), // sessionId -> session state (shape близкий к lab.md)
  readings: new Map()  // readingId -> { id, sessionId, sampleId, kind, value_g, confirmed, rejected }
};

function buildInitialSteps(sampleOrder) {
  const steps = [{ code: 'greeting', done: true }];
  sampleOrder.forEach((sid) => {
    steps.push({ code: 'take_sample', sampleId: sid, done: false });
    steps.push({ code: 'say_mass_and_confirm', sampleId: sid, done: false });
  });
  steps.push({ code: 'compute_results', done: false });
  steps.push({ code: 'finish', done: false });
  return steps;
}

function recomputeProgressAndStep(session) {
  const samples = session.samples || [];
  const samplesDone = samples.filter((s) => s.density != null).length;
  session.progress.samplesDone = samplesDone;
  session.progress.samplesTotal = samples.length;

  // steps done flags
  session.progress.steps = session.progress.steps.map((st) => {
    if (st.code === 'greeting') return { ...st, done: true };
    if (st.code === 'take_sample') {
      const sample = samples.find((x) => x.id === st.sampleId);
      const m = sample?.masses || {};
      const anyConfirmed = [m.m1, m.m2, m.m3].some((v) => v != null);
      return { ...st, done: Boolean(anyConfirmed) };
    }
    if (st.code === 'say_mass_and_confirm') {
      const sample = samples.find((x) => x.id === st.sampleId);
      const m = sample?.masses || {};
      const allConfirmed = [m.m1, m.m2, m.m3].every((v) => v != null);
      return { ...st, done: Boolean(allConfirmed) };
    }
    if (st.code === 'compute_results') return { ...st, done: Boolean(session.finalComputed) };
    if (st.code === 'finish') return { ...st, done: session.status === 'finished' };
    return st;
  });

  // current step
  // 1) first sample without density
  const firstWithoutDensity = samples.find((s) => s.density == null);
  if (firstWithoutDensity) {
    const m = firstWithoutDensity.masses || {};
    const confirmedCount = [m.m1, m.m2, m.m3].filter((v) => v != null).length;
    if (confirmedCount === 0) {
      session.step = { code: 'take_sample', sampleId: firstWithoutDensity.id };
    } else if (confirmedCount < 3) {
      session.step = { code: 'say_mass_and_confirm', sampleId: firstWithoutDensity.id };
    } else {
      // ожидает compute-density отдельным вызовом
      session.step = { code: 'say_mass_and_confirm', sampleId: firstWithoutDensity.id };
    }
    return;
  }

  if (!session.finalComputed) {
    session.step = { code: 'compute_results' };
    return;
  }

  session.step = { code: 'finish' };
}

function findSample(session, sampleId) {
  return session.samples.find((s) => String(s.id) === String(sampleId));
}

function tryComputeSampleStatus(sample) {
  const m = sample.masses;
  const confirmed = [m.m1, m.m2, m.m3].filter((v) => v != null).length;
  if (confirmed === 0) sample.status = 'pending';
  else if (confirmed < 3) sample.status = 'in_progress';
  else if (confirmed === 3 && sample.density == null) sample.status = 'ready_for_density_calc';
  else if (sample.density != null) sample.status = 'done';
}

app.post('/api/lims/sessions', (req, res) => {
  try {
    const { operatorName, sampleOrder } = req.body || {};
    if (!operatorName || !Array.isArray(sampleOrder) || sampleOrder.length === 0) {
      return res.status(400).json({ message: 'operatorName и sampleOrder обязательны' });
    }
    const sessionId = 'S-' + randomUUID();
    const samples = sampleOrder.map((id) => ({
      id,
      masses: { m1: null, m2: null, m3: null },
      density: null,
      status: 'pending'
    }));
    const session = {
      sessionId,
      step: { code: 'greeting' },
      samples,
      progress: { samplesDone: 0, samplesTotal: sampleOrder.length, steps: buildInitialSteps(sampleOrder) },
      final: null,
      status: 'active',
      startedAt: new Date().toISOString(),
      finalComputed: false,
      operatorName
    };
    limsDb.sessions.set(sessionId, session);
    recomputeProgressAndStep(session);
    return res.json(session);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

app.get('/api/lims/sessions/:sid', (req, res) => {
  const sid = req.params.sid;
  const session = limsDb.sessions.get(sid);
  if (!session) return res.status(404).json({ message: 'Сессия не найдена' });
  recomputeProgressAndStep(session);
  return res.json(session);
});

app.post('/api/lims/sessions/:sid/samples/:sampleId/mass-readings', (req, res) => {
  const sid = req.params.sid;
  const sampleId = req.params.sampleId;
  const { kind, value_g } = req.body || {};
  const session = limsDb.sessions.get(sid);
  if (!session) return res.status(404).json({ message: 'Сессия не найдена' });
  const sample = findSample(session, sampleId);
  if (!sample) return res.status(404).json({ message: 'Образец не найден' });
  if (!['m1', 'm2', 'm3'].includes(kind)) return res.status(400).json({ message: 'Некорректный kind' });
  const num = Number(value_g);
  if (!Number.isFinite(num) || num <= 0) return res.status(422).json({ message: 'Неверный формат массы' });
  if (sample.masses[kind] != null) return res.status(409).json({ message: 'Масса уже подтверждена' });
  const readingId = 'R-' + randomUUID();
  const reading = { id: readingId, sessionId: sid, sampleId, kind, value_g: num, confirmed: false, rejected: false, createdAt: new Date().toISOString() };
  limsDb.readings.set(readingId, reading);
  return res.json({ readingId, echo: `Записано: ${num} г. Подтвердите (да/нет).`, requiresConfirmation: true, sampleId: Number(sampleId), kind });
});

app.post('/api/lims/sessions/:sid/samples/:sampleId/mass-readings/:rid/confirm', (req, res) => {
  const sid = req.params.sid;
  const sampleId = req.params.sampleId;
  const rid = req.params.rid;
  const { confirm } = req.body || {};
  const session = limsDb.sessions.get(sid);
  if (!session) return res.status(404).json({ message: 'Сессия не найдена' });
  const sample = findSample(session, sampleId);
  if (!sample) return res.status(404).json({ message: 'Образец не найден' });
  const reading = limsDb.readings.get(rid);
  if (!reading || reading.sessionId !== sid || String(reading.sampleId) !== String(sampleId)) {
    return res.status(404).json({ message: 'Показание не найдено' });
  }
  if (reading.confirmed || reading.rejected) return res.status(409).json({ message: 'Показание уже обработано' });

  if (confirm) {
    reading.confirmed = true;
    sample.masses[reading.kind] = Number(reading.value_g);
    tryComputeSampleStatus(sample);
  } else {
    reading.rejected = true;
  }

  recomputeProgressAndStep(session);
  return res.json({
    sampleId: Number(sampleId),
    masses: { ...sample.masses },
    density: sample.density,
    status: sample.status,
    confirmed: Boolean(confirm),
    readingId: rid
  });
});

app.post('/api/lims/sessions/:sid/samples/:sampleId/compute-density', (req, res) => {
  const sid = req.params.sid;
  const sampleId = req.params.sampleId;
  const session = limsDb.sessions.get(sid);
  if (!session) return res.status(404).json({ message: 'Сессия не найдена' });
  const sample = findSample(session, sampleId);
  if (!sample) return res.status(404).json({ message: 'Образец не найден' });
  const { m1, m2, m3 } = sample.masses;
  if ([m1, m2, m3].some((v) => v == null)) return res.status(422).json({ message: 'Недостаточно данных' });
  if (sample.density != null) return res.status(409).json({ message: 'Плотность уже рассчитана' });

  // Простейшая формула-заглушка (пример). Уточняется у бэкенда.
  const density = Number((m1 / Math.max(0.0001, (m2 - m3))).toFixed(3));
  sample.density = density;
  sample.status = 'done';
  recomputeProgressAndStep(session);
  return res.json({ sampleId: Number(sampleId), density, unit: 'г/см³', status: sample.status, progress: session.progress });
});

app.post('/api/lims/sessions/:sid/compute-final-results', (req, res) => {
  const sid = req.params.sid;
  const session = limsDb.sessions.get(sid);
  if (!session) return res.status(404).json({ message: 'Сессия не найдена' });
  const densities = session.samples.map((s) => s.density).filter((v) => v != null);
  if (densities.length !== session.samples.length) return res.status(422).json({ message: 'Не у всех образцов есть плотность' });
  if (session.finalComputed) return res.status(409).json({ message: 'Финал уже рассчитан' });

  const sum = densities.reduce((a, b) => a + b, 0);
  const avgDensity = Number((sum / densities.length).toFixed(3));
  const delta = Number((Math.max(...densities) - Math.min(...densities)).toFixed(3));
  session.final = { avgDensity, delta };
  session.finalComputed = true;
  session.status = 'finished';
  session.finishedAt = new Date().toISOString();
  recomputeProgressAndStep(session);
  return res.json({
    status: session.status,
    finishedAt: session.finishedAt,
    final: session.final,
    unit: 'г/см³',
    progress: { ...session.progress, compute_results: true }
  });
});

// Unified single-endpoint path (one "route" with multiple methods) for simplified integration
// GET /api/lims/session -> returns current session (create default if missing)
// POST /api/lims/session -> { sampleId, kind, value_g } -> records measurement and returns updated session
app.get('/api/lims/session', (req, res) => {
  // return last created session or init default with [6,8,12]
  const existing = Array.from(limsDb.sessions.values())[0];
  if (existing) {
    recomputeProgressAndStep(existing);
    return res.json(existing);
  }
  // init default
  const sessionId = 'S-' + randomUUID();
  const sampleOrder = [6, 8, 12];
  const samples = sampleOrder.map((id) => ({ id, masses: { m1: null, m2: null, m3: null }, density: null, status: 'pending' }));
  const session = {
    sessionId,
    step: { code: 'greeting' },
    samples,
    progress: { samplesDone: 0, samplesTotal: sampleOrder.length, steps: buildInitialSteps(sampleOrder) },
    final: null,
    status: 'active',
    startedAt: new Date().toISOString(),
    finalComputed: false,
    operatorName: 'Operator'
  };
  limsDb.sessions.set(sessionId, session);
  recomputeProgressAndStep(session);
  return res.json(session);
});

app.post('/api/lims/session', (req, res) => {
  let session = Array.from(limsDb.sessions.values())[0];
  if (!session) {
    // create default if not exists
    const sessionId = 'S-' + randomUUID();
    const sampleOrder = [6, 8, 12];
    const samples = sampleOrder.map((id) => ({ id, masses: { m1: null, m2: null, m3: null }, density: null, status: 'pending' }));
    session = {
      sessionId,
      step: { code: 'greeting' },
      samples,
      progress: { samplesDone: 0, samplesTotal: sampleOrder.length, steps: buildInitialSteps(sampleOrder) },
      final: null,
      status: 'active',
      startedAt: new Date().toISOString(),
      finalComputed: false,
      operatorName: 'Operator'
    };
    limsDb.sessions.set(sessionId, session);
  }
  const { sampleId, kind, value_g } = req.body || {};
  if (!sampleId || !['m1','m2','m3'].includes(kind)) {
    return res.status(400).json({ message: 'sampleId и kind обязательны' });
  }
  const value = Number(value_g);
  if (!Number.isFinite(value) || value <= 0) return res.status(422).json({ message: 'Неверный формат массы' });
  const sample = findSample(session, sampleId);
  if (!sample) return res.status(404).json({ message: 'Образец не найден' });
  if (sample.masses[kind] != null) return res.status(409).json({ message: 'Масса уже установлена' });
  sample.masses[kind] = value;
  tryComputeSampleStatus(sample);
  recomputeProgressAndStep(session);
  return res.json(session);
});

// Orchestrator state (GET) — возвращает текущее состояние сессии одной ручкой
app.get('/api/lims/orchestrator/state', (req, res) => {
  let session = Array.from(limsDb.sessions.values())[0];
  if (!session) {
    const sessionId = 'S-' + randomUUID();
    const sampleOrder = [6, 8, 12];
    const samples = sampleOrder.map((id) => ({ id, masses: { m1: 2.3, m2: null, m3: null }, density: null, status: 'done' }));
    session = {
      sessionId,
      step: { code: 'finish' },
      samples,
      progress: { samplesDone: 3, samplesTotal: 3, steps: buildInitialSteps(sampleOrder).map(s => ({ ...s, done: true })) },
      final: null,
      status: 'active',
      startedAt: new Date().toISOString(),
      finalComputed: false,
      operatorName: 'Operator'
    };
    limsDb.sessions.set(sessionId, session);
  }
  recomputeProgressAndStep(session);
  return res.json(session);
});

// Demo endpoint for testing (when OpenAI is not available)
app.post('/api/demo/chat/completions', async (req, res) => {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const demoResponse = {
    choices: [{
      message: {
        content: `🏗️ АНАЛИЗ СТРОИТЕЛЬНОГО ПРОГРЕССА:

📊 За период между фотографиями выполнены следующие работы:

✅ ЗАВЕРШЕННЫЕ РАБОТЫ:
• Установлена внутренняя перегородка в левой части помещения
• Выполнена штукатурка стен в центральной зоне
• Проложена электропроводка по потолку
• Установлены оконные рамы

🔄 НАЧАТЫЕ РАБОТЫ:
• Подготовка пола под финишное покрытие
• Монтаж системы вентиляции

📈 ПРОГРЕСС: Примерно 65% работ по данному участку завершены.

⚠️ ВНИМАНИЕ: Это демо-версия анализа. Для получения реального AI анализа необходимо настроить доступ к OpenAI API.`
      }
    }]
  };
  
  res.json(demoResponse);
});

// Proxy endpoint for OpenAI API
app.post('/api/openai/chat/completions', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;

    const HF_KEY = process.env.HUGGINGFACE_API_KEY;
    const OPENAI_KEY = process.env.OPENAI_API_KEY;

    // If Hugging Face key is present, prefer HF Serverless Inference API
    if (HF_KEY) {
      const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
      const temperature = typeof req.body?.temperature === 'number' ? req.body.temperature : 0.7;
      const maxTokens = typeof req.body?.max_tokens === 'number' ? req.body.max_tokens : 500;
      const hfModel = process.env.HF_MODEL || 'mistralai/Mixtral-8x7B-Instruct-v0.1';

      // Build a simple prompt from messages (system + user)
      const systemPart = messages.find((m) => m.role === 'system')?.content || '';
      // Use last user message as the main query
      const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
      const prompt = `${systemPart ? `System: ${systemPart}\n\n` : ''}User: ${lastUserMessage}\nAssistant:`;

      const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(hfModel)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: Math.max(1, Math.min(2048, maxTokens)),
            temperature: Math.max(0, Math.min(2, temperature)),
            return_full_text: false
          }
        })
      });

      const text = await hfResponse.text();
      if (!hfResponse.ok) {
        console.error('Hugging Face API Error:', hfResponse.status, text);
        // Try to provide a helpful message for loading models
        let errMsg = `Hugging Face API error: ${hfResponse.status}`;
        if (text && text.includes('loading') || text.includes('Estimated time')) {
          errMsg = 'Модель на Hugging Face прогружается. Подождите 1-2 минуты и повторите попытку.';
        } else if (hfResponse.status === 401 || hfResponse.status === 403) {
          errMsg = 'Ошибка авторизации Hugging Face API. Проверьте ключ HUGGINGFACE_API_KEY.';
        }
        return res.status(hfResponse.status).json({ error: errMsg, details: text });
      }

      let json;
      try {
        json = text ? JSON.parse(text) : [];
      } catch (e) {
        json = [];
      }

      // HF serverless may return array of { generated_text }
      let generated = '';
      if (Array.isArray(json) && json.length > 0 && typeof json[0]?.generated_text === 'string') {
        generated = json[0].generated_text;
      } else if (typeof json?.generated_text === 'string') {
        generated = json.generated_text;
      } else if (Array.isArray(json) && json[0]?.generated_text == null && typeof json[0] === 'string') {
        generated = String(json[0]);
      } else if (typeof text === 'string') {
        generated = text;
      }

      // Normalize to OpenAI-like response shape expected by frontend
      return res.json({
        choices: [
          {
            message: { content: String(generated || '').trim() }
          }
        ]
      });
    }

    // Fallback to OpenAI if HF_KEY not present
    if (!OPENAI_KEY) {
      return res.status(500).json({ error: 'Missing AI key. Provide HUGGINGFACE_API_KEY or OPENAI_API_KEY in environment.' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);

      let userFriendlyMessage = `OpenAI API error: ${response.status}`;

      if (errorText.includes('unsupported_country_region_territory')) {
        userFriendlyMessage = 'OpenAI API недоступен в вашем регионе. Для работы AI сравнения необходимо использовать VPN или альтернативный AI сервис.';
      } else if (response.status === 403) {
        userFriendlyMessage = 'Ошибка авторизации OpenAI API. Проверьте действительность API ключа.';
      } else if (response.status === 429) {
        userFriendlyMessage = 'Превышен лимит запросов к OpenAI API. Попробуйте позже.';
      }

      return res.status(response.status).json({
        error: userFriendlyMessage,
        details: errorText
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({
      error: 'Internal server error: ' + error.message
    });
  }
});

// Agent360 proxy for n8n webhook
app.post('/api/agent360/chat/completions', async (req, res) => {
  try {
    const fetch = require('node-fetch');
    
    // n8n webhook configuration (из переменных окружения)
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    const N8N_AUTH_HEADER = process.env.N8N_AUTH_HEADER;
    const N8N_AUTH_KEY = process.env.N8N_AUTH_KEY;

    if (!N8N_WEBHOOK_URL) {
      return res.status(500).json({ 
        error: 'Server misconfigured: Missing N8N_WEBHOOK_URL environment variable' 
      });
    }

    const { site_id: siteId = 'UNKNOWN', images = [] } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    console.log(`📡 Прокси: перенаправляем запрос для объекта ${siteId} с ${images.length} изображениями в n8n...`);

    // Готовим multipart/form-data с бинарными изображениями,
    // чтобы n8n Webhook сразу получил binary.image_*
    const FormData = require('form-data');
    const form = new FormData();
    form.append('site_id', siteId);

    let totalBytes = 0;
    images.forEach((img, index) => {
      const dataUrl = String(img.image_url || '');
      const base64 = dataUrl.includes(',') ? dataUrl.split(',').pop() : dataUrl;
      const buffer = Buffer.from(base64, 'base64');
      totalBytes += buffer.length;
      form.append(`image_${index}`, buffer, {
        filename: `image_${index}.jpg`,
        contentType: 'image/jpeg'
      });
      form.append(`image_${index}_role`, img.role || 'current');
      form.append(`image_${index}_taken_at`, img.taken_at || '');
      if (img.notes) form.append(`image_${index}_notes`, img.notes);
    });

    console.log('🔗 Отправляем POST запрос на n8n webhook (multipart/form-data)');
    console.log('📦 Байтов бинарных данных:', totalBytes);
    console.log('🖼️ Изображений:', images.length);
    console.log('🌐 URL:', N8N_WEBHOOK_URL);
    console.log('🔑 Auth header enabled:', Boolean(N8N_AUTH_HEADER && N8N_AUTH_KEY));

    const headers = form.getHeaders();
    if (N8N_AUTH_HEADER && N8N_AUTH_KEY) {
      headers[N8N_AUTH_HEADER] = N8N_AUTH_KEY;
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: form
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ n8n Webhook Error:', response.status, response.statusText);
      console.error('📄 Response body:', errorText);
      console.error('🔗 Request URL:', N8N_WEBHOOK_URL);
      console.error('🔑 Auth header enabled:', Boolean(N8N_AUTH_HEADER && N8N_AUTH_KEY));
      
      let userFriendlyMessage = `n8n webhook error: ${response.status}`;
      
      if (response.status === 403) {
        userFriendlyMessage = 'Ошибка авторизации n8n webhook. Проверьте ключ авторизации.';
      } else if (response.status === 404) {
        userFriendlyMessage = 'n8n webhook не найден. Проверьте URL webhook.';
      } else if (response.status === 500) {
        userFriendlyMessage = 'Внутренняя ошибка n8n workflow. Проверьте настройки workflow в n8n.';
      }
      
      return res.status(response.status).json({ 
        error: userFriendlyMessage,
        details: errorText
      });
    }

    // Универсальный разбор: читаем как текст, затем пытаемся JSON.parse
    const rawText = await response.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : { analysis: '' };
    } catch (_) {
      const cleaned = (rawText || '').replace(/^\s*=\s*/, '').trim();
      data = { analysis: cleaned };
    }
    console.log('✅ Получен ответ от n8n агента');
    res.json(data);
  } catch (error) {
    console.error('Agent360 n8n Proxy Error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});

module.exports = app; 
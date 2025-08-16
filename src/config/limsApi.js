import { API_CONFIG } from './api';

const BASE = API_CONFIG.LIMS_API_URL;

async function httpGet(path) {
  const res = await fetch(BASE + path, {
    method: 'GET',
    headers: commonHeaders()
  });
  return parse(res);
}

async function httpPost(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { ...commonHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  return parse(res);
}

function commonHeaders() {
  // TODO: добавить авторизацию при появлении требований
  return {};
}

async function parse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    const error = new Error('LIMS API error');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

// API методы согласно lab.md
export const LimsApi = {
  createSession(operatorName, sampleOrder) {
    return httpPost('/sessions', { operatorName, sampleOrder });
  },
  getSession(sessionId) {
    return httpGet(`/sessions/${encodeURIComponent(sessionId)}`);
  },
  addMassReading(sessionId, sampleId, kind, value_g) {
    return httpPost(`/sessions/${encodeURIComponent(sessionId)}/samples/${encodeURIComponent(sampleId)}/mass-readings`, { kind, value_g });
  },
  confirmMassReading(sessionId, sampleId, readingId, confirm) {
    return httpPost(`/sessions/${encodeURIComponent(sessionId)}/samples/${encodeURIComponent(sampleId)}/mass-readings/${encodeURIComponent(readingId)}/confirm`, { confirm });
  },
  computeSampleDensity(sessionId, sampleId) {
    return httpPost(`/sessions/${encodeURIComponent(sessionId)}/samples/${encodeURIComponent(sampleId)}/compute-density`, {});
  },
  computeFinalResults(sessionId) {
    return httpPost(`/sessions/${encodeURIComponent(sessionId)}/compute-final-results`, {});
  }
};



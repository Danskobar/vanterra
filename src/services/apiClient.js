// Thin client for the VANTERRA backend (server/). All AI reasoning and
// Telegram account linking happen server-side so API keys and bot tokens
// never reach the browser. No client-side regex/keyword parsing lives
// anywhere in this app — every "understanding" step is a real call here.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export const API_BASE_URL = BASE_URL;

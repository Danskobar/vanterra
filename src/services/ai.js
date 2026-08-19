// AIService — thin client for the real backend AI provider (server/src/routes/ai.js).
//
// There is no client-side rule-based/regex fallback here. Every method calls
// the backend, which calls a real LLM. If the backend hasn't been given an
// API key, calls reject with a clear configuration error — the UI surfaces
// that as an "AI unavailable" state (per the app's own error-handling
// requirements) rather than faking a response.

import { api } from './apiClient.js';

let statusCache = null;
export async function getAIStatus() {
  if (statusCache) return statusCache;
  statusCache = await api.get('/api/ai/status').catch(() => ({ configured: false }));
  return statusCache;
}

export const AIService = {
  async analyzeOpportunity(opportunity) {
    const { reply } = await api.post('/api/ai/analyze-opportunity', { opportunity });
    return reply;
  },

  async analyzePortfolio(portfolio) {
    const { reply } = await api.post('/api/ai/analyze-portfolio', { portfolio });
    return reply;
  },

  async explainRisk(alert) {
    const { reply } = await api.post('/api/ai/explain-risk', { alert });
    return reply;
  },

  async chat(message, context) {
    const { reply } = await api.post('/api/ai/chat', { message, context });
    return reply;
  },

  // Sends the user's free-text goal straight to the backend, which asks the
  // LLM to extract structured intent (capital / liquidPct / risk / minApy)
  // and returns a fully built allocation + transaction plan. No parsing
  // happens in the browser.
  async buildStrategy(message) {
    return api.post('/api/ai/strategy', { message });
  },
};

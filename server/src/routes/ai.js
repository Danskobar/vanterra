import { Router } from 'express';
import * as ai from '../services/aiProvider.js';
import { buildStrategyFromMessage } from '../services/strategy.js';

export const aiRouter = Router();

aiRouter.get('/status', (req, res) => {
  res.json({ configured: ai.isConfigured });
});

aiRouter.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    const reply = await ai.chat(message, context || {});
    res.json({ reply });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

aiRouter.post('/analyze-opportunity', async (req, res) => {
  try {
    const { opportunity } = req.body;
    const reply = await ai.analyzeOpportunity(opportunity);
    res.json({ reply });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

aiRouter.post('/analyze-portfolio', async (req, res) => {
  try {
    const { portfolio } = req.body;
    const reply = await ai.analyzePortfolio(portfolio);
    res.json({ reply });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

aiRouter.post('/explain-risk', async (req, res) => {
  try {
    const { alert } = req.body;
    const reply = await ai.explainRisk(alert);
    res.json({ reply });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

aiRouter.post('/strategy', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    const strategy = await buildStrategyFromMessage(message);
    res.json(strategy);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

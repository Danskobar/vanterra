import fetch from 'node-fetch';
import { OPPORTUNITIES } from './opportunities.js';

// AIProvider — talks to a real chat-completions API (Anthropic or any
// OpenAI-compatible endpoint). Requires AI_PROVIDER_URL + AI_PROVIDER_KEY.
// This is the ONLY place strategy intent is interpreted: the model reads
// the user's free-text goal and returns structured JSON directly. There is
// no keyword/regex parser anywhere in the request path.

const PROVIDER = process.env.AI_PROVIDER || 'anthropic'; // 'anthropic' | 'openai'
const AI_URL = process.env.AI_PROVIDER_URL;
const AI_KEY = process.env.AI_PROVIDER_KEY;
const AI_MODEL = process.env.AI_MODEL || (PROVIDER === 'anthropic' ? 'claude-sonnet-4-6' : 'gpt-4.1-mini');

export const isConfigured = PROVIDER === 'anthropic' ? Boolean(AI_KEY) : Boolean(AI_URL && AI_KEY);

const SYSTEM_PROMPT = `You are the VANTERRA AI financial agent for X Layer, an onchain AI-RWA (Real World Assets) + DeFi platform.
You never fabricate onchain data — you only reason over the opportunity, whale, risk, and portfolio data provided to you in context.
If the user's context includes a "balanceNote" field, that means real balance data is unavailable — tell the user plainly instead of estimating a number.
If it includes "nativeBalance", that is a REAL balance read from X Layer — you may state it directly.
You never claim a transaction has executed — execution only happens after the user explicitly approves a proposed plan through the app.
Be precise, concise, and specific. Cite concrete numbers (APY, AI Score, risk level) from the provided data when relevant.`;

async function callAnthropic(messages, { forceJson = false, maxTokens = 700 } = {}) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': AI_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      system: messages.find((m) => m.role === 'system')?.content || SYSTEM_PROMPT,
      messages: messages.filter((m) => m.role !== 'system'),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const text = data.content?.map((b) => b.text).filter(Boolean).join('\n') || '';
  return text;
}

async function callOpenAICompatible(messages, { forceJson = false, maxTokens = 700 } = {}) {
  const res = await fetch(AI_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${AI_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      messages,
      ...(forceJson ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI provider error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function complete(messages, opts = {}) {
  if (!isConfigured) {
    throw new Error(
      'AI provider not configured. Set AI_PROVIDER_URL and AI_PROVIDER_KEY (or AI_PROVIDER=anthropic + ANTHROPIC key) in server/.env.'
    );
  }
  if (PROVIDER === 'anthropic') return callAnthropic(messages, opts);
  return callOpenAICompatible(messages, opts);
}

function opportunitiesContext() {
  return OPPORTUNITIES.map(
    (o) =>
      `${o.name} (${o.symbol}) — ${o.category}/${o.subtype}, AI Score ${o.aiScore}, APY ${o.apy}%, TVL $${o.tvl}, risk ${o.risk}, liquidity ${o.liquidity}, whale activity ${o.whaleActivity}.`
  ).join('\n');
}

export async function chat(message, context = {}) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Live opportunities on X Layer:\n${opportunitiesContext()}\n\nUser context: ${JSON.stringify(
        context
      )}\n\nUser message: ${message}`,
    },
  ];
  return complete(messages);
}

export async function analyzeOpportunity(opportunity) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Analyze this opportunity for a retail investor in 2-3 sentences, explaining what drives its AI Score: ${JSON.stringify(
        opportunity
      )}`,
    },
  ];
  return complete(messages, { maxTokens: 300 });
}

export async function analyzePortfolio(portfolio) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Explain this portfolio's AI health score in 2-3 sentences and suggest one concrete action: ${JSON.stringify(
        portfolio
      )}`,
    },
  ];
  return complete(messages, { maxTokens: 300 });
}

export async function explainRisk(alert) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Explain this risk alert and the recommended action clearly: ${JSON.stringify(alert)}` },
  ];
  return complete(messages, { maxTokens: 250 });
}

// The core "no rule-based parsing" requirement: this asks the MODEL to read
// free text and emit strict JSON describing the user's intent. If the model
// is unavailable, we surface a clear configuration error — we do not fall
// back to keyword matching.
export async function extractStrategyIntent(message) {
  const schemaPrompt = `Read the user's investment request below and respond with ONLY a JSON object (no prose, no markdown fences) matching exactly this shape:
{"capital": number, "liquidPct": number (0-100), "riskTolerance": "LOW"|"MEDIUM"|"HIGH", "minApy": number, "isStrategyRequest": boolean}

isStrategyRequest is false if the message is not actually asking to build/allocate/invest capital (e.g. it's a general question).
If a field isn't mentioned, use a sensible default: capital 1000, liquidPct 20, riskTolerance "LOW", minApy 0.

User request: "${message}"`;

  const messages = [
    { role: 'system', content: 'You extract structured investment intent as strict JSON. Respond with JSON only.' },
    { role: 'user', content: schemaPrompt },
  ];

  const raw = await complete(messages, { forceJson: true, maxTokens: 200 });
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`AI provider returned non-JSON intent: ${raw.slice(0, 200)}`);
  }
}

export async function generateStrategyReasoning({ capital, liquidPct, riskTolerance, allocations }) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Explain in 2-3 sentences why this allocation was chosen. Capital: $${capital}, kept liquid: ${liquidPct}%, risk tolerance: ${riskTolerance}. Allocations: ${JSON.stringify(
        allocations
      )}`,
    },
  ];
  return complete(messages, { maxTokens: 250 });
}

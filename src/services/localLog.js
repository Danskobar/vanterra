// Lightweight, real, browser-local persistence for strategies the AI has
// generated and transactions the user has actually executed in this
// browser. This is NOT fabricated demo data — every entry here is written
// only when the app itself produced a real strategy or a real (or
// real-DEMO-labeled) transaction result. No seed/placeholder rows exist.

const STRATEGIES_KEY = 'vanterra:strategies';
const TRANSACTIONS_KEY = 'vanterra:transactions';

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private browsing, quota) — fail silently, the
    // app still works, it just won't persist across reloads.
  }
}

export function getStrategies() {
  return read(STRATEGIES_KEY).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveStrategy(strategy) {
  const id = strategy.id || `strat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record = { ...strategy, id, status: strategy.status || 'awaiting_approval', createdAt: strategy.createdAt || Date.now() };
  const list = read(STRATEGIES_KEY).filter((s) => s.id !== id);
  list.push(record);
  write(STRATEGIES_KEY, list);
  return record;
}

export function updateStrategyStatus(id, status) {
  const list = read(STRATEGIES_KEY).map((s) => (s.id === id ? { ...s, status, updatedAt: Date.now() } : s));
  write(STRATEGIES_KEY, list);
}

export function getTransactions() {
  return read(TRANSACTIONS_KEY).sort((a, b) => b.timestamp - a.timestamp);
}

export function saveTransaction(record) {
  const list = read(TRANSACTIONS_KEY);
  list.push({ id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...record });
  write(TRANSACTIONS_KEY, list);
}

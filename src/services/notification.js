import { ALERTS } from '../data/intelligence.js';

export async function getAlerts() {
  await new Promise((r) => setTimeout(r, 200));
  return [...ALERTS].sort((a, b) => b.timestamp - a.timestamp);
}

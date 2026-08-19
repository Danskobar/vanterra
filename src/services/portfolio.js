import { PORTFOLIO } from '../data/intelligence.js';
import { getOpportunityById } from '../data/opportunities.js';

export async function getPortfolio() {
  await new Promise((r) => setTimeout(r, 250));
  const positions = PORTFOLIO.positions.map((p) => ({
    ...p,
    opportunity: getOpportunityById(p.assetId),
  }));
  return { ...PORTFOLIO, positions };
}

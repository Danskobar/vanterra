import { RISK_ALERTS } from '../data/intelligence.js';

// Risk Engine (DEMO adapter). Inputs: liquidity, volatility, whale activity,
// concentration, yield, exposure. Real implementation would recompute this
// continuously from live X Layer + market data.

export async function getRiskAlerts() {
  await new Promise((r) => setTimeout(r, 300));
  return RISK_ALERTS.sort((a, b) => b.timestamp - a.timestamp);
}

export function scoreOpportunityRisk(opportunity) {
  const weights = { LOW: 90, MEDIUM: 65, HIGH: 35 };
  const liquidityWeights = { HIGH: 20, MEDIUM: 10, LOW: 0 };
  const base = weights[opportunity.risk] ?? 50;
  const liq = liquidityWeights[opportunity.liquidity] ?? 0;
  const whalePenalty = opportunity.whaleActivity === 'DISTRIBUTING' ? -10 : 0;
  return Math.max(0, Math.min(100, base + liq * 0.3 + whalePenalty));
}

export function currentPortfolioRiskLevel(healthFactors) {
  const avg =
    (healthFactors.concentration + healthFactors.whaleExposure + healthFactors.risk) / 3;
  if (avg >= 80) return 'LOW';
  if (avg >= 60) return 'MEDIUM';
  if (avg >= 40) return 'HIGH';
  return 'CRITICAL';
}

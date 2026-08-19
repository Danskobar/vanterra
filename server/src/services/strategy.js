import { OPPORTUNITIES } from './opportunities.js';
import { extractStrategyIntent, generateStrategyReasoning } from './aiProvider.js';

const RISK_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2 };

// buildStrategy is deterministic ALLOCATION MATH over AI-extracted intent.
// The interpretation of the user's free text (capital/liquidPct/risk/minApy)
// comes entirely from the LLM via extractStrategyIntent — this function only
// does arithmetic once that intent is known, the same way a real portfolio
// engine would after a human specifies their parameters explicitly.
export async function buildStrategyFromMessage(message) {
  const intent = await extractStrategyIntent(message);
  if (!intent.isStrategyRequest) return { isStrategyRequest: false, intent };

  const { capital, liquidPct, riskTolerance, minApy } = intent;
  const liquidAmount = Math.round(capital * (liquidPct / 100));
  const investable = capital - liquidAmount;
  const maxRisk = RISK_ORDER[riskTolerance] ?? 0;

  const candidates = OPPORTUNITIES.filter((o) => RISK_ORDER[o.risk] <= maxRisk && o.apy >= (minApy || 0))
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 2);

  if (candidates.length === 0) {
    return {
      isStrategyRequest: true,
      intent,
      capital,
      liquidAmount,
      investable,
      allocations: [],
      expectedApy: 0,
      risk: riskTolerance,
      aiScore: 0,
      reasoning: 'No opportunities currently match the requested risk tolerance and minimum yield.',
      transactionPlan: [],
    };
  }

  const weights = candidates.length === 2 ? [0.6, 0.4] : [1];
  const allocations = candidates.map((opp, i) => ({
    opportunity: opp,
    amount: Math.round(investable * weights[i]),
    weight: weights[i],
  }));

  const expectedApy = Number(allocations.reduce((sum, a) => sum + a.opportunity.apy * a.weight, 0).toFixed(2));
  const aiScore = Math.round(allocations.reduce((sum, a) => sum + a.opportunity.aiScore * a.weight, 0));

  const transactionPlan = allocations.flatMap((a, i) => [
    { step: i * 2 + 1, label: `Approve ${a.opportunity.symbol}`, detail: `Approve ${a.opportunity.protocol} to spend $${a.amount.toLocaleString()} USDC`, network: a.opportunity.network },
    { step: i * 2 + 2, label: `Deposit into ${a.opportunity.name}`, detail: `Swap/deposit $${a.amount.toLocaleString()} into ${a.opportunity.name}`, network: a.opportunity.network, slippage: a.opportunity.category === 'DeFi' ? '0.30%' : 'N/A' },
  ]);

  let reasoning;
  try {
    reasoning = await generateStrategyReasoning({ capital, liquidPct, riskTolerance, allocations });
  } catch {
    reasoning = `Kept $${liquidAmount.toLocaleString()} (${liquidPct}%) liquid. Allocated the remaining $${investable.toLocaleString()} across ${allocations
      .map((a) => a.opportunity.name)
      .join(' and ')} based on AI Score and ${riskTolerance.toLowerCase()} risk tolerance.`;
  }

  return {
    isStrategyRequest: true,
    intent,
    capital,
    liquidAmount,
    investable,
    allocations,
    expectedApy,
    risk: riskTolerance,
    aiScore,
    reasoning,
    transactionPlan,
  };
}

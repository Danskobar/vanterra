// DEMO DATA — whale, portfolio, risk, activity and alert seed data.
// Swap for services/whale.js + services/risk.js real feeds in REAL MODE.

const now = Date.now();

export const WHALE_WALLETS = [
  {
    address: '0x7fA3c9D1e4B2F8a6C0d5E9b1A2c3D4e5F6a7B8c9',
    label: 'Whale #1',
    estimatedHoldings: 1840000,
    firstSeen: now - 1000 * 60 * 60 * 24 * 210,
    activityScore: 91,
    history:
      'This wallet has historically accumulated positions 24-72 hours before periods of increased market activity across RWA-adjacent assets.',
  },
  {
    address: '0x2bC81f9A4d3E7c5B0a1D2e3F4a5B6c7D8e9F0a1B',
    label: 'Whale #2',
    estimatedHoldings: 926000,
    firstSeen: now - 1000 * 60 * 60 * 24 * 96,
    activityScore: 74,
    history:
      'Shows a pattern of rotating between stable-yield DeFi vaults and short-duration RWA products depending on funding-rate conditions.',
  },
  {
    address: '0x9dE45a2B1c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F',
    label: 'Whale #3',
    estimatedHoldings: 512000,
    firstSeen: now - 1000 * 60 * 60 * 24 * 33,
    activityScore: 58,
    history:
      'Newer wallet with a smaller onchain history. Recent activity concentrated in a single high-risk liquidity pool.',
  },
];

export const WHALE_EVENTS = [
  {
    id: 'we-1',
    assetId: 'xlp-liquidity-pool',
    asset: 'XLP',
    wallets: [WHALE_WALLETS[2].address],
    direction: 'SELL',
    amountUsd: 420000,
    timestamp: now - 1000 * 60 * 42,
    signal: 'Bearish distribution',
    confidence: 81,
  },
  {
    id: 'we-2',
    assetId: 'x-restaking-vault',
    asset: 'rXL',
    wallets: [WHALE_WALLETS[0].address, WHALE_WALLETS[1].address],
    direction: 'BUY',
    amountUsd: 840000,
    timestamp: now - 1000 * 60 * 60 * 2,
    signal: 'Bullish accumulation',
    confidence: 87,
  },
  {
    id: 'we-3',
    assetId: 'tokenized-treasury',
    asset: 'T-BILL',
    wallets: [WHALE_WALLETS[0].address],
    direction: 'BUY',
    amountUsd: 310000,
    timestamp: now - 1000 * 60 * 60 * 6,
    signal: 'Steady accumulation',
    confidence: 69,
  },
  {
    id: 'we-4',
    assetId: 'perp-basis-vault',
    asset: 'BASIS-V',
    wallets: [WHALE_WALLETS[1].address],
    direction: 'BUY',
    amountUsd: 175000,
    timestamp: now - 1000 * 60 * 60 * 11,
    signal: 'Opportunistic entry',
    confidence: 63,
  },
];

export const PORTFOLIO = {
  totalValue: 8420,
  availableBalance: 1310,
  investedValue: 7110,
  dailyPnl: 184,
  dailyPnlPct: 2.23,
  overallPnl: 612,
  overallPnlPct: 7.83,
  healthScore: 87,
  healthFactors: {
    diversification: 82,
    liquidity: 90,
    concentration: 71,
    yield: 88,
    risk: 84,
    whaleExposure: 66,
  },
  positions: [
    { assetId: 'tokenized-treasury', amount: 3200, allocationPct: 45 },
    { assetId: 'stablecoin-strategy', amount: 2130, allocationPct: 30 },
    { assetId: 'x-restaking-vault', amount: 1780, allocationPct: 25 },
  ],
};

export const RISK_ALERTS = [
  {
    id: 'r-1',
    level: 'MEDIUM',
    previousLevel: 'LOW',
    title: 'Concentration risk rising',
    detail:
      'Tokenized Treasury now represents 45% of total portfolio value. A single-asset shock would have an outsized effect on overall health.',
    recommendation: 'Reduce Tokenized Treasury exposure by roughly 10-15% and redistribute into a second low-risk position.',
    timestamp: now - 1000 * 60 * 30,
  },
  {
    id: 'r-2',
    level: 'LOW',
    previousLevel: 'LOW',
    title: 'XLP liquidity pool volatility',
    detail: 'Liquidity in the XLP/USDC pool declined 19% over the last 4 hours alongside whale distribution.',
    recommendation: 'Monitor before increasing exposure. No action required for existing DEMO positions.',
    timestamp: now - 1000 * 60 * 60 * 4,
  },
];

export const ACTIVITY_FEED = [
  { id: 'a-1', type: 'whale', text: 'Whale accumulation detected on rXL — $840K across 2 hours.', timestamp: now - 1000 * 60 * 60 * 2 },
  { id: 'a-2', type: 'risk', text: 'Portfolio risk shifted LOW → MEDIUM on concentration exposure.', timestamp: now - 1000 * 60 * 30 },
  { id: 'a-3', type: 'strategy', text: 'AI strategy generated for $1,000 low-risk allocation request.', timestamp: now - 1000 * 60 * 60 * 5 },
  { id: 'a-4', type: 'opportunity', text: 'New opportunity discovered: X Layer Restaking Vault (AI Score 74).', timestamp: now - 1000 * 60 * 60 * 9 },
  { id: 'a-5', type: 'transaction', text: 'Simulated transaction confirmed: $600 into Tokenized Treasury.', timestamp: now - 1000 * 60 * 60 * 26 },
  { id: 'a-6', type: 'whale', text: 'Distribution signal on XLP — 3 wallets reduced exposure by $420K.', timestamp: now - 1000 * 60 * 42 },
];

export const ALERTS = [
  {
    id: 'al-1',
    type: 'whale',
    title: 'Whale accumulation — rXL',
    body: '2 wallets accumulated $840K in X Layer Restaking Vault over 2 hours. AI confidence 87%.',
    read: false,
    timestamp: now - 1000 * 60 * 60 * 2,
  },
  {
    id: 'al-2',
    type: 'risk',
    title: 'Portfolio risk increased',
    body: 'Concentration in Tokenized Treasury pushed portfolio risk from LOW to MEDIUM.',
    read: false,
    timestamp: now - 1000 * 60 * 30,
  },
  {
    id: 'al-3',
    type: 'opportunity',
    title: 'New opportunity above your target yield',
    body: 'X Layer Restaking Vault is now live at 13.7% APY with a MEDIUM risk rating.',
    read: true,
    timestamp: now - 1000 * 60 * 60 * 9,
  },
  {
    id: 'al-4',
    type: 'transaction',
    title: 'Simulated transaction confirmed',
    body: '$600 allocation into Tokenized Treasury completed in DEMO MODE.',
    read: true,
    timestamp: now - 1000 * 60 * 60 * 26,
  },
];

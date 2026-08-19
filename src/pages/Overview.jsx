import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowUpRight, ArrowDownRight, ShieldAlert, Waves, ChevronRight } from 'lucide-react';
import { useWallet } from '../hooks/useWallet.jsx';
import { getPortfolio } from '../services/portfolio.js';
import { getRiskAlerts, currentPortfolioRiskLevel } from '../services/risk.js';
import { getWhaleEvents } from '../services/whale.js';
import { AIService, getAIStatus } from '../services/ai.js';
import { getStrategies, getTransactions } from '../services/localLog.js';
import { OPPORTUNITIES, generateSeries } from '../data/opportunities.js';
import { ACTIVITY_FEED } from '../data/intelligence.js';
import { formatUSD, formatPct, timeAgo, shortenAddress } from '../utils/format.js';
import { RiskBadge, Button, Skeleton, SampleDataTag } from '../components/Primitives.jsx';
import PerformanceChart from '../components/PerformanceChart.jsx';
import TransactionModal from '../components/TransactionModal.jsx';

const TIMEFRAMES = ['1D', '7D', '1M', '3M', '1Y'];
const TIMEFRAME_POINTS = { '1D': 24, '7D': 42, '1M': 60, '3M': 90, '1Y': 120 };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning.';
  if (h < 18) return 'Good afternoon.';
  return 'Good evening.';
}

export default function Overview() {
  const { isDemo, balances } = useWallet();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState(null);
  const [riskAlerts, setRiskAlerts] = useState(null);
  const [whaleEvents, setWhaleEvents] = useState(null);
  const [timeframe, setTimeframe] = useState('1M');
  const [intelligence, setIntelligence] = useState(null);
  const [intelligenceError, setIntelligenceError] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [reviewing, setReviewing] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    getPortfolio().then(setPortfolio);
    getRiskAlerts().then(setRiskAlerts);
    getWhaleEvents().then(setWhaleEvents);
    getAIStatus().then(setAiStatus);
    setStrategies(getStrategies());
  }, []);

  useEffect(() => {
    if (!portfolio || !riskAlerts || !whaleEvents) return;
    const topOpportunityCount = OPPORTUNITIES.filter((o) => o.aiScore >= 80).length;
    AIService.chat(
      `In 1-2 sentences, summarize the current state for a returning user: ${topOpportunityCount} strong opportunities available, ${whaleEvents.length} whale signals detected, ${riskAlerts.length} active risk alerts. Be concise and specific.`,
      { portfolio }
    )
      .then(setIntelligence)
      .catch((err) => setIntelligenceError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio, riskAlerts, whaleEvents]);

  const series = useMemo(
    () => (portfolio ? generateSeries(`overview-${timeframe}`, TIMEFRAME_POINTS[timeframe], portfolio.totalValue / 100) : []),
    [portfolio, timeframe]
  );

  const topOpportunities = [...OPPORTUNITIES].sort((a, b) => b.aiScore - a.aiScore).slice(0, 3);
  const latestStrategy = strategies.find((s) => s.status === 'awaiting_approval') || strategies[0];
  const recentTransactions = getTransactions().slice(0, 3);
  const combinedActivity = [
    ...ACTIVITY_FEED.map((a) => ({ ...a, real: false })),
    ...recentTransactions.map((tx) => ({ id: tx.id, type: 'transaction', text: `${tx.action} — ${tx.status}`, timestamp: tx.timestamp, real: true })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  const attentionCount = portfolio
    ? portfolio.positions.filter((p) => p.opportunity?.risk === 'MEDIUM' || p.opportunity?.risk === 'HIGH').length
    : 0;

  if (!portfolio || !riskAlerts || !whaleEvents) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const riskLevel = currentPortfolioRiskLevel(portfolio.healthFactors);
  const liquidityLabel = portfolio.healthFactors.liquidity >= 75 ? 'High' : portfolio.healthFactors.liquidity >= 50 ? 'Medium' : 'Low';
  const weightedYield = portfolio.positions.reduce((sum, p) => sum + (p.opportunity?.apy || 0) * (p.allocationPct / 100), 0);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-xs v-mono uppercase tracking-widest text-[var(--v-muted-2)] mb-1">Vanterra</p>
        <h1 className="text-2xl font-semibold text-[var(--v-white)] mb-1">{greeting()}</h1>
        <p className="text-sm text-[var(--v-muted)]">
          Your portfolio is {riskLevel === 'LOW' ? 'healthy' : riskLevel.toLowerCase()}
          {attentionCount > 0 ? `, but ${attentionCount} position${attentionCount > 1 ? 's' : ''} may need attention.` : '.'}
        </p>
      </div>

      {/* Portfolio summary + stat row */}
      <div className="v-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider">Total Portfolio</p>
              {isDemo && (
                <span className="v-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[rgba(194,160,90,0.3)] text-[var(--v-warning)] bg-[var(--v-warning-dim)]">
                  Demo wallet
                </span>
              )}
            </div>
            <p className="text-3xl lg:text-4xl font-semibold text-[var(--v-white)] v-mono">
              {formatUSD(portfolio.totalValue)}
            </p>
            <p
              className="text-sm mt-1 flex items-center gap-1"
              style={{ color: portfolio.dailyPnl >= 0 ? 'var(--v-success)' : 'var(--v-danger)' }}
            >
              {portfolio.dailyPnl >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {formatPct(portfolio.dailyPnlPct)} · {formatUSD(portfolio.dailyPnl)} today
            </p>
            {balances && (
              <p className="text-xs text-[var(--v-muted-2)] mt-2">
                Wallet: {balances.native.toLocaleString(undefined, { maximumFractionDigits: 4 })} {balances.nativeSymbol}
                {!balances.isReal && ' (simulated)'}
              </p>
            )}
          </div>
          <div className="flex gap-1 v-card p-1 self-start">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`v-focus px-3 py-1.5 rounded-lg text-xs v-mono transition-colors ${
                  timeframe === tf ? 'bg-white/10 text-[var(--v-white)]' : 'text-[var(--v-muted-2)] hover:text-[var(--v-white)]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <PerformanceChart data={series} height={200} />
        <p className="text-[10px] text-[var(--v-muted-2)] mt-2">Illustrative chart — see "Example Positions" note in Portfolio for what's real vs. sample.</p>

        <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-white/10">
          <MiniStat label="Positions" value={portfolio.positions.length} />
          <MiniStat label="Risk" value={riskLevel} tone={riskLevel === 'LOW' ? 'var(--v-success)' : riskLevel === 'MEDIUM' ? 'var(--v-warning)' : 'var(--v-danger)'} />
          <MiniStat label="Liquidity" value={liquidityLabel} />
          <MiniStat label="Yield" value={`${weightedYield.toFixed(1)}%`} />
          <MiniStat label="AI Health" value={`${portfolio.healthScore}/100`} tone="var(--v-platinum)" />
        </div>
      </div>

      {/* AI Intelligence panel */}
      <div className="v-card p-6">
        <div className="flex items-center gap-2 mb-3 text-[var(--v-muted)]">
          <Sparkles size={14} className="text-[var(--v-accent)]" />
          <span className="text-xs v-mono uppercase tracking-wider">Vanterra Intelligence</span>
        </div>
        {aiStatus && !aiStatus.configured ? (
          <p className="text-sm text-[var(--v-danger)] mb-4">
            AI unavailable — configure AI_PROVIDER_KEY in server/.env to enable live summaries.
          </p>
        ) : intelligenceError ? (
          <p className="text-sm text-[var(--v-danger)] mb-4">AI unavailable: {intelligenceError}</p>
        ) : intelligence ? (
          <p className="text-sm text-[var(--v-white)] leading-relaxed mb-4">{intelligence}</p>
        ) : (
          <div className="space-y-2 mb-4">
            <div className="v-shimmer h-3 rounded bg-white/5 w-full" />
            <div className="v-shimmer h-3 rounded bg-white/5 w-3/5" />
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <MiniStat label="Opportunities" value={OPPORTUNITIES.filter((o) => o.aiScore >= 80).length} />
          <MiniStat label="Whale Signals" value={whaleEvents.length} />
          <MiniStat label="Risk Alerts" value={riskAlerts.length} />
        </div>
        <Button variant="secondary" onClick={() => navigate('/agent')}>
          Open AI Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Strategy */}
        <div className="v-card p-5">
          <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)] mb-3">Active Strategy</p>
          {latestStrategy ? (
            <>
              <p className="text-[var(--v-white)] font-medium mb-1">{latestStrategy.prompt || 'Generated allocation'}</p>
              <p className="text-xs text-[var(--v-muted-2)] mb-4">
                {latestStrategy.status === 'awaiting_approval' ? 'Awaiting approval' : latestStrategy.status === 'executed' ? 'Executed' : 'Failed'}
              </p>
              <div className="space-y-1.5 mb-4">
                {latestStrategy.allocations?.map((a) => (
                  <div key={a.opportunity.id} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--v-muted)]">{a.opportunity.name}</span>
                    <span className="v-mono text-[var(--v-white)]">{Math.round(a.weight * 100)}%</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-[var(--v-muted)]">Expected yield</span>
                <span className="v-mono text-[var(--v-accent)]">{latestStrategy.expectedApy}%</span>
              </div>
              {latestStrategy.status === 'awaiting_approval' && (
                <Button variant="primary" className="w-full" onClick={() => setReviewing(latestStrategy)}>
                  Review &amp; Approve
                </Button>
              )}
            </>
          ) : (
            <div>
              <p className="text-sm text-[var(--v-muted)] mb-4">No active strategy yet.</p>
              <Button variant="secondary" onClick={() => navigate('/agent')}>
                Ask the Agent for one
              </Button>
            </div>
          )}
        </div>

        {/* Risk Guardian */}
        <div className="v-card p-5">
          <div className="flex items-center gap-2 mb-3 text-[var(--v-muted)]">
            <ShieldAlert size={13} />
            <span className="text-xs v-mono uppercase tracking-wider">Risk Guardian</span>
          </div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="v-mono text-3xl text-[var(--v-white)]">{Math.round((portfolio.healthFactors.concentration + portfolio.healthFactors.whaleExposure + portfolio.healthFactors.risk) / 3)}</p>
              <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider">/ 100</p>
            </div>
            <RiskBadge risk={riskLevel} />
          </div>
          <div className="space-y-2 mb-4">
            <FactorRow label="Concentration" value={portfolio.healthFactors.concentration} />
            <FactorRow label="Liquidity" value={portfolio.healthFactors.liquidity} />
            <FactorRow label="Whale Exposure" value={portfolio.healthFactors.whaleExposure} />
          </div>
          <Button variant="secondary" onClick={() => navigate('/risk')}>
            View Risk Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Whale Alerts */}
        <div className="v-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[var(--v-muted)]">
              <Waves size={13} />
              <span className="text-xs v-mono uppercase tracking-wider">Whale Alerts</span>
              <SampleDataTag />
            </div>
            <button onClick={() => navigate('/whales')} className="v-focus text-xs text-[var(--v-muted-2)] hover:text-[var(--v-white)] flex items-center gap-0.5">
              Whale Scout <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {whaleEvents.slice(0, 3).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-[var(--v-white)]">{shortenAddress(e.wallets[0])} · {e.signal}</p>
                  <p className="text-[10px] text-[var(--v-muted-2)]">{timeAgo(e.timestamp)}</p>
                </div>
                <span className="v-mono" style={{ color: e.direction === 'BUY' ? 'var(--v-success)' : 'var(--v-danger)' }}>
                  {e.direction === 'BUY' ? '+' : '-'}{formatUSD(e.amountUsd, { compact: true })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Opportunities */}
        <div className="v-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)] flex items-center gap-2">
              Top Opportunities <SampleDataTag />
            </span>
            <button onClick={() => navigate('/markets')} className="v-focus text-xs text-[var(--v-muted-2)] hover:text-[var(--v-white)] flex items-center gap-0.5">
              Markets <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {topOpportunities.map((o) => (
              <button
                key={o.id}
                onClick={() => navigate(`/markets/${o.id}`)}
                className="v-focus w-full flex items-center justify-between text-sm hover:opacity-80 transition-opacity"
              >
                <span className="text-[var(--v-white)]">{o.name}</span>
                <span className="flex items-center gap-2">
                  <span className="v-mono text-[var(--v-accent)]">{o.apy}%</span>
                  <RiskBadge risk={o.risk} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="v-card p-5">
        <span className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)] mb-3 block">Recent Activity</span>
        <div className="space-y-2.5">
          {combinedActivity.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-[var(--v-white)]">
                {item.text}
                {item.real && <span className="v-mono text-[9px] text-[var(--v-success)] ml-1.5 align-middle">REAL</span>}
              </span>
              <span className="text-[10px] text-[var(--v-muted-2)] v-mono shrink-0">{timeAgo(item.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>

      {reviewing && (
        <TransactionModal
          strategy={reviewing}
          onClose={() => {
            setReviewing(null);
            setStrategies(getStrategies());
          }}
        />
      )}
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">{label}</p>
      <p className="v-mono text-sm" style={{ color: tone || 'var(--v-white)' }}>
        {value}
      </p>
    </div>
  );
}

function FactorRow({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--v-muted)]">{label}</span>
        <span className="v-mono text-xs text-[var(--v-white)]">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--v-accent-soft)] to-[var(--v-accent)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

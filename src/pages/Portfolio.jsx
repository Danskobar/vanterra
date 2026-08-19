import { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, Wallet as WalletIcon } from 'lucide-react';
import { getPortfolio } from '../services/portfolio.js';
import { AIService } from '../services/ai.js';
import { formatUSD, formatPct } from '../utils/format.js';
import { RiskBadge, Skeleton, Button } from '../components/Primitives.jsx';
import { generateSeries } from '../data/opportunities.js';
import PerformanceChart from '../components/PerformanceChart.jsx';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet.jsx';

const FACTOR_LABELS = {
  diversification: 'Diversification',
  liquidity: 'Liquidity',
  concentration: 'Concentration',
  yield: 'Yield',
  risk: 'Risk',
  whaleExposure: 'Whale Exposure',
};

export default function Portfolio() {
  const { status: walletStatus, isDemo, balances, balanceError } = useWallet();
  const [portfolio, setPortfolio] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [explanationError, setExplanationError] = useState(null);
  const [explaining, setExplaining] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPortfolio().then((p) => {
      setPortfolio(p);
      AIService.analyzePortfolio(p)
        .then((text) => setExplanation(text))
        .catch((err) => setExplanationError(err.message))
        .finally(() => setExplaining(false));
    });
  }, []);

  if (!portfolio) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const series = generateSeries('portfolio-total', 60, portfolio.totalValue / 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-[var(--v-white)] mb-1">Portfolio</h1>
        <p className="text-sm text-[var(--v-muted)]">Positions live in your own wallet. Vanterra tracks and analyzes.</p>
      </div>

      {/* REAL wallet balance — actually read from your connected wallet on X Layer */}
      <div className="v-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[var(--v-muted)]">
            <WalletIcon size={14} />
            <span className="text-xs v-mono uppercase tracking-wider">Your Wallet (Onchain)</span>
          </div>
          {isDemo && (
            <span className="v-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-[rgba(194,160,90,0.3)] text-[var(--v-warning)] bg-[var(--v-warning-dim)]">
              Demo wallet
            </span>
          )}
        </div>

        {walletStatus !== 'connected' ? (
          <p className="text-sm text-[var(--v-muted)]">Connect your wallet to see your real onchain balance here.</p>
        ) : balanceError ? (
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-[var(--v-danger)] mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--v-danger)]">{balanceError}</p>
          </div>
        ) : balances ? (
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">{balances.nativeSymbol}</p>
              <p className="v-mono text-[var(--v-white)] text-lg">{balances.native.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
            </div>
            {balances.tokens.map((t) => (
              <div key={t.symbol}>
                <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">{t.symbol}</p>
                <p className="v-mono text-[var(--v-white)] text-lg">{t.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            ))}
            {!balances.isReal && (
              <p className="text-xs text-[var(--v-muted-2)] w-full mt-1">Simulated balances — connect a real wallet with an RPC configured to see live figures.</p>
            )}
          </div>
        ) : (
          <Skeleton className="h-10" />
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total Value" value={formatUSD(portfolio.totalValue)} />
        <Stat label="Available" value={formatUSD(portfolio.availableBalance)} />
        <Stat
          label="Today's P&L"
          value={`${formatUSD(portfolio.dailyPnl)} (${formatPct(portfolio.dailyPnlPct)})`}
          tone={portfolio.dailyPnl >= 0 ? 'var(--v-success)' : 'var(--v-danger)'}
        />
        <Stat
          label="Overall P&L"
          value={`${formatUSD(portfolio.overallPnl)} (${formatPct(portfolio.overallPnlPct)})`}
          tone={portfolio.overallPnl >= 0 ? 'var(--v-success)' : 'var(--v-danger)'}
        />
      </div>
      <p className="text-xs text-[var(--v-muted-2)] -mt-4">
        Figures above are example marketplace positions (see note below) — not read from your wallet.
      </p>

      <div className="v-card p-5">
        <PerformanceChart data={series} />
      </div>

      <div className="v-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[var(--v-muted)]">
            <Sparkles size={14} />
            <span className="text-xs v-mono uppercase tracking-wider">AI Portfolio Health</span>
          </div>
          <span className="v-mono text-lg text-[var(--v-accent)]">{portfolio.healthScore}/100</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {Object.entries(portfolio.healthFactors).map(([key, val]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[var(--v-muted)]">{FACTOR_LABELS[key]}</span>
                <span className="v-mono text-xs text-[var(--v-white)]">{val}</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--v-accent-soft)] to-[var(--v-accent)]"
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {explaining ? (
          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="v-shimmer h-3 rounded bg-white/5 w-full" />
            <div className="v-shimmer h-3 rounded bg-white/5 w-3/5" />
          </div>
        ) : explanationError ? (
          <p className="text-sm text-[var(--v-danger)] leading-relaxed border-t border-white/10 pt-4">
            AI unavailable: {explanationError}
          </p>
        ) : (
          <p className="text-sm text-[var(--v-white)] leading-relaxed border-t border-white/10 pt-4">{explanation}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[var(--v-white)] font-medium">Example Positions</h2>
          <span className="v-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-[rgba(194,160,90,0.3)] text-[var(--v-warning)] bg-[var(--v-warning-dim)]">
            Sample data
          </span>
        </div>
        <p className="text-xs text-[var(--v-muted-2)] mb-3">
          No vault contracts are deployed for these products yet, so there's no real onchain position to read. This
          shows what a filled portfolio looks like once vaults go live — see README "X Layer Setup".
        </p>
        <div className="space-y-2">
          {portfolio.positions.map((p) => (
            <button
              key={p.assetId}
              onClick={() => navigate(`/markets/${p.assetId}`)}
              className="v-card v-focus w-full flex items-center justify-between p-4 text-left hover:border-white/25 transition-colors"
            >
              <div>
                <p className="text-[var(--v-white)] font-medium">{p.opportunity?.name}</p>
                <p className="text-xs text-[var(--v-muted)] v-mono">{p.opportunity?.symbol}</p>
              </div>
              <div className="flex items-center gap-4">
                <RiskBadge risk={p.opportunity?.risk} />
                <div className="text-right">
                  <p className="v-mono text-[var(--v-white)] text-sm">{formatUSD(p.amount)}</p>
                  <p className="text-xs text-[var(--v-muted-2)]">{p.allocationPct}% of portfolio</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button variant="secondary" onClick={() => navigate('/agent', { state: { prefill: 'Analyze my portfolio.' } })}>
        Ask Vanterra to analyze this portfolio
      </Button>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="v-card p-4">
      <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">{label}</p>
      <p className="v-mono text-sm truncate" style={{ color: tone || 'var(--v-white)' }}>
        {value}
      </p>
    </div>
  );
}

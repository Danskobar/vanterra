export function RiskBadge({ risk }) {
  const styles = {
    LOW: { color: 'var(--v-success)', bg: 'var(--v-success-dim)' },
    MEDIUM: { color: 'var(--v-warning)', bg: 'var(--v-warning-dim)' },
    HIGH: { color: 'var(--v-danger)', bg: 'var(--v-danger-dim)' },
    CRITICAL: { color: 'var(--v-danger)', bg: 'var(--v-danger-dim)' },
  };
  const s = styles[risk] || styles.MEDIUM;
  return (
    <span
      className="v-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border"
      style={{ color: s.color, backgroundColor: s.bg, borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {risk} RISK
    </span>
  );
}

export function LiquidityBadge({ liquidity }) {
  return (
    <span className="v-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-white/10 text-[var(--v-silver)]">
      {liquidity} LIQ
    </span>
  );
}

export function ScorePill({ score }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-2 h-2">
        <span
          className="absolute inset-0 rounded-full v-pulse"
          style={{ backgroundColor: 'var(--v-accent)' }}
        />
      </div>
      <span className="v-mono text-sm text-[var(--v-accent)]">{score}</span>
      <span className="v-mono text-[10px] text-[var(--v-muted-2)]">/100</span>
    </div>
  );
}

export function ModeBadge({ isDemo }) {
  return (
    <span
      className={`v-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border ${
        isDemo
          ? 'text-[var(--v-warning)] border-[rgba(194,160,90,0.3)] bg-[var(--v-warning-dim)]'
          : 'text-[var(--v-success)] border-[rgba(111,174,140,0.3)] bg-[var(--v-success-dim)]'
      }`}
    >
      {isDemo ? 'DEMO MODE' : 'REAL MODE'}
    </span>
  );
}

// Used anywhere a number, chart, or card is seed/example data rather than a
// live market feed — e.g. opportunity APY/TVL/price figures, since no real
// RWA/DeFi data provider is wired in yet. Keep this label wherever seed data
// from data/opportunities.js or data/intelligence.js is rendered as if it
// were current — never let it stand unlabeled next to real onchain figures.
export function SampleDataTag({ className = '' }) {
  return (
    <span
      className={`v-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[rgba(194,160,90,0.3)] text-[var(--v-warning)] bg-[var(--v-warning-dim)] ${className}`}
    >
      Sample data
    </span>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'v-focus inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium px-4 py-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'bg-gradient-to-b from-[var(--v-accent)] to-[var(--v-accent-soft)] text-black hover:brightness-110 active:brightness-95',
    secondary:
      'bg-[var(--v-surface-raised)] border border-white/10 text-[var(--v-white)] hover:border-white/25',
    ghost: 'text-[var(--v-muted)] hover:text-[var(--v-white)] hover:bg-white/5',
    danger: 'bg-[var(--v-danger-dim)] text-[var(--v-danger)] border border-[rgba(180,106,106,0.3)] hover:brightness-110',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function EmptyState({ title, body }) {
  return (
    <div className="v-card flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-10 h-10 rounded-full border border-white/10 mb-4" />
      <p className="text-[var(--v-white)] font-medium mb-1">{title}</p>
      <p className="text-sm text-[var(--v-muted)] max-w-sm">{body}</p>
    </div>
  );
}

export function ErrorState({ title, body, onRetry }) {
  return (
    <div className="v-card flex flex-col items-center justify-center text-center py-16 px-6 border-[rgba(180,106,106,0.25)]">
      <p className="text-[var(--v-danger)] font-medium mb-1">{title}</p>
      <p className="text-sm text-[var(--v-muted)] max-w-sm mb-4">{body}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`v-shimmer rounded-md bg-white/5 ${className}`} />;
}

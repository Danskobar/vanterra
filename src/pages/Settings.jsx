import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet.jsx';
import { getAIStatus } from '../services/ai.js';
import { isNetworkConfigured, X_LAYER } from '../services/xlayer.js';
import { getTelegramStatus } from '../services/telegram.js';
import { ModeBadge, Button, Skeleton } from '../components/Primitives.jsx';
import { shortenAddress } from '../utils/format.js';

export default function Settings() {
  const { address, isDemo, status, balances } = useWallet();
  const [autonomous, setAutonomous] = useState(false);
  const [maxManaged, setMaxManaged] = useState(500);
  const [approvalThreshold, setApprovalThreshold] = useState(200);
  const [maxRiskPct, setMaxRiskPct] = useState(5);
  const [aiStatus, setAiStatus] = useState(null);
  const [tgStatus, setTgStatus] = useState(null);

  useEffect(() => {
    getAIStatus().then(setAiStatus);
    getTelegramStatus().then(setTgStatus);
  }, []);

  if (!aiStatus || !tgStatus) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-medium text-[var(--v-white)] mb-1">Settings</h1>
        <p className="text-sm text-[var(--v-muted)]">Connections, automation limits, and system status.</p>
      </div>

      <div className="v-card p-5">
        <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)] mb-4">Connections</p>
        <div className="space-y-3">
          <Row label="Wallet" value={status === 'connected' ? shortenAddress(address) : 'Not connected'} badge={status === 'connected' && <ModeBadge isDemo={isDemo} />} />
          <Row label="AI Provider" value={aiStatus.configured ? 'Configured' : 'Not configured'} badge={<ModeBadge isDemo={!aiStatus.configured} />} />
          <Row label="X Layer RPC" value={isNetworkConfigured() ? X_LAYER.rpcUrl : 'Not configured'} badge={<ModeBadge isDemo={!isNetworkConfigured()} />} />
          <Row label="Telegram Bot" value={tgStatus.configured ? `@${tgStatus.botUsername}` : 'Not connected'} badge={<ModeBadge isDemo={!tgStatus.configured} />} />
        </div>
      </div>

      {balances && (
        <div className="v-card p-5">
          <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)] mb-4">Wallet Balances</p>
          <div className="grid grid-cols-2 gap-3">
            <Row label={balances.nativeSymbol} value={balances.native} />
            {balances.tokens.map((t) => (
              <Row key={t.symbol} label={t.symbol} value={t.amount} />
            ))}
          </div>
        </div>
      )}

      <div className="v-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)]">Autonomous Mode</p>
          <label className="v-focus inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autonomous}
              onChange={(e) => setAutonomous(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-[var(--v-platinum)] transition-colors relative">
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4 peer-checked:bg-black" />
            </div>
          </label>
        </div>
        <p className="text-xs text-[var(--v-muted)] leading-relaxed mb-4">
          Off by default. VANTERRA always requires your approval before execution unless you explicitly enable
          automation within defined limits.
        </p>
        <div className={`space-y-4 ${autonomous ? '' : 'opacity-40 pointer-events-none'}`}>
          <SliderRow label="Maximum managed capital" value={maxManaged} onChange={setMaxManaged} min={100} max={5000} step={100} prefix="$" />
          <SliderRow label="Require approval above" value={approvalThreshold} onChange={setApprovalThreshold} min={50} max={2000} step={50} prefix="$" />
          <SliderRow label="Never risk more than" value={maxRiskPct} onChange={setMaxRiskPct} min={1} max={25} step={1} suffix="%" />
        </div>
      </div>

      <Button variant="secondary" disabled>
        Save preferences (DEMO)
      </Button>
    </div>
  );
}

function Row({ label, value, badge }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--v-muted)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="v-mono text-[var(--v-white)] truncate max-w-[220px]">{value}</span>
        {badge}
      </div>
    </div>
  );
}

function SliderRow({ label, value, onChange, min, max, step, prefix = '', suffix = '' }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="text-[var(--v-muted)]">{label}</span>
        <span className="v-mono text-[var(--v-accent)]">
          {prefix}
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="v-focus w-full accent-[var(--v-platinum)]"
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getWhaleWallet } from '../services/whale.js';
import { formatUSD, timeAgo } from '../utils/format.js';
import { Skeleton, ErrorState } from '../components/Primitives.jsx';

export default function WhaleProfile() {
  const { address } = useParams();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(undefined);

  useEffect(() => {
    getWhaleWallet(address).then(setWallet);
  }, [address]);

  if (wallet === undefined) return <Skeleton className="h-64" />;
  if (wallet === null) {
    return <ErrorState title="Wallet not found" body="No profile exists for this address." onRetry={() => navigate('/whales')} />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="v-focus inline-flex items-center gap-1.5 text-sm text-[var(--v-muted)] hover:text-[var(--v-white)]"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div>
        <p className="v-mono text-xs text-[var(--v-muted)] uppercase tracking-wider mb-1">{wallet.label}</p>
        <h1 className="v-mono text-lg lg:text-xl text-[var(--v-white)] break-all">{wallet.address}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="v-card p-4">
          <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">Est. Holdings</p>
          <p className="v-mono text-[var(--v-white)]">{formatUSD(wallet.estimatedHoldings, { compact: true })}</p>
        </div>
        <div className="v-card p-4">
          <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">Activity Score</p>
          <p className="v-mono text-[var(--v-accent)]">{wallet.activityScore}/100</p>
        </div>
      </div>

      <div className="v-card p-5">
        <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)] mb-2">AI Analysis</p>
        <p className="text-sm text-[var(--v-white)] leading-relaxed">{wallet.history}</p>
      </div>

      <div>
        <h2 className="text-[var(--v-white)] font-medium mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {wallet.events.length === 0 && (
            <p className="text-sm text-[var(--v-muted)]">No recent transactions above the monitoring threshold.</p>
          )}
          {wallet.events.map((e) => (
            <div key={e.id} className="v-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[var(--v-white)] text-sm">{e.signal}</p>
                <p className="text-xs text-[var(--v-muted-2)]">{timeAgo(e.timestamp)}</p>
              </div>
              <span
                className="v-mono text-sm"
                style={{ color: e.direction === 'BUY' ? 'var(--v-success)' : 'var(--v-danger)' }}
              >
                {e.direction === 'BUY' ? '+' : '-'}
                {formatUSD(e.amountUsd, { compact: true })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

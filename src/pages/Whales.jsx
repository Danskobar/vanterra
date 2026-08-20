import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Search, AlertTriangle } from 'lucide-react';
import { getWhaleEvents } from '../services/whale.js';
import { getTrackerStatus, getWalletBalance, getWalletActivity } from '../services/onchainTracker.js';
import { formatUSD, shortenAddress, timeAgo } from '../utils/format.js';
import { Skeleton, EmptyState, Button } from '../components/Primitives.jsx';

export default function Whales() {
  const [events, setEvents] = useState(null);
  const [trackerStatus, setTrackerStatus] = useState(null);
  const [trackInput, setTrackInput] = useState('');
  const [tracked, setTracked] = useState(null); // { address, balance, activity } | null
  const [trackError, setTrackError] = useState(null);
  const [tracking, setTracking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getWhaleEvents().then(setEvents);
    getTrackerStatus().then(setTrackerStatus);
  }, []);

  async function handleTrack(e) {
    e.preventDefault();
    const address = trackInput.trim();
    if (!address) return;
    setTracking(true);
    setTrackError(null);
    setTracked(null);
    try {
      const [balance, { activity, tokenActivity, note }] = await Promise.all([
        getWalletBalance(address),
        getWalletActivity(address),
      ]);
      setTracked({ address, balance, activity, tokenActivity: tokenActivity || [], note });
    } catch (err) {
      setTrackError(err.message);
    } finally {
      setTracking(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-medium text-[var(--v-white)] mb-1">Whale Intelligence</h1>
        <p className="text-sm text-[var(--v-muted)]">
          Onchain behavioral signals from significant wallets across X Layer. Not a guarantee of future price movement.
        </p>
      </div>

      {/* REAL: track any wallet address with live onchain data */}
      <div className="v-card p-5">
        <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)] mb-3">Track a Wallet (Real)</p>

        {trackerStatus && !trackerStatus.rpcConfigured ? (
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-[var(--v-danger)] mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--v-muted)] leading-relaxed">
              No X Layer RPC configured on the backend yet. Set <span className="v-mono text-[var(--v-silver)]">XLAYER_RPC_URL</span>{' '}
              in <span className="v-mono text-[var(--v-silver)]">server/.env</span> and restart the backend to enable real wallet tracking.
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleTrack} className="flex items-center gap-2 mb-1">
              <div className="v-card flex items-center gap-2 px-3 py-2 flex-1">
                <Search size={13} className="text-[var(--v-muted-2)]" />
                <input
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  placeholder="Paste any X Layer wallet address (0x...)"
                  className="v-focus flex-1 bg-transparent outline-none text-sm text-[var(--v-white)] placeholder:text-[var(--v-muted-2)]"
                />
              </div>
              <Button type="submit" variant="secondary" disabled={tracking}>
                {tracking ? 'Scanning…' : 'Track'}
              </Button>
            </form>
            <p className="text-[10px] text-[var(--v-muted-2)]">Scans the most recent blocks for real transfer activity — not a full history.</p>
          </>
        )}

        {trackError && <p className="text-sm text-[var(--v-danger)] mt-3">{trackError}</p>}

        {tracked && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <p className="v-mono text-sm text-[var(--v-white)]">{shortenAddress(tracked.address, 6)}</p>
              <p className="v-mono text-sm text-[var(--v-accent)]">
                {tracked.balance.native.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tracked.balance.nativeSymbol}
              </p>
            </div>
            {tracked.note && (
              <p className="text-xs text-[var(--v-warning)] mb-3">{tracked.note}</p>
            )}
            {tracked.activity.length === 0 && tracked.tokenActivity.length === 0 ? (
              <p className="text-xs text-[var(--v-muted)]">No transfers found for this address in the recent scan window.</p>
            ) : (
              <div className="space-y-4">
                {tracked.activity.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-2">Native ({tracked.balance.nativeSymbol})</p>
                    <div className="space-y-2">
                      {tracked.activity.slice(0, 10).map((tx) => (
                        <div key={tx.hash} className="flex items-center justify-between text-sm">
                          <span className="text-[var(--v-muted)]">
                            {tx.direction === 'IN' ? 'Received' : 'Sent'} · {timeAgo(tx.timestamp)}
                          </span>
                          <span className="v-mono" style={{ color: tx.direction === 'IN' ? 'var(--v-success)' : 'var(--v-danger)' }}>
                            {tx.direction === 'IN' ? '+' : '-'}
                            {tx.valueNative.toFixed(4)} {tracked.balance.nativeSymbol}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tracked.tokenActivity.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-2">Token Transfers</p>
                    <div className="space-y-2">
                      {tracked.tokenActivity.slice(0, 10).map((tx) => (
                        <div key={tx.hash + tx.tokenAddress} className="flex items-center justify-between text-sm">
                          <span className="text-[var(--v-muted)]">
                            {tx.direction === 'IN' ? 'Received' : 'Sent'} {tx.tokenSymbol}
                            {tx.timestamp ? ` · ${timeAgo(tx.timestamp)}` : ''}
                          </span>
                          <span className="v-mono" style={{ color: tx.direction === 'IN' ? 'var(--v-success)' : 'var(--v-danger)' }}>
                            {tx.direction === 'IN' ? '+' : '-'}
                            {tx.value.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tx.tokenSymbol}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Example signals — seeded demo data, clearly separated from the real tracker above */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)]">Example Signals</p>
          <span className="v-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-[rgba(194,160,90,0.3)] text-[var(--v-warning)] bg-[var(--v-warning-dim)]">
            Sample data
          </span>
        </div>

        {!events ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState title="No whale activity detected" body="Check back shortly." />
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <div key={e.id} className="v-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: e.direction === 'BUY' ? 'var(--v-success-dim)' : 'var(--v-danger-dim)',
                      }}
                    >
                      {e.direction === 'BUY' ? (
                        <ArrowUpRight size={15} className="text-[var(--v-success)]" />
                      ) : (
                        <ArrowDownRight size={15} className="text-[var(--v-danger)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-[var(--v-white)] font-medium">
                        {e.signal} — {e.asset}
                      </p>
                      <p className="text-xs text-[var(--v-muted)] mt-0.5">
                        {e.wallets.length} wallet{e.wallets.length > 1 ? 's' : ''} · {timeAgo(e.timestamp)}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {e.wallets.map((w) => (
                          <button
                            key={w}
                            onClick={() => navigate(`/whales/${w}`)}
                            className="v-focus v-mono text-[10px] px-2 py-1 rounded-md border border-white/10 text-[var(--v-silver)] hover:text-[var(--v-white)] hover:border-white/25"
                          >
                            {shortenAddress(w)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="v-mono text-sm"
                      style={{ color: e.direction === 'BUY' ? 'var(--v-success)' : 'var(--v-danger)' }}
                    >
                      {e.direction === 'BUY' ? '+' : '-'}
                      {formatUSD(e.amountUsd, { compact: true })}
                    </p>
                    <p className="text-[10px] text-[var(--v-muted-2)] mt-1">{e.confidence}% confidence</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
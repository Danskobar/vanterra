import { useEffect, useState } from 'react';
import { getAlerts } from '../services/notification.js';
import { timeAgo } from '../utils/format.js';
import { Skeleton, EmptyState, Button } from '../components/Primitives.jsx';

export default function Alerts() {
  const [alerts, setAlerts] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getAlerts().then(setAlerts);
  }, []);

  function markRead(id) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }

  function dismiss(id) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  const filtered = alerts?.filter((a) => filter === 'all' || (filter === 'unread' ? !a.read : a.read));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--v-white)] mb-1">Alerts</h1>
          <p className="text-sm text-[var(--v-muted)]">Whale, risk, opportunity, and transaction notifications.</p>
        </div>
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`v-focus text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
                filter === f ? 'border-white/30 text-white bg-white/[0.06]' : 'border-white/10 text-[var(--v-muted)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {!alerts ? (
        <Skeleton className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No alerts" body="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <div key={a.id} className={`v-card p-4 ${!a.read ? 'border-white/20' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {!a.read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--v-warning)] shrink-0" />}
                  <div>
                    <p className="text-[var(--v-white)] text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-[var(--v-muted)] mt-1 leading-relaxed">{a.body}</p>
                    <p className="text-[10px] text-[var(--v-muted-2)] v-mono mt-1.5">{timeAgo(a.timestamp)}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!a.read && (
                    <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => markRead(a.id)}>
                      Mark read
                    </Button>
                  )}
                  <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => dismiss(a.id)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

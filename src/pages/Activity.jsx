import { useEffect, useState } from 'react';
import { Waves, ShieldAlert, Sparkles, Compass, CheckCircle2 } from 'lucide-react';
import { ACTIVITY_FEED } from '../data/intelligence.js';
import { timeAgo } from '../utils/format.js';
import { Skeleton } from '../components/Primitives.jsx';

const ICONS = {
  whale: { icon: Waves, color: 'var(--v-silver)' },
  risk: { icon: ShieldAlert, color: 'var(--v-warning)' },
  strategy: { icon: Sparkles, color: 'var(--v-platinum)' },
  opportunity: { icon: Compass, color: 'var(--v-success)' },
  transaction: { icon: CheckCircle2, color: 'var(--v-success)' },
};

export default function Activity() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setItems([...ACTIVITY_FEED].sort((a, b) => b.timestamp - a.timestamp)), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-medium text-[var(--v-white)] mb-1">Activity</h1>
        <p className="text-sm text-[var(--v-muted)]">A live stream of AI actions, whale movements, and portfolio changes.</p>
      </div>

      {!items ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-white/[0.08]" />
          <div className="space-y-5">
            {items.map((item) => {
              const { icon: Icon, color } = ICONS[item.type] || ICONS.strategy;
              return (
                <div key={item.id} className="relative v-rise">
                  <span
                    className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white/10"
                    style={{ backgroundColor: 'var(--v-bg-1)' }}
                  >
                    <Icon size={9} style={{ color }} />
                  </span>
                  <p className="text-sm text-[var(--v-white)]">{item.text}</p>
                  <p className="text-[10px] text-[var(--v-muted-2)] v-mono mt-1">{timeAgo(item.timestamp)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import AICommandBar from '../components/AICommandBar.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import { Skeleton, SampleDataTag } from '../components/Primitives.jsx';
import { OPPORTUNITIES } from '../data/opportunities.js';

export default function Explore() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const sorted = [...OPPORTUNITIES].sort((a, b) => b.aiScore - a.aiScore);

  return (
    <div className="space-y-8">
      <AICommandBar />

      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[var(--v-white)] font-medium">Opportunity Listings</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--v-muted-2)] v-mono">{OPPORTUNITIES.length} assets · X Layer</span>
            <SampleDataTag />
          </div>
        </div>
        <p className="text-xs text-[var(--v-muted-2)] mb-4">
          Example listing data — no live RWA/DeFi data feed is connected yet.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

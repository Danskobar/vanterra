import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard.jsx';
import { EmptyState, SampleDataTag } from '../components/Primitives.jsx';
import { OPPORTUNITIES } from '../data/opportunities.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'RWA', label: 'RWA' },
  { id: 'DeFi', label: 'DeFi' },
  { id: 'LOW', label: 'Low Risk' },
  { id: 'MEDIUM', label: 'Medium Risk' },
  { id: 'HIGH', label: 'High Risk' },
  { id: 'ACCUMULATING', label: 'Whale Activity' },
];

const SORTS = [
  { id: 'aiScore', label: 'AI Score' },
  { id: 'apy', label: 'Yield' },
  { id: 'tvl', label: 'TVL' },
];

export default function Markets() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('aiScore');

  const results = useMemo(() => {
    let list = OPPORTUNITIES.filter((o) =>
      `${o.name} ${o.symbol}`.toLowerCase().includes(query.toLowerCase())
    );
    if (filter !== 'all') {
      list = list.filter(
        (o) => o.category === filter || o.risk === filter || o.whaleActivity === filter
      );
    }
    return list.sort((a, b) => b[sort] - a[sort]);
  }, [query, filter, sort]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-[var(--v-white)] mb-1">Markets</h1>
          <SampleDataTag />
        </div>
        <p className="text-sm text-[var(--v-muted)]">Discover, filter, and compare opportunities across X Layer.</p>
        <p className="text-xs text-[var(--v-muted-2)] mt-1">
          Example listing data — no live RWA/DeFi data feed is connected yet.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="v-card flex items-center gap-2.5 px-4 py-2.5 flex-1">
          <Search size={15} className="text-[var(--v-muted-2)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities"
            className="v-focus bg-transparent outline-none text-sm text-[var(--v-white)] placeholder:text-[var(--v-muted-2)] w-full"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="v-focus v-card px-3 py-2.5 text-sm text-[var(--v-white)] bg-[var(--v-surface)] outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              Sort: {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`v-focus text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f.id
                ? 'border-white/30 text-[var(--v-white)] bg-white/[0.06]'
                : 'border-white/10 text-[var(--v-muted)] hover:text-[var(--v-white)] hover:border-white/25'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <EmptyState title="No matching opportunities" body="Try a different search term or clear your filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      )}
    </div>
  );
}

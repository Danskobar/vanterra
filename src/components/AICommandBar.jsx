import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

const EXAMPLES = [
  'Find me a low-risk opportunity above 6% yield.',
  'Show me assets whales are accumulating.',
  'Analyze my portfolio.',
  'Reduce my exposure to high-risk positions.',
];

export default function AICommandBar() {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  function submit(text) {
    const q = (text ?? value).trim();
    if (!q) return;
    navigate('/agent', { state: { prefill: q } });
  }

  return (
    <div className="v-card p-5 lg:p-6 v-rise">
      <div className="flex items-center gap-2 mb-3 text-[var(--v-muted)]">
        <Sparkles size={15} strokeWidth={1.6} />
        <span className="text-xs v-mono uppercase tracking-wider">Vanterra AI Command</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-center gap-3"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What do you want to do?"
          className="v-focus flex-1 bg-transparent text-lg lg:text-xl text-[var(--v-white)] placeholder:text-[var(--v-muted-2)] outline-none"
        />
        <button
          type="submit"
          className="v-focus shrink-0 w-10 h-10 rounded-full bg-gradient-to-b from-[var(--v-platinum)] to-[var(--v-silver)] flex items-center justify-center hover:brightness-110 transition-all"
          aria-label="Ask Vanterra"
        >
          <ArrowUpRight size={18} className="text-black" />
        </button>
      </form>
      <div className="flex flex-wrap gap-2 mt-4">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => submit(ex)}
            className="v-focus text-xs px-3 py-1.5 rounded-full border border-white/10 text-[var(--v-muted)] hover:text-[var(--v-white)] hover:border-white/25 transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

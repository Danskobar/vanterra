import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function PerformanceChart({ data, height = 220, color = 'var(--v-accent)' }) {
  return (
    <div style={{ height }} className="v-rise">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="v-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" hide />
          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            contentStyle={{
              background: '#0e0e10',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={() => ''}
            formatter={(value) => [value, 'Value']}
          />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill="url(#v-area)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

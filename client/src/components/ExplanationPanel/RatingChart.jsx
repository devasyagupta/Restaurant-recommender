import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import allRestaurants from '../../data/restaurants.json';

export default function RatingChart({ highlightRating }) {
  const data = useMemo(() => {
    const bins = [
      { range: '3.0–3.4', min: 3.0, max: 3.4, count: 0 },
      { range: '3.5–3.9', min: 3.5, max: 3.9, count: 0 },
      { range: '4.0–4.4', min: 4.0, max: 4.4, count: 0 },
      { range: '4.5–5.0', min: 4.5, max: 5.0, count: 0 },
    ];

    allRestaurants.forEach(r => {
      for (const bin of bins) {
        if (r.rating >= bin.min && r.rating <= bin.max) {
          bin.count++;
          break;
        }
      }
    });

    return bins;
  }, []);

  // Find which bin the highlighted rating falls in
  const highlightBin = data.findIndex(
    bin => highlightRating >= bin.min && highlightRating <= bin.max
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div
        className="px-3 py-2 rounded-lg"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--glass-border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-primary)',
        }}
      >
        {payload[0].payload.range}: {payload[0].value} restaurants
      </div>
    );
  };

  return (
    <div aria-label="Rating distribution chart showing restaurant counts by rating range">
      <h4
        className="mb-3"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          fontWeight: 500,
        }}
      >
        Rating Distribution
      </h4>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="range"
            tick={{
              fill: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={i === highlightBin ? 'var(--chroma-1)' : 'var(--surface-3)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

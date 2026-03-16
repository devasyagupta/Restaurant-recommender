import React from 'react';
import { getBudgetLabel, getMealLabel } from '../../utils/format.js';

export default function FilterSummary({ preferences }) {
  if (!preferences) return null;

  const items = [];
  if (preferences.area) items.push({ label: 'Area', value: preferences.area });
  if (preferences.cuisine?.length > 0) items.push({ label: 'Cuisine', value: preferences.cuisine.join(', ') });
  if (preferences.budget) items.push({ label: 'Budget', value: getBudgetLabel(preferences.budget) });
  if (preferences.minRating) items.push({ label: 'Min Rating', value: `${preferences.minRating}★` });
  if (preferences.diet && preferences.diet !== 'any') items.push({ label: 'Diet', value: preferences.diet === 'veg' ? 'Vegetarian' : 'Non-Veg' });
  if (preferences.visitTime) items.push({ label: 'Time', value: getMealLabel(preferences.visitTime) });

  if (items.length === 0) return null;

  return (
    <div
      className="glass-card p-4 mb-6"
      id="filter-summary"
    >
      <h3
        className="text-sm font-medium mb-3"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
      >
        Active Filters
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              background: 'var(--surface-2)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>{item.label}:</span>
            <span style={{ color: 'var(--text-primary)' }}>{item.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

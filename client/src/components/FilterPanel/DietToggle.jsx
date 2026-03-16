import React from 'react';

export default function DietToggle({ value, onChange }) {
  const options = [
    { key: 'veg', label: 'Veg', icon: '🟢' },
    { key: 'nonveg', label: 'Non-Veg', icon: '🔴' },
    { key: 'any', label: 'Any', icon: '⚪' },
  ];

  return (
    <div className="flex gap-2" id="diet-toggle">
      {options.map(opt => {
        const isActive = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all duration-200"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              background: isActive
                ? 'linear-gradient(135deg, var(--chroma-1), var(--chroma-2))'
                : 'var(--glass-bg)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border: isActive ? '1px solid transparent' : '1px solid var(--glass-border)',
            }}
            aria-pressed={isActive}
            id={`diet-${opt.key}`}
          >
            <span aria-hidden="true">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const motionConfig = prefersReducedMotion ? { duration: 0 } : { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] };

export default function CuisinePills({ selected, onChange, cuisines }) {
  const toggleCuisine = (cuisine) => {
    if (selected.includes(cuisine)) {
      onChange(selected.filter(c => c !== cuisine));
    } else {
      onChange([...selected, cuisine]);
    }
  };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2" id="cuisine-pills">
      {cuisines.map(cuisine => {
        const isActive = selected.includes(cuisine);
        return (
          <motion.button
            key={cuisine}
            onClick={() => toggleCuisine(cuisine)}
            className="px-3 py-2 rounded-full text-center transition-colors duration-200"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              background: isActive
                ? 'linear-gradient(135deg, var(--chroma-1), var(--chroma-2))'
                : 'var(--glass-bg)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border: isActive
                ? '1px solid transparent'
                : '1px solid var(--glass-border)',
            }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            transition={motionConfig}
            aria-pressed={isActive}
            id={`cuisine-${cuisine.toLowerCase().replace(/ /g, '-')}`}
          >
            {cuisine}
          </motion.button>
        );
      })}
    </div>
  );
}

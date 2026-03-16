import React from 'react';
import { motion } from 'framer-motion';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const COLORS = {
  cuisine: 'var(--chroma-1)',
  rating:  'var(--chroma-2)',
  area:    'var(--chroma-3)',
  budget:  'var(--chroma-4)',
  diet:    'var(--chroma-5)',
  time:    '#2ECC71',
};

export default function ScoreBar({ label, score, weight, index = 0 }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      {/* Label */}
      <div
        className="w-[140px] flex-shrink-0 text-right"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
        }}
      >
        {label}
      </div>

      {/* Bar */}
      <div
        className="flex-grow h-3 rounded-full overflow-hidden"
        style={{ background: 'var(--surface-2)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: COLORS[label.toLowerCase().split(' ')[0]] || 'var(--chroma-1)',
            transformOrigin: 'left',
          }}
          initial={prefersReducedMotion ? { scaleX: score } : { scaleX: 0 }}
          animate={{ scaleX: score }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            duration: 0.6,
            delay: index * 0.08,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </div>

      {/* Value */}
      <div
        className="w-[60px] flex-shrink-0 text-right"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
        }}
      >
        {(score * 100).toFixed(0)}%
      </div>
    </div>
  );
}

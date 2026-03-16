import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreBar from './ScoreBar.jsx';
import RatingChart from './RatingChart.jsx';
import { WEIGHT_LABELS, WEIGHTS } from '../../utils/scoring.js';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ExplanationPanel({ restaurant, isOpen }) {
  const scoreEntries = Object.entries(WEIGHT_LABELS);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="overflow-hidden"
          initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            duration: 0.35,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <div
            className="p-5 mt-0 rounded-b-[var(--radius-lg)]"
            style={{
              background: 'var(--surface-1)',
              borderTop: '1px solid var(--glass-border)',
            }}
          >
            <h4
              className="mb-4"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Score Breakdown
            </h4>

            {/* Score Bars */}
            <div className="mb-6">
              {scoreEntries.map(([key, label], i) => (
                <ScoreBar
                  key={key}
                  label={label}
                  score={restaurant.scores?.[key] ?? 0}
                  weight={WEIGHTS[key]}
                  index={i}
                />
              ))}
            </div>

            {/* Rating Chart */}
            <RatingChart highlightRating={restaurant.rating} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

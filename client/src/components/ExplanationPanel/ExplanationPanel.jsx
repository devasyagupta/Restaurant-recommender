import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreBar from './ScoreBar.jsx';
import RatingChart from './RatingChart.jsx';
import { WEIGHT_LABELS, WEIGHTS, BONUSES, BONUS_LABELS } from '../../utils/scoring.js';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ExplanationPanel({ restaurant, isOpen }) {
  const scoreEntries = Object.entries(WEIGHT_LABELS);
  const breakdown = restaurant?.breakdown;
  const bonuses   = breakdown?.bonuses || {};
  const activeBonuses = Object.entries(bonuses).filter(([, v]) => v === true);

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
            {/* Reason Summary */}
            {breakdown?.reasonSummary && (
              <div
                className="mb-4 px-3 py-2.5 rounded-xl"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  {breakdown.reasonSummary}
                </p>
              </div>
            )}

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
            <div className="mb-4">
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

            {/* Bonus Points */}
            {activeBonuses.length > 0 && (
              <div
                className="mb-4 px-3 py-2.5 rounded-xl"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <div
                  className="mb-1.5"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Bonus Points
                </div>
                <div className="space-y-1">
                  {activeBonuses.map(([key]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {BONUS_LABELS[key] || key}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--chroma-2)', fontWeight: 600 }}>
                        +{BONUSES[key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Score */}
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(232,71,42,0.10), rgba(201,74,140,0.10))',
                border: '1px solid rgba(232,71,42,0.20)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Final Match Score
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--chroma-1)' }}>
                {breakdown?.finalScore ?? restaurant.score}%
              </span>
            </div>

            {/* Rating Chart */}
            <RatingChart highlightRating={restaurant.rating} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

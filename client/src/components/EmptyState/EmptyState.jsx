import React from 'react';
import { motion } from 'framer-motion';
import { SearchX, MapPin } from 'lucide-react';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function EmptyState({ hasSearched, error }) {
  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="w-16 h-16 flex items-center justify-center rounded-full mb-4"
          style={{ background: 'var(--surface-2)' }}
        >
          <SearchX size={28} style={{ color: 'var(--chroma-2)' }} />
        </div>
        <h3
          className="text-lg font-medium mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Something went wrong
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          {error}
        </p>
      </motion.div>
    );
  }

  if (hasSearched) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="w-16 h-16 flex items-center justify-center rounded-full mb-4"
          style={{ background: 'var(--surface-2)' }}
        >
          <SearchX size={28} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h3
          className="text-lg font-medium mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          No matches found
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: '320px' }}>
          Try adjusting your filters — broaden the cuisine selection, lower the minimum rating, or select a different area.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className="w-16 h-16 flex items-center justify-center rounded-full mb-4"
        style={{ background: 'var(--surface-2)' }}
      >
        <MapPin size={28} style={{ color: 'var(--chroma-1)' }} />
      </div>
      <h3
        className="text-lg font-medium mb-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        Select your preferences
      </h3>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: '320px' }}>
        Choose an area and set your filters to discover the best restaurants in Ahmedabad.
      </p>
    </motion.div>
  );
}

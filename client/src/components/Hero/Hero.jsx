import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import AmbientOrbs from './AmbientOrbs.jsx';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Hero() {
  const scrollToFilters = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative flex flex-col items-center justify-end min-h-screen overflow-hidden noise-overlay"
      style={{ background: 'var(--surface-0)' }}
      id="hero-section"
    >
      <AmbientOrbs />

      <div className="relative z-10 text-center px-6 pb-24 md:pb-32">
        <motion.p
          className="mb-4 uppercase tracking-[0.3em] text-sm"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
        >
          Discover the best food in
        </motion.p>

        <motion.h1
          className="mb-6"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-hero)',
            fontWeight: 300,
            lineHeight: 1,
            color: 'var(--text-primary)',
          }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.4 }}
        >
          <span className="gradient-text font-semibold">Ahmedabad</span>
          <br />
          <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Eats</span>
        </motion.h1>

        <motion.p
          className="max-w-lg mx-auto mb-12"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.6 }}
        >
          Smart restaurant recommendations powered by content-based filtering.
          Find your perfect meal across 24 neighbourhoods.
        </motion.p>

        <motion.button
          onClick={scrollToFilters}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full transition-all duration-300"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(16px)',
          }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.8 }}
          id="explore-btn"
        >
          Explore Restaurants
          <ChevronDown size={16} />
        </motion.button>
      </div>
    </section>
  );
}

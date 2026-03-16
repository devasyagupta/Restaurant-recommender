import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex items-center justify-center w-10 h-10 rounded-full
                 transition-colors duration-200"
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      id="theme-toggle"
    >
      <motion.div
        key={theme}
        initial={prefersReducedMotion ? false : { rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {theme === 'dark' ? (
          <Sun size={18} style={{ color: 'var(--chroma-1)' }} />
        ) : (
          <Moon size={18} style={{ color: 'var(--chroma-4)' }} />
        )}
      </motion.div>
    </button>
  );
}

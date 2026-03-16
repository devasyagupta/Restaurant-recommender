import React from 'react';
import { Github } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';

export default function NavBar({ theme, onToggleTheme }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
      }}
      id="main-nav"
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xl italic font-semibold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--chroma-1)',
          }}
        >
          Ahmedabad Eats
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
          aria-label="View source code on GitHub"
          id="github-link"
        >
          <Github size={18} style={{ color: 'var(--text-secondary)' }} />
        </a>
      </div>
    </nav>
  );
}

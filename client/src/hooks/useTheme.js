import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ahmedabad-eats-theme';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Read from localStorage or default to dark
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}

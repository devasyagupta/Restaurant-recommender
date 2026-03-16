import { useState, useCallback } from 'react';

export function useRecommendations() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchRecommendations = useCallback(async (preferences) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
      setMeta(data.meta || null);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, meta, hasSearched, fetchRecommendations };
}

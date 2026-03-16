import React, { useState, useCallback } from 'react';
import NavBar from './components/Navigation/NavBar.jsx';
import Hero from './components/Hero/Hero.jsx';
import FilterPanel from './components/FilterPanel/FilterPanel.jsx';
import RestaurantCard from './components/RestaurantCard/RestaurantCard.jsx';
import ExplanationPanel from './components/ExplanationPanel/ExplanationPanel.jsx';
import FilterSummary from './components/FilterSummary/FilterSummary.jsx';
import EmptyState from './components/EmptyState/EmptyState.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useRecommendations } from './hooks/useRecommendations.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { results, loading, error, meta, hasSearched, fetchRecommendations } = useRecommendations();
  const [expandedCardId, setExpandedCardId] = useState(null);

  const handleSearch = useCallback((preferences) => {
    setExpandedCardId(null);
    fetchRecommendations(preferences);
  }, [fetchRecommendations]);

  const handleToggleCard = useCallback((id) => {
    setExpandedCardId(prev => (prev === id ? null : id));
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--surface-0)', color: 'var(--text-primary)' }}
    >
      <NavBar theme={theme} onToggleTheme={toggleTheme} />

      <Hero />

      <main
        id="main-content"
        className="relative px-4 md:px-6 xl:px-8 py-8 max-w-[1600px] mx-auto"
      >
        <div className="flex gap-8">
          {/* Filter Panel (sidebar on desktop) */}
          <FilterPanel onSubmit={handleSearch} loading={loading} />

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* Filter Summary */}
            {meta?.preferences && (
              <FilterSummary preferences={meta.preferences} />
            )}

            {/* Results Header */}
            {results.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-2xl font-semibold"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  Top Recommendations
                </h2>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {meta?.totalScored} restaurants scored
                </span>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="glass-card overflow-hidden">
                    <div className="h-[180px] skeleton-shimmer" />
                    <div className="p-5 space-y-3">
                      <div className="h-6 w-3/4 rounded-lg skeleton-shimmer" />
                      <div className="h-4 w-1/2 rounded-lg skeleton-shimmer" />
                      <div className="h-4 w-full rounded-lg skeleton-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!loading && results.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {results.map((restaurant, i) => (
                  <div key={restaurant.id}>
                    <RestaurantCard
                      restaurant={restaurant}
                      rank={i + 1}
                      isExpanded={expandedCardId === restaurant.id}
                      onToggle={() => handleToggleCard(restaurant.id)}
                      index={i}
                    />
                    <ExplanationPanel
                      restaurant={restaurant}
                      isOpen={expandedCardId === restaurant.id}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Empty / Error State */}
            {!loading && results.length === 0 && (
              <EmptyState hasSearched={hasSearched} error={error} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-8 mt-12"
        style={{
          borderTop: '1px solid var(--glass-border)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
        }}
      >
        <p>Ahmedabad Eats v1.0 · Final Year Project · Weighted Content-Based Filtering</p>
        <p className="mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
          250+ restaurants · 24 areas · 15 cuisines
        </p>
      </footer>
    </div>
  );
}

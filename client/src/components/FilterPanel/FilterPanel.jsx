import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, MapPin, ChevronDown } from 'lucide-react';
import CuisinePills from './CuisinePills.jsx';
import RatingSlider from './RatingSlider.jsx';
import DietToggle from './DietToggle.jsx';
import { VALID_AREAS, CUISINE_TYPES } from '../../utils/format.js';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DEFAULTS = {
  area: '',
  cuisine: [],
  budget: 'medium',
  minRating: 3.5,
  distance: 'medium',
  diet: 'any',
  visitTime: 'lunch',
};

export default function FilterPanel({ onSubmit, loading }) {
  const [filters, setFilters] = useState({ ...DEFAULTS });
  const [areaSearch, setAreaSearch] = useState('');
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const areaRef = useRef(null);

  // Close area dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (areaRef.current && !areaRef.current.contains(e.target)) {
        setAreaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const update = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const filteredAreas = useMemo(() => {
    if (!areaSearch) return VALID_AREAS;
    return VALID_AREAS.filter(a =>
      a.toLowerCase().includes(areaSearch.toLowerCase())
    );
  }, [areaSearch]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.area) count++;
    if (filters.cuisine.length > 0) count++;
    if (filters.budget !== DEFAULTS.budget) count++;
    if (filters.minRating !== DEFAULTS.minRating) count++;
    if (filters.distance !== DEFAULTS.distance) count++;
    if (filters.diet !== DEFAULTS.diet) count++;
    if (filters.visitTime !== DEFAULTS.visitTime) count++;
    return count;
  }, [filters]);

  const handleSubmit = () => {
    if (!filters.area) return;
    onSubmit(filters);
    setMobileOpen(false);
  };

  const handleReset = () => {
    setFilters({ ...DEFAULTS });
    setAreaSearch('');
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-medium"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--text-primary)',
            borderLeft: '3px solid var(--chroma-1)',
            paddingLeft: '8px',
          }}
        >
          Your Preferences
        </h2>
        <button
          onClick={handleReset}
          className="text-xs underline transition-colors"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          id="reset-filters"
        >
          Reset
        </button>
      </div>

      {/* Area Selector */}
      <div>
        <label
          className="block mb-2 text-sm font-medium"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
        >
          <MapPin size={14} className="inline mr-1" style={{ color: 'var(--chroma-1)' }} />
          Area in Ahmedabad <span style={{ color: 'var(--chroma-1)' }}>*</span>
        </label>
        <div ref={areaRef} className="relative">
          <input
            type="text"
            value={areaSearch || filters.area}
            onChange={(e) => {
              setAreaSearch(e.target.value);
              setAreaDropdownOpen(true);
              if (!e.target.value) update('area', '');
            }}
            onFocus={() => setAreaDropdownOpen(true)}
            placeholder="Search area..."
            className="w-full px-4 py-3 rounded-xl transition-all duration-200"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)',
            }}
            id="area-search"
          />
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <AnimatePresence>
            {areaDropdownOpen && (
              <motion.ul
                initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-xl shadow-xl"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                {filteredAreas.map(area => (
                  <li
                    key={area}
                    onClick={() => {
                      update('area', area);
                      setAreaSearch('');
                      setAreaDropdownOpen(false);
                    }}
                    className="px-4 py-2 cursor-pointer transition-colors duration-150 hover:opacity-80"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: filters.area === area ? 'var(--chroma-1)' : 'var(--text-primary)',
                      background: filters.area === area ? 'var(--surface-3)' : 'transparent',
                    }}
                  >
                    {area}
                  </li>
                ))}
                {filteredAreas.length === 0 && (
                  <li className="px-4 py-3 text-center" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                    No areas found
                  </li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cuisine Selector */}
      <div>
        <label className="block mb-2 text-sm font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          Cuisine Type
        </label>
        <CuisinePills
          selected={filters.cuisine}
          onChange={(val) => update('cuisine', val)}
          cuisines={CUISINE_TYPES}
        />
      </div>

      {/* Budget */}
      <div>
        <label className="block mb-2 text-sm font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          Budget Range
        </label>
        <div className="flex gap-2" id="budget-toggle">
          {[
            { key: 'low', label: '₹ Low' },
            { key: 'medium', label: '₹₹ Medium' },
            { key: 'high', label: '₹₹₹ High' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => update('budget', opt.key)}
              className="flex-1 py-2 rounded-xl transition-all duration-200"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                background: filters.budget === opt.key
                  ? 'linear-gradient(135deg, var(--chroma-1), var(--chroma-2))'
                  : 'var(--glass-bg)',
                color: filters.budget === opt.key ? '#fff' : 'var(--text-secondary)',
                border: filters.budget === opt.key ? '1px solid transparent' : '1px solid var(--glass-border)',
              }}
              aria-pressed={filters.budget === opt.key}
              id={`budget-${opt.key}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Slider */}
      <div>
        <label className="block mb-3 text-sm font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          Minimum Rating
        </label>
        <RatingSlider
          value={filters.minRating}
          onChange={(val) => update('minRating', val)}
        />
      </div>

      {/* Distance */}
      <div>
        <label className="block mb-2 text-sm font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          Distance Preference
        </label>
        <div className="flex gap-2" id="distance-toggle">
          {[
            { key: 'near', label: 'Near (< 2 km)' },
            { key: 'medium', label: 'Medium' },
            { key: 'far', label: 'Far (> 10 km)' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => update('distance', opt.key)}
              className="flex-1 py-2 rounded-xl transition-all duration-200"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                background: filters.distance === opt.key
                  ? 'linear-gradient(135deg, var(--chroma-1), var(--chroma-2))'
                  : 'var(--glass-bg)',
                color: filters.distance === opt.key ? '#fff' : 'var(--text-secondary)',
                border: filters.distance === opt.key ? '1px solid transparent' : '1px solid var(--glass-border)',
              }}
              aria-pressed={filters.distance === opt.key}
              id={`distance-${opt.key}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Diet Preference */}
      <div>
        <label className="block mb-2 text-sm font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          Food Preference
        </label>
        <DietToggle value={filters.diet} onChange={(val) => update('diet', val)} />
      </div>

      {/* Time of Visit */}
      <div>
        <label className="block mb-2 text-sm font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          Time of Visit
        </label>
        <div className="flex gap-2" id="time-toggle">
          {[
            { key: 'breakfast', label: '🌅 Breakfast' },
            { key: 'lunch', label: '☀️ Lunch' },
            { key: 'dinner', label: '🌙 Dinner' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => update('visitTime', opt.key)}
              className="flex-1 py-2 rounded-xl transition-all duration-200"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                background: filters.visitTime === opt.key
                  ? 'linear-gradient(135deg, var(--chroma-1), var(--chroma-2))'
                  : 'var(--glass-bg)',
                color: filters.visitTime === opt.key ? '#fff' : 'var(--text-secondary)',
                border: filters.visitTime === opt.key ? '1px solid transparent' : '1px solid var(--glass-border)',
              }}
              aria-pressed={filters.visitTime === opt.key}
              id={`time-${opt.key}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSubmit}
        disabled={!filters.area || loading}
        className="w-full py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          background: filters.area
            ? 'linear-gradient(135deg, var(--chroma-1), var(--chroma-2))'
            : 'var(--surface-3)',
          color: filters.area ? '#fff' : 'var(--text-muted)',
          boxShadow: filters.area ? '0 8px 32px rgba(255, 107, 53, 0.3)' : 'none',
        }}
        id="search-btn"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Searching...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Search size={18} />
            Find Restaurants
          </span>
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden xl:block w-[340px] 2xl:w-[380px] flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-96px)] overflow-y-auto glass-card p-6"
        id="filter-sidebar"
        style={{ scrollbarWidth: 'thin' }}
      >
        {filterContent}
      </aside>

      {/* Tablet Button + Floating Panel */}
      <div className="hidden md:block xl:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full shadow-xl"
          style={{
            background: 'linear-gradient(135deg, var(--chroma-1), var(--chroma-2))',
            color: '#fff',
            fontFamily: 'var(--font-body)',
          }}
          id="tablet-filter-btn"
        >
          <SlidersHorizontal size={18} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs" style={{ background: 'rgba(0,0,0,0.3)' }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile FAB */}
      <div className="block md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 flex items-center justify-center rounded-full shadow-xl"
          style={{
            background: 'linear-gradient(135deg, var(--chroma-1), var(--chroma-2))',
            color: '#fff',
          }}
          aria-label={`Open filters. ${activeFilterCount} active filters.`}
          id="mobile-filter-fab"
        >
          <SlidersHorizontal size={22} />
          {activeFilterCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold"
              style={{ background: 'var(--chroma-2)', color: '#fff' }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Bottom Sheet / Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 md:left-auto md:bottom-auto md:top-0 md:w-[380px] md:h-full max-h-[85vh] md:max-h-full overflow-y-auto rounded-t-3xl md:rounded-none p-6"
              style={{
                background: 'var(--surface-1)',
                borderTop: '1px solid var(--glass-border)',
              }}
              initial={prefersReducedMotion ? false : { y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }}
              role="dialog"
              aria-label="Filter Panel"
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center mb-4 md:hidden">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'var(--surface-3)' }}
                />
              </div>
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: 'var(--surface-2)' }}
                aria-label="Close filter panel"
                id="close-filters"
              >
                <X size={16} style={{ color: 'var(--text-secondary)' }} />
              </button>
              {filterContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

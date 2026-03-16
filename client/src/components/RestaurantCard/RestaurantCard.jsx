import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, IndianRupee } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback.jsx';
import { formatDistance, formatHours } from '../../utils/format.js';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function RestaurantCard({ restaurant, rank, isExpanded, onToggle, index = 0 }) {
  const vegLabel = restaurant.veg_nonveg === 'veg' ? 'Veg' :
                   restaurant.veg_nonveg === 'nonveg' ? 'Non-Veg' : 'Both';
  const vegColor = restaurant.veg_nonveg === 'veg' ? '#2ECC71' :
                   restaurant.veg_nonveg === 'nonveg' ? '#E74C3C' : '#F39C12';

  return (
    <motion.article
      className="glass-card overflow-hidden cursor-pointer"
      onClick={onToggle}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : {
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      layout
      aria-label={`${restaurant.name}, ${restaurant.score}% match, rank ${rank}`}
      id={`restaurant-card-${restaurant.id}`}
    >
      {/* Image Section */}
      <div className="relative h-[180px] overflow-hidden rounded-t-[var(--radius-lg)]">
        <motion.div
          className="w-full h-full"
          whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
          transition={{ duration: 0.4 }}
        >
          <ImageWithFallback
            restaurant={restaurant}
            className="w-full h-full"
          />
        </motion.div>

        {/* Rank Badge */}
        <div
          className="absolute top-3 left-3 w-12 h-12 flex items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--chroma-1), var(--chroma-2))',
            boxShadow: '0 4px 16px rgba(232, 71, 42, 0.4)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '24px',
              fontWeight: 600,
              color: '#fff',
            }}
          >
            {rank}
          </span>
        </div>

        {/* Match Badge */}
        <div
          className="absolute top-3 right-3 px-3 py-1.5 rounded-full"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: '#fff',
            }}
          >
            {restaurant.score}%
          </span>
        </div>

        {/* Veg/Non-Veg Badge */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: vegColor }}
            aria-hidden="true"
          />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: '#fff' }}>
            {vegLabel}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Name + Cuisine */}
        <h3
          className="text-lg font-semibold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {restaurant.name}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {restaurant.cuisine.slice(0, 3).map((c, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                background: 'var(--surface-2)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--glass-border)',
              }}
            >
              {c}
            </span>
          ))}
          {restaurant.cuisine.length > 3 && (
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
              }}
            >
              +{restaurant.cuisine.length - 3} more
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <Star size={16} className="mx-auto mb-1" style={{ color: 'var(--chroma-1)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              {restaurant.rating}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Rating
            </div>
          </div>
          <div className="text-center">
            <IndianRupee size={16} className="mx-auto mb-1" style={{ color: 'var(--chroma-1)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              {restaurant.price_symbol}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Price
            </div>
          </div>
          <div className="text-center">
            <MapPin size={16} className="mx-auto mb-1" style={{ color: 'var(--chroma-1)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              {formatDistance(restaurant.distance_km)}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Distance
            </div>
          </div>
          <div className="text-center">
            <Clock size={16} className="mx-auto mb-1" style={{ color: 'var(--chroma-1)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
              {restaurant.opening_time}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Opens
            </div>
          </div>
        </div>

        {/* Area */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {restaurant.area}
          </span>
        </div>

        {/* Reason */}
        <p
          className="line-clamp-2"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          {restaurant.reason}
        </p>

        {/* Expand hint */}
        <div
          className="mt-3 text-center"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
          }}
        >
          {isExpanded ? '▲ Hide details' : '▼ Why this match?'}
        </div>
      </div>
    </motion.article>
  );
}

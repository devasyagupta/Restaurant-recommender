import React, { useState } from 'react';
import { getCuisineSlug, getCuisineGradient, getInitials } from '../../utils/cuisine-image-map.js';

export default function ImageWithFallback({ restaurant, className = '' }) {
  const [failed, setFailed] = useState(false);
  const slug = getCuisineSlug(restaurant.cuisine);
  const gradient = getCuisineGradient(slug);
  const initials = getInitials(restaurant.name);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{
          background: gradient,
          borderRadius: 'inherit',
        }}
        role="img"
        aria-label={`${restaurant.name} placeholder`}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.85)',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={restaurant.image_url}
      alt={restaurant.name}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

import React, { useState } from 'react';
import { getCuisineSlug, getCuisineGradient } from '../../utils/cuisine-image-map.js';

export default function ImageWithFallback({ restaurant, className = '' }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const slug     = getCuisineSlug(restaurant.cuisine);
  const gradient = getCuisineGradient(slug);

  // No image URL or loading failed → show styled placeholder
  if (!restaurant.image_url || failed) {
    return (
      <div
        className={className}
        style={{ background: gradient, borderRadius: 'inherit' }}
        role="img"
        aria-label={`${restaurant.name} — ${restaurant.cuisine[0]} cuisine`}
      />
    );
  }

  return (
    <>
      {/* Skeleton shown while image is loading */}
      {!loaded && (
        <div
          className={`skeleton-shimmer ${className}`}
          style={{ borderRadius: 'inherit', position: 'absolute', inset: 0 }}
        />
      )}
      <img
        src={restaurant.image_url}
        alt={restaurant.name}
        className={`object-cover ${className}`}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </>
  );
}

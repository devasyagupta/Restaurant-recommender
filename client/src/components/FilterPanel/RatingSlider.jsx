import React, { useRef, useState, useCallback, useEffect } from 'react';

export default function RatingSlider({ value, onChange, min = 3.0, max = 5.0, step = 0.1 }) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const percent = ((value - min) / (max - min)) * 100;

  const updateValue = useCallback((clientX) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    const stepped = Math.round(raw / step) * step;
    onChange(parseFloat(stepped.toFixed(1)));
  }, [min, max, step, onChange]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      updateValue(cx);
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, updateValue]);

  return (
    <div className="relative" id="rating-slider">
      <div
        ref={trackRef}
        className="relative w-full h-2 rounded-full cursor-pointer"
        style={{ background: 'var(--surface-3)' }}
        onMouseDown={(e) => { setIsDragging(true); updateValue(e.clientX); }}
        onTouchStart={(e) => { setIsDragging(true); updateValue(e.touches[0].clientX); }}
        role="slider"
        aria-label="Minimum rating"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            onChange(Math.min(max, parseFloat((value + step).toFixed(1))));
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            onChange(Math.max(min, parseFloat((value - step).toFixed(1))));
          }
        }}
      >
        {/* Filled track */}
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, var(--chroma-2), var(--chroma-1))',
          }}
        />

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full shadow-lg"
          style={{
            left: `${percent}%`,
            background: 'var(--chroma-1)',
            border: '2px solid var(--surface-0)',
            boxShadow: '0 0 10px rgba(255, 107, 53, 0.4)',
          }}
        >
          {/* Tooltip */}
          {isDragging && (
            <div
              className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md whitespace-nowrap"
              style={{
                background: 'var(--surface-3)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-primary)',
              }}
            >
              {value.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        <span>{min.toFixed(1)}</span>
        <span
          style={{ color: 'var(--chroma-1)', fontWeight: 500 }}
        >
          {value.toFixed(1)} ★
        </span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}

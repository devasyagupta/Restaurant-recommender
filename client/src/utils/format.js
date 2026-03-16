/**
 * Formatting Utilities
 * Currency, distance, time, and other display helpers.
 */

/**
 * Format distance with units
 */
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Format time in 12-hour format
 */
export function formatTime(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Format operating hours range
 */
export function formatHours(openTime, closeTime) {
  return `${formatTime(openTime)} – ${formatTime(closeTime)}`;
}

/**
 * Get distance category label
 */
export function getDistanceLabel(distance) {
  if (distance === 'near') return '< 2 km';
  if (distance === 'medium') return '2–10 km';
  if (distance === 'far') return '> 10 km';
  return distance;
}

/**
 * Get budget label with symbol
 */
export function getBudgetLabel(budget) {
  const labels = {
    low: '₹ Budget',
    medium: '₹₹ Moderate',
    high: '₹₹₹ Premium',
  };
  return labels[budget] || budget;
}

/**
 * Get meal time icon/label
 */
export function getMealLabel(time) {
  const labels = {
    breakfast: '🌅 Breakfast',
    lunch: '☀️ Lunch',
    dinner: '🌙 Dinner',
  };
  return labels[time] || time;
}

/**
 * Valid areas for the dropdown
 */
export const VALID_AREAS = [
  'CG Road', 'Navrangpura', 'Ellisbridge', 'Paldi', 'Ambawadi',
  'Satellite', 'Vastrapur', 'Bodakdev', 'SG Highway', 'Thaltej',
  'Prahlad Nagar', 'Maninagar', 'Kankaria', 'Bopal', 'South Bopal',
  'Ghuma', 'Shilaj', 'Gota', 'Chandkheda', 'Motera',
  'Sabarmati', 'IIM Road', 'Jodhpur', 'Memnagar',
];

/**
 * Cuisine types for the filter
 */
export const CUISINE_TYPES = [
  'Gujarati', 'Punjabi', 'South Indian', 'Chinese', 'Italian',
  'Mexican', 'Fast Food', 'Cafe', 'Mughlai', 'Continental',
  'Rajasthani', 'Seafood', 'Pizza', 'Street Food', 'Bakery',
];

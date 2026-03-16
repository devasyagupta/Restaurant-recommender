/**
 * Cuisine Image Map
 * Maps each cuisine type to a pool of image filenames and a fallback gradient.
 * See PRD §8.3 for the image strategy.
 */

export const CUISINE_IMAGES = {
  gujarati:      ['thali-1.jpg', 'thali-2.jpg', 'thali-3.jpg', 'thali-4.jpg', 'thali-5.jpg', 'thali-6.jpg'],
  punjabi:       ['tandoor-1.jpg', 'tandoor-2.jpg', 'tandoor-3.jpg', 'tandoor-4.jpg', 'tandoor-5.jpg', 'tandoor-6.jpg'],
  'south-indian':['dosa-1.jpg', 'dosa-2.jpg', 'dosa-3.jpg', 'dosa-4.jpg', 'dosa-5.jpg', 'dosa-6.jpg'],
  chinese:       ['noodles-1.jpg', 'manchurian-1.jpg', 'fried-rice-1.jpg', 'noodles-2.jpg', 'manchurian-2.jpg', 'fried-rice-2.jpg'],
  italian:       ['pasta-1.jpg', 'pasta-2.jpg', 'pasta-3.jpg', 'pasta-4.jpg', 'pasta-5.jpg', 'pasta-6.jpg'],
  mexican:       ['taco-1.jpg', 'taco-2.jpg', 'burrito-1.jpg', 'taco-3.jpg', 'burrito-2.jpg', 'taco-4.jpg'],
  'fast-food':   ['burger-1.jpg', 'burger-2.jpg', 'fries-1.jpg', 'burger-3.jpg', 'fries-2.jpg', 'burger-4.jpg'],
  cafe:          ['coffee-1.jpg', 'pastry-1.jpg', 'brunch-1.jpg', 'coffee-2.jpg', 'pastry-2.jpg', 'brunch-2.jpg'],
  mughlai:       ['biryani-1.jpg', 'kebab-1.jpg', 'biryani-2.jpg', 'kebab-2.jpg', 'biryani-3.jpg', 'kebab-3.jpg'],
  continental:   ['steak-1.jpg', 'salad-1.jpg', 'steak-2.jpg', 'salad-2.jpg', 'steak-3.jpg', 'salad-3.jpg'],
  rajasthani:    ['dal-baati-1.jpg', 'dal-baati-2.jpg', 'thali-r-1.jpg', 'dal-baati-3.jpg', 'thali-r-2.jpg', 'dal-baati-4.jpg'],
  seafood:       ['fish-1.jpg', 'prawns-1.jpg', 'fish-2.jpg', 'prawns-2.jpg', 'fish-3.jpg', 'prawns-3.jpg'],
  pizza:         ['pizza-1.jpg', 'pizza-2.jpg', 'pizza-3.jpg', 'pizza-4.jpg', 'pizza-5.jpg', 'pizza-6.jpg'],
  'street-food': ['chaat-1.jpg', 'pav-bhaji-1.jpg', 'chaat-2.jpg', 'pav-bhaji-2.jpg', 'chaat-3.jpg', 'dabeli-1.jpg'],
  bakery:        ['cake-1.jpg', 'bread-1.jpg', 'cake-2.jpg', 'bread-2.jpg', 'pastry-b-1.jpg', 'pastry-b-2.jpg'],
};

// Fallback gradient per cuisine (for CSS placeholder when image fails to load)
export const CUISINE_GRADIENT = {
  gujarati:       'linear-gradient(135deg, #FF9F43, #F7B731)',
  punjabi:        'linear-gradient(135deg, #E8472A, #C94A8C)',
  'south-indian': 'linear-gradient(135deg, #2ECC71, #27AE60)',
  chinese:        'linear-gradient(135deg, #C0392B, #E74C3C)',
  italian:        'linear-gradient(135deg, #3498DB, #2980B9)',
  mexican:        'linear-gradient(135deg, #E67E22, #D35400)',
  'fast-food':    'linear-gradient(135deg, #F39C12, #E74C3C)',
  cafe:           'linear-gradient(135deg, #8E6E53, #6D4C41)',
  mughlai:        'linear-gradient(135deg, #8E44AD, #9B59B6)',
  continental:    'linear-gradient(135deg, #1ABC9C, #16A085)',
  rajasthani:     'linear-gradient(135deg, #E74C3C, #C0392B)',
  seafood:        'linear-gradient(135deg, #2980B9, #3498DB)',
  pizza:          'linear-gradient(135deg, #E74C3C, #F39C12)',
  'street-food':  'linear-gradient(135deg, #F39C12, #E67E22)',
  bakery:         'linear-gradient(135deg, #D4A373, #BC8A5F)',
};

/**
 * Get the cuisine slug for a restaurant's primary cuisine
 */
export function getCuisineSlug(cuisineArray) {
  if (!cuisineArray || cuisineArray.length === 0) return 'cafe';
  return cuisineArray[0].toLowerCase().replace(/ /g, '-');
}

/**
 * Get the fallback gradient for a cuisine
 */
export function getCuisineGradient(cuisineSlug) {
  return CUISINE_GRADIENT[cuisineSlug] || 'linear-gradient(135deg, #667eea, #764ba2)';
}

/**
 * Get initials from restaurant name (for fallback placeholder)
 */
export function getInitials(name) {
  return name
    .split(' ')
    .filter(w => w.length > 0)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

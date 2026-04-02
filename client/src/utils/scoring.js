/**
 * CLIENT-SIDE SCORING MIRROR
 *
 * Mirror of server/algorithm/recommender.js — present so the complete
 * scoring logic is visible in the frontend codebase for viva examination.
 * In production, all scoring is performed server-side.
 *
 * Keep in sync with the server-side recommender whenever weights change.
 */

// ============== WEIGHTS ==============
// cuisine=0.40 area=0.25 rating=0.15 budget=0.10 diet=0.05 time=0.05
export const WEIGHTS = {
  cuisine: 0.40,
  area:    0.25,
  rating:  0.15,
  budget:  0.10,
  diet:    0.05,
  time:    0.05,
};

// ============== BONUS POINTS ==============
export const BONUSES = {
  exactCuisine: 10,
  exactArea:    5,
  exactBudget:  3,
  openNow:      2,
};

// ============== CUISINE SIMILARITY ==============
export const CUISINE_SIMILARITY_MAP = {
  'Gujarati':     ['Rajasthani', 'Street Food'],
  'Rajasthani':   ['Gujarati', 'Punjabi', 'Street Food'],
  'Punjabi':      ['Mughlai', 'Rajasthani'],
  'Mughlai':      ['Punjabi', 'Continental'],
  'South Indian': ['Street Food', 'Cafe'],
  'Chinese':      ['Street Food', 'Fast Food'],
  'Italian':      ['Continental', 'Cafe', 'Pizza'],
  'Pizza':        ['Italian', 'Fast Food'],
  'Mexican':      ['Continental', 'Fast Food'],
  'Continental':  ['Italian', 'Cafe', 'Mughlai'],
  'Fast Food':    ['Chinese', 'Street Food', 'Pizza'],
  'Cafe':         ['Continental', 'Bakery', 'Italian', 'South Indian'],
  'Bakery':       ['Cafe', 'Street Food'],
  'Street Food':  ['Gujarati', 'Rajasthani', 'Chinese', 'Fast Food', 'South Indian'],
  'Seafood':      ['Continental', 'Mughlai'],
};

// ============== AREA ADJACENCY ==============
export const AREA_ADJACENCY_MAP = {
  'CG Road':       ['Navrangpura', 'Ellisbridge', 'Ambawadi', 'Paldi'],
  'Navrangpura':   ['CG Road', 'Ellisbridge', 'Vastrapur', 'IIM Road'],
  'Ellisbridge':   ['CG Road', 'Navrangpura', 'Paldi', 'Ambawadi'],
  'Paldi':         ['Ellisbridge', 'CG Road', 'Ambawadi', 'Vasna'],
  'Ambawadi':      ['CG Road', 'Paldi', 'Satellite', 'Navrangpura'],
  'Satellite':     ['Vastrapur', 'Bodakdev', 'Ambawadi', 'Jodhpur'],
  'Vastrapur':     ['Satellite', 'Bodakdev', 'Thaltej', 'Navrangpura'],
  'Bodakdev':      ['Vastrapur', 'Satellite', 'Thaltej', 'SG Highway'],
  'SG Highway':    ['Bodakdev', 'Thaltej', 'Prahlad Nagar', 'Satellite'],
  'Thaltej':       ['Vastrapur', 'Bodakdev', 'SG Highway', 'Gota'],
  'Prahlad Nagar': ['SG Highway', 'Bodakdev', 'Satellite', 'South Bopal'],
  'Maninagar':     ['Isanpur', 'Kankaria', 'Ghodasar'],
  'Kankaria':      ['Maninagar', 'Ghodasar', 'Bapunagar'],
  'Bopal':         ['Ghuma', 'South Bopal', 'Shilaj'],
  'South Bopal':   ['Bopal', 'Ghuma', 'Prahlad Nagar'],
  'Ghuma':         ['Bopal', 'South Bopal', 'Shilaj'],
  'Shilaj':        ['Bopal', 'Ghuma', 'Vastrapur'],
  'Gota':          ['Thaltej', 'Chandkheda', 'Motera'],
  'Chandkheda':    ['Gota', 'Motera', 'New CG Road'],
  'Motera':        ['Gota', 'Chandkheda', 'Sabarmati'],
  'Sabarmati':     ['Motera', 'Chandkheda', 'Usmanpura'],
  'IIM Road':      ['Navrangpura', 'Vastrapur', 'Bodakdev'],
  'Jodhpur':       ['Satellite', 'Ambawadi', 'Vastrapur'],
  'Memnagar':      ['Navrangpura', 'Vastrapur', 'IIM Road'],
};

const ZONE_MAP = {
  west:    ['CG Road', 'Navrangpura', 'Ellisbridge', 'Paldi', 'Ambawadi', 'Memnagar', 'IIM Road'],
  central: ['Satellite', 'Vastrapur', 'Bodakdev', 'Jodhpur', 'SG Highway'],
  south:   ['Bopal', 'South Bopal', 'Ghuma', 'Shilaj', 'Prahlad Nagar'],
  east:    ['Maninagar', 'Kankaria'],
  north:   ['Gota', 'Chandkheda', 'Motera', 'Sabarmati', 'Thaltej'],
};

const areaToZone = {};
for (const [zone, areas] of Object.entries(ZONE_MAP)) {
  for (const area of areas) areaToZone[area] = zone;
}

function sameZone(a1, a2) {
  return areaToZone[a1] && areaToZone[a1] === areaToZone[a2];
}

// ============== SCORING FUNCTIONS ==============

export function scoreCuisine(preferred, restaurant) {
  if (!preferred || (Array.isArray(preferred) && preferred.length === 0)) return 1.0;
  const list = Array.isArray(preferred) ? preferred : [preferred];
  for (const p of list) { if (restaurant.cuisine.includes(p)) return 1.0; }
  for (const p of list) {
    const sim = CUISINE_SIMILARITY_MAP[p] || [];
    if (restaurant.cuisine.some(c => sim.includes(c))) return 0.4; // deliberate gap vs 1.0
  }
  return 0.0;
}

export function scoreRating(minRating, restaurant) {
  if (!minRating) return restaurant.rating / 5.0;
  if (restaurant.rating >= minRating) return restaurant.rating / 5.0;
  return Math.max(0, (restaurant.rating - 3.0) / 2.0) * 0.3;
}

export function scoreArea(preferredArea, restaurant) {
  if (!preferredArea) return 1.0;
  if (restaurant.area === preferredArea) return 1.0;
  const adj = AREA_ADJACENCY_MAP[preferredArea] || [];
  if (adj.includes(restaurant.area)) {
    const distKm = restaurant.distance_km || 0;
    const penalty = distKm > 8 ? 0.30 : distKm > 5 ? 0.15 : distKm > 2 ? 0.05 : 0;
    return Math.max(0, 0.7 * (1 - penalty));
  }
  if (sameZone(preferredArea, restaurant.area)) return 0.4;
  return 0.0;
}

export function scoreBudget(preferred, restaurant) {
  if (!preferred) return 1.0;
  const tiers = ['low', 'medium', 'high'];
  const diff = Math.abs(tiers.indexOf(preferred) - tiers.indexOf(restaurant.price_range));
  return [1.0, 0.5, 0.0][diff] ?? 0.0;
}

export function scoreDiet(preferred, restaurant) {
  if (!preferred || preferred === 'any') return 1.0;
  if (restaurant.veg_nonveg === preferred) return 1.0;
  if (restaurant.veg_nonveg === 'both') return 0.8;
  return 0.0;
}

export function scoreTime(visitTime, restaurant) {
  if (!visitTime) return 1.0;
  const flags = {
    breakfast: restaurant.serves_breakfast,
    lunch:     restaurant.serves_lunch,
    dinner:    restaurant.serves_dinner,
  };
  if (flags[visitTime] === true)  return 1.0;
  if (flags[visitTime] === false) return 0.0;
  return 1.0;
}

// ============== DISPLAY LABELS ==============

export const WEIGHT_LABELS = {
  cuisine: 'Cuisine Match',
  area:    'Area Proximity',
  rating:  'Rating Score',
  budget:  'Budget Fit',
  diet:    'Diet Preference',
  time:    'Time Availability',
};

export const BONUS_LABELS = {
  isExactCuisine: 'Exact Cuisine Match',
  isExactArea:    'Exact Area Match',
  isExactBudget:  'Exact Budget Match',
  isOpenNow:      'Open Right Now',
};

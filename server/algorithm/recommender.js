/**
 * AHMEDABAD EATS — CONTENT-BASED RECOMMENDATION ENGINE
 * =====================================================
 * 
 * This module implements Weighted Content-Based Filtering for restaurant
 * recommendations. Content-based filtering was chosen over collaborative
 * filtering for a specific, defensible reason:
 * 
 * Collaborative filtering requires a user-item interaction matrix — a 
 * dataset of many users' past behaviour (ratings, clicks, orders) from
 * which similarity patterns can be extracted. At launch, this system has
 * ZERO user interaction data. There is no history of which users liked
 * which restaurants. Therefore, collaborative filtering would suffer from
 * the cold-start problem and is algorithmically inapplicable.
 * 
 * Content-based filtering, by contrast, requires only two inputs:
 *   1. Item features (restaurant attributes — cuisine, area, rating, etc.)
 *   2. User preferences (stated explicitly via the filter panel)
 * Both are available from the very first interaction, making this the
 * correct algorithmic choice for this deployment context.
 * 
 * The algorithm computes a normalised similarity score between the user's
 * preference vector and each restaurant's feature vector. Each dimension
 * has an assigned weight reflecting its importance in real-world restaurant
 * selection in Ahmedabad.
 * 
 * Final Score = Σ(weight_i × match_i) / Σ(weight_i)
 * All match scores are normalised to [0, 1].
 */

const { CUISINE_SIMILARITY_MAP } = require('./cuisine-map');
const { AREA_ADJACENCY_MAP, sameZone } = require('./area-map');

/**
 * WEIGHT CONFIGURATION
 * 
 * These weights were determined by reasoning about user behaviour in the
 * Ahmedabad dining context, not by machine learning. This is a deliberate
 * choice: hand-tuned weights are fully explainable in a viva, whereas
 * ML-optimised weights would require training data and a validation
 * pipeline that is out of scope for this project.
 */
const WEIGHTS = {
  cuisine: 0.30, // 0.30 — cuisine is the most explicitly stated preference; users typically choose a restaurant category before any other criterion.
  rating:  0.20, // 0.20 — high rating is a proxy for quality; it's the second-most important signal after cuisine type.
  area:    0.20, // 0.20 — distance is a hard constraint in a spread-out city like Ahmedabad where commute time is significant.
  budget:  0.15, // 0.15 — budget matters but is flexible; most users tolerate ±1 price tier for a good restaurant.
  diet:    0.10, // 0.10 — veg/non-veg is a hard constraint for many Gujarati users but binary — once satisfied, it doesn't add further value.
  time:    0.05, // 0.05 — lowest weight because most restaurants are open during common meal times; only penalises truly closed ones.
};

/**
 * CUISINE SCORING
 * 
 * CUISINE_SIMILARITY_MAP encodes which cuisines share enough dishes,
 * cooking techniques, and flavour profiles that a user asking for one
 * would likely enjoy the other. For example, 'Punjabi' and 'Mughlai'
 * share tandoori cooking, heavy cream sauces, and naan-based meals.
 * 
 * Partial matches receive 0.7 instead of 0.0 to avoid penalising users
 * who ask for 'Punjabi' when 'North Indian' or 'Mughlai' would also
 * satisfy them. The value 0.7 (rather than 0.5 or 0.9) reflects "high
 * but not perfect similarity" — the user didn't explicitly ask for this
 * cuisine, but it's a reasonable substitute.
 * 
 * When preferences.cuisine is an array (multi-select), we check if ANY
 * preferred cuisine matches.
 */
function scoreCuisine(preferred, restaurant) {
  if (!preferred || (Array.isArray(preferred) && preferred.length === 0)) return 1.0; // no preference → neutral

  const preferredList = Array.isArray(preferred) ? preferred : [preferred];

  // Check for exact match with any preferred cuisine
  for (const pref of preferredList) {
    if (restaurant.cuisine.includes(pref)) return 1.0;
  }

  // Check for similar cuisine match
  for (const pref of preferredList) {
    const similar = CUISINE_SIMILARITY_MAP[pref] || [];
    if (restaurant.cuisine.some(c => similar.includes(c))) return 0.7;
  }

  return 0.0;
}

/**
 * RATING SCORING
 * 
 * If the restaurant meets or exceeds the user's minimum rating, the score
 * is proportional to the rating (rating/5.0), rewarding higher ratings.
 * If below the minimum, a harsh penalty is applied: the score is compressed
 * to 30% of the normalised distance from the floor (3.0).
 */
function scoreRating(minRating, restaurant) {
  if (!minRating) return restaurant.rating / 5.0;
  if (restaurant.rating >= minRating) {
    return restaurant.rating / 5.0;
  }
  return Math.max(0, (restaurant.rating - 3.0) / 2.0) * 0.3;
}

/**
 * AREA SCORING
 * 
 * AREA_ADJACENCY_MAP was built by hand using geographic knowledge of
 * Ahmedabad rather than using GPS coordinates. The system has no
 * geolocation API, and the adjacency map captures walking and
 * auto-rickshaw practicality better than raw distance. Two areas 3 km
 * apart with the Sabarmati river between them are less "adjacent" than
 * two areas 4 km apart on the same road.
 * 
 * Scoring tiers:
 *   1.0 — exact area match
 *   0.6 — adjacent area (reachable by short auto-rickshaw ride)
 *   0.3 — same zone (same part of the city)
 *   0.0 — different zone entirely
 */
function scoreArea(preferredArea, restaurant) {
  if (!preferredArea) return 1.0;
  if (restaurant.area === preferredArea) return 1.0;
  const adjacent = AREA_ADJACENCY_MAP[preferredArea] || [];
  if (adjacent.includes(restaurant.area)) return 0.6;
  if (sameZone(preferredArea, restaurant.area)) return 0.3;
  return 0.0;
}

/**
 * BUDGET SCORING
 * 
 * Uses tier-based comparison: exact match = 1.0, one tier off = 0.5,
 * two tiers off = 0.0. This reflects that most users tolerate ±1 tier
 * (e.g. someone on a medium budget will consider low-priced or high-priced
 * if the restaurant is good enough), but a 2-tier gap is too far.
 */
function scoreBudget(preferred, restaurant) {
  if (!preferred) return 1.0;
  const tiers = ['low', 'medium', 'high'];
  const diff = Math.abs(tiers.indexOf(preferred) - tiers.indexOf(restaurant.price_range));
  return [1.0, 0.5, 0.0][diff] ?? 0.0;
}

/**
 * DIET SCORING
 * 
 * Veg/non-veg is often a hard constraint in Ahmedabad due to the large
 * Jain and Gujarati vegetarian population. A hard mismatch (veg user +
 * non-veg-only restaurant) scores 0.0 with no middle ground.
 * Restaurants serving 'both' get 0.8 — slightly penalised because a
 * strict vegetarian may prefer a fully veg establishment.
 */
function scoreDiet(preferred, restaurant) {
  if (!preferred || preferred === 'any') return 1.0;
  if (restaurant.veg_nonveg === preferred) return 1.0;
  if (restaurant.veg_nonveg === 'both') return 0.8;
  return 0.0;
}

/**
 * TIME SCORING
 * 
 * Checks if the restaurant is open during the user's intended meal window.
 * Returns 1.0 if fully open, 0.5 if the restaurant closes within 30 minutes
 * of the window end (risky but possible), and 0.0 if the restaurant is
 * closed during the requested window.
 */
function scoreTime(visitTime, restaurant) {
  if (!visitTime) return 1.0;

  // Meal-specific flag check
  const mealFlags = {
    breakfast: restaurant.serves_breakfast,
    lunch:     restaurant.serves_lunch,
    dinner:    restaurant.serves_dinner,
  };

  if (mealFlags[visitTime] === true) return 1.0;
  if (mealFlags[visitTime] === false) return 0.0;

  // Fallback: check opening hours against meal windows
  const mealWindows = {
    breakfast: { start: 7, end: 11 },
    lunch:     { start: 12, end: 15 },
    dinner:    { start: 19, end: 22 },
  };

  const window = mealWindows[visitTime];
  if (!window) return 1.0;

  const openHour = parseInt(restaurant.opening_time.split(':')[0], 10);
  const closeHour = parseInt(restaurant.closing_time.split(':')[0], 10);

  if (openHour <= window.start && closeHour >= window.end) return 1.0;
  if (openHour <= window.start && closeHour >= window.end - 0.5) return 0.5;
  return 0.0;
}

/**
 * REASON STRING GENERATION
 * 
 * Selects the three highest-weighted dimensions where the score > 0.5
 * and constructs a natural-language explanation. Uses bullet separator •.
 */
function buildReason(scores, restaurant) {
  const reasons = [];

  if (scores.cuisine >= 0.7) {
    const cuisineText = restaurant.cuisine.slice(0, 2).join(', ');
    if (scores.cuisine === 1.0) {
      reasons.push(`Serves your preferred ${cuisineText} cuisine`);
    } else {
      reasons.push(`Offers similar ${cuisineText} cuisine`);
    }
  }

  if (scores.area >= 0.6) {
    if (scores.area === 1.0) {
      reasons.push(`Located in ${restaurant.area}, your preferred area`);
    } else {
      reasons.push(`Nearby in ${restaurant.area}`);
    }
  }

  if (scores.rating >= 0.7) {
    reasons.push(`Well rated at ${restaurant.rating}★`);
  }

  if (scores.budget >= 0.8) {
    reasons.push(`Budget-friendly at ${restaurant.price_symbol} range`);
  }

  if (scores.diet >= 0.8) {
    const dietText = restaurant.veg_nonveg === 'veg' ? 'Fully vegetarian' :
                     restaurant.veg_nonveg === 'both' ? 'Serves both veg and non-veg' :
                     'Non-vegetarian options available';
    reasons.push(`${dietText} as you prefer`);
  }

  if (scores.time >= 0.8) {
    reasons.push(`Open during your visit window`);
  }

  // Ensure at least 2 reasons
  if (reasons.length < 2) {
    if (!reasons.some(r => r.includes('rated'))) {
      reasons.push(`Rated ${restaurant.rating}★ — one of the top restaurants in Ahmedabad`);
    }
    if (!reasons.some(r => r.includes(restaurant.area))) {
      reasons.push(`Located in ${restaurant.area}`);
    }
  }

  return reasons.slice(0, 3).join(' • ');
}

/**
 * MAIN RECOMMENDATION FUNCTION
 * 
 * Scores all restaurants against user preferences and returns the top 5.
 * 
 * NORMALISATION: The final score is computed as:
 *   normalisedScore = (Σ(weight_i × match_i) / Σ(weight_i)) × 100
 * 
 * Dividing by the sum of weights (which equals 1.0 when all filters are
 * active) ensures the score is always in [0, 100] regardless of which
 * filters the user has set. If a user omits a filter, that dimension
 * returns 1.0 (neutral), so the normalisation remains consistent.
 */
function recommend(preferences, restaurants) {
  const scored = restaurants.map(r => {
    const scores = {
      cuisine: scoreCuisine(preferences.cuisine, r),
      rating:  scoreRating(preferences.minRating, r),
      area:    scoreArea(preferences.area, r),
      budget:  scoreBudget(preferences.budget, r),
      diet:    scoreDiet(preferences.diet, r),
      time:    scoreTime(preferences.visitTime, r),
    };

    // Normalisation: divide by sum of weights to ensure score is always in [0, 1]
    const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    const rawScore = Object.entries(scores)
      .reduce((sum, [k, v]) => sum + WEIGHTS[k] * v, 0);
    const normScore = (rawScore / totalWeight) * 100;

    return {
      ...r,
      scores,
      score: parseFloat(normScore.toFixed(1)),
      matchPct: normScore.toFixed(1) + '% Match',
      reason: buildReason(scores, r),
    };
  });

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

module.exports = {
  WEIGHTS,
  scoreCuisine,
  scoreRating,
  scoreArea,
  scoreBudget,
  scoreDiet,
  scoreTime,
  buildReason,
  recommend,
};

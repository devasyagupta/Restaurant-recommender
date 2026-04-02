/**
 * AHMEDABAD EATS — CONTENT-BASED RECOMMENDATION ENGINE
 * =====================================================
 *
 * Two-phase pipeline:
 *   Phase 1 — Hard Filtering  : removes restaurants that clearly violate
 *             hard constraints (diet, rating, time are always enforced;
 *             cuisine, budget, area use progressive fallback so ≥5 results).
 *   Phase 2 — Weighted Scoring: computes a normalised similarity score,
 *             adds bonus points for exact matches, then sorts with a
 *             tiebreaker chain so the best match always comes first.
 *
 * Final Score = (Σ weight_i × match_i / Σ weight_i) × 100 + bonusPoints
 * All dimension scores are normalised to [0, 1].
 *
 * Single public API: getTopRecommendations(preferences, restaurants)
 * (aliased as 'recommend' for backward compatibility)
 */

const { CUISINE_SIMILARITY_MAP } = require('./cuisine-map');
const { AREA_ADJACENCY_MAP, sameZone } = require('./area-map');

// ─────────────────────────────────────────────────────────────────────────────
// WEIGHT CONFIGURATION
// Rebalanced so every filter contributes meaningfully.
// ─────────────────────────────────────────────────────────────────────────────
const WEIGHTS = {
  cuisine: 0.40, // 0.40 — highest weight; selected cuisine is the primary intent signal
  area:    0.25, // Real constraint in a spread-out city like Ahmedabad
  rating:  0.15, // Quality proxy
  budget:  0.10, // Flexible ± 1 tier
  diet:    0.05, // Binary once satisfied; less informative beyond the hard filter
  time:    0.05, // Most restaurants open across meal times; low informational gain
};

const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

// Bonus points added after normalisation (on top of the 0–100 range)
const BONUSES = {
  exactCuisine: 10, // Raised: exact cuisine is the strongest signal — must always outrank similar
  exactArea:    5,
  exactBudget:  3,
  openNow:      2,
};

// Minimum pool size before a soft filter is relaxed
const MIN_POOL = 5;

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — HARD FILTERING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * hardFilter — removes restaurants that clearly do not satisfy the user's
 * constraints, while keeping at least MIN_POOL results.
 *
 * Priority order:
 *   1. Diet       — always enforced (zero tolerance)
 *   2. Rating     — always enforced
 *   3. Time       — enforced if ≥ MIN_POOL remain after filter
 *   4. Cuisine    — soft: applied only if ≥ MIN_POOL match
 *   5. Budget     — soft: allow exact ± 1 tier, applied only if ≥ MIN_POOL match
 *   6. Area       — progressive fallback: exact → adjacent → zone → all
 */
function hardFilter(preferences, restaurants) {
  let pool = [...restaurants];

  // 1. DIET — zero tolerance
  if (preferences.diet && preferences.diet !== 'any') {
    if (preferences.diet === 'veg') {
      pool = pool.filter(r => r.veg_nonveg === 'veg' || r.veg_nonveg === 'both');
    } else if (preferences.diet === 'nonveg') {
      pool = pool.filter(r => r.veg_nonveg === 'nonveg' || r.veg_nonveg === 'both');
    }
    // 'both' → allow everything
  }

  // 2. RATING — always enforced
  if (preferences.minRating) {
    pool = pool.filter(r => r.rating >= preferences.minRating);
  }

  // 3. TIME — only remove restaurants explicitly marked as closed
  if (preferences.visitTime) {
    const flag = `serves_${preferences.visitTime}`;
    const timed = pool.filter(r => r[flag] !== false);
    if (timed.length >= MIN_POOL) pool = timed;
  }

  // 4. CUISINE — exact-first two-tier filter
  //    If ≥ MIN_POOL restaurants match the exact cuisine, use ONLY those.
  //    Only fall back to similar cuisines when exact matches are too few.
  //    A restaurant without the selected cuisine must never outrank one with it.
  if (preferences.cuisine && preferences.cuisine.length > 0) {
    const preferredList = preferences.cuisine;

    // Tier A: exact matches only
    const exactMatches = pool.filter(r =>
      preferredList.some(pref => r.cuisine.includes(pref))
    );

    if (exactMatches.length >= MIN_POOL) {
      // Sufficient exact matches — do not include similar cuisines at all
      pool = exactMatches;
    } else {
      // Too few exact matches — widen to include similar cuisines as fallback
      const withSimilar = pool.filter(r => {
        if (preferredList.some(pref => r.cuisine.includes(pref))) return true;
        return preferredList.some(pref => {
          const sim = CUISINE_SIMILARITY_MAP[pref] || [];
          return r.cuisine.some(c => sim.includes(c));
        });
      });
      if (withSimilar.length >= MIN_POOL) pool = withSimilar;
    }
  }

  // 5. BUDGET — soft filter (allow exact or ±1 tier)
  if (preferences.budget) {
    const tiers = ['low', 'medium', 'high'];
    const budgetFiltered = pool.filter(r => {
      const diff = Math.abs(
        tiers.indexOf(preferences.budget) - tiers.indexOf(r.price_range)
      );
      return diff <= 1;
    });
    if (budgetFiltered.length >= MIN_POOL) pool = budgetFiltered;
  }

  // 6. AREA — progressive fallback
  if (preferences.area) {
    // Tier 1: exact area only
    const exact = pool.filter(r => r.area === preferences.area);
    if (exact.length >= MIN_POOL) return exact;

    // Tier 2: exact + adjacent areas
    const adjacent = AREA_ADJACENCY_MAP[preferences.area] || [];
    const adjPool = pool.filter(
      r => r.area === preferences.area || adjacent.includes(r.area)
    );
    if (adjPool.length >= MIN_POOL) return adjPool;

    // Tier 3: exact + adjacent + same zone
    const zonePool = pool.filter(
      r =>
        r.area === preferences.area ||
        adjacent.includes(r.area) ||
        sameZone(preferences.area, r.area)
    );
    if (zonePool.length >= MIN_POOL) return zonePool;

    // Tier 4: full remaining pool (area score will penalise distant restaurants)
  }

  return pool;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — SCORING FUNCTIONS
// Each function returns a plain [0,1] number for the scores object.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CUISINE SCORING
 * Exact match = 1.0, similar cuisine from CUISINE_SIMILARITY_MAP = 0.7, else 0.
 */
function scoreCuisine(preferred, restaurant) {
  if (!preferred || (Array.isArray(preferred) && preferred.length === 0)) return 1.0;

  const list = Array.isArray(preferred) ? preferred : [preferred];

  // Exact match — maximum score
  for (const p of list) {
    if (restaurant.cuisine.includes(p)) return 1.0;
  }

  // Similar match — deliberately low (0.4) so exact cuisines always outscore
  // similar-only restaurants even after weighting and bonuses.
  for (const p of list) {
    const sim = CUISINE_SIMILARITY_MAP[p] || [];
    if (restaurant.cuisine.some(c => sim.includes(c))) return 0.4;
  }
  return 0.0;
}

/**
 * RATING SCORING
 * Meets/exceeds minRating → proportional (rating/5.0).
 * Below minRating → harshly compressed (hard filter should have removed these,
 * but this acts as a safety net for edge cases).
 */
function scoreRating(minRating, restaurant) {
  if (!minRating) return restaurant.rating / 5.0;
  if (restaurant.rating >= minRating) return restaurant.rating / 5.0;
  return Math.max(0, (restaurant.rating - 3.0) / 2.0) * 0.3;
}

/**
 * AREA SCORING
 *
 * Tier scores:
 *   1.0 — exact area match
 *   0.7 — adjacent area (short auto-rickshaw ride, ~2–4 km)
 *   0.4 — same zone (same part of the city)
 *   0.0 — different zone entirely
 *
 * Distance penalty applied on top of tier score:
 *   0–2 km  → no penalty
 *   2–5 km  → –5%
 *   5–8 km  → –15%
 *   8+ km   → –30%
 */
function scoreArea(preferredArea, restaurant) {
  if (!preferredArea) return 1.0;
  if (restaurant.area === preferredArea) return 1.0;

  const adjacent = AREA_ADJACENCY_MAP[preferredArea] || [];
  let tierScore;

  if (adjacent.includes(restaurant.area)) {
    tierScore = 0.7;
  } else if (sameZone(preferredArea, restaurant.area)) {
    tierScore = 0.4;
  } else {
    return 0.0;
  }

  // Distance penalty using the restaurant's stored distance_km
  const distKm = restaurant.distance_km || 0;
  const penalty =
    distKm > 8 ? 0.30 :
    distKm > 5 ? 0.15 :
    distKm > 2 ? 0.05 : 0;

  return Math.max(0, tierScore * (1 - penalty));
}

/**
 * BUDGET SCORING
 * Exact = 1.0, ±1 tier = 0.5, ±2 tiers = 0.
 */
function scoreBudget(preferred, restaurant) {
  if (!preferred) return 1.0;
  const tiers = ['low', 'medium', 'high'];
  const diff = Math.abs(tiers.indexOf(preferred) - tiers.indexOf(restaurant.price_range));
  return [1.0, 0.5, 0.0][diff] ?? 0.0;
}

/**
 * DIET SCORING
 * Exact match = 1.0, restaurant serves 'both' = 0.8, hard mismatch = 0.
 */
function scoreDiet(preferred, restaurant) {
  if (!preferred || preferred === 'any') return 1.0;
  if (restaurant.veg_nonveg === preferred) return 1.0;
  if (restaurant.veg_nonveg === 'both') return 0.8;
  return 0.0;
}

/**
 * TIME SCORING
 * 1.0 if restaurant serves the meal type, 0.5 if uncertain, 0.0 if closed.
 */
function scoreTime(visitTime, restaurant) {
  if (!visitTime) return 1.0;

  const mealFlags = {
    breakfast: restaurant.serves_breakfast,
    lunch:     restaurant.serves_lunch,
    dinner:    restaurant.serves_dinner,
  };

  if (mealFlags[visitTime] === true)  return 1.0;
  if (mealFlags[visitTime] === false) return 0.0;

  // Fallback: check hours against meal window
  const windows = {
    breakfast: { start: 7, end: 11 },
    lunch:     { start: 12, end: 15 },
    dinner:    { start: 19, end: 22 },
  };
  const w = windows[visitTime];
  if (!w || !restaurant.opening_time || !restaurant.closing_time) return 1.0;

  const open  = parseInt(restaurant.opening_time.split(':')[0], 10);
  const close = parseInt(restaurant.closing_time.split(':')[0], 10);

  if (open <= w.start && close >= w.end)       return 1.0;
  if (open <= w.start && close >= w.end - 0.5) return 0.5;
  return 0.0;
}

// ─────────────────────────────────────────────────────────────────────────────
// REASON / EXPLANATION BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildReason — short bullet string used in the card's 'reason' field.
 * Kept for backward compatibility with RestaurantCard.
 */
function buildReason(scores, restaurant) {
  const reasons = [];

  if (scores.cuisine >= 0.7) {
    const ct = restaurant.cuisine.slice(0, 2).join(', ');
    reasons.push(scores.cuisine === 1.0
      ? `Serves your preferred ${ct} cuisine`
      : `Offers similar ${ct} cuisine`
    );
  }
  if (scores.area >= 0.7) {
    reasons.push(scores.area === 1.0
      ? `Located in ${restaurant.area}, your preferred area`
      : `Nearby in ${restaurant.area}`
    );
  }
  if (scores.rating >= 0.7) {
    reasons.push(`Well rated at ${restaurant.rating}★`);
  }
  if (scores.budget >= 0.8) {
    reasons.push(`Budget-friendly at ${restaurant.price_symbol} range`);
  }
  if (scores.diet >= 0.8) {
    const dt = restaurant.veg_nonveg === 'veg' ? 'Fully vegetarian' :
               restaurant.veg_nonveg === 'both' ? 'Serves both veg and non-veg' :
               'Non-vegetarian options available';
    reasons.push(`${dt} as you prefer`);
  }

  if (reasons.length < 2) {
    if (!reasons.some(r => r.includes('rated')))
      reasons.push(`Rated ${restaurant.rating}★`);
    if (!reasons.some(r => r.includes(restaurant.area)))
      reasons.push(`Located in ${restaurant.area}`);
  }

  return reasons.slice(0, 3).join(' • ');
}

/**
 * buildReasonSummary — full sentence used in the explanation panel.
 */
function buildReasonSummary(scores, bonusFlags, restaurant, preferences) {
  const parts = [];

  if (scores.cuisine >= 0.7) {
    const ct = restaurant.cuisine.slice(0, 2).join(' & ');
    parts.push(scores.cuisine === 1.0
      ? `exactly matches your ${ct} cuisine preference`
      : `offers similar ${ct} cuisine`
    );
  }
  if (scores.area > 0) {
    if (bonusFlags.isExactArea) {
      parts.push(`is in ${restaurant.area}, your selected area`);
    } else if (scores.area >= 0.6) {
      parts.push(`is nearby in ${restaurant.area}`);
    } else {
      parts.push(`is in ${restaurant.area}`);
    }
  }
  if (preferences.diet && preferences.diet !== 'any' && scores.diet >= 0.8) {
    const dt = restaurant.veg_nonveg === 'veg' ? 'fully vegetarian' :
               restaurant.veg_nonveg === 'nonveg' ? 'non-vegetarian' :
               'serves veg & non-veg';
    parts.push(dt);
  }
  if (bonusFlags.isExactBudget) {
    parts.push(`fits your ${preferences.budget} budget exactly`);
  }
  if (restaurant.rating >= 4.0) {
    parts.push(`highly rated at ${restaurant.rating}★`);
  }
  if (bonusFlags.isOpenNow) {
    parts.push(`is open right now`);
  }

  if (parts.length === 0) {
    return `Rated ${restaurant.rating}★ in ${restaurant.area}.`;
  }
  const [first, ...rest] = parts;
  const cap = first.charAt(0).toUpperCase() + first.slice(1);
  return rest.length === 0
    ? `Recommended because it ${cap}.`
    : `Recommended because it ${cap}, ${rest.join(', ')}.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RECOMMENDATION FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getTopRecommendations(preferences, restaurants) → top 5 matches
 *
 * Each result is augmented with:
 *   scores    — { cuisine, area, rating, budget, diet, time } all ∈ [0,1]
 *   breakdown — { cuisineScore, areaScore, ratingScore, budgetScore,
 *                 dietScore, timeScore, bonusPoints, bonuses,
 *                 finalScore, reasonSummary }
 *   score     — finalScore (0–115 scale, normalised + bonuses)
 *   matchPct  — display string
 *   reason    — short bullet string (legacy)
 */
function getTopRecommendations(preferences, restaurants) {
  // Phase 1: Hard filter
  const pool = hardFilter(preferences, restaurants);

  // Phase 2: Score every restaurant in the pool
  const scored = pool.map(r => {
    const scores = {
      cuisine: scoreCuisine(preferences.cuisine, r),
      area:    scoreArea(preferences.area, r),
      rating:  scoreRating(preferences.minRating, r),
      budget:  scoreBudget(preferences.budget, r),
      diet:    scoreDiet(preferences.diet, r),
      time:    scoreTime(preferences.visitTime, r),
    };

    // Bonus flags
    const isExactCuisine =
      scores.cuisine === 1.0 &&
      !!(preferences.cuisine && preferences.cuisine.length > 0);
    const isExactArea   = !!preferences.area && r.area === preferences.area;
    const isExactBudget = !!preferences.budget && r.price_range === preferences.budget;
    const isOpenNow = (() => {
      if (!r.opening_time || !r.closing_time) return false;
      const now = new Date();
      const h   = now.getHours() + now.getMinutes() / 60;
      const open  = parseInt(r.opening_time.split(':')[0], 10);
      const close = parseInt(r.closing_time.split(':')[0], 10);
      return h >= open && h <= close;
    })();

    const bonusPoints =
      (isExactCuisine ? BONUSES.exactCuisine : 0) +
      (isExactArea    ? BONUSES.exactArea    : 0) +
      (isExactBudget  ? BONUSES.exactBudget  : 0) +
      (isOpenNow      ? BONUSES.openNow      : 0);

    const rawScore = Object.entries(scores)
      .reduce((sum, [k, v]) => sum + WEIGHTS[k] * v, 0);
    const normScore  = (rawScore / TOTAL_WEIGHT) * 100;
    const finalScore = parseFloat((normScore + bonusPoints).toFixed(1));

    const bonuses = { isExactCuisine, isExactArea, isExactBudget, isOpenNow };
    const reasonSummary = buildReasonSummary(scores, bonuses, r, preferences);

    const breakdown = {
      cuisineScore: parseFloat(scores.cuisine.toFixed(3)),
      areaScore:    parseFloat(scores.area.toFixed(3)),
      ratingScore:  parseFloat(scores.rating.toFixed(3)),
      budgetScore:  parseFloat(scores.budget.toFixed(3)),
      dietScore:    parseFloat(scores.diet.toFixed(3)),
      timeScore:    parseFloat(scores.time.toFixed(3)),
      bonusPoints,
      bonuses,
      finalScore,
      reasonSummary,
    };

    return {
      ...r,
      scores,
      breakdown,
      score:    finalScore,
      matchPct: finalScore.toFixed(1) + '% Match',
      reason:   buildReason(scores, r),
    };
  });

  // Phase 3: Sort descending by finalScore with tiebreakers
  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => {
      const diff = b.score - a.score;
      if (Math.abs(diff) > 0.1) return diff;
      // 1. Exact area   2. Exact cuisine   3. Higher rating   4. Shorter distance
      const ba = b.breakdown.bonuses;
      const aa = a.breakdown.bonuses;
      if (ba.isExactArea    !== aa.isExactArea)    return (ba.isExactArea    ? 1 : 0) - (aa.isExactArea    ? 1 : 0);
      if (ba.isExactCuisine !== aa.isExactCuisine) return (ba.isExactCuisine ? 1 : 0) - (aa.isExactCuisine ? 1 : 0);
      if (b.rating !== a.rating) return b.rating - a.rating;
      return (a.distance_km || 0) - (b.distance_km || 0);
    })
    .slice(0, 5);
}

// Backward-compat alias
const recommend = getTopRecommendations;

module.exports = {
  WEIGHTS,
  BONUSES,
  scoreCuisine,
  scoreRating,
  scoreArea,
  scoreBudget,
  scoreDiet,
  scoreTime,
  hardFilter,
  buildReason,
  buildReasonSummary,
  getTopRecommendations,
  recommend,
};

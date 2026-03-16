/**
 * AHMEDABAD EATS — EXPRESS API SERVER
 * 
 * This server provides a single API endpoint for the restaurant
 * recommendation engine. The dataset is loaded once at startup
 * into memory for fast scoring (~50ms for 250 entries).
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { recommend } = require('./algorithm/recommender');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load dataset once at startup
let restaurants = [];
try {
  const dataPath = path.join(__dirname, 'data', 'restaurants.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  restaurants = JSON.parse(rawData);
  console.log(`✓ Loaded ${restaurants.length} restaurants from dataset`);
} catch (err) {
  console.error('✗ Failed to load restaurant dataset:', err.message);
}

/**
 * POST /api/recommend
 * 
 * Accepts user preferences and returns top 5 matching restaurants.
 * See PRD §10 for the full API contract.
 */
app.post('/api/recommend', (req, res) => {
  // If dataset failed to load, return 503
  if (restaurants.length === 0) {
    return res.status(503).json({
      error: 'Restaurant dataset is not available',
      code: 'DATASET_UNAVAILABLE',
    });
  }

  const preferences = req.body;

  // Validate required field: area
  if (!preferences.area) {
    return res.status(400).json({
      error: 'Area is required',
      code: 'MISSING_AREA',
    });
  }

  try {
    const startTime = Date.now();
    const results = recommend(preferences, restaurants);
    const elapsed = Date.now() - startTime;

    console.log(`[API] Recommend: area=${preferences.area}, cuisine=${preferences.cuisine}, results=${results.length}, time=${elapsed}ms`);

    res.json({
      results,
      meta: {
        totalScored: restaurants.length,
        timestamp: new Date().toISOString(),
        responseTimeMs: elapsed,
        preferences,
      },
    });
  } catch (err) {
    console.error('[API] Error in recommendation:', err);
    res.status(500).json({
      error: 'Internal server error during recommendation',
      code: 'INTERNAL_ERROR',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    restaurants: restaurants.length,
    uptime: process.uptime(),
  });
});

app.listen(PORT, () => {
  console.log(`\n🍽  Ahmedabad Eats API Server`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Dataset: ${restaurants.length} restaurants\n`);
});

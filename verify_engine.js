const { getTopRecommendations, WEIGHTS, BONUSES } = require('./server/algorithm/recommender');
const restaurants = require('./server/data/restaurants.json');

console.log('--- RECOMMENDATION ENGINE VERIFICATION ---');
console.log('Final Weights:', WEIGHTS);
console.log('Final Bonuses:', BONUSES);

function testSouthIndianPriority() {
  console.log('\n--- TEST: SOUTH INDIAN PRIORITY (Rule: Exact > Similar) ---');
  const prefs = { area: 'Navrangpura', cuisine: ['South Indian'], diet: 'any' };
  const results = getTopRecommendations(prefs, restaurants);

  const exactMatches = results.filter(r => r.cuisine.includes('South Indian'));
  const similarMatches = results.filter(r => !r.cuisine.includes('South Indian'));

  console.log(`Top 5 results:`);
  results.forEach((r, i) => {
    const tag = r.cuisine.includes('South Indian') ? '[EXACT]  ' : '[SIMILAR]';
    console.log(`${i + 1}. ${tag} ${r.name} | Cuisine: ${r.cuisine.join(', ')} | Score: ${r.score}`);
  });

  // Verify rank order: No similar match should be above an exact match
  let failed = false;
  let firstSimilar = results.findIndex(r => !r.cuisine.includes('South Indian'));
  if (firstSimilar !== -1) {
    for (let i = firstSimilar + 1; i < results.length; i++) {
        if (results[i].cuisine.includes('South Indian')) {
            failed = true;
            console.log(`❌ FAIL: Exact match "${results[i].name}" is below similar match "${results[firstSimilar].name}"`);
            break;
        }
    }
  }

  if (!failed) {
    console.log('✅ PASS: Rank order is correct (Exact > Similar).');
  }
}

function testHardFilters() {
  console.log('\n--- TEST: HARD FILTERS ---');
  
  // Veg Filter
  const vegPrefs = { area: 'CG Road', diet: 'veg' };
  const vegResults = getTopRecommendations(vegPrefs, restaurants);
  const vegViolation = vegResults.find(r => r.veg_nonveg === 'nonveg');
  if (vegViolation) {
    console.log(`❌ FAIL: Non-veg restaurant found in veg filter: ${vegViolation.name}`);
  } else {
    console.log('✅ PASS: Veg filter respected.');
  }

  // Rating Filter
  const ratingPrefs = { area: 'Satellite', minRating: 4.5 };
  const ratingResults = getTopRecommendations(ratingPrefs, restaurants);
  const ratingViolation = ratingResults.find(r => r.rating < 4.5);
  if (ratingViolation) {
    console.log(`❌ FAIL: Restaurant below 4.5 rating found: ${ratingViolation.name} (${ratingViolation.rating})`);
  } else {
    console.log('✅ PASS: Rating filter respected.');
  }
}

function testBreakdown() {
  console.log('\n--- TEST: EXPLAINABILITY BREAKDOWN ---');
  const prefs = { area: 'Navrangpura', cuisine: ['Punjabi'], budget: 'medium' };
  const results = getTopRecommendations(prefs, restaurants);
  const r = results[0];

  if (r && r.breakdown) {
    console.log(`Checking breakdown for ${r.name}:`);
    console.log(`Reason: ${r.breakdown.reasonSummary}`);
    console.log(`Final Score: ${r.breakdown.finalScore}`);
    
    const requiredKeys = ['cuisineScore', 'areaScore', 'ratingScore', 'budgetScore', 'dietScore', 'timeScore', 'bonusPoints', 'finalScore', 'reasonSummary'];
    const missing = requiredKeys.filter(k => !(k in r.breakdown));
    if (missing.length > 0) {
      console.log(`❌ FAIL: Missing keys in breakdown: ${missing.join(', ')}`);
    } else {
      console.log('✅ PASS: Breakdown object is complete.');
    }
  } else {
    console.log('❌ FAIL: No breakdown object found.');
  }
}

testSouthIndianPriority();
testHardFilters();
testBreakdown();

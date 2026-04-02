/**
 * CUISINE SIMILARITY MAP
 *
 * Maps each cuisine type to an array of related cuisines that receive
 * a partial match score (0.7) rather than a full mismatch (0.0).
 *
 * All bidirectional pairs are declared explicitly so A→B and B→A both work.
 * Required pairs:
 *   Punjabi ↔ Mughlai, Chinese ↔ Fast Food, Italian ↔ Pizza,
 *   Cafe ↔ Bakery, Gujarati ↔ Rajasthani, South Indian ↔ Street Food
 */

const CUISINE_SIMILARITY_MAP = {
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

module.exports = { CUISINE_SIMILARITY_MAP };

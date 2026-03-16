/**
 * CUISINE SIMILARITY MAP
 * 
 * Maps each cuisine type to an array of related cuisines that should receive
 * a partial match score (0.7) rather than a full mismatch (0.0).
 * 
 * This avoids penalising users who ask for 'Punjabi' when 'North Indian'
 * would also satisfy them — these cuisines share dishes, cooking techniques,
 * and flavour profiles. The partial match of 0.7 reflects high but not
 * perfect similarity.
 */

const CUISINE_SIMILARITY_MAP = {
  'Gujarati':     ['Rajasthani', 'Street Food'],
  'Rajasthani':   ['Gujarati', 'Punjabi'],
  'Punjabi':      ['Mughlai', 'Rajasthani'],
  'Mughlai':      ['Punjabi', 'Continental'],
  'South Indian': ['Street Food', 'Cafe'],
  'Chinese':      ['Street Food', 'Fast Food'],
  'Italian':      ['Continental', 'Cafe', 'Pizza'],
  'Pizza':        ['Italian', 'Fast Food'],
  'Mexican':      ['Continental', 'Fast Food'],
  'Continental':  ['Italian', 'Cafe'],
  'Fast Food':    ['Chinese', 'Street Food', 'Pizza'],
  'Cafe':         ['Continental', 'Bakery', 'Italian'],
  'Bakery':       ['Cafe', 'Street Food'],
  'Street Food':  ['Gujarati', 'Chinese', 'Fast Food'],
  'Seafood':      ['Continental', 'Mughlai'],
};

module.exports = { CUISINE_SIMILARITY_MAP };

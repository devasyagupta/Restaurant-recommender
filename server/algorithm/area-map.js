/**
 * AREA ADJACENCY MAP — Ahmedabad Geography
 * 
 * This map was built by hand using geographic knowledge of Ahmedabad rather
 * than using GPS coordinates. The reason is that this system has no geolocation
 * API, and the adjacency map captures walking and auto-rickshaw practicality
 * better than raw Euclidean distance. Two areas 3 km apart with a river between
 * them are less "adjacent" than two areas 4 km apart on the same road.
 * 
 * Each area maps to an array of areas that are practically reachable within
 * a short commute (~2-4 km by auto-rickshaw). This is used by scoreArea
 * to assign 0.6 to restaurants in adjacent areas.
 */

const AREA_ADJACENCY_MAP = {
  'CG Road': ['Navrangpura', 'Ellisbridge', 'Ambawadi', 'Paldi'],
  'Navrangpura': ['CG Road', 'Ellisbridge', 'Vastrapur', 'IIM Road'],
  'Ellisbridge': ['CG Road', 'Navrangpura', 'Paldi', 'Ambawadi'],
  'Paldi': ['Ellisbridge', 'CG Road', 'Ambawadi', 'Vasna'],
  'Ambawadi': ['CG Road', 'Paldi', 'Satellite', 'Navrangpura'],
  'Satellite': ['Vastrapur', 'Bodakdev', 'Ambawadi', 'Jodhpur'],
  'Vastrapur': ['Satellite', 'Bodakdev', 'Thaltej', 'Navrangpura'],
  'Bodakdev': ['Vastrapur', 'Satellite', 'Thaltej', 'SG Highway'],
  'SG Highway': ['Bodakdev', 'Thaltej', 'Prahlad Nagar', 'Satellite'],
  'Thaltej': ['Vastrapur', 'Bodakdev', 'SG Highway', 'Gota'],
  'Prahlad Nagar': ['SG Highway', 'Bodakdev', 'Satellite', 'South Bopal'],
  'Maninagar': ['Isanpur', 'Kankaria', 'Ghodasar'],
  'Kankaria': ['Maninagar', 'Ghodasar', 'Bapunagar'],
  'Bopal': ['Ghuma', 'South Bopal', 'Shilaj'],
  'South Bopal': ['Bopal', 'Ghuma', 'Prahlad Nagar'],
  'Ghuma': ['Bopal', 'South Bopal', 'Shilaj'],
  'Shilaj': ['Bopal', 'Ghuma', 'Vastrapur'],
  'Gota': ['Thaltej', 'Chandkheda', 'Motera'],
  'Chandkheda': ['Gota', 'Motera', 'New CG Road'],
  'Motera': ['Gota', 'Chandkheda', 'Sabarmati'],
  'Sabarmati': ['Motera', 'Chandkheda', 'Usmanpura'],
  'IIM Road': ['Navrangpura', 'Vastrapur', 'Bodakdev'],
  'Jodhpur': ['Satellite', 'Ambawadi', 'Vastrapur'],
  'Memnagar': ['Navrangpura', 'Vastrapur', 'IIM Road'],
};

/**
 * ZONE GROUPINGS
 * Areas grouped by the cardinal zone of Ahmedabad they belong to.
 * Two areas in the same zone receive a partial score of 0.3.
 */
const ZONE_MAP = {
  west: ['CG Road', 'Navrangpura', 'Ellisbridge', 'Paldi', 'Ambawadi', 'Memnagar', 'IIM Road'],
  central: ['Satellite', 'Vastrapur', 'Bodakdev', 'Jodhpur', 'SG Highway'],
  south: ['Bopal', 'South Bopal', 'Ghuma', 'Shilaj', 'Prahlad Nagar'],
  east: ['Maninagar', 'Kankaria'],
  north: ['Gota', 'Chandkheda', 'Motera', 'Sabarmati', 'Thaltej'],
};

// Build a reverse lookup: area → zone
const areaToZone = {};
for (const [zone, areas] of Object.entries(ZONE_MAP)) {
  for (const area of areas) {
    areaToZone[area] = zone;
  }
}

function sameZone(area1, area2) {
  return areaToZone[area1] && areaToZone[area1] === areaToZone[area2];
}

// Export the full list of valid areas
const VALID_AREAS = Object.keys(AREA_ADJACENCY_MAP);

module.exports = { AREA_ADJACENCY_MAP, ZONE_MAP, sameZone, VALID_AREAS };

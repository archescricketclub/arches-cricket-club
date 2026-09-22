const fs = require('fs');

const oldMatches = JSON.parse(fs.readFileSync('old_matches.json', 'utf8'));
const newMatches = JSON.parse(fs.readFileSync('data/matches.json', 'utf8'));

let combinedFixtures = [];
if (newMatches.fixtures) combinedFixtures = combinedFixtures.concat(newMatches.fixtures);
if (oldMatches.fixtures) combinedFixtures = combinedFixtures.concat(oldMatches.fixtures);

let combinedResults = [];
if (newMatches.results) combinedResults = combinedResults.concat(newMatches.results);
if (oldMatches.results) combinedResults = combinedResults.concat(oldMatches.results);

console.log('Total fixtures:', combinedFixtures.length);
console.log('Total results:', combinedResults.length);

// Let's run the rendering loop logic to see how many survive the involvesArches filter
let fixturesCount = 0;
combinedFixtures.forEach(match => {
  const homeLower = (match.homeTeam || '').toLowerCase();
  const awayLower = (match.awayTeam || '').toLowerCase();
  const involvesArches = homeLower.includes('arches') || awayLower.includes('arches') || (match.result || '').toLowerCase().includes('arches');
  if (involvesArches) fixturesCount++;
});
console.log('Fixtures involving arches:', fixturesCount);

let resultsCount = 0;
combinedResults.forEach(match => {
  const homeLower = (match.homeTeam || '').toLowerCase();
  const awayLower = (match.awayTeam || '').toLowerCase();
  const involvesArches = homeLower.includes('arches') || awayLower.includes('arches') || (match.result || '').toLowerCase().includes('arches');
  if (involvesArches) resultsCount++;
});
console.log('Results involving arches:', resultsCount);

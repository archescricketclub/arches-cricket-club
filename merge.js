const fs = require('fs');

function canonicalizeTeamName(name) {
  return (name || '').toLowerCase()
    .replace(/\b(1st|2nd|3rd|4th|5th|xi)\b/gi, '')
    .replace(/\b(1|2|3|4|5)\b/g, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSameTeam(t1, t2) {
  return canonicalizeTeamName(t1) === canonicalizeTeamName(t2);
}

function involvesSameTeams(m1, m2) {
  const sameExact = isSameTeam(m1.homeTeam, m2.homeTeam) && isSameTeam(m1.awayTeam, m2.awayTeam);
  const sameFlipped = isSameTeam(m1.homeTeam, m2.awayTeam) && isSameTeam(m1.awayTeam, m2.homeTeam);
  return sameExact || sameFlipped;
}

const oldData = JSON.parse(fs.readFileSync('old_matches.json'));
const newData = JSON.parse(fs.readFileSync('data/matches.json'));

const mergedFixtures = [];
const mergedResults = [];

newData.results.forEach(r => mergedResults.push(r));
newData.fixtures.forEach(f => mergedFixtures.push(f));

oldData.results.forEach(oldR => {
  const isDuplicate = newData.results.some(newR => 
    newR.league === oldR.league && involvesSameTeams(newR, oldR)
  );
  if (!isDuplicate) {
    mergedResults.push(oldR);
  }
});

oldData.fixtures.forEach(oldF => {
  const hasResult = newData.results.some(newR => 
    newR.league === oldF.league && involvesSameTeams(newR, oldF)
  );
  const hasFixture = newData.fixtures.some(newF => 
    newF.league === oldF.league && involvesSameTeams(newF, oldF)
  );
  
  if (oldF.date === '30th June' && oldF.homeTeam.includes('Arches v')) {
      return;
  }
  
  if (!hasResult && !hasFixture) {
    mergedFixtures.push(oldF);
  }
});

const finalData = {
  fixtures: mergedFixtures,
  results: mergedResults,
  lastUpdated: new Date().toISOString()
};

fs.writeFileSync('data/matches.json', JSON.stringify(finalData, null, 2));
fs.writeFileSync('public/data/matches.json', JSON.stringify(finalData, null, 2));

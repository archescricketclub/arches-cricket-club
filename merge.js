const fs = require('fs');

const oldData = JSON.parse(fs.readFileSync('data/matches_old.json', 'utf8').replace(/^\uFEFF/, ''));
const newData = JSON.parse(fs.readFileSync('data/matches.json', 'utf8').replace(/^\uFEFF/, ''));

function normalizeTeam(t) {
    return t.toLowerCase().replace(/1st xi/g, '').replace(/2nd xi/g, '').replace(/mw xi/g, '').replace(/mw2 xi/g, '').trim();
}

function matchesAreSame(m1, m2) {
    return normalizeTeam(m1.homeTeam) === normalizeTeam(m2.homeTeam) &&
           normalizeTeam(m1.awayTeam) === normalizeTeam(m2.awayTeam);
}

const mergedFixtures = [...newData.fixtures];
const mergedResults = [...newData.results];

// Add old fixtures if not in new
oldData.fixtures.forEach(oldF => {
    const exists = mergedFixtures.some(newF => matchesAreSame(oldF, newF)) || 
                   mergedResults.some(newR => matchesAreSame(oldF, newR));
    if (!exists) {
        mergedFixtures.push(oldF);
    }
});

// Add old results if not in new
oldData.results.forEach(oldR => {
    const exists = mergedResults.some(newR => matchesAreSame(oldR, newR));
    if (!exists) {
        mergedResults.push(oldR);
    }
});

fs.writeFileSync('data/matches.json', JSON.stringify({ fixtures: mergedFixtures, results: mergedResults, lastUpdated: new Date().toISOString() }, null, 2));
console.log(`Merged! Fixtures: ${mergedFixtures.length}, Results: ${mergedResults.length}`);

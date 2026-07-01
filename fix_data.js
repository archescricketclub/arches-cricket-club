const fs = require('fs');

// 1. Fix Matches (Fixtures & Results)
const oldData = JSON.parse(fs.readFileSync('old_matches.json'));
const currentData = JSON.parse(fs.readFileSync('data/matches.json'));

function canonicalizeTeamName(name) {
  return (name || '').toLowerCase()
    .replace(/\b(1st|2nd|3rd|4th|5th|xi|mw)\b/gi, '')
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

// We will reconstruct from oldData + newData (from NVPlay scraper log)
// Or simply fix the missing fixtures in currentData using oldData
const finalFixtures = [...currentData.fixtures];
const finalResults = [];

// Re-evaluate results: keep all currentData results except the corrupted Midweek match
currentData.results.forEach(r => {
  if (r.date === '30th June' && r.homeTeam && r.homeTeam.includes('Arches v')) return; // Corrupted
  finalResults.push(r);
});

// Add back missing fixtures from oldData
oldData.fixtures.forEach(oldF => {
  if (oldF.date === '30th June' && oldF.homeTeam && oldF.homeTeam.includes('Arches v')) return;
  
  // Check if this fixture is already in finalFixtures
  const inFixtures = finalFixtures.some(f => f.league === oldF.league && involvesSameTeams(f, oldF));
  
  // Check if there's a result in finalResults that matches EXACTLY the same date or very close.
  // Since NVPlay has dates like "WED\n24 JUN", we can just assume if the month/day match, it's the same.
  // For safety, let's just say: if there is a result with the same teams AND the result date is AFTER or ON the fixture date, it's played.
  // Actually, simplest is: if oldF date is July or August, it hasn't happened yet (since today is July 1st).
  // Let's just add it if it's not in finalFixtures and the month is July, August, Sept.
  const oldDate = oldF.date.toLowerCase();
  const isFuture = oldDate.includes('july') || oldDate.includes('august') || oldDate.includes('sep') || oldDate.includes('tbd');
  
  if (!inFixtures && isFuture) {
    // Make sure we don't add the July 4th Ards match if NV Play already has an Ards TBD fixture
    // Oh wait, `inFixtures` already checks `involvesSameTeams`, so it won't add it.
    finalFixtures.push(oldF);
  }
});

const matchesToSave = {
  fixtures: finalFixtures.filter(m => !m.date.includes('2025')),
  results: finalResults.filter(m => !m.date.includes('2025')),
  lastUpdated: new Date().toISOString()
};

fs.writeFileSync('data/matches.json', JSON.stringify(matchesToSave, null, 2));
fs.writeFileSync('public/data/matches.json', JSON.stringify(matchesToSave, null, 2));


// 2. Fix Player Duplicates in career_stats.json & players.json
const namesToRemove = [
  'Maree Lourens', 'Rhodri Phillips', 'Abdul Qadir', 'sivakumar Baratharaj',
  'Senthilkumar Ponnuchamy', 'Saravana Chandrasekaran', 'Gowri Sankar',
  'Shashank Rama', 'Viswath Balaguru', 'Amarnath Karunakaran',
  'Sharath Bhuvaneshwari', 'Dino James', 'AP Praveen'
].map(n => n.toLowerCase().trim());

const files = ['data/career_stats.json', 'data/players.json'];

files.forEach(file => {
  let data = JSON.parse(fs.readFileSync(file));
  let isRootArray = Array.isArray(data);
  let playersArray = isRootArray ? data : (data.players || []);
  
  // Filter out the non-Arches players
  playersArray = playersArray.filter(p => {
    const name = p.name ? p.name.toLowerCase().trim() : '';
    return !namesToRemove.includes(name);
  });
  
  const nameMap = new Map();
  const finalPlayers = [];
  playersArray.forEach(p => {
    if (!p.name) return;
    // Strip special characters like ‡, *, etc.
    const cleanName = p.name.replace(/[^a-zA-Z\s]/g, '').trim();
    const key = cleanName.toLowerCase().replace(/\s+/g, ' ');
    
    if (!nameMap.has(key)) {
      p.name = cleanName; // Update name to be clean
      nameMap.set(key, p);
      finalPlayers.push(p);
    } else {
      const existing = nameMap.get(key);
      if (file === 'data/career_stats.json') {
        // Stats are nested in batting and bowling
        existing.batting = existing.batting || { runs: 0, hs: '0', matches: 0 };
        existing.bowling = existing.bowling || { wickets: 0, bestFig: '-', matches: 0 };
        p.batting = p.batting || { runs: 0, hs: '0', matches: 0 };
        p.bowling = p.bowling || { wickets: 0, bestFig: '-', matches: 0 };
        
        existing.batting.runs += (p.batting.runs || 0);
        existing.batting.matches += (p.batting.matches || 0);
        existing.bowling.wickets += (p.bowling.wickets || 0);
        existing.bowling.matches += (p.bowling.matches || 0);
        
        // highest score
        const hs1 = parseInt(existing.batting.hs) || 0;
        const hs2 = parseInt(p.batting.hs) || 0;
        if (hs2 > hs1) existing.batting.hs = p.batting.hs;
        
        // best bowling (simple string check or assume p is better if not -)
        if (p.bowling.bestFig && p.bowling.bestFig !== '-') {
          if (existing.bowling.bestFig === '-') {
            existing.bowling.bestFig = p.bowling.bestFig;
          } else {
            // Very naive comparison of best bowling (wickets)
            const w1 = parseInt(existing.bowling.bestFig.split('-')[0]) || 0;
            const w2 = parseInt(p.bowling.bestFig.split('-')[0]) || 0;
            if (w2 > w1) existing.bowling.bestFig = p.bowling.bestFig;
          }
        }
      }
    }
  });
  
  const finalData = isRootArray ? finalPlayers : { ...data, players: finalPlayers };
  fs.writeFileSync(file, JSON.stringify(finalData, null, 2));
  fs.writeFileSync(`public/${file}`, JSON.stringify(finalData, null, 2));
});

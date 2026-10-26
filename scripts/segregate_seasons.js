const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const archiveDir = path.join(dataDir, 'archive');

if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

// 1. Process 2026 matches from all_matches_full.json
const fullMatchesRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'all_matches_full.json'), 'utf8'));
const fullResults = fullMatchesRaw.Results || [];
const arches2026 = fullResults.filter(m => 
  (m.Team1Name && m.Team1Name.includes('Arches')) || 
  (m.Team2Name && m.Team2Name.includes('Arches'))
);

const matches2026 = {
  season: '2026',
  isArchived: false,
  fixtures: [],
  results: []
};

for (const m of arches2026) {
  const homeTeam = m.Team1Name || 'TBC';
  const awayTeam = m.Team2Name || 'TBC';
  const venue = (m.VenueName ? m.VenueName + (m.VenueCity ? ', ' + m.VenueCity : '') : 'TBC');
  const league = m.CompetitionName ? m.CompetitionName.replace(/^NCU\s+/, '') : 'Senior League 3';
  const dateFormatted = m.StartDateFormatted || m.StartDateTime || '2026';
  const result = m.Result || null;

  const matchItem = {
    date: dateFormatted,
    time: m.StartTimeDescription || '',
    league: league,
    homeTeam: homeTeam,
    awayTeam: awayTeam,
    venue: venue,
    result: result,
    scorecardUrl: m.MatchId ? `https://cricketireland.nvplay.com/match/${m.MatchId}` : null
  };

  if (result) {
    matches2026.results.push(matchItem);
  } else {
    matches2026.fixtures.push(matchItem);
  }
}

// 2. Process 2025 matches from matches_old_2.json and old_matches.json
let matches2025List = [];
if (fs.existsSync(path.join(dataDir, 'matches_old_2.json'))) {
  const buf = fs.readFileSync(path.join(dataDir, 'matches_old_2.json'));
  const str = buf.toString('utf16le').replace(/^\uFEFF/, '');
  try {
    const d = JSON.parse(str);
    matches2025List = matches2025List.concat(d.results || []).concat(d.fixtures || []);
  } catch (e) {
    console.error('Error parsing matches_old_2:', e);
  }
}

const oldMatches = JSON.parse(fs.readFileSync(path.join(rootDir, 'old_matches.json'), 'utf8'));
matches2025List = matches2025List.concat(oldMatches.results || []).concat(oldMatches.fixtures || []);

// Deduplicate 2025
const seen2025 = new Set();
const clean2025Results = [];
const clean2025Fixtures = [];

for (const m of matches2025List) {
  const key = `${(m.date || '').replace(/\n/g, ' ')}|${m.homeTeam}|${m.awayTeam}`;
  if (seen2025.has(key)) continue;
  seen2025.add(key);

  const cleanItem = {
    date: (m.date || 'TBD').replace(/\n/g, ' ').trim(),
    time: m.time || '',
    league: m.league || 'Senior League 3',
    homeTeam: m.homeTeam || 'TBC',
    awayTeam: m.awayTeam || 'TBC',
    venue: m.venue || 'TBC',
    result: m.result || null
  };

  if (cleanItem.result) {
    clean2025Results.push(cleanItem);
  } else {
    clean2025Fixtures.push(cleanItem);
  }
}

const matches2025 = {
  season: '2025',
  isArchived: true,
  fixtures: clean2025Fixtures,
  results: clean2025Results
};

// Write files
fs.writeFileSync(path.join(archiveDir, 'matches_2025.json'), JSON.stringify(matches2025, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'matches_2026.json'), JSON.stringify(matches2026, null, 2), 'utf8');
// Keep data/matches.json updated as current season
fs.writeFileSync(path.join(dataDir, 'matches.json'), JSON.stringify(matches2026, null, 2), 'utf8');

// Copy 2025 players to archive
if (fs.existsSync(path.join(dataDir, 'players_2025.json'))) {
  fs.copyFileSync(path.join(dataDir, 'players_2025.json'), path.join(archiveDir, 'players_2025.json'));
}

console.log('Season Segregation Complete:');
console.log(`- 2025 Archive Matches: ${matches2025.results.length} results, ${matches2025.fixtures.length} fixtures -> saved to data/archive/matches_2025.json`);
console.log(`- 2026 Current Matches: ${matches2026.results.length} results, ${matches2026.fixtures.length} fixtures -> saved to data/matches_2026.json & data/matches.json`);

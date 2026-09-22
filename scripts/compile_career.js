const fs = require('fs');

const IN_PLAYERS_2025 = 'data/players_2025.json';
const IN_PLAYERS_2026 = 'data/players_2026.json';
const OUT_CAREER_1 = 'data/career_stats.json';
const OUT_CAREER_2 = 'public/data/career_stats.json';
const ROSTER_PATH = 'data/roster.json';

// Helper to compare high scores (e.g. "50*" vs "60")
function compareHighScores(hs1, hs2) {
  if (!hs1 || hs1 === '-') return hs2;
  if (!hs2 || hs2 === '-') return hs1;
  const val1 = parseInt(hs1.replace('*', ''));
  const val2 = parseInt(hs2.replace('*', ''));
  if (val1 > val2) return hs1;
  if (val2 > val1) return hs2;
  return hs1.includes('*') ? hs1 : hs2;
}

// Helper to parse bowling figures (e.g. "5-20")
function parseBowlingFig(fig) {
  if (!fig || fig === '-') return { w: -1, r: 999 };
  const parts = fig.split('-');
  if (parts.length === 2) return { w: parseInt(parts[0]), r: parseInt(parts[1]) };
  return { w: -1, r: 999 };
}

// Helper to compare bowling figures
function compareBowlingFigs(fig1, fig2) {
  if (fig1 === '-' || !fig1) return fig2;
  if (fig2 === '-' || !fig2) return fig1;
  const f1 = parseBowlingFig(fig1);
  const f2 = parseBowlingFig(fig2);
  if (f2.w > f1.w) return fig2;
  if (f2.w === f1.w && f2.r < f1.r) return fig2;
  return fig1;
}

// Normalize name for robust matching
function matchPlayer(scrapedName, roster) {
  const aliases = {
    'sri tummala': 'Vinay Tummala',
    'surya tummala': 'Surya Pavan Teja Tummala',
    'surya pavan tummala': 'Surya Pavan Teja Tummala',
    'venkat j': 'Venkateswarrao Jyothi',
    'venkateswarararo jyothi': 'Venkateswarrao Jyothi',
    'tulasi tatavarthi': 'Tulasi Gangadhar Thatavarthi',
    'jaya sukavasi': 'Jayasurya Sukhavasi',
    'jayasurya sukavasi': 'Jayasurya Sukhavasi',
    'jaya sukhavasi': 'Jayasurya Sukhavasi',
    'veerendra nagari': 'Veerendra Babu Nagari',
    'vb nagari': 'Veerendra Babu Nagari'
  };

  const nameLower = scrapedName.toLowerCase().trim();
  if (aliases[nameLower]) {
    const matched = roster.find(r => r.name === aliases[nameLower]);
    if (matched) return matched;
  }

  const cleanScraped = scrapedName.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const scrapedTokens = cleanScraped.split(/\s+/).filter(t => t.length > 1);
  let bestMatch = null;
  let bestScore = 0;
  for (const player of roster) {
    const cleanRoster = player.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const rosterTokens = cleanRoster.split(/\s+/).filter(t => t.length > 1);
    let matchCount = 0;
    for (const token of scrapedTokens) {
      if (rosterTokens.includes(token)) {
        matchCount++;
      }
    }
    let score = matchCount / Math.max(scrapedTokens.length, 1);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = player;
    }
  }
  if (bestScore >= 0.5) {
    return bestMatch;
  }
  const cleanScrapedFull = cleanScraped.replace(/\s+/g, '');
  for (const player of roster) {
    const cleanRosterFull = player.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanRosterFull.includes(cleanScrapedFull) || cleanScrapedFull.includes(cleanRosterFull)) {
      return player;
    }
  }
  return null;
}

function processStatsMap(playersObj, careerMap, roster) {
  for (const [key, players] of Object.entries(playersObj)) {
    if (key.endsWith('-bat') || key.endsWith('-bowl')) {
      players.forEach(p => {
        const match = matchPlayer(p.name, roster);
        const canonicalName = match ? match.name : p.name;

        if (!careerMap[canonicalName]) {
          careerMap[canonicalName] = {
            name: canonicalName,
            jersey: match ? match.jersey : (p.jersey || '#—'),
            cap: match ? match.cap : (p.cap || p.name.substring(0,4).toUpperCase()),
            batting: { runs: 0, hs: '0', matches: 0 },
            bowling: { wickets: 0, bestFig: '-', matches: 0 }
          };
        }
        
        if (!p.stats) return;
        
        const findStat = (lbl) => {
            const s = p.stats.find(x => x.l === lbl);
            return s ? s.n : '0';
        };

        if (key.endsWith('-bat')) {
            const matches = parseInt(findStat('Matches')) || 0;
            const runs = parseInt(findStat('Runs')) || 0;
            const hs = findStat('High Score') !== '0' ? findStat('High Score') : findStat('HS');
            
            careerMap[canonicalName].batting.matches += matches;
            careerMap[canonicalName].batting.runs += runs;
            careerMap[canonicalName].batting.hs = compareHighScores(careerMap[canonicalName].batting.hs, hs);
        } else {
            const matches = parseInt(findStat('Matches')) || 0;
            const wickets = parseInt(findStat('Wickets')) || 0;
            let bestFig = findStat('Best Fig');
            if (bestFig === '0') bestFig = '-';
            
            careerMap[canonicalName].bowling.matches += matches;
            careerMap[canonicalName].bowling.wickets += wickets;
            careerMap[canonicalName].bowling.bestFig = compareBowlingFigs(careerMap[canonicalName].bowling.bestFig, bestFig);
        }
      });
    }
  }
}

function sortCareerMap(map) {
  const list = Object.values(map).filter(p => p.batting.runs > 0 || p.bowling.wickets > 0);
  list.sort((a, b) => b.batting.runs - a.batting.runs);
  return list;
}

const roster = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));
const players2025 = JSON.parse(fs.readFileSync(IN_PLAYERS_2025, 'utf8'));
const players2026 = JSON.parse(fs.readFileSync(IN_PLAYERS_2026, 'utf8'));

const allMap = {};
const map2026 = {};
const map2025 = {};

processStatsMap(players2025, allMap, roster);
processStatsMap(players2026, allMap, roster);

processStatsMap(players2025, map2025, roster);
processStatsMap(players2026, map2026, roster);

const finalObj = {
  all: sortCareerMap(allMap),
  "2026": sortCareerMap(map2026),
  "2025": sortCareerMap(map2025)
};

console.log(`Unified Career Statistics has ${finalObj.all.length} players.`);

fs.writeFileSync(OUT_CAREER_1, JSON.stringify(finalObj, null, 2));
fs.writeFileSync(OUT_CAREER_2, JSON.stringify(finalObj, null, 2));

console.log('Saved data/career_stats.json and public/data/career_stats.json successfully!');

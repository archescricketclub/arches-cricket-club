const fs = require('fs');
const path = require('path');

// File paths
const ROSTER_PATH = path.join(__dirname, '../data/roster.json');
const PLAYERS_2025_PATH = path.join(__dirname, '../data/players_2025.json');
const HONOURS_2025_PATH = path.join(__dirname, '../data/honours_2025.json');
const PLAYERS_2026_PATH = path.join(__dirname, '../data/players.json');
const MATCHES_2026_PATH = path.join(__dirname, '../data/matches.json');

const OUT_HONOURS_1 = path.join(__dirname, '../data/honours.json');
const OUT_HONOURS_2 = path.join(__dirname, '../public/data/honours.json');
const OUT_CAREER_1 = path.join(__dirname, '../data/career_stats.json');
const OUT_CAREER_2 = path.join(__dirname, '../public/data/career_stats.json');

// Helper to safely read JSON
function readJSON(filePath, defaultValue = {}) {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Error reading ${filePath}:`, e);
    }
  }
  return defaultValue;
}

const roster = readJSON(ROSTER_PATH, []);
const players2025 = readJSON(PLAYERS_2025_PATH, {});
const honours2025 = readJSON(HONOURS_2025_PATH, []);
const players2026 = readJSON(PLAYERS_2026_PATH, {});
const matches2026 = readJSON(MATCHES_2026_PATH, { fixtures: [], results: [] });

const PLAYER_NAME_MAP = {
  'a rizwan': 'Ali Rizwan',
  'a rehmani': 'Abubakar Rehmani',
  'a murtaza': 'Asad Murtuza',
  'v nagari': 'Veerendra Babu Nagari',
  'h shaik': 'Haneef Shaik',
  'r yadavalli': 'Raja Mouli Yadavalli',
  's tummala': 'Surya Pavan Teja Tummala',
  'k karneedi': 'Kishan Karneedi',
  'a narra': 'Anil Narra',
  'c obula reddy': 'Chandra Obula Reddy B',
  'v vonga': 'Vonga Vishnu',
  's nadakuditi': 'Srini Nadakuditi',
  'c datla': 'Charan Reddy Datla',
  'm yellanur': 'Madhu Yellanur',
  'harsha g': 'Harsha Sai',
  'y chinthakindi': 'Yashwanth',
  'd bommana': 'Dushyanth Reddy B',
  'a mutaza': 'Asad Murtuza',
  'y mirthivada': 'Yaungicha Mirthivada',
  'a krishali': 'Anshul Krishali',
  'c borra': 'Chandra Obula Reddy B'
};

// Due to NVPlay API limitations, exact dates and opponents for season aggregates
// must be mapped here. Add to this lookup when a player hits a milestone in players.json.
const HONOURS_LOOKUP = {
  "Ali Rizwan|51|batting": { opponent: "Saintfield 3rd", date: "30th May 2026", league: "Development Cup" },
  "Wasim SM|66|batting": { opponent: "Saintfield 3rd", date: "30th May 2026", league: "Development Cup" },
  "Asad Murtuza|50*|batting": { opponent: "CSNI 5th", date: "20th June 2026", league: "Development Cup" },
  "Abubakar Rehmani|8-7|bowling": { opponent: "Belfast Superkings 1st", date: "24th June 2026", league: "Senior League 3" },
  "Veerendra Babu Nagari|5-53|bowling": { opponent: "Amigos Belfast 1st", date: "24th June 2026", league: "Senior League 3" },
  "Ali Rizwan|127*|batting": { opponent: "Amigos Belfast 3rd", date: "27th June 2026", league: "Junior League 10" },
  "Anil Narra|58|batting": { opponent: "Amigos Belfast 3rd", date: "27th June 2026", league: "Junior League 10" },
  "Abubakar Rehmani|50|batting": { opponent: "Dungannon 1st", date: "20th June 2026", league: "Junior League 10" },
  "Vonga Vishnu|35*|batting": { opponent: "Belfast MW", date: "2nd June 2026", league: "Midweek League" },
  "Asad Murtuza|34*|batting": { opponent: "Cregagh MW", date: "16th June 2026", league: "Midweek League" },
  "Ali Rizwan|34*|batting": { opponent: "Cooke Collegians MW", date: "23rd June 2026", league: "Midweek League" },
  "Srini Nadakuditi|33*|batting": { opponent: "Cliftonville Academy MW", date: "30th June 2026", league: "Midweek League" },
  "Wasim SM|31*|batting": { opponent: "Dunmurry MW2", date: "14th July 2026", league: "Midweek League" },
  "Haneef Shaik|3-18|bowling": { opponent: "Belfast MW", date: "2nd June 2026", league: "Midweek League" }
};

function cleanDate(dateStr, season) {
  if (!dateStr) return season;
  let clean = dateStr.trim();
  if (clean.toUpperCase().includes('TBD') || clean.toLowerCase().includes('season')) {
    return season;
  }
  if (clean.endsWith(season)) {
    return clean;
  }
  if (/\b\d{4}$/.test(clean)) {
    return clean;
  }
  return `${clean} ${season}`;
}

// Normalize player names matching
function matchPlayer(scrapedName) {
  const normalized = scrapedName.trim().toLowerCase().replace(/\s+/g, ' ');
  for (const [short, full] of Object.entries(PLAYER_NAME_MAP)) {
    if (normalized === short || normalized.startsWith(short) || short.startsWith(normalized)) {
      return full;
    }
  }

  const cleanScraped = scrapedName.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const scrapedTokens = cleanScraped.split(/\s+/).filter(t => t.length > 1);
  if (scrapedTokens.length === 0) return scrapedName;
  
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
    return bestMatch.name;
  }
  
  // Fallback
  const cleanScrapedFull = cleanScraped.replace(/\s+/g, '');
  for (const player of roster) {
    const cleanRosterFull = player.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanRosterFull.includes(cleanScrapedFull) || cleanScrapedFull.includes(cleanRosterFull)) {
      return player.name;
    }
  }
  
  return scrapedName;
}

// Parse individual highlight item
function parseHighlightItem(item) {
  item = item.trim();
  if (item.toLowerCase().includes('over') || item.toLowerCase().includes('run rate') || item.toLowerCase().includes('nrr') || item.toLowerCase().includes('dls')) {
    return null;
  }
  
  // Bowling pattern: Name W-R (e.g. T Jadhav 4-19)
  const bowlMatch = item.match(/^([A-Za-z'\s\.\-]+)\s+(\d+)-(\d+)/);
  if (bowlMatch) {
    return {
      type: 'bowling',
      name: matchPlayer(bowlMatch[1].trim()),
      wickets: parseInt(bowlMatch[2]),
      runs: parseInt(bowlMatch[3]),
      rawFigures: `${bowlMatch[2]}-${bowlMatch[3]}`
    };
  }
  
  // Batting pattern: Name Runs (e.g. A Rizwan 33ret or K Pandey 35*)
  const batMatch = item.match(/^([A-Za-z'\s\.\-]+)\s+(\d+)(?:ret|\*)?$/i);
  if (batMatch) {
    const runsVal = parseInt(batMatch[2]);
    const isNotOut = item.includes('*') || item.toLowerCase().includes('ret');
    return {
      type: 'batting',
      name: matchPlayer(batMatch[1].trim()),
      runs: runsVal,
      rawRuns: `${runsVal}${isNotOut ? '*' : ''}`
    };
  }
  
  return null;
}

// Parse match scorecard lines
function parseMatchScorelines(scorelines, currentDate, leagueName, oppositionTeam) {
  if (!Array.isArray(scorelines) || scorelines.length < 2) return [];

  // Line 0 is usually team 1, Line 1 is team 2
  const records = [];

  // Parse lines briefly to determine which one is Arches
  const parseTeamNameOnly = (str) => {
    let cleaned = str.replace(/\s+inc\s+.*$/i, '').trim();
    const statsPattern = /\s+([A-Z](?:\.|\b[A-Za-z]*\b)\s+)?([A-Z][a-z']+(?:\s+[A-Z][a-z']*)?)\s+\d+(?:ret|-[0-9]+|\*|runs|wkts|o|overs)/i;
    const matchStats = cleaned.match(statsPattern);
    if (matchStats && !cleaned.includes('(')) {
      cleaned = cleaned.substring(0, matchStats.index).trim();
    }
    const p1 = /^(.*?)\s+\d+-\d+(?:\s*\(|$)/i;
    let m = cleaned.match(p1);
    if (m) return m[1].trim();
    const p2 = /^(.*?)\s+(\d+)(?:\s*\(|$)/i;
    m = cleaned.match(p2);
    if (m) {
      const num = parseInt(m[2]);
      if (num <= 5 && !cleaned.includes('(') && cleaned.endsWith(m[2])) return cleaned;
      return m[1].trim();
    }
    return cleaned;
  };

  const name1 = parseTeamNameOnly(scorelines[0]);
  const name2 = parseTeamNameOnly(scorelines[1]);

  const arches1 = name1.toLowerCase().includes('arches');
  const arches2 = name2.toLowerCase().includes('arches');

  const getHighlights = (line) => {
    let hasParen = line.includes('(') && line.includes(')');
    if (hasParen) {
      const m = line.match(/\(([^)]+)\)/);
      return m ? m[1].trim() : '';
    } else if (line.includes(')')) {
      const statsPattern = /\s+([A-Z](?:\.|\b[A-Za-z]*\b)\s+)?([A-Z][a-z']+(?:\s+[A-Z][a-z']*)?)\s+\d+(?:ret|-[0-9]+|\*|runs|wkts|o|overs)/i;
      const matchStats = line.match(statsPattern);
      if (matchStats) {
        return line.substring(matchStats.index).replace(')', '').trim();
      }
    }
    return '';
  };

  const h1 = getHighlights(scorelines[0]);
  const h2 = getHighlights(scorelines[1]);

  const opponent = arches1 ? name2 : name1;

  // Process highlights 1
  if (h1) {
    h1.split(',').forEach(item => {
      const parsed = parseHighlightItem(item);
      if (parsed) {
        if (arches1 && parsed.type === 'batting') {
          records.push({
            name: parsed.name,
            record: parsed.rawRuns,
            type: 'batting',
            runs: parsed.runs,
            date: currentDate,
            opponent: opponent,
            league: leagueName,
            season: '2026'
          });
        } else if (!arches1 && parsed.type === 'bowling') {
          records.push({
            name: parsed.name,
            record: parsed.rawFigures,
            type: 'bowling',
            wickets: parsed.wickets,
            runs: parsed.runs,
            date: currentDate,
            opponent: name1,
            league: leagueName,
            season: '2026'
          });
        }
      }
    });
  }

  // Process highlights 2
  if (h2) {
    h2.split(',').forEach(item => {
      const parsed = parseHighlightItem(item);
      if (parsed) {
        if (arches2 && parsed.type === 'batting') {
          records.push({
            name: parsed.name,
            record: parsed.rawRuns,
            type: 'batting',
            runs: parsed.runs,
            date: currentDate,
            opponent: opponent,
            league: leagueName,
            season: '2026'
          });
        } else if (!arches2 && parsed.type === 'bowling') {
          records.push({
            name: parsed.name,
            record: parsed.rawFigures,
            type: 'bowling',
            wickets: parsed.wickets,
            runs: parsed.runs,
            date: currentDate,
            opponent: name2,
            league: leagueName,
            season: '2026'
          });
        }
      }
    });
  }

  return records;
}

// ────────────────────────────────────────────────────────
// 1. EXTRACT 2026 MATCH-BY-MATCH HONOURS
// ────────────────────────────────────────────────────────
console.log('Compiling dynamic 2026 Honours Board from results...');
const honours2026 = [];

if (Array.isArray(matches2026.results)) {
  matches2026.results.forEach(res => {
    if (res.scorelines && res.scorelines.length >= 2) {
      const parsedRecords = parseMatchScorelines(res.scorelines, res.date, res.league, 'Opposition');
      parsedRecords.forEach(rec => {
        // Classify honours category
        if (rec.type === 'batting') {
          if (rec.league === 'Midweek League') {
            if (rec.runs >= 30) {
              honours2026.push({
                name: rec.name,
                record: rec.record,
                type: 'batting',
                date: rec.date,
                opponent: rec.opponent,
                league: rec.league,
                season: '2026',
                category: 'midweek-30'
              });
            }
          } else {
            if (rec.runs >= 100) {
              honours2026.push({
                name: rec.name,
                record: rec.record,
                type: 'batting',
                date: rec.date,
                opponent: rec.opponent,
                league: rec.league,
                season: '2026',
                category: 'century'
              });
            } else if (rec.runs >= 50) {
              honours2026.push({
                name: rec.name,
                record: rec.record,
                type: 'batting',
                date: rec.date,
                opponent: rec.opponent,
                league: rec.league,
                season: '2026',
                category: 'half-century'
              });
            }
          }
        } else if (rec.type === 'bowling') {
          if (rec.league === 'Midweek League') {
            if (rec.wickets >= 3) {
              honours2026.push({
                name: rec.name,
                record: rec.record,
                type: 'bowling',
                date: rec.date,
                opponent: rec.opponent,
                league: rec.league,
                season: '2026',
                category: 'midweek-3w'
              });
            }
          } else {
            if (rec.wickets >= 5) {
              honours2026.push({
                name: rec.name,
                record: rec.record,
                type: 'bowling',
                date: rec.date,
                opponent: rec.opponent,
                league: rec.league,
                season: '2026',
                category: 'five-wickets'
              });
            }
          }
        }
      });
    }
  });
}

// ────────────────────────────────────────────────────────
// 2. EXTRACT 2026 CUP HONOURS DYNAMICALLY FROM players.json
// ────────────────────────────────────────────────────────
console.log('Compiling 2026 Cup honours from players.json...');
if (players2026) {
  const prefixes = ['t1', 't2', 'mw', 'cup'];
  
  prefixes.forEach(prefix => {
    // Check batting milestones
    if (Array.isArray(players2026[`${prefix}-bat`])) {
      players2026[`${prefix}-bat`].forEach(p => {
        if (!p.stats || p.stats.length < 3) return;
        const hsStr = p.stats[2].n.replace('*', '').trim();
        const hs = parseInt(hsStr);
        
        let threshold = prefix === 'mw' ? 30 : 50;
        
        if (hs >= threshold) {
          // Manual exclusion requested by user
          if (p.name.includes('Anil') && p.name.includes('Narra') && hs === 58 && prefix === 't2') return;

          // Avoid duplicate entries if already scraped match-by-match
          let categoryName = hs >= 100 ? 'century' : 'half-century';
          if (prefix === 'mw') categoryName = 'midweek-30';

          let leagueName = 'Cup Matches';
          if (prefix === 't1') leagueName = 'Senior League 3';
          else if (prefix === 't2') leagueName = 'Junior League 10';
          else if (prefix === 'mw') leagueName = 'Midweek League';

          const exists = honours2026.some(h => h.name === p.name && h.category === categoryName && h.league === leagueName);
          if (!exists) {
            const lookupKey = `${p.name}|${p.stats[1].n}|batting`;
            const lookup = HONOURS_LOOKUP[lookupKey];

            honours2026.push({
              name: p.name,
              record: p.stats[2].n,
              type: 'batting',
              date: lookup ? lookup.date : '2026',
              opponent: lookup ? lookup.opponent : 'Opposition',
              league: lookup ? lookup.league : leagueName,
              season: '2026',
              category: categoryName
            });
          }
        }
      });
    }

    // Check bowling milestones
    if (Array.isArray(players2026[`${prefix}-bowl`])) {
      players2026[`${prefix}-bowl`].forEach(p => {
        if (!p.stats || p.stats.length < 3) return;
        const best = p.stats[2].n;
        if (best && best.includes('-')) {
          const wkts = parseInt(best.split('-')[0]);
          
          let threshold = prefix === 'mw' ? 3 : 5;
          let categoryName = prefix === 'mw' ? 'midweek-3w' : 'five-wickets';

          if (wkts >= threshold) {
            let leagueName = 'Cup Matches';
            if (prefix === 't1') leagueName = 'Senior League 3';
            else if (prefix === 't2') leagueName = 'Junior League 10';
            else if (prefix === 'mw') leagueName = 'Midweek League';

            const exists = honours2026.some(h => h.name === p.name && h.category === categoryName && h.league === leagueName);
            if (!exists) {
              const lookupKey = `${p.name}|${best}|bowling`;
              const lookup = HONOURS_LOOKUP[lookupKey];

              honours2026.push({
                name: p.name,
                record: best,
                type: 'bowling',
                date: lookup ? lookup.date : '2026',
                opponent: lookup ? lookup.opponent : 'Opposition',
                league: lookup ? lookup.league : leagueName,
                season: '2026',
                category: categoryName
              });
            }
          }
        }
      });
    }
  });
}

// Merge 2025 and 2026 honours
const combinedHonours = [...honours2026, ...honours2025].map(h => {
  h.date = cleanDate(h.date, h.season);
  return h;
});
console.log(`Unified Honours Board has ${combinedHonours.length} total records.`);

// Save honours JSON
fs.writeFileSync(OUT_HONOURS_1, JSON.stringify(combinedHonours, null, 2));
fs.writeFileSync(OUT_HONOURS_2, JSON.stringify(combinedHonours, null, 2));

// ────────────────────────────────────────────────────────
// 3. COMPILE ALL-TIME CAREER STATISTICS (2025 - PRESENT)
// ────────────────────────────────────────────────────────
console.log('\nCompiling All-Time Career Stats...');
const careerMap = {};

// Initialize career statistics for all players in the roster
roster.forEach(player => {
  careerMap[player.name] = {
    name: player.name,
    jersey: player.jersey,
    cap: player.cap,
    batting: { runs: 0, hs: '0', matches: 0 },
    bowling: { wickets: 0, bestFig: '-', matches: 0 }
  };
});

function compareHighScores(hs1, hs2) {
  if (hs1 === '0' || hs1 === '-' || !hs1) return hs2;
  if (hs2 === '0' || hs2 === '-' || !hs2) return hs1;
  const val1 = parseInt(hs1.replace('*', '')) || 0;
  const val2 = parseInt(hs2.replace('*', '')) || 0;
  if (val2 > val1) return hs2;
  if (val1 === val2 && hs2.includes('*')) return hs2;
  return hs1;
}

function parseBowlingFig(fig) {
  if (!fig || fig === '-' || !fig.includes('-')) return { w: 0, r: 999 };
  const parts = fig.split('-');
  return { w: parseInt(parts[0]) || 0, r: parseInt(parts[1]) || 999 };
}

function compareBowlingFigs(fig1, fig2) {
  if (fig1 === '-' || !fig1) return fig2;
  if (fig2 === '-' || !fig2) return fig1;
  const f1 = parseBowlingFig(fig1);
  const f2 = parseBowlingFig(fig2);
  if (f2.w > f1.w) return fig2;
  if (f2.w === f1.w && f2.r < f1.r) return fig2;
  return fig1;
}

// Process 2025 Stats
for (const [key, players] of Object.entries(players2025)) {
  if (key.endsWith('-bat')) {
    players.forEach(p => {
      if (!careerMap[p.name]) {
        // Player not on current roster but has historical stats
        careerMap[p.name] = {
          name: p.name,
          jersey: '#—',
          cap: p.name.substring(0,4).toUpperCase(),
          batting: { runs: 0, hs: '0', matches: 0 },
          bowling: { wickets: 0, bestFig: '-', matches: 0 }
        };
      }
      careerMap[p.name].batting.matches += p.matches || 0;
      careerMap[p.name].batting.runs += p.runs || 0;
      careerMap[p.name].batting.hs = compareHighScores(careerMap[p.name].batting.hs, p.hs);
    });
  } else if (key.endsWith('-bowl')) {
    players.forEach(p => {
      if (!careerMap[p.name]) {
        careerMap[p.name] = {
          name: p.name,
          jersey: '#—',
          cap: p.name.substring(0,4).toUpperCase(),
          batting: { runs: 0, hs: '0', matches: 0 },
          bowling: { wickets: 0, bestFig: '-', matches: 0 }
        };
      }
      careerMap[p.name].bowling.matches += p.matches || 0;
      careerMap[p.name].bowling.wickets += p.wickets || 0;
      careerMap[p.name].bowling.bestFig = compareBowlingFigs(careerMap[p.name].bowling.bestFig, p.bestFig);
    });
  }
}

// Process 2026 Stats
for (const [key, players] of Object.entries(players2026)) {
  if (key.endsWith('-bat')) {
    players.forEach(p => {
      if (!careerMap[p.name]) {
        careerMap[p.name] = {
          name: p.name,
          jersey: p.jersey || '#—',
          cap: p.cap || p.name.substring(0,4).toUpperCase(),
          batting: { runs: 0, hs: '0', matches: 0 },
          bowling: { wickets: 0, bestFig: '-', matches: 0 }
        };
      }
      const matches = parseInt(p.stats[0].n) || 0;
      const runs = parseInt(p.stats[1].n) || 0;
      const hs = p.stats[2].n;
      careerMap[p.name].batting.matches += matches;
      careerMap[p.name].batting.runs += runs;
      careerMap[p.name].batting.hs = compareHighScores(careerMap[p.name].batting.hs, hs);
    });
  } else if (key.endsWith('-bowl')) {
    players.forEach(p => {
      if (!careerMap[p.name]) {
        careerMap[p.name] = {
          name: p.name,
          jersey: p.jersey || '#—',
          cap: p.cap || p.name.substring(0,4).toUpperCase(),
          batting: { runs: 0, hs: '0', matches: 0 },
          bowling: { wickets: 0, bestFig: '-', matches: 0 }
        };
      }
      const matches = parseInt(p.stats[0].n) || 0;
      const wickets = parseInt(p.stats[1].n) || 0;
      const best = p.stats[2].n;
      careerMap[p.name].bowling.matches += matches;
      careerMap[p.name].bowling.wickets += wickets;
      careerMap[p.name].bowling.bestFig = compareBowlingFigs(careerMap[p.name].bowling.bestFig, best);
    });
  }
}

// Convert career stats map to a sorted list of players
const careerList = Object.values(careerMap).filter(p => p.batting.runs > 0 || p.bowling.wickets > 0);

// Sort by total runs descending by default
careerList.sort((a, b) => b.batting.runs - a.batting.runs);

console.log(`Unified Career Statistics has ${careerList.length} players.`);

// Save Career Stats JSON
fs.writeFileSync(OUT_CAREER_1, JSON.stringify(careerList, null, 2));
fs.writeFileSync(OUT_CAREER_2, JSON.stringify(careerList, null, 2));

console.log('Saved data/career_stats.json and public/data/career_stats.json successfully!');

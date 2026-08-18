const fs = require('fs');
const path = require('path');
const https = require('https');

const year = process.argv[2] || '2026';
const isCurrentYear = year === '2026';
const OUT_PATH = path.join(__dirname, '../data', isCurrentYear ? 'players.json' : `players_${year}.json`);

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data.replace(/^\uFEFF/, '')));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

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
  'c borra': 'Chandra Obula Reddy B',

  // NV Play specific short names mappings
  'veerendra nagari': 'Veerendra Babu Nagari',
  'dushyanth bommana': 'Dushyanth Reddy B',
  'asad murtaza': 'Asad Murtuza',
  'vishnu vonga': 'Vonga Vishnu',
  'tulasi thatavarthi': 'Tulasi Gangadhar Thatavarthi',
  'venkat jyothi': 'Venkateswarrao Jyothi',
  'chandra borra': 'Chandra Obula Reddy B',
  'charan datla': 'Charan Reddy Datla',
  'surya tummala': 'Surya Pavan Teja Tummala',
  'srinuvasarao nadakuditi': 'Srini Nadakuditi',
  'veera srn': 'Veera SR Nimmakayala',
  'yashwanth chinthakindi': 'Yashwanth',
  'harsha naga teja': 'Harsha Sai'
};

function normalizeName(name) {
    if (!name) return '';
    let n = name.replace(/†|\*/g, '').trim();
    const l = n.toLowerCase();
    return PLAYER_NAME_MAP[l] || n;
}

function getCategory(compName) {
    const c = (compName || '').toLowerCase();
    if (c.includes('junior')) return 't2';
    if (c.includes('midweek')) return 'mw';
    if (c.includes('cup') || c.includes('shield')) return 'cup';
    return 't1';
}

function initPlayer() {
    return { matches: 0, runs: 0, outs: 0, hs: 0, wickets: 0, runsConceded: 0, bestFig: {w:0, r:999} };
}

(async () => {
    console.log(`Fetching match list for ${year}...`);
    const listUrl = `https://w-api.cdn.nvplay.net/api/matchlist/filter?customerid=4c07e17d-8e58-426e-82cc-bd4b02b5183b&maxResults=500&start=${year}-01-01&end=${year}-12-31`;
    const matchList = await fetchJson(listUrl);
    
    const archesMatches = matchList.Results.filter(m => 
        (m.Team1Name && m.Team1Name.toLowerCase().includes('arches')) || 
        (m.Team2Name && m.Team2Name.toLowerCase().includes('arches'))
    );
    
    console.log(`Found ${archesMatches.length} matches for Arches in ${year}.`);
    
    // Store stats by category, then by player name
    const statsStore = {
        't1': {}, 't2': {}, 'mw': {}, 'cup': {}
    };

    for (const match of archesMatches) {
        console.log(`Fetching scorecard for: ${match.MatchShortTitle}`);
        const cat = getCategory(match.CompetitionName);
        const scoreUrl = `https://w-api.cdn.nvplay.net/api/scorecard/${match.MatchId}`;
        let sc;
        try {
            sc = await fetchJson(scoreUrl);
        } catch(e) {
            console.log(`Failed to fetch scorecard for ${match.MatchId}`);
            continue;
        }

        if (!sc.Innings) continue;

        // Collect all players who played this match
        const playersInMatch = new Set();
        const playerMatchStats = {};

        sc.Innings.forEach(inn => {
            if (!inn.BattingTeamName) return;
            const isArchesBatting = inn.BattingTeamName.toLowerCase().includes('arches');
            const isArchesBowling = !isArchesBatting; // Since Arches is in this match, if they aren't batting, they are bowling

            if (isArchesBatting && inn.BattingCard) {
                inn.BattingCard.forEach(b => {
                    const n = normalizeName(b.PlayerName);
                    if (!n || n.toLowerCase() === 'extras' || n.toLowerCase() === 'total') return;
                    playersInMatch.add(n);
                    if (!playerMatchStats[n]) playerMatchStats[n] = initPlayer();
                    
                    playerMatchStats[n].runs += (b.Runs || 0);
                    if (b.Runs > playerMatchStats[n].hs) playerMatchStats[n].hs = b.Runs;
                    if (b.HowOut && b.HowOut.toLowerCase() !== 'not out' && b.HowOut.toLowerCase() !== 'retired hurt') {
                        playerMatchStats[n].outs += 1;
                    }
                });
            } else if (isArchesBowling && inn.BowlingCard) {
                inn.BowlingCard.forEach(b => {
                    const n = normalizeName(b.PlayerName);
                    if (!n) return;
                    playersInMatch.add(n);
                    if (!playerMatchStats[n]) playerMatchStats[n] = initPlayer();

                    const w = b.Wickets || 0;
                    const r = b.Runs || 0;
                    playerMatchStats[n].wickets += w;
                    playerMatchStats[n].runsConceded += r;

                    if (w > playerMatchStats[n].bestFig.w || (w === playerMatchStats[n].bestFig.w && r < playerMatchStats[n].bestFig.r)) {
                        playerMatchStats[n].bestFig = { w, r };
                    }
                });
            }
        });

        // Add to main store
        playersInMatch.forEach(n => {
            if (!statsStore[cat][n]) statsStore[cat][n] = initPlayer();
            const ms = playerMatchStats[n];
            const gs = statsStore[cat][n];
            gs.matches += 1;
            gs.runs += ms.runs;
            gs.outs += ms.outs;
            if (ms.hs > gs.hs) gs.hs = ms.hs;
            gs.wickets += ms.wickets;
            gs.runsConceded += ms.runsConceded;
            
            if (ms.bestFig.w > gs.bestFig.w || (ms.bestFig.w === gs.bestFig.w && ms.bestFig.r < gs.bestFig.r)) {
                gs.bestFig = ms.bestFig;
            }
        });
    }

    // Load existing metadata to preserve jerseys
    let existingData = {};
    const bakPath = OUT_PATH + '.bak';
    const sourcePath = fs.existsSync(bakPath) ? bakPath : (fs.existsSync(OUT_PATH) ? OUT_PATH : null);
    if (sourcePath) {
        try {
            existingData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
        } catch(e) {}
    }

    // Function to get existing metadata by searching all categories
    function getMeta(catStr, name) {
        let jersey = '#TBD', cap = 'TBD', badge = null;
        for (const catKey of Object.keys(existingData)) {
            const found = existingData[catKey].find(p => p.name.toLowerCase() === name.toLowerCase());
            if (found) {
                if (found.jersey && found.jersey !== '#TBD') jersey = found.jersey;
                if (found.cap && found.cap !== 'TBD') cap = found.cap;
            }
        }
        
        // Badge is specific to the exact category they won the award in
        if (existingData[catStr]) {
            const foundCat = existingData[catStr].find(p => p.name.toLowerCase() === name.toLowerCase());
            if (foundCat && foundCat.badge) badge = foundCat.badge;
        }

        return { jersey, cap, badge };
    }

    const outputData = {};

    ['t1', 't2', 'mw', 'cup'].forEach(cat => {
        const catPlayers = statsStore[cat];
        
        // Batting
        outputData[`${cat}-bat`] = Object.keys(catPlayers)
            .filter(n => catPlayers[n].runs > 0 || catPlayers[n].matches > 0)
            .map(n => {
                const s = catPlayers[n];
                const avg = s.outs > 0 ? (s.runs / s.outs).toFixed(2) : (s.runs > 0 ? s.runs.toFixed(2) : '0.00');
                const meta = getMeta(`${cat}-bat`, n);
                const out = {
                    name: n,
                    jersey: meta.jersey, cap: meta.cap,
                    stats: [
                        { n: s.matches.toString(), l: 'Matches' },
                        { n: s.runs.toString(), l: 'Runs' },
                        { n: s.hs.toString() + (s.outs === 0 && s.runs > 0 ? '*' : ''), l: 'High Score' },
                        { n: avg, l: 'Average' }
                    ]
                };
                if (meta.badge) out.badge = meta.badge;
                return out;
            });

        // Bowling
        outputData[`${cat}-bowl`] = Object.keys(catPlayers)
            .filter(n => catPlayers[n].wickets > 0 || catPlayers[n].runsConceded > 0)
            .map(n => {
                const s = catPlayers[n];
                const avg = s.wickets > 0 ? (s.runsConceded / s.wickets).toFixed(2) : '0.00';
                let bestFig = '-';
                if (s.wickets > 0) bestFig = `${s.bestFig.w}-${s.bestFig.r}`;
                const meta = getMeta(`${cat}-bowl`, n);
                const out = {
                    name: n,
                    jersey: meta.jersey, cap: meta.cap,
                    stats: [
                        { n: s.matches.toString(), l: 'Matches' },
                        { n: s.wickets.toString(), l: 'Wickets' },
                        { n: bestFig, l: 'Best Fig' },
                        { n: avg, l: 'Average' }
                    ]
                };
                if (meta.badge) out.badge = meta.badge;
                return out;
            });
            
        // All Rounders (has both > 0 runs and > 0 wickets)
        outputData[`${cat}-ar`] = Object.keys(catPlayers)
            .filter(n => catPlayers[n].runs > 0 && catPlayers[n].wickets > 0)
            .map(n => {
                const s = catPlayers[n];
                const meta = getMeta(`${cat}-ar`, n);
                const out = {
                    name: n,
                    jersey: meta.jersey, cap: meta.cap,
                    stats: [
                        { n: s.matches.toString(), l: 'Matches' },
                        { n: s.runs.toString(), l: 'Runs' },
                        { n: s.wickets.toString(), l: 'Wickets' }
                    ]
                };
                if (meta.badge) out.badge = meta.badge;
                return out;
            });
    });

    fs.writeFileSync(OUT_PATH, JSON.stringify(outputData, null, 2));
    console.log(`Saved stats to ${OUT_PATH}`);

})();

const fs = require('fs');
const path = require('path');
const https = require('https');

const MATCHES_PATH = path.join(__dirname, '../all_matches_full.json');
const SCORECARDS_OUT = path.join(__dirname, '../data/scorecard_milestones.json');
const ROSTER_PATH = path.join(__dirname, '../data/roster.json');

// Read matches from the API JSON
const matchesData = fs.existsSync(MATCHES_PATH) ? JSON.parse(fs.readFileSync(MATCHES_PATH, 'utf8')) : { Results: [] };
const recentMatches = matchesData.Results || [];

// Only process matches from 2026
const targetMatches = recentMatches.filter(m => {
  return m.StartDateFormatted && m.StartDateFormatted.includes('2026') && 
         ((m.Team1Name && m.Team1Name.toLowerCase().includes('arches')) || 
          (m.Team2Name && m.Team2Name.toLowerCase().includes('arches')));
});

if (targetMatches.length === 0) {
    console.log('No recent matches found.');
    process.exit(0);
}

const roster = fs.existsSync(ROSTER_PATH) ? JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8')) : [];

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
  'r singh': 'Rohit Singh',
  's singh': 'Shailendra Singh',
  'p prasad': 'Purvik Prasad',
  'a nimmagadda': 'Arush Nimmagadda',
  'v hugar': 'Vijaykumar Hugar',
  'k maheswaram': 'Kiran Maheswaram',
  'w sm': 'Wasim SM'
};

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
  return scrapedName;
}

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

(async () => {
  console.log(`Starting fast scorecard scraper for ${targetMatches.length} matches...`);
  
  let allMilestones = [];

  for (let match of targetMatches) {
    if (!match.MatchId) continue;
    
    const isMidweek = match.CompetitionName && match.CompetitionName.toLowerCase().includes('midweek');
    const batThreshold = isMidweek ? 30 : 50;
    const bowlThreshold = isMidweek ? 3 : 5;
    
    try {
        const url = `https://w-api.cdn.nvplay.net/api/scorecard/${match.MatchId}?idType=nvplay&customerId=4c07e17d-8e58-426e-82cc-bd4b02b5183b`;
        const j = await fetchJson(url);
        
        if (!j.Innings || j.Innings.length === 0) continue;

        let dateStr = match.StartDateTime;
        let humanDate = '2026';
        if (dateStr) {
           const d = new Date(dateStr);
           const day = d.getDate();
           const suffix = (day % 10 === 1 && day !== 11) ? 'st' : (day % 10 === 2 && day !== 12) ? 'nd' : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
           const month = d.toLocaleString('default', { month: 'long' });
           const year = d.getFullYear();
           humanDate = `${day}${suffix} ${month} ${year}`;
        }
        
        let opp = '';
        if (match.MatchTitle && match.MatchTitle.toLowerCase().includes('arches')) {
            const teams = match.MatchTitle.split('vs');
            if (teams.length === 2) {
                opp = teams[0].toLowerCase().includes('arches') ? teams[1].trim() : teams[0].trim();
            } else {
                const teams2 = match.MatchTitle.split('v');
                if (teams2.length === 2) {
                    opp = teams2[0].toLowerCase().includes('arches') ? teams2[1].trim() : teams2[0].trim();
                }
            }
        }
        if (opp.includes(',')) opp = opp.split(',')[0].trim();
        const league = match.CompetitionName || 'League';

        j.Innings.forEach(inning => {
            const batTeam = inning.BattingTeamName || '';
            const bowlTeam = inning.BowlingTeamName || '';
            
            // If Arches is batting
            if (batTeam.toLowerCase().includes('arches') && inning.BattingCard) {
                inning.BattingCard.forEach(batter => {
                    const runs = batter.Runs || 0;
                    if (runs >= batThreshold) {
                        const notOut = batter.HowOut && (batter.HowOut.toLowerCase().includes('not out') || batter.HowOut.toLowerCase().includes('retired'));
                        allMilestones.push({
                            name: matchPlayer(batter.PlayerName),
                            type: 'batting',
                            record: runs + (notOut ? '*' : ''),
                            runs: runs,
                            date: humanDate,
                            league: league,
                            opponent: opp || 'Opposition'
                        });
                    }
                });
            }
            
            // If Arches is bowling (or opposite team is batting, so we check the bowlers list)
            // Sometimes BowlingTeamName is undefined, so we check if batTeam is NOT Arches OR if we can infer.
            if ((bowlTeam.toLowerCase().includes('arches') || (!batTeam.toLowerCase().includes('arches') && (match.Team1Name.toLowerCase().includes('arches') || match.Team2Name.toLowerCase().includes('arches')))) && inning.BowlingCard) {
                inning.BowlingCard.forEach(bowler => {
                    const wkts = bowler.Wickets || 0;
                    if (wkts >= bowlThreshold) {
                        allMilestones.push({
                            name: matchPlayer(bowler.PlayerName),
                            type: 'bowling',
                            record: `${wkts}-${bowler.Runs}`,
                            wickets: wkts,
                            runs: bowler.Runs,
                            date: humanDate,
                            league: league,
                            opponent: opp || 'Opposition'
                        });
                    }
                });
            }
        });

    } catch (e) {
        console.error(`Failed to fetch scorecard for ${match.MatchTitle}:`, e.message);
    }
  }

  // Deduplicate milestones
  const uniqueMilestones = [];
  const seen = new Set();
  allMilestones.forEach(m => {
      const key = `${m.name}|${m.record}|${m.date}|${m.league}`;
      if (!seen.has(key)) {
          seen.add(key);
          uniqueMilestones.push(m);
      }
  });

  fs.writeFileSync(SCORECARDS_OUT, JSON.stringify(uniqueMilestones, null, 2));
  console.log(`\nSuccessfully saved ${uniqueMilestones.length} scorecard milestones to ${SCORECARDS_OUT}`);
})();

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const STATS_URLS = [
  { name: 'Senior League 3', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#c60d44c69-295b-4c45-b6a5-0a2bcb811762', team: 'Arches', prefix: 't1' },
  { name: 'Junior League 10', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#c42955698-0385-447f-8070-185a03b349bb', team: 'Arches', prefix: 't2' },
  { name: 'Development Cup', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#cd848fff8-615c-4dd3-a3b5-185cefd17fa0', team: 'Arches', prefix: 'cup' },
  { name: 'Junior Cup', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#ca060450b-a00d-41c1-9c06-85f6b717b248', team: 'Arches', prefix: 'cup' },
  { name: 'T20 Shield Cup', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#c4af1fda1-3d40-408b-bfaa-aa14fd0b658b', team: 'Arches', prefix: 'cup' },
  { name: 'Midweek League', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#cea759f09-8663-4fe0-9c79-9c653aeca391', team: 'Arches', prefix: 'mw' }
];

const RESULTS_PAGES = [
  { name: 'Senior League 3', url: 'https://northerncricketunion.org/ncu-section-3-2025/', type: 'html-tabs' },
  { name: 'Junior League 10', url: 'https://northerncricketunion.org/junior-league-section-10-2025/', type: 'html-tabs' },
  { name: 'Development Cup', url: 'https://northerncricketunion.org/development-cup-2025/', type: 'html-direct' },
  { name: 'Junior Cup', url: 'https://northerncricketunion.org/gmcg-junior-cup-2025/', type: 'html-direct' },
  { name: 'T20 Shield Cup', url: 'https://northerncricketunion.org/lagan-valley-steels-t20-shield-2025/', type: 'html-direct' },
  { name: 'Midweek League', url: 'https://northerncricketunion.org/midweek-league-group-c-2025/', type: 'html-tabs' }
];

// Load roster
const rosterPath = path.join(__dirname, '../data/roster.json');
let roster = [];
if (fs.existsSync(rosterPath)) {
  roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
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
  'y chinthakindi': 'Yashwanth'
};

// Normalize player matching
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
    if (cleanRosterFull.includes(cleanScrapedFull) || cleanScrapedFull.includes(cleanScrapedFull)) {
      return player.name;
    }
  }
  
  return scrapedName;
}

// Helper to parse individual match highlight item
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

// Parse match description line for team names and highlights
function parseMatchLine(line, currentDate, leagueName, oppositionTeam) {
  // Check if line contains parentheses
  let hasParen = line.includes('(') && line.includes(')');
  let highlightsPart = '';
  let teamNamePart = line;

  if (hasParen) {
    const m = line.match(/^(.*?)\(([^)]+)\)/);
    if (m) {
      teamNamePart = m[1].trim();
      highlightsPart = m[2].trim();
    }
  } else if (line.includes(')')) {
    // Malformed line like: Ardent Blues 2 J Johnson 31ret, S Nair 31ret, Harsha G 2-5)
    // Find the first player stat match
    const statsPattern = /\s+([A-Z](?:\.|\b[A-Za-z]*\b)\s+)?([A-Z][a-z']+(?:\s+[A-Z][a-z']*)?)\s+\d+(?:ret|-[0-9]+|\*|runs|wkts|o|overs)/i;
    const matchStats = line.match(statsPattern);
    if (matchStats) {
      teamNamePart = line.substring(0, matchStats.index).trim();
      highlightsPart = line.substring(matchStats.index).replace(')', '').trim();
    }
  }

  // Parse team name
  let teamName = teamNamePart.replace(/\s+\d+-\d+.*$/, '').replace(/\s+\d+\b.*$/, '').trim();
  const isArches = teamName.toLowerCase().includes('arches');

  const records = [];
  if (highlightsPart) {
    const items = highlightsPart.split(',');
    items.forEach(item => {
      const parsed = parseHighlightItem(item);
      if (parsed) {
        if (isArches && parsed.type === 'batting') {
          // Arches batting performance
          records.push({
            name: parsed.name,
            runs: parsed.runs,
            formatted: parsed.rawRuns,
            type: 'batting',
            date: currentDate,
            opponent: oppositionTeam,
            league: leagueName,
            season: '2025'
          });
        } else if (!isArches && parsed.type === 'bowling') {
          // Arches bowling performance (bowling against the opposition team)
          records.push({
            name: parsed.name,
            wickets: parsed.wickets,
            runs: parsed.runs,
            formatted: parsed.rawFigures,
            type: 'bowling',
            date: currentDate,
            opponent: teamName, // The batting team is the opponent
            league: leagueName,
            season: '2025'
          });
        }
      }
    });
  }

  return { isArches, teamName, records };
}

(async () => {
  console.log('Starting 2025 statistics and results scraping...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const finalStats = {
    't1-bat': [], 't1-bowl': [], 't1-ar': [],
    't2-bat': [], 't2-bowl': [], 't2-ar': [],
    'mw-bat': [], 'mw-bowl': [], 'mw-ar': [],
    'cup-bat': [], 'cup-bowl': [], 'cup-ar': []
  };

  const finalHonours = [];

  // --- 1. SCRAPE 2025 COMPILED STATISTICS FROM NV PLAY ---
  for (const comp of STATS_URLS) {
    console.log(`\nScraping stats for 2025 ${comp.name}...`);
    const page = await browser.newPage();
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(comp.url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Wait for Stats tab
      await page.waitForFunction(() => {
        const tabs = Array.from(document.querySelectorAll('.nvp-tabs__item'));
        return tabs.some(t => t.textContent.trim().toLowerCase() === 'stats');
      }, { timeout: 20000 });

      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.nvp-tabs__item'));
        const statsTab = tabs.find(t => t.textContent.trim().toLowerCase() === 'stats');
        if (statsTab) statsTab.click();
      });

      await page.waitForFunction(() => {
        const subtabs = Array.from(document.querySelectorAll('button.nvp-tabs__item'));
        return subtabs.some(t => t.textContent.trim().toLowerCase() === 'bowling');
      }, { timeout: 10000 });

      // BATTING
      console.log('--- Scraping Batting Stats ---');
      await page.evaluate(() => {
        const subtabs = Array.from(document.querySelectorAll('button.nvp-tabs__item'));
        const battingTab = subtabs.find(t => t.textContent.trim().toLowerCase() === 'batting');
        if (battingTab) battingTab.click();
      });
      await new Promise(r => setTimeout(r, 1000));

      const clickedBattingShowAll = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.nvp-player-stats__show-all'));
        const visibleBtn = btns.find(b => b.offsetWidth > 0 || b.offsetHeight > 0);
        if (visibleBtn) { visibleBtn.click(); return true; }
        return false;
      });

      if (clickedBattingShowAll) {
        await page.waitForFunction(() => {
          const selects = Array.from(document.querySelectorAll('select.nvp-tab-toolbar__select, select.nvp-select, select.nvp-filter__select'));
          return selects.some(s => s.offsetWidth > 0 || s.offsetHeight > 0);
        }, { timeout: 10000 });

        await page.evaluate((targetTeam) => {
          const selects = Array.from(document.querySelectorAll('select.nvp-tab-toolbar__select, select.nvp-select, select.nvp-filter__select'));
          const select = selects.find(s => s.offsetWidth > 0 || s.offsetHeight > 0);
          if (select) {
            const options = Array.from(select.options);
            const opt = options.find(o => o.text.toLowerCase().includes(targetTeam.toLowerCase()));
            if (opt) {
              select.value = opt.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }, comp.team);

        await new Promise(r => setTimeout(r, 2000));

        const rawBatting = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('.nvp-stats-grid__cell-list'));
          return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('.nvp-stats-grid__cell-item'));
            return {
              name: cells[0] ? cells[0].textContent.trim() : '',
              runs: cells[4] ? cells[4].textContent.trim() : '0',
              avg: cells[5] ? cells[5].textContent.trim() : '0.00',
              hs: cells[6] ? cells[6].textContent.trim() : '0'
            };
          }).filter(p => p.name.length > 0 && p.runs !== '0');
        });

        console.log(`Extracted ${rawBatting.length} batting records.`);
        rawBatting.forEach(p => {
          finalStats[`${comp.prefix}-bat`].push({
            name: matchPlayer(p.name),
            runs: parseInt(p.runs),
            hs: p.hs,
            avg: parseFloat(p.avg)
          });
        });

        // Go Back
        await page.evaluate(() => {
          const backBtn = document.querySelector('a.nvp-back_link.nvp-tab-toolbar__back-link');
          if (backBtn) backBtn.click();
        });
        await new Promise(r => setTimeout(r, 2000));
      }

      // BOWLING
      console.log('--- Scraping Bowling Stats ---');
      await page.evaluate(() => {
        const subtabs = Array.from(document.querySelectorAll('button.nvp-tabs__item'));
        const bowlingTab = subtabs.find(t => t.textContent.trim().toLowerCase() === 'bowling');
        if (bowlingTab) bowlingTab.click();
      });
      await new Promise(r => setTimeout(r, 1000));

      const clickedBowlingShowAll = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.nvp-player-stats__show-all'));
        const visibleBtn = btns.find(b => b.offsetWidth > 0 || b.offsetHeight > 0);
        if (visibleBtn) { visibleBtn.click(); return true; }
        return false;
      });

      if (clickedBowlingShowAll) {
        await page.waitForFunction(() => {
          const selects = Array.from(document.querySelectorAll('select.nvp-tab-toolbar__select, select.nvp-select, select.nvp-filter__select'));
          return selects.some(s => s.offsetWidth > 0 || s.offsetHeight > 0);
        }, { timeout: 10000 });

        await page.evaluate((targetTeam) => {
          const selects = Array.from(document.querySelectorAll('select.nvp-tab-toolbar__select, select.nvp-select, select.nvp-filter__select'));
          const select = selects.find(s => s.offsetWidth > 0 || s.offsetHeight > 0);
          if (select) {
            const options = Array.from(select.options);
            const opt = options.find(o => o.text.toLowerCase().includes(targetTeam.toLowerCase()));
            if (opt) {
              select.value = opt.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }, comp.team);

        await new Promise(r => setTimeout(r, 2000));

        const rawBowling = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('.nvp-stats-grid__cell-list'));
          return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('.nvp-stats-grid__cell-item'));
            return {
              name: cells[0] ? cells[0].textContent.trim() : '',
              overs: cells[3] ? cells[3].textContent.trim() : '0',
              wickets: cells[6] ? cells[6].textContent.trim() : '0',
              bestFig: cells[11] ? cells[11].textContent.trim() : '-'
            };
          }).filter(p => p.name.length > 0 && (p.wickets !== '0' || p.overs !== '0'));
        });

        console.log(`Extracted ${rawBowling.length} bowling records.`);
        rawBowling.forEach(p => {
          finalStats[`${comp.prefix}-bowl`].push({
            name: matchPlayer(p.name),
            overs: parseFloat(p.overs),
            wickets: parseInt(p.wickets),
            bestFig: p.bestFig
          });
        });
      }

    } catch (err) {
      console.error(`Error scraping NV Play stats for ${comp.name}:`, err);
    }
    await page.close();
  }

  // --- 2. SCRAPE 2025 DETAILED MATCH RESULTS TO EXTRACT HONOURS ---
  for (const pageInfo of RESULTS_PAGES) {
    console.log(`\nScraping matches/honours for 2025 ${pageInfo.name}...`);
    const page = await browser.newPage();
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
      await page.goto(pageInfo.url, { waitUntil: 'networkidle2', timeout: 60000 });

      let resultsText = '';
      if (pageInfo.type === 'html-tabs') {
        resultsText = await page.evaluate(() => {
          const tabs = document.querySelectorAll('.et_pb_tab');
          if (tabs.length === 0) return '';
          // Results is the first tab (Results/Standing)
          return tabs[0].innerText;
        });
      } else {
        resultsText = await page.evaluate(() => {
          const content = document.querySelector('#main-content') || document.body;
          return content.innerText;
        });
      }

      // Parse matches from text
      const lines = resultsText.split('\n').map(l => l.trim()).filter(Boolean);
      let currentDate = 'TBD 2025';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Update current date
        const dateMatch = line.match(/^(\d+(?:st|nd|rd|th)?\s+[A-Za-z]+|\d+\/\d+\/\d+)/);
        if (dateMatch) {
          currentDate = line.replace(/^\d+\s+September/, line); // Normalize year
          if (!currentDate.toLowerCase().includes('2025')) {
            currentDate += ' 2025';
          }
          continue;
        }

        // Identify result line (indicates end of a match block)
        const outcomeKeywords = ['beat', 'won', 'abandoned', 'postponed', 'walkover', 'tie', 'tied', 'no result'];
        const isOutcome = outcomeKeywords.some(k => line.toLowerCase().includes(k));
        
        if (isOutcome) {
          // The preceding 1 or 2 lines are the scorelines
          const possibleScorelines = [];
          if (i - 1 >= 0 && !outcomeKeywords.some(k => lines[i - 1].toLowerCase().includes(k)) && !lines[i - 1].match(/^(\d+(?:st|nd|rd|th)?\s+[A-Za-z]+)/)) {
            possibleScorelines.push(lines[i - 1]);
          }
          if (i - 2 >= 0 && !outcomeKeywords.some(k => lines[i - 2].toLowerCase().includes(k)) && !lines[i - 2].match(/^(\d+(?:st|nd|rd|th)?\s+[A-Za-z]+)/)) {
            possibleScorelines.unshift(lines[i - 2]);
          }

          if (possibleScorelines.length >= 2) {
            // Determine team names
            const res1 = parseMatchLine(possibleScorelines[0], currentDate, pageInfo.name, 'TBD');
            const res2 = parseMatchLine(possibleScorelines[1], currentDate, pageInfo.name, 'TBD');
            
            // Re-parse with correct opposition teams
            const arches1 = res1.isArches;
            const arches2 = res2.isArches;
            
            if (arches1 || arches2) {
              const opponent = arches1 ? res2.teamName : res1.teamName;
              
              const finalRes1 = parseMatchLine(possibleScorelines[0], currentDate, pageInfo.name, opponent);
              const finalRes2 = parseMatchLine(possibleScorelines[1], currentDate, pageInfo.name, opponent);
              
              finalHonours.push(...finalRes1.records);
              finalHonours.push(...finalRes2.records);
            }
          }
        }
      }

    } catch (err) {
      console.error(`Error scraping matches/honours for ${pageInfo.name}:`, err);
    }
    await page.close();
  }

  await browser.close();

  // Clean and filter Honours Board data
  const processedHonours = [];
  finalHonours.forEach(rec => {
    // Determine milestone category
    if (rec.type === 'batting') {
      const runs = rec.runs;
      if (rec.league === 'Midweek League') {
        if (runs >= 30) {
          processedHonours.push({
            name: rec.name,
            record: rec.formatted,
            type: 'batting',
            date: rec.date,
            opponent: rec.opponent,
            league: rec.league,
            season: '2025',
            category: 'midweek-30'
          });
        }
      } else {
        if (runs >= 100) {
          processedHonours.push({
            name: rec.name,
            record: rec.formatted,
            type: 'batting',
            date: rec.date,
            opponent: rec.opponent,
            league: rec.league,
            season: '2025',
            category: 'century'
          });
        } else if (runs >= 50) {
          processedHonours.push({
            name: rec.name,
            record: rec.formatted,
            type: 'batting',
            date: rec.date,
            opponent: rec.opponent,
            league: rec.league,
            season: '2025',
            category: 'half-century'
          });
        }
      }
    } else if (rec.type === 'bowling') {
      const wickets = rec.wickets;
      if (rec.league === 'Midweek League') {
        if (wickets >= 3) {
          processedHonours.push({
            name: rec.name,
            record: rec.formatted,
            type: 'bowling',
            date: rec.date,
            opponent: rec.opponent,
            league: rec.league,
            season: '2025',
            category: 'midweek-3w'
          });
        }
      } else {
        if (wickets >= 5) {
          processedHonours.push({
            name: rec.name,
            record: rec.formatted,
            type: 'bowling',
            date: rec.date,
            opponent: rec.opponent,
            league: rec.league,
            season: '2025',
            category: 'five-wickets'
          });
        }
      }
    }
  });

  // Save 2025 player stats
  const statsPath = path.join(__dirname, '../data/players_2025.json');
  fs.mkdirSync(path.dirname(statsPath), { recursive: true });
  fs.writeFileSync(statsPath, JSON.stringify(finalStats, null, 2));
  console.log(`Saved 2025 player stats compiled to ${statsPath}`);

  // Save 2025 honours board
  const honoursPath = path.join(__dirname, '../data/honours_2025.json');
  fs.writeFileSync(honoursPath, JSON.stringify(processedHonours, null, 2));
  console.log(`Saved 2025 Honours Board compiled to ${honoursPath} (${processedHonours.length} records)`);

})();

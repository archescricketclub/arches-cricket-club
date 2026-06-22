const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const LEAGUES = [
  { 
    name: 'Senior League 3', 
    url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#c1d034fd1-a70a-4c98-bf8e-5e6060e13c98',
    teamName: 'Arches 1st XI',
    prefix: 't1'
  },
  { 
    name: 'Junior League 10', 
    url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#c9a6acead-a912-4846-a8e6-0c95b25137d6',
    teamName: 'Arches 2nd XI',
    prefix: 't2'
  },
  { 
    name: 'Midweek League', 
    url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#ce89df381-8db9-449b-9046-6c84152083fb',
    teamName: 'Arches MW XI',
    prefix: 'mw'
  },
  {
    name: 'Junior Cup',
    url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#c84150658-3379-4e15-bc80-32c5f6a281eb',
    teamName: 'Arches 1st XI',
    prefix: 'cup'
  },
  {
    name: 'Development Cup',
    url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#cb51feb8b-2615-4f62-ba30-8cdc080657b1',
    teamName: 'Arches 2nd XI',
    prefix: 'cup'
  },
  {
    name: 'T20 Shield Cup',
    url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_statistics#c81a85c9d-6a55-4a21-8eef-b128fdca3ad1',
    teamName: 'Arches MW XI',
    prefix: 'cup'
  }
];

// Normalize name for robust matching
function matchPlayer(scrapedName, roster) {
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
  
  // Fallback to substring matching
  const cleanScrapedFull = cleanScraped.replace(/\s+/g, '');
  for (const player of roster) {
    const cleanRosterFull = player.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanRosterFull.includes(cleanScrapedFull) || cleanScrapedFull.includes(cleanRosterFull)) {
      return player;
    }
  }
  
  return null;
}

// Extract initials for unregistered players
function getInitials(name) {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().substring(0, 4);
}

(async () => {
  console.log('Starting NV Play Statistics Scraper...');
  
  // Load roster
  const rosterPath = path.join(__dirname, '../data/roster.json');
  let roster = [];
  if (fs.existsSync(rosterPath)) {
    try {
      roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
      console.log(`Loaded roster with ${roster.length} registered players.`);
    } catch (e) {
      console.error('Failed to parse roster.json:', e);
    }
  } else {
    console.warn('roster.json not found, matches will use default initials/jersey codes.');
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const finalOutput = {};
  const prefixRawData = {
    't1': { batting: [], bowling: [] },
    't2': { batting: [], bowling: [] },
    'mw': { batting: [], bowling: [] },
    'cup': { batting: [], bowling: [] }
  };

  try {
    for (const league of LEAGUES) {
      console.log(`\n===================================`);
      console.log(`Scraping ${league.name} (${league.teamName})...`);
      const page = await browser.newPage();
      
      try {
        // Set User-Agent and Viewport to avoid bot-detection and responsive layout issues
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

        // Navigate
        await page.goto(league.url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Wait for stats tab to load
        console.log('Waiting for Stats tab...');
        await page.waitForFunction(() => {
          const tabs = Array.from(document.querySelectorAll('.nvp-tabs__item'));
          return tabs.some(t => t.textContent.trim().toLowerCase() === 'stats');
        }, { timeout: 20000 });
        
        // Click Stats Tab
        await page.evaluate(() => {
          const tabs = Array.from(document.querySelectorAll('.nvp-tabs__item'));
          const statsTab = tabs.find(t => t.textContent.trim().toLowerCase() === 'stats');
          if (statsTab) statsTab.click();
        });
        
        // Wait for sub-tabs to appear
        console.log('Waiting for sub-tabs...');
        await page.waitForFunction(() => {
          const subtabs = Array.from(document.querySelectorAll('button.nvp-tabs__item'));
          return subtabs.some(t => t.textContent.trim().toLowerCase() === 'bowling');
        }, { timeout: 10000 });
        
        let rawBatting = [];
        let rawBowling = [];
        
        // ---------------- BATTING SCRAPE ----------------
        console.log('--- Scraping Batting Stats ---');
        
        // Click Batting sub-tab to be sure
        await page.evaluate(() => {
          const subtabs = Array.from(document.querySelectorAll('button.nvp-tabs__item'));
          const battingTab = subtabs.find(t => t.textContent.trim().toLowerCase() === 'batting');
          if (battingTab) battingTab.click();
        });
        await new Promise(r => setTimeout(r, 1000));
        
        // Click Show All under "Most Runs" (first visible show-all button)
        const clickedBattingShowAll = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.nvp-player-stats__show-all'));
          const visibleBtn = btns.find(b => b.offsetWidth > 0 || b.offsetHeight > 0);
          if (visibleBtn) {
            visibleBtn.click();
            return true;
          }
          return false;
        });
        
        if (!clickedBattingShowAll) {
          console.log('No visible "Show All" button found for Batting. Skipping detailed batting stats.');
        } else {
          // Wait for the select dropdown in the detailed view
          await page.waitForFunction(() => {
            const selects = Array.from(document.querySelectorAll('select.nvp-tab-toolbar__select, select.nvp-select, select.nvp-filter__select'));
            return selects.some(s => s.offsetWidth > 0 || s.offsetHeight > 0);
          }, { timeout: 10000 });
          
          // Filter by the Arches team in dropdown
          const battingFiltered = await page.evaluate((targetTeam) => {
            const selects = Array.from(document.querySelectorAll('select.nvp-tab-toolbar__select, select.nvp-select, select.nvp-filter__select'));
            const select = selects.find(s => s.offsetWidth > 0 || s.offsetHeight > 0);
            if (select) {
              const options = Array.from(select.options);
              const opt = options.find(o => o.text.toLowerCase().includes(targetTeam.toLowerCase()));
              if (opt) {
                select.value = opt.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
              }
            }
            return false;
          }, league.teamName);
          
          if (!battingFiltered) {
            console.warn(`Could not filter batting dropdown for ${league.teamName}`);
          }
          
          // Wait for rows to render
          await new Promise(r => setTimeout(r, 2000));
          
          // Extract Batting Rows
          rawBatting = await page.evaluate(() => {
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
          
          // Click back link to return to Summary
          await page.evaluate(() => {
            const backBtn = document.querySelector('a.nvp-back_link.nvp-tab-toolbar__back-link');
            if (backBtn) backBtn.click();
          });
          await new Promise(r => setTimeout(r, 2000));
        }
        
        // ---------------- BOWLING SCRAPE ----------------
        console.log('--- Scraping Bowling Stats ---');
        
        // Click Bowling sub-tab
        await page.evaluate(() => {
          const subtabs = Array.from(document.querySelectorAll('button.nvp-tabs__item'));
          const bowlingTab = subtabs.find(t => t.textContent.trim().toLowerCase() === 'bowling');
          if (bowlingTab) bowlingTab.click();
        });
        await new Promise(r => setTimeout(r, 2000));
        
        // Click Show All under "Most Wickets" (first visible show-all button on bowling tab)
        const clickedBowlingShowAll = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.nvp-player-stats__show-all'));
          const visibleBtn = btns.find(b => b.offsetWidth > 0 || b.offsetHeight > 0);
          if (visibleBtn) {
            visibleBtn.click();
            return true;
          }
          return false;
        });
        
        if (!clickedBowlingShowAll) {
          console.log('No visible "Show All" button found for Bowling. Skipping detailed bowling stats.');
        } else {
          // Wait for detailed view dropdown
          await page.waitForFunction(() => {
            const selects = Array.from(document.querySelectorAll('select.nvp-tab-toolbar__select, select.nvp-select, select.nvp-filter__select'));
            return selects.some(s => s.offsetWidth > 0 || s.offsetHeight > 0);
          }, { timeout: 10000 });
          
          // Filter by team
          const bowlingFiltered = await page.evaluate((targetTeam) => {
            const selects = Array.from(document.querySelectorAll('select.nvp-tab-toolbar__select, select.nvp-select, select.nvp-filter__select'));
            const select = selects.find(s => s.offsetWidth > 0 || s.offsetHeight > 0);
            if (select) {
              const options = Array.from(select.options);
              const opt = options.find(o => o.text.toLowerCase().includes(targetTeam.toLowerCase()));
              if (opt) {
                select.value = opt.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
              }
            }
            return false;
          }, league.teamName);
          
          if (!bowlingFiltered) {
            console.warn(`Could not filter bowling dropdown for ${league.teamName}`);
          }
          
          // Wait for rows to render
          await new Promise(r => setTimeout(r, 2000));
          
          // Extract Bowling Rows
          rawBowling = await page.evaluate(() => {
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
        }
        
        // Accumulate raw data
        prefixRawData[league.prefix].batting.push(...rawBatting);
        prefixRawData[league.prefix].bowling.push(...rawBowling);
        
      } catch (err) {
        console.error(`Error during scraping of ${league.name}:`, err);
      } finally {
        // Close page
        await page.close();
      }
    }
    
    // ---------------- PROCESS, MERGE, AND ENRICH DATA ----------------
    for (const prefix of ['t1', 't2', 'mw', 'cup']) {
      console.log(`\nProcessing and merging stats for prefix '${prefix}'...`);
      
      const rawBat = prefixRawData[prefix].batting;
      const rawBowl = prefixRawData[prefix].bowling;
      
      // 1. Merge Batting stats
      const mergedBatting = [];
      rawBat.forEach(p => {
        const match = matchPlayer(p.name, roster);
        const canonicalName = match ? match.name : p.name;
        
        const existing = mergedBatting.find(item => item.canonicalName === canonicalName);
        if (existing) {
          const runs1 = parseInt(existing.runs) || 0;
          const runs2 = parseInt(p.runs) || 0;
          existing.runs = (runs1 + runs2).toString();
          
          const hs1Str = existing.hs || '0';
          const hs2Str = p.hs || '0';
          const hs1Val = parseInt(hs1Str.replace('*', '')) || 0;
          const hs2Val = parseInt(hs2Str.replace('*', '')) || 0;
          if (hs2Val > hs1Val) {
            existing.hs = hs2Str;
          } else if (hs1Val === hs2Val && hs2Str.includes('*')) {
            existing.hs = hs2Str;
          }
          
          const avg1 = parseFloat(existing.avg) || 0;
          const avg2 = parseFloat(p.avg) || 0;
          const dismissals1 = avg1 > 0 ? (runs1 / avg1) : 0;
          const dismissals2 = avg2 > 0 ? (runs2 / avg2) : 0;
          const totalDismissals = dismissals1 + dismissals2;
          const totalRuns = runs1 + runs2;
          if (totalDismissals > 0) {
            existing.avg = (totalRuns / totalDismissals).toFixed(2);
          } else {
            existing.avg = totalRuns > 0 ? totalRuns.toFixed(2) : '0.00';
          }
        } else {
          mergedBatting.push({
            canonicalName,
            match,
            name: p.name,
            runs: p.runs,
            hs: p.hs,
            avg: p.avg
          });
        }
      });
      
      // 2. Merge Bowling stats
      const mergedBowling = [];
      rawBowl.forEach(p => {
        const match = matchPlayer(p.name, roster);
        const canonicalName = match ? match.name : p.name;
        
        const existing = mergedBowling.find(item => item.canonicalName === canonicalName);
        if (existing) {
          const overs1 = parseFloat(existing.overs) || 0;
          const overs2 = parseFloat(p.overs) || 0;
          const whole1 = Math.floor(overs1);
          const whole2 = Math.floor(overs2);
          const balls1 = Math.round((overs1 - whole1) * 10);
          const balls2 = Math.round((overs2 - whole2) * 10);
          const totalBalls = balls1 + balls2;
          const extraOvers = Math.floor(totalBalls / 6);
          const remainingBalls = totalBalls % 6;
          existing.overs = (whole1 + whole2 + extraOvers + (remainingBalls / 10)).toFixed(1);
          
          const wkts1 = parseInt(existing.wickets) || 0;
          const wkts2 = parseInt(p.wickets) || 0;
          existing.wickets = (wkts1 + wkts2).toString();
          
          const fig1Str = existing.bestFig || '-';
          const fig2Str = p.bestFig || '-';
          
          function parseFig(fig) {
            if (fig === '-' || !fig.includes('-')) return { w: 0, r: 999 };
            const parts = fig.split('-');
            return { w: parseInt(parts[0]) || 0, r: parseInt(parts[1]) || 999 };
          }
          
          const f1 = parseFig(fig1Str);
          const f2 = parseFig(fig2Str);
          if (f2.w > f1.w) {
            existing.bestFig = fig2Str;
          } else if (f2.w === f1.w && f2.r < f1.r) {
            existing.bestFig = fig2Str;
          }
        } else {
          mergedBowling.push({
            canonicalName,
            match,
            name: p.name,
            overs: p.overs,
            wickets: p.wickets,
            bestFig: p.bestFig
          });
        }
      });
      
      // 3. Format Batting
      const battingList = mergedBatting.map(p => {
        return {
          name: p.canonicalName,
          jersey: p.match ? p.match.jersey : '#—',
          cap: p.match ? p.match.cap : getInitials(p.name),
          stats: [
            { n: p.runs, l: 'Runs' },
            { n: p.hs, l: 'High Score' },
            { n: p.avg, l: 'Average' }
          ]
        };
      });
      
      // 4. Format Bowling
      const bowlingList = mergedBowling.map(p => {
        return {
          name: p.canonicalName,
          jersey: p.match ? p.match.jersey : '#—',
          cap: p.match ? p.match.cap : getInitials(p.name),
          stats: [
            { n: p.overs, l: 'Overs' },
            { n: p.wickets, l: 'Wickets' },
            { n: p.bestFig, l: 'Best Fig' }
          ]
        };
      });
      
      // 5. Badges
      if (battingList.length > 0) {
        battingList.sort((a, b) => parseInt(b.stats[0].n) - parseInt(a.stats[0].n));
        battingList[0].badge = `Top Scorer ${prefix === 'cup' ? 'Cup' : prefix.toUpperCase()}`;
      }
      
      if (bowlingList.length > 0) {
        bowlingList.sort((a, b) => parseInt(b.stats[1].n) - parseInt(a.stats[1].n));
        const topBowler = bowlingList[0];
        const bestFig = topBowler.stats[2].n;
        const wkts = topBowler.stats[1].n;
        topBowler.badge = (bestFig !== '-' && bestFig.startsWith('5')) 
          ? `${bestFig} · ${wkts} Wkts` 
          : `Top Wkt ${prefix === 'cup' ? 'Cup' : prefix.toUpperCase()}`;
      }
      
      // 6. Format All-Rounders
      const allRoundersList = [];
      battingList.forEach(batPlayer => {
        const bowlPlayer = bowlingList.find(b => b.name === batPlayer.name);
        if (bowlPlayer) {
          const runs = parseInt(batPlayer.stats[0].n) || 0;
          const wickets = parseInt(bowlPlayer.stats[1].n) || 0;
          const bestFig = bowlPlayer.stats[2].n;
          
          if (runs > 15 && wickets > 0) {
            allRoundersList.push({
              name: batPlayer.name,
              jersey: batPlayer.jersey,
              cap: batPlayer.cap,
              stats: [
                { n: runs.toString(), l: 'Runs' },
                { n: wickets.toString(), l: 'Wickets' },
                { n: bestFig, l: 'Best Fig' }
              ]
            });
          }
        }
      });
      
      allRoundersList.sort((a, b) => parseInt(b.stats[0].n) - parseInt(a.stats[0].n));
      
      finalOutput[`${prefix}-bat`] = battingList;
      finalOutput[`${prefix}-bowl`] = bowlingList;
      finalOutput[`${prefix}-ar`] = allRoundersList;
    }
    
    // Safety check: ensure we didn't scrape 0 records for all lists
    let totalRecords = 0;
    for (const key in finalOutput) {
      if (Array.isArray(finalOutput[key])) {
        totalRecords += finalOutput[key].length;
      }
    }

    if (totalRecords === 0) {
      console.error('\n===================================');
      console.error('ERROR: Scraped 0 player stats records. Aborting save to prevent overwriting existing data with empty arrays.');
      console.error('===================================');
      process.exit(1);
    }

    // Save
    const outPath1 = path.join(__dirname, '../data/players.json');
    const outPath2 = path.join(__dirname, '../public/data/players.json');
    
    fs.mkdirSync(path.dirname(outPath1), { recursive: true });
    fs.writeFileSync(outPath1, JSON.stringify(finalOutput, null, 2));
    
    fs.mkdirSync(path.dirname(outPath2), { recursive: true });
    fs.writeFileSync(outPath2, JSON.stringify(finalOutput, null, 2));
    
    console.log('\n===================================');
    console.log('Saved scraped player stats successfully to data/players.json and public/data/players.json!');
    
  } catch (err) {
    console.error('Error during scraping:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();

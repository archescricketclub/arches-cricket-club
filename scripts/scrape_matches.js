const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const URLS = [
  { name: 'Senior League 3', type: 'html', url: 'https://northerncricketunion.org/ncu-section-3-2026/' },
  { name: 'Junior League 10', type: 'html', url: 'https://northerncricketunion.org/junior-league-section-10-2026/' },
  { name: 'Midweek League', type: 'html', url: 'https://northerncricketunion.org/midweek-league-group-b-2026/' },
  { name: 'Junior Cup', type: 'nvplay', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_matches#c84150658-3379-4e15-bc80-32c5f6a281eb' },
  { name: 'Development Cup', type: 'nvplay', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_matches#cb51feb8b-2615-4f62-ba30-8cdc080657b1' },
  { name: 'T20 Shield Cup', type: 'nvplay', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_matches#c81a85c9d-6a55-4a21-8eef-b128fdca3ad1' }
];

async function loadAllItems(page) {
  let previousCount = 0;
  let currentCount = 0;
  let retries = 0;
  for (let scroll = 0; scroll < 15; scroll++) {
    previousCount = await page.evaluate(() => {
      const container = document.querySelector('[id^="competition-match-list-widget-container"], [id^="competition-centre-match-list"]');
      return container ? container.querySelectorAll('.nvp-match').length : 0;
    });
    
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 1000));
    
    currentCount = await page.evaluate(() => {
      const container = document.querySelector('[id^="competition-match-list-widget-container"], [id^="competition-centre-match-list"]');
      return container ? container.querySelectorAll('.nvp-match').length : 0;
    });
    
    if (currentCount === previousCount) {
      retries++;
      if (retries >= 3) break;
    } else {
      retries = 0;
    }
  }
}

function extractMatchesData() {
  const container = document.querySelector('[id^="competition-match-list-widget-container"], [id^="competition-centre-match-list"]');
  const cards = container ? container.querySelectorAll('.nvp-match') : [];
  const matchesData = [];
  let currentDate = 'TBD';
  
  cards.forEach(card => {
    // Skip wrapper containers if they contain nested cards
    if (card.querySelector('.nvp-match')) {
      return;
    }
    
    const teamNodes = card.querySelectorAll('.nvp-match__team-name');
    if (teamNodes.length >= 2) {
      const homeTeam = teamNodes[0].innerText.trim();
      const awayTeam = teamNodes[1].innerText.trim();
      
      // For cups, filter for Arches
      if (!homeTeam.toLowerCase().includes('arches') && !awayTeam.toLowerCase().includes('arches')) {
        return;
      }

      const dateNode = card.querySelector('.nvp-match__date');
      if (dateNode) {
        const dateText = dateNode.innerText.trim();
        if (dateText) {
          currentDate = dateText;
        }
      }

      const timeNode = card.querySelector('.nvp-match__start_time, .nvp-match__time');
      const venueNode = card.querySelector('.nvp-match__meta p');
      
      const outcomeNode = card.querySelector('.nvp-match__outcome');
      const statusNode = card.querySelector('.nvp-match__status, .nvp-match_status');
      
      let resultText = '';
      if (outcomeNode && outcomeNode.innerText.trim()) {
        resultText = outcomeNode.innerText.trim();
      } else if (statusNode && statusNode.innerText.trim()) {
        resultText = statusNode.innerText.trim();
      }

      matchesData.push({
        homeTeam,
        awayTeam,
        date: currentDate,
        time: timeNode ? timeNode.innerText.trim() : '',
        venue: venueNode ? venueNode.innerText.trim() : 'TBD',
        status: resultText
      });
    }
  });
  return matchesData;
}

async function scrapeHtmlLeaguePage(page, leagueName) {
  return await page.evaluate((leagueName) => {
    const decodeHtml = (html) => {
      return html
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
    };
    
    const tabs = document.querySelectorAll('.et_pb_tab');
    if (tabs.length < 2) {
      return { fixtures: [], results: [], error: 'Less than 2 tabs found' };
    }
    
    const resultsTab = tabs[0];
    const fixturesTab = tabs[1];
    
    // --- Parse Fixtures ---
    const fixtures = [];
    const pTagsFixtures = fixturesTab.querySelectorAll('.et_pb_tab_content p');
    pTagsFixtures.forEach(p => {
      const strongDate = p.querySelector('strong');
      if (!strongDate) return;
      
      const dateText = decodeHtml(strongDate.innerText.trim());
      
      const htmlContent = p.innerHTML;
      const parts = htmlContent.split(/<br\s*\/?>/i);
      
      parts.forEach(part => {
        const cleanPart = decodeHtml(part.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
        if (!cleanPart) return;
        
        // Skip header date text or placeholders
        if (cleanPart === dateText || 
            cleanPart.toLowerCase().includes('cup qf') || 
            cleanPart.toLowerCase().includes('cup sf') || 
            cleanPart.toLowerCase().includes('semi-finals') || 
            cleanPart.toLowerCase().includes('final')) {
          return;
        }
        
        // Match string: "Team A v Team B (at Ground)"
        if (cleanPart.includes(' v ')) {
          let matchStr = cleanPart.replace(/^\([^)]+\)\s*/, ''); // strip leading info like "(Week 9)"
          
          let venue = 'TBD';
          const venueMatch = matchStr.match(/\(at ([^)]+)\)/);
          if (venueMatch) {
            venue = venueMatch[1].trim();
            matchStr = matchStr.replace(/\(at [^)]+\)/, '').trim();
          }
          
          const teams = matchStr.split(' v ');
          if (teams.length >= 2) {
            fixtures.push({
              homeTeam: teams[0].trim(),
              awayTeam: teams[1].trim(),
              date: dateText,
              time: '11:00 AM', // default start time
              venue: venue,
              status: '',
              league: leagueName
            });
          }
        }
      });
    });
    
    // --- Parse Results ---
    const results = [];
    const pTagsResults = resultsTab.querySelectorAll('.et_pb_tab_content p');
    let currentDate = 'TBD';
    
    pTagsResults.forEach(p => {
      const html = p.innerHTML;
      const lines = html.split(/<br\s*\/?>/i).map(line => {
        return decodeHtml(line.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
      }).filter(Boolean);
      
      if (lines.length === 0) return;
      
      let startIdx = 0;
      
      // Update currentDate if the paragraph starts with a date header
      const dateMatch = lines[0].match(/^(\d+(?:st|nd|rd|th)?\s+[A-Za-z]+|\d+\/\d+\/\d+)/);
      if (dateMatch) {
        currentDate = lines[0];
        startIdx = 1;
      }
      
      const matchLines = lines.slice(startIdx);
      if (matchLines.length === 0) return;
      
      // Locate the outcome/result status line
      const outcomeKeywords = ['beat', 'won', 'abandoned', 'postponed', 'walkover', 'tie', 'tied', 'no result'];
      let resultIdx = -1;
      for (let i = matchLines.length - 1; i >= 0; i--) {
        const lineLower = matchLines[i].toLowerCase();
        const isOutcome = outcomeKeywords.some(k => lineLower.includes(k));
        if (isOutcome) {
          resultIdx = i;
          break;
        }
      }
      
      // Default to last line if no outcome keyword matched
      if (resultIdx === -1) {
        resultIdx = matchLines.length - 1;
      }
      
      const resultText = matchLines[resultIdx];
      const scoreLines = matchLines.slice(0, resultIdx);
      
      let homeTeam = 'TBD';
      let awayTeam = 'TBD';
      
      const parseTeamFromScoreLine = (str) => {
        let cleaned = str.replace(/\s+inc\s+.*$/i, '').trim();
        const p1 = /^(.*?)\s+\d+-\d+(?:\s*\(|$)/i;
        let m = cleaned.match(p1);
        if (m) return m[1].trim();
        const p2 = /^(.*?)\s+\d+(?:\s*\(|$)/i;
        m = cleaned.match(p2);
        if (m) return m[1].trim();
        return cleaned;
      };
      
      if (scoreLines.length >= 2) {
        homeTeam = parseTeamFromScoreLine(scoreLines[0]);
        awayTeam = parseTeamFromScoreLine(scoreLines[1]);
      } else {
        // Fallback for single line postponed/abandoned matches
        const cleanResultLine = resultText.replace(/–|-/g, ' - ');
        if (cleanResultLine.includes(' v ')) {
          const teamsPart = cleanResultLine.split(' - ')[0];
          const parts = teamsPart.split(' v ');
          if (parts.length >= 2) {
            homeTeam = parts[0].trim();
            awayTeam = parts[1].trim();
          }
        } else if (cleanResultLine.includes(' vs ')) {
          const teamsPart = cleanResultLine.split(' - ')[0];
          const parts = teamsPart.split(' vs ');
          if (parts.length >= 2) {
            homeTeam = parts[0].trim();
            awayTeam = parts[1].trim();
          }
        }
      }
      
      results.push({
        date: currentDate,
        league: leagueName,
        homeTeam,
        awayTeam,
        venue: 'TBD', // default venue since results rarely state venue directly in list
        result: resultText
      });
    });
    
    return { fixtures, results };
  }, leagueName);
}

(async () => {
  console.log('Starting Northern Cricket Union match scraper...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const allFixtures = [];
  const allResults = [];

  for (const league of URLS) {
    console.log(`\n===================================`);
    console.log(`Scraping ${league.name}...`);
    const page = await browser.newPage();
    
    try {
      if (league.type === 'html') {
        await page.goto(league.url, { waitUntil: 'networkidle2', timeout: 60000 });
        const res = await scrapeHtmlLeaguePage(page, league.name);
        if (res.error) {
          console.error(`Failed to scrape HTML for ${league.name}: ${res.error}`);
        } else {
          console.log(`Extracted ${res.fixtures.length} fixtures and ${res.results.length} results from HTML!`);
          allFixtures.push(...res.fixtures);
          allResults.push(...res.results);
        }
      } else if (league.type === 'nvplay') {
        await page.goto(league.url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Wait for sub-tabs inside competition container
        console.log('Waiting for sub-tabs inside competition container...');
        await page.waitForFunction(() => {
          const container = document.querySelector('[id^="competition-match-list-widget-container"], [id^="competition-centre-match-list"]');
          if (!container) return false;
          const subtabs = Array.from(container.querySelectorAll('button.nvp-tabs__item'));
          return subtabs.some(t => t.textContent.trim().toLowerCase() === 'results') &&
                 subtabs.some(t => t.textContent.trim().toLowerCase() === 'fixtures');
        }, { timeout: 30000 });

        // --- 1. SCRAPE FIXTURES ---
        console.log('Clicking Fixtures sub-tab...');
        await page.evaluate(() => {
          const container = document.querySelector('[id^="competition-match-list-widget-container"], [id^="competition-centre-match-list"]');
          if (container) {
            const subtabs = Array.from(container.querySelectorAll('button.nvp-tabs__item'));
            const tab = subtabs.find(t => t.textContent.trim().toLowerCase() === 'fixtures');
            if (tab) tab.click();
          }
        });
        await new Promise(r => setTimeout(r, 3000));
        
        console.log('Loading all fixtures...');
        await loadAllItems(page);
        
        const fixtures = await page.evaluate(extractMatchesData);
        console.log(`Extracted ${fixtures.length} cup fixtures`);
        fixtures.forEach(m => {
          m.league = league.name;
          allFixtures.push(m);
        });

        // --- 2. SCRAPE RESULTS ---
        console.log('Clicking Results sub-tab...');
        await page.evaluate(() => {
          const container = document.querySelector('[id^="competition-match-list-widget-container"], [id^="competition-centre-match-list"]');
          if (container) {
            const subtabs = Array.from(container.querySelectorAll('button.nvp-tabs__item'));
            const tab = subtabs.find(t => t.textContent.trim().toLowerCase() === 'results');
            if (tab) tab.click();
          }
        });
        await new Promise(r => setTimeout(r, 3000));

        console.log('Loading all results...');
        await loadAllItems(page);

        const results = await page.evaluate(extractMatchesData);
        console.log(`Extracted ${results.length} cup results`);
        results.forEach(m => {
          allResults.push({
            date: m.date,
            league: league.name,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            venue: m.venue,
            result: m.status
          });
        });
      }
    } catch (e) {
      console.error(`Failed to scrape ${league.name}:`, e);
    }
    
    await page.close();
  }

  await browser.close();

  const outputData = {
    fixtures: allFixtures,
    results: allResults,
    lastUpdated: new Date().toISOString()
  };

  const outPath1 = path.join(__dirname, '../data/matches.json');
  const outPath2 = path.join(__dirname, '../public/data/matches.json');
  
  fs.mkdirSync(path.dirname(outPath1), { recursive: true });
  fs.writeFileSync(outPath1, JSON.stringify(outputData, null, 2));
  
  fs.mkdirSync(path.dirname(outPath2), { recursive: true });
  fs.writeFileSync(outPath2, JSON.stringify(outputData, null, 2));

  console.log('\n===================================');
  console.log(`Saved ${allFixtures.length} fixtures and ${allResults.length} results successfully!`);
  console.log('Saved data to data/matches.json and public/data/matches.json');
})();

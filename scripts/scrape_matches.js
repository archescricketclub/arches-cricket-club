const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const URLS = [
  { name: 'Senior League 3', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_matches#c1d034fd1-a70a-4c98-bf8e-5e6060e13c98' },
  { name: 'Junior League 10', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_matches#c9a6acead-a912-4846-a8e6-0c95b25137d6' },
  { name: 'Midweek League', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_matches#ce89df381-8db9-449b-9046-6c84152083fb' },
  { name: 'Junior Cup', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_matches#c84150658-3379-4e15-bc80-32c5f6a281eb' },
  { name: 'Development Cup', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_matches#cb51feb8b-2615-4f62-ba30-8cdc080657b1' },
  { name: 'T20 Shield Cup', url: 'https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_matches#c81a85c9d-6a55-4a21-8eef-b128fdca3ad1' }
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
      
      // If this match doesn't involve Arches, skip
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

(async () => {
  console.log('Starting NV Play scraper...');
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
      await page.goto(league.url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Wait for sub-tabs to render inside competition container
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
      console.log(`Extracted ${fixtures.length} fixtures`);
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
      console.log(`Extracted ${results.length} results`);
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

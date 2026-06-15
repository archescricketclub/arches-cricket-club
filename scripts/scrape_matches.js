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

(async () => {
  console.log('Starting NV Play scraper...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const allFixtures = [];
  const allResults = [];

  for (const league of URLS) {
    console.log(`Scraping ${league.name}...`);
    const page = await browser.newPage();
    try {
      await page.goto(league.url, { waitUntil: 'networkidle2', timeout: 60000 });
      await new Promise(r => setTimeout(r, 6000)); // Wait for the widget

      const extractedMatches = await page.evaluate(() => {
        const matchNodes = document.querySelectorAll('.nvp-match__details, .nvp-match__col, .nvp-match');
        const matchesData = [];

        // Try to locate match cards
        const cards = document.querySelectorAll('.nvp-match');
        cards.forEach(card => {
          const teamNodes = card.querySelectorAll('.nvp-match__team-name');
          if (teamNodes.length >= 2) {
             const homeTeam = teamNodes[0].innerText.trim();
             const awayTeam = teamNodes[1].innerText.trim();
             
             // If this match doesn't involve Arches, skip
             if (!homeTeam.toLowerCase().includes('arches') && !awayTeam.toLowerCase().includes('arches')) {
                return;
             }

             const dateNode = card.querySelector('.nvp-match__date');
             const timeNode = card.querySelector('.nvp-match__time');
             const venueNode = card.querySelector('.nvp-match__ground');
             const statusNode = card.querySelector('.nvp-match__status');

             const matchInfo = {
                homeTeam,
                awayTeam,
                date: dateNode ? dateNode.innerText.trim() : 'TBD',
                time: timeNode ? timeNode.innerText.trim() : 'TBD',
                venue: venueNode ? venueNode.innerText.trim() : 'TBD',
                status: statusNode ? statusNode.innerText.trim() : ''
             };

             matchesData.push(matchInfo);
          }
        });
        
        return matchesData;
      });

      console.log(`Extracted ${extractedMatches.length} matches for ${league.name}`);

      extractedMatches.forEach(m => {
        m.league = league.name;
        // Basic classification: if status has words like 'won', 'lost', 'abandoned', 'tied', it's a result
        const isResult = m.status.toLowerCase().includes('won') || 
                         m.status.toLowerCase().includes('lost') || 
                         m.status.toLowerCase().includes('abandoned') ||
                         m.status.toLowerCase().includes('result');
        if (isResult) {
            allResults.push({
                date: m.date,
                league: m.league,
                homeTeam: m.homeTeam,
                awayTeam: m.awayTeam,
                venue: m.venue,
                result: m.status
            });
        } else {
            allFixtures.push(m);
        }
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

  console.log('Saved data to data/matches.json and public/data/matches.json');
})();

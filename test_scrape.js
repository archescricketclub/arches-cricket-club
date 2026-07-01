const puppeteer = require('puppeteer');

async function scrapeHtmlLeaguePage(page, leagueName) {
  return await page.evaluate((leagueName) => {
    const fixtures = [];
    const results = [];
    
    const rows = document.querySelectorAll('tr');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 3) return;
      
      const dateText = cells[0].innerText.trim();
      const matchText = cells[1].innerText.trim();
      
      // Match text usually like "Team A vs Team B" or "Team A v Team B"
      let teams = matchText.split(/\s+vs\s+|\s+v\s+/i);
      if (teams.length < 2) return;
      
      const homeTeam = teams[0].trim();
      const awayTeam = teams[1].trim();
      
      // Check if it's a result row
      let resultText = '';
      if (cells.length > 2) {
        resultText = cells[cells.length - 1].innerText.trim();
      }
      
      const isResult = resultText && resultText.toLowerCase().includes('beat') || 
                       resultText.toLowerCase().includes('won') || 
                       resultText.toLowerCase().includes('tied') ||
                       resultText.toLowerCase().includes('abandoned') ||
                       resultText.toLowerCase().includes('no result');
                       
      // Sometimes results are in the match text or a different cell
      
      if (!isResult) {
        fixtures.push({
          homeTeam,
          awayTeam,
          date: dateText,
          time: '11:00 AM', // Default assumption or try to parse
          venue: 'TBD',
          status: '',
          league: leagueName
        });
      } else {
        results.push({
          date: dateText,
          league: leagueName,
          homeTeam,
          awayTeam,
          venue: 'TBD',
          result: resultText,
          scorelines: []
        });
      }
    });
    
    return { fixtures, results };
  }, leagueName);
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://northerncricketunion.org/ncu-section-3-2026/', { waitUntil: 'networkidle2' });
  const data = await scrapeHtmlLeaguePage(page, 'Senior League 3');
  
  const archesFixtures = data.fixtures.filter(f => f.homeTeam.toLowerCase().includes('arches') || f.awayTeam.toLowerCase().includes('arches'));
  console.log("Arches Fixtures found on HTML:", JSON.stringify(archesFixtures, null, 2));
  
  await browser.close();
})();

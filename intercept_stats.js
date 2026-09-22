const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // We want to intercept network requests to see if there's an API for stats
    const requests = [];
    page.on('response', async res => {
      const url = res.url();
      if (url.includes('api/') && url.includes('stats')) {
        requests.push(url);
        try {
          const json = await res.json();
          fs.writeFileSync('nv_play_stats_api.json', JSON.stringify(json, null, 2));
          console.log('Saved stats API response');
        } catch(e) {}
      }
    });
    
    await page.goto('https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_stats#c42955698-0385-447f-8070-185a03b349bb', { waitUntil: 'networkidle2' });
    
    fs.writeFileSync('network_requests_2.json', JSON.stringify(requests, null, 2));
    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
})();

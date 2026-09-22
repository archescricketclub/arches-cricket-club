const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    const requests = [];
    page.on('request', request => {
      requests.push({ url: request.url(), method: request.method() });
    });
    
    await page.goto('https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_stats#c42955698-0385-447f-8070-185a03b349bb', { waitUntil: 'networkidle2' });
    
    fs.writeFileSync('network_requests.json', JSON.stringify(requests, null, 2));
    console.log('Intercepted', requests.length, 'requests.');
    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
})();

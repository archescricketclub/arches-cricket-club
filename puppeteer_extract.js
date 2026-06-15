const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('match') || url.includes('json')) {
      console.log('API Request:', request.method(), url);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('match') || url.includes('json')) {
        console.log('API Response:', response.status(), url);
    }
  });

  console.log('Navigating to page...');
  await page.goto('https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_matches#c1d034fd1-a70a-4c98-bf8e-5e6060e13c98', { waitUntil: 'networkidle2' });
  
  // Wait a bit more for dynamic content
  await new Promise(r => setTimeout(r, 5000));
  
  const content = await page.content();
  const fs = require('fs');
  fs.writeFileSync('rendered_page.html', content);

  await browser.close();
  console.log('Done.');
})();

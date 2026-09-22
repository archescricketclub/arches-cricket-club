const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating...');
    await page.goto('https://northerncricketunion.org/ncu-nv-play-match-zone/?tab=c_stats#c42955698-0385-447f-8070-185a03b349bb', { waitUntil: 'networkidle2' });
    
    console.log('Waiting 3s for cookie banner...');
    await new Promise(r => setTimeout(r, 3000));
    
    // Try to click Accept Cookies
    try {
      const btn = await page.$('#wt-cli-accept-all-btn');
      if (btn) {
        console.log('Clicking accept cookies...');
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch(e) { console.log('No cookie btn found'); }
    
    console.log('Taking screenshot for debugging...');
    await page.screenshot({ path: 'nv_play_debug.png' });
    
    console.log('Extracting inner HTML of body...');
    const html = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('nv_play_body.html', html);
    
    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
})();

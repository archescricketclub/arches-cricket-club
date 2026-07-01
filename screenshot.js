const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 }); // iPhone SE size
  await page.goto(`file://${__dirname}/index.html`);
  
  // click hamburger
  await page.click('#hamburger');
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'mobile-menu.png' });
  await browser.close();
  console.log("Screenshot saved to mobile-menu.png");
})();

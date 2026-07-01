const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`file://${__dirname}/index.html`);
  
  await new Promise(r => setTimeout(r, 2000)); // wait for js to load
  
  await page.screenshot({ path: 'home-issue.png', fullPage: true });
  await browser.close();
  console.log("Screenshot saved to home-issue.png");
})();

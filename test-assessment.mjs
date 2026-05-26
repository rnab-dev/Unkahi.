import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  console.log("Navigating to app...");
  await page.goto('http://localhost:5173');
  
  // Wait for the welcome page
  await page.waitForSelector('button');
  
  // Find "Start Assessment" button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Start Assessment') || text.includes('Begin Check-in')) {
      console.log("Clicking Start Assessment...");
      await btn.click();
      break;
    }
  }
  
  // Just click the first option repeatedly until finished
  let step = 0;
  while (step < 20) {
    try {
      await page.waitForSelector('button', { timeout: 2000 });
      // The options are usually the buttons with no specific text, let's just click the first option we find
      const opts = await page.$$('button');
      // Click the first one that looks like an option (not 'Back')
      for (const opt of opts) {
        const text = await page.evaluate(el => el.textContent, opt);
        if (!text.includes('Back') && !text.includes('Skip') && !text.includes('Start')) {
          console.log(`Clicking option on step ${step}...`);
          await opt.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 1000)); // wait for fade
      step++;
    } catch (e) {
      console.log("No more options or error:", e.message);
      break;
    }
  }
  
  console.log("Waiting 3 seconds to see if it crashes...");
  await new Promise(r => setTimeout(r, 3000));
  
  await browser.close();
  console.log("Done.");
})();

// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/library-browser.cjs [URL]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage();
    const responses = [], errors = [];
    page.on('response', r => { if (/dhtmlxgantt\.(js|css)$/.test(r.url())) responses.push([r.url(), r.status()]); });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.argv[2] || 'file://' + require('node:path').resolve(__dirname, '../index.html'));
    await page.waitForSelector('#welcome-demo-btn');
    assert.equal(await page.evaluate(() => gantt.version), '10.0.3');
    const base = 'https://cdn.jsdelivr.net/npm/dhtmlx-gantt@10.0.3/codebase/dhtmlxgantt.';
    assert.deepEqual(responses.sort(), [[base + 'css', 200], [base + 'js', 200]]);
    await page.click('#welcome-demo-btn');
    await page.waitForSelector('.gantt_task_line');
    for (const zoom of ['day', 'week', 'month', 'quarter']) await page.locator(`[data-zoom="${zoom}"]`).click();
    assert.deepEqual(errors, []);
    console.log('DHTMLX 10.0.3 JS/CSS loaded, demo and four scales passed');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

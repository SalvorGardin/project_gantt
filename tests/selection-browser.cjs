// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/selection-browser.cjs [URL]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.argv[2] || 'file://' + require('node:path').resolve(__dirname,'../index.html'));
    await page.waitForSelector('#welcome-demo-btn');
    await page.click('#welcome-demo-btn');
    const row = page.locator('.gantt_row[task_id="task_1"] .gantt_tree_content').first();
    await row.click();
    assert.match(await page.locator('#status-selected').textContent(), /Системный анализ/);
    assert.equal(await page.locator('#status-unsaved').isVisible(),false);
    await row.dblclick();
    await page.locator('#edit-title').fill('<b>Новое имя</b>');
    await page.click('#btn-save-task');
    assert.equal(await page.locator('#status-selected').textContent(), 'Выбрано: <b>Новое имя</b>');
    assert.equal(await page.locator('#status-selected b').count(),0);
    await page.locator('.gantt_task_bg').click({position:{x:20,y:700}});
    assert.equal(await page.locator('#status-selected').textContent(),'Ничего не выбрано');
    await row.click();
    await row.click({button:'right'});
    await page.click('#ctx-delete');
    await page.click('#btn-ok-confirm');
    assert.equal(await page.locator('#status-selected').textContent(),'Ничего не выбрано');
    await page.locator('.gantt_row[task_id="task_2"] .gantt_tree_content').first().click();
    await page.click('#btn-new-project');
    await page.locator('#new-project-name').fill('Другой');
    await page.click('#btn-create-project');
    await page.click('#btn-ok-confirm');
    assert.equal(await page.locator('#status-selected').textContent(),'Ничего не выбрано');
    assert.deepEqual(errors,[]);
    console.log('Selection, clean state, rename, literal text, empty click, deletion and project replacement passed');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});

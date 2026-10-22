// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/emoji-browser.cjs [URL]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless:true, ...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE}:{}) });
  try {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.argv[2] || 'file://'+require('node:path').resolve(__dirname,'../index.html'));
    await page.click('#welcome-demo-btn');
    await page.locator('.gantt_row[task_id="task_1"] .gantt_tree_content').first().dblclick();
    await page.waitForFunction(()=>document.activeElement.id==='edit-title');
    const trigger=page.locator('#emoji-trigger');
    let chosen;
    for (const key of ['Enter','Space']) {
      await trigger.focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab'); // title input precedes the picker in DOM order
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('emoji-picker-item')),true);
      await page.keyboard.press('Tab');
      chosen=await page.evaluate(()=>document.activeElement.textContent);
      await page.keyboard.press(key);
      assert.equal(await trigger.textContent(),chosen);
      assert.equal(await page.locator('#emoji-picker').isVisible(),false);
      assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
    }
    await page.click('#btn-save-task');
    assert.equal(await page.evaluate(()=>gantt.getTask('task_1').emoji),chosen);
    await page.locator('.gantt_row[task_id="task_1"] .gantt_tree_content').first().dblclick();
    assert.equal(await trigger.textContent(),chosen);
    assert.deepEqual(errors,[]);
    console.log('Emoji Tab, Enter, Space, focus return and saved editor value passed');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

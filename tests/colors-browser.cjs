// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/colors-browser.cjs [URL]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.argv[2] || 'file://'+require('node:path').resolve(__dirname,'../index.html'));
    await page.click('#welcome-demo-btn');
    const row=page.locator('.gantt_row[task_id="task_1"] .gantt_tree_content').first();
    await row.dblclick();
    await page.waitForFunction(()=>document.activeElement.id==='edit-title');
    const colors=[['Синий','#3b82f6'],['Зелёный','#10b981'],['Янтарный','#f59e0b'],['Красный','#ef4444'],['Фиолетовый','#8b5cf6'],['Бирюзовый','#06b6d4'],['Розовый','#ec4899'],['Серый','#64748b']];
    for (const [i,[name,value]] of colors.entries()) {
      const button=page.getByRole('button',{name:name+' цвет',exact:true});
      assert.equal(await button.count(),1);
      assert.equal(await button.getAttribute('data-color'),value);
      if(i===0) await button.click();
      else {
        await page.keyboard.press('Tab');
        assert.equal(await button.evaluate(el=>el===document.activeElement),true);
        await page.keyboard.press(i%2 ? 'Enter':'Space');
      }
      assert.equal(await page.locator('#edit-color').inputValue(),value);
    }
    await page.click('#btn-save-task');
    assert.equal(await page.evaluate(()=>gantt.getTask('task_1').color),'#64748b');
    await row.dblclick();
    assert.equal(await page.locator('#edit-color').inputValue(),'#64748b');
    assert.deepEqual(errors,[]);
    console.log('Eight accessible color names, mouse/Tab/Enter/Space selection and saved value passed');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

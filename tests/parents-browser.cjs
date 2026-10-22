// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/parents-browser.cjs [URL]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, timezoneId: 'Europe/Moscow' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.argv[2] || 'file://' + require('node:path').resolve(__dirname, '../index.html'));
    await page.waitForSelector('#welcome-demo-btn');
    const item = (id, parent_id, start_date, end_date, type = 'task') => ({ id, parent_id, type, title: id, start_date, end_date });
    const project = { schema_version: 1, project: { id: 'parents', name: 'Родители' }, links: [], items: [
      item('root', null, '2026-10-01', '2026-10-20', 'group'),
      item('nested', 'root', '2026-10-01', '2026-10-20'),
      item('a', 'nested', '2026-10-01', '2026-10-10'),
      item('b', 'nested', '2026-10-10', '2026-10-20'),
      item('other', null, '2026-10-02', '2026-10-04', 'group'),
      item('c', 'other', '2026-10-02', '2026-10-04')
    ] };
    await page.locator('#welcome-file-input').setInputFiles({ name: 'parents.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
    await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
    const check = async (id, start, end, duration) => {
      const actual = await page.evaluate(id => {
        const t = gantt.getTask(id), fmt = gantt.date.date_to_str('%Y-%m-%d');
        return [fmt(t.start_date), fmt(t.end_date), t.duration];
      }, id);
      assert.deepEqual(actual, [start, end, duration], id);
    };
    await page.evaluate(() => gantt.callEvent('onTaskDblClick', ['b', new MouseEvent('dblclick')]));
    await page.locator('#edit-end').fill('2026-10-11');
    await page.click('#btn-save-task');
    await check('nested', '2026-10-01', '2026-10-12', 11);
    await check('root', '2026-10-01', '2026-10-12', 11);
    await page.evaluate(() => {
      const a = gantt.getTask('a');
      a.start_date = new Date(2026, 8, 29);
      gantt.updateTask('a');
      gantt.callEvent('onAfterTaskDrag', ['a']);
    });
    await check('root', '2026-09-29', '2026-10-12', 13);
    await page.evaluate(() => gantt.deleteTask('a'));
    await check('nested', '2026-10-10', '2026-10-12', 2);
    await check('root', '2026-10-10', '2026-10-12', 2);
    await page.evaluate(() => gantt.moveTask('b', 0, 'other'));
    await check('nested', '2026-10-10', '2026-10-12', 2);
    await check('other', '2026-10-02', '2026-10-12', 10);
    await page.evaluate(() => gantt.addTask({ id: 'new', text: 'new', start_date: new Date(2026, 9, 1), end_date: new Date(2026, 9, 5) }, 'nested'));
    await check('root', '2026-10-01', '2026-10-05', 4);
    // A deep chain used to revisit ancestors exponentially.
    const updates = await page.evaluate(() => {
      for (let i = 0; i < 20; i++) gantt.addTask({ id: 'deep'+i, text: 'deep', start_date: new Date(2026, 9, 1), end_date: new Date(2026, 9, 5) }, i ? 'deep'+(i-1) : 'nested');
      let count = 0;
      const event = gantt.attachEvent('onAfterTaskUpdate', () => count++);
      const leaf = gantt.getTask('deep19');
      leaf.end_date = new Date(2026, 9, 25);
      gantt.updateTask(leaf.id);
      gantt.detachEvent(event);
      return count;
    });
    assert.ok(updates <= 23, `too many updates: ${updates}`);
    await check('root', '2026-10-01', '2026-10-25', 24);
    const pending = page.waitForEvent('download');
    await page.click('#btn-save');
    const stream = await (await pending).createReadStream();
    let text = ''; for await (const chunk of stream) text += chunk;
    const saved = JSON.parse(text);
    assert.equal(saved.schema_version, 1);
    assert.equal(saved.items.find(t => t.id === 'root').end_date, '2026-10-25');
    assert.deepEqual(errors, []);
    console.log(`Parent dates: editor, update/drag event, add, delete, move, empty parent, 20 levels (${updates} updates), JSON passed`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

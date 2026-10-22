// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/mouse-browser.cjs [URL]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, timezoneId: 'Europe/Moscow' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.argv[2] || 'file://' + require('node:path').resolve(__dirname, '../index.html'));
    await page.waitForSelector('#welcome-demo-btn');
    const item = (id, parent_id, start, end, type = 'task') => ({ id, parent_id, type, title: id, start_date: `2026-10-${start}`, end_date: `2026-10-${end}`, is_expanded: true });
    const project = { schema_version: 1, project: { id: 'mouse', name: 'Mouse' }, links: [], items: [
      item('root', null, '05', '16', 'group'), item('source', 'root', '05', '16'),
      item('a', 'source', '05', '09'), item('b', 'source', '12', '16'),
      item('target', null, '06', '08', 'group'), item('target-task', 'target', '06', '08'),
      item('c', 'target-task', '06', '08'), item('later', null, '22', '25')
    ] };
    await page.locator('#welcome-file-input').setInputFiles({ name: 'mouse.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
    await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
    await page.waitForTimeout(1800); // initial delayed today-scroll and hint
    await page.locator('[data-zoom="day"]').click();
    await page.evaluate(() => {
      gantt.showDate(new Date(2026, 9, 3));
      window.dragEvents = [];
      for (const name of ['onRowDragStart', 'onBeforeTaskMove', 'onAfterTaskMove', 'onRowDragEnd', 'onAfterTaskDrag']) {
        gantt.attachEvent(name, id => { window.dragEvents.push([name, id, gantt.getTask(id).parent]); return true; });
      }
    });
    const snapshot = () => page.evaluate(() => {
      const result = {};
      const fmt = gantt.date.date_to_str('%Y-%m-%d');
      gantt.eachTask(t => result[t.id] = [t.parent, fmt(t.start_date), fmt(t.end_date), t.duration]);
      return result;
    });
    const drag = async (x, y, dx, dy) => {
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + dx, y + dy, { steps: 20 });
      await page.mouse.up();
    };
    const bar = id => page.locator(`.gantt_task_line[task_id="${id}"]`);
    let box = await bar('b').boundingBox();
    const day = box.width / 4;
    await drag(box.x + box.width / 2, box.y + 6, day * 2, 0);
    let data = await snapshot();
    assert.deepEqual(data.b.slice(1), ['2026-10-14', '2026-10-18', 4]);
    assert.deepEqual(data.source.slice(1), ['2026-10-05', '2026-10-18', 13]);
    assert.deepEqual(data.root.slice(1), data.source.slice(1));
    await page.evaluate(() => gantt.showDate(new Date(2026, 9, 10)));
    await bar('b').hover();
    box = await bar('b').locator('.gantt_task_drag[data-bind-property="end_date"]').boundingBox();

    await drag(box.x + box.width / 2, box.y + box.height / 2, -day * 2, 0);
    data = await snapshot();
    assert.deepEqual(data.b.slice(1), ['2026-10-14', '2026-10-16', 2]);
    assert.deepEqual(data.source.slice(1), ['2026-10-05', '2026-10-16', 11]);
    const transfer = async (id, parent) => {
      const from = await page.locator(`.gantt_row[task_id="${id}"] .gantt_tree_content`).first().boundingBox();
      const to = await page.locator(`.gantt_row[task_id="${parent}"] .gantt_tree_content`).first().boundingBox();
      await drag(from.x + 12, from.y + from.height / 2, to.x - from.x, to.y - from.y);
    };
    await transfer('b', 'target-task');
    data = await snapshot();

    assert.equal(data.b[0], 'target-task');
    assert.deepEqual(data.source.slice(1), ['2026-10-05', '2026-10-09', 4]);
    assert.deepEqual(data.root.slice(1), data.source.slice(1));
    assert.deepEqual(data['target-task'].slice(1), ['2026-10-06', '2026-10-16', 10]);
    assert.deepEqual(data.target.slice(1), data['target-task'].slice(1));
    // Resize the left edge, then return the last child of the original branch.
    await page.evaluate(() => gantt.showDate(new Date(2026, 9, 3)));
    await bar('c').hover();
    box = await bar('c').locator('.gantt_task_drag[data-bind-property="start_date"]').boundingBox();
    await drag(box.x + box.width / 2, box.y + box.height / 2, -day, 0);
    data = await snapshot();
    assert.deepEqual(data.c.slice(1), ['2026-10-05', '2026-10-08', 3]);
    assert.deepEqual(data.target.slice(1), ['2026-10-05', '2026-10-16', 11]);
    await transfer('a', 'target');
    data = await snapshot();
    assert.equal(data.a[0], 'target');
    assert.deepEqual(data.source.slice(1), ['2026-10-05', '2026-10-09', 4]);
    await transfer('b', 'source');
    data = await snapshot();
    assert.equal(data.b[0], 'source');
    assert.deepEqual(data.source.slice(1), ['2026-10-14', '2026-10-16', 2]);
    assert.deepEqual(data.root.slice(1), data.source.slice(1));
    assert.deepEqual(data['target-task'].slice(1), ['2026-10-05', '2026-10-08', 3]);
    assert.deepEqual(data.target.slice(1), ['2026-10-05', '2026-10-09', 4]);
    assert.equal(await page.locator('#status-unsaved').isVisible(), true);
    const events = await page.evaluate(() => window.dragEvents);
    assert.equal(events.filter(e => e[0] === 'onAfterTaskDrag').length, 3);
    assert.equal(events.filter(e => e[0] === 'onRowDragEnd').length, 3);
    const pending = page.waitForEvent('download');
    await page.click('#btn-save');
    const stream = await (await pending).createReadStream();
    let text = ''; for await (const chunk of stream) text += chunk;
    const saved = JSON.parse(text);
    assert.equal(saved.schema_version, 1);
    for (const t of saved.items) {
      assert.deepEqual([t.parent_id || 0, t.start_date, t.end_date], data[t.id].slice(0, 3));
    }
    await page.reload();
    await page.waitForSelector('#welcome-demo-btn');
    await page.locator('#welcome-file-input').setInputFiles({ name: 'saved.json', mimeType: 'application/json', buffer: Buffer.from(text) });
    await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
    assert.deepEqual(await snapshot(), data);
    assert.deepEqual(errors, []);
    console.log('Mouse move, resize and row transfer passed');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

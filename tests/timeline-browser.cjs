// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/timeline-browser.cjs [URL]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, timezoneId: 'Europe/Moscow' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.argv[2] || 'file://' + require('node:path').resolve(__dirname, '../index.html'));
    await page.waitForSelector('#welcome-demo-btn');
    const project = { schema_version: 1, project: { id: 'edge', name: 'Шкала' }, links: [], items: [
      { id: 'group', type: 'group', title: 'Группа', start_date: '2026-10-12', end_date: '2026-10-16' },
      { id: 'last', parent_id: 'group', type: 'task', title: 'Последняя', start_date: '2026-10-12', end_date: '2026-10-16' },
      { id: 'early', type: 'task', title: 'Ранняя', start_date: '2026-10-01', end_date: '2026-10-02' }
    ] };
    await page.locator('#welcome-file-input').setInputFiles({ name: 'edge.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
    await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
    await page.waitForTimeout(1800);
    await page.locator('[data-zoom="day"]').click();
    const state = () => page.evaluate(() => {
      const t = gantt.getTask('last'), p = gantt.getTask('group');
      return { max: +gantt.getState().max_date, start: +t.start_date, end: +t.end_date, duration: t.duration,
        parent: [+p.start_date, +p.end_date, p.duration] };
    });
    const bar = page.locator('.gantt_task_line[task_id="last"]');
    const drag = async (x, y, dx) => {
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + dx, y, { steps: 20 });
      await page.mouse.up();
    };
    const edgeVisible = async () => {
      await page.evaluate(() => gantt.scrollTo(gantt.getScrollState().width, null));
      await bar.hover();
      const handle = bar.locator('.gantt_task_drag[data-bind-property="end_date"]');
      const b = await handle.boundingBox();
      assert.ok(b && b.x >= 0 && b.x + b.width <= 1600, 'right edge fits viewport after scroll');
      assert.ok(await handle.evaluate(el => {
        const r = el.getBoundingClientRect();
        return el === document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      }), 'right edge is not clipped or covered');
      return b;
    };
    await page.evaluate(() => gantt.showDate(new Date(2026, 9, 10)));
    let before = await state();
    const initialMax = before.max;
    let box = await bar.boundingBox();
    const day = box.width / before.duration;
    const shiftDays = Math.ceil((before.max - before.end) / 86400000) + 2;
    await drag(box.x + box.width / 2, box.y + 6, shiftDays * day);
    let after = await state();
    assert.ok(after.end >= before.max, 'mouse moved task beyond old scale');
    assert.ok(after.max > before.max && after.max >= after.end, 'scale expanded after move');
    assert.equal(after.duration, before.duration);
    assert.deepEqual(after.parent, [after.start, after.end, after.duration]);
    await edgeVisible();
    // Scroll the handle into the middle of the viewport to leave room for a rightward drag.
    await page.evaluate(() => gantt.showDate(gantt.getTask('last').start_date));
    await bar.hover();
    box = await bar.locator('.gantt_task_drag[data-bind-property="end_date"]').boundingBox();
    before = after;
    const extendDays = Math.ceil((before.max - before.end) / 86400000) + 2;
    await drag(box.x + box.width / 2, box.y + box.height / 2, Math.min(extendDays * day, 1590 - box.x - box.width / 2));
    after = await state();
    assert.ok(after.end >= before.max, 'mouse resized task beyond old scale');
    assert.ok(after.max > before.max && after.max >= after.end, 'scale expanded after resize');
    assert.equal(after.start, before.start);
    assert.ok(after.duration > before.duration);
    assert.ok(after.end > initialMax, 'final task extends beyond the initial scale');
    assert.deepEqual(after.parent, [after.start, after.end, after.duration]);
    await edgeVisible();
    const pending = page.waitForEvent('download');
    await page.click('#btn-save');
    const stream = await (await pending).createReadStream();
    let text = ''; for await (const chunk of stream) text += chunk;
    const saved = JSON.parse(text);
    assert.equal(saved.schema_version, 1);
    assert.equal(saved.items[0].end_date, saved.items[1].end_date);
    assert.equal(saved.items[1].end_date, await page.evaluate(() => gantt.date.date_to_str('%Y-%m-%d')(gantt.getTask('last').end_date)));
    assert.deepEqual(errors, []);
    console.log('Mouse move and resize beyond scale: expansion, accessible right edge, parent dates and JSON passed');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

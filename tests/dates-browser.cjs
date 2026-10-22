// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/dates-browser.cjs [URL]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    for (const timezoneId of ['Europe/Moscow', 'America/New_York']) {
      const page = await browser.newPage({ timezoneId });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.argv[2] || 'file://' + require('node:path').resolve(__dirname, '../index.html'));
      await page.waitForSelector('#welcome-demo-btn');
      const cases = [
        ['day', '2026-10-22', '2026-10-23', '2026-10-22'],
        ['month', '2026-10-30', '2026-11-01', '2026-10-31'],
        ['year', '2026-12-30', '2027-01-01', '2026-12-31'],
        ['dst', '2026-03-07', '2026-03-09', '2026-03-08'],
        ['milestone', '2026-10-22', '2026-10-22', '2026-10-22']
      ];
      const project = { schema_version: 1, project: { id: 'dates', name: 'Даты' }, links: [],
        items: cases.map(([id, start_date, end_date]) => ({ id, type: id === 'milestone' ? 'milestone' : 'task', title: id, start_date, end_date })) };
      await page.locator('#welcome-file-input').setInputFiles({ name: 'dates.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
      await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
      for (const [id, start, , inclusive] of cases) {
        const result = await page.evaluate(id => {
          const task = gantt.getTask(id);
          const before = task.end_date.getTime();
          const tooltip = gantt.templates.tooltip_text(task.start_date, task.end_date, task);
          const column = gantt.config.columns.find(column => column.name === 'end_date').template(task);
          gantt.callEvent('onTaskDblClick', [id, new MouseEvent('dblclick')]);
          return { tooltip, column, before, after: task.end_date.getTime() };
        }, id);
        const display = date => date.split('-').reverse().join('.');
        assert.ok(result.tooltip.includes(id === 'milestone' ? `Дата:</b> ${display(start)}` : `Период:</b> ${display(start)} — ${display(inclusive)}`));
        assert.equal(result.column, display(inclusive).slice(0, 5));
        assert.equal(result.before, result.after);
        assert.equal(await page.locator('#edit-start').inputValue(), start);
        if (id === 'milestone') assert.equal(await page.locator('#end-date-group').isVisible(), false);
        else assert.equal(await page.locator('#edit-end').inputValue(), inclusive);
        await page.click('#btn-cancel-edit');
      }
      const pending = page.waitForEvent('download');
      await page.click('#btn-save');
      const stream = await (await pending).createReadStream();
      let text = ''; for await (const chunk of stream) text += chunk;
      const saved = JSON.parse(text);
      assert.equal(saved.schema_version, 1);
      assert.deepEqual(saved.items.map(({ id, start_date, end_date }) => [id, start_date, end_date]), cases.map(row => row.slice(0, 3)));
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`${timezoneId}: tooltip, table, editor, unchanged dates and JSON v1 passed`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

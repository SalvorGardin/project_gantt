// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/links-browser.cjs [URL]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    for (const timezoneId of ['Europe/Moscow', 'America/New_York']) {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, timezoneId });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.argv[2] || 'file://' + require('node:path').resolve(__dirname, '../index.html'));
      await page.waitForSelector('#welcome-demo-btn');
      const item = (id, start, end, type = 'task', parent_id = null) => ({ id, parent_id, type, title: id, start_date: start, end_date: end, is_expanded: true });
      const project = { schema_version: 1, project: { id: 'links', name: 'Links' }, links: [], items: [
        item('a', '2026-10-30', '2026-11-04'),
        item('group', '2026-11-06', '2026-11-09', 'group'),
        item('b', '2026-11-06', '2026-11-09', 'task', 'group'),
        item('m', '2026-11-06', '2026-11-06', 'milestone')
      ] };
      await page.locator('#welcome-file-input').setInputFiles({ name: 'links.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
      await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
      await page.waitForTimeout(1800);
      await page.locator('[data-zoom="day"]').click();
      const snapshot = () => page.evaluate(() => {
        const fmt = gantt.date.date_to_str('%Y-%m-%d');
        const tasks = {};
        gantt.eachTask(t => tasks[t.id] = [fmt(t.start_date), fmt(t.end_date), t.duration]);
        return { tasks, links: gantt.getLinks().map(l => [String(l.type), l.source, l.target]) };
      });
      const reset = () => page.evaluate(() => {
        for (const l of [...gantt.getLinks()]) gantt.deleteLink(l.id);
        const b = gantt.getTask('b');
        b.start_date = new Date(2026, 10, 6); b.end_date = new Date(2026, 10, 9); b.duration = 3;
        gantt.updateTask('b');
        gantt.config.start_date = new Date(2026, 9, 20);
        gantt.config.end_date = new Date(2026, 10, 20);
        gantt.render(); gantt.showDate(new Date(2026, 9, 27));
      });
      const drag = async (sourceEnd, targetEnd) => {
        const bar = id => page.locator(`.gantt_task_line[task_id="${id}"]`);
        await bar('a').hover();
        const from = await bar('a').locator(`.gantt_link_control.task_${sourceEnd} .gantt_link_point`).boundingBox();
        const to = await bar('b').locator(`.gantt_link_control.task_${targetEnd}`).boundingBox();
        assert.ok(from && to, 'Both link anchors exist');
        await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
        await page.waitForTimeout(150);
        await page.mouse.down();
        await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 25 });
        const point = await bar('b').locator(`.gantt_link_control.task_${targetEnd} .gantt_link_point`).boundingBox();
        assert.ok(point);
        await page.mouse.move(point.x + point.width / 2, point.y + point.height / 2);
        await page.waitForTimeout(150); // allow DHTMLX's throttled endpoint hit-test to settle
        await page.mouse.up();
      };
      for (const [left, right, type, dates] of [
        ['right', 'left', '0', ['2026-11-06', '2026-11-09', 3]],
        ['left', 'left', '1', ['2026-10-30', '2026-11-02', 3]],
        ['right', 'right', '2', ['2026-11-01', '2026-11-04', 3]],
        ['left', 'right', '3', ['2026-11-06', '2026-11-09', 3]]
      ]) {
        await reset(); await page.waitForTimeout(200); await drag(left, right);
        const data = await snapshot();
        assert.deepEqual(data.links, [[type, 'a', 'b']]);
        assert.deepEqual(data.tasks.b, dates);
        assert.deepEqual(data.tasks.group, dates);
        assert.deepEqual(data.tasks.a, ['2026-10-30', '2026-11-04', 5]);
      }
      // Both inequalities: violation, equality, and a valid gap.
      for (const [type, start, expected] of [
        ['0', '2026-10-29', '2026-11-03'],
        ['0', '2026-11-03', '2026-11-03'],
        ['0', '2026-11-06', '2026-11-06'],
        ['3', '2026-10-25', '2026-10-28'],
        ['3', '2026-10-28', '2026-10-28'],
        ['3', '2026-11-06', '2026-11-06']
      ]) {
        await reset();
        await page.evaluate(({type, start}) => {
          const task = gantt.getTask('b');
          task.start_date = gantt.date.str_to_date('%Y-%m-%d')(start);
          task.end_date = gantt.date.add(task.start_date, 3, 'day');
          gantt.updateTask('b');
          gantt.addLink({id: 'constraint', source: 'a', target: 'b', type});
        }, {type, start});
        const current = await snapshot();
        assert.equal(current.tasks.b[0], expected);
        assert.equal(current.tasks.b[2], 3);
        assert.deepEqual(current.tasks.group, current.tasks.b);
      }
      // Editing uses the same alignment; cycles must not shift the source.
      await page.evaluate(() => gantt.callEvent('onLinkDblClick', [gantt.getLinks()[0].id]));
      await page.locator('#link-type').selectOption('1');
      await page.locator('#link-modal-overlay button').filter({ hasText: 'Сохранить' }).click();
      let data = await snapshot();
      assert.deepEqual(data.tasks.b, ['2026-10-30', '2026-11-02', 3]);
      await page.evaluate(() => gantt.addLink({ id: 'cycle', source: 'b', target: 'a', type: '0' }));
      assert.deepEqual(await snapshot(), data);
      await page.evaluate(() => gantt.addLink({ id: 'milestone', source: 'a', target: 'm', type: '2' }));
      data = await snapshot();
      assert.deepEqual(data.tasks.m, ['2026-11-03', '2026-11-03', 0]);
      await page.evaluate(() => gantt.addLink({ id: 'branch', source: 'a', target: 'group', type: '0' }));
      data = await snapshot();
      assert.deepEqual(data.tasks.group, ['2026-11-03', '2026-11-06', 3]);
      assert.deepEqual(data.tasks.b, data.tasks.group);
      await page.evaluate(() => gantt.addLink({ id: 'from-milestone', source: 'm', target: 'b', type: '2' }));
      data = await snapshot();
      assert.deepEqual(data.tasks.b, ['2026-11-01', '2026-11-04', 3]);
      await page.evaluate(() => gantt.addLink({ id: 'self', source: 'b', target: 'b', type: '1' }));
      assert.deepEqual(await snapshot(), data);
      assert.equal(await page.locator('#status-unsaved').isVisible(), true);
      const pending = page.waitForEvent('download');
      await page.click('#btn-save');
      const stream = await (await pending).createReadStream();
      let saved = ''; for await (const chunk of stream) saved += chunk;
      await page.reload(); await page.waitForSelector('#welcome-demo-btn');
      await page.locator('#welcome-file-input').setInputFiles({ name: 'saved.json', mimeType: 'application/json', buffer: Buffer.from(saved) });
      await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
      assert.deepEqual(await snapshot(), data);
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Link anchors, alignment, editor, cycles, milestone and save/load passed: ${timezoneId}`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

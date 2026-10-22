// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/linked-move-browser.cjs [URL]
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
      const item = (id, start_date, end_date, type = 'task', parent_id = null) => ({ id, title: id, start_date, end_date, type, parent_id, is_expanded: true });
      const project = { schema_version: 1, project: { id: 'chain', name: 'Chain' }, items: [
        item('root', '2026-10-28', '2026-11-05', 'group'),
        item('a', '2026-10-28', '2026-11-01', 'task', 'root'),
        item('b', '2026-10-31', '2026-11-03', 'task', 'root'),
        item('c', '2026-10-30', '2026-11-03', 'task', 'root'),
        item('d', '2026-10-31', '2026-11-05', 'task', 'root'),
        item('m', '2026-10-30', '2026-10-30', 'milestone', 'root'),
        item('group', '2026-10-31', '2026-11-02', 'group'),
        item('child', '2026-10-31', '2026-11-02', 'task', 'group'),
        item('z', '2026-10-25', '2026-10-27')
      ], links: [
        ['a', 'b', 'FS'], ['d', 'b', 'SS'], ['b', 'c', 'FF'], ['c', 'm', 'SF'], ['d', 'group', 'SS']
      ].map(([source_id, target_id, type], id) => ({ id: 'l' + id, source_id, target_id, type })) };
      await page.locator('#welcome-file-input').setInputFiles({ name: 'chain.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
      await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
      await page.waitForTimeout(1800);
      await page.locator('[data-zoom="day"]').click();
      const snapshot = () => page.evaluate(() => {
        const data = {}, fmt = gantt.date.date_to_str('%Y-%m-%d');
        gantt.eachTask(t => data[t.id] = [fmt(t.start_date), fmt(t.end_date), t.duration]);
        return data;
      });
      const day = s => Date.parse(s + 'T00:00:00Z') / 86400000;
      const checkShift = (before, after, offset) => {
        for (const id of Object.keys(before)) {
          if (id === 'root') continue;
          const delta = offset[id] || 0;
          assert.equal(day(after[id][0]) - day(before[id][0]), delta, id + ' start');
          assert.equal(day(after[id][1]) - day(before[id][1]), delta, id + ' end');
          assert.equal(after[id][2], before[id][2], id + ' duration');
        }
        const children = ['a','b','c','d','m'];
        assert.equal(day(after.root[0]), Math.min(...children.map(id => day(after[id][0]))));
        assert.equal(day(after.root[1]), Math.max(...children.map(id => day(after[id][1]))));
      };
      const drag = async (id, days) => {
        await page.evaluate(id => {
          const task = gantt.getTask(id);
          gantt.showDate(gantt.date.add(task.start_date, -4, 'day'));
        }, id);
        const bar = page.locator(`.gantt_task_line[task_id="${id}"]`);
        const box = await bar.boundingBox();
        const width = await page.evaluate(() => gantt.posFromDate(new Date(2026, 10, 2)) - gantt.posFromDate(new Date(2026, 10, 1)));
        const x = box.x + box.width / 2, y = box.y + 5;
        await page.mouse.move(x, y); await page.mouse.down();
        await page.mouse.move(x + width * days, y, { steps: 25 }); await page.mouse.up();
      };
      for (const [id, offset, expected] of [
        ['b', 3, {b:3,c:3,d:3,m:3,group:3,child:3}],
        ['d', -2, {b:-2,c:-2,d:-2,group:-2,child:-2}],
        ['m', 2, {m:2}],
        ['child', -1, {b:-1,c:-1,d:-1,group:-1,child:-1}]
      ]) {
        const before = await snapshot();
        await drag(id, offset);
        checkShift(before, await snapshot(), expected);
      }
      const edit = async (id, offset, expected) => {
        const before = await snapshot();
        await page.evaluate(id => gantt.callEvent('onTaskDblClick', [id, new MouseEvent('dblclick')]), id);
        const shifted = (date, n) => new Date((day(date) + n) * 86400000).toISOString().slice(0, 10);
        await page.locator('#edit-start').fill(shifted(before[id][0], offset));
        if (id !== 'm') await page.locator('#edit-end').fill(shifted(before[id][1], offset - 1));
        await page.click('#btn-save-task');
        checkShift(before, await snapshot(), expected);
      };
      await edit('a', 4, {a:4,b:4,c:4,d:4,group:4,child:4});
      await edit('m', -3, {a:-2,b:-2,c:-2,d:-2,m:-3,group:-2,child:-2});
      // Non-date edits must not move anything.
      let before = await snapshot();
      await page.evaluate(() => gantt.callEvent('onTaskDblClick', ['b', new MouseEvent('dblclick')]));
      await page.locator('#edit-title').fill('Renamed');
      await page.click('#btn-save-task');
      assert.deepEqual(await snapshot(), before);
      // Save/load preserves the entire translated component.
      const pending = page.waitForEvent('download'); await page.click('#btn-save');
      const stream = await (await pending).createReadStream();
      let saved = ''; for await (const chunk of stream) saved += chunk;
      await page.reload(); await page.waitForSelector('#welcome-demo-btn');
      await page.locator('#welcome-file-input').setInputFiles({ name: 'saved.json', mimeType: 'application/json', buffer: Buffer.from(saved) });
      await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
      assert.deepEqual(await snapshot(), before);
      // Changing duration in the editor does not translate neighbors.
      await page.evaluate(() => gantt.callEvent('onTaskDblClick', ['b', new MouseEvent('dblclick')]));
      await page.locator('#edit-end').fill(before.b[1]);
      await page.click('#btn-save-task');
      const after = await snapshot();
      for (const id of ['a', 'c', 'd', 'm', 'group', 'child', 'z']) assert.deepEqual(after[id], before[id]);
      assert.equal(after.b[2], before.b[2] + 1);
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Bidirectional chain, hierarchy, durations, editor and save/load passed: ${timezoneId}`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

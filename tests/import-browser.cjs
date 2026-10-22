// Optional integration check: requires Playwright and a local HTTP server.
// NODE_PATH=<playwright packages> BROWSER_EXECUTABLE=<chromium> node tests/import-browser.cjs [url]
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, timezoneId: 'Europe/Moscow' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', dialog => dialog.accept());
    const url = process.argv[2] || 'http://127.0.0.1:8765';
    await page.goto(url);
    await page.waitForSelector('#welcome-demo-btn');
    const input = (data, selector = '#file-input') => page.locator(selector).setInputFiles({ name: 'plan.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
    const chart = () => page.evaluate(() => gantt.serialize());
    const dirty = () => page.locator('#status-unsaved').isVisible();
    const download = async () => {
      const event = page.waitForEvent('download');
      await page.click('#btn-save');
      const file = await event;
      const stream = await file.createReadStream();
      let text = ''; for await (const chunk of stream) text += chunk;
      return JSON.parse(text);
    };
    await input(null, '#welcome-file-input');
    await page.waitForSelector('.toast--error');
    assert.equal(await page.locator('#welcome-overlay').isVisible(), true);
    await page.click('#welcome-demo-btn');
    await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
    assert.equal((await chart()).data.length, 26);
    const baseline = await chart();
    await page.locator('#project-name').fill('Не потерять');
    assert.equal(await dirty(), true);
    await page.click('#btn-new-project');
    await page.click('#btn-cancel-new-project');
    assert.deepEqual(await chart(), baseline);
    assert.equal(await page.inputValue('#project-name'), 'Не потерять');
    await page.click('#btn-new-project');
    await page.locator('#new-project-name').fill('Другой');
    await page.click('#btn-create-project');
    await page.click('#btn-cancel-confirm');
    await page.click('#btn-cancel-new-project');
    assert.deepEqual(await chart(), baseline);

    const saved = await download();
    assert.equal(saved.project.name, 'Не потерять');
    assert.equal(await dirty(), false);
    const broken = structuredClone(saved); broken.links = {};
    await input(broken);
    await page.waitForFunction(() => document.querySelector('.toast')?.textContent.includes('links'));
    assert.deepEqual(await chart(), baseline);
    const incoming = structuredClone(saved); incoming.project.name = 'Импорт';
    await page.locator('#project-name').fill('Изменённое имя');
    await input(incoming); await page.click('#btn-confirm-import');
    await page.click('#btn-cancel-confirm');
    assert.equal(await page.inputValue('#project-name'), 'Изменённое имя');
    assert.deepEqual(await chart(), baseline);

    // Inject one failure into the actual DHTMLX parser, after it has mutated the chart.
    await page.evaluate(() => {
      const parse = gantt.parse;
      gantt.parse = function (...args) { gantt.parse = parse; parse.apply(this, args); throw new Error('test parse failure'); };
    });
    await input(incoming); await page.click('#btn-confirm-import'); await page.click('#btn-ok-confirm');
    await page.waitForFunction(() => document.querySelector('.toast')?.textContent.includes('test parse failure'));
    assert.deepEqual(await chart(), baseline);
    assert.equal(await page.inputValue('#project-name'), 'Изменённое имя');
    assert.equal(await dirty(), true);

    await input(incoming); await page.click('#btn-confirm-import'); await page.click('#btn-ok-confirm');
    await page.waitForFunction(() => document.getElementById('project-name').value === 'Импорт');
    assert.equal(await dirty(), false);
    const first = await download();
    await input(first); await page.click('#btn-confirm-import');
    const second = await download();
    assert.deepEqual(second.items, first.items);
    assert.deepEqual(second.links, first.links);
    // Real DHTMLX move + native reorder completion event must set dirty and persist the order.
    await page.evaluate(() => { gantt.moveTask('task_3', 0, 'grp_1'); gantt.callEvent('onRowDragEnd', ['task_3', 'task_1']); });
    assert.equal(await dirty(), true);
    const reordered = await download();
    await input(reordered); await page.click('#btn-confirm-import');
    assert.deepEqual((await download()).items.map(t => [t.id, t.parent_id, t.sort_order]), reordered.items.map(t => [t.id, t.parent_id, t.sort_order]));

    const textPlan = {
      schema_version: 1, project: {id:'safe', name:'Текст'},
      items: [{id:1, type:'task', title:'<img src=x onerror="window.injected=true">', notes:'<svg onload="window.injected=true">',
        assignee:'<b>Имя</b>', emoji:'<i>Иконка</i>', start_date:'2026-10-22', end_date:'2026-10-23'}], links:[]
    };
    await input(textPlan); await page.click('#btn-confirm-import');
    assert.equal(await page.locator('#gantt-container img[src="x"]').count(), 0);
    assert.equal(await page.evaluate(() => window.injected === true), false);
    assert.equal((await download()).items[0].title, textPlan.items[0].title);
    await page.evaluate(() => {
      const task = gantt.getTask('1');
      const html = gantt.templates.tooltip_text(task.start_date, task.end_date, task);
      if (html.includes('<svg') || html.includes('<img') || html.includes('<b>Имя')) throw new Error('unsafe tooltip');
    });
    await page.click('#btn-new-project');
    await page.locator('#new-project-name').fill('Пустой новый'); await page.click('#btn-create-project');
    assert.equal(await dirty(), true);
    assert.equal((await chart()).data.length, 0);
    await page.reload();
    await page.waitForSelector('#welcome-file-input', { state: 'attached' });
    await input(first, '#welcome-file-input');
    await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
    assert.deepEqual((await download()).links, first.links);
    // External files may put children before parents and mix sibling order.
    const orderedPlan = { schema_version: 1, project: { id: 'order', name: 'Порядок' }, links: [],
      items: [
        ['late', 'group', 20], ['nested-b', 'early', 2], ['second', null, 2],
        ['tie-a', 'group', 5], ['missing-a', 'group'], ['group', null, 1],
        ['early', 'group', 1], ['nested-a', 'early', 1], ['tie-b', 'group', 5], ['missing-b', 'group']
      ].map(([id, parent_id, sort_order]) => ({ id, parent_id, sort_order, type: id === 'group' ? 'group' : 'task',
        title: id, start_date: '2026-10-22', end_date: '2026-10-23' })) };
    const expectedOrder = ['group', 'missing-a', 'missing-b', 'early', 'nested-a', 'nested-b', 'tie-a', 'tie-b', 'late', 'second'];
    await input(orderedPlan); await page.click('#btn-confirm-import');
    const ordered = await download();
    assert.deepEqual(ordered.items.map(t => t.id), expectedOrder);
    assert.ok(ordered.items.every(t => t.start_date === '2026-10-22' && t.end_date === '2026-10-23'));
    await page.reload();
    await page.waitForSelector('#welcome-file-input', { state: 'attached' });
    await input(orderedPlan, '#welcome-file-input');
    await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
    assert.deepEqual((await download()).items, ordered.items);
    await input(ordered); await page.click('#btn-confirm-import');
    assert.deepEqual((await download()).items, ordered.items);
    assert.deepEqual(errors, []);
    console.log('PASS: real DHTMLX import, invalid input, discard/cancel, rollback, dirty, save/load twice, reorder, safe text, welcome import.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

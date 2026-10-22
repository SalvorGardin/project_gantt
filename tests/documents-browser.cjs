// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/documents-browser.cjs [URL]
const assert = require('node:assert/strict');
const { mkdir, readFile } = require('node:fs/promises');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, timezoneId: 'America/Los_Angeles' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.argv[2] || 'file://' + require('node:path').resolve(__dirname, '../index.html'));
    await page.waitForSelector('#welcome-demo-btn');
    const project = { schema_version: 1, project: { id: 'docs', name: 'Проверка' }, items: [
      { id: 'g', type: 'group', title: 'Группа', start_date: '2026-10-01', end_date: '2026-10-06', is_expanded: false },
      { id: 't', type: 'task', parent_id: 'g', title: '=1+1', start_date: '2026-10-01', end_date: '2026-10-06', progress: 45, status: 'in_progress', assignee: 'Иван', notes: '<b>Текст</b>' },
      { id: 'm', type: 'milestone', title: 'Веха', start_date: '2026-10-06', end_date: '2026-10-06' }
    ], links: [{ id: 'l', source_id: 't', target_id: 'm', type: 'FS' }] };
    await page.locator('#welcome-file-input').setInputFiles({ name: 'docs.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(project)) });
    await page.waitForSelector('#welcome-overlay', { state: 'hidden' });
    await page.waitForTimeout(1700);
    await page.locator('#project-name').fill('Новый план /:*?');
    const snapshot = () => page.evaluate(() => ({
      style: document.getElementById('gantt-container').style.cssText,
      panels: [...document.querySelectorAll('.toolbar,.status-bar,.link-hint-bar')].map(e => e.style.visibility),
      data: gantt.serialize(), scroll: [gantt.getScrollState().x, gantt.getScrollState().y],
      dirty: document.getElementById('status-unsaved').className
    }));
    let before = await snapshot();
    const finish = async () => {
      await page.waitForFunction(() => document.getElementById('export-progress-overlay')?.style.display === 'none');
      assert.deepEqual(await snapshot(), before);
    };
    const start = async format => {
      await page.locator('#btn-export').click();
      await page.locator('#btn-export-' + format).click();
    };
    const output = '/tmp/gantt-documents-check';
    await mkdir(output, { recursive: true });
    // A failed CDN load must release the lock and permit a real retry.
    await page.route('**/pdf-lib@*/**', route => route.abort());
    await start('pdf');
    await finish();
    assert.match(await page.locator('body').innerText(), /Не удалось загрузить библиотеку экспорта/);
    await page.unroute('**/pdf-lib@*/**');
    for (const format of ['pdf', 'xlsx']) {
      if (format === 'xlsx') await page.evaluate(() => {
        window.originalCapture = htmlToImage.toCanvas;
        htmlToImage.toCanvas = () => { throw new Error('XLSX must not capture images'); };
      });
      const event = page.waitForEvent('download');
      await start(format);
      const download = await event;
      assert.match(download.suggestedFilename(), new RegExp('^Новый план_\\d{4}-\\d{2}-\\d{2}\\.' + format + '$'));
      await download.saveAs(`${output}/plan.${format}`);
      await finish();
      const bytes = await readFile(`${output}/plan.${format}`);
      assert.equal(bytes.subarray(0, format === 'pdf' ? 4 : 2).toString(), format === 'pdf' ? '%PDF' : 'PK');
    }
    await page.evaluate(() => { htmlToImage.toCanvas = window.originalCapture; });
    // Parse actual downloads using the libraries loaded by the real UI.
    const pdf = await page.evaluate(async data => {
      const doc = await PDFLib.PDFDocument.load(Uint8Array.from(atob(data), c => c.charCodeAt(0)));
      return { count: doc.getPageCount(), size: doc.getPage(0).getSize() };
    }, (await readFile(`${output}/plan.pdf`)).toString('base64'));
    assert.equal(pdf.count, 1);
    assert.ok(Math.abs(pdf.size.width - 841.89) < 0.1 && Math.abs(pdf.size.height - 595.28) < 0.1);
    const excel = await page.evaluate(async data => {
      const book = new ExcelJS.Workbook();
      await book.xlsx.load(Uint8Array.from(atob(data), c => c.charCodeAt(0)));
      const sheet = book.getWorksheet('Диаграмма');
      return { names: book.worksheets.map(s => s.name), rows: sheet.getSheetValues(), images: book.getWorksheet('Диаграмма').getImages().length,
        rules: sheet.conditionalFormattings, header: sheet.getCell('K1').value, outline: sheet.getRow(3).outlineLevel, links: book.getWorksheet('Связи').getSheetValues(), formula: sheet.getCell('D3').formula };
    }, (await readFile(`${output}/plan.xlsx`)).toString('base64'));
    assert.deepEqual(excel.names, ['Диаграмма', 'Связи']);
    assert.equal(excel.images, 0);
    assert.equal(excel.rows.length, 5);
    assert.equal(excel.outline, 1);
    assert.equal(excel.header.formula, 'MIN($E$2:$E$4)+0');
    assert.equal(excel.rules.length, 3);
    assert.equal(excel.rules[1].rules[4].style.border.top.style, 'thin');
    assert.equal(excel.rules[1].rules[0].style.border.left.style, 'thin');
    assert.equal(excel.rules[1].rules[0].style.border.right.style, 'thin');
    assert.equal(excel.rules[1].rules[4].style.fill.bgColor.argb, 'FF3B82F6');
    assert.match(excel.rules[1].rules[4].formulae[0], /K\$1>=\$E3,K\$1<=\$F3/);
    assert.equal(excel.rows[3][2], 'g');
    assert.equal(excel.rows[3][4], '=1+1');
    assert.equal(excel.formula, undefined);
    assert.equal(new Date(excel.rows[3][6]).toISOString(), '2026-10-05T00:00:00.000Z');
    assert.equal(new Date(excel.rows[4][6]).toISOString(), '2026-10-06T00:00:00.000Z');
    assert.equal(excel.rows[3][7], 0.45);
    assert.equal(excel.rows[3][9], 'Иван');
    assert.equal(excel.rows[3][10], '<b>Текст</b>');
    assert.deepEqual(excel.links[2].slice(1), ['l', 't', 'm', 'FS']);
    // Serialization failures happen after capture: UI and lock still recover.
    for (const format of ['pdf', 'xlsx']) {
      await page.evaluate(format => {
        const target = format === 'pdf' ? PDFLib.PDFDocument.prototype : ExcelJS.Workbook.prototype;
        const key = format === 'pdf' ? 'save' : 'xlsx';
        window.exportRestore = Object.getOwnPropertyDescriptor(target, key);
        Object.defineProperty(target, key, { configurable: true, get() { throw new Error('document test failure'); } });
      }, format);
      await start(format);
      await finish();
      assert.match(await page.locator('body').innerText(), /document test failure/);
      await page.evaluate(format => Object.defineProperty(format === 'pdf' ? PDFLib.PDFDocument.prototype : ExcelJS.Workbook.prototype,
        format === 'pdf' ? 'save' : 'xlsx', window.exportRestore), format);
      const event = page.waitForEvent('download');
      await start(format);
      await event;
      await finish();
    }
    await page.evaluate(() => { gantt.getTask('t').end_date = new Date(2100, 0, 1); });
    before = await snapshot();
    await start('xlsx');
    await finish();
    assert.match(await page.locator('body').innerText(), /Период слишком большой/);
    await page.evaluate(() => gantt.clearAll());
    before = await snapshot();
    const emptyEvent = page.waitForEvent('download');
    await start('xlsx');
    const emptyDownload = await emptyEvent;
    await emptyDownload.saveAs(`${output}/empty.xlsx`);
    await finish();
    assert.deepEqual(errors, []);
    console.log('PDF landscape, XLSX cells/conditional formatting/dates/no images, CDN failure, encoding failure/retry and UI preservation passed. Files: ' + output);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

// Run: node --test tests/project-file.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { prepare } = require('../js/project-file.js');

const task = (id, parent_id = null) => ({
  id, parent_id, type: 'task', title: '📋 <план> & "цитата"',
  start_date: '2026-10-22', end_date: '2026-10-23'
});
const plan = () => ({ schema_version: 1, project: { id: 'p', name: 'План' }, items: [task(1), task(2)], links: [] });

test('v1 is normalized without changing the input, dates or text', () => {
  const data = plan();
  data.items.push({ ...task(3, 1), type: 'milestone', end_date: '2026-10-22' });
  data.links = ['FS', 'SS', 'FF', 'SF'].map((type, i) => ({ id: i + 1, source_id: 1, target_id: 2, type }));
  const before = JSON.stringify(data);
  const result = prepare(data);
  assert.equal(JSON.stringify(data), before);
  assert.equal(result.items[0].id, '1');
  assert.equal(result.items[2].parent_id, '1');
  assert.equal(result.items[0].end_date, '2026-10-23');
  assert.equal(result.items[0].title, data.items[0].title);
  assert.deepEqual(result.links.map(l => l.type), ['FS', 'SS', 'FF', 'SF']);
  assert.deepEqual(prepare(JSON.parse(JSON.stringify(result))), result);
  delete data.links;
  assert.deepEqual(prepare(data).links, []);
});

const badCases = [
  ['string version', d => d.schema_version = '1'],
  ['future version', d => d.schema_version = 2],
  ['null project', d => d.project = null],
  ['array project', d => d.project = []],
  ['non-text name', d => d.project.name = {}],
  ['invalid timestamp', d => d.project.created_at = 'oops'],
  ['null item', d => d.items.push(null)],
  ['missing items', d => delete d.items],
  ['invalid links', d => d.links = {}],
  ['null links', d => d.links = null],
  ['missing title', d => delete d.items[0].title],
  ['non-text title', d => d.items[0].title = 42],
  ['empty title', d => d.items[0].title = '  '],
  ['invalid type', d => d.items[0].type = 'other'],
  ['invalid status', d => d.items[0].status = 'other'],
  ['invalid date', d => d.items[0].start_date = 'bad'],
  ['nonexistent day', d => d.items[0].start_date = '2026-02-30'],
  ['non-leap day', d => d.items[0].start_date = '2025-02-29'],
  ['zero duration task', d => d.items[0].end_date = d.items[0].start_date],
  ['reversed dates', d => d.items[0].end_date = '2026-01-01'],
  ['different milestone dates', d => d.items[0].type = 'milestone'],
  ['invalid progress', d => d.items[0].progress = 101],
  ['string progress', d => d.items[0].progress = '5'],
  ['invalid expansion', d => d.items[0].is_expanded = 'false'],
  ['invalid order', d => d.items[0].sort_order = -1],
  ['CSS injection', d => d.items[0].color = 'red;display:none'],
  ['duplicate ID after normalization', d => d.items[1].id = '1'],
  ['root ID', d => d.items[0].id = 0],
  ['prototype ID', d => d.items[0].id = '__proto__'],
  ['unsafe numeric ID', d => d.items[0].id = Number.MAX_SAFE_INTEGER + 1],
  ['missing parent', d => d.items[0].parent_id = 99],
  ['self parent', d => d.items[0].parent_id = 1],
  ['parent cycle', d => { d.items[0].parent_id = 2; d.items[1].parent_id = 1; }],
  ['missing link end', d => d.links = [{ id: 'l', source_id: 1, target_id: 99, type: 'FS' }]],
  ['self link', d => d.links = [{ id: 'l', source_id: 1, target_id: 1, type: 'FS' }]],
  ['link cycle', d => d.links = [{ id: 'l', source_id: 1, target_id: 2, type: 'FS' }, { id: 'r', source_id: 2, target_id: 1, type: 'SS' }]],
  ['invalid link type', d => d.links = [{ id: 'l', source_id: 1, target_id: 2, type: 'oops' }]],
  ['duplicate link ID', d => d.links = [1, '1'].map(id => ({ id, source_id: 1, target_id: 2, type: 'FS' }))]
];
for (const [name, mutate] of badCases) test(`rejects ${name}`, () => {
  const data = plan();
  mutate(data);
  assert.throws(() => prepare(data), Error);
});
test('rejects non-object roots and handles deep graphs without recursion', () => {
  for (const value of [null, [], true, 'json']) assert.throws(() => prepare(value));
  const data = plan();
  data.items = Array.from({ length: 10000 }, (_, i) => task(i + 1, i || null));
  assert.equal(prepare(data).items.length, 10000);
  data.items[0].parent_id = 10000;
  assert.throws(() => prepare(data), /цикл/);
});
test('leap day and month/year boundaries remain calendar dates', () => {
  for (const [start, end] of [['2024-02-29', '2024-03-01'], ['2026-12-31', '2027-01-01']]) {
    const data = plan();
    Object.assign(data.items[0], { start_date: start, end_date: end });
    assert.equal(prepare(data).items[0].end_date, end);
  }
});

// Exercise real application functions with a small boundary double, without exposing test APIs in production.
function session() {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) {
      const classes = new Set();
      elements.set(id, { value: '', style: {}, textContent: '', disabled: false,
        classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c),
          toggle: (c, on) => on ? classes.add(c) : classes.delete(c) },
        remove() {}, select() {}, focus() {}, querySelectorAll: () => [], addEventListener() {} });
    }
    return elements.get(id);
  };
  let chart = { data: [], links: [] };
  let failures = 0;
  let downloads = [];
  let readers = [];
  const copy = value => JSON.parse(JSON.stringify(value));
  const gantt = {
    config: { types: { project: 'project', task: 'task', milestone: 'milestone' } },
    date: { date_to_str: () => date => typeof date === 'string' ? date.slice(0, 10) : date.toISOString().slice(0, 10) },
    serialize: () => copy(chart), getScrollState: () => ({ x: 12, y: 24 }), scrollTo() {}, selectTask() {},
    clearAll: () => { chart = { data: [], links: [] }; },
    parse: data => { chart = copy(data); if (failures-- > 0) throw new Error('parse failed'); },
    eachTask: fn => chart.data.forEach(fn), getLinks: () => chart.links,
    isTaskExists: id => chart.data.some(t => t.id === id)
  };
  const document = {
    getElementById: element, addEventListener() {}, querySelector: () => null,
    body: { appendChild() {} },
    createElement: () => { const e = { style: {}, remove() {}, click() { downloads.push(JSON.parse(decodeURIComponent(e.href.split(',')[1]))); } }; return e; }
  };
  const context = { document, gantt, ProjectFile: { prepare }, setTimeout() {}, console,
    FileReader: class { constructor() { readers.push(this); } readAsText() {} } };
  vm.createContext(context);
  const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, `globalThis.api = {
    state, loadProject, replaceProject, saveProject, createNewProject, openNewProjectModal,
    closeModal, readProjectFile, markDirty, detectCycle, escapeHtml, SAMPLE_PROJECT
  };})();`), context);
  return { ...context.api, element, chart: () => copy(chart), fail: count => { failures = count; }, downloads, readers };
}
test('built-in demo is accepted by the new validator', () => {
  assert.equal(prepare(session().SAMPLE_PROJECT).items.length, 26);
});
test('invalid import and failed parse preserve dirty plan, name and links', () => {
  const s = session(); s.loadProject(plan());
  s.element('project-name').value = 'Несохранённое имя'; s.markDirty();
  const before = s.chart();
  assert.throws(() => s.loadProject({ ...plan(), links: {} }));
  s.fail(1); assert.throws(() => s.loadProject({ ...plan(), project: { id: 'new', name: 'Новый' } }), /parse failed/);
  assert.deepEqual(s.chart(), before);
  assert.equal(s.element('project-name').value, 'Несохранённое имя');
  assert.equal(s.state.project.project.id, 'p');
  assert.equal(s.state.isDirty, true);
});
test('failed rollback retains a downloadable previous plan', () => {
  const s = session(); s.loadProject(plan()); s.markDirty();
  s.element('project-name').value = 'Резерв';
  s.fail(2); assert.throws(() => s.loadProject(plan()), /предыдущий план/);
  s.saveProject();
  assert.equal(s.downloads[0].project.name, 'Резерв');
  assert.equal(s.downloads[0].items.length, 2);
  assert.equal(s.state.isDirty, true);
});
test('cancel new-project form and discard confirmation retain old plan', () => {
  const s = session(); s.loadProject(plan()); s.markDirty();
  const before = s.chart();
  s.openNewProjectModal(); s.closeModal('new-project-modal-overlay');
  assert.deepEqual(s.chart(), before);
  s.element('new-project-name').value = 'Новый'; s.createNewProject();
  assert.equal(s.state.project.project.id, 'p');
  assert.equal(typeof s.state.pendingDelete, 'function');
  s.closeModal('confirm-modal-overlay');
  assert.deepEqual(s.chart(), before);
  assert.equal(s.state.pendingDelete, null);
  s.createNewProject(); const confirm = s.state.pendingDelete;
  s.closeModal('confirm-modal-overlay'); confirm();
  assert.equal(s.state.project.project.name, 'Новый');
  assert.equal(s.chart().data.length, 0);
  assert.equal(s.state.isDirty, true);
});
test('import replacement needs confirmation; save/load twice retains text, dates and link types', () => {
  const s = session(); const data = plan();
  data.links = ['FS','SS','FF','SF'].map((type, i) => ({id: i+1, source_id:1, target_id:2, type}));
  s.loadProject(data); s.markDirty();
  let applied = false;
  s.replaceProject({ ...data, project: {id:'next', name:'Следующий'} }, () => { applied = true; });
  assert.equal(applied, false); s.closeModal('confirm-modal-overlay');
  s.saveProject(); s.loadProject(s.downloads[0]); s.saveProject();
  assert.deepEqual(s.downloads[1].items, s.downloads[0].items);
  assert.deepEqual(s.downloads[1].links, s.downloads[0].links);
  assert.equal(s.downloads[1].items[0].title, data.items[0].title);
  assert.equal(s.downloads[1].items[0].end_date, '2026-10-23');
});
test('obsolete file reads and invalid JSON never replace the active project', () => {
  const s = session(); s.loadProject(plan());
  const event = () => ({ target: { files: [{}], value: 'file' } });
  s.readProjectFile(event(), true); s.readProjectFile(event(), true);
  s.readers[0].result = JSON.stringify({ ...plan(), project: { id:'old', name:'Old' } }); s.readers[0].onload();
  assert.equal(s.state.pendingImport, null);
  s.readers[1].result = 'null'; s.readers[1].onload();
  assert.equal(s.state.pendingImport, null);
  assert.equal(s.state.project.project.id, 'p');
  s.readProjectFile(event(), false);
  s.loadProject({ ...plan(), project: { id:'new', name:'New' } });
  s.readers[2].result = JSON.stringify(plan()); s.readers[2].onload();
  assert.equal(s.state.project.project.id, 'new');
});
test('numeric dependency IDs and HTML-sensitive text are handled safely', () => {
  const s = session(); const data = plan();
  data.links = [{id:'l', source_id:2, target_id:1, type:'FS'}]; s.loadProject(data);
  assert.equal(s.detectCycle(1,2), true);
  assert.equal(s.escapeHtml('<img onerror="x"> &'), '&lt;img onerror=&quot;x&quot;&gt; &amp;');
});

test('save validation failure retains dirty and does not start a download', () => {
  const s = session(); s.loadProject(plan()); s.markDirty();
  s.state.project.project.id = 0;
  s.saveProject();
  assert.equal(s.downloads.length, 0);
  assert.equal(s.state.isDirty, true);
});

test('file read error or abort cannot leave a previous import available', () => {
  const s = session(); s.loadProject(plan());
  const event = () => ({target: {files:[{}], value:'file'}});
  s.readProjectFile(event(), true);
  s.readers[0].result = JSON.stringify(plan()); s.readers[0].onload();
  assert.ok(s.state.pendingImport);
  s.readProjectFile(event(), true); s.readers[1].onerror();
  assert.equal(s.state.pendingImport, null);
  assert.equal(s.element('btn-confirm-import').disabled, true);
  s.readProjectFile(event(), true); s.readers[2].onabort();
  assert.equal(s.state.project.project.id, 'p');
});

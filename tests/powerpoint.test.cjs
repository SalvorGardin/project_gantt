const test = require('node:test');
const assert = require('node:assert/strict');
const { plan } = require('../js/powerpoint-export.js');
const measure = (text, font) => text.length * font * 0.6;
const item = (id, type = 'task', parent_id = null, title = id) => ({ id, type, parent_id, title, start_date: '2026-03-01', end_date: type === 'milestone' ? '2026-03-01' : '2026-04-01', color: '#123456' });

test('Overview and details include collapsed/nested items in tree order, without mutating data', () => {
 const items = [item('g', 'group'), item('t', 'task', 'g'), item('nested', 'group', 'g'), item('hidden', 'task', 'nested'), item('m', 'milestone', 'nested'), item('root'), item('child', 'task', 'root')];
 items[0].is_expanded = false;
 const before = JSON.stringify(items);
 const slides = plan('Проект', {items}, measure);
 assert.equal(slides.length, 2);
 assert.deepEqual(slides[0].rows.map(r => r.id), ['g', 'm', 'root', 'child']);
 assert.deepEqual(slides[1].rows.map(r => r.id), ['g', 't', 'nested', 'hidden', 'm']);
 assert.equal(slides[0].scale.unit, 'month');
 assert.equal(slides[1].scale.unit, 'week');
 assert.equal(slides[1].rows[1].end - slides[1].rows[1].start, 31);
 assert.equal(slides[1].rows.at(-1).end - slides[1].rows.at(-1).start, 1);
 assert.equal(JSON.stringify(items), before);
});

test('Pagination preserves every row and full long labels with stable section scales', () => {
 const items = [item('g', 'group'), ...Array.from({length:45}, (_,i) => item('t'+i, 'task', 'g', i === 20 ? 'Очень длинное название '.repeat(100) : 'Задача '+i))];
 const slides = plan('Проект', {items}, measure).filter(s => s.subtitle.startsWith('Детализация'));
 assert.ok(slides.length > 3);
 const rows = slides.flatMap(s => s.rows);
 assert.deepEqual(new Set(rows.map(r=>r.id)), new Set(items.map(r=>r.id)));
 assert.equal(rows.filter(r=>r.id==='t20').map(r=>r.text).join('').replace(/\s/g,''),items[21].title.replace(/\s/g,''));
 for (const s of slides) {
  assert.deepEqual(s.scale, slides[0].scale);
  for(const row of s.rows) assert.ok(row.y + row.height <= 6.95 + 1e-9);
 }
});

test('Long periods, single-day milestones, empty project and invalid hierarchy', () => {
 const group = item('g','group'); group.end_date = '2035-01-01';
 const slides=plan('Длинный проект', {items:[group]},measure);
 assert.equal(slides[0].scale.unit,'quarter');
 assert.equal(slides[1].scale.unit,'month');
 assert.ok(slides.every(s=>s.scale.cells.length<=12));
 const milestone=plan('Веха',{items:[item('m','milestone')]},measure)[0];
 assert.ok(milestone.scale.end>milestone.scale.start);
 assert.equal(plan('Пусто',{items:[]},measure)[0].scale,null);
 assert.throws(()=>plan('Ошибка',{items:[item('bad','task','missing')]},measure),/иерархия/);
});

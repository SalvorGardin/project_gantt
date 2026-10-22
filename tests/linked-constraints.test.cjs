const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
function run(type, moved, offset, gap) {
  const date = day => new Date(2026, 9, day);
  const a = {id:'a',parent:0,type:'task',start_date:date(28),end_date:date(31)};
  const bStart = type === '0' ? 30 + gap : 26 + gap;
  const b = {id:'b',parent:0,type:'task',start_date:date(bStart),end_date:date(bStart+3)};
  const tasks = {a,b};
  const add = (d,n) => { const v=new Date(d);v.setDate(v.getDate()+n);return v; };
  const gantt = {eachTask:fn=>Object.values(tasks).forEach(fn), getTask:id=>tasks[id], getChildren:()=>[],
    getLinks:()=>[{source:'a',target:'b',type}],config:{types:{milestone:'milestone'}},
    date:{add},batchUpdate:fn=>fn(),updateTask:()=>{}};
  const context = vm.createContext({gantt, numToLinkType:n=>({'0':'FS','3':'SF'})[n]});
  vm.runInContext(source.slice(source.indexOf('  function calendarDay('),source.indexOf('  function alignLinkedTask(')),context);
  const before=context.snapshotTaskDates();
  tasks[moved].start_date=add(tasks[moved].start_date,offset);
  tasks[moved].end_date=add(tasks[moved].end_date,offset);
  context.moveLinkedChain(moved,before);
  return Object.fromEntries(Object.keys(tasks).map(id=>[id,context.calendarDay(tasks[id].start_date)-context.calendarDay(before.get(id).start)]));
}
for(const type of ['0','3']) {
  test(`${type}: slack, equality, overlap, forward/backward movement`,()=>{
    assert.deepEqual(run(type,'a',2,3),{a:2,b:0});
    assert.deepEqual(run(type,'a',3,3),{a:3,b:0});
    assert.deepEqual(run(type,'a',5,3),{a:5,b:2});
    assert.deepEqual(run(type,'a',-5,3),{a:-5,b:0});
    assert.deepEqual(run(type,'b',-2,3),{a:0,b:-2});
    assert.deepEqual(run(type,'b',-3,3),{a:0,b:-3});
    assert.deepEqual(run(type,'b',-5,3),{a:-2,b:-5});
    assert.deepEqual(run(type,'b',5,3),{a:0,b:5});
  });
}

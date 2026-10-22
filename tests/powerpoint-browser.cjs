// NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/powerpoint-browser.cjs [URL]
const assert = require('node:assert/strict');
const { mkdir, readFile, writeFile } = require('node:fs/promises');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({headless:true, ...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE} : {})});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:900},timezoneId:'America/Los_Angeles'});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2] || 'file://' + require('node:path').resolve(__dirname,'../index.html'));
  await page.click('#welcome-demo-btn');
  await page.waitForTimeout(1700); // Initial demo navigation to today must finish before the snapshot.
  await page.locator('#project-name').fill('Презентация /:*?');
  await page.evaluate(()=>{
   gantt.close('group_1');
   gantt.scrollTo(100,60);
   htmlToImage.toCanvas=()=>{throw new Error('PPTX must not take a screenshot')};
  });
  const snapshot=()=>page.evaluate(()=>({data:gantt.serialize(),scroll:gantt.getScrollState(),dirty:document.getElementById('status-unsaved').className,
   selected:gantt.getSelectedId(),theme:document.documentElement.getAttribute('data-theme'),style:document.getElementById('gantt-container').style.cssText}));
  let before=await snapshot();
  const open=async()=>{await page.click('#btn-export');await page.click('#btn-export-pptx');};
  const finish=async()=>{
   await page.waitForFunction(()=>document.getElementById('export-progress-overlay')?.style.display==='none');
   assert.deepEqual(await snapshot(),before);
  };
  await open();
  assert.equal(await page.locator('#pptx-theme').evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#btn-export').evaluate(e=>e===document.activeElement),true);
  await page.route('**/pptxgenjs@*/**',route=>route.abort());
  await open();await page.click('#btn-confirm-pptx');await finish();
  assert.match(await page.locator('body').innerText(),/Не удалось загрузить библиотеку экспорта/);
  await page.unroute('**/pptxgenjs@*/**');
  const output=process.env.EXPORT_OUTPUT_DIR || '/tmp/gantt-powerpoint-check';await mkdir(output,{recursive:true});
  for(const theme of ['light','dark']) {
   await open();await page.selectOption('#pptx-theme',theme);
   const event=page.waitForEvent('download');await page.click('#btn-confirm-pptx');const download=await event;
   assert.match(download.suggestedFilename(),/^Презентация_\d{4}-\d{2}-\d{2}\.pptx$/);
   const filename=`${output}/${theme}.pptx`;await download.saveAs(filename);await finish();
   const data=(await readFile(filename)).toString('base64');
   const result=await page.evaluate(async ({data,theme})=>{
    const zip=await JSZip.loadAsync(data,{base64:true});
    const entries=Object.keys(zip.files).filter(p=>/^ppt\/slides\/slide\d+\.xml$/.test(p)).sort((a,b)=>parseInt(a.match(/slide(\d+)/)[1])-parseInt(b.match(/slide(\d+)/)[1]));
    const slides=await Promise.all(entries.map(async p=>{
     const xml=await zip.file(p).async('string'), doc=new DOMParser().parseFromString(xml,'text/xml');
     return {xml,text:[...doc.getElementsByTagName('a:t')].map(e=>e.textContent),pictures:doc.getElementsByTagName('p:pic').length, shapes:doc.getElementsByTagName('p:sp').length};
    }));
    return {slides,presentation:await zip.file('ppt/presentation.xml').async('string'), media:Object.keys(zip.files).filter(p=>/^ppt\/media\/.+/.test(p))};
   },{data,theme});
   assert.ok(result.slides.length>=5);
   assert.equal(result.media.length,0);
   assert.match(result.presentation,/cx="12192000" cy="6858000"/);
   assert.ok(result.slides.every(s=>s.pictures===0 && s.shapes>0 && s.xml.includes(theme==='dark'?'161B22':'FFFFFF')));
   const texts=result.slides.flatMap(s=>s.text).join('');
   for(const task of before.data.data) assert.ok(texts.replace(/\s/g,'').includes((task.raw_title || task.text).replace(/\s/g,'')),task.text);
   assert.ok(result.slides[0].text.includes('Обзор'));
  }
  await page.evaluate(()=>{
   window.originalPptxCreate=GanttPowerPoint.create;
   window.pptxCalls=0;
   GanttPowerPoint.create=async(...args)=>{window.pptxCalls++;await new Promise(resolve=>{window.resumePptx=resolve});return window.originalPptxCreate(...args)};
  });
  await open();await page.click('#btn-confirm-pptx');
  await page.waitForFunction(()=>typeof window.resumePptx==='function');
  await page.evaluate(()=>document.getElementById('btn-confirm-pptx').click());
  assert.equal(await page.evaluate(()=>window.pptxCalls),1);
  const resumed=page.waitForEvent('download');await page.evaluate(()=>window.resumePptx());await resumed;await finish();
  await page.evaluate(()=>{GanttPowerPoint.create=window.originalPptxCreate});
  // Failed writer and repeated export must release the common export lock.
  await page.evaluate(()=>{window.originalPptxCreate=GanttPowerPoint.create;GanttPowerPoint.create=()=>{throw new Error('pptx writer test failure')};});
  await open();await page.click('#btn-confirm-pptx');await finish();
  assert.match(await page.locator('body').innerText(),/pptx writer test failure/);
  await page.evaluate(()=>{GanttPowerPoint.create=window.originalPptxCreate;gantt.clearAll()});before=await snapshot();
  await open();const empty=page.waitForEvent('download');await page.click('#btn-confirm-pptx');await (await empty).saveAs(`${output}/empty.pptx`);await finish();
  const stress = await page.evaluate(async () => {
   const items = [{id:'stress',type:'group',title:'Группа с длинными названиями',start_date:'2025-01-01',end_date:'2027-01-01',color:'#123456'}];
   for(let i=0;i<24;i++) items.push({id:'m'+i,type:'milestone',title:'Контрольная точка '+i,start_date:'2026-03-08',end_date:'2026-03-08',parent_id:'stress',color:'#F59E0B'});
   for(let i=0;i<18;i++) items.push({id:'t'+i,type:'task',title:'Задача '+i+' '+ 'Полное название без обрезания '.repeat(i===0?18:2),start_date:'2026-03-08',end_date:'2026-04-01',parent_id:'stress',color:'#3B82F6',notes:'SECRET_NOTES',assignee:'SECRET_ASSIGNEE',progress:67});
   const blob=await GanttPowerPoint.create(PptxGenJS,'Проверка продолжений',{items,links:[]},'light');
   const bytes=new Uint8Array(await blob.arrayBuffer());
   const zip=await JSZip.loadAsync(bytes);
   const paths=Object.keys(zip.files).filter(p=>/^ppt\/slides\/slide\d+\.xml$/.test(p));
   const texts=[], rowTexts=[];
   for(const path of paths) {
    const doc=new DOMParser().parseFromString(await zip.file(path).async('string'),'text/xml');
    texts.push([...doc.getElementsByTagName('a:t')].map(e=>e.textContent).join(''));
    for(const shape of doc.getElementsByTagName('p:sp')) {
     if([...shape.getElementsByTagName('a:rPr')].some(e=>e.getAttribute('sz')==='1700')) rowTexts.push([...shape.getElementsByTagName('a:t')].map(e=>e.textContent).join(''));
    }
   }
   return {bytes:Array.from(bytes),texts,rowTexts,titles:items.map(i=>i.title)};
  });
  await writeFile(`${output}/stress.pptx`,Buffer.from(stress.bytes));
  assert.ok(stress.texts.length>5);
  const all=stress.rowTexts.join('').replace(/\s/g,'');
  for(const title of stress.titles) assert.ok(all.includes(title.replace(/\s/g,'')),title);
  assert.ok(!all.includes('SECRET_'));
  assert.deepEqual(errors,[]);
  console.log('PPTX themes, full tree, native shapes/text, cancel/focus, CDN/writer failures/retry, empty project, unchanged UI passed. Files: '+output);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

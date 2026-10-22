// Optional: NODE_PATH=<Playwright> BROWSER_EXECUTABLE=<Chromium> node tests/export-browser.cjs [URL]
const assert = require('node:assert/strict');
const { mkdir, readFile } = require('node:fs/promises');
const { chromium } = require('playwright');

(async () => {
  const html = await readFile(require('node:path').resolve(__dirname, '../index.html'), 'utf8');
  assert.doesNotMatch(html, /data-pplx-inline-edit|INLINE_EDIT_(CAPTURE_REQUEST|SCREENSHOT_RESULT|SCROLL)/);
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, timezoneId: 'Europe/Moscow' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = process.argv[2] || 'file://' + require('node:path').resolve(__dirname, '../index.html');
    await page.goto(url);
    await page.waitForSelector('#welcome-demo-btn');
    // Before the late today-scroll callback can run, let initial setup settle.
    await page.waitForTimeout(300);
    const project = { schema_version: 1, project: { id: 'export', name: 'Старое имя' }, links: [], items: [
      {id:'g', type:'group', title:'Свёрнутая группа', start_date:'2026-10-01', end_date:'2027-01-01', is_expanded:false},
      {id:'hidden', parent_id:'g', type:'task', title:'Скрытая задача', start_date:'2026-10-01', end_date:'2026-10-05'},
      ...Array.from({length:35}, (_,i) => ({ id:'t'+i, type:'task', title:i === 34 ? 'Последняя строка' : 'Строка '+i,
        start_date:i === 34 ? '2026-12-20' : '2026-10-01', end_date:i === 34 ? '2027-01-01' : '2026-10-05',
        color:i === 34 ? '#fe12ab' : '#17c964' }))
    ] };
    await page.locator('#welcome-file-input').setInputFiles({name:'export.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(project))});
    await page.waitForSelector('#welcome-overlay', {state:'hidden'});
    await page.waitForTimeout(1700); // let the application's delayed hint/today actions finish
    await page.locator('#project-name').fill('Новый план /:*?');
    await page.evaluate(() => {
      document.querySelector('.status-bar').style.visibility = 'visible';
      gantt.scrollTo(120, 100);
    });
    const snapshot = () => page.evaluate(() => ({
      height:document.getElementById('gantt-container').style.height,
      minHeight:document.getElementById('gantt-container').style.minHeight,
      width:document.getElementById('gantt-container').style.width,
      minWidth:document.getElementById('gantt-container').style.minWidth,
      gridWidth:gantt.config.grid_width,keepGridWidth:gantt.config.keep_grid_width,
      actualHeight:document.getElementById('gantt-container').offsetHeight,
      panels:[...document.querySelectorAll('.toolbar,.status-bar,.link-hint-bar')].map(e=>e.style.visibility),
      scroll:{x:gantt.getScrollState().x,y:gantt.getScrollState().y},
      data:gantt.serialize(), dirty:!document.getElementById('status-unsaved').classList.contains('hidden')
    }));
    const before = await snapshot();
    const finished = () => page.waitForFunction(() => document.getElementById('export-progress-overlay')?.style.display === 'none');
    const start = format => page.evaluate(format => document.getElementById('btn-export-'+format).click(), format);
    const restored = async () => { await finished(); assert.deepEqual(await snapshot(), before); };
    const output = process.env.EXPORT_OUTPUT_DIR || '/tmp/gantt-export-check';
    await mkdir(output, {recursive:true});
    for (const theme of ['light','dark']) {
      await page.evaluate(theme => { document.documentElement.setAttribute('data-theme',theme); gantt.render(); }, theme);
      for (const format of ['png','jpeg']) {
        const event = page.waitForEvent('download');
        await start(format);
        const download = await event;
        const date = await page.evaluate(() => {const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');});
        assert.equal(download.suggestedFilename(), `Новый план_${date}.${format}`);
        await download.saveAs(`${output}/${theme}.${format}`);
        const stream = await download.createReadStream();
        const chunks = []; for await (const chunk of stream) chunks.push(chunk);
        const bytes = Buffer.concat(chunks);
        assert.equal(format === 'png' ? bytes.subarray(1,4).toString() : bytes.subarray(0,2).toString('hex'), format === 'png' ? 'PNG' : 'ffd8');
        const pixels = await page.evaluate(async ({data, format}) => {
          const image = new Image(); image.src=`data:image/${format};base64,${data}`; await image.decode();
          const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
          const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
          // The last task is magenta, at the bottom and far end of the timeline.
          const strip=ctx.getImageData(Math.floor(image.width*0.65),image.height-36,Math.floor(image.width*0.35),36).data;
          let magenta=0;for(let i=0;i<strip.length;i+=4) if(strip[i]>220&&strip[i+1]<60&&strip[i+2]>130&&strip[i+2]<220)magenta++;
          return {width:image.width,height:image.height,magenta};
        }, {data:bytes.toString('base64'),format});
        assert.ok(pixels.width > 1200 && pixels.height > 700, JSON.stringify(pixels));
        assert.ok(pixels.magenta > 20, 'last task missing: '+JSON.stringify(pixels));
        await restored();
        console.log('PASS', theme, format, pixels);
      }
    }

    // Fast fault injection still uses real chart layout, scrolling, canvas and download flow.
    const stages = ['snapshot','resize','capture','encode','null-blob','url','download'];
    for (const stage of stages) {
      await page.evaluate(stage => {
        const undo=[]; window.restoreExportTest=()=>undo.reverse().forEach(fn=>fn());
        const patch=(object,key,fn)=>{const old=object[key];object[key]=fn(old);undo.push(()=>object[key]=old);};
        const fail=()=>{throw new Error('injected '+stage);};
        patch(htmlToImage,'toCanvas',()=>async()=>{
          if(stage==='capture')fail();
          const c=document.createElement('canvas');c.width=1200;c.height=1400;return c;
        });
        if(stage==='snapshot')patch(gantt,'getScrollState',old=>function(...args){gantt.getScrollState=old;return fail();});
        if(stage==='resize')patch(gantt,'setSizes',old=>function(...args){gantt.setSizes=old;old.apply(this,args);return fail();});
        if(stage==='encode')patch(HTMLCanvasElement.prototype,'toBlob',()=>()=>fail());
        if(stage==='null-blob')patch(HTMLCanvasElement.prototype,'toBlob',()=>callback=>callback(null));
        if(stage==='url')patch(URL,'createObjectURL',()=>()=>fail());
        if(stage==='download')patch(HTMLAnchorElement.prototype,'click',old=>function(){if(this.download)return fail();return old.call(this);});
      },stage);
      await start('png');
      await page.waitForFunction(stage=>document.querySelector('.toast--error')?.textContent.includes(stage==='null-blob'?'закодировать':'injected '+stage),stage);
      await page.evaluate(()=>window.restoreExportTest());
      // An error before the overlay is first shown also has to release the guard.
      await restored();
      console.log('PASS recovery',stage);
    }
    // A successful retry also verifies the guard is reset after a download error.
    await page.locator('#project-name').fill(' /:*? ');
    let downloads=0;
    const counted=()=>downloads++;page.on('download',counted);
    const event=page.waitForEvent('download');
    await start('png');await start('jpeg');
    const last=await event;await finished();
    assert.match(last.suggestedFilename(), /^gantt_\d{4}-\d{2}-\d{2}\.png$/);
    assert.equal(downloads,1);
    page.off('download',counted);
    // Empty project is a legal export: no zero-height canvas or stuck spinner.
    await page.click('#btn-new-project'); await page.click('#btn-create-project'); await page.click('#btn-ok-confirm');
    const empty=page.waitForEvent('download');await start('jpeg');await empty;await finished();
    assert.equal(await page.locator('#status-unsaved').isVisible(),true);
    assert.deepEqual(errors,[]);
    console.log('PASS retry, single export, fallback filename, empty project; images:',output);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try {
  const page=await browser.newPage({viewport:{width:1400,height:900},timezoneId:'Europe/Moscow'});
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
  await page.clock.install({time:new Date('2026-10-22T12:00:00+03:00')});
  await page.goto(process.argv[2]||'file://'+require('node:path').resolve(__dirname,'../index.html'));
  const project={schema_version:1,project:{id:'today',name:'Сегодня'},links:[],items:[{id:'a',title:'Задача',type:'task',start_date:'2026-10-15',end_date:'2026-10-30'}]};
  const load=async()=>{
   await page.locator('#welcome-file-input').setInputFiles({name:'today.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});
   await page.waitForSelector('#welcome-overlay',{state:'hidden'});
  };
  await load();
  for(const scale of ['day','week','month','quarter']){
   await page.locator(`[data-zoom="${scale}"]`).click();
   const result=await page.evaluate(()=>{
    const marker={start_date:new Date(2026,9,22)};
    const el=document.querySelector('.today_marker');
    return {count:document.querySelectorAll('.today_marker').length,date:el.dataset.date,left:parseFloat(el.style.left),expected:gantt.posFromDate(marker.start_date),height:el.getBoundingClientRect().height,pointer:getComputedStyle(el).pointerEvents};
   });
   assert.equal(result.count,1);assert.equal(result.date,'2026-10-22');assert.ok(Math.abs(result.left-result.expected)<2);assert.ok(result.height>0);assert.equal(result.pointer,'none');
  }
  await page.locator('[data-zoom="day"]').click();await page.click('#btn-today');await page.waitForTimeout(250);
  await page.screenshot({path:'/tmp/gantt-today.png'});
  await page.click('[data-theme-toggle]');
  assert.equal(await page.locator('.today_marker').count(),1);
  await page.screenshot({path:'/tmp/gantt-today-dark.png'});
  await page.evaluate(()=>{gantt.clearAll();gantt.parse({data:[{id:'b',text:'Повторная загрузка',start_date:new Date(2026,9,20),duration:8}],links:[]});});
  assert.equal(await page.locator('.today_marker').count(),1);
  await page.evaluate(()=>{
    gantt.clearAll();
    gantt.parse({data:Array.from({length:80},(_,i)=>({id:'row'+i,text:'Строка '+i,start_date:new Date(2026,9,20),duration:8})),links:[]});
    gantt.showDate(new Date(2026,9,18));
  });
  const checkCoverage = async () => {
    const coverage = await page.evaluate(()=>{
      const line=document.querySelector('.today_marker').getBoundingClientRect();
      const area=gantt.$task_data.getBoundingClientRect();
      return {top:line.top,bottom:line.bottom,areaTop:area.top,areaBottom:area.bottom,scroll:gantt.getScrollState().y};
    });
    assert.ok(coverage.top<=coverage.areaTop+1, JSON.stringify(coverage));
    assert.ok(coverage.bottom>=coverage.areaBottom-1, JSON.stringify(coverage));
    return coverage;
  };
  await checkCoverage();
  await page.mouse.move(1100,500);await page.mouse.wheel(0,2600);await page.waitForTimeout(300);
  assert.ok((await checkCoverage()).scroll>0);
  await page.evaluate(()=>gantt.scrollTo(null,10000));
  assert.ok((await checkCoverage()).scroll>1000);
  await page.screenshot({path:'/tmp/gantt-today-scrolled.png'});
  await page.mouse.wheel(0,-3000);await page.waitForTimeout(300);await checkCoverage();
  await page.evaluate(()=>gantt.scrollTo(null,0));await checkCoverage();
  await page.evaluate(()=>gantt.batchUpdate(()=>{for(let i=1;i<80;i++)gantt.deleteTask('row'+i);}));
  await checkCoverage();
  assert.ok(await page.evaluate(()=>document.querySelector('.today_marker').getBoundingClientRect().height<1000));
  await page.clock.setSystemTime(new Date('2026-10-23T12:00:00+03:00'));
  await page.evaluate(()=>gantt.render());
  assert.equal(await page.evaluate(()=>document.querySelector('.today_marker').dataset.date),'2026-10-23');
  await page.clock.setSystemTime(new Date('2027-10-23T12:00:00+03:00'));
  await page.evaluate(()=>gantt.render());
  assert.equal(await page.locator('.today_marker').count(),0);
  assert.deepEqual(errors,[]);console.log('Today marker: import, four scales, clear/parse, next-day render passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

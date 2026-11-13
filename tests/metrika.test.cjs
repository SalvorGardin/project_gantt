const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const code = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/)[1];
assert.match(html, /<head>\s*<meta charset="UTF-8" \/>\s*<!-- Yandex.Metrika counter -->\s*<script/);
assert.match(html, /<body>\s*<!-- Yandex.Metrika counter -->\s*<noscript><div><img src="https:\/\/mc.yandex.ru\/watch\/114229137" style="position:absolute; left:-9999px;" alt="" \/><\/div><\/noscript>/);
const url = 'https://mc.yandex.ru/metrika/tag.js?id=114229137';
for (const existing of [false, true]) {
  const inserted = [];
  const anchor = {parentNode:{insertBefore: (script, before) => {assert.equal(before, anchor); inserted.push(script);}}};
  const ctx = {document:{scripts:existing ? [{src:url}] : [anchor], referrer:'https://example.org/', createElement:tag=>{assert.equal(tag,'script'); return {};}, getElementsByTagName:()=>[anchor]}, location:{href:'https://example.org/gantt'}};
  ctx.window = ctx;
  vm.runInNewContext(code,ctx);
  assert.equal(inserted.length,existing?0:1);
  if (!existing) {assert.equal(inserted[0].src,url); assert.equal(inserted[0].async,1);}
  assert.equal(ctx.ym.a.length,1);
  const args = ctx.ym.a[0];
  assert.equal(args[0],114229137); assert.equal(args[1],'init');
  assert.deepEqual(JSON.parse(JSON.stringify(args[2])),{ssr:true,webvisor:true,clickmap:true,referrer:ctx.document.referrer,url:ctx.location.href,accurateTrackBounce:true,trackLinks:true});
}
console.log('PASS: placement, fallback, init parameters, async load, duplicate guard');

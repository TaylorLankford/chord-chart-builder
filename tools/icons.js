const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const svg=fs.readFileSync(process.argv[2],'utf8'); const out=process.argv[3];
 for (const [n,sz] of [['icon-192.png',192],['icon-512.png',512],['apple-touch-icon.png',180]]) {
  const p=await b.newPage({viewport:{width:sz,height:sz}}); await p.setContent('<style>html,body{margin:0}</style><img src="data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64')+'" width='+sz+' height='+sz+'>'); await p.screenshot({path:out+'/'+n}); await p.close(); }
 await b.close(); })();

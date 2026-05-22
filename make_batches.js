const fs = require('fs');
const path = require('path');
const markers = ['Worth noting', 'In practice', 'That said,', 'Students often', 'One more thing'];

const unprocessed = [];
const vdir = 'content/vocabulary';
fs.readdirSync(vdir).filter(f=>f.endsWith('.md')).sort().forEach(f => {
  const c = fs.readFileSync(path.join(vdir,f),'utf8');
  if (!markers.some(m=>c.includes(m))) unprocessed.push(path.join(vdir,f).split('\\').join('/'));
});
const fdir = 'content/foundations';
fs.readdirSync(fdir).filter(f=>f.endsWith('.md')).sort().forEach(f => {
  const c = fs.readFileSync(path.join(fdir,f),'utf8');
  if (!markers.some(m=>c.includes(m))) unprocessed.push(path.join(fdir,f).split('\\').join('/'));
});

const batchSize = 12;
const batches = [];
for(let i=0;i<unprocessed.length;i+=batchSize) batches.push(unprocessed.slice(i,i+batchSize));
console.log('Total files:', unprocessed.length);
console.log('Batches:', batches.length);
fs.writeFileSync('_rewrite_batches.json', JSON.stringify(batches, null, 2));
console.log('Written to _rewrite_batches.json');

const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'content/vocabulary');
let fixed = 0;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
files.forEach(f => {
  const fp = path.join(dir, f);
  let c = fs.readFileSync(fp, 'utf8');
  // Ensure ## section headers have a blank line before them
  // But NOT inside frontmatter (---...---)
  const nc = c.replace(/([^\n])\n(## (?!.*: ))/g, '$1\n\n$2');
  if (nc !== c) { fs.writeFileSync(fp, nc, 'utf8'); fixed++; }
});

console.log('Fixed formatting in ' + fixed + ' files');

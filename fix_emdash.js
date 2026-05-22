const fs = require('fs');
const path = require('path');

let fixed = 0, filesFixed = 0;

function fixFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  if (!content.includes('—')) return;

  // Context-aware replacement:
  // 1. Related Expressions: **term (romaji)** — desc  →  **term (romaji)**: desc
  // 2. Quiz sections: word — word  →  word: word  (inside ## Quiz block)
  // 3. General prose: " — "  →  ", "

  let result = content;

  // Fix Related Expressions entries: **bold** — desc → **bold**: desc
  result = result.replace(/(\*\*[^*]+\*\*)\s*—\s*/g, '$1: ');

  // Fix remaining " — " in prose → ", "
  result = result.replace(/ — /g, ', ');

  // Fix any leftover lone —
  result = result.replace(/—/g, '-');

  if (result !== content) {
    fs.writeFileSync(filepath, result, 'utf8');
    filesFixed++;
    fixed += (content.match(/—/g) || []).length;
  }
}

['content/vocabulary', 'content/foundations'].forEach(dir => {
  fs.readdirSync(dir).filter(f => f.endsWith('.md')).forEach(f => {
    fixFile(path.join(dir, f));
  });
});

console.log(`Fixed ${fixed} em dashes in ${filesFixed} files.`);

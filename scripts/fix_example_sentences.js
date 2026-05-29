#!/usr/bin/env node
/**
 * Transform vocabulary files missing ## Example Sentences:
 *   - Extract inline blocks (JP / <small>*romaji*</small> / EN)
 *   - Reformat as keigo-card blue div under ## Example Sentences
 *   - Insert just before ## Related Expressions
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Match: JP line \n <small>*romaji*</small> \n EN line
const EXAMPLE_RE = /^([^\n<\-#*][^\n]*)\n<small>\*([^*\n]+)\*<\/small>\n([^\n]+)/gm;

function buildKeigoCard(examples) {
  const items = examples.map(([jp, romaji, en]) =>
    `<span class="keigo-jp"><code>${jp.trim()}</code></span><br>\n` +
    `<em>${romaji.trim()}</em><br>\n` +
    en.trim()
  );
  return (
    '## Example Sentences\n\n' +
    '<div class="keigo-card blue">\n' +
    items.join('\n<br><br>\n') +
    '\n</div>'
  );
}

function transformFile(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8').replace(/^\uFEFF/, ''); // strip BOM

  if (raw.includes('## Example Sentences')) return 'skip';
  if (!raw.includes('<small>'))              return 'no_inline';
  if (!raw.includes('## Related Expressions')) return 'no_related';

  const splitIdx = raw.indexOf('## Related Expressions');
  const body = raw.slice(0, splitIdx);
  const tail = raw.slice(splitIdx);

  const examples = [];
  let m;
  EXAMPLE_RE.lastIndex = 0;
  while ((m = EXAMPLE_RE.exec(body)) !== null) {
    examples.push([m[1], m[2], m[3]]);
  }

  if (examples.length === 0) return 'no_match';

  // Remove inline blocks from body
  EXAMPLE_RE.lastIndex = 0;
  let cleaned = body.replace(EXAMPLE_RE, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n\n';

  const keigo = buildKeigoCard(examples);
  const newContent = cleaned + keigo + '\n\n' + tail;

  fs.writeFileSync(filepath, newContent, 'utf8');
  return `ok (${examples.length} examples)`;
}

// Collect files missing ## Example Sentences
function getVocabFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getVocabFiles(full));
    else if (entry.name.endsWith('.md')) results.push(full);
  }
  return results.sort();
}

const vocabDir = path.join(__dirname, '..', 'content', 'vocabulary');
const allFiles = getVocabFiles(vocabDir);
const targets  = allFiles.filter(f => !fs.readFileSync(f, 'utf8').includes('## Example Sentences'));

console.log(`Files to transform: ${targets.length}`);

const counts = {};
for (const fp of targets) {
  const result = transformFile(fp);
  counts[result] = (counts[result] || 0) + 1;
  if (!result.startsWith('ok')) {
    console.log(`  [${result}] ${fp}`);
  }
}

console.log('\n--- Summary ---');
for (const [k, v] of Object.entries(counts).sort()) {
  console.log(`  ${k}: ${v}`);
}

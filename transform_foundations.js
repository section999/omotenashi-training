const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'content', 'foundations');

function isQuizBullet(line) {
  return /^- [A-D]\./.test(line);
}

function formatBulletItems(bullets) {
  const parts = [];
  bullets.forEach((line, idx) => {
    const isSub = line.startsWith('  - ');
    const text = (isSub ? line.slice(4) : line.slice(2)).trim();
    const boldM = text.match(/^\*\*(.+?)\*\*[:\s]\s*([\s\S]*)/);

    if (boldM && !isSub) {
      const desc = boldM[2].trim();
      if (idx > 0) parts.push('<br><br>');
      parts.push(`<span class="keigo-badge info">${boldM[1]}</span>${desc ? ' ' + desc : ''}`);
    } else if (isSub) {
      parts.push(`<br>&nbsp;&nbsp;• ${text}`);
    } else {
      if (idx > 0) parts.push('<br>');
      parts.push('• ' + text);
    }
  });
  return parts.join('');
}

function formatNumberedItems(items) {
  const parts = [];
  items.forEach((line, idx) => {
    if (idx > 0) parts.push('<br><br>');
    const m = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*[:\s]\s*([\s\S]*)/);
    const m2 = line.match(/^(\d+)\.\s+([\s\S]*)/);
    if (m) {
      parts.push(`<span class="keigo-badge info">${m[1]}. ${m[2]}</span>`);
      const rest = m[3].trim();
      if (rest) parts.push('<br>' + rest);
    } else if (m2) {
      parts.push(`<span class="keigo-badge info">${m2[1]}.</span> ${m2[2].trim()}`);
    }
  });
  return parts.join('');
}

function processH3Content(lines) {
  const nonEmpty = lines.filter(l => l.trim());
  if (!nonEmpty.length) return '';

  const parts = [];
  let prevType = 'none';
  let i = 0;

  while (i < nonEmpty.length) {
    const line = nonEmpty[i];

    if (line.startsWith('- ') && !isQuizBullet(line)) {
      const bullets = [];
      while (i < nonEmpty.length && (nonEmpty[i].startsWith('- ') || nonEmpty[i].startsWith('  - '))) {
        if (nonEmpty[i].startsWith('- ') && isQuizBullet(nonEmpty[i])) break;
        bullets.push(nonEmpty[i]);
        i++;
      }
      if (parts.length > 0) parts.push('<br>');
      parts.push(formatBulletItems(bullets));
      prevType = 'bullet';
      continue;
    }

    // Skip short label lines like "Examples:"
    if (/^[A-Za-z][^.!?]{0,13}:$/.test(line.trim())) {
      i++; continue;
    }

    if (prevType !== 'none') parts.push('<br>');
    parts.push(line.trim());
    prevType = 'prose';
    i++;
  }

  return parts.join('');
}

function transform(content) {
  if (content.includes('keigo-card')) return null;

  const lines = content.split('\n');
  const result = [];
  let i = 0;
  let inQuiz = false;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## Quiz')) inQuiz = true;
    if (inQuiz) { result.push(line); i++; continue; }

    // ### group → single keigo-card with badges
    if (line.startsWith('### ')) {
      const h3Blocks = [];
      while (i < lines.length && lines[i].startsWith('### ')) {
        const title = lines[i].slice(4).trim();
        i++;
        const blockLines = [];
        while (i < lines.length && !lines[i].startsWith('### ') && !lines[i].startsWith('## ') && lines[i] !== '---') {
          blockLines.push(lines[i]);
          i++;
        }
        h3Blocks.push({ title, lines: blockLines });
      }
      if (h3Blocks.length > 0) {
        result.push('');
        result.push('<div class="keigo-card blue">');
        h3Blocks.forEach((block, bi) => {
          result.push(`<span class="keigo-badge info">${block.title}</span><br>`);
          const c = processH3Content(block.lines);
          if (c) result.push(c);
          if (bi < h3Blocks.length - 1) result.push('<br><br>');
        });
        result.push('</div>');
        result.push('');
      }
      continue;
    }

    // Bullet list → keigo-card
    if (line.match(/^- /) && !isQuizBullet(line)) {
      const bullets = [];
      while (i < lines.length && (lines[i].match(/^- /) || lines[i].match(/^  - /))) {
        if (lines[i].match(/^- /) && isQuizBullet(lines[i])) break;
        bullets.push(lines[i]);
        i++;
      }
      if (bullets.length >= 2) {
        result.push('<div class="keigo-card blue">');
        result.push(formatBulletItems(bullets));
        result.push('</div>');
        result.push('');
      } else {
        result.push(...bullets);
      }
      continue;
    }

    // Numbered list → keigo-card
    if (line.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i]);
        i++;
      }
      if (items.length >= 2) {
        result.push('<div class="keigo-card blue">');
        result.push(formatNumberedItems(items));
        result.push('</div>');
        result.push('');
      } else {
        result.push(...items);
      }
      continue;
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

const TEST_ONLY = process.argv[2] === '--test';
const TEST_FILES = process.argv[2] === '--files' ? process.argv.slice(3) : null;

const allFiles = fs.readdirSync(BASE)
  .filter(f => f.match(/^m[1-4]-/) && f.endsWith('.md'))
  .sort();

let sample;
if (TEST_FILES) {
  sample = TEST_FILES.map(f => path.join(BASE, f));
} else if (TEST_ONLY) {
  // Test on representative files
  const picks = ['m1-philosophy-01.md', 'm2-appearance-01.md', 'm3-vip-01.md', 'm4-recovery-01.md', 'm4-emotions-01.md'];
  sample = picks.map(f => path.join(BASE, f));
} else {
  sample = allFiles.map(f => path.join(BASE, f));
}

console.log(`${TEST_ONLY || TEST_FILES ? 'TEST' : 'RUN'}: ${sample.length} files`);

let ok = 0, skip = 0, err = 0;
for (const fp of sample) {
  const f = path.basename(fp);
  try {
    const original = fs.readFileSync(fp, 'utf-8');
    const transformed = transform(original);
    if (!transformed) {
      skip++;
      if (TEST_ONLY || TEST_FILES) console.log(`  SKIP: ${f}`);
      continue;
    }
    if (TEST_ONLY || TEST_FILES) {
      console.log(`\n=== ${f} ===`);
      const lines = transformed.split('\n');
      // Show from first ## heading to end of first card block
      let start = lines.findIndex(l => l.startsWith('## ') && !l.startsWith('## Quiz'));
      if (start < 0) start = 0;
      console.log(lines.slice(start, Math.min(lines.length, start + 40)).join('\n'));
    } else {
      fs.writeFileSync(fp, transformed, 'utf-8');
    }
    ok++;
  } catch (e) {
    console.error(`  ERROR: ${f}: ${e.message}`);
    err++;
  }
}
console.log(`\nDone: ${ok} transformed, ${skip} skipped, ${err} errors`);

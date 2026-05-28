const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'content', 'vocabulary');

function transformTable(content) {
  const lines = content.split('\n');
  const result = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '| Japanese | Meaning |') {
      const rows = [];
      i++;
      if (i < lines.length && lines[i].includes('|---')) i++;
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i]);
        i++;
      }
      const card = [
        '',
        '## Example Sentences',
        '',
        '<div class="keigo-card blue">',
        '<span class="keigo-card-title">Example Sentences</span>',
      ];
      rows.forEach((row, j) => {
        const parts = row.split('|');
        if (parts.length < 3) return;
        const jpCell = parts[1].trim();
        const enCell = parts[2].trim();
        const brPos = jpCell.indexOf('<br><small>');
        let jpText, romaji;
        if (brPos !== -1) {
          jpText = jpCell.slice(0, brPos).trim();
          const after = jpCell.slice(brPos + 11);
          const rm = after.match(/\*(.*?)\*/);
          romaji = rm ? rm[1] : '';
        } else {
          jpText = jpCell;
          romaji = '';
        }
        card.push(`<span class="keigo-jp"><code>${jpText}</code></span><br>`);
        if (romaji) card.push(`<em>${romaji}</em><br>`);
        card.push(enCell);
        if (j < rows.length - 1) card.push('<br><br>');
      });
      card.push('</div>');
      result.push(...card);
    } else {
      result.push(line);
      i++;
    }
  }
  return result.join('\n');
}

function transformRelated(content) {
  return content.replace(
    /## Related Expressions\n\n((?:- \*\*.+\n?)+)/g,
    (_, block) => {
      const items = block.trim().split('\n').filter(l => l.trim().startsWith('-'));
      const card = [
        '<div class="keigo-card blue">',
        '<span class="keigo-card-title">Related Expressions</span>',
      ];
      items.forEach((item, j) => {
        item = item.replace(/^-\s*/, '');
        const tm = item.match(/\*\*(.+?)\*\*:?\s*(.*)/);
        if (tm) {
          card.push(`<span class="keigo-badge info">${tm[1]}</span> ${tm[2].trim()}`);
        } else {
          card.push(item);
        }
        if (j < items.length - 1) card.push('<br><br>');
      });
      card.push('</div>');
      return '## Related Expressions\n\n' + card.join('\n') + '\n';
    }
  );
}

function transformMistakes(content) {
  return content.replace(
    /## Common Mistakes\n\n([\s\S]+?)(?=\n\n---|$)/g,
    (_, text) => {
      return (
        '## Common Mistakes\n\n' +
        '<div class="keigo-card blue">\n' +
        '<span class="keigo-card-title">Common Mistakes</span>\n' +
        text.trim() + '\n' +
        '</div>'
      );
    }
  );
}

function transformFile(fp) {
  let content = fs.readFileSync(fp, 'utf-8');
  if (content.includes('keigo-card')) return 'SKIP';
  content = transformTable(content);
  content = transformRelated(content);
  content = transformMistakes(content);
  fs.writeFileSync(fp, content, 'utf-8');
  return 'OK';
}

const TEST_ONLY = process.argv[2] === '--test';
const files = fs.readdirSync(BASE)
  .filter(f => f.endsWith('.md'))
  .sort()
  .map(f => path.join(BASE, f));

const sample = TEST_ONLY ? files.slice(0, 3) : files;
console.log(`${TEST_ONLY ? 'TEST' : 'RUN'}: ${sample.length} files in ${BASE}`);

let ok = 0, skip = 0, err = 0;
for (const fp of sample) {
  try {
    const r = transformFile(fp);
    if (r === 'OK') ok++;
    else skip++;
    if (TEST_ONLY) console.log(`  ${r}: ${path.basename(fp)}`);
  } catch(e) {
    console.log(`  ERROR: ${path.basename(fp)}: ${e.message}`);
    err++;
  }
}
console.log(`Done: ${ok} transformed, ${skip} skipped, ${err} errors`);

const fs = require('fs');
const path = require('path');
const Kuroshiro = require('kuroshiro').default;
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');

const SOURCE_DIR = path.join(__dirname, 'content', 'foundations');

const TARGET_FILES = [
  'm5-keigo-01.md', 'm5-keigo-02.md', 'm5-keigo-03.md', 'm5-keigo-04.md',
  'm5-keigo-05.md', 'm5-keigo-06.md', 'm5-keigo-07.md', 'm5-keigo-08.md',
  'm5-email-01.md', 'm5-email-02.md', 'm5-email-03.md', 'm5-email-04.md',
  'm5-email-05.md', 'm5-email-06.md', 'm5-email-07.md', 'm5-email-08.md',
  'm5-meeting-01.md', 'm5-meeting-02.md', 'm5-meeting-03.md', 'm5-meeting-04.md',
  'm5-meeting-05.md', 'm5-meeting-06.md', 'm5-meeting-07.md', 'm5-meeting-08.md',
  'm5-phone-01.md', 'm5-phone-02.md', 'm5-phone-03.md', 'm5-phone-04.md',
  'm5-phone-05.md', 'm5-phone-06.md', 'm5-phone-07.md', 'm5-phone-08.md',
  'm5-horen-01.md', 'm5-horen-02.md', 'm5-horen-03.md', 'm5-horen-04.md',
  'm5-horen-05.md', 'm5-horen-06.md', 'm5-horen-07.md', 'm5-horen-08.md',
  'm5-doc-02.md', 'm5-doc-03.md', 'm5-doc-04.md', 'm5-doc-05.md',
  'm5-doc-06.md', 'm5-doc-07.md', 'm5-doc-08.md',
  'm5-advkeigo-01.md', 'm5-advkeigo-02.md', 'm5-advkeigo-03.md', 'm5-advkeigo-04.md',
  'm5-advkeigo-05.md', 'm5-advkeigo-06.md', 'm5-advkeigo-07.md', 'm5-advkeigo-08.md',
];

function extractPhrases(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const phrases = new Set();
  let inKeyPhrases = false;
  let tableHeaderPassed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trimStart().startsWith('## Key Phrases from the Dialogue')) {
      inKeyPhrases = true;
      tableHeaderPassed = false;
      continue;
    }

    if (inKeyPhrases) {
      if (line.trimStart().startsWith('## ')) {
        inKeyPhrases = false;
        tableHeaderPassed = false;
        continue;
      }

      if (!tableHeaderPassed) {
        if (/^\|[- ]/.test(line.trim())) {
          tableHeaderPassed = true;
        }
        continue;
      }

      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const parts = line.split('|').filter(p => p.trim().length > 0);
        if (parts.length >= 3) {
          let jp = parts[0].trim();
          jp = jp.replace(/\*\*/g, '');
          jp = jp.replace(/<[^>]*>/g, '');
          if (jp.length > 0 && !jp.startsWith('Japanese')) {
            if (jp.includes(' / ')) {
              const sub = jp.split(' / ');
              sub.forEach(s => { const t = s.trim(); if (t) phrases.add(t); });
            } else {
              phrases.add(jp);
            }
          }
        }
        continue;
      }

      if (!line.trim().startsWith('|')) {
        tableHeaderPassed = false;
      }
    }
  }

  return phrases;
}

async function main() {
  const allPhrases = new Set();

  for (const fname of TARGET_FILES) {
    const fp = path.join(SOURCE_DIR, fname);
    if (fs.existsSync(fp)) {
      const phrases = extractPhrases(fp);
      for (const p of phrases) {
        allPhrases.add(p);
      }
    } else {
      console.error(`File not found: ${fname}`);
    }
  }

  const sorted = Array.from(allPhrases).sort((a, b) => a.localeCompare(b, 'ja'));

  const kuroshiro = new Kuroshiro();
  await kuroshiro.init(new KuromojiAnalyzer());

  for (const phrase of sorted) {
    const romaji = await kuroshiro.convert(phrase, { to: 'romaji', mode: 'spaced' });
    console.log(`'${phrase}': '${romaji}',`);
  }
}

main().catch(console.error);

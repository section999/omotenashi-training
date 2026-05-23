const fs = require('fs');
const path = require('path');

const VOCAB_DIR = path.join(__dirname, 'content/vocabulary');
let filesFixed = 0;

function normalizeHeaders(text) {
  // Ensure all ## section headers are on their own line
  return text.replace(/([^\n])## /g, '$1\n## ');
}

function transform(text) {
  let t = text;

  // -- "In practice," --
  t = t.replace(/\bIn practice,\s*/g, '');
  t = t.replace(/\bin practice,\s*/g, '');
  t = t.replace(/\. ,/g, '.');
  t = t.replace(/^,\s*/gm, '');

  // -- "Worth noting:" etc --
  t = t.replace(/Worth noting:\s*/g, 'Note: ');
  t = t.replace(/Also worth noting:\s*/g, 'Note also: ');
  t = t.replace(/\bworth noting that\b/g, 'notable that');
  t = t.replace(/\bis worth noting\b/g, 'should be noted');
  t = t.replace(/\bworth watching out for\b/g, 'important to note');
  t = t.replace(/\bworth remembering\b/g, 'important');

  // -- "That said," -> "However," --
  t = t.replace(/\bThat said[,.]?\s*/g, 'However, ');

  // -- "One more thing" -> "Additionally," --
  t = t.replace(/One more thing[^.]*\./g, (match) => {
    let cleaned = match
      .replace(/^One more thing\s*/i, '')
      .replace(/^to be careful about:?\s*/i, '')
      .replace(/^:\s*/, '')
      .trim();
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    }
    if (cleaned) return 'Additionally, ' + cleaned;
    return 'Additionally.';
  });

  // -- "In other words," -> "In summary," --
  t = t.replace(/\bIn other words,\s*/g, 'In summary, ');

  // -- "Also," at sentence start (casual) -> keep --
  // -- "And finally," -> keep as-is --

  // -- Student/learner references --
  t = t.replace(/\bStudents often\s+/g, 'A common error is ');
  t = t.replace(/\bStudents usually\s+/g, 'A common error is ');
  t = t.replace(/\bStudents sometimes\s+/g, 'A common error is ');
  t = t.replace(/\bStudents may\s+/g, 'A common error occurs when learners ');
  t = t.replace(/\bLearners sometimes\s+/g, 'A common mistake is ');
  t = t.replace(/\bLearners also\s+/g, 'Another common mistake is ');
  t = t.replace(/\bLearners may\s+/g, 'A common mistake occurs when learners ');
  t = t.replace(/\bLearners often\s+/g, 'A common mistake is ');

  // Fix verb forms: "A common error is use" -> "A common error is to use"
  t = t.replace(/\bA common (error|mistake) is ([a-z]+)\b(?!(?:\s+(?:is|are|was|were|has|have|had|and|or|the|a|an|to|of|in|on|at|by|for|with|that|this|these|those|it|they|one|staff|guests?|customers?))\b)/g, (match, type, verb) => {
    if (verb.endsWith('ing') || verb.endsWith('ed') || verb === 'to') return match;
    return 'A common ' + type + ' is to ' + verb;
  });

  // -- Remove opinionated/intensifiers --
  t = t.replace(/\bis simply\b/g, 'is');
  t = t.replace(/\bare simply\b/g, 'are');
  t = t.replace(/ simply means/g, ' means');
  t = t.replace(/ simply a /g, ' a ');
  t = t.replace(/ simply the /g, ' the ');
  t = t.replace(/ simply not /g, ' not ');
  t = t.replace(/ simply one/g, ' one');
  t = t.replace(/ genuinely /g, ' ');
  t = t.replace(/ really /g, ' ');
  t = t.replace(/ actually /g, ' ');

  // -- Opinionated statements --
  t = t.replace(/is one of the most damaging/g, 'can be a damaging');
  t = t.replace(/is one of the most important/g, 'is an important');
  t = t.replace(/is one of the most common/g, 'is a common');
  t = t.replace(/is a hallmark of/g, 'reflects');
  t = t.replace(/the single most consequential/g, 'a significant');
  t = t.replace(/\bworld-class /g, '');
  t = t.replace(/is almost worse than silence/g, 'can be perceived negatively');
  t = t.replace(/is what separates/g, 'distinguishes');
  t = t.replace(/is what makes/g, 'contributes to');
  t = t.replace(/is what prevents/g, 'prevents');
  t = t.replace(/ is not optional/g, ' is expected');
  t = t.replace(/are not optional/g, 'are expected');
  t = t.replace(/the single most/g, 'a key');
  t = t.replace(/one of the most/g, 'a notable');
  // Fix broken grammar from previous runs
  t = t.replace(/can be a damaging service failures/g, 'can be a damaging service failure');
  t = t.replace(/can be damaging service failures/g, 'can be a damaging service failure');
  t = t.replace(/is what guests remember/g, 'is what guests remember'); // no-op but safe

  // -- Imperatives (line-starting) --
  const imperativeFixes = [
    [/^Practice the phrase/gm, 'The phrase should be practiced'],
    [/^Learn this/gm, 'This should be learned'],
    [/^Learn these/gm, 'These should be learned'],
    [/^Learn to/gm, 'It is important to'],
    [/^Always mention/gm, 'Staff should always mention'],
    [/^Always confirm/gm, 'Staff should always confirm'],
    [/^Always check/gm, 'Staff should always check'],
    [/^Never use/gm, 'It is best to avoid using'],
    [/^Never assume/gm, 'Staff should not assume'],
    [/^Do not confuse/gm, 'One should not confuse'],
    [/^Remember that/gm, 'It should be remembered that'],
    [/^Remember:/gm, 'Note:'],
    [/^Slow the/gm, 'One should slow the'],
    [/^Use the right/gm, 'Staff should use the right'],
    [/^And finally,/gm, 'Finally,'],
  ];
  for (const [pattern, replacement] of imperativeFixes) {
    t = t.replace(pattern, replacement);
  }

  // -- Mid-sentence imperatives --
  t = t.replace(/\balways mention\b/g, 'staff should mention');
  t = t.replace(/\balways confirm\b/g, 'staff should confirm');
  t = t.replace(/\balways check\b/g, 'staff should check');
  t = t.replace(/\balways combine\b/g, 'staff should combine');
  t = t.replace(/\balways walk\b(?=\s+guests)/g, 'staff should walk');
  t = t.replace(/\balways pair\b/g, 'staff should pair');
  t = t.replace(/\balways set\b/g, 'staff should set');
  t = t.replace(/\bnever use\b/g, 'it is best to avoid using');
  t = t.replace(/\bnever assume\b/g, 'staff should not assume');
  t = t.replace(/\balways be\b(?=\s+(?:available|ready|prepared|mindful|careful))/g, 'staff should be');
  t = t.replace(/\b(slow|lower|soften)\b your /g, 'one should $1 one\'s ');
  t = t.replace(/\byour (tone|voice|volume|speed|pace)\b/g, 'one\'s $1');

  // -- Second-person pronoun handling --
  t = t.replace(/\byou will\b/g, 'one will');
  t = t.replace(/\byou'll\b/g, 'one will');
  t = t.replace(/\byou've\b/g, 'one has');
  t = t.replace(/\byou're\b/g, 'one is');
  t = t.replace(/\byou are\b/g, 'one is');
  t = t.replace(/\byou can\b/g, 'one can');
  t = t.replace(/\byou may\b/g, 'one may');
  t = t.replace(/\byou should\b/g, 'staff should');
  t = t.replace(/\bwhen you\b/g, 'when one');
  t = t.replace(/\bif you\b/g, 'if one');
  t = t.replace(/\bas you\b/g, 'as one');

  // "your" + specific hospitality nouns -> "the"
  const yourReplacements = [
    [/\byour guest\b/g, 'the guest'],
    [/\byour guests\b/g, 'the guests'],
    [/\byour property\b/g, 'the property'],
    [/\byour hotel\b/g, 'the hotel'],
    [/\byour role\b/g, 'the role'],
    [/\byour training\b/g, 'the training'],
    [/\byour service\b/g, 'the service'],
    [/\byour response\b/g, 'the response'],
    [/\byour work\b/g, 'the work'],
    [/\byour stay\b/g, 'the stay'],
    [/\byour room\b/g, 'the room'],
    [/\byour facility\b/g, 'the facility'],
    [/\byour shift\b/g, 'the shift'],
    [/\byour own\b/g, 'one\'s own'],
    [/\byour best\b/g, 'one\'s best'],
  ];
  for (const [pattern, replacement] of yourReplacements) {
    t = t.replace(pattern, replacement);
  }
  t = t.replace(/\byour\b/g, 'one\'s');

  // -- Fix subject-verb agreement for "one" --
  t = t.replace(/\bone were\b/g, 'one was');
  t = t.replace(/\bone have\b/g, 'one has');
  t = t.replace(/\bone do\b(?=\s+(?:not|this|that|it|so|what|the|a))/g, 'one does');
  t = t.replace(/\bone say\b/g, 'one says');
  t = t.replace(/\bone charge\b/g, 'one charges');
  t = t.replace(/\bone communicate\b/g, 'one communicates');
  t = t.replace(/\bone use\b/g, 'one uses');
  t = t.replace(/\bone place\b/g, 'one places');
  t = t.replace(/\bone handle\b/g, 'one handles');
  t = t.replace(/\bone need\b/g, 'one needs');
  t = t.replace(/\bone make\b/g, 'one makes');
  t = t.replace(/\bone take\b/g, 'one takes');
  t = t.replace(/\bone give\b/g, 'one gives');
  t = t.replace(/\bone exceed\b/g, 'one exceeds');
  t = t.replace(/\bone feel\b/g, 'one feels');
  t = t.replace(/\bone know\b/g, 'one knows');
  t = t.replace(/\bone find\b/g, 'one finds');
  t = t.replace(/\bone see\b/g, 'one sees');
  t = t.replace(/\bone come\b/g, 'one comes');
  t = t.replace(/\bone go\b/g, 'one goes');

  // -- Clean up whitespace artifacts --
  t = t.replace(/ ,/g, ',');
  t = t.replace(/ \./g, '.');
  t = t.replace(/\. ,/g, '.,');
  t = t.replace(/\s+'/g, '\'');
  t = t.replace(/'s\s+/g, '\'s ');
  t = t.replace(/  +/g, ' ');
  t = t.replace(/\s+:\s+/g, ': ');
  t = t.replace(/:\s+,/g, ':');
  t = t.replace(/,\s+,/g, ',');
  t = t.replace(/\.\s+\./g, '.');
  t = t.replace(/Additionally, :/g, 'Additionally,');
  t = t.replace(/Additionally:\s*,/g, 'Additionally,');
  t = t.replace(/,\s*:/g, ':');
  t = t.replace(/\.\s*:/g, ':');
  t = t.replace(/:\s*:/g, ':');

  // Fix "staff should" duplication (case-insensitive)
  t = t.replace(/staff should staff should/gi, 'staff should');
  t = t.replace(/Staff should staff should/g, 'Staff should');
  t = t.replace(/Staff should always /g, 'Staff should ');
  t = t.replace(/staff should always /g, 'staff should ');

  return t;
}

function processFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  if (!content.trim()) return false;

  // Pre-process: normalize collapsed headers
  content = normalizeHeaders(content);

  // Find frontmatter boundaries
  if (content.indexOf('---\n') !== 0) return false;
  const fmEnd = content.indexOf('\n---\n');
  if (fmEnd < 0 || fmEnd > 500) return false;
  const frontmatter = content.substring(0, fmEnd + 5);
  let body = content.substring(fmEnd + 5);

  // Process sections within body
  const sectionRegex = /^## .+$/gm;
  const sections = [];
  let lastIdx = 0;
  let match;

  while ((match = sectionRegex.exec(body)) !== null) {
    if (lastIdx < match.index) {
      sections.push({ type: 'text', content: body.substring(lastIdx, match.index) });
    }
    const startIdx = match.index;
    const nextSectionIdx = body.indexOf('\n## ', startIdx + 1);
    const endIdx = nextSectionIdx >= 0 ? nextSectionIdx : body.length;
    const sectionContent = body.substring(startIdx, endIdx);
    const headerMatch = sectionContent.match(/^## (.+)$/m);
    const headerName = headerMatch ? headerMatch[1].trim() : '';

    if (headerName === 'Example Sentences' || headerName === 'Quiz') {
      sections.push({ type: 'preserve', content: sectionContent });
    } else if (headerName === 'Related Expressions') {
      sections.push({ type: 'related', content: sectionContent });
    } else if (headerName === 'Common Mistakes') {
      sections.push({ type: 'mistakes', content: sectionContent });
    } else {
      sections.push({ type: 'text', content: sectionContent });
    }
    lastIdx = endIdx;
  }

  if (lastIdx < body.length) {
    sections.push({ type: 'text', content: body.substring(lastIdx) });
  }

  // Rebuild
  let result = frontmatter;
  for (const section of sections) {
    if (section.type === 'text') {
      result += transform(section.content);
    } else if (section.type === 'preserve') {
      result += section.content;
    } else if (section.type === 'related') {
      result += transformRelatedSection(section.content);
    } else if (section.type === 'mistakes') {
      result += transformMistakesSection(section.content);
    }
  }

  // Final cleanup
  result = result
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/ +/g, ' ')
    .replace(/ \./g, '.')
    .replace(/ ,/g, ',');

  if (result !== content) {
    fs.writeFileSync(filepath, result, 'utf8');
    return true;
  }
  return false;
}

function transformRelatedSection(section) {
  return section.split('\n').map(line => {
    if (line.startsWith('- **')) {
      const match = line.match(/^(- \*\*[^*]+\*\*[^:)]*[:)]\s*)(.*)/);
      if (match) return match[1] + transform(match[2]);
    }
    return line;
  }).join('\n');
}

function transformMistakesSection(section) {
  return section.split('\n').map((line, i) => (i === 0 ? line : transform(line))).join('\n');
}

// Run
const files = fs.readdirSync(VOCAB_DIR).filter(f => f.endsWith('.md')).sort();
files.forEach(f => {
  try {
    if (processFile(path.join(VOCAB_DIR, f))) filesFixed++;
  } catch (err) {
    console.error(`Error processing ${f}:`, err.message);
  }
});

console.log(`Processed ${files.length} files. Transformed ${filesFixed} files.`);

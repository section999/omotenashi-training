const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'content/foundations'),
  path.join(__dirname, 'content/calendar'),
  path.join(__dirname, 'content/vocabulary'),
  path.join(__dirname, 'scenarios'),
];

let totalFixed = 0;

// ─── Transformation function ────────────────────────────────────────
function transform(text, sectionType) {
  let t = text;
  const orig = t;

  // If this is an Example Sentences, Quiz, or scenario Turn section, skip most transforms
  const preserveSection = sectionType === 'example' || sectionType === 'quiz' || sectionType === 'turn';
  const isTranslation = sectionType === 'translation';

  // ── Em dashes → commas or colons ──
  t = t.replace(/ — /g, ', ');
  t = t.replace(/—/g, ', ');

  // ── "Worth noting" (all forms) ──
  t = t.replace(/Worth noting[:\s]+/gi, 'Note: ');
  t = t.replace(/Also worth noting[:\s]+/gi, 'Note also: ');
  t = t.replace(/worth noting that/gi, 'notable that');
  t = t.replace(/is worth noting/gi, 'should be noted');
  t = t.replace(/worth watching out for/gi, 'important to note');
  t = t.replace(/worth remembering/gi, 'important');

  // ── "That said" → "However" ──
  t = t.replace(/\bThat said[,.]?\s*/g, 'However, ');
  t = t.replace(/\bthat said[,.]?\s*/g, 'however, ');

  // ── "In practice," (remove — it's filler) ──
  t = t.replace(/\bIn practice,\s*/g, '');
  t = t.replace(/\bin practice,\s*/g, '');
  t = t.replace(/^,\s*/gm, '');
  t = t.replace(/\. ,/g, '.');

  // ── "One more thing" → "Additionally," ──
  t = t.replace(/One more thing[^.]*\./g, (match) => {
    let cleaned = match
      .replace(/^One more thing\s*/i, '')
      .replace(/^to be careful about:?\s*/i, '')
      .replace(/^:\s*/, '')
      .trim();
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    }
    return cleaned ? 'Additionally, ' + cleaned : 'Additionally.';
  });

  // ── "In other words," → "In summary," ──
  t = t.replace(/\bIn other words,\s*/g, 'In summary, ');

  // ── "Of course," (removes conversational filler) ──
  t = t.replace(/\bOf course,\s*/g, '');
  t = t.replace(/\bof course\b/g, '');

  // ── Student/learner references ──
  t = t.replace(/\bStudents often\s+/g, 'A common error is ');
  t = t.replace(/\bStudents usually\s+/g, 'A common error is ');
  t = t.replace(/\bStudents sometimes\s+/g, 'A common error is ');
  t = t.replace(/\bStudents may\s+/g, 'A common error occurs when learners ');
  t = t.replace(/\bLearners sometimes\s+/g, 'A common mistake is ');
  t = t.replace(/\bLearners also\s+/g, 'Another common mistake is ');
  t = t.replace(/\bLearners may\s+/g, 'A common mistake occurs when learners ');
  t = t.replace(/\bLearners often\s+/g, 'A common mistake is ');

  // Fix "A common error is [verb]" → "A common error is to [verb]"
  t = t.replace(/\bA common (error|mistake) is ([a-z]+)\b(?!(?:\s+(?:is|are|was|were|has|have|had|and|or|the|a|an|to|of|in|on|at|by|for|with|that|this|these|those|it|they|one|staff|guests?|customers?))\b)/g, (match, type, verb) => {
    if (verb.endsWith('ing') || verb.endsWith('ed') || verb === 'to') return match;
    return 'A common ' + type + ' is to ' + verb;
  });

  // ── Remove intensifiers ──
  t = t.replace(/\b simply /g, ' ');
  t = t.replace(/\b genuinely /g, ' ');
  t = t.replace(/\b really /g, ' ');
  t = t.replace(/\b actually /g, ' ');

  // ── Opinionated language ──
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
  t = t.replace(/can be a damaging service failures/g, 'can be a damaging service failure');
  t = t.replace(/can be damaging service failures/g, 'can be a damaging service failure');

  // ── Line-starting imperatives ──
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
    [/^Take the time/gm, 'It is important to take the time'],
    [/^Make sure/gm, 'Staff should ensure'],
  ];
  for (const [pattern, replacement] of imperativeFixes) {
    t = t.replace(pattern, replacement);
  }

  // ── Mid-sentence imperatives ──
  t = t.replace(/\balways mention\b/g, 'staff should mention');
  t = t.replace(/\balways confirm\b/g, 'staff should confirm');
  t = t.replace(/\balways check\b/g, 'staff should check');
  t = t.replace(/\balways combine\b/g, 'staff should combine');
  t = t.replace(/\balways walk\b(?=\s+guests)/g, 'staff should walk');
  t = t.replace(/\bnever use\b/g, 'it is best to avoid using');
  t = t.replace(/\bnever assume\b/g, 'staff should not assume');

  // ── "one" pronoun → staff / the staff member ──
  // Only in text sections (not translations)
  if (!isTranslation && !preserveSection) {
    // "one should" → "staff should"
    t = t.replace(/\bone should\b/g, 'staff should');
    // "one can" → "staff can"
    t = t.replace(/\bone can\b/g, 'staff can');
    // "one may" → "staff may"
    t = t.replace(/\bone may\b/g, 'staff may');
    // "one will" → "staff will"
    t = t.replace(/\bone will\b/g, 'staff will');
    // "one might" → "staff might"
    t = t.replace(/\bone might\b/g, 'staff might');
    // "one must" → "staff must"
    t = t.replace(/\bone must\b/g, 'staff must');
    // "one needs" → "staff needs" or "staff need"
    t = t.replace(/\bone needs to\b/g, 'staff need to');
    // "one has" → "staff has" → but check: "staff has" if singular sense... 
    // Actually "staff" takes plural verb: "staff have", "staff need"
    t = t.replace(/\bone has\b(?=\s+(?:to|been|a|an|the))/g, 'staff has');
    // "one does" → "staff does" (but staff is plural... hmm)
    // Let me revert: "one" at sentence start → restructure
    // Actually "staff" can be treated as both singular and plural in BrE
    
    // "one" as subject pronoun → restructure
    // "one who" → "a staff member who"
    t = t.replace(/\bone who\b/g, 'a staff member who');
    // "one were" → "one was" (already handled)
    
    // "one's" → "the" or restructure
    // But be careful: "one's" can appear in set phrases
    t = t.replace(/\bone's own\b/g, 'their own');
    t = t.replace(/\bone's best\b/g, 'their best');
    // "one's luggage" → "the guest's luggage" (context-dependent, but "the" is safer)
    t = t.replace(/\bone's guests?\b/g, 'the guests');
    t = t.replace(/\bone's property\b/g, 'the property');
    t = t.replace(/\bone's hotel\b/g, 'the hotel');
    t = t.replace(/\bone's role\b/g, 'the role');
    t = t.replace(/\bone's room\b/g, 'the room');
    t = t.replace(/\bone's stay\b/g, 'the stay');
    t = t.replace(/\bone's service\b/g, 'the service');
    t = t.replace(/\bone's work\b/g, 'the work');
    t = t.replace(/\bone's training\b/g, 'the training');
    t = t.replace(/\bone's shift\b/g, 'the shift');
    // Generic "one's + noun" → "their"
    t = t.replace(/\bone's (\w+)/g, (match, word) => {
      // Skip if word is a known set phrase
      const skipWords = ['best', 'own', 'self'];
      if (skipWords.includes(word)) return match;
      return 'their ' + word;
    });
    
    // Standalone "one " as subject → "staff " (at word boundary)
    t = t.replace(/\bone (\w+ed\b)/g, (match, verb) => {
      // "one handled" → "staff handled"
      return 'staff ' + verb;
    });
    t = t.replace(/\bone (\w+s\b)/g, (match, verb) => {
      // "one handles" → "staff handles"
      return 'staff ' + verb;
    });
  }

  // ── Fix subject-verb agreement after pronoun changes ──
  // "staff handles" → "staff handle" (staff is plural)
  // Actually in BrE, "staff" can be both. Let's keep as-is for safety.
  // But fix obviously wrong: "staff has" → "staff have"
  t = t.replace(/\bstaff has\b/g, 'staff have');
  t = t.replace(/\bstaff does\b/g, 'staff do');
  t = t.replace(/\bstaff needs\b/g, 'staff need');
  t = t.replace(/\bstaff says\b/g, 'staff say');

  // ── "you/your" cleanup (non-translation sections only) ──
  if (!isTranslation && !preserveSection) {
    t = t.replace(/\byou will\b/g, 'staff will');
    t = t.replace(/\byou'll\b/g, 'staff will');
    t = t.replace(/\byou've\b/g, 'staff have');
    t = t.replace(/\byou're\b/g, 'staff are');
    t = t.replace(/\byou are\b/g, 'staff are');
    t = t.replace(/\byou can\b/g, 'staff can');
    t = t.replace(/\byou may\b/g, 'staff may');
    t = t.replace(/\byou should\b/g, 'staff should');
    t = t.replace(/\bwhen you\b/g, 'when staff');
    t = t.replace(/\bif you\b/g, 'if staff');
    t = t.replace(/\bas you\b/g, 'as staff');

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
      [/\byour own\b/g, 'their own'],
      [/\byour best\b/g, 'their best'],
    ];
    for (const [pattern, replacement] of yourReplacements) {
      t = t.replace(pattern, replacement);
    }
    t = t.replace(/\byour\b/g, 'their');
    
    // Standalone "you " → "staff " (carefully)
    t = t.replace(/\byou (\w+)\b/g, (match, word) => {
      // Don't replace in common phrases like "thank you"
      if (match.includes('thank you')) return match;
      return 'staff ' + word;
    });
  }

  // ── Clean up whitespace artifacts ──
  t = t.replace(/staff should staff should/gi, 'staff should');
  t = t.replace(/Staff should staff should/g, 'Staff should');
  t = t.replace(/\bstaff should always\b/g, 'staff should');
  t = t.replace(/staff should staff should/gi, 'staff should');
  t = t.replace(/ ,/g, ',');
  t = t.replace(/ \./g, '.');
  t = t.replace(/\. ,/g, '.,');
  t = t.replace(/\s+'/g, '\'');
  t = t.replace(/' s\s+/g, '\'s ');
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

  return t;
}

// ─── Section-aware file processing ──────────────────────────────────
function processFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  if (!content.trim()) return false;

  // Normalize collapsed headers
  content = content.replace(/([^\n])## /g, '$1\n## ');

  // Detect file type
  const isScenario = filepath.includes('scenarios');
  const isVocab = filepath.includes('vocabulary');
  const isCalendar = filepath.includes('calendar');
  const isFoundations = filepath.includes('foundations');

  // For scenarios, process differently
  if (isScenario) {
    const transformed = transform(content, 'text');
    if (transformed !== content) {
      fs.writeFileSync(filepath, transformed, 'utf8');
      return true;
    }
    return false;
  }

  // For content files (foundations/calendar/vocabulary) with frontmatter + sections
  // Find frontmatter
  if (content.indexOf('---\n') !== 0) return false;
  const fmEnd = content.indexOf('\n---\n');
  if (fmEnd < 0 || fmEnd > 500) return false;
  const frontmatter = content.substring(0, fmEnd + 5);
  let body = content.substring(fmEnd + 5);

  // Split into sections by ## headers
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

    if (headerName === 'Example Sentences') {
      // Preserve example sentences but still check for minor issues
      sections.push({ type: 'example', content: sectionContent });
    } else if (headerName === 'Quiz') {
      sections.push({ type: 'quiz', content: sectionContent });
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

  // Transform each section
  let result = frontmatter;
  for (const section of sections) {
    if (section.type === 'text') {
      result += transform(section.content, 'text');
    } else if (section.type === 'example') {
      // Apply only mechanical fixes to example sections (no pronoun changes)
      result += transform(section.content, 'example');
    } else if (section.type === 'quiz') {
      result += transform(section.content, 'quiz');
    } else if (section.type === 'related') {
      result += transformRelated(section.content);
    } else if (section.type === 'mistakes') {
      result += transformMistakes(section.content);
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

function transformRelated(section) {
  return section.split('\n').map(line => {
    if (line.startsWith('- **')) {
      const match = line.match(/^(- \*\*[^*]+\*\*[^:)]*[:)]\s*)(.*)/);
      if (match) return match[1] + transform(match[2], 'text');
    }
    return line;
  }).join('\n');
}

function transformMistakes(section) {
  return section.split('\n').map((line, i) =>
    i === 0 ? line : transform(line, 'text')
  ).join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  let dirFixed = 0;
  files.forEach(f => {
    try {
      if (processFile(path.join(dir, f))) dirFixed++;
    } catch (err) {
      console.error(`Error in ${f}: ${err.message}`);
    }
  });
  const name = path.basename(dir);
  console.log(`${name}: ${dirFixed}/${files.length} files modified`);
  totalFixed += dirFixed;
});

console.log(`\nTotal: ${totalFixed} files modified across all directories.`);

const fs = require('fs');
const path = require('path');

const VOCAB_DIR = path.join(__dirname, 'content/vocabulary');
let totalFixed = 0;

function safeTransform(text) {
  let t = text;

  // This ONLY transforms safe mechanical patterns.
  // NEVER transforms "you", "your", "one" — too risky for translations.

  // "Worth noting" → "Note:"
  t = t.replace(/Worth noting[:,\s]*/gi, 'Note: ');
  t = t.replace(/Also worth noting[:,\s]*/gi, 'Note also: ');
  t = t.replace(/ worth noting that /gi, ' notable that ');
  t = t.replace(/is worth noting/gi, 'should be noted');
  t = t.replace(/worth watching out for/gi, 'important to note');
  t = t.replace(/worth remembering/gi, 'important');

  // "That said," → "However,"
  t = t.replace(/\bThat said[,.]?\s*/g, 'However, ');
  t = t.replace(/\bthat said[,.]?\s*/g, 'however, ');

  // "In practice," (remove — filler)
  t = t.replace(/\bIn practice[,.]?\s*/g, '');
  t = t.replace(/\bin practice[,.]?\s*/g, '');
  t = t.replace(/^,\s*/gm, '');

  // "One more thing" → "Additionally,"
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

  // "In other words," → "In summary,"
  t = t.replace(/\bIn other words,\s*/g, 'In summary, ');

  // "Of course," → remove
  t = t.replace(/\bOf course,\s*/g, '');
  t = t.replace(/\bof course\b/gi, '');

  // "Students often/usually" → "A common error is"
  t = t.replace(/\bStudents often\s+/g, 'A common error is ');
  t = t.replace(/\bStudents usually\s+/g, 'A common error is ');
  t = t.replace(/\bStudents sometimes\s+/g, 'A common error is ');
  t = t.replace(/\bStudents may\s+/g, 'A common error occurs when learners ');
  t = t.replace(/\bLearners sometimes\s+/g, 'A common mistake is ');
  t = t.replace(/\bLearners also\s+/g, 'Another common mistake is ');
  t = t.replace(/\bLearners may\s+/g, 'A common mistake occurs when learners ');
  t = t.replace(/\bLearners often\s+/g, 'A common mistake is ');

  // Fix verb after "A common error is [base verb]" → "A common error is to [verb]"
  t = t.replace(/\bA common (error|mistake) is ([a-z]+)\b(?!(?:\s+(?:is|are|was|were|has|have|had|and|or|the|a|an|to|of|in|on|at|by|for|with|that|this|these|those|it|they|one|staff|guests?)))\b/g, (match, type, verb) => {
    if (verb.endsWith('ing') || verb.endsWith('ed') || verb === 'to') return match;
    return 'A common ' + type + ' is to ' + verb;
  });

  // Remove intensifiers (safe in any context)
  t = t.replace(/ simply /gi, ' ');
  t = t.replace(/ genuinely /gi, ' ');
  t = t.replace(/ really /gi, ' ');
  t = t.replace(/ actually /gi, ' ');

  // Opinionated → neutral statements
  t = t.replace(/is one of the most damaging/gi, 'can be a damaging');
  t = t.replace(/is one of the most important/gi, 'is an important');
  t = t.replace(/is one of the most common/gi, 'is a common');
  t = t.replace(/is a hallmark of/gi, 'reflects');
  t = t.replace(/the single most consequential/gi, 'a significant');
  t = t.replace(/world-class /gi, '');
  t = t.replace(/is almost worse than silence/gi, 'can be perceived negatively');
  t = t.replace(/is what separates/gi, 'distinguishes');
  t = t.replace(/is what makes/gi, 'contributes to');
  t = t.replace(/is not optional/gi, 'is expected');
  t = t.replace(/are not optional/gi, 'are expected');
  t = t.replace(/the single most/gi, 'a key');
  t = t.replace(/one of the most/gi, 'a notable');

  // Line-starting imperatives → descriptive
  const imperativeFixes = [
    [/^Practice the phrase/gim, 'The phrase should be practiced'],
    [/^Learn this/gim, 'This should be learned'],
    [/^Learn to/gim, 'It is important to'],
    [/^Always mention/gim, 'Staff should always mention'],
    [/^Always confirm/gim, 'Staff should always confirm'],
    [/^Never use/gim, 'It is best to avoid using'],
    [/^Never assume/gim, 'Staff should not assume'],
    [/^Do not confuse/gim, 'One should not confuse'],
    [/^Remember that/gim, 'It should be remembered that'],
    [/^Remember:/gim, 'Note:'],
    [/^And finally,/gim, 'Finally,'],
    [/^Take the time/gim, 'It is important to take the time'],
    [/^Make sure/gim, 'Staff should ensure'],
  ];
  for (const [pattern, replacement] of imperativeFixes) {
    t = t.replace(pattern, replacement);
  }

  // Mid-sentence imperatives → also safe
  t = t.replace(/\balways mention\b/g, 'staff should mention');
  t = t.replace(/\balways confirm\b/g, 'staff should confirm');
  t = t.replace(/\balways check\b/g, 'staff should check');
  t = t.replace(/\balways combine\b/g, 'staff should combine');
  t = t.replace(/\balways walk\b(?=\s+guests)/g, 'staff should walk');
  t = t.replace(/\bnever use\b/g, 'it is best to avoid using');
  t = t.replace(/\bnever assume\b/g, 'staff should not assume');

  // Clean up artifacts
  t = t.replace(/ ,/g, ',');
  t = t.replace(/ \./g, '.');
  t = t.replace(/ '+/g, '\'');
  t = t.replace(/  +/g, ' ');

  return t;
}

const files = fs.readdirSync(VOCAB_DIR).filter(f => f.endsWith('.md')).sort();
files.forEach(f => {
  const fp = path.join(VOCAB_DIR, f);
  try {
    const content = fs.readFileSync(fp, 'utf8');
    const transformed = safeTransform(content);
    if (transformed !== content) {
      fs.writeFileSync(fp, transformed, 'utf8');
      totalFixed++;
    }
  } catch (err) {
    console.error(`Error ${f}:`, err.message);
  }
});

console.log(`Transformed ${totalFixed}/${files.length} vocabulary files.`);

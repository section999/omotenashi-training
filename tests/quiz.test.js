function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw }
  const meta = {}
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':')
    if (k) meta[k.trim()] = v.join(':').trim()
  })
  return { meta, body: match[2] }
}

function extractQuizBlock(body) {
  const dividerIdx = body.lastIndexOf('\n---\n')
  if (dividerIdx < 0) return { content: body, quizRaw: null }
  return { content: body.slice(0, dividerIdx), quizRaw: body.slice(dividerIdx + 5) }
}

function parseQuizMarkdown(raw) {
  if (!raw) return null
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l)
  const boldBlocks = [...raw.matchAll(/\*\*([\s\S]*?)\*\*/g)]
  const qBlock = boldBlocks.find(m => {
    const t = m[1].trim()
    return !t.startsWith('Correct') && !t.startsWith('Answer:') && !t.startsWith('Explanation:') && !t.startsWith('Model Answer:')
  })
  const q = qBlock ? qBlock[1].trim() : ''
  const optLines = lines.filter(l => /^- [A-D]\./.test(l))
  const correctLine = lines.find(l => l.startsWith('**Correct Answer:**'))
  const answerLine = lines.find(l => l.startsWith('**Answer:**'))
  const modelLine = lines.find(l => l.startsWith('**Model Answer:**'))
  const expLine = lines.find(l => l.startsWith('**Explanation:**'))
  const exp = expLine ? expLine.replace('**Explanation:**', '').trim() : ''

  if (optLines.length > 0) {
    const opts = optLines.map(l => l.replace(/^- [A-D]\.\s*/, ''))
    const correctText = correctLine ? correctLine.replace('**Correct Answer:**', '').trim() : ''
    let correct = opts.findIndex(o => o === correctText)
    if (correct < 0) correct = opts.findIndex(o => o.toLowerCase().trim() === correctText.toLowerCase().trim())
    return { type: 'mcq', q, opts, correct: correct >= 0 ? correct : 0, exp }
  }
  if (answerLine && !modelLine) {
    const ans = answerLine.replace('**Answer:**', '').trim()
    if (ans === 'True' || ans === 'False') {
      return { type: 'tf', q, correct: ans === 'True', exp }
    }
    return { type: 'fitb', q, answer: ans, exp }
  }
  if (modelLine) {
    return { type: 'short', q, a: modelLine.replace('**Model Answer:**', '').trim(), exp }
  }
  return null
}

function srsNext(reps) {
  const intervals = [1, 3, 7, 14, 30]
  return intervals[Math.min(reps - 1, 4)] || 1
}

describe('parseFrontmatter', () => {
  test('parses title from frontmatter', () => {
    const raw = '---\ntitle: Test Title\n---\n\nBody content'
    const { meta, body } = parseFrontmatter(raw)
    expect(meta.title).toBe('Test Title')
    expect(body).toBe('\nBody content')
  })

  test('returns empty meta for no frontmatter', () => {
    const { meta, body } = parseFrontmatter('Just body text')
    expect(meta).toEqual({})
    expect(body).toBe('Just body text')
  })
})

describe('extractQuizBlock', () => {
  test('splits on last --- divider', () => {
    const body = 'Lesson content\n\n---\n\n## Quiz\n\nQuestion?'
    const { content, quizRaw } = extractQuizBlock(body)
    expect(content).toContain('Lesson content')
    expect(quizRaw).toContain('Quiz')
  })

  test('returns all content when no divider', () => {
    const { content, quizRaw } = extractQuizBlock('Just content')
    expect(content).toBe('Just content')
    expect(quizRaw).toBeNull()
  })
})

describe('parseQuizMarkdown', () => {
  test('parses MCQ', () => {
    const raw = '**What is omotenashi?**\n\n- A. Service\n- B. Hospitality\n- C. Food\n- D. Hotel\n\n**Correct Answer:** Hospitality\n**Explanation:** It is the philosophy.'
    const quiz = parseQuizMarkdown(raw)
    expect(quiz.type).toBe('mcq')
    expect(quiz.q).toBe('What is omotenashi?')
    expect(quiz.correct).toBe(1)
    expect(quiz.opts).toHaveLength(4)
  })

  test('parses True/False', () => {
    const raw = '**Omotenashi is a type of food.**\n\n**Answer:** False'
    const quiz = parseQuizMarkdown(raw)
    expect(quiz.type).toBe('tf')
    expect(quiz.correct).toBe(false)
  })

  test('parses Fill-in-the-Blank', () => {
    const raw = '**____ is the Japanese philosophy.**\n\n**Answer:** Omotenashi'
    const quiz = parseQuizMarkdown(raw)
    expect(quiz.type).toBe('fitb')
    expect(quiz.answer).toBe('Omotenashi')
  })

  test('parses Short Answer', () => {
    const raw = '**Explain omotenashi in your own words.**\n\n**Model Answer:** Wholehearted hospitality.'
    const quiz = parseQuizMarkdown(raw)
    expect(quiz.type).toBe('short')
    expect(quiz.a).toBe('Wholehearted hospitality.')
  })

  test('returns null for invalid quiz', () => {
    expect(parseQuizMarkdown('')).toBeNull()
    expect(parseQuizMarkdown(null)).toBeNull()
  })
})

describe('SRS intervals', () => {
  test('first review after 1 day', () => {
    expect(srsNext(1)).toBe(1)
  })

  test('third review after 7 days', () => {
    expect(srsNext(3)).toBe(7)
  })

  test('caps at 30 days', () => {
    expect(srsNext(10)).toBe(30)
  })
})

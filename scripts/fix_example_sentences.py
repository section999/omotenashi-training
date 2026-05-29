#!/usr/bin/env python3
"""
Transform 267 vocabulary files:
  - Extract inline example blocks (JP / <small>*romaji*</small> / EN)
  - Reformat as ## Example Sentences with keigo-card blue div
  - Place the new section just before ## Related Expressions
"""

import re
import os
import glob

EXAMPLE_RE = re.compile(
    r'^([^\n<\-#*][^\n]*)\n'          # JP line (not starting with special chars)
    r'<small>\*([^*\n]+)\*</small>\n'  # <small>*romaji*</small>
    r'([^\n]+)',                        # EN line
    re.MULTILINE,
)

def build_keigo_card(examples):
    items = []
    for jp, romaji, en in examples:
        items.append(
            f'<span class="keigo-jp"><code>{jp.strip()}</code></span><br>\n'
            f'<em>{romaji.strip()}</em><br>\n'
            f'{en.strip()}'
        )
    return (
        '## Example Sentences\n\n'
        '<div class="keigo-card blue">\n'
        + '\n<br><br>\n'.join(items)
        + '\n</div>'
    )

def transform_file(filepath):
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        raw = f.read()

    if '## Example Sentences' in raw:
        return 'skip'
    if '<small>' not in raw:
        return 'no_inline'
    if '## Related Expressions' not in raw:
        return 'no_related'

    split_idx = raw.index('## Related Expressions')
    body = raw[:split_idx]
    tail = raw[split_idx:]

    examples = EXAMPLE_RE.findall(body)
    if not examples:
        return 'no_match'

    # Remove inline blocks from body
    cleaned = EXAMPLE_RE.sub('', body)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned).rstrip() + '\n\n'

    keigo = build_keigo_card(examples)
    new_content = cleaned + keigo + '\n\n' + tail

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return f'ok ({len(examples)} examples)'

def main():
    files = sorted(glob.glob('content/vocabulary/**/*.md', recursive=True))

    counts = {}
    for filepath in files:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            if '## Example Sentences' in f.read():
                continue
        result = transform_file(filepath)
        counts[result] = counts.get(result, 0) + 1
        if not result.startswith('ok'):
            print(f'  [{result}] {filepath}')

    print('\n--- Summary ---')
    for k, v in sorted(counts.items()):
        print(f'  {k}: {v}')

if __name__ == '__main__':
    main()

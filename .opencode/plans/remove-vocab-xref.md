# Remove vocab-xref blocks from curriculum.html

## 목적
curriculum.html의 각 L2 섹션 하단에 있는 "Related Vocab" 칩 블록을 모두 제거합니다.
해당 기능은 중복 내비게이션이며, Vocabulary & Language Skills 트리 섹션에서 이미 모든 vocab 그룹을 제공하고 있음.

## 삭제 대상

### 1. CSS 4줄 제거
- **`.vocab-xref`** 규칙: `display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:10px; padding:8px 0 4px; border-top:1px solid var(--border-default);`
- **`.vocab-xref-label`** 규칙
- **`.vocab-chip`** 규칙
- **`.vocab-chip:hover`** 규칙

### 2. HTML 7개 블록 제거
각 블록은 `</div>` (step-grid 닫힘) 다음, `</div>` (tree-l2-children 닫힘) 이전에 위치.

| # | 섹션 | 포함 칩 | 
|---|---|---|
| 1 | Communication & Etiquette | V01, V08, V11, V14 |
| 2 | Service Skills | V02, V03, V07, V09, V10 |
| 3 | Food & Beverage | V05 |
| 4 | Crisis Management | V06, V12 |
| 5 | Keigo — Honorific Language | V01, V02 |
| 6 | Accommodation Service | V03, V04, V15 |
| 7 | Staff Communication & Teamwork | V13 |

## 실행 방법
`curriculum.html`에서 각 oldString 패턴을 찾아 newString으로 교체:
- oldString: `<div class="vocab-xref">` 부터 해당 블록의 `</div>` (닫힘) + `\n            </div>` (tree-l2-children 닫힘 직전)
- newString: `</div>\n            </div>` (step-grid 닫힘 바로 뒤 tree-l2-children 닫힘)

## 검증
- `grep -i "vocab-xref\|vocab-chip" curriculum.html` → 결과 없음
- 다른 페이지 영향 없음 (해당 클래스는 curriculum.html에만 존재)

# おもてなし — Japanese Hospitality Training Platform

A self-contained, browser-based training platform for learning Japanese hospitality (omotenashi) principles and vocabulary. No installation, no backend, no login required — open the page and start learning.

**Live site:** https://section999.github.io/jp-hospitality/

---

## Overview

This platform is designed for hospitality professionals who want to understand the philosophy and language behind Japanese service culture. It covers everything from the concept of omotenashi and the tea ceremony to practical keigo (honorific speech) and scenario-based guest interaction.

All content runs entirely in the browser. Progress is saved automatically to `localStorage` — no account needed.

---

## Features

- **Structured curriculum** — lessons organized into modules with clear progression
- **453 content files** — foundations lessons and vocabulary units written in Markdown
- **Interactive quizzes** — multiple-choice questions at the end of each lesson
- **Role-play simulator** — scenario-based practice for real guest interactions
- **Full-text search** — search across all lesson titles and content from the nav bar
- **Progress tracking** — completed lessons are marked and persisted in the browser
- **Text-to-speech** — listen to lesson content read aloud
- **Dark theme UI** — readable in low-light environments
- **Mobile responsive** — works on phones and tablets
- **Keyboard accessible** — arrow key navigation in search, full ARIA support

---

## Content Structure

### Foundations (24 lessons)

Core modules covering the theory and practice of Japanese hospitality:

| Module | Topic | Lessons |
|--------|-------|---------|
| `m1-philosophy` | Understanding Japanese Service Spirit | 6 |
| `m1-comms` | Communication & Etiquette | 5 |
| `m1-skills` | Practical Service Skills | 5 |
| `m1-fnb` | Food & Beverage Service | 4 |
| `m1-crisis` | Crisis & Complaint Handling | 4 |

### Vocabulary (429 lessons across 15 units)

Hospitality-specific Japanese vocabulary, organized by theme and difficulty. Each vocabulary file covers a single word or phrase with usage context, examples, and a comprehension check.

---

## File Structure

```
jp-hospitality/
├── index.html           # Landing page / home
├── curriculum.html      # Course overview and lesson browser
├── md-viewer.html       # Lesson reader (quiz + simulator)
├── search.js            # Full-text search index (all 453 lessons)
├── assets/
│   ├── nav.css          # Shared navigation styles
│   ├── nav.js           # Shared nav search + keyboard navigation
│   ├── favicon-32x32.png
│   ├── fcc_primary_large.png
│   └── fcc_primary_small.png
├── content/
│   ├── foundations/     # 24 Markdown lesson files
│   └── vocabulary/      # 429 Markdown vocabulary files
├── .nojekyll            # Disables Jekyll processing on GitHub Pages
└── .gitignore
```

---

## How It Works

### No build step required

Everything is plain HTML, CSS, and JavaScript. Open `index.html` in a browser to run locally. No `npm install`, no bundler, no server.

### Lesson rendering

`md-viewer.html` fetches the requested `.md` file via URL parameter (`?file=content/...`), parses the Markdown in the browser, and renders it with syntax highlighting. Quizzes and simulator scenarios are defined inline in the Markdown using a custom frontmatter format.

### Search

`search.js` contains a pre-built index of all lesson titles and text snippets. The nav search bar filters this index client-side — no server required.

### Progress tracking

Lesson completion is stored in `localStorage` using keys like:
- `omotenashi:m1-philosophy:1` — foundations lessons
- `omotenashi:simulator:3` — simulator scenarios

`curriculum.html` reads these keys to display a progress overview.

---

## Running Locally

Because the lesson viewer fetches `.md` files via `fetch()`, you need a local server (browsers block file-system fetches by default).

**Option 1 — VS Code Live Server extension**
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html`, and select "Open with Live Server".

**Option 2 — Python**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option 3 — Node.js**
```bash
npx serve .
```

---

## Deploying to GitHub Pages

This repository is ready for GitHub Pages out of the box.

1. Go to **Settings → Pages** in your GitHub repository
2. Set **Source** to `main` branch, root folder `/`
3. Save — the site will be live at `https://<username>.github.io/<repo-name>/`

The `.nojekyll` file at the root prevents GitHub Pages from processing the content directory with Jekyll, which would otherwise interfere with the `.md` file paths.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, responsive) |
| Logic | Vanilla JavaScript (ES5-compatible) |
| Content | Markdown (parsed client-side) |
| Storage | Browser `localStorage` |
| Hosting | GitHub Pages |

No frameworks, no dependencies, no build pipeline.

---

## License

Content and code are provided for educational use.

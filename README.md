# Omotenashi Training

## Project Structure

```
index.html                    - home page with continue banner
404.html                      - custom 404 page
manifest.json                 - PWA manifest
sw.js                         - service worker

pages/
  curriculum.html             - lesson tree with progress tracking
  md-viewer.html              - Markdown content renderer (lessons + vocab)
  dashboard.html              - SRS queue and stats
  games.html                  - 6 vocabulary games
  languagedojo.html           - language practice hub
  vocabularypractice.html     - flashcard and dictation drills
  simulator.html              - chat-based role-play simulator

assets/
  tokens.css                  - shared CSS design tokens (dark + light mode)
  nav.css                     - shared navigation styles
  nav-template.js             - nav HTML renderer
  nav.js                      - nav interactions (search, theme, sign-in, progress export)
  search.js                   - search index data
  search-init.js              - initializes nav search on page load
  analytics.js                - analytics

content/
  foundations/                - 99 foundation lesson files (f01.md - f99.md)
  vocabulary/
    v01/ - v15/               - 429 vocabulary files (15 topic sets)

scenarios/
  01.md - 100.md              - simulator scenario files (100 scenarios)
```

## Running Locally

This is a static site with no build step. Any static file server works:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080`.

> Note: The service worker requires HTTPS or `localhost` — it will not register over plain HTTP on a non-localhost domain.

## License

Copyright © 2014 freeCodeCamp.org

The content of this repository is bound by the following licenses:

- The computer software is licensed under the [BSD-3-Clause](https://github.com/freeCodeCamp/freeCodeCamp/blob/main/LICENSE.md) license.
- The curriculum content is copyright © 2014 freeCodeCamp.org

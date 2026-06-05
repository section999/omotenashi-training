# Omotenashi Training

## Project Structure

```
index.html           - course home page
lesson/index.html    - lesson viewer
src/
  data/course.js     - course and module data
  features/          - page-specific JS modules
  styles/            - CSS (tokens, base, components)
content/modules/     - lesson content (m1-m10)
platform.yaml        - deployment config
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

- The computer software is licensed under the [BSD-3-Clause](LICENSE) license.
- The curriculum content is copyright © 2014 freeCodeCamp.org

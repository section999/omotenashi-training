# Omotenashi Training

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

# Catalytic Cracking (FCC) — Presentation Prep

Static HTML presentation on fluid catalytic cracking: unit and types, feed/catalyst/conditions, flow diagrams, reactions and mechanism, reactor, and products/optimisation.

**Live site:** https://pranav-college-work.github.io/Catalyst-Reforming-/

## Structure

| Path | Contents |
|---|---|
| `index.html` | Landing page / contents |
| `01-…06-*.html` | Presentation sections |
| `sources.html` | References (lecture notes, textbook, derived values) |
| `assets/` | Stylesheet and scripts |
| `figures/` | SVG figures |

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python -m http.server 8000
```

## Deploy

Served by GitHub Pages from the `main` branch root. Pushing to `main` redeploys automatically. `.nojekyll` makes Pages serve the files as-is.

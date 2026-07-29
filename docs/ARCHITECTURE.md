# Public Architecture

## Runtime

The site is a dependency-free static application:

- `index.html` is the only canonical entry page.
- `portfolio.html`, `portfolio-share.html` and `share.html` are safe legacy redirects to the root.
- `portfolio-demo.*` provides the main interface and browser-local interactions.
- `portfolio-scenario.*` provides a fully fictional interactive case study.
- `professional-contact.*` is the reusable approved professional identity/footer component.
- `weather.*` uses public Barcelona forecast data and fails to an unavailable state.
- `sports-briefing.*` reads curated public JSON and fails to an unavailable state.
- `market-demo.*` reads an explicitly fictional local JSON dataset.

## Deployment boundary

The repository root is never uploaded to Pages. `scripts/build_release.py` copies only files named in `deploy-allowlist.txt` to `_site`. Privacy, secret and dependency validation must pass before the artifact can be uploaded.

Documentation, workflows, source validation scripts and the sports-data generator remain outside the web artifact.

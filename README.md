# JARVIS HQ — Public Portfolio Demo

JARVIS HQ is Marc Monferrer’s sanitized public portfolio demonstration of a privacy-first personal AI operating system.

Marc Monferrer is an AI Consultant & Front-End Developer based in Barcelona. Professional contact:

- Business email: [marcmonferrer.ai@gmail.com](mailto:marcmonferrer.ai@gmail.com)
- LinkedIn: [linkedin.com/in/marcmonferrer](https://www.linkedin.com/in/marcmonferrer/)

## Public-demo boundaries

This project contains no personal portal, private account links, personal photography, healthcare information, real financial account data, credentials or private notes. Alex Morgan, every service name, every message, every balance and every market value in the interactive scenario are fictional.

The Barcelona weather module uses the public Open-Meteo API. The sports module reads curated public JSON snapshots. Both modules show a clear unavailable state if data cannot be loaded.

## Local preview

From the project root:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`.

## Build and validation

```sh
python scripts/secret_scan.py
python scripts/build_release.py
python scripts/privacy_check.py
python scripts/validate_release.py
```

`deploy-allowlist.txt` is the source of truth for the Pages artifact. The build fails if an allowlisted file is missing. The privacy check fails if the artifact contains any extra file, unapproved email or external URL, phone-like data, private-context terms or common secret formats.

## Deployment

`.github/workflows/pages.yml` builds `_site` from the explicit allowlist, validates it, uploads only that curated artifact and deploys it with GitHub Pages’ minimum deployment permissions. No workflow commits generated data back to the repository.

## Project status

Stage 2A local release candidate. No commit or deployment has been performed.

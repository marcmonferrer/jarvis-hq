#!/usr/bin/env python3
"""Serve the built artifact with data failures for graceful-degradation QA."""

from __future__ import annotations

import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "_site"
BLOCKED_PATHS = {
    "/fictional-market-data.json",
    "/sports-data.json",
    "/sports-favourites.json",
}


class FailureHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ARTIFACT), **kwargs)

    def end_headers(self) -> None:
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; style-src 'self' 'unsafe-inline'; "
            "script-src 'self'; img-src 'self' data:; connect-src 'self'",
        )
        super().end_headers()

    def do_GET(self) -> None:
        if urlsplit(self.path).path in BLOCKED_PATHS:
            self.send_error(503, "Deliberate QA data failure")
            return
        super().do_GET()


def main() -> None:
    if not ARTIFACT.is_dir():
        raise SystemExit("Artifact missing: run scripts/build_release.py first")
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    server = ThreadingHTTPServer(("127.0.0.1", port), FailureHandler)
    print(f"Failure-state preview on http://127.0.0.1:{port}/")
    server.serve_forever()


if __name__ == "__main__":
    main()

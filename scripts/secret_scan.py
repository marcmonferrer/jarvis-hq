#!/usr/bin/env python3
"""Scan public source files for common credential formats without external tools."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "_site", "__pycache__"}
SKIP_FILES = {"secret_scan.py", "privacy_check.py"}
TEXT_SUFFIXES = {
    ".css", ".html", ".js", ".json", ".md", ".py", ".svg", ".txt", ".yml", ".yaml"
}
PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{20,}\b"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "Google API key": re.compile(r"\bAIza[0-9A-Za-z_-]{30,}\b"),
    "Slack token": re.compile(r"\bxox[baprs]-[0-9A-Za-z-]{20,}\b"),
    "Stripe live key": re.compile(r"\b(?:sk|rk)_live_[0-9A-Za-z]{16,}\b"),
    "generic credential assignment": re.compile(
        r"(?i)\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\b"
        r"\s*[:=]\s*[\"'][^\"'\s]{12,}[\"']"
    ),
}


def main() -> None:
    findings: list[str] = []
    scanned = 0
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        if path.name in SKIP_FILES or any(part in SKIP_DIRS for part in path.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        scanned += 1
        for secret_type, pattern in PATTERNS.items():
            if pattern.search(text):
                findings.append(f"{secret_type} pattern in {path.relative_to(ROOT).as_posix()}")

    if findings:
        print("Secret scan failed:", file=sys.stderr)
        for finding in sorted(set(findings)):
            print(f"- {finding}", file=sys.stderr)
        raise SystemExit(1)
    print(f"Secret scan passed for {scanned} source files")


if __name__ == "__main__":
    main()

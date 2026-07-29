#!/usr/bin/env python3
"""Fail closed when the Pages artifact contains unapproved files or private data."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "_site"
ALLOWLIST = ROOT / "deploy-allowlist.txt"
APPROVED_EMAIL = "marcmonferrer.ai@gmail.com"
APPROVED_LINKEDIN = "https://www.linkedin.com/in/marcmonferrer/"
TEXT_SUFFIXES = {".html", ".css", ".js", ".json", ".svg", ".txt"}

EMAIL_RE = re.compile(r"(?<![\w.+-])[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}(?![\w.-])")
URL_RE = re.compile(r"https?://[^\s\"'<>`)]+")
PHONE_RE = re.compile(r"(?<!\w)\+\d{1,3}[\s.-]?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}(?!\w)")
PRIVATE_CONTEXT_RE = re.compile(
    r"\b(?:healthcare|medical records?|patient portal|family account|family member|"
    r"online banking|investment account|private note|personal shortcut|"
    r"whatsapp|telegram|google drive|gmail)\b",
    re.IGNORECASE,
)

SECRET_PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{20,}\b"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "Google API key": re.compile(r"\bAIza[0-9A-Za-z_-]{30,}\b"),
    "Slack token": re.compile(r"\bxox[baprs]-[0-9A-Za-z-]{20,}\b"),
    "generic credential assignment": re.compile(
        r"(?i)\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\b"
        r"\s*[:=]\s*[\"'][^\"'\s]{12,}[\"']"
    ),
}

ALLOWED_URL_PREFIXES = (
    "https://marcmonferrer.github.io/jarvis-hq/",
    "https://api.open-meteo.com/",
)


def read_allowlist() -> set[str]:
    return {
        line.strip()
        for line in ALLOWLIST.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }


def relative_files(root: Path) -> set[str]:
    return {
        path.relative_to(root).as_posix()
        for path in root.rglob("*")
        if path.is_file()
    }


def url_is_approved(url: str) -> bool:
    return (
        url in {APPROVED_LINKEDIN, "http://www.w3.org/2000/svg"}
        or url.startswith(ALLOWED_URL_PREFIXES)
    )


def main() -> None:
    if not ARTIFACT.is_dir():
        raise SystemExit("Artifact missing: run scripts/build_release.py first")

    failures: list[str] = []
    expected = read_allowlist()
    actual = relative_files(ARTIFACT)
    if actual != expected:
        for path in sorted(actual - expected):
            failures.append(f"unapproved artifact file: {path}")
        for path in sorted(expected - actual):
            failures.append(f"missing artifact file: {path}")

    for path in ARTIFACT.rglob("*"):
        if path.is_symlink():
            failures.append(f"symlink in artifact: {path.relative_to(ARTIFACT).as_posix()}")
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue

        relative = path.relative_to(ARTIFACT).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            failures.append(f"non-UTF-8 public text file: {relative}")
            continue

        emails = {match.group(0).lower() for match in EMAIL_RE.finditer(text)}
        for email in sorted(emails - {APPROVED_EMAIL}):
            failures.append(f"unapproved email address in {relative}")

        for match in URL_RE.finditer(text):
            url = match.group(0)
            if not url_is_approved(url):
                failures.append(f"unapproved external URL in {relative}")

        sanitized = text.replace(APPROVED_EMAIL, "[approved-business-email]")
        sanitized = sanitized.replace(APPROVED_LINKEDIN, "[approved-linkedin]")
        if PHONE_RE.search(sanitized):
            failures.append(f"possible phone number in {relative}")
        if PRIVATE_CONTEXT_RE.search(sanitized):
            failures.append(f"forbidden private-context term in {relative}")

        for secret_type, pattern in SECRET_PATTERNS.items():
            if pattern.search(text):
                failures.append(f"possible {secret_type} in {relative}")

    if failures:
        print("Privacy check failed:", file=sys.stderr)
        for failure in sorted(set(failures)):
            print(f"- {failure}", file=sys.stderr)
        raise SystemExit(1)

    print(f"Privacy check passed for {len(actual)} allowlisted artifact files")


if __name__ == "__main__":
    main()

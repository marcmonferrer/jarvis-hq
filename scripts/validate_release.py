#!/usr/bin/env python3
"""Validate routes, local dependencies, data files and the social image."""

from __future__ import annotations

import json
import re
import struct
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "_site"
REQUIRED_ROUTES = {"index.html", "portfolio.html", "portfolio-share.html", "share.html", "404.html"}
REDIRECT_ROUTES = {"portfolio.html", "portfolio-share.html", "share.html"}


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[str] = []
        self.title_parts: list[str] = []
        self._in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for attribute in ("href", "src"):
            value = values.get(attribute)
            if value:
                self.references.append(value)
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title_parts.append(data)


def local_target(source: Path, reference: str) -> Path | None:
    if reference.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
        return None
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc:
        return None
    clean_path = parsed.path
    if not clean_path or clean_path in {".", "./", "/"}:
        return ARTIFACT / "index.html"
    if clean_path.startswith("/jarvis-hq/"):
        clean_path = clean_path.removeprefix("/jarvis-hq/")
    elif clean_path.startswith("/"):
        clean_path = clean_path[1:]
    return (source.parent / clean_path).resolve()


def png_dimensions(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise ValueError("invalid PNG signature or IHDR")
    return struct.unpack(">II", data[16:24])


def main() -> None:
    if not ARTIFACT.is_dir():
        raise SystemExit("Artifact missing: run scripts/build_release.py first")

    failures: list[str] = []
    actual_routes = {path.name for path in ARTIFACT.glob("*.html")}
    for route in sorted(REQUIRED_ROUTES - actual_routes):
        failures.append(f"missing HTML route: {route}")

    for html_path in ARTIFACT.glob("*.html"):
        parser = ReferenceParser()
        text = html_path.read_text(encoding="utf-8")
        parser.feed(text)
        if not "".join(parser.title_parts).strip():
            failures.append(f"missing title: {html_path.name}")
        for reference in parser.references:
            target = local_target(html_path, reference)
            if target is not None and not target.is_file():
                failures.append(f"missing dependency from {html_path.name}: {reference}")
        if html_path.name in REDIRECT_ROUTES:
            if "location.replace('./')" not in text or 'content="0;url=./"' not in text:
                failures.append(f"legacy route is not a safe root redirect: {html_path.name}")

    css_url_re = re.compile(r"url\((['\"]?)([^)'\"\s]+)\1\)")
    for css_path in ARTIFACT.glob("*.css"):
        text = css_path.read_text(encoding="utf-8")
        for _, reference in css_url_re.findall(text):
            target = local_target(css_path, reference)
            if target is not None and not target.is_file():
                failures.append(f"missing dependency from {css_path.name}: {reference}")

    fetch_re = re.compile(r"\bfetch\(\s*['\"]([^'\"]+)['\"]")
    for js_path in ARTIFACT.glob("*.js"):
        text = js_path.read_text(encoding="utf-8")
        for reference in fetch_re.findall(text):
            target = local_target(js_path, reference)
            if target is not None and not target.is_file():
                failures.append(f"missing fetch target from {js_path.name}: {reference}")

    for json_path in ARTIFACT.glob("*.json"):
        try:
            json.loads(json_path.read_text(encoding="utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            failures.append(f"invalid JSON in {json_path.name}: {error}")

    market_path = ARTIFACT / "fictional-market-data.json"
    try:
        market_data = json.loads(market_path.read_text(encoding="utf-8"))
        if market_data.get("fictional") is not True:
            failures.append("market data is not explicitly marked fictional")
        if not market_data.get("assets"):
            failures.append("fictional market dataset has no assets")
    except (OSError, json.JSONDecodeError):
        failures.append("fictional market dataset is unreadable")

    social_path = ARTIFACT / "portfolio-social.png"
    try:
        dimensions = png_dimensions(social_path)
        if dimensions != (1200, 630):
            failures.append(f"social card dimensions are {dimensions[0]}x{dimensions[1]}, expected 1200x630")
    except (OSError, ValueError) as error:
        failures.append(f"invalid portfolio-social.png: {error}")

    if failures:
        print("Release validation failed:", file=sys.stderr)
        for failure in sorted(set(failures)):
            print(f"- {failure}", file=sys.stderr)
        raise SystemExit(1)

    print(f"Release validation passed for {len(actual_routes)} HTML routes")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build the exact GitHub Pages artifact defined by deploy-allowlist.txt."""

from __future__ import annotations

import shutil
from pathlib import Path, PurePosixPath


ROOT = Path(__file__).resolve().parents[1]
ALLOWLIST = ROOT / "deploy-allowlist.txt"
OUTPUT = ROOT / "_site"


def read_allowlist() -> list[str]:
    entries: list[str] = []
    for raw_line in ALLOWLIST.read_text(encoding="utf-8").splitlines():
        entry = raw_line.strip()
        if not entry or entry.startswith("#"):
            continue
        candidate = PurePosixPath(entry)
        if candidate.is_absolute() or ".." in candidate.parts or "\\" in entry:
            raise SystemExit(f"Unsafe allowlist entry: {entry}")
        if entry in entries:
            raise SystemExit(f"Duplicate allowlist entry: {entry}")
        entries.append(entry)
    if not entries:
        raise SystemExit("Deployment allowlist is empty")
    return entries


def main() -> None:
    entries = read_allowlist()
    if OUTPUT.resolve().parent != ROOT.resolve() or OUTPUT.name != "_site":
        raise SystemExit("Refusing to build outside the repository-local _site directory")

    missing = [entry for entry in entries if not (ROOT / Path(entry)).is_file()]
    if missing:
        raise SystemExit("Missing allowlisted files: " + ", ".join(missing))

    if OUTPUT.exists():
        for child in OUTPUT.iterdir():
            if child.is_dir():
                shutil.rmtree(child)
            else:
                child.unlink()
    else:
        OUTPUT.mkdir()

    for entry in entries:
        source = ROOT / Path(entry)
        if source.is_symlink():
            raise SystemExit(f"Symlinks are not allowed in the artifact: {entry}")
        destination = OUTPUT / Path(entry)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)

    print(f"Built {len(entries)} allowlisted files in {OUTPUT}")


if __name__ == "__main__":
    main()

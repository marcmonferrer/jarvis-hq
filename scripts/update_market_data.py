#!/usr/bin/env python3
"""Refresh the small public market feed used by JARVIS HQ.

The feed contains market movement only. It never contains Marc's balances,
position sizes, cost basis, gains, losses, or any other private account data.
"""

from __future__ import annotations

import json
import math
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "market-data.json"

ASSETS = {
    "fidelity": "IE00BYX5NX33.SG",
    "ftse": "VWCE.DE",
    "nasdaq": "SXRV.DE",
    "spacex": "DXYZ",
}

HOSTS = ("query1.finance.yahoo.com", "query2.finance.yahoo.com")
USER_AGENT = "Mozilla/5.0 (compatible; JARVIS-HQ-MarketFeed/1.0)"


def finite(value: Any) -> bool:
    return isinstance(value, (int, float)) and math.isfinite(value)


def load_existing() -> dict[str, Any]:
    try:
        return json.loads(OUTPUT.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return {"generated_at": None, "source": "JARVIS HQ scheduled market feed", "assets": {}}


def request_chart(symbol: str, host: str) -> dict[str, Any]:
    encoded = urllib.parse.quote(symbol, safe="")
    url = (
        f"https://{host}/v8/finance/chart/{encoded}"
        "?interval=1d&range=5d&includePrePost=false&events=div%2Csplits"
    )
    request = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        payload = json.load(response)

    result = payload.get("chart", {}).get("result", [None])[0]
    if not result:
        description = payload.get("chart", {}).get("error", {}).get("description")
        raise RuntimeError(description or f"No quote returned for {symbol}")
    return result


def calculate_quote(result: dict[str, Any]) -> dict[str, Any]:
    meta = result.get("meta") or {}
    quote = ((result.get("indicators") or {}).get("quote") or [{}])[0]
    closes = [value for value in quote.get("close", []) if finite(value)]

    current = meta.get("regularMarketPrice")
    previous = meta.get("chartPreviousClose", meta.get("previousClose"))

    if not finite(current) and closes:
        current = closes[-1]
    if not finite(previous) and len(closes) > 1:
        previous = closes[-2]

    if not finite(current) or not finite(previous) or previous == 0:
        raise RuntimeError("Incomplete quote data")

    timestamps = [value for value in result.get("timestamp", []) if finite(value)]
    timestamp = meta.get("regularMarketTime")
    if not finite(timestamp):
        timestamp = timestamps[-1] if timestamps else int(time.time())

    return {
        "percent": ((current - previous) / previous) * 100,
        "price": current,
        "previous": previous,
        "currency": meta.get("currency", ""),
        "timestamp": int(timestamp),
        "marketState": meta.get("marketState", "CLOSED"),
        "source": "feed",
    }


def fetch_quote(symbol: str) -> dict[str, Any]:
    errors: list[str] = []
    for host in HOSTS:
        try:
            return calculate_quote(request_chart(symbol, host))
        except (urllib.error.URLError, urllib.error.HTTPError, RuntimeError, ValueError) as exc:
            errors.append(f"{host}: {exc}")
    raise RuntimeError("; ".join(errors))


def main() -> int:
    existing = load_existing()
    existing_assets = existing.get("assets") if isinstance(existing.get("assets"), dict) else {}
    assets: dict[str, Any] = dict(existing_assets)
    failures: dict[str, str] = {}

    for key, symbol in ASSETS.items():
        try:
            assets[key] = fetch_quote(symbol)
            print(f"Updated {key} ({symbol}): {assets[key]['percent']:.2f}%")
        except RuntimeError as exc:
            failures[key] = str(exc)
            print(f"Warning: could not update {key} ({symbol}): {exc}")

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": "JARVIS HQ scheduled market feed",
        "assets": assets,
    }
    if failures:
        payload["partial_failures"] = failures

    OUTPUT.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

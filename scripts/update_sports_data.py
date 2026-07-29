#!/usr/bin/env python3
"""Refresh the public sports feed used by JARVIS HQ.

Only published schedules, results and standings are stored. If a source cannot
confirm a value, the generated feed leaves it empty so the UI can show a clear
unavailable, off-season or schedule-not-released state.
"""

from __future__ import annotations

import gzip
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "sports-favourites.json"
OUTPUT_PATH = ROOT / "sports-data.json"
USER_AGENT = "Mozilla/5.0 (compatible; JARVIS-HQ-SportsFeed/1.0)"

ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports"
SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3"


def load_json(path: Path, fallback: dict[str, Any]) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else fallback
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return fallback


def fetch_json(url: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
        },
    )
    with urllib.request.urlopen(request, timeout=25) as response:
        body = response.read()
        if response.headers.get("Content-Encoding") == "gzip":
            body = gzip.decompress(body)
    value = json.loads(body.decode("utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError("Source returned an unexpected response")
    return value


def parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        normalized = value.strip()
        if normalized.endswith("Z"):
            normalized = normalized[:-1] + "+00:00"
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except (TypeError, ValueError):
        return None


def iso_value(value: datetime | None) -> str | None:
    if value is None:
        return None
    return value.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def score_value(value: Any) -> int | None:
    if isinstance(value, dict):
        value = value.get("value", value.get("displayValue"))
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def result_label(team_score: int | None, opponent_score: int | None) -> str | None:
    if team_score is None or opponent_score is None:
        return None
    if team_score > opponent_score:
        return "W"
    if team_score < opponent_score:
        return "L"
    return "D"


def normalized_event(
    *,
    event_id: str,
    date: datetime | None,
    opponent: str | None,
    home_away: str | None,
    competition: str | None,
    venue: str | None,
    state: str,
    team_score: int | None = None,
    opponent_score: int | None = None,
) -> dict[str, Any] | None:
    if date is None or not opponent:
        return None
    return {
        "id": event_id,
        "date": iso_value(date),
        "opponent": opponent,
        "home_away": home_away if home_away in {"home", "away", "neutral"} else None,
        "competition": competition,
        "venue": venue,
        "state": state,
        "team_score": team_score,
        "opponent_score": opponent_score,
        "result": result_label(team_score, opponent_score),
    }


def normalize_espn_event(
    event: dict[str, Any],
    team_id: str,
    competition_name: str,
) -> dict[str, Any] | None:
    competition = (event.get("competitions") or [{}])[0]
    competitors = competition.get("competitors") or []
    team_entry = next(
        (
            item
            for item in competitors
            if str((item.get("team") or {}).get("id", "")) == str(team_id)
        ),
        None,
    )
    opponent_entry = next((item for item in competitors if item is not team_entry), None)
    if not team_entry or not opponent_entry:
        return None

    status = competition.get("status") or event.get("status") or {}
    status_type = status.get("type") or {}
    state = str(status_type.get("state") or "")
    completed = bool(status_type.get("completed")) or state == "post"
    event_state = "completed" if completed else ("scheduled" if state == "pre" else "live")

    home_away = team_entry.get("homeAway")
    if competition.get("neutralSite"):
        home_away = "neutral"

    return normalized_event(
        event_id=f"espn:{event.get('id', '')}",
        date=parse_iso(event.get("date") or competition.get("date")),
        opponent=(opponent_entry.get("team") or {}).get("shortDisplayName")
        or (opponent_entry.get("team") or {}).get("displayName"),
        home_away=home_away,
        competition=competition_name,
        venue=(competition.get("venue") or {}).get("fullName"),
        state=event_state,
        team_score=score_value(team_entry.get("score")) if completed else None,
        opponent_score=score_value(opponent_entry.get("score")) if completed else None,
    )


def normalize_sportsdb_event(event: dict[str, Any], team_name: str) -> dict[str, Any] | None:
    home = event.get("strHomeTeam")
    away = event.get("strAwayTeam")
    if team_name not in {home, away}:
        return None
    is_home = home == team_name
    team_score = score_value(event.get("intHomeScore" if is_home else "intAwayScore"))
    opponent_score = score_value(event.get("intAwayScore" if is_home else "intHomeScore"))
    completed = team_score is not None and opponent_score is not None
    return normalized_event(
        event_id=f"sportsdb:{event.get('idEvent', '')}",
        date=parse_iso(event.get("strTimestamp")),
        opponent=away if is_home else home,
        home_away="home" if is_home else "away",
        competition=event.get("strLeague"),
        venue=event.get("strVenue"),
        state="completed" if completed else "scheduled",
        team_score=team_score if completed else None,
        opponent_score=opponent_score if completed else None,
    )


def deduplicate_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    def same_opponent(left: Any, right: Any) -> bool:
        left_name = str(left or "").lower().replace(" fc", "").strip()
        right_name = str(right or "").lower().replace(" fc", "").strip()
        return bool(
            left_name
            and right_name
            and (
                left_name == right_name
                or left_name in right_name
                or right_name in left_name
            )
        )

    unique: list[dict[str, Any]] = []
    for event in sorted(events, key=lambda item: item.get("date") or ""):
        event_date = parse_iso(event.get("date"))
        duplicate = False
        for saved in unique:
            saved_date = parse_iso(saved.get("date"))
            if (
                event_date
                and saved_date
                and same_opponent(event.get("opponent"), saved.get("opponent"))
                and abs((event_date - saved_date).total_seconds()) < 6 * 3600
            ):
                duplicate = True
                if event.get("venue") and not saved.get("venue"):
                    saved["venue"] = event["venue"]
                if event.get("competition") and not saved.get("competition"):
                    saved["competition"] = event["competition"]
                if event.get("state") == "completed" and saved.get("state") != "completed":
                    saved.update(event)
                break
        if not duplicate:
            unique.append(event)
    return unique


def select_latest_and_next(
    events: list[dict[str, Any]], now: datetime
) -> tuple[dict[str, Any] | None, list[dict[str, Any]]]:
    complete = [
        event
        for event in events
        if event.get("state") == "completed"
        and parse_iso(event.get("date"))
        and parse_iso(event.get("date")) <= now
    ]
    upcoming = [
        event
        for event in events
        if event.get("state") == "scheduled"
        and parse_iso(event.get("date"))
        and parse_iso(event.get("date")) > now
    ]
    complete.sort(key=lambda item: item.get("date") or "")
    upcoming.sort(key=lambda item: item.get("date") or "")
    return (complete[-1] if complete else None, upcoming)


def football_status(now: datetime, events: list[dict[str, Any]]) -> str:
    upcoming_friendlies = any(
        event.get("state") == "scheduled"
        and "friend" in str(event.get("competition", "")).lower()
        for event in events
    )
    if now.month in {6, 7, 8} and upcoming_friendlies:
        return "Pre-season"
    if now.month in {6, 7}:
        return "Off-season"
    return "Season in progress"


def fetch_barcelona(config: dict[str, Any], now: datetime) -> dict[str, Any]:
    source = config.get("source") or {}
    team_id = str(source.get("espn_team_id") or "")
    team_name = "Barcelona"
    competitions = source.get("competitions") or {}
    events: list[dict[str, Any]] = []

    ranges = (
        (
            (now - timedelta(days=250)).strftime("%Y%m%d"),
            now.strftime("%Y%m%d"),
        ),
        (
            now.strftime("%Y%m%d"),
            (now + timedelta(days=250)).strftime("%Y%m%d"),
        ),
    )
    for league_slug, competition_name in competitions.items():
        for start, end in ranges:
            query = urllib.parse.urlencode({"dates": f"{start}-{end}", "limit": 1000})
            payload = fetch_json(f"{ESPN_BASE}/soccer/{league_slug}/scoreboard?{query}")
            for raw_event in payload.get("events") or []:
                normalized = normalize_espn_event(raw_event, team_id, str(competition_name))
                if normalized:
                    events.append(normalized)
            time.sleep(0.08)

    sportsdb_id = str(source.get("sportsdb_team_id") or "")
    if sportsdb_id:
        for endpoint, container in (("eventslast", "results"), ("eventsnext", "events")):
            payload = fetch_json(f"{SPORTSDB_BASE}/{endpoint}.php?id={sportsdb_id}")
            for raw_event in payload.get(container) or []:
                normalized = normalize_sportsdb_event(raw_event, team_name)
                if normalized:
                    events.append(normalized)

    events = deduplicate_events(events)
    latest, upcoming = select_latest_and_next(events, now)
    return {
        "key": config["key"],
        "name": config["name"],
        "sport": config["sport"],
        "accent": config["accent"],
        "status": football_status(now, events),
        "latest": latest,
        "next": upcoming[:2],
        "source": "ESPN and TheSportsDB public schedules",
    }


def league_is_active(league: str, now: datetime) -> bool:
    month = now.month
    if league == "mlb":
        return 3 <= month <= 10
    if league == "nfl":
        return month >= 8 or month <= 2
    if league in {"nba", "nhl"}:
        return month >= 10 or month <= 6
    return False


def fetch_us_team(config: dict[str, Any], now: datetime) -> dict[str, Any]:
    source = config.get("source") or {}
    sport = str(source.get("sport") or "")
    league = str(source.get("league") or "")
    team_slug = str(source.get("team") or "")
    events: list[dict[str, Any]] = []
    records: list[dict[str, Any]] = []
    team_id = ""

    for season in (now.year - 1, now.year, now.year + 1):
        query = urllib.parse.urlencode({"season": season})
        payload = fetch_json(
            f"{ESPN_BASE}/{sport}/{league}/teams/{team_slug}/schedule?{query}"
        )
        team = payload.get("team") or {}
        team_id = team_id or str(team.get("id") or "")
        record = team.get("recordSummary")
        standing = team.get("standingSummary")
        season_events: list[dict[str, Any]] = []
        for raw_event in payload.get("events") or []:
            normalized = normalize_espn_event(
                raw_event, team_id, config.get("sport") or league.upper()
            )
            if normalized:
                events.append(normalized)
                season_events.append(normalized)
        if not record and league == "nba":
            completed = [
                event
                for event in season_events
                if event.get("state") == "completed" and event.get("result") in {"W", "L"}
            ]
            if len(completed) >= 20:
                wins = sum(event.get("result") == "W" for event in completed)
                losses = sum(event.get("result") == "L" for event in completed)
                record = f"{wins}-{losses}"
                latest_completed = max(
                    (parse_iso(event.get("date")) for event in completed),
                    default=None,
                )
                if latest_completed:
                    end_year = (
                        latest_completed.year
                        if latest_completed.month <= 6
                        else latest_completed.year + 1
                    )
                    team["seasonSummary"] = f"{end_year - 1}-{str(end_year)[-2:]}"
        if record or standing:
            records.append(
                {
                    "record": record,
                    "standing": standing,
                    "season": team.get("seasonSummary")
                    or (payload.get("season") or {}).get("displayName"),
                }
            )
        time.sleep(0.08)

    events = deduplicate_events(events)
    latest, upcoming = select_latest_and_next(events, now)
    active = league_is_active(league, now)
    record = records[-1] if records else {"record": None, "standing": None, "season": None}

    if active:
        status = "Season in progress"
    elif upcoming:
        status = "Off-season · next season scheduled"
    else:
        status = "Off-season · schedule not released"

    return {
        "key": config["key"],
        "name": config["name"],
        "sport": config["sport"],
        "accent": config["accent"],
        "status": status,
        "record": record.get("record"),
        "record_season": record.get("season"),
        "standing": record.get("standing"),
        "latest": latest,
        "next": upcoming[0] if upcoming else None,
        "source": "ESPN public schedules",
    }


def main() -> int:
    config = load_json(CONFIG_PATH, {})
    existing = load_json(OUTPUT_PATH, {"teams": {}})
    existing_teams = existing.get("teams") if isinstance(existing.get("teams"), dict) else {}
    teams: dict[str, Any] = {}
    failures: dict[str, str] = {}
    now = datetime.now(timezone.utc)

    featured = config.get("featured")
    if isinstance(featured, dict):
        try:
            teams[featured["key"]] = fetch_barcelona(featured, now)
            print(f"Updated {featured['name']}")
        except (KeyError, RuntimeError, urllib.error.URLError, urllib.error.HTTPError, ValueError) as exc:
            failures[featured.get("key", "featured")] = str(exc)
            if featured.get("key") in existing_teams:
                teams[featured["key"]] = existing_teams[featured["key"]]

    for team_config in config.get("compact") or []:
        try:
            teams[team_config["key"]] = fetch_us_team(team_config, now)
            print(f"Updated {team_config['name']}")
        except (KeyError, RuntimeError, urllib.error.URLError, urllib.error.HTTPError, ValueError) as exc:
            failures[team_config.get("key", "unknown")] = str(exc)
            if team_config.get("key") in existing_teams:
                teams[team_config["key"]] = existing_teams[team_config["key"]]

    payload: dict[str, Any] = {
        "generated_at": iso_value(now),
        "source": "JARVIS HQ scheduled public sports feed",
        "teams": teams,
    }
    if failures:
        payload["partial_failures"] = failures

    OUTPUT_PATH.write_text(
        json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

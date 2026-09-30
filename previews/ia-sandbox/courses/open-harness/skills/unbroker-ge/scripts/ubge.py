#!/usr/bin/env python3
"""unbroker engine — consent, queue, ledger. Profile comes from targets.json."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

VALID_STATES = {
    "unscanned",
    "found",
    "not_found",
    "blocked",
    "submitted",
    "awaiting_processing",
    "confirmed_removed",
    "human_task_queued",
}

TRANSITIONS = {
    "unscanned": {
        "found",
        "not_found",
        "blocked",
        "submitted",
        "human_task_queued",
    },
    "found": {"submitted", "blocked", "human_task_queued", "not_found"},
    "not_found": {"submitted", "blocked", "human_task_queued", "found"},
    "blocked": {"submitted", "human_task_queued", "found", "not_found"},
    "submitted": {"awaiting_processing", "confirmed_removed", "blocked", "human_task_queued"},
    "awaiting_processing": {"confirmed_removed", "found", "human_task_queued"},
    "confirmed_removed": {"found"},  # re-listing
    "human_task_queued": {"submitted", "found", "not_found", "blocked"},
}

HERE = Path(__file__).resolve().parent
SKILL_DIR = HERE.parent


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def data_dir() -> Path:
    raw = os.environ.get("UBGE_DATA_DIR") or os.environ.get("UNBROKER_DATA_DIR")
    if raw:
        return Path(raw)
    name = load_targets().get("data_dirname", SKILL_DIR.name)
    hermes = os.environ.get("HERMES_HOME")
    if hermes:
        return Path(hermes) / name
    return Path.home() / ".hermes" / name


def load_targets() -> dict[str, Any]:
    path = HERE / "targets.json"
    return json.loads(path.read_text(encoding="utf-8"))


def subject_id(full_name: str, email: str) -> str:
    key = f"{full_name.strip().lower()}|{email.strip().lower()}".encode("utf-8")
    return "s_" + hashlib.sha256(key).hexdigest()[:10]


def die(msg: str, code: int = 2) -> None:
    print(json.dumps({"ok": False, "error": msg}, ensure_ascii=False), file=sys.stderr)
    raise SystemExit(code)


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)
    try:
        os.chmod(path, 0o600)
    except OSError:
        pass


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dossier_path(sid: str) -> Path:
    return data_dir() / "subjects" / sid / "dossier.json"


def ledger_path(sid: str) -> Path:
    return data_dir() / "subjects" / sid / "ledger.json"


def load_dossier(sid: str) -> dict[str, Any]:
    path = dossier_path(sid)
    if not path.exists():
        die(f"unknown subject {sid}")
    return read_json(path)


def load_ledger(sid: str) -> dict[str, Any]:
    path = ledger_path(sid)
    if not path.exists():
        die(f"no ledger for {sid}")
    return read_json(path)


def empty_case() -> dict[str, Any]:
    return {
        "state": "unscanned",
        "found": False,
        "listing_urls": [],
        "updated_at": utc_now(),
        "reason": None,
    }


def ensure_setup() -> dict[str, Any]:
    root = data_dir()
    root.mkdir(parents=True, exist_ok=True)
    cfg_path = root / "config.json"
    if cfg_path.exists():
        return read_json(cfg_path)
    catalog = load_targets()
    cfg = {
        "autonomy": "full",
        "profile": catalog.get("profile", SKILL_DIR.name),
        "legal_kind": catalog["legal_kind"],
        "created_at": utc_now(),
        "data_dir": str(root),
    }
    write_json(cfg_path, cfg)
    return cfg


def cmd_setup(_args: argparse.Namespace) -> None:
    cfg = ensure_setup()
    print(json.dumps({"ok": True, "config": cfg}, ensure_ascii=False))


def cmd_doctor(_args: argparse.Namespace) -> None:
    catalog = load_targets()
    root = data_dir()
    cfg_ok = (root / "config.json").exists()
    print(
        json.dumps(
            {
                "ok": True,
                "python": sys.version.split()[0],
                "data_dir": str(root),
                "setup": cfg_ok,
                "target_count": len(catalog["targets"]),
                "noid": [k for k, v in catalog["targets"].items() if v["lane"] == "noid"],
                "id_gated": [k for k, v in catalog["targets"].items() if v["lane"] == "id_gated"],
                "legal_kind": catalog["legal_kind"],
            },
            ensure_ascii=False,
        )
    )


def cmd_intake(args: argparse.Namespace) -> None:
    if not args.consent:
        die("no consent, no action — pass --consent")
    if not args.full_name or not args.email:
        die("intake needs --full-name and --email")
    ensure_setup()
    catalog = load_targets()
    sid = subject_id(args.full_name, args.email)
    aliases = [a for a in (args.alias or []) if a.strip()]
    dossier = {
        "subject_id": sid,
        "full_name": args.full_name.strip(),
        "aliases": aliases,
        "email": args.email.strip(),
        "phone": (args.phone or "").strip() or None,
        "street": (args.street or "").strip() or None,
        "npa": (args.npa or "").strip() or None,
        "commune": (args.commune or "").strip() or None,
        "country": (args.country or catalog.get("default_country") or "").strip().upper() or None,
        "canton": (args.canton or "").strip().upper() or None,
        "consent": True,
        "consent_at": utc_now(),
        "consent_method": args.consent_method or "cli",
        "legal_kind": catalog["legal_kind"],
    }
    write_json(dossier_path(sid), dossier)
    cases = {tid: empty_case() for tid in catalog["order"]}
    write_json(
        ledger_path(sid),
        {"subject_id": sid, "cases": cases, "updated_at": utc_now()},
    )
    print(json.dumps({"ok": True, "subject_id": sid, "dossier": dossier}, ensure_ascii=False))


def _require_consent(dossier: dict[str, Any]) -> None:
    if not dossier.get("consent"):
        die("dossier has no recorded consent")


def cmd_record(args: argparse.Namespace) -> None:
    dossier = load_dossier(args.subject)
    _require_consent(dossier)
    catalog = load_targets()
    if args.target not in catalog["targets"]:
        die(f"unknown target {args.target}")
    if args.state not in VALID_STATES:
        die(f"invalid state {args.state}")
    ledger = load_ledger(args.subject)
    case = ledger["cases"].setdefault(args.target, empty_case())
    current = case["state"]
    if args.state != current and args.state not in TRANSITIONS.get(current, set()):
        die(f"illegal transition {current} -> {args.state} on {args.target}")
    spec = catalog["targets"][args.target]
    if spec["lane"] == "id_gated" and args.state in {"submitted", "confirmed_removed"}:
        die(f"{args.target} is ID-gated — record human_task_queued, do not file")
    case["state"] = args.state
    case["updated_at"] = utc_now()
    if args.found is not None:
        case["found"] = args.found.lower() in {"1", "true", "yes"}
    if args.evidence:
        ev = json.loads(args.evidence)
        urls = ev.get("listing_urls") or ev.get("urls") or []
        if urls:
            case["listing_urls"] = list(urls)
    if args.reason:
        case["reason"] = args.reason
    ledger["updated_at"] = utc_now()
    write_json(ledger_path(args.subject), ledger)
    print(json.dumps({"ok": True, "target": args.target, "case": case}, ensure_ascii=False))


def _address(dossier: dict[str, Any]) -> str:
    bits = [dossier.get("street"), dossier.get("npa"), dossier.get("commune")]
    return " ".join(b for b in bits if b)


def _query(dossier: dict[str, Any]) -> str:
    return dossier["full_name"].replace(" ", "+")


def _format_urls(urls: list[str], dossier: dict[str, Any]) -> list[str]:
    commune = (dossier.get("commune") or "Geneve").replace(" ", "+")
    return [
        u.format(query=_query(dossier), commune=commune)
        for u in urls
    ]


def render_letter(dossier: dict[str, Any], target_id: str, listing_urls: list[str]) -> str:
    catalog = load_targets()
    spec = catalog["targets"][target_id]
    fname = catalog.get("letter_template", "opposition.fr.txt")
    template = (SKILL_DIR / "templates" / fname).read_text(encoding="utf-8")
    none = (
        "(aucune fiche confirmée — opposition préventive)"
        if catalog["legal_kind"] == "fadp"
        else "(no listing confirmed — preventive erasure request)"
    )
    urls = "\n  ".join(listing_urls) if listing_urls else none
    return (
        template.replace("{full_name}", dossier["full_name"])
        .replace("{address}", _address(dossier) or "(adresse non fournie)")
        .replace("{contact_email}", dossier["email"])
        .replace("{listing_urls}", urls)
        .replace("{broker_name}", spec["name"])
    )


def _action(kind: str, target: str, spec: dict[str, Any], **extra: Any) -> dict[str, Any]:
    payload = {
        "type": kind,
        "target": target,
        "name": spec["name"],
        "method": spec.get("method"),
        "optout_url": spec.get("optout_url"),
        "email": spec.get("email"),
        "notes": spec.get("notes"),
        "legal_kind": load_targets()["legal_kind"],
        "disclosure_fields": ["full_name", "address", "contact_email"],
    }
    payload.update(extra)
    return payload


def plan_next(
    dossier: dict[str, Any], ledger: dict[str, Any], *, persist: bool = True
) -> dict[str, Any]:
    catalog = load_targets()
    cases = ledger["cases"]
    actions: list[dict[str, Any]] = []
    digest: list[dict[str, Any]] = []
    dirty = False

    for tid in catalog["order"]:
        spec = catalog["targets"][tid]
        case = cases.setdefault(tid, empty_case())
        state = case["state"]

        if spec["lane"] == "id_gated":
            if state == "unscanned":
                case["state"] = "human_task_queued"
                case["reason"] = "ID copy required — student sends the EDÖB letter"
                case["updated_at"] = utc_now()
                state = "human_task_queued"
                dirty = True
            digest.append(
                {
                    "target": tid,
                    "name": spec["name"],
                    "email": spec.get("email"),
                    "reason": case.get("reason") or spec.get("notes"),
                }
            )
            continue

        if spec.get("human_extra"):
            digest.append(
                {
                    "target": tid,
                    "name": spec["name"],
                    "reason": spec["human_extra"],
                }
            )

        terminal = state in {"submitted", "awaiting_processing", "confirmed_removed", "human_task_queued"}

        if spec.get("scan") and state == "unscanned":
            actions.append(
                _action(
                    "scan",
                    tid,
                    spec,
                    search_urls=_format_urls(spec.get("search_urls") or [], dossier),
                    after=f"record {dossier['subject_id']} {tid} found|not_found|blocked --found true|false --evidence '{{\"listing_urls\":[...]}}'",
                )
            )
            continue

        if terminal:
            continue

        if tid == "dnb" and state != "found":
            continue

        if spec.get("blind_optout") or state == "found":
            if tid == catalog.get("one_shot"):
                kind = "robinson_submit" if tid == "robinson" else "one_shot_submit"
                after = f"record {dossier['subject_id']} {tid} submitted"
            elif spec.get("method") == "web_form":
                kind = "optout_web_form"
                after = f"record {dossier['subject_id']} {tid} submitted"
            else:
                # Course has no mailbox. Render a letter; the human sends it.
                kind = "draft_letter"
                after = (
                    f"record {dossier['subject_id']} {tid} human_task_queued "
                    f"--reason \"student sends draft from own mailbox\""
                )
            actions.append(
                _action(
                    kind,
                    tid,
                    spec,
                    listing_urls=case.get("listing_urls") or [],
                    after=after,
                )
            )

    done = not actions
    if persist and dirty:
        ledger["updated_at"] = utc_now()
        write_json(ledger_path(dossier["subject_id"]), ledger)

    return {
        "ok": True,
        "subject_id": dossier["subject_id"],
        "done_for_now": done,
        "legal_kind": catalog["legal_kind"],
        "actions": actions,
        "human_digest": digest,
        "next_wake_at": None if not done else "+30d",
    }


def cmd_next(args: argparse.Namespace) -> None:
    dossier = load_dossier(args.subject)
    _require_consent(dossier)
    ledger = load_ledger(args.subject)
    print(json.dumps(plan_next(dossier, ledger), ensure_ascii=False, indent=2))


def cmd_letter(args: argparse.Namespace) -> None:
    dossier = load_dossier(args.subject)
    _require_consent(dossier)
    catalog = load_targets()
    if args.target not in catalog["targets"]:
        die(f"unknown target {args.target}")
    if catalog["targets"][args.target]["lane"] == "id_gated":
        die(f"{args.target} is ID-gated — do not send from the agent")
    ledger = load_ledger(args.subject)
    urls = ledger["cases"].get(args.target, {}).get("listing_urls") or []
    body = render_letter(dossier, args.target, urls)
    out = data_dir() / "subjects" / args.subject / "drafts" / f"{args.target}.txt"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(body, encoding="utf-8")
    try:
        os.chmod(out, 0o600)
    except OSError:
        pass
    spec = catalog["targets"][args.target]
    kind = catalog["legal_kind"]
    subject = (
        f"Opposition au traitement — nLPD — {spec['name']}"
        if kind == "fadp"
        else f"Request for erasure under GDPR Article 17 — {spec['name']}"
    )
    print(
        json.dumps(
            {
                "ok": True,
                "to": spec.get("email"),
                "path": str(out),
                "subject": subject,
                "body": body,
            },
            ensure_ascii=False,
        )
    )


def cmd_status(args: argparse.Namespace) -> None:
    dossier = load_dossier(args.subject)
    ledger = load_ledger(args.subject)
    catalog = load_targets()
    lines = [
        f"# {catalog.get('profile', SKILL_DIR.name)} receipt",
        "",
        f"- Date: {utc_now()}",
        f"- Subject: {dossier['full_name']}",
        f"- Consent: recorded {dossier.get('consent_at')} via {dossier.get('consent_method')}",
        f"- subject_id: `{dossier['subject_id']}`",
        f"- Legal: {'nLPD / FADP (not CCPA)' if catalog['legal_kind'] == 'fadp' else 'GDPR Arts. 17 and 21 (not CCPA)'}",
        "",
        "## Scan and filings",
        "",
        "| Target | Found? | Listing URL | State |",
        "| --- | --- | --- | --- |",
    ]
    for tid in catalog["order"]:
        spec = catalog["targets"][tid]
        case = ledger["cases"].get(tid, empty_case())
        urls = ", ".join(case.get("listing_urls") or []) or "—"
        found = "yes" if case.get("found") else "no"
        lines.append(f"| {spec['name']} | {found} | {urls} | `{case['state']}` |")
    planned = plan_next(dossier, ledger, persist=False)
    lines += ["", "## Human digest", ""]
    if planned["human_digest"]:
        for item in planned["human_digest"]:
            lines.append(f"- **{item['name']}**: {item['reason']}")
    else:
        lines.append("- (empty)")
    lines += ["", "## Queue", ""]
    if planned["done_for_now"]:
        lines.append("done_for_now — no agent actions left.")
    else:
        for act in planned["actions"]:
            lines.append(f"- `{act['type']}` → {act['name']}")
    text = "\n".join(lines) + "\n"
    if args.out:
        out = Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
    print(text)


def cmd_tasks(args: argparse.Namespace) -> None:
    dossier = load_dossier(args.subject)
    ledger = load_ledger(args.subject)
    planned = plan_next(dossier, ledger)
    print(json.dumps({"ok": True, "human_digest": planned["human_digest"]}, ensure_ascii=False, indent=2))


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="ubge.py")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("setup").set_defaults(func=cmd_setup)
    sub.add_parser("doctor").set_defaults(func=cmd_doctor)

    inn = sub.add_parser("intake")
    inn.add_argument("--full-name", required=True)
    inn.add_argument("--email", required=True)
    inn.add_argument("--phone")
    inn.add_argument("--street")
    inn.add_argument("--npa")
    inn.add_argument("--commune")
    inn.add_argument("--country")
    inn.add_argument("--canton")
    inn.add_argument("--alias", action="append")
    inn.add_argument("--consent", action="store_true")
    inn.add_argument("--consent-method")
    inn.set_defaults(func=cmd_intake)

    nxt = sub.add_parser("next")
    nxt.add_argument("subject")
    nxt.set_defaults(func=cmd_next)

    rec = sub.add_parser("record")
    rec.add_argument("subject")
    rec.add_argument("target")
    rec.add_argument("state")
    rec.add_argument("--found")
    rec.add_argument("--evidence")
    rec.add_argument("--reason")
    rec.set_defaults(func=cmd_record)

    let = sub.add_parser("letter")
    let.add_argument("subject")
    let.add_argument("target")
    let.set_defaults(func=cmd_letter)

    st = sub.add_parser("status")
    st.add_argument("subject")
    st.add_argument("--out")
    st.set_defaults(func=cmd_status)

    tk = sub.add_parser("tasks")
    tk.add_argument("subject")
    tk.set_defaults(func=cmd_tasks)
    return p


def main(argv: list[str] | None = None) -> None:
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()

---
name: unbroker-eu
description: >
  File GDPR erasure / objection requests for an EU or UK resident against
  adtech and data brokers that do not need an ID copy: YourOnlineChoices,
  Acxiom, Criteo, LiveRamp, Oracle Advertising, Google results-about-you, Dun & Bradstreet if
  the person appears. Use when the user says unbroker-eu, GDPR opt-out,
  clean my digital footprint in the EU, Criteo, Acxiom, or runs /unbroker-eu.
  Do not use for third parties, credit bureaus that demand ID, or Swiss
  residents (use unbroker-ge).
license: MIT
metadata:
  hermes:
    tags: [privacy, data-broker, gdpr, opt-out]
    category: security
---

# unbroker-eu

Same shape as official Unbroker and `unbroker-ge`: recorded consent, then
drain `$UBGE next` until empty. Jurisdiction is **GDPR / UK GDPR**, not nLPD,
not CCPA. The CLI (`scripts/ubge.py`) owns consent, the queue, and the ledger.

Not legal advice. There is no EU DROP. YourOnlineChoices is the one-shot for
interest-based ads only.

Swiss residents: use `unbroker-ge`. US-only footprint: official `unbroker`.

## Autonomy contract

After intake (`--consent`) there are two human touchpoints: (1) intake,
(2) `$UBGE tasks` at the end. Between those, drain `next`. Never send an
identity document. SCHUFA / Experian / CRIF-EU stay in the digest.

## How to run

Via `terminal`, from this skill's directory (not `execute_code` — it redacts
dossiers). Interpreter is `python3` on macOS/Linux and `python` on native
Windows; this one-liner picks whichever actually runs on the host (the Windows
`python3` Store stub is skipped by the probe):

```bash
PY="python3"; python3 -c "pass" >/dev/null 2>&1 || PY="python"; UBGE="$PY scripts/ubge.py"
```

Data: `$UBGE_DATA_DIR` / `$UNBROKER_DATA_DIR`, else `$HERMES_HOME/unbroker-eu`
(mode `0600` on POSIX; profile-home isolation on Windows).

## Verify

```bash
$UBGE setup && $UBGE doctor    # GDPR target list; data dir separate from unbroker-ge
$PY tests/test_ubge.py         # hermetic tests, no network
```

## Quick reference

| Command | Purpose |
|---|---|
| `$UBGE setup` / `$UBGE doctor` | Data dir + GDPR target list |
| `$UBGE intake --full-name "…" --email … [--phone --street --country DE] --consent` | Refuses without `--consent` |
| `$UBGE next <subject>` | Queue + digest |
| `$UBGE record <subject> <target> <state> …` | Ledger |
| `$UBGE letter <subject> <target>` | GDPR Art. 17 letter (refuses ID-gated) |
| `$UBGE status <subject> [--out PATH]` | Receipt |

## Procedure

1. `$UBGE setup && $UBGE doctor`
2. One intake conversation (name, address, country, email, phone) then
   `--consent`.
3. Loop `$UBGE next` until `done_for_now`.
   - `one_shot_submit` — YourOnlineChoices ad opt-out, first.
   - `optout_web_form` — Acxiom, Criteo, LiveRamp, Google results.
   - `scan` then D&B only if `found`.
   - CAPTCHA you cannot pass → `$UBGE letter` + `human_task_queued`.
4. `$UBGE tasks` then `$UBGE status --out unbroker-receipt.md`

Cite GDPR Articles 17 and 21 only. Never CCPA. Never nLPD unless they also
run `unbroker-ge`.

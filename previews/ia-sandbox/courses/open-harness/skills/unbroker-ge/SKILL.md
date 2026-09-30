---
name: unbroker-ge
description: >
  File Swiss data-broker and adtech opt-outs that do not need an ID copy:
  Robinson, YourOnlineChoices, local.ch, Moneyhouse, Poste, KünzlerBachmann,
  Intrum marketing, Google results, Criteo, Acxiom, LiveRamp, D&B if found. Use when the user says unbroker-ge,
  clean my digital footprint in Geneva or Switzerland, Robinson list, opt out
  of local.ch or Moneyhouse, or runs /unbroker-ge. Do not use for third
  parties, public registers, or requests that require a passport/ID scan.
license: MIT
metadata:
  hermes:
    tags: [privacy, data-broker, fadp, geneva, opt-out]
    category: security
---

# unbroker-ge

Find where a consenting Geneva resident's name, address or phone is published
on Swiss brokers and directories, then file the no-ID opt-outs. The Python
CLI (`scripts/ubge.py`) owns consent, the queue, and the ledger. You scan and
submit with native tools (`web_extract`, `browser_*`). It does **not** act
without recorded consent, does **not** send an ID, does **not** cite CCPA, and
does **not** touch official registers (OCPM, poursuites, Zefix).

Not legal advice. Letters follow the [EDÖB sample letters](https://www.edoeb.admin.ch/de/musterbriefe-datenschutz).

Official Hermes `unbroker` is US people-search + California DROP. Do not install
it unless the person also has a US footprint and asks.

## Autonomy contract

After intake (+ recorded `--consent`) there are two human touchpoints: (1) the
intake conversation, (2) ONE digest at the end (`$UBGE tasks`). Between those:

- Never ask the operator to pick brokers. `$UBGE next` is the queue.
- Never pause before individual no-ID submissions. Consent is standing
  authorization for every no-ID target in scripts/targets.json.
- Never send, attach, or store a pièce d'identité / AVS / passport. ID-gated
  targets (CRIF, AZ Direct, Creditreform) only appear in the digest.
- Drive the run as a loop over `$UBGE next <subject>` until `done_for_now`.

## When to use

- "Remove my data from Swiss brokers / local.ch / Moneyhouse."
- "Robinson list", "opt me out in Geneva", `/unbroker-ge`.

## How to run

Via `terminal`, from this skill's directory (not `execute_code` — it redacts
dossiers). Interpreter is `python3` on macOS/Linux and `python` on native
Windows; this one-liner picks whichever exists on the host:

```bash
PY="python3"; python3 -c "pass" >/dev/null 2>&1 || PY="python"; UBGE="$PY scripts/ubge.py"
```

Data lives under `$UBGE_DATA_DIR` (default `$HERMES_HOME/unbroker-ge`, else
`~/.hermes/unbroker-ge`), mode `0600` on POSIX; on Windows the profile-home
isolation provides the equivalent protection.

## Install & verify (students / clients)

Copy the skill directory into your own Hermes skills dir (replace the paths for
your machine; use `python` on Windows):

```bash
cp -a <course>/skills/unbroker-ge  ~/.hermes/skills/unbroker-ge
cd ~/.hermes/skills/unbroker-ge
python3 scripts/ubge.py setup && python3 scripts/ubge.py doctor   # 8 targets, legal_kind fadp
python3 tests/test_ubge.py                                        # 9 hermetic tests
```

`doctor` prints `setup: true` and the current no-ID vs ID-gated lists. Dossiers
and the ledger stay inside the data dir — no ID ever leaves the machine.

## Quick reference

| Command | Purpose |
|---|---|
| `$UBGE setup` | Create the data dir |
| `$UBGE doctor` | Readiness: target count, no-ID vs ID-gated |
| `$UBGE intake --full-name "…" --email … [--phone --street --npa --commune] --consent` | Create subject; refuses without `--consent`; prints `subject_id` |
| `$UBGE next <subject>` | Ordered actions right now + human digest |
| `$UBGE record <subject> <target> <state> [--found true] [--evidence JSON] [--reason "…"]` | Ledger (validated transitions) |
| `$UBGE letter <subject> <target>` | Render the French nLPD letter (refuses ID-gated targets) |
| `$UBGE status <subject> [--out PATH]` | Markdown receipt |
| `$UBGE tasks <subject>` | Human digest only |

States: `unscanned` → `found`/`not_found`/`blocked` → `submitted` →
`awaiting_processing` → `confirmed_removed`. `human_task_queued` for anything
only a human can finish. `confirmed_removed` only after a re-scan shows the
listing gone.

## Procedure

1. **Setup.** `$UBGE setup && $UBGE doctor`. Show the operator. Do not wait.
2. **Intake + consent (the one conversation).** Collect name, aliases, street,
   NPA, commune (GE), `+41` phones, emails in one pass. Then:

   ```bash
   $UBGE intake --full-name "…" --email "…" --street "…" --npa "…" --commune "…" --phone "…" --consent --consent-method spoken
   ```

   Without `--consent` the engine exits. Do not work around it.
3. **Drain the queue.**

   ```
   while true:
     q = $UBGE next <subject>
     if q.done_for_now: break
     execute EVERY action in order; $UBGE record each outcome
   ```

   Action types:
   - `robinson_submit` — open `optout_url`, file the French Robinson form
     (name + Swiss address). Record `submitted`.
   - `scan` — hit every `search_urls` entry. Confirm it is the subject, not a
     namesake. Record `found` / `not_found` / `blocked` with listing URLs.
     A 404 is inconclusive (`blocked`), not `not_found`.
   - `optout_web_form` — drive `optout_url` with only `disclosure_fields`.
     CAPTCHA you cannot pass → `$UBGE letter` and record `human_task_queued`.
     Never a solver service.
   - `draft_letter` — `$UBGE letter <subject> <target>` writes a `.txt` under
     the subject's `drafts/` folder. **Do not send mail.** The course does not
     connect SMTP or webmail. Put the path + `to` in the digest; the student
     copies the letter into their own mailbox. Record `human_task_queued`.
4. **Wrap up.** `$UBGE tasks` (digest) then `$UBGE status --out unbroker-receipt.md`
   in the folder the operator named. Present the digest once.
5. **Re-scan later.** `next_wake_at` is `+30d`. One cron that re-runs this
   loop is enough. Do not mark `confirmed_removed` off a thank-you page.

## Rules the queue already encodes

- Robinson first (paper mail). YourOnlineChoices next (digital ads).
- Blind nLPD letter / form on every `blind_optout` target even when the scan
  is `not_found`.
- D&B only if `found`. Company pages stay.
- CRIF / AZ Direct / Creditreform never become agent submit actions.
- Prefer blocage over full deletion.
- French nLPD letter. Never CCPA. Live target list is `scripts/targets.json`.

## Out of scope

OCPM, Office des poursuites, registre du commerce / Zefix, HUG, SIG, TPG,
the commune, organisations internationales, US people-search.

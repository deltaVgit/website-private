# cron-runbook.md (example)

## Job
- Schedule: weekdays 08:00 local
- Delivery: Telegram (or file `~/notes/daily-ai.md` if offline)
- Reasoning effort: `--reasoning-effort minimal` (a poll, not a synthesis — pin high only for jobs that think)

## Amnesia prompt (paste into cron job)
You are a fresh session. You do not remember prior runs.
(Since v0.20.5 you do wake with `MEMORY.md` / `USER.md` — durable preferences, not last run's transcript. Anything from the previous run still has to live in this runbook or a state file.)
1. Fetch three short AI headlines from trusted sources you can reach.
2. Write a 120-word summary with source titles only (no invented stats).
3. Deliver to the configured channel OR write absolute path ~/notes/daily-ai.md.
4. On failure: one-line error to the same channel; do not invent success.

## Success
- Summary delivered; no empty body.

## Failure
- Network or tool error → notify human; do not retry infinitely.

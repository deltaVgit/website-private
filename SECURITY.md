# Security policy

## Supported software

This repository builds the public **Delta V** static website and related edge helpers.

| Component | Notes |
|-----------|--------|
| Static site (Next.js export) | No server-side app runtime; client fetches public JSON/assets |
| GitHub Actions deploy | Builds and publishes GitHub Pages from `main` |
| Cloudflare CORS proxy | `workers/proxy.js` at `proxy.hub.deltav.cc` — see [docs/proxy.md](./docs/proxy.md) |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Email: **[contact@deltav.cc](mailto:contact@deltav.cc)**

Include:

- Affected component (site path, Worker, script, dependency)
- Description and impact
- Steps to reproduce or a proof-of-concept if available
- Whether you plan any public disclosure and preferred timeline

We aim to acknowledge reports within a few business days.

## Scope notes

In scope (examples):

- XSS or content-injection issues in first-party pages/scripts
- Misconfiguration that exposes secrets in the static bundle or CI
- Abuse vectors on the production CORS proxy (open fetch, origin policy)
- Supply-chain issues in first-party build scripts

Out of scope (examples):

- Issues solely in third-party sites linked from content
- Denial of service against public static hosting without a practical fix in this repo
- Social engineering of individual contributors

## Hardening preferences

- Prefer reporting proxy allowlist / CORS policy improvements privately first.
- Do not test in ways that degrade service for real users or violate law.

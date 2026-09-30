# Ecosystem avatars (self-hosted)

Local profile marks for AI / Web3 **Ecosystem & Stack** rails.

- Filenames match X handles in `app/components/EcosystemStack.tsx` (`{handle}.webp`).
- Served same-origin via `withBasePath` — **no unavatar / twimg / Google at runtime** (privacy).
- Source: one-time fetch of public X profile images (or official site icons / monogram fallback).
- Refresh offline: download new PP → resize to 128×128 WebP → replace file.

Do not hotlink third-party avatar CDNs from the site.

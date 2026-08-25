"use client";

import dynamic from "next/dynamic";

/**
 * Agentation visual-feedback toolbar — development only.
 *
 * Lazy-loaded so the package never lands in a production chunk, and gated on
 * NODE_ENV so the static export (`output: "export"`) ships without it.
 *
 * `endpoint` points at the local agentation-mcp HTTP server. The MCP entry in
 * .mcp.json normally starts it alongside the agent's stdio channel, but its
 * HTTP half binds port 4747 and silently gives up if anything already holds
 * it — which leaves the agent's own tools failing with "fetch failed".
 * `pnpm annotate` starts it on its own when that happens.
 * which relays annotations to the coding agent. The toolbar still works
 * without it: when the endpoint is unreachable it falls back to localStorage
 * plus copy-to-clipboard.
 */
const Agentation = dynamic(
  () => import("agentation").then((m) => m.Agentation),
  { ssr: false },
);

export default function DevAnnotations() {
  if (process.env.NODE_ENV !== "development") return null;

  return <Agentation endpoint="http://localhost:4747" />;
}

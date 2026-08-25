import type { ReactNode } from 'react';
// The course reading system lives under the /forge/course segment, so a route
// outside it gets none of those classes. Importing it here gives the WIP pages
// the exact same baseline as the live lesson — which is the point: proposals
// must be judged against production, not against a lookalike.
import '../forge/course/course.css';
import './wip.css';
import './lab/kit/kit.css';

/**
 * WIP — a sandbox that mirrors the course without sharing a single file with
 * it. Nothing under this tree is indexed, linked from the sitemap, or reachable
 * from the live course, so a half-finished idea can sit here for days without
 * blocking a release or colliding with an open branch.
 */
export default function WipLayout({ children }: { children: ReactNode }) {
  return children;
}

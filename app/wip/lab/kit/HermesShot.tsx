'use client';

import { CourseShot } from '@/app/components/course/CourseShot';

/**
 * The Hermes Desktop overview.
 *
 * Rendered through the shared `CourseShot`, exactly like the thirteen
 * screenshots the course already ships, so it gets click-to-enlarge for free
 * and `PinLayer` annotates it by the same route as every other figure.
 *
 * It used to have its own image component with its own pins, which meant two
 * widgets doing one job: this one had no lightbox and had already drifted from
 * the other on note ids. One widget is the fix; the pins live in `pins.ts`
 * under this file's basename.
 */
export function HermesOverviewShot() {
  return (
    <CourseShot
      src="/courses/open-harness/screenshots/hermes-desktop-overview.webp"
      alt="Hermes Desktop on first launch: left rail with New session, Skills and Tools, Messaging and Artifacts; a goal prompt at the bottom; a status bar reading Gateway ready, Agents and Cron."
      caption="Hermes Desktop, first launch. Eight of the things this course teaches are already on this screen; the session titles are blurred because they are real work."
      width={1440}
      height={747}
    />
  );
}

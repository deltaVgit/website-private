/**
 * Client-side course progress (localStorage).
 * Keys are per-course; values are JSON string arrays of completed module/lab slugs.
 */

/** `visual-lab` is the internal design lab: it stores its own progress so
 *  ticking a box in a mock-up never marks a real lesson as done. */
export type CourseProgressId =
  | 'open-harness'
  | 'open-design'
  | 'harness-labs'
  /** The first lab, under /forge/course/visual-lab/. */
  | 'visual-lab'
  /**
   * The two WIP sandboxes. They render the same thirteen modules with the
   * same block ids as each other and as the lab, and the storage key is
   * `dv-check:{courseId}:{slug}:{section}` — so sharing one id made a tick in
   * one surface appear in all three.
   */
  | 'wip-course'
  | 'wip-lab';

const KEY: Record<CourseProgressId, string> = {
  'open-harness': 'dv-progress-open-harness',
  'open-design': 'dv-progress-open-design',
  'harness-labs': 'dv-progress-harness-labs',
  'visual-lab': 'dv-progress-visual-lab',
  'wip-course': 'dv-progress-wip-course',
  'wip-lab': 'dv-progress-wip-lab',
};

/** Soft prereq: user confirmed Harness Part I before Design */
export const DESIGN_PREREQ_KEY = 'dv-design-prereq-ok';

export function progressStorageKey(id: CourseProgressId): string {
  return KEY[id];
}

export function readCompleted(id: CourseProgressId): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY[id]);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function writeCompleted(id: CourseProgressId, slugs: string[]): void {
  try {
    localStorage.setItem(KEY[id], JSON.stringify([...new Set(slugs)]));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Wipe completion for one course (local only). */
export function clearCompleted(id: CourseProgressId): void {
  try {
    localStorage.removeItem(KEY[id]);
  } catch {
    /* ignore */
  }
}

/** Remove all Delta V course progress + checklist keys (local only). */
export function clearAllCourseLocalData(): void {
  if (typeof window === 'undefined') return;
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('dv-progress-') || k.startsWith('dv-check:') || k === DESIGN_PREREQ_KEY)) {
        doomed.push(k);
      }
    }
    for (const k of doomed) localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

export function isComplete(id: CourseProgressId, slug: string): boolean {
  return readCompleted(id).includes(slug);
}

export function setComplete(id: CourseProgressId, slug: string, done: boolean): string[] {
  const cur = readCompleted(id);
  const next = done ? [...new Set([...cur, slug])] : cur.filter((s) => s !== slug);
  writeCompleted(id, next);
  return next;
}

export function toggleComplete(id: CourseProgressId, slug: string): string[] {
  return setComplete(id, slug, !isComplete(id, slug));
}

/** First incomplete slug in ordered list, or null if all done / empty. */
export function resumeSlug(id: CourseProgressId, orderedSlugs: string[]): string | null {
  const done = new Set(readCompleted(id));
  for (const s of orderedSlugs) {
    if (!done.has(s)) return s;
  }
  return orderedSlugs.length ? orderedSlugs[orderedSlugs.length - 1]! : null;
}

export function completionRatio(id: CourseProgressId, orderedSlugs: string[]): number {
  if (!orderedSlugs.length) return 0;
  const done = new Set(readCompleted(id));
  const n = orderedSlugs.filter((s) => done.has(s)).length;
  return n / orderedSlugs.length;
}

export function checklistStorageKey(courseId: string, moduleSlug: string, sectionKey: string): string {
  return `dv-check:${courseId}:${moduleSlug}:${sectionKey}`;
}

export function readChecklist(courseId: string, moduleSlug: string, sectionKey: string): boolean[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(checklistStorageKey(courseId, moduleSlug, sectionKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(Boolean) : [];
  } catch {
    return [];
  }
}

export function writeChecklist(
  courseId: string,
  moduleSlug: string,
  sectionKey: string,
  flags: boolean[],
): void {
  try {
    localStorage.setItem(
      checklistStorageKey(courseId, moduleSlug, sectionKey),
      JSON.stringify(flags),
    );
  } catch {
    /* ignore */
  }
}

export function readDesignPrereqOk(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DESIGN_PREREQ_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeDesignPrereqOk(ok: boolean): void {
  try {
    if (ok) localStorage.setItem(DESIGN_PREREQ_KEY, '1');
    else localStorage.removeItem(DESIGN_PREREQ_KEY);
  } catch {
    /* ignore */
  }
}

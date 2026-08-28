/**
 * Locales for the static export.
 *
 * English stays at the root (`/contact/`) and French lives under a prefix
 * (`/fr/contact/`). Next's built-in i18n routing does not work with
 * `output: "export"`, and a `[lang]` segment would have moved every English
 * URL to `/en/…` — which a static host cannot redirect away from. Root-plus-
 * prefix keeps existing links working and costs one thin route file per
 * translated page.
 *
 * Only pages listed in TRANSLATED have a French counterpart; the language
 * toggle hides itself elsewhere rather than linking to a 404.
 */
export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Root-relative paths (no locale prefix) that exist in French. */
export const TRANSLATED = ['/', '/contact/', '/ai/', '/web3/', '/forge/', '/opsec/'] as const;

/** Strip `/fr` and force a trailing slash so `/forge` matches `/forge/`. */
export function canonPath(path: string): string {
  const noHash = path.split('#')[0] ?? path;
  // Some hosts / Next versions include the Pages project basePath in the
  // client pathname. Strip it so /website-private/fr/forge/ still counts as FR.
  let p = noHash;
  if (p === '/website-private' || p.startsWith('/website-private/')) {
    p = p.slice('/website-private'.length) || '/';
  }
  let clean = p.replace(/^\/fr(?=\/|$)/, '') || '/';
  if (clean !== '/' && !clean.endsWith('/')) clean += '/';
  return clean;
}

export function isTranslated(path: string): boolean {
  const clean = canonPath(path);
  if ((TRANSLATED as readonly string[]).includes(clean)) return true;
  // My First AI Agent: lessons, glossary, and Harness Labs.
  if (clean.startsWith('/forge/course/my-first-ai-agent/')) {
    return true;
  }
  return false;
}

/** Strip the locale prefix to get the canonical (English) path. */
export function toBasePath(path: string): string {
  let p = path;
  if (p === '/website-private' || p.startsWith('/website-private/')) {
    p = p.slice('/website-private'.length) || '/';
  }
  return p.replace(/^\/fr(?=\/|$)/, '') || '/';
}

/** Build the URL for the same page in another locale. */
export function localePath(path: string, locale: Locale): string {
  const base = toBasePath(path);
  if (locale === DEFAULT_LOCALE) return base;
  return `/fr${base === '/' ? '/' : base}`;
}

/**
 * Link to the same page in `locale` when it exists, otherwise leave the path
 * alone. Use this for any cross-page link: it is what stops a French page
 * linking to /fr/something-that-was-never-translated.
 */
export function hrefFor(path: string, locale: Locale): string {
  // Deep links carry a fragment (`/ai/#agents`). Localize the path part and
  // put the fragment back, otherwise every anchored link silently falls
  // through to English.
  const hash = path.indexOf('#');
  const base = hash === -1 ? path : path.slice(0, hash);
  const frag = hash === -1 ? '' : path.slice(hash);
  return isTranslated(base) ? localePath(base, locale) + frag : path;
}

export function localeFromPath(path: string): Locale {
  let p = path;
  if (p === '/website-private' || p.startsWith('/website-private/')) {
    p = p.slice('/website-private'.length) || '/';
  }
  return p === '/fr' || p.startsWith('/fr/') ? 'fr' : 'en';
}

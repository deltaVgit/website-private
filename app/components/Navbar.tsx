'use client';

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ContentEntry } from '../data/content-index';
import { hrefFor, isTranslated, localeFromPath, localePath, type Locale } from '@/lib/i18n';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/ai/', label: 'AI' },
  { href: '/web3/', label: 'Web3' },
  { href: '/intelhub/', label: 'IntelHub' },
  { href: '/contact/', label: 'Contact' },
];

/**
 * Keep the reader in their language: on a French page, nav entries that have a
 * French version point at it. Entries that do not (IntelHub, blog, tutorials —
 * English by design) stay as they are rather than 404.
 */
function navHref(href: string, lang: Locale) {
  return isTranslated(href) ? localePath(href, lang) : href;
}

/**
 * Secondary reading only. Courses are listed on /forge/ itself, so linking
 * individual courses (or a second course index) from here just competed with
 * the page the "Forge" label already points at.
 */
const FORGE_LINKS = [
  { href: '/tutorials/', label: 'Tutorials', detail: 'Builds and walkthroughs' },
  { href: '/blog/', label: 'Blog', detail: 'Essays and field notes' },
];

/**
 * Shows only on pages that actually exist in both languages — linking to a
 * French page we have not written yet would just be a 404 with a flag on it.
 */
function LocaleToggle({
  pathname,
  // py-1.5 and tertiary, not py-1 and muted: this two-letter link was both
  // under the 24px tap-target floor and under 4.5:1 against the navbar.
  className = 'ml-1 inline-flex min-h-[24px] items-center px-2 py-1.5 text-xs font-medium uppercase tracking-[1px] text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors',
  onSelect,
}: {
  pathname: string;
  className?: string;
  onSelect?: () => void;
}) {
  if (!isTranslated(pathname)) return null;
  const current = localeFromPath(pathname);
  const other: Locale = current === 'fr' ? 'en' : 'fr';
  const label = other === 'fr' ? 'Voir en français' : 'View in English';
  return (
    <Link href={localePath(pathname, other)} hrefLang={other} className={className} aria-label={label} onClick={onSelect}>
      {other}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  const base = href.replace(/\/$/, '');
  return pathname === href || pathname === base || pathname.startsWith(`${base}/`);
}

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function SearchSuggestions({ query, visible, onSelect }: { query: string; visible: boolean; onSelect: () => void }) {
  // The index is 45 entries with titles, tags and excerpts — 17 KB that used
  // to ride along in the JavaScript of every page, for a typeahead most
  // visitors never open. It now arrives the first time the search does.
  const [index, setIndex] = useState<ContentEntry[]>([]);
  useEffect(() => {
    if (!visible || index.length) return;
    let alive = true;
    import('../data/content-index').then((m) => { if (alive) setIndex(m.contentIndex); });
    return () => { alive = false; };
  }, [visible, index.length]);

  const suggestions = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return [];
    return index
      .map((entry) => {
        const title = normalize(entry.title);
        const haystack = normalize(`${entry.title} ${entry.domain} ${entry.tags.join(' ')} ${entry.excerpt}`);
        const score = title === needle ? 100 : title.includes(needle) ? 80 : haystack.includes(needle) ? 40 : 0;
        return { entry, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
      .slice(0, 5);
  }, [query, index]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-lg)]" role="group" aria-label="Research suggestions">
      {suggestions.map(({ entry }) => (
        <Link key={entry.id} href={entry.href} onClick={onSelect} className="block px-3 py-2.5 hover:bg-[var(--bg-hover)] focus-visible:bg-[var(--bg-hover)]">
          <span className="block truncate text-sm text-[var(--text-primary)]">{entry.title}</span>
          <span className="mt-0.5 block text-[10px] uppercase tracking-[.14em] text-[var(--text-muted)]">{entry.type} · {entry.domain}</span>
        </Link>
      ))}
      <Link href={`/research/?q=${encodeURIComponent(query.trim())}`} onClick={onSelect} className="block border-t border-[var(--border-default)] px-3 py-2 text-xs text-[var(--accent-cyan)] hover:bg-[var(--bg-hover)]">
        See all research results ↗
      </Link>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [forgeOpen, setForgeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const pathname = usePathname() || '/';
  const navLang = localeFromPath(pathname);
  const router = useRouter();
  const menuId = useId();
  const forgeId = useId();
  const forgeRef = useRef<HTMLDivElement>(null);

  // Route links close the menus explicitly; this also handles browser back/forward.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMobileOpen(false); setForgeOpen(false); setSearchFocused(false); }, [pathname]);

  useEffect(() => {
      if (!forgeOpen) return;
      const close = (event: MouseEvent) => {
        // Desktop disclosure: click inside the wrapper keeps it open.
        if (forgeRef.current?.contains(event.target as Node)) return;
        // Mobile menu: Blog, Tutorials, Forge and the + toggle live outside
        // forgeRef. Closing on mousedown unmounts them before the click event
        // lands — the links became unclickable. Let any link/button click
        // through; navigation closes the menus via the pathname effect.
        if (event.target instanceof Element && event.target.closest('a, button')) return;
        setForgeOpen(false);
      };
      const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setForgeOpen(false); };
      document.addEventListener('mousedown', close);
      document.addEventListener('keydown', key);
      return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', key); };
    }, [forgeOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', key);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = previous; };
  }, [mobileOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    setSearchFocused(false);
    router.push(value ? `/research/?q=${encodeURIComponent(value)}` : '/research/');
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[var(--border-default)] bg-[var(--bg-deep)]/90 backdrop-blur-xl" aria-label="Primary">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="flex min-h-16 items-center gap-5">
          <Link href="/" className="group flex flex-shrink-0 items-center gap-2.5 text-[var(--text-primary)] transition-colors hover:text-[var(--accent-cyan)]" aria-label="Delta V - Home"><Logo size={28} priority /><span className="text-lg font-semibold tracking-[-.5px]">Delta V</span></Link>

          {/* This row carries no list semantics on purpose. It used to, but the
              Forge disclosure and the locale toggle are not listitems, so the
              list role failed aria-required-children — desktop only, since the
              row is lg:flex. The <nav aria-label> already gives the landmark,
              and the matching listitem roles came off the links with it. */}
          <div className="hidden items-center gap-0.5 lg:flex">
            {NAV_ITEMS.slice(0, 2).map((item) => <Link key={item.href} href={navHref(item.href, navLang)} aria-current={isActive(pathname, item.href) ? 'page' : undefined} className={`relative px-3 py-2 text-sm transition-colors ${isActive(pathname, item.href) ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{item.label}{isActive(pathname, item.href) && <span className="absolute -bottom-[1px] left-3 right-3 h-px bg-[var(--accent-cyan)]" aria-hidden="true" />}</Link>)}
            <div ref={forgeRef} className="relative" onMouseEnter={() => setForgeOpen(true)} onMouseLeave={() => setForgeOpen(false)} onFocus={() => setForgeOpen(true)}>
              <div className={`flex items-center ${isActive(pathname, '/forge/') ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                <Link href={navHref('/forge/', navLang)} className="relative px-3 py-2 text-sm">Forge{isActive(pathname, '/forge/') && <span className="absolute -bottom-[1px] left-3 right-3 h-px bg-[var(--accent-cyan)]" aria-hidden="true" />}</Link>
                <button type="button" aria-expanded={forgeOpen} aria-controls={forgeId} aria-label="Show Forge resources" onClick={() => setForgeOpen((value) => !value)} className="inline-flex min-h-[24px] min-w-[24px] items-center justify-center px-1 py-2 text-xs text-[var(--accent-purple)]">⌄</button>
              </div>
              {forgeOpen && <div id={forgeId} className="absolute right-0 top-full z-50 w-64 border border-[var(--border-default)] bg-[var(--surface-overlay)] p-2 shadow-[var(--shadow-lg)]" role="menu">{FORGE_LINKS.map((item) => <Link key={item.href} href={item.href} role="menuitem" className="block px-3 py-3 hover:bg-[var(--bg-hover)]" onClick={() => setForgeOpen(false)}><span className="block text-sm text-[var(--text-primary)]">{item.label}</span><span className="mt-1 block text-xs text-[var(--text-muted)]">{item.detail}</span></Link>)}</div>}
            </div>
            {NAV_ITEMS.slice(2).map((item) => <Link key={item.href} href={navHref(item.href, navLang)} aria-current={isActive(pathname, item.href) ? 'page' : undefined} className={`relative px-3 py-2 text-sm transition-colors ${isActive(pathname, item.href) ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{item.label}{isActive(pathname, item.href) && <span className="absolute -bottom-[1px] left-3 right-3 h-px bg-[var(--accent-cyan)]" aria-hidden="true" />}</Link>)}
          </div>

          {/* Preferences cluster: language, then theme, then search. These two
              are settings rather than destinations, so they sit with the search
              field on the right edge instead of trailing the nav links. */}
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <LocaleToggle pathname={pathname} className="inline-flex min-h-[24px] items-center px-1.5 py-1.5 text-xs font-medium uppercase tracking-[1px] text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors" />
            <ThemeToggle />
          </div>

          <form className="relative hidden w-44 items-center overflow-visible border-b border-[var(--border-default)] transition-colors focus-within:border-[var(--accent-cyan)] xl:w-56 md:flex" onSubmit={submitSearch} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}>
            <label htmlFor="nav-research" className="sr-only">Research</label>
            <svg className="h-4 w-4 flex-shrink-0 text-[var(--accent-cyan)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" strokeLinecap="round" /></svg>
            <input id="nav-research" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="look up" autoComplete="off" className="navbar-search-input min-w-0 w-full border-0 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none" />
            <SearchSuggestions query={query} visible={searchFocused} onSelect={() => setSearchFocused(false)} />
          </form>

          {/* ml-auto below md, where the search form (which carries it above md)
              is hidden and nothing else pushes the toggle to the right edge. */}
          <button type="button" className="ml-auto md:ml-0 p-2 text-[var(--text-primary)] lg:hidden flex-shrink-0" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls={menuId}><span className="text-xl">{mobileOpen ? '×' : '☰'}</span></button>
        </div>
      </div>

      {mobileOpen && <div id={menuId} className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-[var(--border-default)] bg-[var(--bg-deep)] lg:hidden" role="dialog" aria-modal="true"><div className="px-5 py-4">
        <form className="relative mb-4 flex items-center gap-2 border-b border-[var(--border-default)]" onSubmit={submitSearch} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}><span className="text-[var(--accent-cyan)]">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="look up" autoComplete="off" className="navbar-search-input w-full border-0 bg-transparent py-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none" /><SearchSuggestions query={query} visible={searchFocused} onSelect={() => setSearchFocused(false)} /></form>
        {NAV_ITEMS.slice(0, 2).map((item) => <Link key={item.href} href={navHref(item.href, navLang)} className="block py-3 text-[var(--text-secondary)]" onClick={() => setMobileOpen(false)}>{item.label}</Link>)}
        {/* Forge is a page, not just a disclosure. It used to be a bare toggle
            here, so /forge/ was unreachable from the mobile nav entirely. */}
        <div className="flex items-center justify-between">
          <Link href={navHref('/forge/', navLang)} className="flex-1 py-3 text-[var(--text-secondary)]" onClick={() => setMobileOpen(false)}>Forge</Link>
          <button type="button" className="px-3 py-3 text-[var(--accent-purple)]" aria-expanded={forgeOpen} aria-label="Show Forge resources" onClick={() => setForgeOpen((value) => !value)}>{forgeOpen ? '−' : '+'}</button>
        </div>
        {forgeOpen && <div className="border-l border-[var(--border-default)] pl-4">{FORGE_LINKS.map((item) => <Link key={item.href} href={item.href} className="block py-3 text-sm text-[var(--text-tertiary)]" onClick={() => setMobileOpen(false)}>{item.label}</Link>)}</div>}
        {NAV_ITEMS.slice(2).map((item) => <Link key={item.href} href={navHref(item.href, navLang)} className="block py-3 text-[var(--text-secondary)]" onClick={() => setMobileOpen(false)}>{item.label}</Link>)}
        {/* Same pair as the desktop header, in the same order. */}
        <div className="mt-2 flex items-center gap-4 border-t border-[var(--border-default)] pt-4">
          <LocaleToggle
            pathname={pathname}
            className="inline-flex min-h-[24px] items-center text-sm font-medium uppercase tracking-[1px] text-[var(--text-tertiary)]"
            onSelect={() => setMobileOpen(false)}
          />
          <ThemeToggle labelled />
        </div>
      </div></div>}
    </nav>
  );
}

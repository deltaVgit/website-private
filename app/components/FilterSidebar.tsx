'use client';

import React, { useState } from 'react';

export type FilterGroupSpec = {
  title: string;
  options: { value: string; label: string; count?: number; accent?: string }[];
  selected: string[];
  onToggle: (value: string) => void;
};

/**
 * Sticky, checkbox-based filter sidebar for listing pages (blog, tutorials).
 * Empty selection in a group = "show all" for that group. `extraToggle`
 * (optional) renders one boolean toggle — the blog pool uses it for
 * "Tutorials only".
 */
export default function FilterSidebar({
  groups,
  onClear,
  extraToggle,
}: {
  groups: FilterGroupSpec[];
  onClear?: () => void;
  extraToggle?: { label: string; checked: boolean; onToggle: () => void };
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const anySelected = groups.some((g) => g.selected.length > 0) || Boolean(extraToggle?.checked);

  return (
    <div className="listing-filter-panel lg:sticky lg:top-24">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[11px] font-semibold uppercase tracking-[2px] text-[var(--text-primary)]">
          Filters
        </span>
        <div className="flex items-center gap-3">
          <button type="button" className="lg:hidden text-xs text-[var(--accent-cyan)]" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen}>
            {mobileOpen ? 'Hide' : 'Show'}
          </button>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={!anySelected}
              className={`inline-flex items-center gap-1 text-xs transition-colors ${anySelected ? 'text-[var(--accent-cyan)] hover:underline' : 'text-[var(--text-disabled)] cursor-default'}`}
            >
              {anySelected && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className={`${mobileOpen ? 'block' : 'hidden'} lg:block space-y-7`}>
        {extraToggle && (
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)] mb-3">Type</div>
            <label className="flex items-center gap-2.5 py-1 cursor-pointer group select-none">
              <span
                className="flex items-center justify-center w-4 h-4 rounded border transition-colors flex-shrink-0"
                style={{
                  borderColor: extraToggle.checked ? 'var(--accent-cyan)' : 'var(--border-default)',
                  background: extraToggle.checked ? 'var(--accent-cyan)' : 'transparent',
                }}
              >
                {extraToggle.checked && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="var(--on-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={extraToggle.checked}
                onChange={extraToggle.onToggle}
                className="sr-only"
              />
              <span
                className={`text-sm transition-colors ${
                  extraToggle.checked
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                }`}
              >
                {extraToggle.label}
              </span>
            </label>
          </div>
        )}
        {groups.map((group) => (
          <div key={group.title}>
            <div className="text-xs font-semibold text-[var(--text-primary)] mb-3">{group.title}</div>
            <div className="space-y-1">
              {group.options.map((opt) => {
                const checked = group.selected.includes(opt.value);
                const accent = opt.accent || 'var(--accent-cyan)';
                return (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2.5 py-1 cursor-pointer group select-none"
                  >
                    <span
                      className="flex items-center justify-center w-4 h-4 rounded border transition-colors flex-shrink-0"
                      style={{
                        borderColor: checked ? accent : 'var(--border-default)',
                        background: checked ? accent : 'transparent',
                      }}
                    >
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="var(--on-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => group.onToggle(opt.value)}
                      className="sr-only"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        checked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {opt.label}
                    </span>
                    {typeof opt.count === 'number' && (
                      <span className="ml-auto text-[11px] text-[var(--text-secondary)]">{opt.count}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

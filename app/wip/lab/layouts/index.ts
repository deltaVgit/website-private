import type { LayoutDef } from '../types';
import ColumnLayout from './01-column';
import MediaGutterLayout from './02-media-gutter';
import PanelsLayout from './03-panels';
import GuidedLayout from './04-guided';
import PilotShotLayout from './05-pilot-shot';
import SpineLayout from './06-spine';
import FoldedLayout from './07-folded';
import TerminalLayout from './08-terminal';
import MagazineLayout from './09-magazine';
import DenseLayout from './10-dense';

/**
 * Ten reading models for the same thirteen lessons.
 *
 * A layout here owns the whole lesson: order, hierarchy, where visuals sit,
 * what is visible at once. The words come from `open-harness.ts` and never
 * change — everything else is the proposal.
 */
export const LAYOUTS: LayoutDef[] = [
  { n: 1, id: 'column', name: 'Single column', chrome: 'full', Component: ColumnLayout,
    blurb: "The control: linear, one right edge, nothing hidden. A richer layout that cannot beat this one is decorating." },
  { n: 2, id: 'media-gutter', name: 'Text and media facing', chrome: 'reading-only', Component: MediaGutterLayout,
    blurb: "Prose holds a narrow column; every visual lives in a gutter on the right, aligned to the section it illustrates." },
  { n: 3, id: 'panels', name: 'One section, one screen', chrome: 'reading-only', Component: PanelsLayout,
    blurb: "Each section becomes a full-height panel with snap scrolling. You advance a section at a time, the way you would a deck." },
  { n: 4, id: 'guided', name: 'Guided walkthrough', chrome: 'reading-only', Component: GuidedLayout,
    blurb: "One section visible at a time, with previous and next. The order is imposed, so nothing is skipped or lost." },
  { n: 5, id: 'pilot-shot', name: 'Pilot screenshot', chrome: 'full', Component: PilotShotLayout,
    blurb: "The section screenshot pins to the top while the instructions scroll beneath it. Built for the install lessons." },
  { n: 6, id: 'spine', name: 'Vertical spine', chrome: 'full', Component: SpineLayout,
    blurb: "A spine down the left of the text; each section is a node on it, and the visuals hang from it." },
  { n: 7, id: 'folded', name: 'Folded cards', chrome: 'full', Component: FoldedLayout,
    blurb: "Each section folds to a one-line summary. You unfold what you want to read, and the whole lesson fits one screen." },
  { n: 8, id: 'terminal', name: 'Terminal frame', chrome: 'full', Component: TerminalLayout,
    blurb: "Commands and actions form the structure; the prose becomes annotation in the margin." },
  { n: 9, id: 'magazine', name: 'Magazine', chrome: 'reading-only', Component: MagazineLayout,
    blurb: "Asymmetric grid, full-bleed plates, drop caps, margin notes. The bet that long reading deserves an editorial layout." },
  { n: 10, id: 'dense', name: 'Dense, reference mode', chrome: 'full', Component: DenseLayout,
    blurb: "Two text columns, reduced type, maximum density. For someone returning to look something up, not for a first read." },
];

export const DEFAULT_LAYOUT = LAYOUTS[0].id;
export const byId = (id?: string | null): LayoutDef => LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];

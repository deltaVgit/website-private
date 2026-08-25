import type { CourseModule } from '@/app/data/courses/open-harness';
import { PROVIDERS, providerSrc, iconSrc, providersIn, headingIcon, type ProviderId } from './assets';

/**
 * A Lucide glyph, painted in `currentColor` through a CSS mask.
 *
 * Masking rather than `<img>` is what makes it theme-correct: the shape takes
 * the colour of whatever text it sits next to, in light and dark alike, and a
 * layout can tint it simply by setting `color` on the parent.
 */
export function Glyph({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={`kit-glyph${className ? ` ${className}` : ''}`}
      style={{ maskImage: `url("${iconSrc(name)}")`, WebkitMaskImage: `url("${iconSrc(name)}")` }}
      aria-hidden
    />
  );
}

/** The glyph a heading earns, or nothing at all when it earns none. */
export function HeadingGlyph({ heading, className }: { heading: string; className?: string }) {
  const name = headingIcon(heading);
  return name ? <Glyph name={name} className={className} /> : null;
}

/**
 * A provider mark. Masked when the source is `currentColor`, imaged when the
 * source carries brand colour — see the `Tone` note in assets.ts.
 */
export function ProviderMark({ id, size = 18 }: { id: ProviderId; size?: number }) {
  const { label, tone } = PROVIDERS[id];
  const src = providerSrc(id);
  if (tone === 'mask') {
    return (
      <span
        className="kit-mark kit-mark-masked"
        style={{ width: size, height: size, maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }}
        aria-hidden
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="kit-mark" src={src} alt="" width={size} height={size} loading="lazy" />;
}

/**
 * The providers this lesson actually names.
 *
 * Renders nothing when the lesson names none — which is the honest outcome for
 * the conceptual modules, and the reason this is safe to drop into all ten
 * layouts without checking each one by hand.
 */
export function ProviderStrip({
  module: mod,
  label = 'In this lesson',
  size = 18,
}: {
  module: CourseModule;
  label?: string;
  size?: number;
}) {
  const ids = providersIn(mod);
  if (!ids.length) return null;
  return (
    <div className="kit-strip">
      <span className="kit-strip-label">{label}</span>
      <ul>
        {ids.map((id) => (
          <li key={id}>
            <ProviderMark id={id} size={size} />
            <span>{PROVIDERS[id].label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

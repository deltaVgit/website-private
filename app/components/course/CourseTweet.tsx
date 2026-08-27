import { withBasePath } from '@/lib/site';

/**
 * A cited post from X, shown as a local still — never a live iframe.
 *
 * X's embed endpoint blanks out under our CSP (no widgets.js), in privacy
 * browsers, and whenever X rate-limits anonymous frames. A still we host is
 * the receipt; the original URL is the citation. Do not re-host the video:
 * if the post is a video, the still is a poster and the click goes to X.
 */
export function CourseTweet({
  author,
  href,
  caption,
  poster,
  posterWidth,
  posterHeight,
  hasVideo = false,
}: {
  author: string;
  href: string;
  caption?: React.ReactNode;
  /** Site-root path under `public/` (e.g. `/courses/open-harness/citations/id.jpg`). */
  poster?: string;
  posterWidth?: number;
  posterHeight?: number;
  hasVideo?: boolean;
}) {
  const src = poster ? withBasePath(poster) : undefined;

  return (
    <figure className="course-tweet">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="course-tweet-card"
      >
        {src ? (
          <span className="course-tweet-still">
            <img
              src={src}
              alt=""
              width={posterWidth}
              height={posterHeight}
              loading="lazy"
              decoding="async"
            />
            {hasVideo ? (
              <span className="course-tweet-play" aria-hidden>
                ▶
              </span>
            ) : null}
          </span>
        ) : (
          <span className="course-tweet-body">
            <span className="course-tweet-author">{author}</span>
            {caption ? <span className="course-tweet-excerpt">{caption}</span> : null}
          </span>
        )}
        <span className="course-tweet-open">
          Open on X <span aria-hidden>↗</span>
        </span>
      </a>
      <figcaption className="course-tweet-cite">
        {caption && src ? <span>{caption} </span> : null}
        <a href={href} target="_blank" rel="noopener noreferrer">
          {author} on X <span aria-hidden>↗</span>
        </a>
        <span> — local still; original stays on X.</span>
      </figcaption>
    </figure>
  );
}

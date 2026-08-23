export default function BlogFigure({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption: string;
}) {
  return (
    <figure className="my-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
      <div className="max-w-full overflow-x-auto">{children}</div>
      <figcaption className="pt-3 font-mono text-xs text-[var(--text-muted)]">{caption}</figcaption>
    </figure>
  );
}

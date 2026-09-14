export function SectionHeader({
  id,
  title,
  meta,
  action,
}: {
  id?: string;
  title: string;
  meta?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div id={id} className="mb-4 flex scroll-mt-24 items-baseline justify-between">
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
        {meta && <span className="text-xs text-muted">{meta}</span>}
      </div>
      {action && (
        <a
          href={action.href}
          className="whitespace-nowrap text-xs text-muted transition-colors hover:text-foreground"
        >
          {action.label} →
        </a>
      )}
    </div>
  );
}

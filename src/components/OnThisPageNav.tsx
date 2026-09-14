const sections = [
  { id: "favorites", label: "Favorites" },
  { id: "next-to-binge", label: "Next to Binge" },
  { id: "comments", label: "Comments" },
  { id: "lists", label: "Lists" },
];

export function OnThisPageNav() {
  return (
    <nav className="sticky top-8 hidden w-40 shrink-0 lg:block">
      <p className="mb-3 text-[11px] font-medium tracking-wide text-muted uppercase">
        On this page
      </p>
      <ul className="space-y-2.5 border-l border-border pl-3.5 text-sm">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-muted transition-colors hover:text-foreground"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

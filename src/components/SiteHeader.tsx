import Link from "next/link";

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-[17px] font-semibold tracking-tight">
          Synqo
        </Link>
        <div className="flex items-center gap-3">{right}</div>
      </div>
    </header>
  );
}

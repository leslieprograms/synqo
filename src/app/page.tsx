import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TasteProfile } from "@/components/TasteProfile";
import { getProfile, getProfileItems } from "@/lib/seed-data";
import { resolveCoverUrls } from "@/lib/media-api/resolve-cover";
import { getCurrentUserProfile } from "@/lib/current-profile";

const steps = [
  {
    number: "1",
    title: "Pick the six you'd show first",
    body: "No algorithm suggestions. Search your own canon across movies, shows, and games.",
  },
  {
    number: "2",
    title: "Add things as you go",
    body: "Your page updates itself — favorites, comments, and lists, without any extra upkeep. Rating is optional.",
  },
  {
    number: "3",
    title: "Drop the link anywhere",
    body: "One quiet page that says who you are, in about the time it takes to read a text.",
  },
];

export default async function Home() {
  const example = getProfile("keanu")!;
  const coverUrls = await resolveCoverUrls(getProfileItems(example));

  const { user, profile } = await getCurrentUserProfile();
  const primaryHref = !user ? "/login" : profile?.onboarding_completed_at ? `/${profile.handle}` : "/onboarding";
  const primaryLabel = !user
    ? "Claim your handle"
    : profile?.onboarding_completed_at
      ? "Go to your page"
      : "Finish setting up";

  return (
    <>
      <SiteHeader
        right={
          <>
            <a
              href="#example"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              View an example
            </a>
            {!user && (
              <Link
                href="/login"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Log in
              </Link>
            )}
            <Link
              href={primaryHref}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {primaryLabel}
            </Link>
          </>
        }
      />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            One page for everything you watch and play.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-foreground/80 text-balance">
            Skip the long-winded reviews and scattered lists. Put your movies, TV shows, and games in one spot, 
            drop the link in your group chat, and settle what to watch in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={primaryHref}
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {primaryLabel}
            </Link>
            <a
              href="#example"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              See a real page first ↓
            </a>
          </div>
        </section>

        {/* Live example */}
        <section id="example" className="scroll-mt-16 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              A real Synqo page
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              This is what it looks like when it&rsquo;s done.
            </h2>
          </div>
          <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
              <TasteProfile profile={example} coverUrls={coverUrls} />
            </div>
            <p className="mt-4 text-center text-sm text-muted">
              Nothing staged for this screenshot.{" "}
              <Link href="/keanu" className="text-foreground underline underline-offset-2">
                Open {example.displayName}&rsquo;s full page →
              </Link>
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-sm text-muted">
                    {step.number}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

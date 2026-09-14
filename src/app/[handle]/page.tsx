import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TasteProfile } from "@/components/TasteProfile";
import { getProfile, getProfileItems, profiles } from "@/lib/seed-data";
import { resolveCoverUrls } from "@/lib/media-api/resolve-cover";
import { getRealProfileByHandle } from "@/lib/profile-data";
import { getCurrentUserProfile } from "@/lib/current-profile";
import { signOut } from "@/app/actions";

export function generateStaticParams() {
  return profiles.map((profile) => ({ handle: profile.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const seedProfile = getProfile(handle);
  if (seedProfile) {
    return {
      title: `${seedProfile.displayName} (@${seedProfile.handle}) — Synqo`,
      description: seedProfile.bio,
    };
  }

  const real = await getRealProfileByHandle(handle);
  if (!real) return { title: "Synqo" };
  return {
    title: `${real.profile.displayName} (@${real.profile.handle}) — Synqo`,
    description: real.profile.bio,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const seedProfile = getProfile(handle);
  const real = seedProfile ? null : await getRealProfileByHandle(handle);

  if (!seedProfile && !real) notFound();

  const data = seedProfile
    ? {
        profile: seedProfile,
        itemsById: undefined,
        coverUrls: await resolveCoverUrls(getProfileItems(seedProfile)),
      }
    : { profile: real!.profile, itemsById: real!.itemsById, coverUrls: real!.coverUrls };

  const { user } = real ? await getCurrentUserProfile() : { user: null };
  const isOwner = real != null && user?.id === real.userId;

  return (
    <>
      <SiteHeader
        right={
          isOwner ? (
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get your own Synqo page
            </Link>
          )
        }
      />
      <main className="flex-1">
        <TasteProfile
          profile={data.profile}
          coverUrls={data.coverUrls}
          itemsById={data.itemsById}
          isOwner={isOwner}
        />
      </main>
      <SiteFooter />
    </>
  );
}

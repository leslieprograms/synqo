import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/current-profile";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OnboardingFlow } from "./OnboardingFlow";

export default async function OnboardingPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/login");
  if (profile?.onboarding_completed_at) redirect(`/${profile.handle}`);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-16 sm:px-6 sm:py-20">
        <OnboardingFlow
          initialStep={profile ? 2 : 1}
          initialDisplayName={profile?.display_name ?? ""}
          initialHandle={profile?.handle ?? ""}
        />
      </main>
      <SiteFooter />
    </>
  );
}

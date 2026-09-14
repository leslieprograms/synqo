import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/current-profile";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (user && profile?.onboarding_completed_at) redirect(`/${profile.handle}`);
  if (user) redirect("/onboarding");

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <LoginForm />
      </main>
      <SiteFooter />
    </>
  );
}

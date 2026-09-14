import { Link2 } from "lucide-react";
import { avatarColorForSeed } from "@/lib/color";
import { Profile } from "@/lib/types";
import { FollowButton } from "./FollowButton";
import { ShareButton } from "./ShareButton";

export function ProfileHeader({ profile }: { profile: Profile }) {
  const initial = profile.displayName.charAt(0).toUpperCase();
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white sm:h-[72px] sm:w-[72px]"
          style={{ backgroundColor: avatarColorForSeed(profile.avatarSeed) }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[26px]">
            {profile.displayName}
          </h1>
          <p className="text-sm text-muted">@{profile.handle}</p>
          <p className="mt-2 max-w-md text-[15px] leading-snug text-foreground/85">
            {profile.bio}
          </p>
          {profile.socialUrl && (
            <a
              href={`https://${profile.socialUrl}`}
              className="mt-2.5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              <Link2 size={13} strokeWidth={1.5} />
              {profile.socialUrl}
            </a>
          )}
        </div>
      </div>
      <div className="flex gap-2.5 pl-20 sm:pl-0 sm:pt-1">
        <ShareButton
          title={`${profile.displayName} on Synqo`}
          text={`${profile.displayName}'s taste in movies, TV, and games.`}
        />
        <FollowButton />
      </div>
    </div>
  );
}

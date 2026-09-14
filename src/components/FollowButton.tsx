"use client";

import { useState } from "react";

export function FollowButton() {
  const [following, setFollowing] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFollowing((f) => !f)}
      className={
        following
          ? "rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground"
          : "rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      }
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

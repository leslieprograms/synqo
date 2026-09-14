"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

/**
 * On a phone, the Web Share API opens the OS share sheet — Messages
 * included — so "text someone your page" is a tap away. Desktop
 * browsers mostly don't support it, so there we just copy the link;
 * pasting it into iMessage/whatever texting app is one paste away.
 */
export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Cancelled or blocked — no error state needed, nothing changed.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — quietly do nothing further.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground"
    >
      {copied ? <Check size={14} strokeWidth={1.5} /> : <Share2 size={14} strokeWidth={1.5} />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

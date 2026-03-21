"use client";

import { useCallback, useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import type { Position } from "@/lib/api";
import { buildPnlShareImageUrl, getShareOrigin } from "@/lib/pnl-share";

type PnlShareButtonProps = {
  position: Position;
  marketTitle?: string;
  className?: string;
  label?: string;
};

export function PnlShareButton({
  position,
  marketTitle,
  className = "",
  label = "Share card",
}: PnlShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const imageUrl = buildPnlShareImageUrl(getShareOrigin(), {
    position,
    marketTitle,
  });

  const openImage = useCallback(() => {
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  }, [imageUrl]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      openImage();
    }
  }, [imageUrl, openImage]);

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={openImage}
        title="Open share image (save or post)"
        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg border border-white/15 text-foreground/90 hover:bg-white/5 transition-colors"
      >
        <Share2 className="w-3 h-3" />
        {label}
      </button>
      <button
        type="button"
        onClick={copyLink}
        title="Copy image link"
        className="flex items-center justify-center p-1.5 rounded-lg border border-white/15 text-muted hover:text-foreground hover:bg-white/5 transition-colors"
        aria-label="Copy share link"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Link2 className="w-3 h-3 opacity-60" />}
      </button>
    </div>
  );
}

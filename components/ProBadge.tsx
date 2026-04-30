"use client";

import { Crown } from "lucide-react";

interface ProBadgeProps {
  size?: "sm" | "md";
}

export function ProBadge({ size = "sm" }: ProBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-bold tracking-wide bg-gradient-to-r from-amber-400 to-orange-400 text-white ${
        size === "sm"
          ? "text-[9px] px-1.5 py-0.5"
          : "text-[11px] px-2 py-1"
      }`}
    >
      <Crown className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      PRO
    </span>
  );
}

"use client";

import { Crown, Zap } from "lucide-react";
import { UserPlan } from "@/types";

interface PlanBadgeProps {
  size?: "sm" | "md";
  plan?: UserPlan;
}

export function PlanBadge({ size = "sm", plan = "free" }: PlanBadgeProps) {
  if (plan === "pro") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold tracking-wide bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm ${
          size === "sm" ? "text-[10px] px-2 py-0.5" : "text-[12px] px-2.5 py-1"
        }`}
      >
        <Crown className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        PRO
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold tracking-wide bg-zinc-200 text-zinc-600 ${
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-[12px] px-2.5 py-1"
      }`}
    >
      <Zap className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      FREE
    </span>
  );
}

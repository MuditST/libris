"use client";

import React from "react";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingIndicatorProps = {
  text?: string;
  size?: "small" | "medium" | "large";
  className?: string;
};

export default function LoadingIndicator({
  text = "",
  size = "medium",
  className = "",
}: LoadingIndicatorProps) {
  const sizes = {
    small: 16,
    medium: 24,
    large: 40,
  };

  const iconSize = sizes[size];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 size={iconSize} className="animate-spin text-primary mr-3" />
      {text && (
        <span className="font-mono uppercase text-sm tracking-wide text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  );
}

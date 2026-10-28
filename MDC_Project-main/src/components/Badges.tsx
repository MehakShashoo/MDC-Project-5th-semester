import React from "react";
import { EmotionType, SentimentType, EMOTION_METADATA, SENTIMENT_METADATA } from "../types";
import { AlertTriangle } from "lucide-react";

export const EmotionBadge: React.FC<{ emotion: EmotionType; size?: "sm" | "md" }> = ({
  emotion,
  size = "md"
}) => {
  const meta = EMOTION_METADATA[emotion] || {
    label: emotion,
    emoji: "💬",
    bgClass: "bg-slate-500/15",
    textClass: "text-slate-400"
  };

  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        isSmall ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${meta.bgClass} ${meta.textClass} border border-current/20`}
    >
      <span>{meta.emoji}</span>
      <span className="capitalize">{meta.label}</span>
    </span>
  );
};

export const SentimentBadge: React.FC<{
  sentiment: SentimentType;
  score?: number;
  size?: "sm" | "md";
}> = ({ sentiment, score, size = "md" }) => {
  const meta = SENTIMENT_METADATA[sentiment] || {
    label: sentiment,
    bgClass: "bg-slate-500/15",
    textClass: "text-slate-400"
  };

  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        isSmall ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${meta.bgClass} ${meta.textClass} border border-current/20`}
    >
      <span className="capitalize">{meta.label}</span>
      {score !== undefined && (
        <span className="opacity-80 text-[10px] font-mono ml-0.5">
          ({score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)})
        </span>
      )}
    </span>
  );
};

export const MismatchBadge: React.FC<{ tooltip?: boolean }> = ({ tooltip = false }) => {
  return (
    <span
      title={
        tooltip
          ? "Mismatch: Star rating and review text sentiment disagree (e.g. 5 stars with negative text, or 1 star with positive text)"
          : undefined
      }
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse"
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      <span>⚠ Mismatch</span>
    </span>
  );
};

export const IssueBadge: React.FC<{ category: string }> = ({ category }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
      {category}
    </span>
  );
};

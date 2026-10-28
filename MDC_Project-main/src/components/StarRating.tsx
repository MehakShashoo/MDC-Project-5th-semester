import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: "Very poor",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent"
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = "md",
  showLabel = false
}) => {
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  const activeVal = hoverVal !== null ? hoverVal : value;

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-8 h-8"
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1" onMouseLeave={() => !readOnly && setHoverVal(null)}>
        {[1, 2, 3, 4, 5].map(star => {
          const isFilled = star <= activeVal;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverVal(star)}
              className={`transition-all duration-150 ${
                readOnly
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-120 active:scale-95 focus:outline-none"
              }`}
              aria-label={`${star} Star`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "text-slate-300 dark:text-slate-600"
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 min-w-[70px]">
          {activeVal > 0 ? `${activeVal} • ${RATING_LABELS[activeVal]}` : "Select rating"}
        </span>
      )}
    </div>
  );
};

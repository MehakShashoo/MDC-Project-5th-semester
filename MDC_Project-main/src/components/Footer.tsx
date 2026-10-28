import React from "react";
import { Info, ShieldCheck, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A2E]/60 text-slate-500 dark:text-slate-400 text-xs py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Honesty disclaimer box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Honesty & Model Attribution Disclosure
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The 6-class emotion classifier is a 2-layer SimpleRNN trained on the general{" "}
              <code className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">dair-ai/emotion</code>{" "}
              benchmark dataset (not product reviews). Sentiment classification (Positive, Negative, Neutral) is computed
              by an independent rule-based VADER engine using normalized valence compound scoring, not from the emotion model.
              Issue grouping uses keyword-based heuristics. The customer&apos;s star rating is preserved independently and is never overridden by AI.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>EmotiLens Feedback Intelligence • SimpleRNN + VADER</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision & transparency</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

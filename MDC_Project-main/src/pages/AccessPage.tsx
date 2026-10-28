import React from "react";
import { ArrowRight, BriefcaseBusiness, MessageSquareText, Sparkles } from "lucide-react";

interface AccessPageProps {
  onSelectRole: (role: "customer" | "employee") => void;
}

export const AccessPage: React.FC<AccessPageProps> = ({ onSelectRole }) => {
  return (
    <main className="max-w-5xl mx-auto py-10 sm:py-16 px-4">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          EmotiLens Feedback Intelligence
        </div>
        <h1 className="mt-5 text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
          How would you like to continue?
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Choose a view to explore EmotiLens.
        </p>
      </div>

      <div role="note" className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm text-center">
        Demo mode: these options switch views only; they do not authenticate users or protect data.
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <button
          onClick={() => onSelectRole("customer")}
          className="group text-left p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-lg hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-1 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">For customers</p>
          <h2 className="mt-2 text-2xl font-heading font-bold text-slate-900 dark:text-white">Send feedback</h2>
          <p className="mt-2 min-h-12 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Tell us about your experience. No account is needed to leave a review.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Continue to feedback <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>

        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <BriefcaseBusiness className="w-6 h-6" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-wider font-bold text-violet-600 dark:text-violet-400">For employees</p>
          <h2 className="mt-2 text-2xl font-heading font-bold text-slate-900 dark:text-white">Company workspace</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Explore product analytics, feedback trends, and customer reviews.
          </p>

          <p className="mt-2 min-h-12 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Explore the analytics dashboard, review trends, and product insights.
          </p>
          <button
            onClick={() => onSelectRole("employee")}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            Open employee dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>
    </main>
  );
};

import React, { useEffect, useState } from "react";
import { Product } from "../types";
import { StarRating } from "../components/StarRating";
import { EmotionBadge } from "../components/Badges";
import {
  MessageSquarePlus,
  BarChart3,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { NavTab } from "../components/Navbar";
import { apiFetch } from "../lib/api";

interface HomePageProps {
  onNavigate: (tab: NavTab, params?: { productId?: number }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load products", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 sm:p-14 text-white shadow-2xl border border-indigo-500/20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI Product Feedback Intelligence
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight leading-tight">
            Turn customer feedback into{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
              product insight
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Star ratings alone don&apos;t reveal <em>why</em> customers churn or cheer.
            EmotiLens couples a 6-class SimpleRNN emotion neural model with VADER sentiment analysis
            to convert unstructured written reviews into structured, real-time product intelligence.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate("feedback")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:translate-y-[-2px] active:translate-y-0 cursor-pointer"
            >
              <MessageSquarePlus className="w-5 h-5" />
              <span>Leave Feedback</span>
            </button>

            <button
              onClick={() => onNavigate("dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 font-semibold shadow-sm transition-all hover:translate-y-[-2px] active:translate-y-0 cursor-pointer backdrop-blur-sm"
            >
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>View Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Strip */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            End-To-End Architecture
          </h2>
          <p className="text-xl font-heading font-bold text-slate-900 dark:text-white">
            How Raw Feedback Becomes Actionable Intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              title: "Customer Review",
              desc: "1–5 star rating paired with organic qualitative review text.",
              icon: <MessageSquarePlus className="w-5 h-5 text-indigo-500" />
            },
            {
              step: "02",
              title: "Text Preprocessing",
              desc: "URL stripping, regex tokenization, custom vocab mapping & length-50 padding.",
              icon: <Cpu className="w-5 h-5 text-violet-500" />
            },
            {
              step: "03",
              title: "SimpleRNN + VADER",
              desc: "Dual inference: 6-class neural emotion distribution + valence compound score.",
              icon: <Sparkles className="w-5 h-5 text-cyan-500" />
            },
            {
              step: "04",
              title: "Executive Insights",
              desc: "Mismatch alerts, recurring complaint detection & interactive KPIs.",
              icon: <TrendingUp className="w-5 h-5 text-emerald-500" />
            }
          ].map(item => (
            <div
              key={item.step}
              className="relative p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-600">
                  {item.step}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base mb-1">
                {item.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Seeded Products Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
              Monitored Products
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Live feedback statistics across hardware and software product lines
            </p>
          </div>
          <button
            onClick={() => onNavigate("feedback")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
          >
            <span>Submit new review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map(prod => (
              <div
                key={prod.id}
                className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all hover:translate-y-[-4px] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 group-hover:scale-110 transition-transform">
                      {prod.emoji}
                    </span>
                    {prod.top_emotion && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                          Top Emotion
                        </span>
                        <EmotionBadge emotion={prod.top_emotion.toLowerCase() as any} size="sm" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {prod.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {prod.description}
                  </p>

                  <div className="flex items-center justify-between py-3 border-y border-slate-100 dark:border-slate-800/60 mb-5 text-sm">
                    <div className="flex items-center gap-1.5">
                      <StarRating value={Math.round(prod.avg_rating || 0)} readOnly size="sm" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {prod.avg_rating || "0.0"}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                      {prod.review_count} review{prod.review_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigate("feedback", { productId: prod.id })}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Give Feedback</span>
                  </button>

                  <button
                    onClick={() => onNavigate("dashboard", { productId: prod.id })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Analytics</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

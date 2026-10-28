import React, { useEffect, useState, useMemo } from "react";
import {
  Product,
  SummaryAnalytics,
  EmotionItem,
  RatingItem,
  TrendItem,
  IssueItem,
  EmotionRatingMatrixData,
  Feedback,
  EMOTION_METADATA,
  SENTIMENT_METADATA,
  EmotionType
} from "../types";
import { EmotionBadge, SentimentBadge, MismatchBadge } from "../components/Badges";
import { StarRating } from "../components/StarRating";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { NavTab } from "../components/Navbar";
import { apiFetch } from "../lib/api";

interface DashboardPageProps {
  initialProductId?: number;
  onNavigate: (tab: NavTab, params?: { productId?: number }) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ initialProductId, onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(initialProductId || 0); // 0 = All
  const [selectedDays, setSelectedDays] = useState<number>(0); // 0 = All time
  const [loading, setLoading] = useState<boolean>(true);

  const [summary, setSummary] = useState<SummaryAnalytics | null>(null);
  const [emotionsData, setEmotionsData] = useState<EmotionItem[]>([]);
  const [ratingsData, setRatingsData] = useState<RatingItem[]>([]);
  const [trendsData, setTrendsData] = useState<TrendItem[]>([]);
  const [issuesData, setIssuesData] = useState<IssueItem[]>([]);
  const [matrixData, setMatrixData] = useState<EmotionRatingMatrixData | null>(null);
  const [recentReviews, setRecentReviews] = useState<Feedback[]>([]);

  // Fetch products
  useEffect(() => {
    apiFetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const loadAllAnalytics = async () => {
    setLoading(true);
    const pParam = selectedProductId > 0 ? `product_id=${selectedProductId}` : "";
    const dParam = selectedDays > 0 ? `days=${selectedDays}` : "";
    const query = [pParam, dParam].filter(Boolean).join("&");
    const qStr = query ? `?${query}` : "";

    try {
      const [sumRes, emoRes, ratRes, treRes, issRes, matRes, recRes] = await Promise.all([
        apiFetch(`/api/analytics/summary${qStr}`).then(r => r.json()),
        apiFetch(`/api/analytics/emotions${qStr}`).then(r => r.json()),
        apiFetch(`/api/analytics/ratings${qStr}`).then(r => r.json()),
        apiFetch(`/api/analytics/trends${qStr}`).then(r => r.json()),
        apiFetch(`/api/analytics/issues${qStr}`).then(r => r.json()),
        apiFetch(`/api/analytics/emotion-rating-matrix${qStr}`).then(r => r.json()),
        apiFetch(`/api/feedback${qStr ? qStr + "&page_size=5" : "?page_size=5"}`).then(r => r.json())
      ]);

      setSummary(sumRes);
      setEmotionsData(emoRes.emotions || []);
      setRatingsData(ratRes.ratings || []);
      setTrendsData(treRes.trends || []);
      setIssuesData(issRes.issues || []);
      setMatrixData(matRes);
      setRecentReviews(recRes.items || []);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [selectedProductId, selectedDays]);

  // Selected product metadata
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Maximum value for heatmap scaling
  const maxMatrixVal = useMemo(() => {
    if (!matrixData) return 1;
    let max = 1;
    for (const em of matrixData.emotions) {
      for (const st of matrixData.stars) {
        const val = matrixData.matrix[em]?.[st] || 0;
        if (val > max) max = val;
      }
    }
    return max;
  }, [matrixData]);

  return (
    <div className="space-y-8 py-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Product Selector */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Filter Product Scope
            </span>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(Number(e.target.value))}
              className="font-heading font-semibold text-base text-slate-900 dark:text-white bg-transparent border-none focus:outline-none cursor-pointer pr-4"
            >
              <option value={0} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                🌐 All Monitored Products (Aggregated)
              </option>
              {products.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Chips & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date:
          </span>
          {[
            { label: "Last 7 Days", days: 7 },
            { label: "30 Days", days: 30 },
            { label: "90 Days", days: 90 },
            { label: "All Time", days: 0 }
          ].map(chip => (
            <button
              key={chip.days}
              onClick={() => setSelectedDays(chip.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedDays === chip.days
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {chip.label}
            </button>
          ))}

          <button
            onClick={loadAllAnalytics}
            aria-label="Refresh data"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 ml-1 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Dynamic Rule-based Insight Summary Banner (Section 2 Extra 13 & Section 4) */}
      {summary && (
        <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Synthesized Executive Intelligence
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                  Rule-based Engine
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                {summary.insight_text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Row (6 Cards + Mismatch metric) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* KPI 1: Avg Rating */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Rating</span>
            <span className="text-amber-400">★</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
              {summary?.kpis.avg_rating.toFixed(1) || "0.0"}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center">
            <StarRating value={Math.round(summary?.kpis.avg_rating || 0)} readOnly size="sm" />
          </div>
        </div>

        {/* KPI 2: Total Reviews */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Reviews</span>
            <BarChart3 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {summary?.kpis.total_reviews || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Across {selectedProduct ? selectedProduct.name : "all 3 products"}
          </p>
        </div>

        {/* KPI 3: Positive Sentiment */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">% Positive</span>
            <Smile className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-500">
            {summary?.kpis.percent_positive || 0}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary?.kpis.percent_positive || 0}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Negative Sentiment */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">% Negative</span>
            <Frown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-rose-500">
            {summary?.kpis.percent_negative || 0}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary?.kpis.percent_negative || 0}%` }}
            />
          </div>
        </div>

        {/* KPI 5: Neutral Sentiment */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">% Neutral</span>
            <Meh className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-500 dark:text-slate-300">
            {summary?.kpis.percent_neutral || 0}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-slate-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary?.kpis.percent_neutral || 0}%` }}
            />
          </div>
        </div>

        {/* KPI 6: Top Emotion & Mismatch */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Emotion</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold text-indigo-600 dark:text-indigo-400 capitalize truncate">
            {summary?.kpis.top_emotion || "Joy"}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px]">Mismatches:</span>
            <span className="font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
              {summary?.kpis.mismatch_count || 0} flagged
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid - 6 Key Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Emotion Distribution Doughnut */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Emotion Distribution
              </h3>
              <p className="text-xs text-slate-400">SimpleRNN 6-class neural classification split</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
              {emotionsData.reduce((s, e) => s + e.count, 0)} Total
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {emotionsData.map(item => {
              const meta = EMOTION_METADATA[item.emotion] || {
                label: item.emotion,
                emoji: "💬",
                color: "#6366F1"
              };
              return (
                <div key={item.emotion} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                      <span>{meta.emoji}</span>
                      <span className="capitalize">{meta.label}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">{item.count} revs</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 min-w-[45px] text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: meta.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Sentiment Split & Rating Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Customer Star Rating Distribution
              </h3>
              <p className="text-xs text-slate-400">Direct rating submitted by customer (1 to 5 stars)</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[...ratingsData].reverse().map(item => (
              <div key={item.star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-slate-600 dark:text-slate-300 flex items-center gap-0.5 shrink-0">
                  <span>{item.star}</span>
                  <span className="text-amber-400">★</span>
                </span>

                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 w-20 justify-end font-mono">
                  <span className="text-slate-400">{item.count}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mini Sentiment Summary Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                VADER Sentiment Ratio:
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-500 font-semibold">
                  +{summary?.kpis.percent_positive || 0}% Pos
                </span>
                <span className="text-slate-400">
                  {summary?.kpis.percent_neutral || 0}% Neu
                </span>
                <span className="text-rose-500 font-semibold">
                  -{summary?.kpis.percent_negative || 0}% Neg
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${summary?.kpis.percent_positive || 0}%` }}
              />
              <div
                className="bg-slate-400 h-full transition-all duration-500"
                style={{ width: `${summary?.kpis.percent_neutral || 0}%` }}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${summary?.kpis.percent_negative || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chart 3: Trends Over Time */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Satisfaction & Volume Trends
              </h3>
              <p className="text-xs text-slate-400">Daily average star rating and positive/negative sentiment volume</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {trendsData.length} timeline points
            </span>
          </div>

          {trendsData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No trend points in range</div>
          ) : (
            <div className="space-y-2 pt-2">
              <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-1 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                {trendsData.slice(-18).map((t, idx) => {
                  const ratingHeight = (t.avg_rating / 5.0) * 100;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 min-w-[20px] group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-1.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                        {t.date}: ★{t.avg_rating} ({t.positive_count} pos, {t.negative_count} neg)
                      </div>

                      {/* Stacked Sentiment Volume Bar */}
                      <div className="w-full flex flex-col justify-end h-28 rounded-t bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                        {t.positive_count > 0 && (
                          <div
                            className="w-full bg-emerald-500/80 transition-all"
                            style={{ height: `${Math.min(t.positive_count * 20, 50)}%` }}
                          />
                        )}
                        {t.negative_count > 0 && (
                          <div
                            className="w-full bg-rose-500/80 transition-all"
                            style={{ height: `${Math.min(t.negative_count * 20, 50)}%` }}
                          />
                        )}
                      </div>

                      {/* Average Rating Dot */}
                      <div
                        className="w-2 h-2 rounded-full bg-amber-400 shadow-sm"
                        title={`Avg: ${t.avg_rating}`}
                      />

                      <span className="text-[9px] text-slate-400 truncate max-w-[28px]">
                        {t.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Avg Rating</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-emerald-500" />
                    <span>Positive</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-rose-500" />
                    <span>Negative</span>
                  </span>
                </div>
                <span>Chronological Timeline</span>
              </div>
            </div>
          )}
        </div>

        {/* Chart 4: Top Recurring Issues (Keyword-based) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Top Recurring Issues
              </h3>
              <p className="text-xs text-slate-400">
                Keyword-based issue detection in negative / low-rated reviews (≤2★)
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-semibold">
              Pain Points
            </span>
          </div>

          {issuesData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <span>No critical recurring issue clusters found in this filter range!</span>
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              {issuesData.map(item => {
                const maxIssueCount = issuesData[0]?.count || 1;
                const pct = Math.round((item.count / maxIssueCount) * 100);
                return (
                  <div key={item.category} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.category}
                      </span>
                      <span className="font-mono text-rose-500 font-bold">
                        {item.count} mention{item.count !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Example Snippet */}
                    {item.snippets.length > 0 && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1 group-hover:line-clamp-none transition-all pl-2 border-l-2 border-rose-500/30">
                        &ldquo;{item.snippets[0]}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chart 5: Emotion x Rating Heatmap Matrix (Section 2 Extra 12) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Emotion × Rating Cross-Tabulation Matrix</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-normal">
                6×5 Heatmap
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Correlation grid showing review counts for each emotion across 1 to 5 star levels
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Low</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-indigo-500/10" />
              <span className="w-4 h-4 rounded bg-indigo-500/30" />
              <span className="w-4 h-4 rounded bg-indigo-500/60" />
              <span className="w-4 h-4 rounded bg-indigo-600 text-white" />
            </div>
            <span>High Density</span>
          </div>
        </div>

        {matrixData && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Detected Emotion</th>
                  {matrixData.stars.map(s => (
                    <th key={s} className="py-2.5 px-3 text-center">
                      {s} Star{s > 1 ? "s" : ""}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right">Row Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {matrixData.emotions.map(em => {
                  const meta = EMOTION_METADATA[em];
                  const rowTotal = matrixData.stars.reduce(
                    (acc, s) => acc + (matrixData.matrix[em]?.[s] || 0),
                    0
                  );

                  return (
                    <tr key={em} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="text-lg">{meta.emoji}</span>
                        <span className="capitalize">{meta.label}</span>
                      </td>

                      {matrixData.stars.map(s => {
                        const count = matrixData.matrix[em]?.[s] || 0;
                        const intensityRatio = maxMatrixVal > 0 ? count / maxMatrixVal : 0;
                        
                        // Calculate shading
                        let cellBg = "transparent";
                        let textColor = "text-slate-500";
                        if (count > 0) {
                          if (intensityRatio > 0.6) {
                            cellBg = "bg-indigo-600 dark:bg-indigo-500";
                            textColor = "text-white font-bold";
                          } else if (intensityRatio > 0.3) {
                            cellBg = "bg-indigo-500/40 dark:bg-indigo-500/40";
                            textColor = "text-indigo-900 dark:text-indigo-100 font-semibold";
                          } else {
                            cellBg = "bg-indigo-500/15 dark:bg-indigo-500/20";
                            textColor = "text-indigo-600 dark:text-indigo-300 font-medium";
                          }
                        }

                        return (
                          <td key={s} className="py-2 px-2 text-center">
                            <div
                              className={`py-2 px-3 rounded-lg mx-auto max-w-[64px] transition-all ${cellBg} ${textColor}`}
                            >
                              {count}
                            </div>
                          </td>
                        );
                      })}

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Reviews Panel (Latest 5) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Recent Customer Reviews
            </h3>
            <p className="text-xs text-slate-400">Latest qualitative submissions with real-time AI metadata</p>
          </div>
          <button
            onClick={() => onNavigate("reviews", { productId: selectedProductId })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 cursor-pointer"
          >
            <span>Explore all in Reviews Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recentReviews.map(r => (
            <div key={r.feedback_id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} readOnly size="sm" />
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  {r.mismatch_flag && <MismatchBadge />}
                </div>
                <p className="text-slate-800 dark:text-slate-200 line-clamp-2">
                  &ldquo;{r.feedback_text}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <EmotionBadge emotion={r.predicted_emotion} size="sm" />
                <SentimentBadge sentiment={r.sentiment} score={r.sentiment_score} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

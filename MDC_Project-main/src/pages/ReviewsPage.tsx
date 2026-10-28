import React, { useState, useEffect } from "react";
import { Feedback, Product, EmotionType, SentimentType } from "../types";
import { StarRating } from "../components/StarRating";
import { EmotionBadge, SentimentBadge, MismatchBadge, IssueBadge } from "../components/Badges";
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { apiFetch } from "../lib/api";

interface ReviewsPageProps {
  initialProductId?: number;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ initialProductId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportError, setExportError] = useState<string | null>(null);

  // Filters
  const [selectedProduct, setSelectedProduct] = useState<number>(initialProductId || 0);
  const [selectedSentiment, setSelectedSentiment] = useState<string>("");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Expanded review IDs
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    apiFetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedProduct > 0) params.set("product_id", String(selectedProduct));
    if (selectedSentiment) params.set("sentiment", selectedSentiment);
    if (selectedEmotion) params.set("emotion", selectedEmotion);
    if (selectedRating > 0) params.set("rating", String(selectedRating));
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (sortOption) params.set("sort", sortOption);
    params.set("page", String(page));
    params.set("page_size", "10");

    try {
      const res = await apiFetch(`/api/feedback?${params.toString()}`);
      const data = await res.json();
      setReviews(data.items || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedProduct, selectedSentiment, selectedEmotion, selectedRating, sortOption, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchReviews();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResetFilters = () => {
    setSelectedProduct(0);
    setSelectedSentiment("");
    setSelectedEmotion("");
    setSelectedRating(0);
    setSearchQuery("");
    setSortOption("newest");
    setPage(1);
  };

  const handleExportCSV = async () => {
    setExportError(null);
    const params = new URLSearchParams();
    if (selectedProduct > 0) params.set("product_id", String(selectedProduct));
    if (selectedSentiment) params.set("sentiment", selectedSentiment);
    if (selectedEmotion) params.set("emotion", selectedEmotion);
    if (selectedRating > 0) params.set("rating", String(selectedRating));
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (sortOption) params.set("sort", sortOption);

    try {
      const response = await apiFetch(`/api/feedback/export?${params.toString()}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to export reviews.");
      }
      const downloadUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "emotilens-feedback.csv";
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error exporting reviews:", error);
      setExportError(error instanceof Error ? error.message : "Failed to export reviews.");
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const productMap = new Map(products.map(p => [p.id, p]));

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Reviews Explorer</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
              {totalCount} total
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Search, filter, and inspect qualitative feedback with neural emotion classifications
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered CSV</span>
        </button>
      </div>
      {exportError && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {exportError}
        </p>
      )}

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search reviews by keyword (e.g. battery, crashing, camera, refund)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {/* Product Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={e => {
                setSelectedProduct(Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value={0}>All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sentiment</label>
            <select
              value={selectedSentiment}
              onChange={e => {
                setSelectedSentiment(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 capitalize"
            >
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          {/* Emotion Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Emotion</label>
            <select
              value={selectedEmotion}
              onChange={e => {
                setSelectedEmotion(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 capitalize"
            >
              <option value="">All 6 Emotions</option>
              <option value="joy">Joy 😄</option>
              <option value="love">Love ❤️</option>
              <option value="sadness">Sadness 😢</option>
              <option value="anger">Anger 😠</option>
              <option value="fear">Fear 😨</option>
              <option value="surprise">Surprise 😲</option>
            </select>
          </div>

          {/* Star Rating Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Star Rating</label>
            <select
              value={selectedRating}
              onChange={e => {
                setSelectedRating(Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value={0}>All Stars</option>
              <option value={5}>5 Stars ★★★★★</option>
              <option value={4}>4 Stars ★★★★</option>
              <option value={3}>3 Stars ★★★</option>
              <option value={2}>2 Stars ★★</option>
              <option value={1}>1 Star ★</option>
            </select>
          </div>

          {/* Sort Option */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sort By</label>
            <select
              value={sortOption}
              onChange={e => {
                setSortOption(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_rating">Highest Rating</option>
              <option value="lowest_rating">Lowest Rating</option>
              <option value="highest_confidence">Highest Confidence</option>
              <option value="lowest_confidence">Lowest Confidence</option>
            </select>
          </div>
        </div>

        {/* Reset Filters Link */}
        {(selectedProduct > 0 || selectedSentiment || selectedEmotion || selectedRating > 0 || searchQuery || sortOption !== "newest") && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      <div className="rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading filtered reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <span className="text-4xl">🔍</span>
            <h3 className="font-heading font-bold text-base text-slate-800 dark:text-slate-200">
              No matching reviews found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try loosening your filters or search query to view customer feedback entries.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 min-w-[280px]">Review Text</th>
                  <th className="py-3 px-4">Emotion</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {reviews.map(r => {
                  const prod = productMap.get(r.product_id);
                  const isExpanded = expandedIds.has(r.feedback_id);

                  return (
                    <tr
                      key={r.feedback_id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        <span className="mr-1">{prod?.emoji || "📱"}</span>
                        <span>{prod?.name || `Product ${r.product_id}`}</span>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StarRating value={r.rating} readOnly size="sm" />
                      </td>

                      {/* Review Text (Truncated with click-to-expand) */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => toggleExpand(r.feedback_id)}
                          className="cursor-pointer group flex items-start gap-1.5"
                        >
                          <p
                            className={`text-slate-700 dark:text-slate-300 leading-relaxed ${
                              isExpanded ? "" : "line-clamp-2"
                            }`}
                          >
                            &ldquo;{r.feedback_text}&rdquo;
                          </p>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-indigo-500 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={isExpanded ? "Collapse" : "Expand text"}
                          >
                            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Issue categories if detected */}
                        {r.issue_categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {r.issue_categories.map(cat => (
                              <IssueBadge key={cat} category={cat} />
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Predicted Emotion */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <EmotionBadge emotion={r.predicted_emotion} size="sm" />
                      </td>

                      {/* Confidence % */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {(r.confidence_score * 100).toFixed(1)}%
                      </td>

                      {/* Sentiment */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <SentimentBadge sentiment={r.sentiment} score={r.sentiment_score} size="sm" />
                      </td>

                      {/* Mismatch Flag */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {r.mismatch_flag ? <MismatchBadge tooltip={true} /> : <span className="text-slate-400 text-[10px]">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold">{reviews.length}</span> of{" "}
            <span className="font-semibold">{totalCount}</span> reviews (Page {page} of {totalPages})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono font-semibold">{page}</span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

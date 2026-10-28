import React, { useState, useEffect } from "react";
import { Product, Feedback, EMOTION_METADATA, EmotionType } from "../types";
import { StarRating } from "../components/StarRating";
import { EmotionBadge, SentimentBadge, MismatchBadge, IssueBadge } from "../components/Badges";
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Sparkles,
  Info
} from "lucide-react";
import { NavTab } from "../components/Navbar";
import { apiFetch } from "../lib/api";

interface FeedbackPageProps {
  initialProductId?: number;
  onNavigate: (tab: NavTab, params?: { productId?: number }) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ initialProductId, onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(initialProductId || 1);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<Feedback | null>(null);

  useEffect(() => {
    apiFetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        if (initialProductId) {
          setSelectedProductId(initialProductId);
        } else if (data.length > 0 && !selectedProductId) {
          setSelectedProductId(data[0].id);
        }
      })
      .catch(err => console.error("Error fetching products", err));
  }, [initialProductId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = reviewText.trim();
    if (trimmed.length < 5) {
      setErrorMessage("Review must contain at least 5 characters.");
      return;
    }
    if (trimmed.length > 1000) {
      setErrorMessage("Review cannot exceed 1000 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProductId,
          rating,
          feedback_text: trimmed
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback.");
      }

      setSubmissionResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setReviewText("");
    setRating(5);
    setErrorMessage(null);
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Neural Evaluation</span>
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
          Submit Customer Feedback
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Share your experience. Our SimpleRNN deep learning pipeline will classify emotional nuances,
          extract VADER sentiment valence, and detect recurring themes.
        </p>
      </div>

      {!submissionResult ? (
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
        >
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Product Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name} — {p.description}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Star Rating */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Your Star Rating
              </label>
              <span className="text-xs text-slate-400">Click a star to rate</span>
            </div>
            <div className="flex items-center justify-start py-1">
              <StarRating
                value={rating}
                onChange={val => setRating(val)}
                size="lg"
                showLabel={true}
              />
            </div>
          </div>

          {/* Review Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Detailed Review
              </label>
              <span
                className={`text-xs font-mono ${
                  reviewText.length > 1000
                    ? "text-rose-500 font-bold"
                    : reviewText.length < 5 && reviewText.length > 0
                    ? "text-amber-500"
                    : "text-slate-400"
                }`}
              >
                {reviewText.length}/1000 chars (min 5)
              </span>
            </div>
            <textarea
              rows={5}
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Tell us what you liked, what frustrated you, or any specific bugs or praises..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
            />
          </div>

          {/* Quick Pre-fill Samples for instant testing */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick test examples:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { r: 5, t: "I absolutely love this product, the camera and display are stunning!" },
                { r: 1, t: "The application keeps crashing, and I am frustrated with constant bugs." },
                { r: 3, t: "The features are good, but the performance is disappointing." },
                { r: 5, t: "Battery life is awful and customer service refused to refund.", label: "Test Mismatch" }
              ].map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRating(sample.r);
                    setReviewText(sample.t);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-left"
                >
                  <span className="font-semibold text-amber-500 mr-1">{sample.r}★</span>
                  <span>{sample.label || sample.t.slice(0, 32) + "..."}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || reviewText.trim().length < 5}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running SimpleRNN & VADER Pipeline...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Analyze & Submit Feedback</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* Instant Result Card */
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  Feedback Successfully Processed
                </h3>
                <p className="text-xs text-slate-400">
                  Stored to database with neural classifications
                </p>
              </div>
            </div>
            <span className="text-2xl">{selectedProduct?.emoji || "📱"}</span>
          </div>

          {/* Mismatch Alert Banner if applicable */}
          {submissionResult.mismatch_flag && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm space-y-0.5">
                <p className="font-bold flex items-center gap-1.5">
                  <span>Rating–Text Sentiment Mismatch Flagged</span>
                  <MismatchBadge />
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  The customer gave a {submissionResult.rating}-star rating, yet the linguistic sentiment was classified as{" "}
                  <strong>{submissionResult.sentiment}</strong> (compound score: {submissionResult.sentiment_score.toFixed(2)}).
                  This review has been tagged for product team review.
                </p>
              </div>
            </div>
          )}

          {/* Stored Customer Review Text */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Submitted Review Text
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Customer Rating:</span>
                <StarRating value={submissionResult.rating} readOnly size="sm" />
              </div>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
              &ldquo;{submissionResult.feedback_text}&rdquo;
            </p>
          </div>

          {/* Primary Model Outputs: Top Emotion + Sentiment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Predicted Emotion */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                SimpleRNN Predicted Emotion
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {EMOTION_METADATA[submissionResult.predicted_emotion]?.emoji}
                  </span>
                  <div>
                    <span className="text-xl font-heading font-extrabold capitalize text-slate-900 dark:text-white">
                      {submissionResult.predicted_emotion}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Top neural class
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {(submissionResult.confidence_score * 100).toFixed(1)}%
                  </span>
                  <p className="text-[10px] text-slate-400">Confidence</p>
                </div>
              </div>
            </div>

            {/* VADER Sentiment */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                VADER Sentiment Valence
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <SentimentBadge
                    sentiment={submissionResult.sentiment}
                    score={submissionResult.sentiment_score}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Compound score: {submissionResult.sentiment_score.toFixed(3)}
                  </p>
                </div>

                {submissionResult.issue_categories.length > 0 && (
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Detected Issues
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {submissionResult.issue_categories.map(c => (
                        <IssueBadge key={c} category={c} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6-Class Probability Distribution Bars */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Full 6-Class Emotion Probability Distribution
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Softmax Sum = 100%</span>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(submissionResult.emotion_probabilities) as EmotionType[]).map(em => {
                const prob = submissionResult.emotion_probabilities[em];
                const pct = (prob * 100).toFixed(1);
                const meta = EMOTION_METADATA[em];
                const isTop = em === submissionResult.predicted_emotion;

                return (
                  <div key={em} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <span>{meta.emoji}</span>
                        <span className="capitalize">{meta.label}</span>
                        {isTop && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold">
                            Winner
                          </span>
                        )}
                      </span>
                      <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                        {pct}%
                      </span>
                    </div>
                    {/* Probability Progress Bar */}
                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: meta.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Submit Another Review</span>
            </button>

            <button
              onClick={() => onNavigate("dashboard", { productId: submissionResult.product_id })}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Product Analytics Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import { EmotionType, SentimentType, EMOTION_METADATA } from "../types";
import { EmotionBadge, SentimentBadge } from "../components/Badges";
import { FlaskConical, Play, Sparkles, ShieldAlert, Cpu, CheckCircle } from "lucide-react";
import { apiFetch } from "../lib/api";

export const AnalyzerPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    "I absolutely love this product, the camera and display are stunning!"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    text: string;
    predicted_emotion: EmotionType;
    confidence_score: number;
    emotion_probabilities: Record<EmotionType, number>;
    sentiment: SentimentType;
    sentiment_score: number;
  } | null>(null);

  const sampleTexts = [
    {
      title: "Example 1 (Joy & High Satisfaction)",
      text: "I absolutely love this phone, the camera is stunning!"
    },
    {
      title: "Example 2 (Anger / Frustration & Bug)",
      text: "The application keeps crashing, and I am frustrated."
    },
    {
      title: "Example 3 (Sadness & Mixed Performance)",
      text: "The features are good, but the performance is disappointing."
    },
    {
      title: "Example 4 (Surprise / Fast Delivery)",
      text: "I never expected such a polished experience, what a pleasant surprise!"
    },
    {
      title: "Example 5 (Fear / Data Security Risk)",
      text: "I am scared of losing my data because of the constant sync errors."
    }
  ];

  const runAnalysis = async (textToAnalyze?: string) => {
    const text = textToAnalyze || inputText;
    if (!text.trim() || text.trim().length < 3) return;

    setLoading(true);
    try {
      const res = await apiFetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error("Error analyzing text", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Interactive Neural Sandbox</span>
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
          Live Analyzer Playground
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
          Test sentences through our live SimpleRNN 6-class emotion classifier and VADER valence pipeline.
          Zero database persistence is performed.
        </p>
      </div>

      {/* Ephemeral Warning / Notice */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Ephemeral Sandbox:</strong> Evaluates via{" "}
            <code className="text-indigo-600 dark:text-indigo-400 font-mono">POST /api/analyze</code>. Nothing is saved to the database.
          </span>
        </span>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold">
          Stateless
        </span>
      </div>

      {/* Input Form & Preset Buttons */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Input Any Customer Review or Emotional Statement
          </label>
          <textarea
            rows={4}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type any review text to observe live neural probabilities..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {/* Clickable Preset Sentences */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Click an example benchmark sentence:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleTexts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(sample.text);
                  runAnalysis(sample.text);
                }}
                className="p-2.5 rounded-xl text-left bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 transition-colors group cursor-pointer"
              >
                <span className="text-[10px] font-semibold text-indigo-500 uppercase block mb-0.5">
                  {sample.title}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 truncate">
                  &ldquo;{sample.text}&rdquo;
                </p>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => runAnalysis()}
          disabled={loading || inputText.trim().length < 3}
          className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          <span>Run Live Deep-Learning Prediction</span>
        </button>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Real-time Inference Diagnostics</span>
            </h3>
            <span className="text-xs text-emerald-500 font-mono flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> 200 OK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Predicted Emotion */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                SimpleRNN Classification
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {EMOTION_METADATA[analysisResult.predicted_emotion]?.emoji}
                  </span>
                  <div>
                    <span className="text-xl font-heading font-extrabold capitalize text-slate-900 dark:text-white">
                      {analysisResult.predicted_emotion}
                    </span>
                    <p className="text-xs text-slate-400">Winning neural class</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {(analysisResult.confidence_score * 100).toFixed(1)}%
                  </span>
                  <p className="text-[10px] text-slate-400">Confidence</p>
                </div>
              </div>
            </div>

            {/* VADER Compound Score */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Independent VADER Sentiment
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <SentimentBadge
                    sentiment={analysisResult.sentiment}
                    score={analysisResult.sentiment_score}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Compound score: {analysisResult.sentiment_score.toFixed(3)}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  Valence [-1.0 ... +1.0]
                </div>
              </div>
            </div>
          </div>

          {/* Probability Distribution */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Softmax Probabilities Across All 6 Classes
              </span>
              <span className="text-slate-400 font-mono">Σ = 100%</span>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(analysisResult.emotion_probabilities) as EmotionType[]).map(em => {
                const prob = analysisResult.emotion_probabilities[em];
                const pct = (prob * 100).toFixed(1);
                const meta = EMOTION_METADATA[em];
                const isWinner = em === analysisResult.predicted_emotion;

                return (
                  <div key={em} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <span>{meta.emoji}</span>
                        <span className="capitalize">{meta.label}</span>
                        {isWinner && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold">
                            Highest
                          </span>
                        )}
                      </span>
                      <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                        {pct}%
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
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
        </div>
      )}
    </div>
  );
};

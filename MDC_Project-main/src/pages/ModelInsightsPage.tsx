import React, { useState, useEffect } from "react";
import { ModelMetricsData, EMOTION_METADATA, EmotionType } from "../types";
import {
  BrainCircuit,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  FileCode,
  ShieldCheck
} from "lucide-react";
import { apiFetch } from "../lib/api";

export const ModelInsightsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetricsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiFetch("/api/model/metrics")
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading model metrics:", err);
        setLoading(false);
      });
  }, []);

  const pipelineLayers = [
    { title: "Input Text", sub: "Raw review string", desc: "Lowercase, strip URLs, keep punctuation" },
    { title: "Tokenization", sub: "Custom Vocab (10k)", desc: "Words to integer indices (<OOV>=1)" },
    { title: "Padding (50)", sub: "Maxlen = 50", desc: "Post-padding & truncation with 0s" },
    { title: "Embedding (128)", sub: "Dim: [50, 128]", desc: "Dense 128-dimensional word vectors" },
    { title: "SimpleRNN (128)", sub: "return_sequences=True", desc: "Recurrent state across 50 steps" },
    { title: "Dropout (0.5)", sub: "Rate = 0.5", desc: "Regularization to prevent overfitting" },
    { title: "SimpleRNN (64)", sub: "Units: 64", desc: "Extracts final sequence hidden vector" },
    { title: "Dropout (0.5)", sub: "Rate = 0.5", desc: "Second dropout barrier" },
    { title: "Dense (6 Softmax)", sub: "Classes: 6", desc: "Sadness, joy, love, anger, fear, surprise" }
  ];

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading evaluation metrics from test set...</p>
      </div>
    );
  }

  if (!metrics || !metrics.available) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-heading font-bold text-slate-800 dark:text-slate-100">
          Model Metrics Not Yet Available
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Model evaluation output was not found. Metrics are computed from the dair-ai/emotion test split.
        </p>
      </div>
    );
  }

  const { architecture, dataset, evaluation, training_history, limitations, future_scope } = metrics;

  return (
    <div className="space-y-12 py-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Evaluation & Architecture Transparency</span>
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
          Model Insights & Test-Set Evaluation
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
          Complete structural view of the SimpleRNN deep learning pipeline, dataset split distributions,
          confusion matrix heatmap, and verified test-set classification benchmarks.
        </p>
      </div>

      {/* Section 1: Architecture Pipeline Flowchart */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <span>Deep Learning Architecture Flow</span>
            </h2>
            <p className="text-xs text-slate-400">
              Sequential flow from raw input string to 6-class softmax probabilities
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {architecture.total_parameters.toLocaleString()} Total Params
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
            {pipelineLayers.map((layer, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between min-h-[110px] hover:border-indigo-500 transition-colors">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-500 block mb-0.5">
                      0{idx + 1}
                    </span>
                    <h3 className="text-xs font-heading font-bold text-slate-900 dark:text-white">
                      {layer.title}
                    </h3>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block truncate">
                      {layer.sub}
                    </span>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {layer.desc}
                    </p>
                  </div>
                </div>
                {idx < pipelineLayers.length - 1 && (
                  <div className="hidden lg:block text-slate-300 dark:text-slate-700 my-1">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <strong>Optimizer:</strong> {architecture.optimizer} • <strong>Loss:</strong> {architecture.loss}
            </div>
            <div>
              <strong>Batch Size:</strong> {architecture.batch_size} • <strong>Trained Epochs:</strong> {architecture.epochs_trained} (Early Stopping = {architecture.early_stopping_patience})
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Dataset Facts */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" />
          <span>Training & Benchmark Dataset Facts</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-400 uppercase font-semibold">Dataset Source</span>
            <div className="text-base font-heading font-bold text-slate-900 dark:text-white mt-1">
              dair-ai/emotion
            </div>
            <p className="text-xs text-slate-500 mt-1">Hugging Face Datasets repository</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-400 uppercase font-semibold">Training Split</span>
            <div className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {dataset.train_size.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Class-weighted training samples</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-400 uppercase font-semibold">Validation Split</span>
            <div className="text-2xl font-mono font-bold text-violet-600 dark:text-violet-400 mt-1">
              {dataset.validation_size.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Used for early-stopping checkpointing</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-400 uppercase font-semibold">Test Evaluation Split</span>
            <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {dataset.test_size.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Unseen benchmark test samples</p>
          </div>
        </div>
      </section>

      {/* Section 3: Test-Set Performance & Confusion Matrix Heatmap */}
      <section className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <span>Real Test-Set Evaluation Performance</span>
        </h2>

        {/* Global Test Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Test Accuracy</span>
            <div className="text-2xl font-mono font-bold text-emerald-500 mt-1">
              {(evaluation.test_accuracy * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400">On 2,000 test samples</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Macro F1 Score</span>
            <div className="text-2xl font-mono font-bold text-indigo-500 mt-1">
              {(evaluation.macro_f1 * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400">Unweighted class average</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Macro Precision</span>
            <div className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
              {(evaluation.macro_precision * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400">Average positive precision</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Macro Recall</span>
            <div className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
              {(evaluation.macro_recall * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400">Average class coverage</span>
          </div>
        </div>

        {/* Per-class Metrics Table & Confusion Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Per-Class Classification Report */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                Per-Class Test Metrics
              </h3>
              <span className="text-xs text-slate-400 font-mono">sklearn report</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2 px-2">Class</th>
                    <th className="py-2 px-2 text-right">Precision</th>
                    <th className="py-2 px-2 text-right">Recall</th>
                    <th className="py-2 px-2 text-right">F1-Score</th>
                    <th className="py-2 px-2 text-right">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {evaluation.per_class.map(item => {
                    const meta = EMOTION_METADATA[item.label as EmotionType];
                    return (
                      <tr key={item.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-2 font-sans font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 capitalize">
                          <span>{meta?.emoji}</span>
                          <span>{item.label}</span>
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600 dark:text-slate-300">
                          {(item.precision * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600 dark:text-slate-300">
                          {(item.recall * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-indigo-600 dark:text-indigo-400">
                          {(item.f1 * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-400">
                          {item.support}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confusion Matrix Heatmap (6x6) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  6×6 Confusion Matrix Heatmap
                </h3>
                <p className="text-[10px] text-slate-400">Rows = True Label, Columns = Predicted Label</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Total = 2,000</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase">
                    <th className="py-2 px-1 text-left">True \ Pred</th>
                    {dataset.classes.map(c => (
                      <th key={c} className="py-2 px-1 truncate max-w-[40px] capitalize">
                        {c.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {dataset.classes.map((trueLabel, rIdx) => (
                    <tr key={trueLabel}>
                      <td className="py-2 px-1 font-sans text-left font-medium text-slate-700 dark:text-slate-300 capitalize truncate max-w-[60px]">
                        {trueLabel.slice(0, 4)}
                      </td>
                      {evaluation.confusion_matrix[rIdx].map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        let bg = "transparent";
                        let textColor = "text-slate-400";

                        if (isDiagonal) {
                          bg = "bg-indigo-600 text-white font-bold";
                          textColor = "text-white";
                        } else if (val > 15) {
                          bg = "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold";
                        } else if (val > 5) {
                          bg = "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
                        }

                        return (
                          <td key={cIdx} className="py-1 px-1">
                            <div className={`p-1.5 rounded-lg text-[11px] ${bg} ${textColor}`}>
                              {val}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Sentiment Component (VADER) */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>Independent Sentiment Engine: VADER Algorithm</span>
        </h2>

        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            EmotiLens deliberately separates <strong>Emotion</strong> from <strong>Sentiment</strong>.
            The 6-class neural model identifies emotional states (e.g., <em>joy, fear, surprise</em>),
            while positive/negative/neutral polarity is determined by an independent implementation of{" "}
            <strong>VADER (Valence Aware Dictionary and sEntiment Reasoner)</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-semibold text-emerald-500 block text-xs uppercase">
                Positive Valence
              </span>
              <p className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                Compound ≥ +0.05
              </p>
              <p className="text-xs text-slate-400">
                Identifies favorable impressions, praises, and customer satisfaction.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-semibold text-slate-400 block text-xs uppercase">
                Neutral Valence
              </span>
              <p className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                -0.05 &lt; Compound &lt; +0.05
              </p>
              <p className="text-xs text-slate-400">
                Factual statements, delivery status, or neutral observations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-semibold text-rose-500 block text-xs uppercase">
                Negative Valence
              </span>
              <p className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                Compound ≤ -0.05
              </p>
              <p className="text-xs text-slate-400">
                Complaints, bug reports, broken hardware, and refund disputes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Honest Limitations & Future Scope */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Limitations */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Honest Model Limitations</span>
          </h2>

          <div className="space-y-3">
            {limitations.map((lim, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                  {lim.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lim.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Future Scope */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-500" />
            <span>Future Architecture Scope</span>
          </h2>

          <div className="space-y-2.5">
            {future_scope.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export type EmotionType = "sadness" | "joy" | "love" | "anger" | "fear" | "surprise";
export type SentimentType = "positive" | "negative" | "neutral";

export interface Product {
  id: number;
  name: string;
  description: string;
  emoji: string;
  avg_rating?: number;
  review_count?: number;
  top_emotion?: string;
}

export interface Feedback {
  feedback_id: number;
  product_id: number;
  rating: number; // 1-5
  feedback_text: string;
  predicted_emotion: EmotionType;
  emotion_probabilities: Record<EmotionType, number>;
  sentiment: SentimentType;
  sentiment_score: number; // -1.0 to 1.0
  confidence_score: number; // 0.0 to 1.0
  mismatch_flag: boolean;
  issue_categories: string[];
  created_at: string;
}

export interface SummaryAnalytics {
  kpis: {
    avg_rating: number;
    total_reviews: number;
    percent_positive: number;
    percent_negative: number;
    percent_neutral: number;
    top_emotion: string;
    mismatch_count: number;
  };
  insight_text: string;
}

export interface EmotionItem {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

export interface RatingItem {
  star: number;
  count: number;
  percentage: number;
}

export interface TrendItem {
  date: string;
  avg_rating: number;
  review_count: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
}

export interface IssueItem {
  category: string;
  count: number;
  snippets: string[];
}

export interface EmotionRatingMatrixData {
  emotions: EmotionType[];
  stars: number[];
  matrix: Record<EmotionType, Record<number, number>>;
}

export interface ModelMetricsData {
  available: boolean;
  model_name: string;
  architecture: {
    framework: string;
    vocab_size: number;
    max_sequence_length: number;
    layers: Array<{
      name: string;
      type: string;
      output_shape: number[];
      params: number;
      description: string;
    }>;
    total_parameters: number;
    trainable_parameters: number;
    optimizer: string;
    loss: string;
    batch_size: number;
    epochs_trained: number;
    early_stopping_patience?: number;
  };
  dataset: {
    source: string;
    classes: string[];
    train_size: number;
    validation_size: number;
    test_size: number;
    text_domain: string;
  };
  evaluation: {
    test_accuracy: number;
    macro_precision: number;
    macro_recall: number;
    macro_f1: number;
    weighted_precision: number;
    weighted_recall: number;
    weighted_f1: number;
    per_class: Array<{
      label: string;
      precision: number;
      recall: number;
      f1: number;
      support: number;
    }>;
    confusion_matrix: number[][];
  };
  training_history: Array<{
    epoch: number;
    loss: number;
    accuracy: number;
    val_loss: number;
    val_accuracy: number;
  }>;
  limitations: Array<{ title: string; description: string }>;
  future_scope: string[];
}

export const EMOTION_METADATA: Record<EmotionType, { label: string; emoji: string; color: string; bgClass: string; textClass: string }> = {
  joy: { label: "Joy", emoji: "😄", color: "#EAB308", bgClass: "bg-amber-500/15", textClass: "text-amber-500" },
  love: { label: "Love", emoji: "❤️", color: "#EC4899", bgClass: "bg-pink-500/15", textClass: "text-pink-500" },
  sadness: { label: "Sadness", emoji: "😢", color: "#3B82F6", bgClass: "bg-blue-500/15", textClass: "text-blue-500" },
  anger: { label: "Anger", emoji: "😠", color: "#EF4444", bgClass: "bg-red-500/15", textClass: "text-red-500" },
  fear: { label: "Fear", emoji: "😨", color: "#8B5CF6", bgClass: "bg-purple-500/15", textClass: "text-purple-500" },
  surprise: { label: "Surprise", emoji: "😲", color: "#F97316", bgClass: "bg-orange-500/15", textClass: "text-orange-500" }
};

export const SENTIMENT_METADATA: Record<SentimentType, { label: string; color: string; bgClass: string; textClass: string }> = {
  positive: { label: "Positive", color: "#22C55E", bgClass: "bg-emerald-500/15", textClass: "text-emerald-500" },
  negative: { label: "Negative", color: "#EF4444", bgClass: "bg-rose-500/15", textClass: "text-rose-500" },
  neutral: { label: "Neutral", color: "#94A3B8", bgClass: "bg-slate-500/15", textClass: "text-slate-400" }
};

import express, { Request, Response } from "express";
import { db } from "./db.js";
import { predictEmotion } from "./emotionModel.js";
import { analyzeSentiment } from "./vader.js";
import { MODEL_METRICS_DATA } from "./metricsData.js";
import {
  getSummaryAnalytics,
  getEmotionsAnalytics,
  getRatingsAnalytics,
  getTrendsAnalytics,
  getIssuesAnalytics,
  getEmotionRatingMatrix
} from "./analytics.js";

export const apiRouter = express.Router();

// GET /api/health
apiRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    model_loaded: true,
    model_type: "SimpleRNN 6-Class",
    sentiment_engine: "VADER Lexicon Compound",
    timestamp: new Date().toISOString()
  });
});

// GET /api/products
apiRouter.get("/products", (_req: Request, res: Response) => {
  const products = db.getProducts();
  res.json(products);
});

// POST /api/feedback
apiRouter.post("/feedback", (req: Request, res: Response) => {
  const { product_id, rating, feedback_text } = req.body;

  // Validation
  const pid = Number(product_id);
  const r = Number(rating);
  const text = typeof feedback_text === "string" ? feedback_text.trim() : "";

  if (!pid || !db.getProductById(pid)) {
    return res.status(400).json({ error: "Invalid product_id provided." });
  }

  if (!r || r < 1 || r > 5 || !Number.isInteger(r)) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
  }

  if (!text || text.length < 5) {
    return res.status(400).json({ error: "Feedback review must be at least 5 characters long." });
  }

  if (text.length > 1000) {
    return res.status(400).json({ error: "Feedback review must not exceed 1000 characters." });
  }

  const created = db.addFeedback(pid, r, text);
  res.status(201).json(created);
});

// POST /api/analyze (Playground, does not save)
apiRouter.post("/analyze", (req: Request, res: Response) => {
  const { text } = req.body;
  const clean = typeof text === "string" ? text.trim() : "";

  if (!clean || clean.length < 3) {
    return res.status(400).json({ error: "Please enter at least 3 characters to analyze." });
  }

  const emotionResult = predictEmotion(clean);
  const sentimentResult = analyzeSentiment(clean);

  res.json({
    text: clean,
    predicted_emotion: emotionResult.predicted_emotion,
    confidence_score: emotionResult.confidence_score,
    emotion_probabilities: emotionResult.emotion_probabilities,
    sentiment: sentimentResult.sentiment,
    sentiment_score: sentimentResult.sentiment_score
  });
});

// GET /api/feedback (Filtering, search, sorting, pagination)
apiRouter.get("/feedback", (req: Request, res: Response) => {
  const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
  const sentiment = req.query.sentiment ? String(req.query.sentiment) : undefined;
  const emotion = req.query.emotion ? String(req.query.emotion) : undefined;
  const rating = req.query.rating ? Number(req.query.rating) : undefined;
  const search = req.query.q ? String(req.query.q) : undefined;
  const sort = req.query.sort ? String(req.query.sort) : "newest";
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(req.query.page_size) || 10));

  const allFiltered = db.getFeedback({
    productId,
    sentiment,
    emotion,
    rating,
    search,
    sort
  });

  const total = allFiltered.length;
  const pages = Math.ceil(total / pageSize) || 1;
  const offset = (page - 1) * pageSize;
  const items = allFiltered.slice(offset, offset + pageSize);

  res.json({
    items,
    total,
    page,
    pages,
    page_size: pageSize
  });
});

// GET /api/feedback/export (CSV Download)
apiRouter.get("/feedback/export", (req: Request, res: Response) => {
  const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
  const sentiment = req.query.sentiment ? String(req.query.sentiment) : undefined;
  const emotion = req.query.emotion ? String(req.query.emotion) : undefined;
  const rating = req.query.rating ? Number(req.query.rating) : undefined;
  const search = req.query.q ? String(req.query.q) : undefined;
  const sort = req.query.sort ? String(req.query.sort) : "newest";

  const feedbackList = db.getFeedback({ productId, sentiment, emotion, rating, search, sort });

  const headers = [
    "Feedback ID",
    "Product ID",
    "Product Name",
    "Rating",
    "Review Text",
    "Emotion",
    "Confidence",
    "Sentiment",
    "Sentiment Score",
    "Mismatch Flag",
    "Issue Categories",
    "Date"
  ];

  const escapeCSV = (val: any) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = feedbackList.map(f => {
    const prod = db.getProductById(f.product_id);
    return [
      f.feedback_id,
      f.product_id,
      prod ? prod.name : `Product ${f.product_id}`,
      f.rating,
      f.feedback_text,
      f.predicted_emotion,
      (f.confidence_score * 100).toFixed(1) + "%",
      f.sentiment,
      f.sentiment_score.toFixed(3),
      f.mismatch_flag ? "YES" : "NO",
      f.issue_categories.join("; "),
      f.created_at
    ].map(escapeCSV).join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="emotilens_feedback_${Date.now()}.csv"`);
  res.send(csvContent);
});

// Analytics endpoints
apiRouter.get("/analytics/summary", (req: Request, res: Response) => {
  const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
  const days = req.query.days ? Number(req.query.days) : undefined;
  res.json(getSummaryAnalytics(productId, days));
});

apiRouter.get("/analytics/emotions", (req: Request, res: Response) => {
  const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
  const days = req.query.days ? Number(req.query.days) : undefined;
  res.json(getEmotionsAnalytics(productId, days));
});

apiRouter.get("/analytics/ratings", (req: Request, res: Response) => {
  const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
  const days = req.query.days ? Number(req.query.days) : undefined;
  res.json(getRatingsAnalytics(productId, days));
});

apiRouter.get("/analytics/trends", (req: Request, res: Response) => {
  const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
  const days = req.query.days ? Number(req.query.days) : undefined;
  res.json(getTrendsAnalytics(productId, days));
});

apiRouter.get("/analytics/issues", (req: Request, res: Response) => {
  const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
  const days = req.query.days ? Number(req.query.days) : undefined;
  res.json(getIssuesAnalytics(productId, days));
});

apiRouter.get("/analytics/emotion-rating-matrix", (req: Request, res: Response) => {
  const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
  const days = req.query.days ? Number(req.query.days) : undefined;
  res.json(getEmotionRatingMatrix(productId, days));
});

// GET /api/model/metrics
apiRouter.get("/model/metrics", (_req: Request, res: Response) => {
  res.json(MODEL_METRICS_DATA);
});

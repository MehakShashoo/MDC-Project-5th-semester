import { db, Feedback } from "./db.js";
import { EMOTION_CLASSES, EmotionClass } from "./emotionModel.js";

export function getSummaryAnalytics(productId?: number, days?: number) {
  const reviews = db.getFeedback({ productId, days });
  const total = reviews.length;

  if (total === 0) {
    return {
      kpis: {
        avg_rating: 0,
        total_reviews: 0,
        percent_positive: 0,
        percent_negative: 0,
        percent_neutral: 0,
        top_emotion: "None",
        mismatch_count: 0
      },
      insight_text: "No reviews found for the selected filter."
    };
  }

  const sumRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg_rating = Math.round((sumRating / total) * 10) / 10;

  const posCount = reviews.filter(r => r.sentiment === "positive").length;
  const negCount = reviews.filter(r => r.sentiment === "negative").length;
  const neuCount = reviews.filter(r => r.sentiment === "neutral").length;

  const percent_positive = Math.round((posCount / total) * 100);
  const percent_negative = Math.round((negCount / total) * 100);
  const percent_neutral = 100 - percent_positive - percent_negative;

  const mismatch_count = reviews.filter(r => r.mismatch_flag).length;

  // Emotion count
  const emotionCounts: Record<string, number> = {};
  reviews.forEach(r => {
    emotionCounts[r.predicted_emotion] = (emotionCounts[r.predicted_emotion] || 0) + 1;
  });

  let top_emotion = "Joy";
  let topEmotionCount = 0;
  for (const [em, count] of Object.entries(emotionCounts)) {
    if (count > topEmotionCount) {
      topEmotionCount = count;
      top_emotion = em.charAt(0).toUpperCase() + em.slice(1);
    }
  }

  // Top complaint category
  const issueCounts: Record<string, number> = {};
  reviews.forEach(r => {
    r.issue_categories.forEach(cat => {
      issueCounts[cat] = (issueCounts[cat] || 0) + 1;
    });
  });

  let topIssue = "";
  let topIssueCount = 0;
  for (const [cat, count] of Object.entries(issueCounts)) {
    if (count > topIssueCount) {
      topIssueCount = count;
      topIssue = cat;
    }
  }

  // Calculate rating change over last 30 days vs prior
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  const recentReviews = reviews.filter(r => new Date(r.created_at).getTime() >= thirtyDaysAgo);
  const olderReviews = reviews.filter(r => {
    const t = new Date(r.created_at).getTime();
    return t < thirtyDaysAgo && t >= sixtyDaysAgo;
  });

  const recentAvg = recentReviews.length > 0 
    ? Math.round((recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length) * 10) / 10
    : avg_rating;
  const olderAvg = olderReviews.length > 0 
    ? Math.round((olderReviews.reduce((s, r) => s + r.rating, 0) / olderReviews.length) * 10) / 10
    : recentAvg;

  // Rule-based plain English insight summary
  let insight_text = `${percent_positive}% of reviews are positive with an average rating of ${avg_rating}/5. `;
  insight_text += `The predominant detected emotion is ${top_emotion} (${Math.round((topEmotionCount / total) * 100)}% of feedback). `;
  
  if (topIssue && topIssueCount > 0) {
    insight_text += `The primary customer pain point is ${topIssue} (${topIssueCount} mentions). `;
  } else {
    insight_text += `No significant recurring hardware or software issues detected. `;
  }

  if (olderReviews.length > 0) {
    const diff = Math.round((recentAvg - olderAvg) * 10) / 10;
    if (diff > 0) {
      insight_text += `Average customer satisfaction improved from ${olderAvg} to ${recentAvg} (+${diff}) over the last 30 days. `;
    } else if (diff < 0) {
      insight_text += `Average rating softened from ${olderAvg} to ${recentAvg} (${diff}) over the last 30 days. `;
    }
  }

  if (mismatch_count > 0) {
    insight_text += `Note: ${mismatch_count} review${mismatch_count > 1 ? "s" : ""} exhibit a sentiment-star rating mismatch.`;
  }

  return {
    kpis: {
      avg_rating,
      total_reviews: total,
      percent_positive,
      percent_negative,
      percent_neutral,
      top_emotion,
      mismatch_count
    },
    insight_text
  };
}

export function getEmotionsAnalytics(productId?: number, days?: number) {
  const reviews = db.getFeedback({ productId, days });
  const total = reviews.length || 1;

  const counts: Record<EmotionClass, number> = {
    sadness: 0, joy: 0, love: 0, anger: 0, fear: 0, surprise: 0
  };

  reviews.forEach(r => {
    if (counts[r.predicted_emotion] !== undefined) {
      counts[r.predicted_emotion]++;
    }
  });

  const items = EMOTION_CLASSES.map(em => ({
    emotion: em,
    count: counts[em],
    percentage: Math.round((counts[em] / total) * 1000) / 10
  }));

  return { total: reviews.length, emotions: items };
}

export function getRatingsAnalytics(productId?: number, days?: number) {
  const reviews = db.getFeedback({ productId, days });
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach(r => {
    if (counts[r.rating] !== undefined) {
      counts[r.rating]++;
    }
  });

  return {
    total: reviews.length,
    ratings: [1, 2, 3, 4, 5].map(star => ({
      star,
      count: counts[star],
      percentage: reviews.length > 0 ? Math.round((counts[star] / reviews.length) * 100) : 0
    }))
  };
}

export function getTrendsAnalytics(productId?: number, days?: number) {
  const reviews = db.getFeedback({ productId, days });
  if (reviews.length === 0) return { trends: [] };

  // Group by date (YYYY-MM-DD)
  const map: Record<string, { ratings: number[]; positive: number; negative: number; neutral: number }> = {};

  reviews.forEach(r => {
    const dateKey = r.created_at.split("T")[0];
    if (!map[dateKey]) {
      map[dateKey] = { ratings: [], positive: 0, negative: 0, neutral: 0 };
    }
    map[dateKey].ratings.push(r.rating);
    if (r.sentiment === "positive") map[dateKey].positive++;
    else if (r.sentiment === "negative") map[dateKey].negative++;
    else map[dateKey].neutral++;
  });

  // Sort dates chronologically
  const sortedDates = Object.keys(map).sort();

  const trends = sortedDates.map(date => {
    const data = map[date];
    const avg = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
    return {
      date,
      avg_rating: Math.round(avg * 10) / 10,
      review_count: data.ratings.length,
      positive_count: data.positive,
      negative_count: data.negative,
      neutral_count: data.neutral
    };
  });

  return { trends };
}

export function getIssuesAnalytics(productId?: number, days?: number) {
  const reviews = db.getFeedback({ productId, days });
  const issueCounts: Record<string, { count: number; snippets: string[] }> = {};

  reviews.forEach(r => {
    r.issue_categories.forEach(cat => {
      if (!issueCounts[cat]) {
        issueCounts[cat] = { count: 0, snippets: [] };
      }
      issueCounts[cat].count++;
      if (issueCounts[cat].snippets.length < 2) {
        issueCounts[cat].snippets.push(r.feedback_text);
      }
    });
  });

  const ranked = Object.entries(issueCounts)
    .map(([category, data]) => ({
      category,
      count: data.count,
      snippets: data.snippets
    }))
    .sort((a, b) => b.count - a.count);

  return { issues: ranked };
}

export function getEmotionRatingMatrix(productId?: number, days?: number) {
  const reviews = db.getFeedback({ productId, days });
  // 6 emotions x 5 star levels (1-5)
  const matrix: Record<EmotionClass, Record<number, number>> = {
    sadness: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    joy: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    love: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    anger: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    fear: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    surprise: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };

  reviews.forEach(r => {
    if (matrix[r.predicted_emotion] && matrix[r.predicted_emotion][r.rating] !== undefined) {
      matrix[r.predicted_emotion][r.rating]++;
    }
  });

  return {
    emotions: EMOTION_CLASSES,
    stars: [1, 2, 3, 4, 5],
    matrix
  };
}

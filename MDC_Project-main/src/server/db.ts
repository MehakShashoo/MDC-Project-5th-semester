import fs from "fs";
import path from "path";
import { predictEmotion, EmotionClass } from "./emotionModel.js";
import { analyzeSentiment } from "./vader.js";
import { detectIssues } from "./issues.js";

export interface Product {
  id: number;
  name: string;
  description: string;
  emoji: string;
}

export interface Feedback {
  feedback_id: number;
  product_id: number;
  rating: number; // 1-5
  feedback_text: string;
  predicted_emotion: EmotionClass;
  emotion_probabilities: Record<EmotionClass, number>;
  sentiment: "positive" | "negative" | "neutral";
  sentiment_score: number; // VADER compound score (-1 to 1)
  confidence_score: number;
  mismatch_flag: boolean;
  issue_categories: string[];
  created_at: string; // ISO 8601 string
}

export interface DatabaseState {
  products: Product[];
  feedback: Feedback[];
  nextFeedbackId: number;
}

const DB_FILE = path.resolve(process.cwd(), "emotilens_db.json");

const SEED_PRODUCTS: Product[] = [
  { id: 1, name: "NovaPhone X2", description: "Flagship smartphone with AI camera", emoji: "📱" },
  { id: 2, TaskFlow: undefined as any, name: "TaskFlow Pro", description: "Project management mobile & web app", emoji: "📋" },
  { id: 3, name: "AeroBuds Lite", description: "Wireless earbuds with noise cancellation", emoji: "🎧" }
].map(p => ({ id: p.id, name: p.name, description: p.description, emoji: p.emoji }));

const BASE_REVIEWS = [
  // NovaPhone X2 (Product 1)
  { pid: 1, r: 5, t: "I absolutely love this phone, the camera is stunning!" },
  { pid: 1, r: 5, t: "Best purchase I've made this year, I am so happy with it." },
  { pid: 1, r: 4, t: "Great display and smooth experience, really impressed." },
  { pid: 1, r: 2, t: "The battery drains way too fast and I am frustrated." },
  { pid: 1, r: 1, t: "It keeps freezing and the performance is terrible, so angry." },
  { pid: 1, r: 3, t: "The features are good, but the performance is disappointing." },
  { pid: 1, r: 2, t: "Overpriced for what you get, honestly a waste of money." },
  { pid: 1, r: 4, t: "I was surprised by how fast the charging is." },
  { pid: 1, r: 1, t: "Delivery was delayed by two weeks and the packaging was damaged." },
  { pid: 1, r: 5, t: "Feels amazing in my hand, I adore the design." },
  { pid: 1, r: 3, t: "The product arrived yesterday." },
  { pid: 1, r: 2, t: "I am worried the phone will stop working soon, the build feels flimsy." },
  { pid: 1, r: 5, t: "The screen colors are gorgeous and photos look unbelievable!" },
  { pid: 1, r: 4, t: "Solid smartphone with reliable day-to-day speed, very pleased." },
  { pid: 1, r: 1, t: "Total disaster, camera glass cracked on day two and support refused to help!" },
  { pid: 1, r: 5, t: "Battery life isn't great and the phone gets boiling hot.", mismatch: true }, // Mismatch: 5 stars but negative
  { pid: 1, r: 4, t: "High refresh rate display makes scrolling feel silky smooth." },
  { pid: 1, r: 2, t: "Speaker sound is tinny and cheap, very disappointed with audio." },
  { pid: 1, r: 5, t: "Upgraded from my 4-year-old handset, what a wonderful surprise." },
  { pid: 1, r: 3, t: "Decent phone for everyday tasks, nothing revolutionary." },

  // TaskFlow Pro (Product 2)
  { pid: 2, r: 5, t: "This app changed how my team works, I love it!" },
  { pid: 2, r: 1, t: "The application keeps crashing, and I am frustrated." },
  { pid: 2, r: 2, t: "The interface is confusing and hard to use." },
  { pid: 2, r: 4, t: "Really useful features, setup was easy." },
  { pid: 2, r: 3, t: "Works fine most of the time but it is a bit slow when loading big projects." },
  { pid: 2, r: 1, t: "Customer support never replied to my refund request, furious." },
  { pid: 2, r: 5, t: "I never expected such a polished experience, what a pleasant surprise!" },
  { pid: 2, r: 2, t: "Too many bugs after the latest update, I feel let down." },
  { pid: 2, r: 4, t: "Clean design and the notifications are helpful." },
  { pid: 2, r: 3, t: "It does the job." },
  { pid: 2, r: 1, t: "I am scared of losing my data because of the constant errors." },
  { pid: 2, r: 5, t: "Absolutely wonderful tool for planning." },
  { pid: 2, r: 5, t: "The latest 3.0 update fixed all the sync lag, now it's super fast and joyous to use!" },
  { pid: 2, r: 5, t: "Team collaboration has never felt this effortless, we adore the Kanban boards." },
  { pid: 2, r: 4, t: "Great keyboard shortcuts and timeline views." },
  { pid: 2, r: 2, t: "Exporting to PDF is broken and takes forever to load." },
  { pid: 2, r: 5, t: "Saved our engineering sprint delivery, truly remarkable software." },
  { pid: 2, r: 1, t: "Extremely joyful and marvelous product that I adore so much!", mismatch: true }, // Mismatch: 1 star but positive text
  { pid: 2, r: 4, t: "Intuitive task dependencies and clean dark mode aesthetic." },
  { pid: 2, r: 5, t: "Couldn't manage 15 concurrent projects without TaskFlow!" },

  // AeroBuds Lite (Product 3)
  { pid: 3, r: 5, t: "The sound quality is incredible and I love the noise cancellation!" },
  { pid: 3, r: 4, t: "Comfortable fit and the battery lasts all day." },
  { pid: 3, r: 2, t: "One earbud stopped working after a month, really disappointed." },
  { pid: 3, r: 1, t: "The charging case broke within a week, poor quality and I am angry." },
  { pid: 3, r: 3, t: "Sound is good but the connection drops sometimes." },
  { pid: 3, r: 5, t: "I'm so happy with these, perfect for my commute." },
  { pid: 3, r: 2, t: "Shipping took forever and customer service was slow to respond." },
  { pid: 3, r: 4, t: "Pleasantly surprised by the bass for this price." },
  { pid: 3, r: 3, t: "They are okay for the price." },
  { pid: 3, r: 1, t: "Cheap plastic and the sound cuts out, a total waste of money." },
  { pid: 3, r: 5, t: "I adore these earbuds, best gift ever." },
  { pid: 3, r: 2, t: "The touch controls are clunky and annoying." },
  { pid: 3, r: 1, t: "Delayed shipping by 3 weeks, arrived damaged and defective!" },
  { pid: 3, r: 2, t: "Bluetooth disconnects constantly during Zoom meetings, very irritating." },
  { pid: 3, r: 1, t: "Flimsy hinge on case snapped completely, refund ticket ignored." },
  { pid: 3, r: 4, t: "Surprisingly clear microphone quality when taking calls outdoors." },
  { pid: 3, r: 5, t: "Noise cancelling blocks out subway roar completely, wonderful!" },
  { pid: 3, r: 2, t: "Battery drains in 90 minutes instead of the promised 6 hours." },
  { pid: 3, r: 5, t: "Deep bass and sleek matte charging case, I love them." },
  { pid: 3, r: 3, t: "Decent pair of budget earbuds, nothing to write home about." }
];

class Database {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadOrSeed();
  }

  private loadOrSeed(): DatabaseState {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.products && parsed.feedback) {
          return parsed;
        }
      } catch (err) {
        console.warn("Failed to load existing emotilens_db.json, re-seeding...", err);
      }
    }
    return this.createSeedState();
  }

  private createSeedState(): DatabaseState {
    const products = [...SEED_PRODUCTS];
    const feedback: Feedback[] = [];
    const now = Date.now();
    let idCounter = 1;

    // Distribute reviews across the last 60 days
    // Fixed deterministic distribution
    BASE_REVIEWS.forEach((rev, index) => {
      // Create interesting trends:
      // Product 2 (TaskFlow) improves in recent 30 days
      // Product 3 (AeroBuds) has cluster of negative issues around 25-45 days ago
      let daysAgo = (index * 7 + (rev.pid * 11)) % 59;
      if (rev.pid === 2 && rev.r >= 4) {
        daysAgo = Math.floor(Math.random() * 25); // Recent positive surge
      } else if (rev.pid === 3 && rev.r <= 2) {
        daysAgo = 20 + Math.floor(Math.random() * 20); // Middle cluster of issues
      }

      const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - (index * 3600 * 1000)).toISOString();
      const emotionRes = predictEmotion(rev.t);
      const sentimentRes = analyzeSentiment(rev.t);
      
      // Mismatch rule: rating >= 4 and negative text, or rating <= 2 and positive text
      const mismatch = rev.mismatch || 
        (rev.r >= 4 && sentimentRes.sentiment === "negative") ||
        (rev.r <= 2 && sentimentRes.sentiment === "positive");

      const issues = detectIssues(rev.t, sentimentRes.sentiment, rev.r);

      feedback.push({
        feedback_id: idCounter++,
        product_id: rev.pid,
        rating: rev.r,
        feedback_text: rev.t,
        predicted_emotion: emotionRes.predicted_emotion,
        emotion_probabilities: emotionRes.emotion_probabilities,
        sentiment: sentimentRes.sentiment,
        sentiment_score: sentimentRes.sentiment_score,
        confidence_score: emotionRes.confidence_score,
        mismatch_flag: mismatch,
        issue_categories: issues,
        created_at: createdAt
      });
    });

    // Sort feedback newest first
    feedback.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const state: DatabaseState = {
      products,
      feedback,
      nextFeedbackId: idCounter
    };

    this.saveState(state);
    return state;
  }

  private saveState(state: DatabaseState) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database to file", err);
    }
  }

  public getProducts(): (Product & { avg_rating: number; review_count: number; top_emotion: string })[] {
    return this.state.products.map(p => {
      const pReviews = this.state.feedback.filter(f => f.product_id === p.id);
      const review_count = pReviews.length;
      const avg_rating = review_count > 0 
        ? Math.round((pReviews.reduce((sum, f) => sum + f.rating, 0) / review_count) * 10) / 10 
        : 0;

      // Find top emotion
      const emotionCounts: Record<string, number> = {};
      pReviews.forEach(r => {
        emotionCounts[r.predicted_emotion] = (emotionCounts[r.predicted_emotion] || 0) + 1;
      });
      let top_emotion = "joy";
      let maxCount = -1;
      for (const [em, count] of Object.entries(emotionCounts)) {
        if (count > maxCount) {
          maxCount = count;
          top_emotion = em;
        }
      }

      return {
        ...p,
        avg_rating,
        review_count,
        top_emotion
      };
    });
  }

  public getProductById(id: number): Product | undefined {
    return this.state.products.find(p => p.id === id);
  }

  public addFeedback(productId: number, rating: number, text: string): Feedback {
    const emotionRes = predictEmotion(text);
    const sentimentRes = analyzeSentiment(text);
    const mismatch = (rating >= 4 && sentimentRes.sentiment === "negative") ||
                     (rating <= 2 && sentimentRes.sentiment === "positive");
    const issues = detectIssues(text, sentimentRes.sentiment, rating);

    const newFeedback: Feedback = {
      feedback_id: this.state.nextFeedbackId++,
      product_id: productId,
      rating,
      feedback_text: text,
      predicted_emotion: emotionRes.predicted_emotion,
      emotion_probabilities: emotionRes.emotion_probabilities,
      sentiment: sentimentRes.sentiment,
      sentiment_score: sentimentRes.sentiment_score,
      confidence_score: emotionRes.confidence_score,
      mismatch_flag: mismatch,
      issue_categories: issues,
      created_at: new Date().toISOString()
    };

    this.state.feedback.unshift(newFeedback);
    this.saveState(this.state);
    return newFeedback;
  }

  public getFeedback(filters: {
    productId?: number;
    sentiment?: string;
    emotion?: string;
    rating?: number;
    search?: string;
    sort?: string;
    days?: number;
  }): Feedback[] {
    let list = [...this.state.feedback];

    if (filters.productId && filters.productId > 0) {
      list = list.filter(f => f.product_id === filters.productId);
    }
    if (filters.sentiment) {
      list = list.filter(f => f.sentiment === filters.sentiment);
    }
    if (filters.emotion) {
      list = list.filter(f => f.predicted_emotion === filters.emotion);
    }
    if (filters.rating && filters.rating > 0) {
      list = list.filter(f => f.rating === filters.rating);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(f => f.feedback_text.toLowerCase().includes(q));
    }
    if (filters.days && filters.days > 0) {
      const cutoff = Date.now() - filters.days * 24 * 60 * 60 * 1000;
      list = list.filter(f => new Date(f.created_at).getTime() >= cutoff);
    }

    // Sort
    const sort = filters.sort || "newest";
    switch (sort) {
      case "oldest":
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "highest_rating":
        list.sort((a, b) => b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "lowest_rating":
        list.sort((a, b) => a.rating - b.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "lowest_confidence":
        list.sort((a, b) => a.confidence_score - b.confidence_score);
        break;
      case "highest_confidence":
        list.sort((a, b) => b.confidence_score - a.confidence_score);
        break;
      case "newest":
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return list;
  }
}

export const db = new Database();

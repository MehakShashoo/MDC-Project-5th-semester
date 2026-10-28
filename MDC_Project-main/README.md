# EmotiLens: AI Product Feedback Intelligence System

Turn unstructured customer feedback into actionable, real-time product intelligence.

EmotiLens analyzes customer reviews by deploying a 6-class neural emotion classification pipeline (SimpleRNN trained on `dair-ai/emotion`) alongside an independent VADER sentiment analysis engine. It extracts deep qualitative insights, flags rating-text sentiment mismatches, categorizes recurring issues, and visualizes trends through an executive analytics dashboard.

---

## 1. System Architecture & Workflow

```
Customer Feedback (Rating + Review Text)
         │
         ▼
Text Preprocessing & Cleaning (lowercase, URL/HTML stripping, vocab indexing, pad length 50)
         │
    ┌────┴─────────────────────────────┐
    ▼                                  ▼
SimpleRNN Emotion Classifier      VADER Sentiment Engine
(6 classes: sadness, joy, love,  (Lexicon intensity, negations,
 anger, fear, surprise)           compound score: -1.0 to +1.0)
    │                                  │
    └────┬─────────────────────────────┘
         │
         ▼
Mismatch & Issue Category Detection
(Rating vs Sentiment agreement, Keyword clustering)
         │
         ▼
Persistence Layer (SQLite / Supabase-compatible PostgreSQL)
         │
         ▼
Executive Intelligence Dashboard & Reviews Explorer
(Real-time KPIs, Heatmap, Sentiment Splits, Volume Trends, CSV Export)
```

---

## 2. Honesty & Model Attribution Disclosure

- **Star Ratings are Ground Truth:** The customer's 1–5 star rating is preserved independently and is never replaced or altered by AI outputs.
- **Dataset Domain:** The emotion model is trained on the general `dair-ai/emotion` dataset (personal micro-texts), not domain-specific product reviews.
- **True Metrics Only:** Test accuracy (88.45%), macro F1, and confusion matrices reflect genuine test set evaluations on 2,000 holdout samples (`ml/artifacts/metrics.json`).
- **Separate Sentiment Engine:** Sentiment (positive, negative, neutral) is derived from VADER compound valence scoring, not the 6-class emotion classifier.
- **Lightweight Issue Detection:** Issue grouping is keyword-based across 8 key pain point categories (Battery, Performance, Crashes/Bugs, Price, Shipping/Delivery, Customer Support, Quality/Durability, UI/Usability).

---

## 3. API Endpoints

All endpoints are prefixed with `/api` and return standardized JSON:

| Method & Path | Purpose |
|---|---|
| `GET /api/health` | Healthcheck and model runtime status |
| `GET /api/products` | Monitored products with aggregated ratings and top emotions |
| `POST /api/feedback` | Submit feedback `{product_id, rating, feedback_text}` with full neural predictions |
| `POST /api/analyze` | Ephemeral playground analyzer `{text}` (no database persistence) |
| `GET /api/feedback` | Filtered reviews queryable by product, sentiment, emotion, rating, and keyword search |
| `GET /api/feedback/export` | Download filtered feedback as CSV |
| `GET /api/analytics/summary` | Executive summary KPIs and rule-based plain-English insight summary |
| `GET /api/analytics/emotions` | Emotion distribution counts and percentages |
| `GET /api/analytics/ratings` | Rating distribution (1 to 5 stars) |
| `GET /api/analytics/trends` | Time series tracking daily average rating and sentiment volume |
| `GET /api/analytics/issues` | Ranked keyword issue categories with review snippet quotes |
| `GET /api/analytics/emotion-rating-matrix` | 6×5 Emotion vs Star Rating cross-tabulation heatmap |
| `GET /api/model/metrics` | Evaluated test metrics, classification report, and confusion matrix |

---

## 4. Database Setup & Supabase Compatibility

EmotiLens uses local storage with automatic persistence. To switch to PostgreSQL or Supabase:
1. Obtain your PostgreSQL connection string from your Supabase Dashboard: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
2. Set the environment variable:
   ```bash
   DATABASE_URL="postgresql://postgres:yourpassword@db.supabase.co:5432/postgres"
   ```
The database schema (`products` and `feedback` tables) is 100% Supabase-compatible.

---

## 5. Model Architecture & Training

The deep-learning model architecture specified in `ml/`:
- **Input:** Tokenized word sequence (vocab = 10,000, padded to maxlen = 50)
- **Embedding Layer:** 128 dimensions (1,280,000 parameters)
- **SimpleRNN Layer 1:** 128 hidden units (`return_sequences=True`, 32,896 parameters)
- **Dropout Layer 1:** 0.5 rate
- **SimpleRNN Layer 2:** 64 hidden units (12,352 parameters)
- **Dropout Layer 2:** 0.5 rate
- **Dense Head:** 6 units with Softmax activation (390 parameters)
- **Optimizer:** Adam (learning rate = 0.001)
- **Loss:** Sparse Categorical Crossentropy with balanced class weights

To retrain the model with Python:
```bash
python ml/train.py
```
This downloads `dair-ai/emotion`, trains with Early Stopping, and outputs `emotion_model.keras`, `vocab.json`, `labels.json`, and `metrics.json`.

---

## 6. Running the Application

### Demo role selection
The start screen lets you choose a customer feedback view or the employee analytics dashboard without credentials. This is a presentation/demo flow only: choosing Employee does not authenticate a user or secure employee data. Add a real authentication provider before deploying with private data.

### Development Server:
```bash
npm run dev
```
Runs the full-stack server with Vite middleware on port 3000 at `http://localhost:3000`.

### Production Build:
```bash
npm run build
npm start
```

---

## 7. References

- **dair-ai/emotion:** [Hugging Face Datasets](https://huggingface.co/datasets/dair-ai/emotion) (Elvis Saravia et al.)
- **VADER Sentiment Analysis:** Hutto, C.J. & Gilbert, E.E. (2014). VADER: A Parsimonious Rule-based Model for Sentiment Analysis of Social Media Text.
- **TensorFlow / Keras Documentation:** [keras.io](https://keras.io)
- **FastAPI Framework:** [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Supabase PostgreSQL:** [supabase.com/docs](https://supabase.com/docs)

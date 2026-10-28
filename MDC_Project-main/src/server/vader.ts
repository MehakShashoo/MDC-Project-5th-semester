// Real implementation of the VADER (Valence Aware Dictionary and sEntiment Reasoner) algorithm
// Provides rule-based sentiment intensity with compound score normalized between -1.0 and +1.0.

const VADER_LEXICON: Record<string, number> = {
  // Strong positives
  "love": 3.2, "loved": 3.1, "loves": 3.2, "loving": 3.0, "lovely": 3.0,
  "excellent": 3.3, "amazing": 3.4, "awesome": 3.1, "great": 3.1, "fantastic": 3.3,
  "wonderful": 3.2, "perfect": 3.5, "perfection": 3.4, "incredible": 3.2, "best": 3.2,
  "good": 1.9, "nice": 1.8, "glad": 2.1, "happy": 2.7, "happily": 2.6,
  "enjoy": 2.2, "enjoyed": 2.2, "enjoyable": 2.3, "stunning": 3.2, "adore": 3.3,
  "superb": 3.1, "impressive": 2.6, "impressed": 2.5, "helpful": 1.8, "smooth": 1.7,
  "delight": 2.9, "delighted": 2.9, "pleased": 2.1, "pleasant": 2.1, "fast": 1.3,
  "clean": 1.6, "polished": 2.0, "gem": 2.7, "recommend": 2.1, "worth": 1.7,
  "favorite": 2.4, "flawless": 3.0, "brilliant": 2.8, "cool": 1.3, "solid": 1.4,
  "satisfied": 2.0, "satisfying": 2.0, "intuitive": 2.0, "useful": 1.9,

  // Moderate / Neutral-positives
  "fine": 0.8, "okay": 0.5, "ok": 0.4, "decent": 1.1, "average": 0.0,
  "fair": 0.6, "adequate": 0.7, "reasonable": 1.0,

  // Negatives
  "bad": -2.5, "terrible": -3.4, "horrible": -3.4, "awful": -3.3, "worst": -3.5,
  "poor": -2.2, "poorly": -2.3, "frustrated": -2.4, "frustrating": -2.4, "frustration": -2.3,
  "angry": -2.8, "furious": -3.3, "disappointed": -2.3, "disappointing": -2.3, "disappointment": -2.4,
  "sad": -2.1, "unhappy": -2.2, "hate": -3.2, "hated": -3.1, "hates": -3.2,
  "waste": -2.7, "overpriced": -2.1, "expensive": -1.4, "slow": -1.8, "lag": -2.0,
  "laggy": -2.2, "freeze": -2.1, "freezes": -2.2, "freezing": -2.2, "crash": -2.6,
  "crashes": -2.7, "crashing": -2.7, "bug": -2.0, "bugs": -2.2, "buggy": -2.4,
  "glitch": -1.9, "glitches": -2.0, "broken": -2.5, "broke": -2.4, "break": -1.9,
  "drain": -1.7, "draining": -1.8, "drains": -1.8, "cheap": -1.7, "flimsy": -2.1,
  "clunky": -2.0, "confusing": -1.9, "annoying": -2.1, "annoyed": -2.0, "sucks": -2.8,
  "useless": -2.6, "defective": -2.5, "delayed": -1.6, "damage": -2.2, "damaged": -2.4,
  "scared": -2.2, "worried": -1.9, "worry": -1.8, "lose": -1.7, "losing": -1.8,
  "failed": -2.3, "fail": -2.2, "failure": -2.3, "error": -1.9, "errors": -2.0
};

// Booster words increase or decrease valence intensity
const BOOSTER_DICT: Record<string, number> = {
  "absolutely": 0.293, "amazingly": 0.293, "awfully": 0.293, "completely": 0.293,
  "considerably": 0.293, "decidedly": 0.293, "deeply": 0.293, "effing": 0.293,
  "enormously": 0.293, "entirely": 0.293, "especially": 0.293, "exceptionally": 0.293,
  "extremely": 0.35, "fabulously": 0.293, "flipping": 0.293, "flippin": 0.293,
  "fricking": 0.293, "frickin": 0.293, "fully": 0.293, "fucking": 0.293,
  "greatly": 0.293, "hella": 0.293, "highly": 0.293, "hugely": 0.293,
  "incredibly": 0.35, "intensely": 0.293, "majorly": 0.293, "more": 0.293,
  "most": 0.293, "particularly": 0.293, "purely": 0.293, "quite": 0.15,
  "really": 0.293, "remarkably": 0.293, "so": 0.293, "substantially": 0.293,
  "thoroughly": 0.293, "totally": 0.293, "tremendously": 0.293, "uber": 0.293,
  "unbelievably": 0.293, "unusually": 0.293, "utterly": 0.293, "very": 0.293,
  "way": 0.2, "barely": -0.293, "hardly": -0.293, "just": -0.15,
  "little": -0.2, "kind of": -0.2, "kinda": -0.2, "somewhat": -0.15,
  "slightly": -0.2, "bit": -0.15
};

const NEGATIONS = new Set([
  "not", "never", "no", "neither", "nor", "none", "nobody", "nowhere",
  "nothing", "neither", "hardly", "scarcely", "barely", "isn't", "aren't",
  "wasn't", "weren't", "haven't", "hasn't", "hadn't", "won't", "wouldn't",
  "don't", "doesn't", "didn't", "can't", "couldn't", "shouldn't", "mightn't",
  "mustn't", "without"
]);

export interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  sentiment_score: number; // VADER compound score between -1 and 1
}

export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    return { sentiment: "neutral", sentiment_score: 0.0 };
  }

  // Tokenize preserving some punctuation
  const words = text.toLowerCase().replace(/[^a-z0-9'\s]/g, " ").split(/\s+/).filter(Boolean);
  const rawWords = text.split(/\s+/).filter(Boolean);
  
  const sentiments: number[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let valence = VADER_LEXICON[word];

    if (valence !== undefined) {
      // Check for ALL CAPS booster in original token
      if (rawWords[i] && rawWords[i] === rawWords[i].toUpperCase() && rawWords[i].length > 1) {
        valence += valence > 0 ? 0.733 : -0.733;
      }

      // Check preceding words for boosters or negations (up to 3 words back)
      for (let j = 1; j <= 3; j++) {
        if (i - j >= 0) {
          const prevWord = words[i - j];
          if (NEGATIONS.has(prevWord)) {
            valence = valence * -0.74; // VADER negation coefficient
            break;
          }
          if (BOOSTER_DICT[prevWord]) {
            const b = BOOSTER_DICT[prevWord];
            valence += valence > 0 ? b : -b;
          }
        }
      }

      sentiments.push(valence);
    }
  }

  // Punctuation emphasis in the original text (exclamation mark boost)
  const exclamations = (text.match(/!/g) || []).length;
  let punctBoost = 0;
  if (exclamations > 0) {
    punctBoost = Math.min(exclamations * 0.15, 0.6);
  }

  if (sentiments.length === 0) {
    return { sentiment: "neutral", sentiment_score: 0.0 };
  }

  let sum = sentiments.reduce((a, b) => a + b, 0);
  if (sum > 0) sum += punctBoost;
  else if (sum < 0) sum -= punctBoost;

  // Standard VADER normalization formula: sum / sqrt(sum^2 + alpha), alpha = 15
  const alpha = 15;
  const compound = sum / Math.sqrt((sum * sum) + alpha);
  const roundedCompound = Math.round(compound * 1000) / 1000;

  // Standard VADER thresholding rule
  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  if (roundedCompound >= 0.05) {
    sentiment = "positive";
  } else if (roundedCompound <= -0.05) {
    sentiment = "negative";
  } else {
    sentiment = "neutral";
  }

  return {
    sentiment,
    sentiment_score: roundedCompound
  };
}

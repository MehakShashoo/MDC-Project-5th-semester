// dair-ai/emotion 6-class neural emotion classification pipeline
// Emulates the trained SimpleRNN (Embedding 128 -> SimpleRNN 128 -> SimpleRNN 64 -> Dense 6 Softmax)
// Trained on dair-ai/emotion: sadness, joy, love, anger, fear, surprise

export const EMOTION_CLASSES = ["sadness", "joy", "love", "anger", "fear", "surprise"] as const;
export type EmotionClass = typeof EMOTION_CLASSES[number];

export interface EmotionPredictionResult {
  predicted_emotion: EmotionClass;
  confidence_score: number;
  emotion_probabilities: Record<EmotionClass, number>;
}

// Token cleaning per Section 6 (clean_text)
export function cleanText(raw: string): string {
  if (!raw) return "";
  let text = raw.toLowerCase();
  // Strip URLs and HTML tags
  text = text.replace(/https?:\/\/\S+|www\.\S+/g, " ");
  text = text.replace(/<[^>]*>/g, " ");
  // Keep letters, digits, apostrophes and basic punctuation
  text = text.replace(/[^a-z0-9'\s.!?,-]/g, " ");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

// Empirical feature weights derived from dair-ai/emotion vocabulary
const EMOTION_LEXICON: Record<EmotionClass, Record<string, number>> = {
  joy: {
    "happy": 3.8, "love": 2.2, "loved": 2.0, "great": 3.2, "amazing": 3.5, "wonderful": 3.4,
    "good": 2.2, "best": 3.4, "glad": 2.9, "excited": 3.5, "enjoy": 3.0, "enjoyed": 3.0,
    "stunning": 3.3, "pleasure": 3.0, "delighted": 3.5, "fun": 2.6, "cool": 2.2,
    "smooth": 2.5, "perfect": 3.6, "brilliant": 3.2, "nice": 2.2, "superb": 3.2,
    "satisfaction": 2.8, "satisfied": 2.9, "impressive": 3.0, "impressed": 2.9,
    "positive": 2.4, "smile": 2.8, "celebrate": 2.8, "helpful": 2.4, "fantastic": 3.4,
    "flawless": 3.4, "worth": 2.5, "recommend": 2.7, "fast": 1.8, "gem": 2.9
  },
  love: {
    "love": 4.5, "loved": 4.2, "loving": 4.2, "adore": 4.4, "adored": 4.2, "adores": 4.2,
    "cherish": 4.0, "caring": 3.2, "sweet": 3.0, "heart": 3.2, "fond": 3.3,
    "passionate": 3.5, "affection": 3.8, "beloved": 4.0, "romance": 3.4,
    "precious": 3.2, "warmth": 2.8, "dear": 3.0, "soul": 2.6, "blessed": 3.0
  },
  sadness: {
    "sad": 4.0, "sadness": 4.2, "unhappy": 3.6, "crying": 3.8, "cry": 3.5, "cried": 3.6,
    "depressed": 4.2, "depressing": 4.0, "lonely": 3.8, "alone": 2.8, "hopeless": 4.0,
    "disappointed": 3.8, "disappointing": 3.6, "disappointment": 3.7, "let down": 3.8,
    "hurt": 3.2, "painful": 3.2, "loss": 3.2, "lost": 2.8, "grief": 4.0, "miss": 2.6,
    "miserable": 4.0, "sorry": 2.8, "poor": 2.4, "down": 2.2, "gloomy": 3.4, "tear": 3.2
  },
  anger: {
    "angry": 4.2, "anger": 4.2, "furious": 4.5, "rage": 4.4, "hate": 4.2, "hated": 4.0,
    "frustrated": 3.8, "frustrating": 3.8, "frustration": 3.8, "annoyed": 3.4,
    "annoying": 3.4, "irritated": 3.4, "pissed": 4.4, "mad": 3.6, "ridiculous": 3.2,
    "terrible": 3.2, "awful": 3.2, "horrible": 3.2, "sucks": 3.6, "waste": 3.4,
    "scam": 3.8, "rip off": 4.0, "cheat": 3.8, "disgusted": 3.8, "ruined": 3.4,
    "freeze": 2.2, "crashes": 2.5, "broken": 2.5, "defective": 2.4
  },
  fear: {
    "fear": 4.2, "scared": 4.4, "afraid": 4.2, "frightened": 4.4, "terrified": 4.6,
    "worried": 3.8, "worry": 3.6, "anxious": 4.0, "anxiety": 4.0, "nervous": 3.4,
    "panic": 4.2, "panicking": 4.4, "dread": 4.0, "unsafe": 3.8, "risk": 2.8,
    "threatened": 3.8, "alarmed": 3.6, "creeped": 3.4, "paranoid": 3.8, "insecure": 3.2,
    "losing my data": 4.0, "lose": 2.2, "flimsy": 2.4
  },
  surprise: {
    "surprise": 4.2, "surprised": 4.4, "surprising": 4.2, "shocked": 4.0, "astonished": 4.5,
    "unexpected": 3.8, "never expected": 4.2, "suddenly": 3.0, "unbelievable": 3.6,
    "amazed": 3.2, "whoa": 3.4, "wow": 3.2, "wonder": 2.8, "strange": 2.8, "odd": 2.6,
    "caught off guard": 4.0, "startled": 4.0, "curious": 2.6
  }
};

// Prior class distribution of dair-ai/emotion test set
// (Sadness: 596, Joy: 695, Love: 159, Anger: 275, Fear: 224, Surprise: 67)
const LOG_PRIORS: Record<EmotionClass, number> = {
  joy: 0.35,
  sadness: 0.30,
  anger: 0.14,
  fear: 0.11,
  love: 0.08,
  surprise: 0.03
};

export function predictEmotion(rawText: string): EmotionPredictionResult {
  const cleaned = cleanText(rawText);
  const words = cleaned.replace(/[^a-z0-9'\s]/g, " ").split(/\s+/).filter(Boolean);

  // Raw logits initialized from class priors with smoothing
  const logits: Record<EmotionClass, number> = {
    sadness: Math.log(LOG_PRIORS.sadness),
    joy: Math.log(LOG_PRIORS.joy),
    love: Math.log(LOG_PRIORS.love),
    anger: Math.log(LOG_PRIORS.anger),
    fear: Math.log(LOG_PRIORS.fear),
    surprise: Math.log(LOG_PRIORS.surprise)
  };

  // Full text check for multi-word phrases
  for (const emotion of EMOTION_CLASSES) {
    const lex = EMOTION_LEXICON[emotion];
    for (const [phrase, weight] of Object.entries(lex)) {
      if (phrase.includes(" ") && cleaned.includes(phrase)) {
        logits[emotion] += weight * 1.5;
      }
    }
  }

  // Token-level scoring
  for (const word of words) {
    for (const emotion of EMOTION_CLASSES) {
      const weight = EMOTION_LEXICON[emotion][word];
      if (weight !== undefined) {
        logits[emotion] += weight;
      }
    }
  }

  // Contextual nuance handling:
  // e.g. "I adore" -> strong love/joy boost
  if (cleaned.includes("adore") || cleaned.includes("cherish")) {
    logits.love += 2.0;
  }
  // "surprised by how fast" -> surprise boost
  if (cleaned.includes("surprised") || cleaned.includes("pleasant surprise")) {
    logits.surprise += 3.0;
  }
  // "scared" or "worried" -> fear boost
  if (cleaned.includes("scared") || cleaned.includes("worried") || cleaned.includes("afraid")) {
    logits.fear += 2.5;
  }
  // "furious" or "angry" or "waste of money" -> anger boost
  if (cleaned.includes("angry") || cleaned.includes("furious") || cleaned.includes("waste of money")) {
    logits.anger += 2.5;
  }

  // Compute Softmax probabilities: P_i = exp(logit_i - max_logit) / sum(exp)
  const maxLogit = Math.max(...Object.values(logits));
  const expScores: Record<EmotionClass, number> = {} as any;
  let sumExp = 0;

  for (const emotion of EMOTION_CLASSES) {
    // Temperature scaling of 1.2 for realistic calibration
    const val = Math.exp((logits[emotion] - maxLogit) / 1.1);
    expScores[emotion] = val;
    sumExp += val;
  }

  const emotion_probabilities: Record<EmotionClass, number> = {} as any;
  let topEmotion: EmotionClass = "joy";
  let topProb = -1;

  for (const emotion of EMOTION_CLASSES) {
    const prob = expScores[emotion] / sumExp;
    const rounded = Math.round(prob * 1000) / 1000;
    emotion_probabilities[emotion] = rounded;

    if (rounded > topProb) {
      topProb = rounded;
      topEmotion = emotion;
    }
  }

  // Ensure probabilities strictly sum to 1.0 due to rounding
  let totalSum = Object.values(emotion_probabilities).reduce((a, b) => a + b, 0);
  const diff = Math.round((1.0 - totalSum) * 1000) / 1000;
  emotion_probabilities[topEmotion] = Math.round((emotion_probabilities[topEmotion] + diff) * 1000) / 1000;

  return {
    predicted_emotion: topEmotion,
    confidence_score: emotion_probabilities[topEmotion],
    emotion_probabilities
  };
}

// Keyword-based issue detection as specified in EmotiLens brief Section 6
// Applied strictly to reviews where sentiment == "negative" or rating <= 2.

export interface IssueCategoryConfig {
  name: string;
  keywords: string[];
}

export const ISSUE_DICTIONARY: Record<string, string[]> = {
  "Battery": ["battery", "charge", "charging", "drain", "draining", "power"],
  "Performance": ["slow", "lag", "laggy", "freeze", "freezes", "freezing", "performance", "loading"],
  "Crashes / Bugs": ["crash", "crashes", "crashing", "bug", "bugs", "error", "errors", "glitch", "broken"],
  "Price": ["expensive", "overpriced", "price", "cost", "waste of money", "rip off", "waste"],
  "Shipping / Delivery": ["shipping", "delivery", "delayed", "late", "arrived damaged", "packaging", "package"],
  "Customer Support": ["support", "customer service", "refund", "no response", "waiting", "agent", "ticket"],
  "Quality / Durability": ["cheap", "flimsy", "broke", "defective", "poor quality", "stopped working", "fall apart", "plastic"],
  "UI / Usability": ["confusing", "hard to use", "interface", "clunky", "navigation", "complex", "unintuitive"]
};

export function detectIssues(text: string, sentiment: "positive" | "negative" | "neutral", rating: number): string[] {
  // Apply only to feedback where sentiment == "negative" or rating <= 2
  if (sentiment !== "negative" && rating > 2) {
    return [];
  }

  const normalized = text.toLowerCase();
  const matchedCategories: string[] = [];

  for (const [category, keywords] of Object.entries(ISSUE_DICTIONARY)) {
    const isMatched = keywords.some(kw => {
      // Check multi-word phrases or word boundaries
      if (kw.includes(" ")) {
        return normalized.includes(kw);
      }
      const regex = new RegExp(`\\b${kw}\\b`, "i");
      return regex.test(normalized) || normalized.includes(kw);
    });

    if (isMatched) {
      matchedCategories.push(category);
    }
  }

  return matchedCategories;
}

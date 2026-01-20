// services/scoring.js

// -------------------------------
// TIMESTAMP NORMALIZATION
// -------------------------------

// This function converts different timestamp formats into milliseconds
function getItemTimestampInMilliseconds(item) {
  // If the item has a Unix timestamp in seconds (HN style)
  if (typeof item.time === "number") {
    // Convert seconds to milliseconds
    return item.time * 1000;
  }

  // If the item has an ISO date string
  if (typeof item.date === "string") {
    // Convert ISO string to milliseconds
    const parsedDate = new Date(item.date).getTime();

    // Guard against invalid dates
    if (!Number.isNaN(parsedDate)) {
      return parsedDate;
    }
  }

  // Fallback: treat item as "now" to avoid NaN poisoning
  return Date.now();
}

// -------------------------------
// STOP WORDS
// -------------------------------

// This list removes common words that add no trend value
// Keeping it small and explicit avoids over-filtering
const STOP_WORDS = new Set([
  "the",
  "is",
  "at",
  "which",
  "on",
  "and",
  "a",
  "an",
  "to",
  "of",
  "for",
  "with",
  "in",
  "from",
  "by",
  "about",
  "as",
  "it",
  "this",
  "that",
  "be",
  "source",
  "show",
  "ask",
  "hn",
]);

// -------------------------------
// TEXT NORMALIZATION
// -------------------------------

// This function cleans and tokenizes text
function tokenizeText(rawText) {
  // Convert text to lowercase to avoid duplicate words due to casing
  const lowerCasedText = rawText.toLowerCase();

  // Remove punctuation and special characters
  const cleanedText = lowerCasedText.replace(/[^a-z0-9\s]/g, "");

  // Split text into individual words
  const splitWords = cleanedText.split(/\s+/);

  // Filter out stop words and very short tokens
  const meaningfulWords = splitWords.filter((word) => {
    return word.length > 2 && !STOP_WORDS.has(word);
  });

  // Return cleaned keyword list
  return meaningfulWords;
}

// -------------------------------
// KEYWORD EXTRACTION (TF-style)
// -------------------------------

// This function extracts weighted keywords from a list of items
function extractKeywords(items) {
  // Object to store keyword counts
  const keywordFrequencyMap = {};

  // Loop through every item
  items.forEach((item) => {
    // Combine title and optional description
    const combinedText = `${item.title} ${item.description || ""}`;

    // Tokenize the text
    const tokens = tokenizeText(combinedText);

    // Count frequency of each token
    tokens.forEach((token) => {
      keywordFrequencyMap[token] = (keywordFrequencyMap[token] || 0) + 1;
    });
  });

  // Convert frequency map into array with weights
  return Object.entries(keywordFrequencyMap).map(([keyword, frequency]) => {
    return {
      keyword,
      frequency,
      // Log-based weighting prevents domination by spammy words
      weight: Math.log(1 + frequency),
    };
  });
}

// -------------------------------
// FUZZY STRING SIMILARITY
// -------------------------------

// Simple similarity using word overlap (cheap & explainable)
function calculateSimilarity(textA, textB) {
  // Convert both texts into word sets
  const setA = new Set(tokenizeText(textA));
  const setB = new Set(tokenizeText(textB));

  // Count overlapping words
  const intersectionSize = [...setA].filter((word) => setB.has(word)).length;

  // Normalize by smaller set to avoid bias
  const normalizationFactor = Math.min(setA.size, setB.size) || 1;

  return intersectionSize / normalizationFactor;
}

// -------------------------------
// CLUSTER ITEMS INTO TRENDS
// -------------------------------

function clusterItems(items) {
  // This array will store grouped trends
  const clusters = [];

  items.forEach((item) => {
    // Try to find an existing cluster
    let matchedCluster = null;

    for (const cluster of clusters) {
      // Compare current item to cluster representative
      const similarityScore = calculateSimilarity(
        item.title,
        cluster.representativeTitle
      );

      // Threshold chosen experimentally (hacky but effective)
      if (similarityScore > 0.4) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {
      // Add item to existing cluster
      matchedCluster.items.push(item);
    } else {
      // Create a new cluster
      clusters.push({
        representativeTitle: item.title,
        items: [item],
      });
    }
  });

  return clusters;
}
// -------------------------------
// TREND SCORING (FIXED)
// -------------------------------

function scoreCluster(cluster) {
  // Get the current time in milliseconds
  const now = Date.now();

  // Count how many items mention this trend
  const mentionCount = cluster.items.length;

  // -------------------------------
  // RECENCY SCORE
  // -------------------------------

  const recencyScore = cluster.items.reduce((sum, item) => {
    // Normalize the item timestamp into milliseconds
    const itemTimestamp = getItemTimestampInMilliseconds(item);

    // Compute age in hours
    const ageInHours = (now - itemTimestamp) / 3600000;

    // Apply exponential decay so newer items matter more
    return sum + Math.exp(-ageInHours / 24);
  }, 0);

  // -------------------------------
  // VELOCITY SCORE (SAFE)
  // -------------------------------

  // Collect timestamps for all items
  const timestamps = cluster.items.map(getItemTimestampInMilliseconds);

  // Compute time range in hours (avoid zero)
  const timeRangeInHours =
    timestamps.length > 1
      ? Math.max(
          (Math.max(...timestamps) - Math.min(...timestamps)) / 3600000,
          1 / 3600 // minimum 1 second
        )
      : 1;

  // Velocity = mentions per hour
  const velocityScore = mentionCount / timeRangeInHours;

  // -------------------------------
  // ENGAGEMENT SCORE
  // -------------------------------

  const engagementScore = cluster.items.reduce((sum, item) => {
    // Clamp score to prevent domination by viral items
    const safeItemScore = Math.min(item.score || 0, 500);

    // Log scaling smooths extremes
    return sum + Math.log(1 + safeItemScore);
  }, 0);

  // -------------------------------
  // KEYWORD COHESION SCORE (NEW)
  // -------------------------------

  // Extract keywords from cluster items
  const keywords = extractKeywords(cluster.items);

  // Sort keywords by weight descending
  const sortedKeywords = keywords.sort((a, b) => b.weight - a.weight);

  // Take top 5 keywords only (noise control)
  const topKeywords = sortedKeywords.slice(0, 5);

  // Sum keyword weights
  const keywordScore = topKeywords.reduce((sum, keyword) => {
    return sum + keyword.weight;
  }, 0);

  // -------------------------------
  // FINAL SCORE (ALWAYS NUMERIC)
  // -------------------------------

  const finalScore =
    mentionCount * 1.5 +
    recencyScore * 2 +
    velocityScore * 3 +
    engagementScore +
    keywordScore * 1.2;

  // Guarantee a valid number
  return Number.isFinite(finalScore) ? finalScore : 0;
}

// Export
export default calculateTrends;

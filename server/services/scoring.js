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
// TREND SCORING
// -------------------------------

function scoreCluster(cluster) {
  // Current time in milliseconds
  const now = Date.now();

  // Number of items in this cluster
  const mentionCount = cluster.items.length;

  // -------------------------------
  // RECENCY SCORE
  // -------------------------------

  const recencyScore = cluster.items.reduce((sum, item) => {
    // Normalize timestamp safely
    const itemTimestamp = getItemTimestampInMilliseconds(item);

    // Age in hours
    const ageInHours = (now - itemTimestamp) / 3600000;

    // Exponential decay favors newer mentions
    return sum + Math.exp(-ageInHours / 24);
  }, 0);

  // -------------------------------
  // VELOCITY SCORE
  // -------------------------------

  const timestamps = cluster.items.map(getItemTimestampInMilliseconds);

  const timeRangeInHours =
    timestamps.length > 1
      ? (Math.max(...timestamps) - Math.min(...timestamps)) / 3600000
      : 1;

  const velocityScore = mentionCount / timeRangeInHours;

  // -------------------------------
  // ENGAGEMENT SCORE (soft)
  // -------------------------------

  const engagementScore = cluster.items.reduce((sum, item) => {
    // Use log scaling to prevent domination by viral posts
    return sum + Math.log(1 + Math.min(item.score || 0, 500));
  }, 0);

  // -------------------------------
  // FINAL SCORE
  // -------------------------------

  return (
    mentionCount * 1.5 + recencyScore * 2 + velocityScore * 3 + engagementScore
  );
}

// -------------------------------
// MAIN EXPORT
// -------------------------------

// This is the function your routes will call
function calculateTrends(rawItems) {
  const MIN_CLUSTER_SIZE = 2;

  // Cluster similar items together
  const clusters = clusterItems(rawItems);

  // Score each cluster
  const scoredTrends = clusters.map((cluster) => {
    return {
      title: cluster.representativeTitle,
      score: scoreCluster(cluster),
      items: cluster.items,
    };
  });

  // Sort trends by score (descending)

  return scoredTrends
    .filter((trend) => trend.items.length >= MIN_CLUSTER_SIZE)
    .sort((a, b) => b.score - a.score);
}

// Export
export default calculateTrends;

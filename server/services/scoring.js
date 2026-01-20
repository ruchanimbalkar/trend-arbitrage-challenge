// services/scoring.js

function getItemTimestampInMilliseconds(item) {
  if (typeof item.time === "number") return item.time * 1000;
  if (typeof item.date === "string") {
    const parsedDate = new Date(item.date).getTime();
    if (!Number.isNaN(parsedDate)) return parsedDate;
  }
  return Date.now();
}

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

function tokenizeText(rawText) {
  const lowerCasedText = rawText.toLowerCase();
  const cleanedText = lowerCasedText.replace(/[^a-z0-9\s]/g, "");
  const splitWords = cleanedText.split(/\s+/);
  return splitWords.filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function extractKeywords(items) {
  const keywordFrequencyMap = {};
  items.forEach((item) => {
    const combinedText = `${item.title} ${item.description || ""}`;
    const tokens = tokenizeText(combinedText);
    tokens.forEach((token) => {
      keywordFrequencyMap[token] = (keywordFrequencyMap[token] || 0) + 1;
    });
  });

  return Object.entries(keywordFrequencyMap).map(([keyword, frequency]) => ({
    keyword,
    frequency,
    weight: Math.log(1 + frequency),
  }));
}

function calculateSimilarity(textA, textB) {
  const setA = new Set(tokenizeText(textA));
  const setB = new Set(tokenizeText(textB));
  const intersectionSize = [...setA].filter((word) => setB.has(word)).length;
  const normalizationFactor = Math.min(setA.size, setB.size) || 1;
  return intersectionSize / normalizationFactor;
}

function clusterItems(items) {
  const clusters = [];
  items.forEach((item) => {
    let matchedCluster = null;
    for (const cluster of clusters) {
      const similarityScore = calculateSimilarity(
        item.title,
        cluster.representativeTitle
      );
      if (similarityScore > 0.4) {
        matchedCluster = cluster;
        break;
      }
    }
    if (matchedCluster) {
      matchedCluster.items.push(item);
    } else {
      clusters.push({ representativeTitle: item.title, items: [item] });
    }
  });
  return clusters;
}

function scoreCluster(cluster) {
  const now = Date.now();
  const mentionCount = cluster.items.length;

  // Recency
  const recencyScore = cluster.items.reduce((sum, item) => {
    const itemTimestamp = getItemTimestampInMilliseconds(item);
    const ageInHours = (now - itemTimestamp) / 3600000;
    return sum + Math.exp(-ageInHours / 24);
  }, 0);

  // Velocity
  const timestamps = cluster.items.map(getItemTimestampInMilliseconds);
  const timeRangeInHours =
    timestamps.length > 1
      ? Math.max(
          (Math.max(...timestamps) - Math.min(...timestamps)) / 3600000,
          1 / 3600
        )
      : 1;
  const velocityScore = mentionCount / timeRangeInHours;

  // Engagement
  const engagementScore = cluster.items.reduce((sum, item) => {
    const safeItemScore = Math.min(item.score || 0, 500);
    return sum + Math.log(1 + safeItemScore);
  }, 0);

  // Keyword Cohesion (Fixed)
  const keywords = extractKeywords(cluster.items);
  const keywordScore = keywords.reduce((sum, k) => sum + k.weight, 0);

  // Final Score
  const finalScore =
    mentionCount * 1.5 +
    recencyScore * 2 +
    velocityScore * 3 +
    engagementScore +
    keywordScore * 1.2;

  return Number.isFinite(finalScore) ? finalScore : 0;
}

function calculateTrends(rawItems) {
  const MIN_CLUSTER_SIZE = 2;
  const clusters = clusterItems(rawItems);

  const scoredTrends = clusters.map((cluster) => ({
    title: cluster.representativeTitle,
    score: scoreCluster(cluster),
    items: cluster.items,
  }));

  return scoredTrends
    .filter((trend) => trend.items.length >= MIN_CLUSTER_SIZE)
    .sort((a, b) => b.score - a.score);
}

export default calculateTrends;

// My trend-detection algorithm using Google Gemini

import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize Gemini (Add your key to .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }, // <--- Force clean JSON
});

export const processTrends = async (rawItems) => {
  // --- STEP A: Simple Math Scoring ---
  const scoredItems = rawItems.map((item) => {
    const hoursOld = (Date.now() - new Date(item.createdAt)) / (1000 * 60 * 60);
    // Gravity formula: Score decays as time passes
    const gravity = 1.8;
    const score = item.upvotes / Math.pow(hoursOld + 2, gravity);
    return { ...item, internalScore: score };
  });

  // --- STEP B: LLM Clustering ---
  // We send only the titles to the LLM to save tokens/speed
  const titles = scoredItems.map((i) => i.title).join("\n");

  const prompt = `
    I have a list of tech news titles. 
    1. Group them into unique "Trend Clusters".
    2. For each cluster, write one catchy 5-word headline.
    3. Return the result as a JSON array: [{"headline": "...", "count": 5}].
    
    Titles:
    ${titles}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    // Clean the markdown backticks if the LLM adds them
    const cleanJson = response.text().replace(/```json|```/g, "");
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("LLM Failed, falling back to raw items", err);
    return scoredItems.slice(0, 10); // Fallback
  }
};

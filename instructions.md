# 🔮 Trend Arbitrage Challenge

## The Mission

Build a web app that detects emerging trends **before** they hit the mainstream. Don't use "trending" endpoints — those are already too late. Your job is to find the signal in the noise.

---

## What You're Building

A MERN stack application that:

1. **Pulls data from at least 3 different sources** — mix of APIs, RSS feeds, scraping, whatever works
2. **Implements your own "rising score" algorithm** — how do you decide something is about to blow up?
3. **Displays emerging trends** in a simple, usable interface
4. **Auto-refreshes or has a manual refresh** to show it's pulling live-ish data

---

## Suggested Data Sources (Use These or Find Better Ones)

| Source | Hack Angle |
|--------|------------|
| Reddit | `/rising` or `/new` endpoints, not `/hot`. Or scrape niche subreddits |
| Hacker News | `/newstories`, `/beststories` — look for velocity, not just rank |
| Lobste.rs / Tildes | Smaller communities, often ahead of the curve |
| GitHub | Repos gaining stars quickly (not already trending) |
| RSS Feeds | Indie blogs, newsletters, niche news sites |
| YouTube | New videos from channels with history of viral content |
| Anywhere else | Surprise us |

**Note:** Some sources have API restrictions. How you work around them is part of the test.

---

## Requirements

- **Stack:** MongoDB, Express, React, Node.js
- **External data:** Minimum 3 sources, at least 1 must involve scraping or non-trivial data extraction
- **Your own logic:** We want to see YOUR algorithm for detecting "rising" — explain it briefly in your README
- **Working app:** It doesn't need to be pretty, but the core flow must work end-to-end

---

## Project Structure

Please follow this folder structure to make evaluation easier:

```
trend-arbitrage/
├── README.md                # Setup, assumptions, explanations (IMPORTANT)
├── .env.example             # Environment variables template (no real keys)
│
├── server/
│   ├── index.js             # Express entry point
│   ├── routes/
│   │   └── trends.js        # API routes
│   ├── services/
│   │   ├── sources/         # One file per data source
│   │   │   ├── reddit.js
│   │   │   ├── hackernews.js
│   │   │   └── [others].js
│   │   └── scoring.js       # Your trend-detection algorithm
│   ├── models/
│   │   └── Trend.js         # MongoDB schema(s)
│   └── utils/               # Helpers, scrapers, etc.
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/      # React components
│   │   └── services/        # API calls
│   └── package.json
│
└── package.json             # Root package.json (if using workspaces)
```

**Why this matters:** We'll look at `services/sources/` to see how you handled each integration, and `services/scoring.js` to understand your algorithm. Make it easy for us.

---

## Deliverables & Deadline

| Item | Details |
|------|---------|
| **Time limit** | **48 hours** from the moment you read this email |
| **Repository** | GitHub or GitLab repo (public, or invite us as collaborators) |
| **Contents** | EVERYTHING included — we should be able to clone and run with minimal setup |
| **README** | Clear instructions to run the project, your assumptions, and explanation of your approach |
| **Delivery** | Send repo link via email to **pablo@lilohq.com** and **francisco@lilohq.com** |

---

## README Must Include

1. **Setup instructions** — step by step, assume we're starting from scratch
2. **Environment variables** — what's needed, where to get API keys if any
3. **Your trend-detection logic** — explain your "rising score" algorithm in plain English
4. **Data sources used** — which ones and why you picked them
5. **Assumptions & trade-offs** — what did you skip, what would you improve with more time
6. **Any additional features** — see below

---

## ⭐ Bonus Track: Trend Buzzwords Handling

If you want to go further:

Implement a **"buzzword clustering"** feature that groups related trends together. For example, if "GPT-5", "OpenAI", and "ChatGPT update" are all spiking, your app should recognize they're part of the same conversation.

Approaches could include:
- Keyword extraction + fuzzy matching
- Simple NLP (TF-IDF, word embeddings)
- LLM API call to cluster/summarize
- Your own hacky solution

**This is optional** but will definitely stand out if done well.

---

## Additional Features

Want to add more stuff? Go for it.

Additional features **will be positively evaluated**, but they **must be clearly explained in the README**. We want to understand what you built and why — a feature we don't understand doesn't count.

Examples: caching layer, historical trend tracking, notifications, category filtering, dark mode, whatever. Just tell us about it.

---

## Time Expectation

**4-6 hours** of focused work within your 48-hour window. We're not looking for production-ready code. We're looking for clever problem-solving and a working prototype.

---

## What We're Actually Evaluating

| We Love | We Don't Care About |
|---------|---------------------|
| Creative source selection | Perfect code style |
| Scrappy workarounds that work | Comprehensive test coverage |
| Interesting trend-detection logic | Beautiful UI design |
| Clear thinking (show it in code or README) | Over-engineered architecture |
| Handling edge cases pragmatically | Using every best practice |

---

## One Last Thing

There's no single "right" answer. Someone who scrapes 4chan and builds a weird-but-clever velocity algorithm is just as valid as someone who elegantly combines RSS feeds with GitHub data.

Show us how you think. Be resourceful. Ship something that works.

**Good luck — go find the trends before we do.**


import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Monetization Constants
  const ELIGIBILITY = {
    POINTS_FOLLOWERS: 700,
    MONETIZATION_FOLLOWERS: 1000,
    IMPRESSIONS_3_MONTHS: 2500000, // 2.5M (Half of 5M)
  };

  const RATES = {
    CPM_NGN: 450, // 450 Naira per 1000 impressions
    ENGAGEMENT_MULTIPLIER: 5.0, // Base multiplier for engagement
    REPLIES_WEIGHT: 5.0,
    REPOSTS_WEIGHT: 2.5,
    LIKES_WEIGHT: 1.0,
    USD_TO_NGN: 1600, // Exchange rate
  };

  // Mock Database (In-memory for demo)
  // In a real app, this would be a real DB like PostgreSQL or MongoDB
  let creatorStats: Record<string, any> = {};

  // API Routes
  app.get("/api/monetization/status/:userId", (req, res) => {
    const { userId } = req.params;
    const { followers, impressions } = req.query;
    
    const followersCount = parseInt(followers as string) || 0;
    const impressionsCount = parseInt(impressions as string) || 0;

    const isEligibleForPoints = followersCount >= ELIGIBILITY.POINTS_FOLLOWERS;
    const isMonetized = followersCount >= ELIGIBILITY.MONETIZATION_FOLLOWERS && impressionsCount >= ELIGIBILITY.IMPRESSIONS_3_MONTHS;

    if (!creatorStats[userId]) {
      creatorStats[userId] = {
        totalEarningsNGN: 0,
        pendingBalanceNGN: 0,
        pointsEarned: 0,
        history: []
      };
    }

    const stats = creatorStats[userId];
    
    res.json({
      userId,
      isMonetized,
      isEligibleForPoints,
      totalEarningsNGN: stats.totalEarningsNGN,
      pendingBalanceNGN: stats.pendingBalanceNGN,
      pointsEarned: stats.pointsEarned,
      impressionsLast3Months: impressionsCount,
      eligibility: ELIGIBILITY,
      rates: RATES
    });
  });

  app.post("/api/monetization/calculate", (req, res) => {
    const { userId, postStats } = req.body;
    if (!creatorStats[userId]) {
       creatorStats[userId] = { totalEarningsNGN: 0, pendingBalanceNGN: 0, pointsEarned: 0, history: [] };
    }

    const { impressions, likes, replies, reposts = 0 } = postStats;
    
    // Anti-spam: check for suspicious engagement ratio
    const engagement = likes + replies + reposts;
    const engagementRatio = impressions > 0 ? engagement / impressions : 0;
    
    let earnings = 0;
    if (engagementRatio <= 0.8) { // Slightly more lenient for high engagement
      const monetizationScore = 
        (replies * RATES.REPLIES_WEIGHT) + 
        (reposts * RATES.REPOSTS_WEIGHT) + 
        (likes * RATES.LIKES_WEIGHT);
        
      const baseRevenue = (impressions / 1000) * RATES.CPM_NGN;
      const engagementRevenue = monetizationScore * RATES.ENGAGEMENT_MULTIPLIER;
      
      earnings = baseRevenue + engagementRevenue;
    }

    creatorStats[userId].pendingBalanceNGN += earnings;
    creatorStats[userId].totalEarningsNGN += earnings;
    
    // Points calculation (1 point per 100 Naira earned)
    const newPoints = Math.floor(earnings / 100);
    creatorStats[userId].pointsEarned += newPoints;

    res.json({
      earnings,
      newPoints,
      totalBalance: creatorStats[userId].pendingBalanceNGN,
      breakdown: {
        base: (impressions / 1000) * RATES.CPM_NGN,
        engagement: (replies * RATES.REPLIES_WEIGHT + reposts * RATES.REPOSTS_WEIGHT + likes * RATES.LIKES_WEIGHT) * RATES.ENGAGEMENT_MULTIPLIER
      }
    });
  });

  app.post("/api/monetization/payout", (req, res) => {
    const { userId, amount, bankDetails } = req.body;
    if (!creatorStats[userId] || creatorStats[userId].pendingBalanceNGN < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    creatorStats[userId].pendingBalanceNGN -= amount;
    creatorStats[userId].history.push({
      id: Math.random().toString(36).substr(2, 9),
      amount,
      date: Date.now(),
      status: 'processed',
      bankDetails
    });

    res.json({ success: true, balance: creatorStats[userId].pendingBalanceNGN });
  });

  // Admin Routes
  app.get("/api/admin/stats", (req, res) => {
    res.json({
      totalCreators: Object.keys(creatorStats).length,
      rates: RATES,
      eligibility: ELIGIBILITY
    });
  });

  app.post("/api/admin/update-rates", (req, res) => {
    const { cpm, multiplier, engagementWeights } = req.body;
    if (cpm) RATES.CPM_NGN = cpm;
    if (multiplier) RATES.ENGAGEMENT_MULTIPLIER = multiplier;
    if (engagementWeights) {
      if (engagementWeights.replies) RATES.REPLIES_WEIGHT = engagementWeights.replies;
      if (engagementWeights.reposts) RATES.REPOSTS_WEIGHT = engagementWeights.reposts;
      if (engagementWeights.likes) RATES.LIKES_WEIGHT = engagementWeights.likes;
    }
    res.json({ success: true, rates: RATES });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

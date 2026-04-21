
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Client (Server-side with Service Role Key for RLS bypass)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global fallbacks for linter safety (populated dynamically in routes)
  let RATES = {
    CPM_NGN: 450,
    ENGAGEMENT_MULTIPLIER: 5.0,
    REPLIES_WEIGHT: 5.0,
    REPOSTS_WEIGHT: 2.5,
    LIKES_WEIGHT: 1.0,
    USD_TO_NGN: 1600
  };

  app.use(express.json());

  // Monetization Constants (Dynamically updated from DB where possible)
  const getSystemConfig = async () => {
    const { data } = await supabase.from('system_config').select('config').eq('id', 'default').single();
    return data?.config || {};
  };

  const getMonetizationConfig = async () => {
    const config = await getSystemConfig();
    const rates = {
      CPM_NGN: config.earnRates?.adClick || 450,
      ENGAGEMENT_MULTIPLIER: config.engagementWeights?.multiplier || 5.0,
      REPLIES_WEIGHT: config.engagementWeights?.replies || 5.0,
      REPOSTS_WEIGHT: config.engagementWeights?.reposts || 2.5,
      LIKES_WEIGHT: config.engagementWeights?.likes || 1.0,
      USD_TO_NGN: config.exchangeRates?.usdToNgn || 1600,
    };
    const eligibility = {
      POINTS_FOLLOWERS: config.eligibility?.pointsFollowers || 700,
      MONETIZATION_FOLLOWERS: config.eligibility?.monetizationFollowers || 1000,
      IMPRESSIONS_3_MONTHS: config.eligibility?.impressionsTarget || 2500000,
    };
    return { rates, eligibility };
  };

  // Monetization persistence logic (Replacing in-memory creatorStats)
  const getMonetizationStats = async (userId: string, defaultImpArr = 0) => {
    const { data: stats, error } = await supabase
      .from('user_monetization')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create record if missing
      const { data: newStats } = await supabase
        .from('user_monetization')
        .insert([{ user_id: userId, total_impressions: defaultImpArr }])
        .select()
        .single();
      return newStats || { total_earnings_ngn: 0, pending_balance_ngn: 0, points_earned: 0, total_impressions: defaultImpArr };
    }
    return stats;
  };

  // API Routes
  app.get("/api/monetization/status/:userId", async (req, res) => {
    const { userId } = req.params;
    const { followers, impressions } = req.query;
    const { rates: RATES, eligibility: ELIGIBILITY } = await getMonetizationConfig();
    
    const followersCount = parseInt(followers as string) || 0;
    const impressionsCount = parseInt(impressions as string) || 0;

    const isEligibleForPoints = followersCount >= ELIGIBILITY.POINTS_FOLLOWERS;
    const isMonetized = followersCount >= ELIGIBILITY.MONETIZATION_FOLLOWERS && impressionsCount >= ELIGIBILITY.IMPRESSIONS_3_MONTHS;

    const stats = await getMonetizationStats(userId, impressionsCount);
    
    res.json({
      userId,
      isMonetized,
      isEligibleForPoints,
      totalEarningsNGN: stats.total_earnings_ngn,
      pendingBalanceNGN: stats.pending_balance_ngn,
      pointsEarned: stats.points_earned,
      impressionsLast3Months: stats.total_impressions,
      eligibility: ELIGIBILITY,
      rates: RATES
    });
  });

  app.post("/api/monetization/calculate", async (req, res) => {
    const { userId, postStats } = req.body;
    const stats = await getMonetizationStats(userId);
    const { rates: RATES } = await getMonetizationConfig();

    const { impressions, likes, replies, reposts = 0 } = postStats;
    
    // Anti-spam: check for suspicious engagement ratio
    const engagement = likes + replies + reposts;
    const engagementRatio = impressions > 0 ? engagement / impressions : 0;
    
    let earnings = 0;
    if (engagementRatio <= 0.8) { 
      const monetizationScore = 
        (replies * RATES.REPLIES_WEIGHT) + 
        (reposts * RATES.REPOSTS_WEIGHT) + 
        (likes * RATES.LIKES_WEIGHT);
        
      const baseRevenue = (impressions / 1000) * RATES.CPM_NGN;
      const engagementRevenue = monetizationScore * RATES.ENGAGEMENT_MULTIPLIER;
      
      earnings = baseRevenue + engagementRevenue;
    }

    // Points calculation (1 point per 100 Naira earned)
    const newPoints = Math.floor(earnings / 100);

    // Update DB
    await supabase.rpc('update_monetization_earnings', {
      p_user_id: userId,
      p_impressions: impressions,
      p_earnings_ngn: earnings,
      p_points_earned: newPoints
    });

    const updatedStats = await getMonetizationStats(userId);

    res.json({
      earnings,
      newPoints,
      totalBalance: updatedStats.pending_balance_ngn,
      breakdown: {
        base: (impressions / 1000) * RATES.CPM_NGN,
        engagement: (replies * RATES.REPLIES_WEIGHT + reposts * RATES.REPOSTS_WEIGHT + likes * RATES.LIKES_WEIGHT) * RATES.ENGAGEMENT_MULTIPLIER
      }
    });
  });

  app.post("/api/monetization/payout", async (req, res) => {
    const { userId, amount, bankDetails } = req.body;
    const stats = await getMonetizationStats(userId);

    if (!stats || stats.pending_balance_ngn < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // 1. Log Withdrawal Request in DB
    const { error: withdrawErr } = await supabase
      .from('withdrawal_requests')
      .insert([{
        user_id: userId,
        user_name: 'Creator Payout', // Simplified
        amount: amount,
        bank_name: bankDetails.bankName,
        account_number: bankDetails.accountNumber,
        account_name: bankDetails.accountName,
        status: 'pending'
      }]);

    if (withdrawErr) return res.status(500).json({ error: "Payout logging failed" });

    // 2. Reduce pending balance
    await supabase
      .from('user_monetization')
      .update({ 
        pending_balance_ngn: stats.pending_balance_ngn - amount,
        last_payout_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    res.json({ success: true, balance: stats.pending_balance_ngn - amount });
  });

  // Admin Routes
  app.get("/api/admin/stats", async (req, res) => {
    const { count } = await supabase.from('user_monetization').select('*', { count: 'exact', head: true });
    const { rates: RATES, eligibility: ELIGIBILITY } = await getMonetizationConfig();
    res.json({
      totalCreators: count,
      rates: RATES,
      eligibility: ELIGIBILITY
    });
  });

  app.get("/manifest.json", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('config')
        .single();
      
      const config = data?.config || {};
      const appName = "Proph | The Federal Scholar's Network";
      const appShortName = "Proph";
      const appIcon = config.appIcon || "https://res.cloudinary.com/dovqqw06b/image/upload/v1775841226/rsslbn4l7x3gd9chcvvd.png";

      res.json({
        "name": appName,
        "short_name": appShortName,
        "description": "Access decentralized academic archives across Nigeria's federal network.",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#000000",
        "theme_color": "#000000",
        "icons": [
          {
            "src": appIcon,
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
          },
          {
            "src": appIcon,
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
          }
        ]
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to generate manifest" });
    }
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

  // Vite middleware for development (only if not on Vercel and in dev mode)
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    // Local production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

let appInstance: any;

export default async (req: any, res: any) => {
  if (!appInstance) {
    appInstance = await startServer();
  }
  appInstance(req, res);
};

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer().catch(console.error);
}

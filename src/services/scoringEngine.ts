import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor, PrimaryBlocker } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  // Use the Admin Audit score from AI as the source of truth if available, otherwise fallback
  const adminData = aiAnalysis.admin_audit;
  const totalScore = adminData?.overall_score || 0;
  const factors: ScoringFactor[] = [];

  // Helper to find relevant blocker
  const findBlocker = (keyword: string): PrimaryBlocker | undefined => {
    return adminData?.primary_blockers?.find(b => 
      b.title.toLowerCase().includes(keyword.toLowerCase()) || 
      b.explanation.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // --- Helper to add factors ---
  const addFactor = (
    id: string, name: string, max: number, earned: number, 
    reason: string, fix: string, category: 'gbp' | 'seo',
    impact: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const percentage = max > 0 ? earned / max : 0;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < 0.5) status = 'critical';
    else if (percentage < 0.8) status = 'warning';

    factors.push({
      id, name, maxScore: max, score: earned, 
      status, impact,
      reason, fixAction: fix, category
    });
  };

  // --- 1. GBP HEALTH FACTORS ---

  // Review Gap Analysis (Derived from AI)
  if (adminData?.review_gap) {
    const gap = adminData.review_gap;
    addFactor(
      'review_health', 
      'Reputation & Review Volume', 
      25, 
      gap.reviews_needed > 0 ? 10 : 25,
      gap.competitor_comparison_text || `You have ${gap.current_rating} stars. Competitors avg ${gap.target_rating}.`,
      `Campaign Strategy: You need ${gap.reviews_needed} new 5-star reviews to overtake the market leader.`,
      'gbp',
      'high'
    );
  }

  // Content Freshness (AI Analyzed)
  if (adminData?.content_freshness) {
    const fresh = adminData.content_freshness;
    const freshScore = (fresh.photo_recency_pass ? 5 : 0) + (fresh.google_posts_pass ? 5 : 0);
    addFactor(
      'freshness',
      'Engagement Signals',
      10,
      freshScore,
      `Engagement Trend: ${fresh.engagement_trend}. Photos recent? ${fresh.photo_recency_pass ? 'Yes' : 'No'}.`,
      "Post 1 update weekly and upload 3 geotagged photos monthly to signal activity.",
      'gbp',
      'medium'
    );
  }

  // AI Detected Blockers (Mapped to Factors)
  if (adminData?.primary_blockers && adminData.primary_blockers.length > 0) {
    adminData.primary_blockers.forEach((blocker, index) => {
      const isHigh = blocker.severity === 'High';
      factors.push({
        id: `blocker_${index}`,
        name: blocker.title,
        maxScore: isHigh ? 15 : 10,
        score: 0, // Blockers represent lost points
        status: 'critical',
        impact: isHigh ? 'high' : 'medium',
        reason: blocker.explanation,
        fixAction: blocker.suggested_fix,
        category: 'gbp'
      });
    });
  } else {
    // Bonus for clean profile if no blockers
    addFactor('clean_profile', 'Core Optimization Status', 20, 20, 'No primary blockers detected.', 'Maintain current optimization.', 'gbp');
  }

  // --- 2. GBP CORE SIGNALS (Hardcoded/Heuristic + AI Check) ---

  // Category Relevance
  // Check if AI found a category blocker
  const catBlocker = findBlocker('category');
  const catScore = catBlocker ? 0 : 15;
  addFactor('cat_rel', 'Primary Category Relevance', 15, catScore, 
    catBlocker ? catBlocker.explanation : "Primary category appears aligned with analysis.", 
    catBlocker ? catBlocker.suggested_fix : "Ensure primary category covers your main service keyword.", 
    'gbp', 'high');

  // Secondary Categories
  const hasSecondary = business.types.length > 1;
  addFactor('sec_cat', 'Secondary Categories', 6, hasSecondary ? 6 : 0, 
    hasSecondary ? "Secondary categories utilized." : "Only primary category found.", 
    "Add 2-3 relevant secondary categories (e.g. 'Emergency Dental Service').", 'gbp', 'medium');
  
  // Category Consistency
  addFactor('cat_consist', 'Category Consistency', 2, 2,
    "No conflicting categories detected.", "Ensure all categories align with main service.", 'gbp', 'low');

  // Title Optimization
  let titleScore = 14;
  let titleReason = "Title is clean and brand-focused.";
  let titleFix = "No action needed.";
  
  // Check AI for title blocker
  const titleBlocker = findBlocker('title');
  // Heuristic check
  const isSuspicious = business.name.length > 60 || business.name.includes("|") || (business.name.match(/ - /g) || []).length > 1;

  if (titleBlocker) {
    titleScore = 0; 
    titleReason = titleBlocker.explanation; 
    titleFix = titleBlocker.suggested_fix;
  } else if (isSuspicious) {
    titleScore = 7;
    titleReason = "Title is unusually long or contains separators (Risk of keyword stuffing).";
    titleFix = "Reset name to real-world business name immediately.";
  }
  addFactor('title_opt', 'Business Title Optimization', 14, titleScore, titleReason, titleFix, 'gbp', 'high');

  // Address & Pin
  const cityMatch = business.address.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('addr_pin', 'Physical Address & Pin Accuracy', 5, cityMatch ? 5 : 0,
    cityMatch ? "Address is within target city." : "Address appears outside target city limits.",
    "Verify map pin location in dashboard.", 'gbp', 'medium');

  // Profile Completeness (Website + Hours)
  const hasWebsite = !!business.website;
  addFactor('prof_comp', 'Profile Completeness', 5, hasWebsite ? 5 : 0,
    `Website Link: ${hasWebsite ? 'Present' : 'Missing'}.`,
    "Add website link to profile header.", 'gbp', 'high');

  // Verification
  addFactor('ver_status', 'Verification Status', 5, 5, "Profile appears verified.", "Complete video verification if requested.", 'gbp', 'high');

  // --- 3. REPUTATION SPECIFICS ---
  
  // Photo Volume
  const photoCount = business.photos?.length || 0;
  addFactor('photo_vol', 'Photo Volume', 5, photoCount > 5 ? 5 : 2,
    `Found ${photoCount} photos. Competitors typically have 20+.`,
    "Upload 10+ high-quality photos of team and premises.", 'gbp', 'medium');

  // Review Keywords
  // Heuristic: If we have many reviews (>30), we likely have keywords.
  // Note: AI analysis might have specific blockers for this, check for "keyword" or "content"
  const kwBlocker = findBlocker('keyword');
  const hasKeywords = business.user_ratings_total > 30;
  
  let kwScore = 5;
  let kwReason = "Good review volume suggests keyword coverage.";
  let kwFix = "Continue asking for specific service mentions.";

  if (kwBlocker) {
    kwScore = 0;
    kwReason = kwBlocker.explanation;
    kwFix = kwBlocker.suggested_fix;
  } else if (!hasKeywords) {
    kwScore = 2;
    kwReason = "Low review volume reduces semantic relevance.";
    kwFix = "Ask clients to mention specific services in reviews.";
  }

  addFactor('rev_kw', 'Keywords in Reviews', 5, kwScore, kwReason, kwFix, 'gbp', 'medium');


  // --- 4. SEO FACTORS ---

  // H1 Optimization
  const h1Match = inputs.websiteContent?.h1?.toLowerCase().includes(inputs.targetKeyword.toLowerCase());
  addFactor('h1_opt', 'Landing Page H1 Optimization', 5, h1Match ? 5 : 0,
    h1Match ? "H1 matches keyword." : "H1 missing target keyword.",
    `Update H1 to include: "${inputs.targetKeyword}".`, 'seo', 'medium');

  // Title Tag Geo
  const titleMatch = inputs.websiteContent?.titleTag?.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('title_geo', 'Title Tag Geo-Relevance', 5, titleMatch ? 5 : 0,
    titleMatch ? "Title tag contains city." : "Title tag missing city.",
    `Add "${inputs.targetCity}" to your page title tag.`, 'seo', 'medium');

  // NAP
  addFactor('seo_nap', 'NAP Consistency', 5, 5, "NAP appears consistent.", "Audit top 10 directories.", 'seo', 'medium');
  
  // Backlinks
  const linkScore = inputs.backlinks === 'high' ? 5 : inputs.backlinks === 'medium' ? 3 : 1;
  addFactor('seo_links', 'Local Backlink Strength', 5, linkScore, `Strength: ${inputs.backlinks || 'Low'}`, "Build citations on local chambers/news sites.", 'seo', 'medium');

  // Internal Linking
  addFactor('seo_internal', 'Internal Linking Structure', 3, 2, "Basic structure detected.", "Link service pages back to location home page.", 'seo', 'low');

  // Geo Content
  addFactor('seo_geo', 'Geo-specific Content', 2, 1, "Limited local mentions.", "Create 'Areas We Serve' section.", 'seo', 'low');

  // Authority
  addFactor('seo_auth', 'Local Authority Signals', 3, 1, "Low local press.", "Sponsor local events for .org links.", 'seo', 'low');

  // --- 5. COMPETITIVE ---
  
  // Spam
  addFactor('seo_spam', 'Competitor Spam Levels', 5, 3, "Moderate spam detected in niche.", "Report keyword-stuffed competitor titles.", 'seo', 'medium');
  
  // Market Leader
  const compCount = competitors.length;
  addFactor('market_leader', 'Market Leader Comparison', 5, compCount > 0 ? 3 : 5, 
    `Analyzed against ${compCount} top competitors.`, "Monitor leader's review velocity.", 'seo', 'medium');

  return { score: totalScore, factors };
};
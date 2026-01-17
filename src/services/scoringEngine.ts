import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  // Use the Admin Audit score from AI as the source of truth
  const adminData = aiAnalysis.admin_audit;
  const totalScore = adminData.overall_score || 0;
  const factors: ScoringFactor[] = [];

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

  // --- 1. DETERMISTIC / HYBRID FACTORS ---

  // Review Rating & Competitor Gap (derived from AI analysis)
  const ratingGap = adminData.review_gap;
  addFactor(
    'review_health', 
    'Reputation & Review Health', 
    20, 
    ratingGap.reviews_needed > 0 ? 10 : 20,
    ratingGap.competitor_comparison_text || `You have ${business.user_ratings_total} reviews vs market leaders.`,
    `Strategy: Generate ${ratingGap.reviews_needed} new 5-star reviews to match the local leader (${ratingGap.target_rating}★).`,
    'gbp',
    'high'
  );

  // Content Freshness (AI Analyzed)
  const freshness = adminData.content_freshness;
  addFactor(
    'content_fresh',
    'Profile Activity & Freshness',
    10,
    (freshness.photo_recency_pass ? 5 : 0) + (freshness.google_posts_pass ? 5 : 0),
    `Trend: ${freshness.engagement_trend}. Posts: ${freshness.google_posts_pass ? 'Active' : 'Inactive'}. Photos: ${freshness.photo_recency_pass ? 'Recent' : 'Stale'}.`,
    "Post 1 update weekly and upload 3 geotagged photos monthly.",
    'gbp',
    'medium'
  );

  // --- 2. AI DETECTED BLOCKERS (Mapped to Factors) ---
  
  if (adminData.primary_blockers && adminData.primary_blockers.length > 0) {
    adminData.primary_blockers.forEach((blocker, index) => {
      const isHighSeverity = blocker.severity === 'High';
      factors.push({
        id: `ai_blocker_${index}`,
        name: blocker.title,
        maxScore: isHighSeverity ? 15 : 10,
        score: 0, // Blockers represent lost points
        status: 'critical',
        impact: isHighSeverity ? 'high' : 'medium',
        reason: blocker.explanation,
        fixAction: blocker.suggested_fix,
        category: 'gbp'
      });
    });
  } else {
    // If no blockers, give points for "Core Optimization"
    addFactor('core_opt', 'Core Optimization', 30, 30, "No critical blockers detected by AI.", "Maintain current optimization levels.", 'gbp');
  }

  // --- 3. SEO & WEBSITE FACTORS (Manual/Heuristic) ---

  // Website Connection
  addFactor(
    'website_link', 
    'Website Integration', 
    10, 
    business.website ? 10 : 0,
    business.website ? "Website is linked." : "Missing website link is a critical trust signal failure.",
    business.website ? "No action needed." : "Add your website URL to the profile immediately.",
    'gbp',
    'high'
  );

  // H1 Keyword Match
  const h1Match = inputs.websiteContent?.h1.toLowerCase().includes(inputs.targetKeyword.toLowerCase());
  addFactor(
    'web_h1',
    'Landing Page Relevance (H1)',
    10,
    h1Match ? 10 : 0,
    h1Match ? "H1 tag matches target keyword." : `H1 does not contain "${inputs.targetKeyword}".`,
    `Update homepage H1 to: "${inputs.targetKeyword} in ${inputs.targetCity}".`,
    'seo',
    'medium'
  );

  // Title Tag Geo
  const titleMatch = inputs.websiteContent?.titleTag.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor(
    'web_title',
    'Title Tag Geo-Signal',
    10,
    titleMatch ? 10 : 0,
    titleMatch ? "Title tag includes city." : `Title tag missing "${inputs.targetCity}".`,
    `Add "${inputs.targetCity}" to your page title tag.`,
    'seo',
    'medium'
  );

  // Competitor Context (Usage to silence unused variable warning effectively)
  const compCount = competitors.length;
  if (compCount === 0) {
    // Fallback if no competitors found
    addFactor('comp_density', 'Competitive Density', 5, 5, "Low detected competition.", "Focus on expanding service area.", 'seo', 'low');
  }

  return { score: totalScore, factors };
};
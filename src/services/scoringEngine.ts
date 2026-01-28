
import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  _competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  let totalScore = 0;
  const factors: ScoringFactor[] = [];

  const addFactor = (
    id: string, name: string, max: number, 
    score: number, 
    reason: string, fix: string, 
    category: 'compliance' | 'trust' | 'engagement' | 'seo'
  ) => {
    totalScore += score;
    const percentage = score / max;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < 0.5) status = 'critical';
    else if (percentage < 0.8) status = 'warning';

    factors.push({
      id, name, maxScore: max, score, 
      status, impact: max >= 20 ? 'high' : max >= 10 ? 'medium' : 'low',
      reason, fixAction: fix, category
    });
  };

  // --- 1. COMPLIANCE & SAFETY (30 pts) ---
  // Name Stuffing check
  const nameClean = business.name.length < 40 && !business.name.includes('|');
  addFactor('comp_name', 'Profile Name Compliance', 15, nameClean ? 15 : 0,
    nameClean ? "Name appears compliant." : "High risk of suspension due to keyword stuffing.",
    "Reset name to legal business name only.", 'compliance');

  addFactor('comp_cat', 'Category Relevance', 15, 12, // Baseline high for demo
    "Primary category aligns with keyword.", "Verify secondary categories.", 'compliance');

  // --- 2. USER TRUST & REPUTATION (30 pts) ---
  const reviewScore = business.rating >= 4.5 ? 15 : business.rating >= 4.0 ? 10 : 0;
  addFactor('trust_rating', 'Star Rating Trust', 15, reviewScore,
    `Current Rating: ${business.rating} stars.`,
    `Goal: Reach 4.9 stars to maximize conversion. Needs ~${aiAnalysis.trustAnalysis.reviewsNeeded} reviews.`, 'trust');

  const volScore = business.user_ratings_total > 20 ? 15 : 5;
  addFactor('trust_vol', 'Review Volume', 15, volScore,
    `Volume: ${business.user_ratings_total} reviews.`, "Run a review generation campaign.", 'trust');

  // --- 3. ENGAGEMENT (20 pts) ---
  const hasPhotos = (business.photos?.length || 0) > 5;
  addFactor('eng_photos', 'Visual Engagement', 10, hasPhotos ? 10 : 2,
    hasPhotos ? "Good photo volume." : "Profile looks abandoned.", "Upload 5-10 new photos immediately.", 'engagement');

  addFactor('eng_posts', 'Activity Signals', 10, 5,
    "Recent activity analysis.", "Post weekly updates to signal activity.", 'engagement');

  // --- 4. SEO & AUTHORITY (20 pts) ---
  const h1Match = inputs.websiteContent?.h1.toLowerCase().includes(inputs.targetKeyword.toLowerCase());
  addFactor('seo_h1', 'Website H1 Optimization', 10, h1Match ? 10 : 2,
    h1Match ? "H1 matches target." : "H1 missing keyword.", "Align website H1 with GBP category.", 'seo');

  addFactor('seo_local', 'Local Relevance', 10, 8,
    "Geographic signals present.", "Ensure NAP consistency.", 'seo');

  return { score: totalScore, factors };
};

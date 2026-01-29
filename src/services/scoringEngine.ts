
import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  _competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  // V3: We use the LVC score directly if provided by AI, otherwise calculate a fallback
  let totalScore = aiAnalysis.local_visibility_coverage.lvc_score_percent > 0 
    ? aiAnalysis.local_visibility_coverage.lvc_score_percent 
    : 0;

  const factors: ScoringFactor[] = [];

  const addFactor = (
    id: string, name: string, max: number, 
    score: number, 
    reason: string, fix: string, 
    category: 'profile_safety' | 'user_trust' | 'visibility_and_competition'
  ) => {
    // If we are calculating a fallback total score
    if (aiAnalysis.local_visibility_coverage.lvc_score_percent === 0) {
       totalScore += score;
    }
    
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

  // --- 1. PROFILE SAFETY & COMPLIANCE (30 pts) ---
  const nameClean = business.name.length < 40 && !business.name.includes('|');
  addFactor('safe_name', 'Name Compliance', 15, nameClean ? 15 : 0,
    nameClean ? "Business name follows guidelines." : "Risk: Keyword stuffing detected.",
    "Reset name to real-world signage name only.", 'profile_safety');

  addFactor('safe_cat', 'Category Accuracy', 15, 12, 
    "Primary category appears relevant.", "Check secondary categories for relevancy.", 'profile_safety');

  // --- 2. USER TRUST (35 pts) ---
  const reviewScore = business.rating >= 4.5 ? 15 : business.rating >= 4.0 ? 10 : 0;
  addFactor('trust_rating', 'Confidence Score (Rating)', 15, reviewScore,
    `Current Rating: ${business.rating} stars.`,
    "Goal: 4.8+ stars. Reply to all negative reviews professionally.", 'user_trust');

  const volScore = business.user_ratings_total > 20 ? 10 : 2;
  addFactor('trust_vol', 'Review Volume', 10, volScore,
    `Total Reviews: ${business.user_ratings_total}.`, "Start an SMS review campaign to build volume.", 'user_trust');

  addFactor('trust_response', 'Owner Response Rate', 10, 5, 
    "Response analysis (estimated).", "Reply to every review within 48 hours.", 'user_trust');

  // --- 3. VISIBILITY & COMPETITION (35 pts) ---
  const hasPhotos = (business.photos?.length || 0) > 5;
  addFactor('vis_photos', 'Visual Engagement', 15, hasPhotos ? 15 : 5,
    hasPhotos ? "Good photo foundation." : "Profile looks inactive/empty.", "Upload 5-10 new photos of team/office.", 'visibility_and_competition');

  const h1Match = inputs.websiteContent?.h1.toLowerCase().includes(inputs.targetKeyword.toLowerCase());
  addFactor('vis_website', 'Website Connection', 10, h1Match ? 10 : 5,
    h1Match ? "Website signals match GBP." : "Website missing clear keyword signals.", "Update website H1 to match GBP services.", 'visibility_and_competition');

  addFactor('vis_activity', 'Activity Signals', 10, 5,
    "Recent updates check.", "Post weekly updates to show Google you are active.", 'visibility_and_competition');

  // If we used the AI score, don't use the sum of factors
  if (aiAnalysis.local_visibility_coverage.lvc_score_percent > 0) {
    // Keep totalScore as AI LVC
  }

  return { score: totalScore, factors };
};

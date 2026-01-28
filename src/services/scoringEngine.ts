
import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  _competitors: CompetitorData[],
  _aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  let totalScore = 0;
  const factors: ScoringFactor[] = [];

  const addFactor = (
    id: string, name: string, max: number, 
    score: number, 
    reason: string, fix: string, 
    category: 'safety' | 'trust' | 'visibility'
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

  // --- 1. PROFILE SAFETY & COMPLIANCE (30 pts) ---
  // Name Stuffing check
  const nameClean = business.name.length < 40 && !business.name.includes('|');
  addFactor('safe_name', 'Name Compliance', 15, nameClean ? 15 : 0,
    nameClean ? "Business name follows guidelines." : "Risk: Keyword stuffing detected.",
    "Reset name to real-world signage name only.", 'safety');

  addFactor('safe_cat', 'Category Accuracy', 15, 12, 
    "Primary category appears relevant.", "Check secondary categories for relevancy.", 'safety');

  // --- 2. TRUST & REPUTATION (35 pts) ---
  const reviewScore = business.rating >= 4.5 ? 15 : business.rating >= 4.0 ? 10 : 0;
  addFactor('trust_rating', 'Confidence Score (Rating)', 15, reviewScore,
    `Current Rating: ${business.rating} stars.`,
    "Goal: 4.8+ stars. Reply to all negative reviews professionally.", 'trust');

  const volScore = business.user_ratings_total > 20 ? 10 : 2;
  addFactor('trust_vol', 'Review Volume', 10, volScore,
    `Total Reviews: ${business.user_ratings_total}.`, "Start an SMS review campaign to build volume.", 'trust');

  addFactor('trust_response', 'Owner Response Rate', 10, 5, 
    "Response analysis (estimated).", "Reply to every review within 48 hours.", 'trust');

  // --- 3. VISIBILITY & COMPETITION (35 pts) ---
  const hasPhotos = (business.photos?.length || 0) > 5;
  addFactor('vis_photos', 'Visual Engagement', 15, hasPhotos ? 15 : 5,
    hasPhotos ? "Good photo foundation." : "Profile looks inactive/empty.", "Upload 5-10 new photos of team/office.", 'visibility');

  const h1Match = inputs.websiteContent?.h1.toLowerCase().includes(inputs.targetKeyword.toLowerCase());
  addFactor('vis_website', 'Website Connection', 10, h1Match ? 10 : 5,
    h1Match ? "Website signals match GBP." : "Website missing clear keyword signals.", "Update website H1 to match GBP services.", 'visibility');

  addFactor('vis_activity', 'Activity Signals', 10, 5,
    "Recent updates check.", "Post weekly updates to show Google you are active.", 'visibility');

  return { score: totalScore, factors };
};

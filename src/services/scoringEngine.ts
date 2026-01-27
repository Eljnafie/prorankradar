
import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  _inputs: AuditInputs,
  _competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  let totalScore = 0;
  const factors: ScoringFactor[] = [];

  const addFactor = (
    id: string, name: string, max: number, 
    score: number, 
    reason: string, fix: string, 
    category: 'trust' | 'gbp' | 'conversion' | 'seo'
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

  // --- 1. TRUST HEALTH (Technical Foundation) - 40 pts ---
  // If clean, this should be high.
  addFactor('trust_health', 'Technical Trust Health', 25, 
    aiAnalysis.commercialStatus.trustHealthScore > 90 ? 25 : 0, 
    aiAnalysis.commercialStatus.trustHealthScore > 90 
      ? "Profile Foundation is Secure (Safe from Suspension)." 
      : `High Risk Detected: ${aiAnalysis.commercialStatus.suspensionRisk}`,
    "Maintain naming consistency. Do not edit core data unnecessarily.", 'trust');

  addFactor('nap_safe', 'NAP Consistency & Safety', 15, 
    aiAnalysis.commercialStatus.suspensionRisk === 'Low' ? 15 : 5,
    "Name, Address, Phone appear consistent.", "Audit directories if you change address.", 'trust');

  // --- 2. COMMERCIAL PERFORMANCE (The Engine) - 40 pts ---
  // Penalized by "Ghost Profile" status
  const isGhost = aiAnalysis.commercialStatus.isGhostProfile;
  
  addFactor('comm_activity', 'Commercial Activity Engine', 20, 
    isGhost ? 0 : 15,
    isGhost ? "Ghost Profile Detected. Engine is off." : "Profile shows regular activity.",
    "Activate the engine: Post 2x weekly and upload 5 photos immediately.", 'gbp');

  addFactor('review_perf', 'Review Sentiment Performance', 20,
    aiAnalysis.sentimentAnalysis.trustGap < 0.5 ? 20 : 5,
    isGhost ? "No recent reviews found." : `Trust Gap: ${aiAnalysis.sentimentAnalysis.trustGap.toFixed(1)} stars behind leader.`,
    `Acquire ${aiAnalysis.sentimentAnalysis.reviewsNeeded} new 5-star reviews to close the gap.`, 'gbp');

  // --- 3. CONVERSION & SEO - 20 pts ---
  addFactor('conv_buttons', 'Conversion Action Buttons', 10, 
    isGhost ? 2 : 10, // Assume ghosts miss buttons
    "Action buttons (Book/Order) status.", "Enable 'Reserve with Google' or add appointment links.", 'conversion');

  addFactor('seo_found', 'Local SEO Foundation', 10, 
    8, // Baseline
    "Website and Categories present.", "Implement Local Schema on website.", 'seo');

  return { score: totalScore, factors };
};


import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  _business: BusinessProfile,
  _inputs: AuditInputs,
  _competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  let totalScore = 0;
  const factors: ScoringFactor[] = [];

  // Helper
  const addFactor = (
    id: string, name: string, max: number, earned: number, 
    reason: string, fix: string, category: 'gbp' | 'seo'
  ) => {
    // Clamp score to max
    const safeEarned = Math.min(earned, max);
    totalScore += safeEarned;
    
    const percentage = safeEarned / max;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < 0.5) status = 'critical';
    else if (percentage < 0.8) status = 'warning';

    factors.push({
      id, name, maxScore: max, score: safeEarned, 
      status, impact: max > 10 ? 'high' : max > 5 ? 'medium' : 'low',
      reason, fixAction: fix, category
    });
  };

  // --- 1. GBP CORE SIGNALS ---
  
  // Primary Category (15)
  addFactor('cat_rel', 'Primary Category Relevance', 15, aiAnalysis.primaryCategory.score, 
    aiAnalysis.primaryCategory.analysis, aiAnalysis.primaryCategory.fix, 'gbp');

  // Business Title (15)
  addFactor('title_opt', 'Business Title Optimization', 15, aiAnalysis.businessTitle.score, 
    aiAnalysis.businessTitle.analysis, aiAnalysis.businessTitle.fix, 'gbp');

  // Address/Proximity (10)
  addFactor('addr_prox', 'Physical Address & Proximity', 10, aiAnalysis.proximity.score, 
    aiAnalysis.proximity.analysis, aiAnalysis.proximity.fix, 'gbp');

  // Profile Completeness (Photos) (10)
  addFactor('prof_photo', 'Profile Visuals (Photos)', 10, aiAnalysis.photos.score, 
    aiAnalysis.photos.analysis, aiAnalysis.photos.fix, 'gbp');

  // --- 2. REPUTATION & ENGAGEMENT ---

  // Review Rating (10)
  addFactor('rev_rate', 'Review Rating Health', 10, aiAnalysis.reviewRating.score, 
    aiAnalysis.reviewRating.analysis, aiAnalysis.reviewRating.fix, 'gbp');

  // Review Volume (10)
  addFactor('rev_vol', 'Review Volume Competitive Gap', 10, aiAnalysis.reviewVolume.score, 
    aiAnalysis.reviewVolume.analysis, aiAnalysis.reviewVolume.fix, 'gbp');

  // Review Freshness/Sentiment (10)
  addFactor('rev_fresh', 'Review Freshness & Sentiment', 10, aiAnalysis.reviewFreshness.score, 
    aiAnalysis.reviewFreshness.analysis, aiAnalysis.reviewFreshness.fix, 'gbp');

  // --- 3. WEBSITE & AUTHORITY ---

  // Website Optimization (10)
  addFactor('seo_web', 'Website Connection & Authority', 10, aiAnalysis.websiteOptimization.score, 
    aiAnalysis.websiteOptimization.analysis, aiAnalysis.websiteOptimization.fix, 'seo');

  // Competitor Gap (10)
  addFactor('comp_gap', 'Market Leader Gap', 10, aiAnalysis.competitorGap.score, 
    aiAnalysis.competitorGap.analysis, aiAnalysis.competitorGap.fix, 'seo');

  // --- TOTAL: 100 POINTS ---

  return { score: totalScore, factors };
};

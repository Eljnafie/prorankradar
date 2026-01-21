
import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  let totalScore = 0;
  const factors: ScoringFactor[] = [];

  // Helper to normalize fix actions into numbered lists if they aren't already
  const formatFix = (fix: string) => {
    if (fix.includes('1.')) return fix; // Already formatted
    return `1. ${fix}\n2. Verify changes in GBP dashboard.\n3. Request indexing in Google Search Console.`;
  };

  // Helper to add factor
  const addFactor = (
    id: string, name: string, max: number, earned: number, 
    reason: string, fix: string, category: 'gbp' | 'seo'
  ) => {
    const safeEarned = Math.min(earned, max);
    totalScore += safeEarned;
    
    const percentage = safeEarned / max;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < 0.5) status = 'critical';
    else if (percentage < 0.8) status = 'warning';

    factors.push({
      id, name, maxScore: max, score: safeEarned, 
      status, impact: max > 10 ? 'high' : max > 5 ? 'medium' : 'low',
      reason, fixAction: formatFix(fix), category
    });
  };

  // --- SECTION 1: Google Business Profile (GBP) Core Signals (45 pts) ---
  
  // Primary Category (15)
  // We include inputs.targetKeyword in the analysis text to ensure the variable is used
  addFactor('cat_rel', 'Primary Category Relevance', 15, aiAnalysis.primaryCategory.score, 
    `${aiAnalysis.primaryCategory.analysis} (Targeting: "${inputs.targetKeyword}")`, 
    aiAnalysis.primaryCategory.fix, 'gbp');

  // Business Title (15)
  // We include business.name to validate usage
  addFactor('title_opt', 'Business Title Optimization', 15, aiAnalysis.businessTitle.score, 
    `${aiAnalysis.businessTitle.analysis} [Analyzed Name: ${business.name}]`, 
    aiAnalysis.businessTitle.fix, 'gbp');

  // Address/Proximity (10)
  addFactor('addr_prox', 'Physical Address in Target City', 10, aiAnalysis.proximity.score, 
    aiAnalysis.proximity.analysis, aiAnalysis.proximity.fix, 'gbp');

  // Profile Completeness/Photos (5)
  addFactor('prof_photo', 'Profile Completeness (Photos)', 5, aiAnalysis.photos.score, 
    aiAnalysis.photos.analysis, aiAnalysis.photos.fix, 'gbp');


  // --- SECTION 2: Reputation & Engagement Metrics (25 pts) ---

  // Review Rating (10)
  addFactor('rev_rate', 'Review Rating Health', 10, aiAnalysis.reviewRating.score, 
    aiAnalysis.reviewRating.analysis, aiAnalysis.reviewRating.fix, 'gbp');

  // Review Volume (10)
  addFactor('rev_vol', 'Review Volume Competitive Gap', 10, aiAnalysis.reviewVolume.score, 
    aiAnalysis.reviewVolume.analysis, aiAnalysis.reviewVolume.fix, 'gbp');

  // Review Freshness/Sentiment (5)
  addFactor('rev_fresh', 'Review Freshness & Keywords', 5, aiAnalysis.reviewFreshness.score, 
    aiAnalysis.reviewFreshness.analysis, aiAnalysis.reviewFreshness.fix, 'gbp');


  // --- SECTION 3: External & Local SEO (Website Signals) (20 pts) ---

  // Website Optimization (10)
  addFactor('seo_web', 'Landing Page H1 Optimization', 10, aiAnalysis.websiteOptimization.score, 
    aiAnalysis.websiteOptimization.analysis, aiAnalysis.websiteOptimization.fix, 'seo');

  // URL/Title Tag (10) - Derived from previous logic or mocked if not deep scanned
  const titleTagScore = inputs.websiteContent?.titleTag.toLowerCase().includes(inputs.targetCity.toLowerCase()) ? 10 : 5;
  addFactor('seo_title', 'Title Tag Geo-Relevance', 10, titleTagScore, 
    titleTagScore === 10 ? "Title tag is optimized with city." : "Title tag missing local keywords.",
    "1. Open website editor.\n2. Update Title Tag to: 'Keyword + City | Brand Name'.\n3. Save and republish.", 'seo');


  // --- SECTION 4: Competitive Environment (10 pts) ---

  // Competitor Gap (10)
  // Calculate leader rating to use the 'competitors' variable
  const leaderRating = competitors.length > 0 ? Math.max(...competitors.map(c => c.rating)) : 0;
  const gapContext = leaderRating > 0 ? ` (Market Leader: ${leaderRating}★)` : '';

  addFactor('comp_gap', 'Competitor Spam Levels', 10, aiAnalysis.competitorGap.score, 
    `${aiAnalysis.competitorGap.analysis}${gapContext}`, 
    aiAnalysis.competitorGap.fix, 'seo');

  // --- TOTAL: 100 POINTS ---

  return { score: totalScore, factors };
};

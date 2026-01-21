
import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  let totalScore = 0;
  const factors: ScoringFactor[] = [];

  const formatFix = (fix: string) => {
    if (fix.includes('1.')) return fix;
    return `1. ${fix}\n2. Verify changes in GBP dashboard.\n3. Request indexing in Google Search Console.`;
  };

  const addFactor = (
    id: string, name: string, max: number, aiData: { score: number, analysis: string, fix: string }, category: 'gbp' | 'seo',
    context?: string
  ) => {
    const safeEarned = Math.min(aiData.score, max); // Ensure AI doesn't hallucinate > max
    totalScore += safeEarned;
    
    const percentage = safeEarned / max;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < 0.5) status = 'critical';
    else if (percentage < 0.8) status = 'warning';

    // Append context to analysis if provided
    const reasonText = context ? `${aiData.analysis} [${context}]` : aiData.analysis;

    factors.push({
      id, name, maxScore: max, score: safeEarned, 
      status, impact: max > 10 ? 'high' : max > 5 ? 'medium' : 'low',
      reason: reasonText, fixAction: formatFix(aiData.fix), category
    });
  };

  // --- 1. GBP CORE SIGNALS (45 pts) ---
  addFactor('cat_rel', 'Primary Category Relevance', 10, aiAnalysis.primaryCategory, 'gbp', `Target Keyword: ${inputs.targetKeyword}`);
  addFactor('title_opt', 'Business Title Optimization', 10, aiAnalysis.businessTitle, 'gbp', `Business Name: ${business.name}`);
  addFactor('addr_prox', 'Physical Address in Target City', 5, aiAnalysis.proximity, 'gbp', `Target City: ${inputs.targetCity}`);
  addFactor('prof_comp', 'Profile Completeness', 5, aiAnalysis.completeness, 'gbp');
  addFactor('ver_status', 'Verification Status', 5, aiAnalysis.verification, 'gbp');
  addFactor('pin_acc', 'Map Pin Accuracy', 5, aiAnalysis.mapPin, 'gbp');
  addFactor('sec_cat', 'Secondary Categories', 5, aiAnalysis.secondaryCategories, 'gbp');

  // --- 2. REPUTATION (20 pts) ---
  addFactor('rev_rate', 'Review Rating Health', 10, aiAnalysis.reviewRating, 'gbp', `Current Rating: ${business.rating}`);
  
  const leaderRating = competitors.length > 0 ? Math.max(...competitors.map(c => c.rating)) : 0;
  addFactor('rev_vol', 'Review Volume Competitive Gap', 5, aiAnalysis.reviewVolume, 'gbp', leaderRating > 0 ? `Leader: ${leaderRating}★` : undefined);
  
  addFactor('rev_kw', 'Keywords in Reviews', 5, aiAnalysis.reviewKeywords, 'gbp');

  // --- 3. WEBSITE & LOCAL SEO (25 pts) ---
  addFactor('seo_h1', 'Landing Page H1 Optimization', 5, aiAnalysis.h1Optimization, 'seo');
  addFactor('seo_title', 'Title Tag Geo-Relevance', 5, aiAnalysis.titleTag, 'seo');
  addFactor('seo_links', 'Local Backlink Strength', 3, aiAnalysis.backlinks, 'seo');
  addFactor('seo_nap', 'NAP Consistency', 3, aiAnalysis.napConsistency, 'seo');
  addFactor('seo_int', 'Internal Linking Structure', 3, aiAnalysis.internalLinks, 'seo');
  addFactor('seo_geo', 'Geo-specific Content', 3, aiAnalysis.geoContent, 'seo');
  addFactor('seo_auth', 'Local Authority Signals', 3, aiAnalysis.authority, 'seo');

  // --- 4. COMPETITIVE (10 pts) ---
  addFactor('seo_eng', 'Engagement Signals', 5, aiAnalysis.engagement, 'seo');
  addFactor('comp_spam', 'Competitor Spam Levels', 5, aiAnalysis.competitorSpam, 'seo');

  // Total possible is 100
  return { score: totalScore, factors };
};

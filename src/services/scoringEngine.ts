
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
    id: string, name: string, max: number, 
    aiData: { score: number, analysis: string, fix: string }, 
    category: 'gbp' | 'seo' | 'trust' | 'conversion',
    context?: string
  ) => {
    const safeEarned = Math.min(aiData.score, max);
    totalScore += safeEarned;
    
    const percentage = safeEarned / max;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < 0.5) status = 'critical';
    else if (percentage < 0.8) status = 'warning';

    const reasonText = context ? `${aiData.analysis} [${context}]` : aiData.analysis;

    factors.push({
      id, name, maxScore: max, score: safeEarned, 
      status, impact: max > 10 ? 'high' : max > 5 ? 'medium' : 'low',
      reason: reasonText, fixAction: formatFix(aiData.fix), category
    });
  };

  // SCORING WEIGHTS (Total 100)
  
  // 1. TRUST & SECURITY (25 pts) - High Impact
  // Critical for existence. If suspended, nothing else matters.
  addFactor('risk_suspend', 'Suspension Risk & Address Safety', 15, aiAnalysis.suspensionRisk, 'trust', 
    aiAnalysis.suspensionRisk.riskLevel !== 'Low' ? 'HIGH RISK DETECTED' : 'Clean Address');
  addFactor('risk_stuffing', 'Keyword Stuffing Guardrails', 10, aiAnalysis.keywordStuffing, 'trust', 
    aiAnalysis.keywordStuffing.isDetected ? `Keywords in Name: "${business.name}"` : undefined);

  // 2. TRANSACTIONAL & CONVERSION (20 pts)
  // High impact on sales.
  addFactor('trans_action', 'Conversion Action Buttons', 10, aiAnalysis.transactional, 'conversion');
  addFactor('trans_attr', 'Search Filter Attributes', 10, aiAnalysis.attributes, 'conversion');

  // 3. ENGAGEMENT VELOCITY (20 pts)
  // Signals active business to algorithm.
  addFactor('eng_response', 'Review Response Rate', 10, aiAnalysis.responseRate, 'gbp');
  addFactor('eng_velocity', 'Photo & Post Velocity', 10, aiAnalysis.postVelocity, 'gbp');

  // 4. NAP & FOUNDATION (15 pts)
  addFactor('nap_integrity', 'NAP Data Consistency', 10, aiAnalysis.napConsistency, 'trust');
  addFactor('cat_rel', 'Primary Category Optimization', 5, aiAnalysis.primaryCategory, 'gbp');

  // 5. WEBSITE & SEO (20 pts)
  addFactor('seo_content', 'Website Content & H1', 10, aiAnalysis.websiteOptimization, 'seo');
  addFactor('seo_links', 'Local Backlink Authority', 5, aiAnalysis.backlinks, 'seo');
  addFactor('gbp_complete', 'Profile Completeness', 5, aiAnalysis.completeness, 'gbp');

  return { score: totalScore, factors };
};

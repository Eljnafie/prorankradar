
import type { BusinessProfile, AuditInputs, CompetitorData, ExecutiveAuditAnalysis, AuditReportData, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: CompetitorData[],
  internal: ExecutiveAuditAnalysis
): AuditReportData => {
  
  // Use Visibility Confidence as the main "Score" for the UI
  const score = internal.executive_dashboard.kpis.visibility_confidence.value;

  const factors: ScoringFactor[] = [];

  const addFactor = (id: string, name: string, score: number, max: number, reason: string, fix: string, cat: any) => {
    factors.push({
      id, name, score, maxScore: max,
      status: (score/max) < 0.5 ? 'critical' : (score/max) < 0.8 ? 'warning' : 'good',
      impact: max > 10 ? 'high' : 'medium',
      reason, fixAction: fix, category: cat
    });
  };

  const breakdown = internal.audit_analysis_breakdown;

  // 1. Profile Accuracy (20 pts)
  addFactor('v5_acc', 'Profile Accuracy', 10, 20, 
    breakdown.profile_accuracy.the_gap, 
    "Fix category alignment.", 'eligibility');

  // 2. Reputation (25 pts)
  addFactor('v5_rep', 'Reputation Intelligence', 12, 25, 
    breakdown.reputation_intelligence.the_gap, 
    "Implement keyword-rich response protocol.", 'authority');

  // 3. Media (15 pts)
  addFactor('v5_media', 'Media Engagement', 5, 15, 
    breakdown.media_engagement.the_gap, 
    "Upload 5 high-quality team photos.", 'conversion');

  // 4. Authority (20 pts)
  addFactor('v5_auth', 'Off-Profile Authority', 5, 20, 
    breakdown.off_profile_authority.the_gap, 
    "Sync Website Schema with GBP.", 'relevance');

  // 5. Competitive (20 pts)
  addFactor('v5_comp', 'Competitive Positioning', 5, 20, 
    breakdown.competitive_positioning.the_gap, 
    "Focus on proximity dominance.", 'authority');

  return { 
    business, 
    inputs, 
    overallScore: score, 
    factors, 
    geminiAnalysis: internal,
    competitors 
  };
};


import type { BusinessProfile, AuditInputs, CompetitorData, V4InternalAnalysis, V4ExternalDashboard, ScoringFactor } from "../types";

export const calculateScore = (
  _business: BusinessProfile,
  _inputs: AuditInputs,
  _competitors: CompetitorData[],
  internal: V4InternalAnalysis
): { score: number; factors: ScoringFactor[]; dashboard: V4ExternalDashboard } => {
  
  // --- 1. CALCULATE LVC (Local Visibility Confidence) ---
  // Formula: Weighted average of Prominence (40%), Relevance (30%), Proximity (30%)
  const rawLvc = (
    (internal.confidence_components.prominence * 0.4) +
    (internal.confidence_components.relevance * 0.3) +
    (internal.confidence_components.proximity * 0.3)
  );
  const lvcScore = Math.round(rawLvc * 100);

  // --- 2. ALERT LOGIC (Rule Engine) ---
  let alertStatus: V4ExternalDashboard['alert_status'] = {
    type: 'stable',
    title: 'Visibility Stable',
    message: 'Profile signals are consistent, but growth is flat.',
    color: 'blue'
  };

  const riskFlags = internal.eligibility_layer.risk_flags.length;
  const authenticity = internal.review_layer.review_authenticity;
  const consistency = internal.activity_layer.posting_consistency;
  const velocity = internal.review_layer.review_freshness;

  if (!internal.eligibility_layer.business_name_integrity || riskFlags > 0 || authenticity < 0.6) {
    alertStatus = {
      type: 'risk',
      title: 'Risk Alert',
      message: 'Some profile signals may require attention to maintain long-term visibility.',
      color: 'red'
    };
  } else if (consistency < 0.5 && velocity < 0.6) {
    alertStatus = {
      type: 'stagnation',
      title: 'Stagnation Alert',
      message: 'Visibility is stable but not expanding. Activity signals may need reinforcement.',
      color: 'yellow'
    };
  } else if (velocity > 0.75 && internal.activity_layer.media_freshness > 0.7) {
    alertStatus = {
      type: 'growth',
      title: 'Growth Alert',
      message: 'Positive momentum detected. Continued consistency may expand visibility.',
      color: 'green'
    };
  }

  // --- 3. GENERATE OUTLOOK ---
  const outlook = {
    timeline_30_day: alertStatus.type === 'risk' ? "Focus on compliance and trust restoration." 
      : alertStatus.type === 'growth' ? "Capitalize on momentum with new content." 
      : "Increase activity to break stagnation.",
    timeline_90_day: "Target market dominance through consistent authority signals."
  };

  // --- 4. BACKWARD COMPATIBILITY (Factors) ---
  // We still generate factors for the UI list view, but derived from V4 layers
  const factors: ScoringFactor[] = [];
  
  const addFactor = (id: string, name: string, score: number, max: number, reason: string, fix: string, cat: any) => {
    factors.push({
      id, name, score: Math.round(score), maxScore: max,
      status: (score/max) < 0.5 ? 'critical' : (score/max) < 0.8 ? 'warning' : 'good',
      impact: max > 10 ? 'high' : 'medium',
      reason, fixAction: fix, category: cat
    });
  };

  // Eligibility
  addFactor('v4_name', 'Name Integrity', internal.eligibility_layer.business_name_integrity ? 10 : 0, 10, 
    internal.eligibility_layer.business_name_integrity ? "Name appears clean." : "Risk: Potential keyword stuffing.", 
    "Ensure name matches signage.", 'eligibility');

  // Relevance
  addFactor('v4_cat', 'Category Match', internal.relevance_layer.primary_category_match * 20, 20, 
    `Relevance Score: ${(internal.relevance_layer.primary_category_match * 100).toFixed(0)}%`, 
    "Refine primary category if low.", 'relevance');

  // Reviews
  addFactor('v4_rev', 'Review Signals', internal.review_layer.review_sentiment * 30, 30,
    "Sentiment analysis of recent reviews.", "Reply to all reviews professionally.", 'authority');

  // Activity
  addFactor('v4_act', 'Profile Activity', internal.activity_layer.posting_consistency * 20, 20,
    "Frequency of updates and media.", "Post weekly updates.", 'conversion');

  // --- 5. ASSEMBLE EXTERNAL DASHBOARD ---
  const dashboard: V4ExternalDashboard = {
    lvc_score: lvcScore,
    alert_status: alertStatus,
    outlook: outlook,
    opportunities: internal.strategic_opportunities.map(op => ({
      title: op.title,
      description: op.description,
      impact: op.impact === 'high' ? 'High' : op.impact === 'medium' ? 'Medium' : 'Low'
    }))
  };

  return { score: lvcScore, factors, dashboard };
};

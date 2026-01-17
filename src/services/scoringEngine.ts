import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  _competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  // Use the Admin Audit score from AI as the top-level score
  let totalScore = aiAnalysis.admin_audit.overall_score || 0;
  const factors: ScoringFactor[] = [];

  // Silencing TS unused parameter warning explicitly
  void _competitors;

  // --- Helper to add factors ---
  const addFactor = (
    id: string, name: string, max: number, earned: number, 
    reason: string, fix: string, category: 'gbp' | 'seo'
  ) => {
    // Calculate status based on points earned
    const percentage = max > 0 ? earned / max : 0;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < 0.5) status = 'critical';
    else if (percentage < 0.8) status = 'warning';

    factors.push({
      id, name, maxScore: max, score: earned, 
      status, impact: max > 10 ? 'high' : max > 5 ? 'medium' : 'low',
      reason, fixAction: fix, category
    });
  };

  // --- 1. DETERMISTIC CHECKS (Populate Detailed Audit) ---
  // Updated text to match "Why it matters" and "The Fix" style.

  // Title Length
  const titleLength = business.name.length;
  addFactor('title_len', 'Business Title Length', 5, titleLength < 40 ? 5 : 2, 
    titleLength < 40 ? "Why it matters: Title is concise and readable." : "Why it matters: Long titles look like spam to Google algorithms.",
    titleLength < 40 ? "The Fix (Step-by-Step): No action needed." : "The Fix (Step-by-Step): \n1. Go to Info. \n2. Shorten title to your legal brand name.", 'gbp');

  // Address
  const addressMatch = business.address.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('addr_match', 'Address City Match', 5, addressMatch ? 5 : 0,
    addressMatch ? "Why it matters: Address confirms city relevance." : "Why it matters: Physical address is outside the target city limits.",
    addressMatch ? "The Fix (Step-by-Step): No action needed." : "The Fix (Step-by-Step): \n1. Consider opening a satellite office. \n2. Or focus only on Service Area settings.", 'gbp');

  // Website
  addFactor('web_link', 'Website Link', 5, business.website ? 5 : 0,
    business.website ? "Why it matters: Website link creates trust." : "Why it matters: Missing website prevents user conversion.",
    business.website ? "The Fix (Step-by-Step): No action needed." : "The Fix (Step-by-Step): \n1. Add your URL to the Website field immediately.", 'gbp');

  // Rating
  let ratingPoints = 0;
  if (business.rating >= 4.5) ratingPoints = 10;
  else if (business.rating >= 4.0) ratingPoints = 5;
  addFactor('rating_val', 'Review Rating', 10, ratingPoints,
    `Why it matters: Customers choose businesses with 4.5+ stars. Current: ${business.rating}.`, 
    "The Fix (Step-by-Step): \n1. Generate your review link in GBP Manager. \n2. Send SMS to last 10 happy clients.", 'gbp');

  // Photo Count (Mocked based on array presence)
  const hasPhotos = business.photos && business.photos.length > 0;
  addFactor('photo_vol', 'Photo Volume', 5, hasPhotos ? 5 : 0,
    hasPhotos ? "Why it matters: Photos convert views to clicks." : "Why it matters: No photos detected. Profiles without photos get 40% fewer clicks.",
    "The Fix (Step-by-Step): \n1. Take 10 photos of interior/exterior. \n2. Upload them today.", 'gbp');

  // Secondary Categories (Mocked)
  const hasSecCats = business.types.length > 1;
  addFactor('sec_cats', 'Secondary Categories', 5, hasSecCats ? 5 : 0,
    hasSecCats ? "Why it matters: Secondary categories catch niche searches." : "Why it matters: You are only ranking for one category type.",
    "The Fix (Step-by-Step): \n1. Edit Profile > Categories. \n2. Add 2-3 relevant secondary categories.", 'gbp');

  // Website H1 (Mocked simple check)
  const h1Match = inputs.websiteContent?.h1.toLowerCase().includes(inputs.targetKeyword.toLowerCase());
  addFactor('site_h1', 'Website H1 Optimization', 10, h1Match ? 10 : 0,
    h1Match ? "Why it matters: H1 signals relevance." : "Why it matters: Homepage H1 does not mention target keyword.",
    "The Fix (Step-by-Step): \n1. Edit your website homepage. \n2. Change H1 to include: '" + inputs.targetKeyword + "'.", 'seo');

  // Website Title
  const titleMatch = inputs.websiteContent?.titleTag.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('site_title', 'Title Tag Geo-Relevance', 10, titleMatch ? 10 : 5,
    titleMatch ? "Why it matters: Title tag confirms location." : "Why it matters: Title tag missing city name.",
    "The Fix (Step-by-Step): \n1. Update page title tag. \n2. Add '" + inputs.targetCity + "'.", 'seo');

  // Backlinks (Manual input proxy)
  const backlinkScore = inputs.backlinks === 'high' ? 10 : inputs.backlinks === 'medium' ? 5 : 0;
  addFactor('backlinks', 'Local Backlink Strength', 10, backlinkScore,
    `Why it matters: Backlinks power authority. Strength: ${inputs.backlinks}.`, 
    "The Fix (Step-by-Step): \n1. Register on Yelp, YellowPages. \n2. Sponsor a local event.", 'seo');


  // --- 2. INTEGRATE AI BLOCKERS AS FACTORS ---
  // The AI returns specific "Blockers". We map these to Factors to ensure they appear in the visual list.
  // If an AI blocker overlaps with a deterministic one, we usually prefer the AI explanation, 
  // but for simplicity here we add them as "Advanced Checks".

  aiAnalysis.admin_audit.primary_blockers.forEach((blocker, index) => {
    // These are penalties.
    const maxScore = blocker.severity === 'High' ? 15 : 10;
    factors.push({
      id: `ai_blocker_${index}`,
      name: blocker.title,
      maxScore: maxScore,
      score: 0, // 0 points earned because it's a blocker
      status: 'critical',
      impact: 'high',
      reason: blocker.explanation,
      fixAction: blocker.suggested_fix,
      category: 'gbp' // Assume most are GBP
    });
  });

  return { score: totalScore, factors };
};
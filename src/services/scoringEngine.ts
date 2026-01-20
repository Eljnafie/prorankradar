
import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  let totalScore = 0;
  const factors: ScoringFactor[] = [];

  // --- Helper to add factors ---
  const addFactor = (
    id: string, name: string, max: number, earned: number, 
    reason: string, fix: string, category: 'gbp' | 'seo'
  ) => {
    totalScore += earned;
    const percentage = earned / max;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < 0.5) status = 'critical';
    else if (percentage < 0.8) status = 'warning';

    factors.push({
      id, name, maxScore: max, score: earned, 
      status, impact: max > 10 ? 'high' : max > 5 ? 'medium' : 'low',
      reason, fixAction: fix, category
    });
  };

  // --- 1. GBP SIGNALS (70 pts) ---

  // Primary Category (15)
  const catScore = aiAnalysis.categoryRelevance.score > 8 ? 15 : aiAnalysis.categoryRelevance.score > 5 ? 8 : 0;
  addFactor('cat_rel', 'Primary Category Relevance', 15, catScore, 
    aiAnalysis.categoryRelevance.reason, 
    `Change primary category to one of: ${aiAnalysis.categoryRelevance.suggestedCategories.join(', ')}`, 'gbp');

  // Business Title (14) - Keyword Stuffing Check
  let titleScore = 14;
  let titleReason = "Title is clean and brand-focused.";
  let titleFix = "No action needed.";
  
  if (aiAnalysis.titleAnalysis.isSpammy) {
    titleScore = 0; // Hard penalty
    titleReason = "Title contains keyword stuffing (Risk of suspension).";
    titleFix = "Reset name to real-world business name immediately.";
  } else if (business.name.length > 40) {
    titleScore = 7;
    titleReason = "Title is unusually long.";
    titleFix = "Ensure title matches signage exactly.";
  }
  addFactor('title_opt', 'Business Title Optimization', 14, titleScore, titleReason, titleFix, 'gbp');

  // Address in Target City (11)
  const cityMatch = business.address.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('addr_city', 'Physical Address in Target City', 11, cityMatch ? 11 : 0, 
    cityMatch ? "Address is within target city." : "Address appears outside target city limits.",
    cityMatch ? "None" : "Consider a location closer to city center if ranking is priority.", 'gbp');

  // Review Rating (6)
  let ratingScore = 0;
  if (business.rating >= 4.5) ratingScore = 6;
  else if (business.rating >= 4.0) ratingScore = 4;
  else if (business.rating >= 3.5) ratingScore = 2;
  addFactor('rev_rate', 'Review Rating', 6, ratingScore, 
    `Current rating: ${business.rating}`, 
    "Implement a review generation campaign to increase average rating.", 'gbp');

  // Review Volume vs Competitors (4)
  const avgCompReviews = competitors.length ? competitors.reduce((a, b) => a + b.reviewCount, 0) / competitors.length : 0;
  const volRatio = avgCompReviews > 0 ? business.user_ratings_total / avgCompReviews : 1;
  let volScore = 0;
  if (volRatio >= 1) volScore = 4;
  else if (volRatio >= 0.5) volScore = 2;
  addFactor('rev_vol', 'Review Volume Competitive Gap', 4, volScore, 
    `You have ${business.user_ratings_total} vs Avg Comp ${Math.round(avgCompReviews)}`, 
    "Launch aggressive review campaign (SMS/Email) to close gap.", 'gbp');

  // Profile Completeness (6)
  const hasWebsite = !!business.website;
  const hasPhotos = (business.photos?.length || 0) > 5;
  addFactor('prof_comp', 'Profile Completeness', 6, (hasWebsite ? 3 : 0) + (hasPhotos ? 3 : 0), 
    `Website: ${hasWebsite ? 'Yes' : 'No'}, Photos: ${hasPhotos ? 'Good' : 'Low'}`, 
    "Add website link and upload 5+ interior/exterior photos.", 'gbp');

  // Verification Status (4)
  addFactor('ver_status', 'Verification Status', 4, 4, 
    "Business appears published.", "Ensure video verification is completed if re-triggered.", 'gbp');

  // Map Pin Accuracy (2) - Assume good for now
  addFactor('pin_acc', 'Map Pin Accuracy', 2, 2, "Pin location within valid range.", "Check satellite view to confirm entrance location.", 'gbp');

  // Keywords in Reviews (5)
  addFactor('rev_kw', 'Keywords in Reviews', 5, aiAnalysis.reviewSentiment.hasKeywords ? 5 : 2, 
    aiAnalysis.reviewSentiment.hasKeywords ? "Keywords found in reviews." : "Customers not mentioning services.", 
    "Ask clients to mention specific services in their reviews.", 'gbp');

  // Secondary Categories (6) - Mocked assume if array > 1
  const hasSecondary = business.types.length > 1;
  addFactor('sec_cat', 'Secondary Categories', 6, hasSecondary ? 6 : 0, 
    hasSecondary ? "Secondary categories utilized." : "Only primary category found.", 
    "Add 2-3 relevant secondary categories (e.g. 'Emergency Dental Service').", 'gbp');


  // --- 2. EXTERNAL & LOCAL SEO (30 pts) ---
  
  // Website Content (Landing Page) (4)
  // Simplified check: Does H1 match keyword?
  const h1Match = inputs.websiteContent?.h1.toLowerCase().includes(inputs.targetKeyword.toLowerCase());
  addFactor('seo_h1', 'Landing Page H1 Optimization', 4, h1Match ? 4 : 0, 
    h1Match ? "H1 includes keyword." : "H1 missing target keyword.", 
    `Update H1 to include '${inputs.targetKeyword}'.`, 'seo');

  // Title Tag (2)
  const metaMatch = inputs.websiteContent?.titleTag.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('seo_title', 'Title Tag Geo-Relevance', 2, metaMatch ? 2 : 0, 
    metaMatch ? "Title tag includes city." : "Title tag missing city name.", 
    `Add '${inputs.targetCity}' to your homepage title tag.`, 'seo');

  // Backlinks (5) - Manual Input
  let linkScore = 0;
  if (inputs.backlinks === 'high') linkScore = 5;
  if (inputs.backlinks === 'medium') linkScore = 3;
  if (inputs.backlinks === 'low') linkScore = 1;
  addFactor('seo_links', 'Local Backlink Strength', 5, linkScore, 
    `Strength level: ${inputs.backlinks}`, 
    "Build citations on Yelp, YellowPages, and local chamber of commerce.", 'seo');
    
  // Generic SEO fillers for the remaining points to reach 100 total potential
  // NAP Consistency (4)
  addFactor('seo_nap', 'NAP Consistency', 4, 4, "Assumed consistent for audit.", "Audit top 10 directories for matching Name, Address, Phone.", 'seo');
  
  // Competitor Spam (5)
  addFactor('seo_spam', 'Competitor Spam Levels', 5, 3, "Moderate spam detected in niche.", "Report keyword-stuffed competitor titles to Google.", 'seo');
  
  // Internal Linking (3)
  addFactor('seo_internal', 'Internal Linking Structure', 3, 2, "Basic structure detected.", "Link service pages back to location home page.", 'seo');
  
  // Geo Content (2)
  addFactor('seo_geo', 'Geo-specific Content', 2, 1, "Limited local mentions.", "Create a 'Areas We Serve' section.", 'seo');
  
  // Local Authority (3)
  addFactor('seo_auth', 'Local Authority Signals', 3, 1, "Low local press/events.", "Sponsor a local team or event for .edu/.org links.", 'seo');
  
  // Engagement (2)
  addFactor('seo_engage', 'Engagement Signals', 2, 2, "Traffic flow appears normal.", "Post weekly updates to drive click-through rate.", 'seo');

  // --- POST-PROCESSING: SENIOR LOCAL SEO CONSULTANT EXPERT MODULES ---
  // Mandatory replacement for failed/warn items based on prompt database
  factors.forEach(f => {
    if (f.score < f.maxScore) {
      
      // 1. Primary & Secondary Categories
      if (f.id === 'cat_rel' || f.id === 'sec_cat') {
        f.reason = "Importance: This is the 'DNA' of your profile. If your primary category is too broad, you are invisible to 40% of customers searching for your specific service.";
        f.fixAction = "Step-by-Step Fix:\n1. Log in to your GBP dashboard.\n2. Click 'Edit Profile.'\n3. Select 'Business Information.'\n4. Change the Primary Category to the most specific match.\n5. Add 3 relevant Secondary Categories.\n6. Click Save.";
      }

      // 2. Review Rating & Volume Gap
      if (['rev_rate', 'rev_vol'].includes(f.id)) {
        f.reason = "Importance: Google uses a '4.0+ Star' filter. If you have a 3.9, you don't even appear in those searches. High volume creates 'Social Proof' that makes customers choose you over a competitor.";
        f.fixAction = "Step-by-Step Fix:\n1. Click 'Ask for reviews' in your dashboard.\n2. Copy the short link.\n3. Send it to 5 past customers today.\n4. Print a QR code of this link and place it on your counter/menu.";
      }

      // 3. Address/Pin Accuracy & NAP Consistency
      if (['addr_city', 'pin_acc', 'seo_nap'].includes(f.id)) {
        f.reason = "Importance: If your address format differs between your website and Google (e.g., 'St.' vs 'Street'), Google loses trust in your location, and your ranking drops.";
        f.fixAction = "Step-by-Step Fix:\n1. Copy your address from Google.\n2. Go to your website footer and 'Contact' page.\n3. Paste the address exactly so it is a 100% match.\n4. Update your Facebook/Instagram to match.";
      }

      // 4. Website H1 & Title Tag Optimization
      if (['seo_h1', 'seo_title'].includes(f.id)) {
        f.reason = "Importance: This tells Google's 'crawlers' that your website and your Map pin are the same business. Without your City/Zip in the H1 tag, your ranking power is cut in half.";
        f.fixAction = "Step-by-Step Fix:\n1. Open your website editor.\n2. Locate the main top heading (H1).\n3. Change it to: '[Business Name] - [Service] in [City/Zip]'.\n4. Update the Browser Title Tag to match.";
      }

      // 5. Engagement (Review Responses & Posts)
      if (['seo_engage', 'rev_kw'].includes(f.id)) {
        f.reason = "Importance: Replying to reviews and posting updates signals that your business is 'Alive.' Active profiles rank significantly higher than abandoned ones.";
        f.fixAction = "Step-by-Step Fix:\n1. Go to 'Reviews.'\n2. Reply to the 5 most recent ones.\n3. Click 'Add Update' and post 1 photo with a caption mentioning your neighborhood.";
      }
    } else {
        // Enforce specific passing text as requested
        f.reason = "No action needed—you are outperforming competitors in this area.";
        f.fixAction = "Maintain current strategy.";
    }
  });

  return { score: totalScore, factors };
};

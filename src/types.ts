
export interface BusinessProfile {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  types: string[]; // Categories
  website?: string;
  location?: { lat: number; lng: number };
  photos?: any[];
  reviews?: any[];
}

export interface CompetitorData {
  name: string;
  rating: number;
  reviewCount: number;
  distance?: string;
  isAd?: boolean;
}

export type AuditLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

export interface AuditInputs {
  targetKeyword: string;
  targetCity: string;
  language: AuditLanguage;
  websiteContent?: {
    titleTag: string;
    h1: string;
    metaDescription: string;
  };
  backlinks?: 'low' | 'medium' | 'high'; // Simplified for manual input
}

export interface ScoringFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'critical';
  impact: 'high' | 'medium' | 'low';
  reason: string;
  fixAction: string;
  category: 'gbp' | 'seo';
  dimension?: string;
}

// --- NEW TWO-TIER AUDIT TYPES ---

export interface FreeAuditReport {
  overall_score: number;
  seo_strength: number;
  competitor_comparison: {
    my_rating: number;
    competitor_avg_rating: number;
    rating_diff: string;
  };
  high_impact_issues: {
    title: string;
    impact_summary: string;
  }[];
  teaser_text: string;
}

export interface PrimaryBlocker {
  dimension: 'Relevance' | 'Proximity' | 'Prominence' | 'Trust' | 'Engagement';
  severity: 'High' | 'Medium' | 'Low';
  confidence: number;
  title: string;
  explanation: string; // 40-70 words
  impact: string;
  suggested_fix: string;
}

export interface ReviewGapAnalysis {
  current_rating: number;
  target_rating: number;
  reviews_needed: number;
  competitor_comparison_text: string;
}

export interface ContentFreshness {
  photo_recency_pass: boolean;
  google_posts_pass: boolean;
  qa_answered_pass: boolean;
  engagement_trend: string;
}

export interface AdminAuditReport {
  overall_score: number;
  gbp_health: number;
  seo_strength: number;
  review_gap: ReviewGapAnalysis;
  content_freshness: ContentFreshness;
  primary_blockers: PrimaryBlocker[];
  secondary_factors: string[];
  action_plan: {
    technical: string;
    engagement: string;
    conversion: string;
  };
  roi_forecast: string;
  compliance_notice: string;
}

export interface GeminiAnalysis {
  metadata: {
    seo_title: string;
    meta_description: string;
  };
  free_audit: FreeAuditReport;
  admin_audit: AdminAuditReport;
}

export interface AuditReportData {
  business: BusinessProfile;
  inputs: AuditInputs;
  overallScore: number;
  factors: ScoringFactor[];
  geminiAnalysis: GeminiAnalysis;
  competitors: CompetitorData[];
}

// --- CMS & BLOG TYPES ---

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  author: string;
  date: string;
  imageUrl?: string;
  slug: string;
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  problem: {
    title: string;
    card1Title: string;
    card1Text: string;
    card2Title: string;
    card2Text: string;
    card3Title: string;
    card3Text: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  pricing: {
    auditOneTime: string;
    expertOneTime: string;
    managementSetup: string;
    managementMonthly: string;
  };
}

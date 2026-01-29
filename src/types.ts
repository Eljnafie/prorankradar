
export type AuditLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

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

export interface AuditInputs {
  targetKeyword: string;
  targetCity: string;
  language?: AuditLanguage;
  websiteContent?: {
    titleTag: string;
    h1: string;
    metaDescription: string;
  };
  backlinks?: 'low' | 'medium' | 'high';
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
  category: 'profile_safety' | 'user_trust' | 'visibility_and_competition';
}

interface SignalAnalysis {
  what_it_means: string;
  current_state: string;
  why_it_matters: string;
}

// V3 MASTER SPEC INTERFACE
export interface GeminiAnalysis {
  audit_version: string;
  tool_name: string;
  business_overview: {
    business_name: string;
    category: string;
    location: string;
    audit_date: string;
  };
  executive_summary: {
    plain_language_summary: string;
    current_visibility_status: 'visible' | 'partially_visible' | 'mostly_invisible';
    main_problem_explained_simply: string;
    primary_opportunity: string;
  };
  methodology: {
    maps_data_explanation: string;
    ai_explanation_role: string;
    important_note: string;
  };
  geo_grid_analysis: {
    what_the_grid_means: string;
    color_legend: {
      green: string;
      orange: string;
      red: string;
    };
    key_observations: string[];
    geographic_insight: string;
  };
  local_visibility_coverage: {
    lvc_score_percent: number;
    simple_explanation: string;
    benchmark_context: {
      weak: string;
      partial: string;
      strong: string;
    };
    business_impact: string;
  };
  baseline_scorecard: {
    profile_safety: 'high' | 'medium' | 'low';
    user_trust: 'high' | 'medium' | 'low';
    engagement_activity: 'high' | 'medium' | 'low';
    local_visibility: 'high' | 'medium' | 'low';
    notes: string;
  };
  signal_separation: {
    profile_safety: SignalAnalysis;
    user_trust: SignalAnalysis;
    visibility_and_competition: SignalAnalysis;
  };
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
  content: string; 
  author: string;
  date: string;
  imageUrl?: string;
  slug: string;
  language?: AuditLanguage;
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
  pricing?: {
    auditOneTime: string;
    expertOneTime: string;
    managementSetup: string;
    managementMonthly: string;
  };
}

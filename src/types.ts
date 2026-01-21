
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
}

export interface GeminiAnalysis {
  // Legacy fields for Scoring Engine
  titleAnalysis: {
    isSpammy: boolean;
    reason: string;
    keywordStuffed: boolean;
  };
  categoryRelevance: {
    score: number; // 0-10
    reason: string;
    suggestedCategories: string[];
  };
  reviewSentiment: {
    hasKeywords: boolean;
    sentiment: string;
    topics: string[];
  };
  fixPlan: {
    step1: string;
    step2: string;
    step3: string;
    rankingPotential: string;
  };
  roiForecast: string;
  
  // Master Prompt New Fields
  executiveSummary?: string;
  lvcScore?: {
    score: number;
    level: string; // Strong / Moderate / Weak
    explanation: string;
  };
  geoGridAnalysis?: {
    analysis: string;
  };
  admin_audit?: {
    roi_forecast?: string;
    review_gap?: {
      target_rating: number;
      reviews_needed: number;
    };
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
  pricing?: {
    auditOneTime: string;
    expertOneTime: string;
    managementSetup: string;
    managementMonthly: string;
  };
}

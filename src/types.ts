
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
  category: 'compliance' | 'trust' | 'engagement' | 'seo';
}

// MASTER PROMPT ANALYSIS INTERFACE
export interface GeminiAnalysis {
  executiveSummary: string;
  
  // Local Visibility Coverage (LVC)
  visibility: {
    score: number; // 0-100
    classification: 'Strong' | 'Moderate' | 'Weak';
    summary: string;
  };

  // Trust & Reputation
  trustAnalysis: {
    trustGap: number; // difference from leader
    reviewsNeeded: number;
    sentimentSummary: string;
  };

  // 3-Phase Action Plan
  roadmap: {
    immediate: string[]; // 0-7 days
    shortTerm: string[]; // 14-30 days
    growth: string[];    // 30-90 days
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

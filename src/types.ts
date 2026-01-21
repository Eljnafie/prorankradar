
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
  category: 'gbp' | 'seo';
}

// STRICT MAPPING TO PDF SECTIONS
export interface GeminiAnalysis {
  // Section 1: GBP Core Signals
  primaryCategory: { score: number; analysis: string; fix: string; suggested: string[] };
  businessTitle: { score: number; analysis: string; fix: string; isSpammy: boolean };
  proximity: { score: number; analysis: string; fix: string };
  completeness: { score: number; analysis: string; fix: string };
  verification: { score: number; analysis: string; fix: string };
  mapPin: { score: number; analysis: string; fix: string };
  secondaryCategories: { score: number; analysis: string; fix: string };

  // Section 2: Reputation
  reviewRating: { score: number; analysis: string; fix: string };
  reviewVolume: { score: number; analysis: string; fix: string };
  reviewKeywords: { score: number; analysis: string; fix: string };
  
  // Section 3: Website & Content
  h1Optimization: { score: number; analysis: string; fix: string };
  titleTag: { score: number; analysis: string; fix: string };
  backlinks: { score: number; analysis: string; fix: string };
  napConsistency: { score: number; analysis: string; fix: string };
  internalLinks: { score: number; analysis: string; fix: string };
  geoContent: { score: number; analysis: string; fix: string };
  authority: { score: number; analysis: string; fix: string };
  
  // Section 4: Competitive/Authority
  engagement: { score: number; analysis: string; fix: string };
  competitorSpam: { score: number; analysis: string; fix: string };
  
  // Summary & Plan
  executiveSummary: string;
  roiForecast: string;
  fixPlan: {
    step1: string;
    step2: string;
    step3: string;
    rankingPotential: string;
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
  language: AuditLanguage;
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

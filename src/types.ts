
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
  category: 'gbp' | 'seo' | 'trust' | 'conversion';
}

// UPGRADED AI ANALYSIS INTERFACE
export interface GeminiAnalysis {
  // 1. Review Sentiment & Response
  sentimentAnalysis: {
    trustGap: number; // e.g. 1.9 stars difference
    reviewsNeeded: number; // e.g. 42 reviews to reach 4.9
    ratingImpact: string; // "Conversion Killer" description
    responseAnalysis: string; // "Neglect" vs "Managed"
  };

  // 2. Technical vs Commercial Duality
  commercialStatus: {
    trustHealthScore: number; // 100 if safe
    isGhostProfile: boolean; // True if activity is zero despite good health
    revenueImpact: string; // "Massive Lost Revenue" or "Optimized"
    suspensionRisk: 'Low' | 'Medium' | 'High';
  };

  // 3. 90-Day Success Roadmap
  roadmap: {
    phase1: {
      title: string; // "Security & Foundation"
      steps: string[];
    };
    phase2: {
      title: string; // "Lead Generation & Conversion"
      steps: string[];
    };
    phase3: {
      title: string; // "Authority & Market Dominance"
      steps: string[];
    };
  };

  // Legacy/Visual Assets
  executiveSummary: string;
  roiForecast: string;
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


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
  category: 'eligibility' | 'relevance' | 'authority' | 'conversion';
}

// --- EXECUTIVE AUDIT ANALYSIS (V5 FINTECH STANDARD) ---

export interface ExecutiveAuditAnalysis {
  report_metadata: {
    style: string;
    tone: string;
    brand: string;
  };
  executive_dashboard: {
    kpis: {
      trust_health_score: { value: number; label: string; description: string };
      visibility_confidence: { value: number; label: string; description: string };
      commercial_engine: { value: number; label: string; description: string };
    };
  };
  audit_analysis_breakdown: {
    profile_accuracy: { expert_insight: string; the_gap: string; impact: string };
    reputation_intelligence: { expert_insight: string; the_gap: string; sentiment_analysis: string };
    media_engagement: { expert_insight: string; the_gap: string };
    off_profile_authority: { expert_insight: string; the_gap: string };
    competitive_positioning: { expert_insight: string; the_gap: string };
  };
  prioritized_action_roadmap: {
    phase_1_foundation: { title: string; actions: string[]; goal: string };
    phase_2_conversion: { title: string; actions: string[]; goal: string };
    phase_3_authority: { title: string; actions: string[]; goal: string };
  };
  roi_projection: {
    estimated_growth: string;
    expert_conclusion: string;
  };
}

// --- EXTERNAL DASHBOARD (Client View) ---
export interface AuditReportData {
  business: BusinessProfile;
  inputs: AuditInputs;
  overallScore: number; // Mapped from visibility_confidence
  factors: ScoringFactor[]; // Mapped from analysis sections
  geminiAnalysis: ExecutiveAuditAnalysis; // The Executive Brain
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

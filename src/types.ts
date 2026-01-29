
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

// --- V4 INTERNAL ENGINE (The "Brain" - Hidden from Client) ---
export interface V4InternalAnalysis {
  engine_meta: {
    audit_version: string;
    generated_at: string;
    confidence_model: string;
  };
  eligibility_layer: {
    real_world_validation: boolean;
    business_name_integrity: boolean;
    risk_flags: string[];
  };
  relevance_layer: {
    primary_category_match: number; // 0.0 - 1.0
    service_semantic_match: number;
  };
  review_layer: {
    review_freshness: number;
    review_sentiment: number;
    review_authenticity: number;
  };
  activity_layer: {
    posting_consistency: number;
    media_freshness: number;
  };
  geo_layer: {
    coverage_density: number;
    competitive_pressure: number;
  };
  confidence_components: {
    relevance: number;
    proximity: number;
    prominence: number;
  };
  strategic_opportunities: {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}

// --- V4 EXTERNAL DASHBOARD (What the Client Sees) ---
export interface V4ExternalDashboard {
  lvc_score: number; // 0-100 Confidence Score
  alert_status: {
    type: 'risk' | 'stagnation' | 'growth' | 'stable';
    title: string;
    message: string;
    color: string;
  };
  outlook: {
    timeline_30_day: string;
    timeline_90_day: string;
  };
  opportunities: {
    title: string;
    description: string;
    impact: 'High' | 'Medium' | 'Low';
  }[];
}

export interface AuditReportData {
  business: BusinessProfile;
  inputs: AuditInputs;
  overallScore: number; // Mapped to LVC
  factors: ScoringFactor[]; // Backward compatibility for list view
  internalAnalysis: V4InternalAnalysis; // The Brain
  externalDashboard: V4ExternalDashboard; // The View
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

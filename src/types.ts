
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

// --- V5 MASTER AUDIT STRUCTURE ---

export interface V5AuditAnalysis {
  meta: {
    audit_version: string;
    generated_at: string;
    audit_type: string;
    engine: {
      maps_api: boolean;
      gemini_api: boolean;
      geo_grid: boolean;
    };
    business: {
      name: string;
      primary_category: string;
      location_type: string;
      city: string;
      country: string;
    };
  };
  executive_summary: {
    overall_health: 'Poor' | 'Fair' | 'Good' | 'Strong';
    summary: string;
    main_strengths: string[];
    main_limitations: string[];
    overall_priority: string;
  };
  local_visibility_confidence: {
    score: number; // 0-100
    score_label: 'Low' | 'Moderate' | 'Strong' | 'Dominant';
    explanation: string;
    confidence_drivers: string[];
    confidence_gaps: string[];
  };
  profile_safety_and_compliance: {
    status: 'Safe' | 'Needs Attention' | 'At Risk';
    explanation: string;
    checked_elements: {
      business_name: string;
      address_logic: string;
      category_legitimacy: string;
      profile_ownership_signals: string;
    };
    recommended_caution: string[];
  };
  category_and_relevance_analysis: {
    primary_category: {
      status: string;
      explanation: string;
      recommended_action: string;
      micro_steps: string[];
    };
    secondary_categories: {
      status: string;
      explanation: string;
      recommended_changes: string[];
    };
    services_alignment: {
      status: string;
      explanation: string;
      actions: string[];
    };
  };
  reviews_analysis: {
    overall_status: string;
    explanation: string;
    metrics: {
      review_count_vs_competitors: string;
      average_rating_status: string;
      freshness: string;
      velocity: string;
      text_quality: string;
    };
    issues_detected: string[];
    improvement_plan: {
      monthly_target: number;
      what_customers_should_mention: string[];
      owner_response_guidelines: string[];
    };
  };
  photos_and_media_analysis: {
    overall_status: string;
    explanation: string;
    missing_photo_types: string[];
    freshness_status: string;
    recommended_actions: {
      upload_frequency: string;
      photo_guidelines: string[];
    };
  };
  profile_activity_and_engagement: {
    status: string;
    analysis: {
      google_posts: string;
      services_section: string;
      q_and_a: string;
      messaging: string;
      hours_accuracy: string;
    };
    recommended_actions: string[];
  };
  geo_grid_and_local_coverage: {
    explanation: string;
    visibility_zones: {
      strong_zones: string[];
      moderate_zones: string[];
      weak_zones: string[];
    };
    priority_focus_zones: {
      zone_name: string;
      reason: string;
      difficulty: string;
    }[];
  };
  competitive_benchmark: {
    summary: string;
    where_competitors_are_stronger: string[];
    realistic_opportunities_to_close_gap: string[];
  };
  action_plan_timeline: {
    days_0_30: {
      focus: string;
      actions: string[];
      expected_changes: string[];
    };
    days_31_60: {
      focus: string;
      actions: string[];
      expected_changes: string[];
    };
    days_61_90: {
      focus: string;
      actions: string[];
      expected_changes: string[];
    };
  };
  expected_outcomes: {
    short_term: string[];
    mid_term: string[];
    long_term: string[];
  };
  final_priorities: {
    top_actions: string[];
    actions_to_avoid: string[];
    consistency_requirements: string[];
  };
  disclaimer: {
    statement: string;
    no_guarantees: boolean;
  };
}

// --- EXTERNAL DASHBOARD (Client View) ---
export interface AuditReportData {
  business: BusinessProfile;
  inputs: AuditInputs;
  overallScore: number; // Mapped from local_visibility_confidence.score
  factors: ScoringFactor[]; // Mapped from V5 sections for list view
  geminiAnalysis: V5AuditAnalysis; // The V5 Brain
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

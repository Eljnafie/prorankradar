
import { GoogleGenAI, Type } from "@google/genai";
import type { BusinessProfile, AuditInputs, GeminiAnalysis, BlogPost, AuditLanguage } from "../types";

const ANALYSIS_MODEL = 'gemini-3-flash-preview';

// Helper to get AI instance with dynamic key
const getAI = (apiKey?: string) => {
  // Check both passed key and environment variable (Vite style)
  const envKey = import.meta.env.VITE_API_KEY || ''; 
  const key = (apiKey || envKey).trim();
  
  if (!key) {
    throw new Error("Gemini API Key is missing. Please enter it in the Admin Settings panel.");
  }
  return new GoogleGenAI({ apiKey: key });
};

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese'
};

export const analyzeProfileWithGemini = async (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: any[],
  apiKey?: string
): Promise<GeminiAnalysis> => {
  
  // 1. Validate Key immediately
  let ai;
  try {
    ai = getAI(apiKey);
  } catch (e: any) {
    console.warn("Gemini Client Init Failed:", e.message);
    throw e; // Propagate to App.tsx so user sees the "Missing Key" alert
  }

  const targetLanguage = LANGUAGE_MAP[inputs.language || 'en'] || 'English';
  const leaderRatingVal = competitors.length > 0 ? Math.max(...competitors.map((c: any) => c.rating || 0)) : 4.8;

  const prompt = `
    Role: Senior Local SEO Auditor (20+ years experience).
    Task: Conduct a forensic deep-scan of a Google Business Profile (GBP).
    Output Language: ${targetLanguage}
    
    === BUSINESS DATA ===
    Name: "${business.name}"
    Address: "${business.address}"
    Target City: "${inputs.targetCity}"
    Target Keyword: "${inputs.targetKeyword}"
    Primary Category: "${business.types[0] || 'Unknown'}"
    Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Website: "${business.website || 'No Website'}"
    H1: "${inputs.websiteContent?.h1 || 'Not detected'}"
    Title Tag: "${inputs.websiteContent?.titleTag || 'Not detected'}"
    
    === MARKET DATA ===
    Competitor Leader Rating: ${leaderRatingVal.toFixed(1)}
    ==================

    === ANALYSIS REQUIREMENTS ===
    Analyze 4 Core Areas:
    
    1. GBP CORE SIGNALS:
       - Primary Category: Is it specific? Suggest better ones if generic.
       - Title: Check for keyword stuffing (Spam).
       - Address/Proximity: Is it in the target city?
       - Profile Completeness: Photos, website link.
       - Verification: Assume based on visibility.
       - Map Pin: Assess accuracy based on address.
       - Secondary Categories: Are they likely missing?

    2. REPUTATION:
       - Rating Health: Compare to ${leaderRatingVal.toFixed(1)}.
       - Volume Gap: Does it have enough reviews?
       - Keywords in Reviews: Do customers mention the service?

    3. WEBSITE & LOCAL SEO:
       - Landing Page H1: Does it match keyword?
       - Title Tag: Does it include City + Keyword?
       - Backlinks: Estimate based on authority (Low/Med/High).
       - NAP Consistency: Is address format consistent?
       - Internal Linking: Is structure logical?
       - Geo-Content: Are "Areas We Serve" missing?
       - Local Authority: Events, sponsorships?

    4. COMPETITIVE & AUTHORITY:
       - Engagement: Are they posting updates?
       - Competitor Spam: Is the niche spammy?

    For EVERY factor, provide:
    - Score (0-10).
    - Analysis: Professional insight.
    - Fix: Specific actionable advice.

    Return valid JSON.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      primaryCategory: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, suggested: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["score", "analysis", "fix", "suggested"] },
      businessTitle: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, isSpammy: { type: Type.BOOLEAN } }, required: ["score", "analysis", "fix", "isSpammy"] },
      proximity: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      completeness: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      verification: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      mapPin: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      secondaryCategories: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },

      reviewRating: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      reviewVolume: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      reviewKeywords: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },

      h1Optimization: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      titleTag: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      backlinks: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      napConsistency: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      internalLinks: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      geoContent: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      authority: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },

      engagement: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      competitorSpam: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },

      executiveSummary: { type: Type.STRING },
      roiForecast: { type: Type.STRING },
      fixPlan: { type: Type.OBJECT, properties: { step1: { type: Type.STRING }, step2: { type: Type.STRING }, step3: { type: Type.STRING }, rankingPotential: { type: Type.STRING } }, required: ["step1", "step2", "step3", "rankingPotential"] }
    },
    required: [
      "primaryCategory", "businessTitle", "proximity", "completeness", "verification", "mapPin", "secondaryCategories",
      "reviewRating", "reviewVolume", "reviewKeywords",
      "h1Optimization", "titleTag", "backlinks", "napConsistency", "internalLinks", "geoContent", "authority",
      "engagement", "competitorSpam",
      "executiveSummary", "roiForecast", "fixPlan"
    ]
  };

  try {
    const response: any = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text) as GeminiAnalysis;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // Propagate API errors to UI
    if (error.message?.includes('403')) throw new Error("API Key Invalid or insufficient permissions. Please check your key.");
    if (error.message?.includes('429')) throw new Error("API Quota exceeded. You may be using a free key with rate limits.");
    throw error;
  }
};

export const generateBlogPost = async (topic: string, language: AuditLanguage, apiKey?: string): Promise<Partial<BlogPost>> => {
  const ai = getAI(apiKey);
  const targetLang = LANGUAGE_MAP[language] || 'English';

  const prompt = `
    Role: Senior SEO Content Strategist.
    Topic: "${topic}"
    Target Language: ${targetLang}
    Goal: Write an authoritative, formatted HTML blog post.
    Structure: Single H1, multiple H2s, practical tips.
    Output: JSON with title, excerpt, content (HTML), slug.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      excerpt: { type: Type.STRING },
      content: { type: Type.STRING },
      slug: { type: Type.STRING }
    },
    required: ["title", "excerpt", "content", "slug"]
  };

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as Partial<BlogPost>;
  } catch (error) {
    console.error("Blog Gen Error:", error);
    throw new Error("Failed to generate blog post");
  }
};

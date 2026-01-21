
import { GoogleGenAI, Type } from "@google/genai";
import type { BusinessProfile, AuditInputs, GeminiAnalysis, BlogPost, AuditLanguage } from "../types";

const ANALYSIS_MODEL = 'gemini-3-flash-preview';

const getAI = (apiKey?: string) => {
  // Use import.meta.env.VITE_API_KEY for Vite compatibility
  const key = apiKey || import.meta.env.VITE_API_KEY || '';
  if (!key) throw new Error("API Key is missing. Please add it in Admin Settings.");
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

// Helper to format relative time
const getReviewAge = (time?: number) => {
    if (!time) return "Unknown date";
    const date = new Date(time * 1000);
    return date.toLocaleDateString();
};

// Helper timeout function
const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Analysis Request Timed Out (25s)")), ms));

export const analyzeProfileWithGemini = async (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: any[],
  apiKey?: string
): Promise<GeminiAnalysis> => {
  
  // 1. Initialize AI (May throw if no key)
  const ai = getAI(apiKey);
  
  const targetLanguage = LANGUAGE_MAP[inputs.language || 'en'] || 'English';
  
  // Prepare Data for Prompt
  const leaderRatingVal = competitors.length > 0 ? Math.max(...competitors.map((c: any) => c.rating || 0)) : 4.8;
  
  // Format Reviews with Dates for "Freshness" analysis
  const reviewsText = business.reviews?.slice(0, 5).map(r => 
    `[${getReviewAge(r.time)}]: "${r.text || 'No text'}"`
  ).join("\n") || "No reviews available.";
  
  // Website Content
  const h1 = inputs.websiteContent?.h1 || "Not detected";
  const titleTag = inputs.websiteContent?.titleTag || "Not detected";

  const prompt = `
    Role: Senior Local SEO Auditor. 
    Task: Conduct a forensic audit of a Google Business Profile (GBP) using the provided Maps API data.
    Output Language: ${targetLanguage}
    
    === INPUT DATA ===
    Business Name: "${business.name}"
    Address: "${business.address}"
    City: "${inputs.targetCity}"
    Target Keyword: "${inputs.targetKeyword}"
    Primary Category: "${business.types[0] || 'Unknown'}"
    Current Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Market Leader Rating: ${leaderRatingVal.toFixed(1)}
    
    WEBSITE DATA:
    URL: "${business.website || 'No Website'}"
    Homepage H1: "${h1}"
    Meta Title: "${titleTag}"
    
    VISUALS:
    Photo Count: ${business.photos?.length || 0}
    
    RECENT REVIEWS (Analyze Dates & Sentiment):
    ${reviewsText}
    ==================

    === ANALYSIS INSTRUCTIONS ===
    For each section, provide:
    1. Score (0-15).
    2. Analysis: Start with "Impact:". Be specific.
    3. Fix: A numbered list (1. 2. 3.) of actionable technical steps.

    Sections to Analyze:
    1. Primary Category Relevance
    2. Business Title & Branding (Keyword Stuffing?)
    3. Review Health (Freshness, Rating, Volume)
    4. Website Optimization (H1, Title Tag matching location/keyword)
    5. Photos & Visuals
    6. Competitive Gap

    Also provide:
    - Executive Summary
    - ROI Forecast (% growth)
    - 3-Step Fix Plan
    - Ranking Potential

    Return valid JSON matching the schema.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      primaryCategory: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, suggested: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ["score", "analysis", "fix", "suggested"]
      },
      businessTitle: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, isSpammy: { type: Type.BOOLEAN } },
        required: ["score", "analysis", "fix", "isSpammy"]
      },
      proximity: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } },
        required: ["score", "analysis", "fix"]
      },
      reviewRating: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } },
        required: ["score", "analysis", "fix"]
      },
      reviewVolume: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } },
        required: ["score", "analysis", "fix"]
      },
      reviewFreshness: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } },
        required: ["score", "analysis", "fix"]
      },
      websiteOptimization: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } },
        required: ["score", "analysis", "fix"]
      },
      photos: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } },
        required: ["score", "analysis", "fix"]
      },
      competitorGap: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } },
        required: ["score", "analysis", "fix"]
      },
      executiveSummary: { type: Type.STRING },
      roiForecast: { type: Type.STRING },
      fixPlan: {
        type: Type.OBJECT,
        properties: { step1: { type: Type.STRING }, step2: { type: Type.STRING }, step3: { type: Type.STRING }, rankingPotential: { type: Type.STRING } },
        required: ["step1", "step2", "step3", "rankingPotential"]
      }
    },
    required: [
      "primaryCategory", "businessTitle", "proximity", "reviewRating", "reviewVolume", "reviewFreshness",
      "websiteOptimization", "photos", "competitorGap", "executiveSummary", "roiForecast", "fixPlan"
    ]
  };

  try {
    // 2. Race against timeout to prevent hanging UI
    const response: any = await Promise.race([
      ai.models.generateContent({
        model: ANALYSIS_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      }),
      timeout(25000) // 25 seconds timeout
    ]);

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    const data = JSON.parse(text);

    // Helper for LVC
    data.lvcScore = { score: Math.round(data.primaryCategory.score * 6.6), level: data.primaryCategory.score > 10 ? "Strong" : "Weak", explanation: data.executiveSummary };
    
    return data as GeminiAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Safe Fallback - Return valid structure so app doesn't crash
    return {
      primaryCategory: { score: 5, analysis: "Analysis timed out or failed.", fix: "Check category manually.", suggested: [] },
      businessTitle: { score: 5, analysis: "N/A", fix: "N/A", isSpammy: false },
      proximity: { score: 5, analysis: "N/A", fix: "N/A" },
      reviewRating: { score: 5, analysis: "N/A", fix: "N/A" },
      reviewVolume: { score: 5, analysis: "N/A", fix: "N/A" },
      reviewFreshness: { score: 5, analysis: "N/A", fix: "N/A" },
      websiteOptimization: { score: 5, analysis: "N/A", fix: "N/A" },
      photos: { score: 5, analysis: "N/A", fix: "N/A" },
      competitorGap: { score: 5, analysis: "N/A", fix: "N/A" },
      executiveSummary: "AI Analysis unavailable. Please check API Key or try again.",
      roiForecast: "N/A",
      fixPlan: { step1: "Manual Audit Required", step2: "Check API Settings", step3: "Try again later", rankingPotential: "Unknown" }
    } as GeminiAnalysis;
  }
};

export const generateBlogPost = async (topic: string, language: AuditLanguage, apiKey?: string): Promise<Partial<BlogPost>> => {
  const ai = getAI(apiKey);
  const targetLang = LANGUAGE_MAP[language] || 'English';

  const prompt = `
    Role: Senior SEO Content Strategist.
    Topic: "${topic}"
    Target Language: ${targetLang}
    Goal: Write an authoritative, formatted HTML blog post in the target language.
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

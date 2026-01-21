
import { GoogleGenAI, Type } from "@google/genai";
import type { BusinessProfile, AuditInputs, GeminiAnalysis, BlogPost } from "../types";

const ANALYSIS_MODEL = 'gemini-3-flash-preview';

const getAI = (apiKey?: string) => {
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

export const analyzeProfileWithGemini = async (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: any[],
  apiKey?: string
): Promise<GeminiAnalysis> => {
  
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
    2. Analysis: Start with "Impact:". Be specific (e.g., "Your H1 tag '${h1}' does not match keyword '${inputs.targetKeyword}'").
    3. Fix: A numbered list (1. 2. 3.) of actionable technical steps.

    1. PRIMARY CATEGORY
    - Is "${business.types[0]}" the specific niche category or a broad one?
    - Compare against "${inputs.targetKeyword}".

    2. BUSINESS TITLE & BRANDING
    - Check for Keyword Stuffing in "${business.name}".
    - Check if branding is consistent.

    3. REVIEW HEALTH (Freshness & Rating)
    - Check dates of recent reviews. If last review > 30 days ago, penalize Freshness.
    - Compare rating ${business.rating} vs Leader ${leaderRatingVal}.

    4. WEBSITE OPTIMIZATION
    - Does H1 ("${h1}") contain "${inputs.targetKeyword}"?
    - Does Title Tag ("${titleTag}") contain "${inputs.targetCity}"?
    - If URL is missing or free site, score 0.

    5. PHOTOS & VISUALS
    - If count < 5, score low. 
    - Suggest uploading interior, exterior, and team photos.

    6. COMPETITIVE GAP
    - How far behind is ${business.user_ratings_total} reviews from the leader (assume leader has +50 more)?

    7. ROI FORECAST
    - Estimate % growth in calls if they fix these issues (e.g. "35% increase").

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
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    const data = JSON.parse(text);

    // Helper for LVC
    data.lvcScore = { score: Math.round(data.primaryCategory.score * 6.6), level: data.primaryCategory.score > 10 ? "Strong" : "Weak", explanation: data.executiveSummary };
    
    return data as GeminiAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Safe Fallback
    return {
      primaryCategory: { score: 0, analysis: "N/A", fix: "N/A", suggested: [] },
      businessTitle: { score: 0, analysis: "N/A", fix: "N/A", isSpammy: false },
      proximity: { score: 0, analysis: "N/A", fix: "N/A" },
      reviewRating: { score: 0, analysis: "N/A", fix: "N/A" },
      reviewVolume: { score: 0, analysis: "N/A", fix: "N/A" },
      reviewFreshness: { score: 0, analysis: "N/A", fix: "N/A" },
      websiteOptimization: { score: 0, analysis: "N/A", fix: "N/A" },
      photos: { score: 0, analysis: "N/A", fix: "N/A" },
      competitorGap: { score: 0, analysis: "N/A", fix: "N/A" },
      executiveSummary: "Analysis unavailable.",
      roiForecast: "N/A",
      fixPlan: { step1: "N/A", step2: "N/A", step3: "N/A", rankingPotential: "N/A" }
    } as GeminiAnalysis;
  }
};

export const generateBlogPost = async (topic: string, apiKey?: string): Promise<Partial<BlogPost>> => {
  const ai = getAI(apiKey);
  
  const prompt = `
    Role: Senior SEO Content Strategist.
    Topic: "${topic}"
    Goal: Write an authoritative, formatted HTML blog post.
    Language: English (US).
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

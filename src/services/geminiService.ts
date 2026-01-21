
import { GoogleGenAI, Type } from "@google/genai";
import type { BusinessProfile, AuditInputs, GeminiAnalysis, BlogPost } from "../types";

const ANALYSIS_MODEL = 'gemini-3-flash-preview';

// Helper to get AI instance with dynamic key
const getAI = (apiKey?: string) => {
  const key = apiKey || import.meta.env.VITE_API_KEY || '';
  if (!key) throw new Error("API Key is missing. Please add it in Admin Settings.");
  return new GoogleGenAI({ apiKey: key });
};

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  es: 'Spanish (Castilian)',
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
  
  const ai = getAI(apiKey);

  const targetLanguage = LANGUAGE_MAP[inputs.language || 'en'] || 'English';
  
  // Calculate Leader Rating
  const leaderRatingVal = competitors.length > 0 
    ? Math.max(...competitors.map((c: any) => c.rating || 0)) 
    : 4.8;
  const leaderRating = leaderRatingVal.toFixed(1);
  const targetRating = (leaderRatingVal - 0.2).toFixed(1);

  const prompt = `
    Role: Senior Local SEO Audit Engine. 
    Target Language: ${targetLanguage}
    City: ${inputs.targetCity}

    VARIABLES:
    Business Name: "${business.name}"
    Current Rating: ${business.rating}
    Leader Rating: ${leaderRating}
    Target Rating: ${targetRating}

    1. DYNAMIC REVIEW LOGIC (The "Competitive Gap" Rule):
    The Formula: IF Current_Rating < ${targetRating}:
    THEN Output: 'You need a minimum of 15 new 5-star reviews to bridge the gap with the market leader in ${inputs.targetCity} and break the Google quality filter.'
    NEVER output '0 reviews' if the client is below the Leader's rating.
    
    2. NO N/A & CITY INJECTION:
    If data is missing, the engine must use an expert industry fallback explanation.
    The city "${inputs.targetCity}" must be injected into every technical analysis to prove local expertise.

    3. OUTPUT STRUCTURE (Translate content to ${targetLanguage}):
    
    [POINT: Primary Category]
    Expert Analysis: Explain why category is the DNA of the profile in ${inputs.targetCity}. Mention ranking impact.
    Step-by-Step Fix: 1. Log in to GBP. 2. Edit Profile. 3. Select the most specific category available. 4. Save changes.

    [POINT: Review Volume]
    Expert Analysis: Compare ${business.rating} vs Leader ${leaderRating}. Explain 'Trust Share' loss in ${inputs.targetCity}.
    Step-by-Step Fix: 1. Generate review link. 2. Create QR code. 3. Request reviews from next 15 clients in ${inputs.targetCity}.

    [POINT: H1 & Geo-Tagging]
    Expert Analysis: Explain how Google crawls the website to verify location in ${inputs.targetCity}.
    Step-by-Step Fix: 1. Open website editor. 2. Change H1 to: '${business.name} - [Service] in ${inputs.targetCity}'.

    [POINT: ROI Forecast]
    Text: 'By closing the gap between your profile and the top competitors in ${inputs.targetCity}, we project a 25% to 50% increase in customer actions within 90 days. Every day you wait, your competitors take the revenue that belongs to you.'

    [POINT: Ranking Potential]
    Short prediction string (e.g., "Top 3 in 90 days").

    [POINT: Executive Summary]
    Briefly summarize the overall health and main blockers in ${targetLanguage}.

    Return the data in strict JSON format.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      primaryCategoryAnalysis: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          fix: { type: Type.STRING }
        },
        required: ["analysis", "fix"]
      },
      reviewGapAnalysis: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          fix: { type: Type.STRING }
        },
        required: ["analysis", "fix"]
      },
      locationContentAnalysis: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          fix: { type: Type.STRING }
        },
        required: ["analysis", "fix"]
      },
      roiForecast: { type: Type.STRING },
      executiveSummary: { type: Type.STRING },
      // Legacy fields to maintain UI compatibility
      titleAnalysis: {
        type: Type.OBJECT,
        properties: {
          isSpammy: { type: Type.BOOLEAN },
          reason: { type: Type.STRING },
          keywordStuffed: { type: Type.BOOLEAN },
        },
        required: ["isSpammy", "reason", "keywordStuffed"]
      },
      categoryRelevance: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          reason: { type: Type.STRING },
          suggestedCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["score", "reason", "suggestedCategories"]
      },
      reviewSentiment: {
        type: Type.OBJECT,
        properties: {
          hasKeywords: { type: Type.BOOLEAN },
          sentiment: { type: Type.STRING },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["hasKeywords", "sentiment", "topics"]
      },
      fixPlan: {
        type: Type.OBJECT,
        properties: {
          step1: { type: Type.STRING },
          step2: { type: Type.STRING },
          step3: { type: Type.STRING },
          rankingPotential: { type: Type.STRING },
        },
        required: ["step1", "step2", "step3", "rankingPotential"]
      },
      lvcScore: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          level: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["score", "level", "explanation"]
      },
      geoGridAnalysis: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING }
        },
        required: ["analysis"]
      }
    },
    required: [
      "primaryCategoryAnalysis", "reviewGapAnalysis", "locationContentAnalysis", "roiForecast", "executiveSummary",
      "titleAnalysis", "categoryRelevance", "reviewSentiment", "fixPlan", "lvcScore", "geoGridAnalysis"
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
    
    return JSON.parse(text) as GeminiAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback logic
    return {
      primaryCategoryAnalysis: { analysis: "Analysis failed.", fix: "Check connection." },
      reviewGapAnalysis: { analysis: "Analysis failed.", fix: "Check connection." },
      locationContentAnalysis: { analysis: "Analysis failed.", fix: "Check connection." },
      roiForecast: "Data unavailable.",
      executiveSummary: "System could not complete analysis.",
      titleAnalysis: { isSpammy: false, keywordStuffed: false, reason: "N/A" },
      categoryRelevance: { score: 5, reason: "N/A", suggestedCategories: [] },
      reviewSentiment: { hasKeywords: false, sentiment: "Neutral", topics: [] },
      fixPlan: { step1: "Retry Audit", step2: "Check API", step3: "Contact Support", rankingPotential: "Unknown" },
      lvcScore: { score: 0, level: "Unknown", explanation: "N/A" },
      geoGridAnalysis: { analysis: "N/A" }
    };
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

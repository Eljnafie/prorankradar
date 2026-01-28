
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { BusinessProfile, AuditInputs, GeminiAnalysis, BlogPost, AuditLanguage } from "../types";

const ANALYSIS_MODEL = 'gemini-3-flash-preview';

const getAI = (apiKey?: string) => {
  const envKey = (import.meta as any).env.VITE_API_KEY || ''; 
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

const retryOperation = async <T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    const msg = error.message || JSON.stringify(error);
    const isOverloaded = msg.includes('503') || msg.toLowerCase().includes('overloaded');
    if (retries > 0 && isOverloaded) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const analyzeProfileWithGemini = async (
  business: BusinessProfile,
  inputs: AuditInputs,
  _competitors: any[],
  apiKey?: string
): Promise<GeminiAnalysis> => {
  
  const ai = getAI(apiKey);
  const targetLanguage = LANGUAGE_MAP[inputs.language || 'en'] || 'English';
  
  const prompt = `
    SYSTEM ROLE
    You are a Google Business Profile visibility educator.
    Your mission is to translate Google Maps data into simple business explanations for clients who have NO technical SEO knowledge.
    Explain what is happening, why it matters, and what to do next — in plain language.
    Output Language: ${targetLanguage}

    INPUT CONTEXT
    Business Name: "${business.name}"
    Category: "${business.types[0] || 'Unknown'}"
    Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Target Keyword: "${inputs.targetKeyword}"
    Target City: "${inputs.targetCity}"
    
    REQUIRED AUDIT OUTPUT STRUCTURE (V2)
    
    1. Executive Summary:
       - State if the business is "Visible", "Partially Visible", or "Invisible" simply.
       - Explain WHY people nearby might not see them.
       - Identify the MAIN opportunity.
    
    2. Local Visibility Coverage (LVC) Score:
       - Estimate a score (0-100).
       - Explain the score using an analogy (e.g., "An LVC of 20% means Google shows other businesses 80% of the time").
    
    3. Profile Health Check (3 Sections):
       - A. Safety Check: Is anything wrong/risky? (Name stuffing, category errors)
       - B. Trust Check: Do users feel confident? (Reviews, rating gap)
       - C. Visibility Check: Does Google choose this business? (Activity, photos)
    
    4. Improvement Plan:
       - Immediate (Day 1-7): Focus on Safety/Trust.
       - Short Term (Day 14-30): Focus on Activity.
       - Long Term (Day 30-90): Focus on Growth/Reviews.

    TONE RULES
    - No SEO jargon.
    - Never guarantee rankings.
    - Focus on business impact (calls, customers).

    Return valid JSON matching the schema strictly.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: {
        type: Type.OBJECT,
        properties: {
          plainLanguageInsight: { type: Type.STRING, description: "Simple explanation of current status." },
          visibilityStatus: { type: Type.STRING, enum: ["Visible", "Partially Visible", "Invisible"] },
          mainOpportunity: { type: Type.STRING, description: "The single biggest thing to fix." }
        },
        required: ["plainLanguageInsight", "visibilityStatus", "mainOpportunity"]
      },
      lvc: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "0-100 Score" },
          scoreExplanation: { type: Type.STRING, description: "Analogy explaining the score." }
        },
        required: ["score", "scoreExplanation"]
      },
      profileHealth: {
        type: Type.OBJECT,
        properties: {
          safetyCheck: { type: Type.STRING, description: "Analysis of compliance/risk." },
          trustCheck: { type: Type.STRING, description: "Analysis of reviews/reputation." },
          visibilityCheck: { type: Type.STRING, description: "Analysis of competitive strength." }
        },
        required: ["safetyCheck", "trustCheck", "visibilityCheck"]
      },
      improvementPlan: {
        type: Type.OBJECT,
        properties: {
          immediateAction: { type: Type.STRING, description: "Step 1 (Safety/Trust)" },
          shortTermStrategy: { type: Type.STRING, description: "Step 2 (Activity)" },
          longTermGrowth: { type: Type.STRING, description: "Step 3 (Growth)" }
        },
        required: ["immediateAction", "shortTermStrategy", "longTermGrowth"]
      }
    },
    required: ["executiveSummary", "lvc", "profileHealth", "improvementPlan"]
  };

  try {
    const response: any = await retryOperation(() => ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }));

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text) as GeminiAnalysis;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Fallback Mock Data
    return {
      executiveSummary: {
        plainLanguageInsight: "We could not connect to the AI analyst. However, based on raw data, your profile exists but requires optimization.",
        visibilityStatus: "Partially Visible",
        mainOpportunity: "Verify connection settings."
      },
      lvc: {
        score: 50,
        scoreExplanation: "Data unavailable for precise calculation."
      },
      profileHealth: {
        safetyCheck: "Check business name for keywords.",
        trustCheck: "Review count needs attention.",
        visibilityCheck: "Add more photos to signal activity."
      },
      improvementPlan: {
        immediateAction: "Verify business details.",
        shortTermStrategy: "Upload 5 photos.",
        longTermGrowth: "Ask for reviews."
      }
    };
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
    const response = await retryOperation(() => ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    })) as GenerateContentResponse;

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as Partial<BlogPost>;
  } catch (error: any) {
    console.error("Blog Gen Error:", error);
    throw new Error("Failed to generate blog post: " + (error.message || "Unknown error"));
  }
};


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
  competitors: any[],
  apiKey?: string
): Promise<GeminiAnalysis> => {
  
  const ai = getAI(apiKey);
  const targetLanguage = LANGUAGE_MAP[inputs.language || 'en'] || 'English';
  
  const prompt = `
    System Role: You are a Senior Google Business Profile Growth Strategist.
    Report Language: ${targetLanguage}

    Analyze the following business:
    Name: "${business.name}"
    Category: "${business.types[0] || 'Unknown'}"
    Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Market Leader Benchmark: 4.9 Stars
    
    TASK: Generate a "360-Degree Premium Business Growth Audit".
    
    1. SENTIMENT & TRUST GAP
       - Compare ${business.rating} stars to the Market Leader (4.9).
       - If rating < 4.0, label it a "Conversion Killer".
       - Assess if response rate to reviews seems low (assume low if not provided).

    2. TECHNICAL VS COMMERCIAL DUALITY
       - Trust Health: Check if name "${business.name}" has keyword stuffing. If clean, score 100%. If stuffed, High Risk.
       - Ghost Profile: If reviews < 10 or rating is low, label as "Ghost Profile" -> "Massive Lost Revenue".

    3. 90-DAY SUCCESS ROADMAP (Actionable Steps)
       - Phase 1 (Days 1-7): Security & Foundation (Naming, Categories, NAP).
       - Phase 2 (Days 8-30): Conversion (Action Buttons, Attributes, Website).
       - Phase 3 (Month 2+): Authority (Trust Gap Closure, Velocity).

    Return strict JSON matching the schema.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      sentimentAnalysis: {
        type: Type.OBJECT,
        properties: {
          trustGap: { type: Type.NUMBER, description: "Difference between 4.9 and current rating" },
          reviewsNeeded: { type: Type.NUMBER, description: "Est. 5-star reviews needed" },
          ratingImpact: { type: Type.STRING, description: "e.g. Conversion Killer" },
          responseAnalysis: { type: Type.STRING, description: "Analysis of owner responses" }
        },
        required: ["trustGap", "reviewsNeeded", "ratingImpact", "responseAnalysis"]
      },
      commercialStatus: {
        type: Type.OBJECT,
        properties: {
          trustHealthScore: { type: Type.NUMBER, description: "100 if name is clean, else lower" },
          isGhostProfile: { type: Type.BOOLEAN, description: "True if inactive/low reviews" },
          revenueImpact: { type: Type.STRING, description: "e.g. Massive Lost Revenue" },
          suspensionRisk: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
        },
        required: ["trustHealthScore", "isGhostProfile", "revenueImpact", "suspensionRisk"]
      },
      roadmap: {
        type: Type.OBJECT,
        properties: {
          phase1: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "steps"] },
          phase2: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "steps"] },
          phase3: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "steps"] }
        },
        required: ["phase1", "phase2", "phase3"]
      },
      executiveSummary: { type: Type.STRING },
      roiForecast: { type: Type.STRING }
    },
    required: ["sentimentAnalysis", "commercialStatus", "roadmap", "executiveSummary", "roiForecast"]
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
        sentimentAnalysis: { trustGap: 1.0, reviewsNeeded: 15, ratingImpact: "Analysis Unavailable", responseAnalysis: "Check manually" },
        commercialStatus: { trustHealthScore: 50, isGhostProfile: true, revenueImpact: "Unknown", suspensionRisk: "Medium" },
        roadmap: {
            phase1: { title: "Security (System Offline)", steps: ["Verify Name", "Check Address", "Confirm Category"] },
            phase2: { title: "Conversion", steps: ["Add Photos", "Enable Messages"] },
            phase3: { title: "Authority", steps: ["Get Reviews"] }
        },
        executiveSummary: "System could not complete the full AI audit. Please verify API Key.",
        roiForecast: "N/A"
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

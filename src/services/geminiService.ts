
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
    You are a Google Business Profile (GBP) visibility expert specializing in Google Maps ranking mechanics.
    You analyze local visibility using ranking signals, compliance checks, and user trust factors.
    
    AUDIT PURPOSE
    Generate a "2026 Master Audit" that explains why this business is visible or invisible.
    Output Language: ${targetLanguage}

    INPUT DATA
    Business Name: "${business.name}"
    Category: "${business.types[0] || 'Unknown'}"
    Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Target Keyword: "${inputs.targetKeyword}"
    Target City: "${inputs.targetCity}"
    
    TASK REQUIREMENTS
    1. Executive Summary: Summarize current visibility status and primary cause of lost leads.
    2. Local Visibility Coverage (LVC): Estimate a score (0-100) representing how much of the local market they capture.
    3. Trust Analysis: Calculate the "Trust Gap" (Distance from 4.9 stars) and reviews needed to compete.
    4. Action Plan: Provide a strict 3-phase roadmap (Immediate, Short Term, Growth).

    RESPONSE FORMAT
    Return valid JSON strictly matching the schema.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING, description: "High-level summary of the audit findings." },
      visibility: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "0-100 Visibility Score" },
          classification: { type: Type.STRING, enum: ["Strong", "Moderate", "Weak"] },
          summary: { type: Type.STRING, description: "Explanation of the visibility score" }
        },
        required: ["score", "classification", "summary"]
      },
      trustAnalysis: {
        type: Type.OBJECT,
        properties: {
          trustGap: { type: Type.NUMBER, description: "Difference from 4.9 stars" },
          reviewsNeeded: { type: Type.NUMBER, description: "Estimated number of reviews needed" },
          sentimentSummary: { type: Type.STRING, description: "Summary of review sentiment" }
        },
        required: ["trustGap", "reviewsNeeded", "sentimentSummary"]
      },
      roadmap: {
        type: Type.OBJECT,
        properties: {
          immediate: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actions for Days 0-7" },
          shortTerm: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actions for Days 14-30" },
          growth: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actions for Days 30-90" }
        },
        required: ["immediate", "shortTerm", "growth"]
      }
    },
    required: ["executiveSummary", "visibility", "trustAnalysis", "roadmap"]
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
      executiveSummary: "Could not generate analysis due to AI service unavailability.",
      visibility: { score: 50, classification: "Moderate", summary: "Data unavailable." },
      trustAnalysis: { trustGap: 0, reviewsNeeded: 10, sentimentSummary: "Neutral" },
      roadmap: {
        immediate: ["Verify business profile", "Update business hours"],
        shortTerm: ["Add 5 new photos", "Respond to recent reviews"],
        growth: ["Start a review generation campaign", "Post weekly updates"]
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

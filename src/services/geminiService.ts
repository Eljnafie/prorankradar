
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { BusinessProfile, AuditInputs, V4InternalAnalysis, BlogPost, AuditLanguage } from "../types";

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
): Promise<V4InternalAnalysis> => {
  
  const ai = getAI(apiKey);
  const targetLanguage = LANGUAGE_MAP[inputs.language || 'en'] || 'English';
  
  const prompt = `
    SYSTEM ROLE
    You are the "V4 Core Engine" for a Local Confidence Intelligence System.
    Your job is to analyze raw Google Maps signals and output a complex INTERNAL JSON structure.
    Do NOT write for the client. Write for the scoring engine.
    
    INPUT CONTEXT
    Business: "${business.name}"
    Category: "${business.types[0] || 'Unknown'}"
    Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Target Keyword: "${inputs.targetKeyword}"
    Target City: "${inputs.targetCity}"
    Output Language: ${targetLanguage} (for the opportunity strings only)

    ANALYSIS INSTRUCTIONS
    1. Eligibility Layer: Check for name stuffing (spam risk) and address validity.
    2. Relevance Layer: Analyze if the category and name match the target keyword.
    3. Review Layer: Analyze rating freshness and authenticity (0.0 to 1.0 scores).
    4. Confidence Components:
       - Relevance: How well do they fit the search?
       - Proximity: (Estimate based on city match)
       - Prominence: Review count/rating strength.
    
    OUTPUT FORMAT
    Return ONLY valid JSON matching the 'V4InternalAnalysis' schema.
    All scores must be floats between 0.0 and 1.0.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      engine_meta: {
        type: Type.OBJECT,
        properties: {
          audit_version: { type: Type.STRING, enum: ["4.0-internal"] },
          generated_at: { type: Type.STRING },
          confidence_model: { type: Type.STRING }
        },
        required: ["audit_version", "generated_at", "confidence_model"]
      },
      eligibility_layer: {
        type: Type.OBJECT,
        properties: {
          real_world_validation: { type: Type.BOOLEAN },
          business_name_integrity: { type: Type.BOOLEAN },
          risk_flags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["real_world_validation", "business_name_integrity", "risk_flags"]
      },
      relevance_layer: {
        type: Type.OBJECT,
        properties: {
          primary_category_match: { type: Type.NUMBER },
          service_semantic_match: { type: Type.NUMBER }
        },
        required: ["primary_category_match", "service_semantic_match"]
      },
      review_layer: {
        type: Type.OBJECT,
        properties: {
          review_freshness: { type: Type.NUMBER },
          review_sentiment: { type: Type.NUMBER },
          review_authenticity: { type: Type.NUMBER }
        },
        required: ["review_freshness", "review_sentiment", "review_authenticity"]
      },
      activity_layer: {
        type: Type.OBJECT,
        properties: {
          posting_consistency: { type: Type.NUMBER },
          media_freshness: { type: Type.NUMBER }
        },
        required: ["posting_consistency", "media_freshness"]
      },
      geo_layer: {
        type: Type.OBJECT,
        properties: {
          coverage_density: { type: Type.NUMBER },
          competitive_pressure: { type: Type.NUMBER }
        },
        required: ["coverage_density", "competitive_pressure"]
      },
      confidence_components: {
        type: Type.OBJECT,
        properties: {
          relevance: { type: Type.NUMBER },
          proximity: { type: Type.NUMBER },
          prominence: { type: Type.NUMBER }
        },
        required: ["relevance", "proximity", "prominence"]
      },
      strategic_opportunities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            impact: { type: Type.STRING, enum: ["high", "medium", "low"] }
          },
          required: ["title", "description", "impact"]
        }
      }
    },
    required: ["engine_meta", "eligibility_layer", "relevance_layer", "review_layer", "activity_layer", "geo_layer", "confidence_components", "strategic_opportunities"]
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
    
    return JSON.parse(text) as V4InternalAnalysis;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Fallback V4 Mock Data
    return {
      engine_meta: { audit_version: "4.0-internal", generated_at: new Date().toISOString(), confidence_model: "fallback" },
      eligibility_layer: { real_world_validation: true, business_name_integrity: true, risk_flags: [] },
      relevance_layer: { primary_category_match: 0.8, service_semantic_match: 0.7 },
      review_layer: { review_freshness: 0.5, review_sentiment: 0.9, review_authenticity: 0.9 },
      activity_layer: { posting_consistency: 0.4, media_freshness: 0.5 },
      geo_layer: { coverage_density: 0.6, competitive_pressure: 0.7 },
      confidence_components: { relevance: 0.75, proximity: 0.6, prominence: 0.65 },
      strategic_opportunities: [
        { title: "Review Velocity", description: "Increase weekly review frequency.", impact: "high" },
        { title: "Visual Signals", description: "Add owner photos to improve engagement.", impact: "medium" }
      ]
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

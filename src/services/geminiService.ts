
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { BusinessProfile, AuditInputs, ExecutiveAuditAnalysis, BlogPost, AuditLanguage } from "../types";

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
): Promise<ExecutiveAuditAnalysis> => {
  
  const ai = getAI(apiKey);
  const targetLanguage = LANGUAGE_MAP[inputs.language || 'en'] || 'English';
  
  const prompt = `
    SYSTEM ROLE
    Act as a Senior Strategic Consultant (20+ years exp). 
    Tone: Executive Authority, Brutally Honest, "Fintech" precision.
    
    INPUT CONTEXT
    Business: "${business.name}"
    Category: "${business.types[0] || 'Unknown'}"
    Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Target Keyword: "${inputs.targetKeyword}"
    Target City: "${inputs.targetCity}"
    Output Language: ${targetLanguage}

    OBJECTIVE
    Generate a "Confidence Intelligence System v5" report.
    
    1. Executive Dashboard (The Hook):
       - Trust Health Score (0-100): Safety from suspension.
       - Visibility Confidence (0-100): Likelihood to rank top 3.
       - Commercial Engine (0-100): Is it converting? If safe but low conversion, label as "Ghost Profile".
    
    2. Reality Mirror (Gap Analysis):
       - Identify critical gaps in Relevance, Reputation, and Media.
       - Use terms like "Exclusion Zone" (if rating < 4.0), "Conversion Friction", "Relevance Gap".
    
    3. Action Roadmap (90 Days):
       - Phase 1: Restoration (Day 1-30)
       - Phase 2: Authority (Day 31-60)
       - Phase 3: Dominance (Day 61-90)

    OUTPUT FORMAT
    Return ONLY valid JSON matching the schema provided.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      report_metadata: {
        type: Type.OBJECT,
        properties: {
          style: { type: Type.STRING },
          tone: { type: Type.STRING },
          brand: { type: Type.STRING }
        },
        required: ["style", "tone", "brand"]
      },
      executive_dashboard: {
        type: Type.OBJECT,
        properties: {
          kpis: {
            type: Type.OBJECT,
            properties: {
              trust_health_score: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, label: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["value", "label", "description"] },
              visibility_confidence: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, label: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["value", "label", "description"] },
              commercial_engine: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, label: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["value", "label", "description"] }
            },
            required: ["trust_health_score", "visibility_confidence", "commercial_engine"]
          }
        },
        required: ["kpis"]
      },
      audit_analysis_breakdown: {
        type: Type.OBJECT,
        properties: {
          profile_accuracy: { type: Type.OBJECT, properties: { expert_insight: { type: Type.STRING }, the_gap: { type: Type.STRING }, impact: { type: Type.STRING } }, required: ["expert_insight", "the_gap", "impact"] },
          reputation_intelligence: { type: Type.OBJECT, properties: { expert_insight: { type: Type.STRING }, the_gap: { type: Type.STRING }, sentiment_analysis: { type: Type.STRING } }, required: ["expert_insight", "the_gap", "sentiment_analysis"] },
          media_engagement: { type: Type.OBJECT, properties: { expert_insight: { type: Type.STRING }, the_gap: { type: Type.STRING } }, required: ["expert_insight", "the_gap"] },
          off_profile_authority: { type: Type.OBJECT, properties: { expert_insight: { type: Type.STRING }, the_gap: { type: Type.STRING } }, required: ["expert_insight", "the_gap"] },
          competitive_positioning: { type: Type.OBJECT, properties: { expert_insight: { type: Type.STRING }, the_gap: { type: Type.STRING } }, required: ["expert_insight", "the_gap"] }
        },
        required: ["profile_accuracy", "reputation_intelligence", "media_engagement", "off_profile_authority", "competitive_positioning"]
      },
      prioritized_action_roadmap: {
        type: Type.OBJECT,
        properties: {
          phase_1_foundation: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, actions: { type: Type.ARRAY, items: { type: Type.STRING } }, goal: { type: Type.STRING } }, required: ["title", "actions", "goal"] },
          phase_2_conversion: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, actions: { type: Type.ARRAY, items: { type: Type.STRING } }, goal: { type: Type.STRING } }, required: ["title", "actions", "goal"] },
          phase_3_authority: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, actions: { type: Type.ARRAY, items: { type: Type.STRING } }, goal: { type: Type.STRING } }, required: ["title", "actions", "goal"] }
        },
        required: ["phase_1_foundation", "phase_2_conversion", "phase_3_authority"]
      },
      roi_projection: {
        type: Type.OBJECT,
        properties: {
          estimated_growth: { type: Type.STRING },
          expert_conclusion: { type: Type.STRING }
        },
        required: ["estimated_growth", "expert_conclusion"]
      }
    },
    required: ["report_metadata", "executive_dashboard", "audit_analysis_breakdown", "prioritized_action_roadmap", "roi_projection"]
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
    
    return JSON.parse(text) as ExecutiveAuditAnalysis;

  } catch (error: any) {
    console.error("Gemini Executive Analysis Error:", error);
    throw new Error("Analysis failed: " + (error.message || "Unknown error"));
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

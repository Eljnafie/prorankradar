
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
    You are a Google Business Profile (GBP) visibility analyst and educator.
    Your role is to analyze Google Maps visibility data and produce a clear, step-by-step audit that:
    - Is understandable by business owners with zero marketing knowledge
    - Is technically credible for experts
    - Explains what is happening, why it matters, and what to do next
    
    CORE RULES (MANDATORY)
    - Use plain language first, expert logic underneath
    - Explain concepts before giving recommendations
    - Never guarantee rankings or outcomes
    - Avoid phrases like "Google rewards", "Google prefers"
    - Use neutral language: "Observed patterns", "Typically associated with"
    
    INPUT DATA
    Business Name: "${business.name}"
    Category: "${business.types[0] || 'Unknown'}"
    Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Target Keyword: "${inputs.targetKeyword}"
    Target City: "${inputs.targetCity}"
    Output Language: ${targetLanguage}

    OUTPUT OBJECTIVE
    Generate a V3 GBP Audit that acts as a guide, benchmark, and decision document.
    
    Return valid JSON only, strictly matching the schema.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      audit_version: { type: Type.STRING, enum: ["V3"] },
      tool_name: { type: Type.STRING },
      business_overview: {
        type: Type.OBJECT,
        properties: {
          business_name: { type: Type.STRING },
          category: { type: Type.STRING },
          location: { type: Type.STRING },
          audit_date: { type: Type.STRING }
        },
        required: ["business_name", "category", "location", "audit_date"]
      },
      executive_summary: {
        type: Type.OBJECT,
        properties: {
          plain_language_summary: { type: Type.STRING },
          current_visibility_status: { type: Type.STRING, enum: ["visible", "partially_visible", "mostly_invisible"] },
          main_problem_explained_simply: { type: Type.STRING },
          primary_opportunity: { type: Type.STRING }
        },
        required: ["plain_language_summary", "current_visibility_status", "main_problem_explained_simply", "primary_opportunity"]
      },
      methodology: {
        type: Type.OBJECT,
        properties: {
          maps_data_explanation: { type: Type.STRING },
          ai_explanation_role: { type: Type.STRING },
          important_note: { type: Type.STRING }
        },
        required: ["maps_data_explanation", "ai_explanation_role", "important_note"]
      },
      geo_grid_analysis: {
        type: Type.OBJECT,
        properties: {
          what_the_grid_means: { type: Type.STRING },
          color_legend: {
            type: Type.OBJECT,
            properties: {
              green: { type: Type.STRING },
              orange: { type: Type.STRING },
              red: { type: Type.STRING }
            },
            required: ["green", "orange", "red"]
          },
          key_observations: { type: Type.ARRAY, items: { type: Type.STRING } },
          geographic_insight: { type: Type.STRING }
        },
        required: ["what_the_grid_means", "color_legend", "key_observations", "geographic_insight"]
      },
      local_visibility_coverage: {
        type: Type.OBJECT,
        properties: {
          lvc_score_percent: { type: Type.NUMBER },
          simple_explanation: { type: Type.STRING },
          benchmark_context: {
            type: Type.OBJECT,
            properties: {
              weak: { type: Type.STRING },
              partial: { type: Type.STRING },
              strong: { type: Type.STRING }
            },
            required: ["weak", "partial", "strong"]
          },
          business_impact: { type: Type.STRING }
        },
        required: ["lvc_score_percent", "simple_explanation", "benchmark_context", "business_impact"]
      },
      baseline_scorecard: {
        type: Type.OBJECT,
        properties: {
          profile_safety: { type: Type.STRING, enum: ["high", "medium", "low"] },
          user_trust: { type: Type.STRING, enum: ["high", "medium", "low"] },
          engagement_activity: { type: Type.STRING, enum: ["high", "medium", "low"] },
          local_visibility: { type: Type.STRING, enum: ["high", "medium", "low"] },
          notes: { type: Type.STRING }
        },
        required: ["profile_safety", "user_trust", "engagement_activity", "local_visibility", "notes"]
      },
      signal_separation: {
        type: Type.OBJECT,
        properties: {
          profile_safety: {
            type: Type.OBJECT,
            properties: {
              what_it_means: { type: Type.STRING },
              current_state: { type: Type.STRING },
              why_it_matters: { type: Type.STRING }
            },
            required: ["what_it_means", "current_state", "why_it_matters"]
          },
          user_trust: {
            type: Type.OBJECT,
            properties: {
              what_it_means: { type: Type.STRING },
              current_state: { type: Type.STRING },
              why_it_matters: { type: Type.STRING }
            },
            required: ["what_it_means", "current_state", "why_it_matters"]
          },
          visibility_and_competition: {
            type: Type.OBJECT,
            properties: {
              what_it_means: { type: Type.STRING },
              current_state: { type: Type.STRING },
              why_it_matters: { type: Type.STRING }
            },
            required: ["what_it_means", "current_state", "why_it_matters"]
          }
        },
        required: ["profile_safety", "user_trust", "visibility_and_competition"]
      }
    },
    required: ["audit_version", "tool_name", "business_overview", "executive_summary", "methodology", "geo_grid_analysis", "local_visibility_coverage", "baseline_scorecard", "signal_separation"]
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
      audit_version: "V3",
      tool_name: "ProRankRadar",
      business_overview: {
        business_name: business.name,
        category: business.types[0] || 'Unknown',
        location: inputs.targetCity,
        audit_date: new Date().toLocaleDateString()
      },
      executive_summary: {
        plain_language_summary: "We observed basic profile data but could not connect to the advanced AI analyst.",
        current_visibility_status: "partially_visible",
        main_problem_explained_simply: "Data unavailability prevents deep analysis.",
        primary_opportunity: "Ensure API keys are configured correctly."
      },
      methodology: {
        maps_data_explanation: "Uses Google Maps API.",
        ai_explanation_role: "Fallback mode active.",
        important_note: "Check system logs."
      },
      geo_grid_analysis: {
        what_the_grid_means: "Grid represents search locations.",
        color_legend: { green: "Top 3", orange: "4-9", red: "10+" },
        key_observations: ["Data missing"],
        geographic_insight: "N/A"
      },
      local_visibility_coverage: {
        lvc_score_percent: 0,
        simple_explanation: "Score calculated based on visibility spread.",
        benchmark_context: { weak: "0-20%", partial: "20-50%", strong: "50%+" },
        business_impact: "Low visibility often reduces calls."
      },
      baseline_scorecard: {
        profile_safety: "medium",
        user_trust: "medium",
        engagement_activity: "low",
        local_visibility: "low",
        notes: "Fallback data."
      },
      signal_separation: {
        profile_safety: { what_it_means: "Compliance", current_state: "Unknown", why_it_matters: "Avoid suspension." },
        user_trust: { what_it_means: "Reputation", current_state: "Unknown", why_it_matters: "Conversion." },
        visibility_and_competition: { what_it_means: "Ranking", current_state: "Unknown", why_it_matters: "Traffic." }
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

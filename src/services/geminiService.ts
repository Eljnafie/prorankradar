
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { BusinessProfile, AuditInputs, V5AuditAnalysis, BlogPost, AuditLanguage } from "../types";

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
): Promise<V5AuditAnalysis> => {
  
  const ai = getAI(apiKey);
  const targetLanguage = LANGUAGE_MAP[inputs.language || 'en'] || 'English';
  
  const prompt = `
    SYSTEM ROLE
    You are the "V5 Master Auditor" for ProRankRadar.
    Your objective is to generate a JSON-based strategic audit for a Google Business Profile (GBP).
    
    INPUT CONTEXT
    Business: "${business.name}"
    Address: "${business.address}"
    Primary Category (Current): "${business.types[0] || 'Unknown'}"
    Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Target Keyword: "${inputs.targetKeyword}"
    Target City: "${inputs.targetCity}"
    Output Language: ${targetLanguage}

    INSTRUCTIONS
    1.  **Analyze Safety**: Check for name stuffing (spam) or address issues.
    2.  **Score Confidence**: Calculate 'local_visibility_confidence' (0-100) based on how well the profile matches the keyword/city.
    3.  **Generate Timeline**: Create a specific 30/60/90 day plan.
    4.  **Strict JSON**: Output MUST match the V5 schema exactly.

    OUTPUT FORMAT
    Return ONLY valid JSON.
  `;

  // V5 Schema Definition
  const schema = {
    type: Type.OBJECT,
    properties: {
      meta: {
        type: Type.OBJECT,
        properties: {
          audit_version: { type: Type.STRING, enum: ["5.0"] },
          generated_at: { type: Type.STRING },
          audit_type: { type: Type.STRING }
        },
        required: ["audit_version", "generated_at", "audit_type"]
      },
      executive_summary: {
        type: Type.OBJECT,
        properties: {
          overall_health: { type: Type.STRING, enum: ["Poor", "Fair", "Good", "Strong"] },
          summary: { type: Type.STRING },
          main_strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          main_limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
          overall_priority: { type: Type.STRING }
        },
        required: ["overall_health", "summary", "main_strengths", "main_limitations", "overall_priority"]
      },
      local_visibility_confidence: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          score_label: { type: Type.STRING, enum: ["Low", "Moderate", "Strong", "Dominant"] },
          explanation: { type: Type.STRING },
          confidence_drivers: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence_gaps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "score_label", "explanation", "confidence_drivers", "confidence_gaps"]
      },
      profile_safety_and_compliance: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ["Safe", "Needs Attention", "At Risk"] },
          explanation: { type: Type.STRING },
          checked_elements: {
            type: Type.OBJECT,
            properties: {
              business_name: { type: Type.STRING },
              address_logic: { type: Type.STRING },
              category_legitimacy: { type: Type.STRING },
              profile_ownership_signals: { type: Type.STRING }
            },
            required: ["business_name", "address_logic", "category_legitimacy", "profile_ownership_signals"]
          }
        },
        required: ["status", "explanation", "checked_elements"]
      },
      category_and_relevance_analysis: {
        type: Type.OBJECT,
        properties: {
          primary_category: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              explanation: { type: Type.STRING },
              recommended_action: { type: Type.STRING }
            },
            required: ["status", "explanation", "recommended_action"]
          },
          secondary_categories: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              explanation: { type: Type.STRING },
              recommended_changes: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["status", "explanation", "recommended_changes"]
          }
        },
        required: ["primary_category", "secondary_categories"]
      },
      reviews_analysis: {
        type: Type.OBJECT,
        properties: {
          overall_status: { type: Type.STRING },
          explanation: { type: Type.STRING },
          metrics: {
            type: Type.OBJECT,
            properties: {
              review_count_vs_competitors: { type: Type.STRING },
              average_rating_status: { type: Type.STRING },
              freshness: { type: Type.STRING },
              velocity: { type: Type.STRING },
              text_quality: { type: Type.STRING }
            },
            required: ["review_count_vs_competitors", "average_rating_status", "freshness", "velocity", "text_quality"]
          },
          improvement_plan: {
            type: Type.OBJECT,
            properties: {
              monthly_target: { type: Type.NUMBER },
              what_customers_should_mention: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["monthly_target", "what_customers_should_mention"]
          }
        },
        required: ["overall_status", "explanation", "metrics", "improvement_plan"]
      },
      photos_and_media_analysis: {
        type: Type.OBJECT,
        properties: {
          overall_status: { type: Type.STRING },
          explanation: { type: Type.STRING },
          missing_photo_types: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommended_actions: {
            type: Type.OBJECT,
            properties: {
              upload_frequency: { type: Type.STRING },
              photo_guidelines: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["upload_frequency", "photo_guidelines"]
          }
        },
        required: ["overall_status", "explanation", "missing_photo_types", "recommended_actions"]
      },
      profile_activity_and_engagement: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING },
          analysis: {
            type: Type.OBJECT,
            properties: {
              google_posts: { type: Type.STRING },
              q_and_a: { type: Type.STRING }
            },
            required: ["google_posts", "q_and_a"]
          },
          recommended_actions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["status", "analysis", "recommended_actions"]
      },
      competitive_benchmark: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          where_competitors_are_stronger: { type: Type.ARRAY, items: { type: Type.STRING } },
          realistic_opportunities_to_close_gap: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "where_competitors_are_stronger", "realistic_opportunities_to_close_gap"]
      },
      action_plan_timeline: {
        type: Type.OBJECT,
        properties: {
          days_0_30: {
            type: Type.OBJECT,
            properties: { focus: { type: Type.STRING }, actions: { type: Type.ARRAY, items: { type: Type.STRING } } },
            required: ["focus", "actions"]
          },
          days_31_60: {
            type: Type.OBJECT,
            properties: { focus: { type: Type.STRING }, actions: { type: Type.ARRAY, items: { type: Type.STRING } } },
            required: ["focus", "actions"]
          },
          days_61_90: {
            type: Type.OBJECT,
            properties: { focus: { type: Type.STRING }, actions: { type: Type.ARRAY, items: { type: Type.STRING } } },
            required: ["focus", "actions"]
          }
        },
        required: ["days_0_30", "days_31_60", "days_61_90"]
      },
      final_priorities: {
        type: Type.OBJECT,
        properties: {
          top_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
          actions_to_avoid: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["top_actions", "actions_to_avoid"]
      }
    },
    required: [
      "meta", "executive_summary", "local_visibility_confidence", "profile_safety_and_compliance",
      "category_and_relevance_analysis", "reviews_analysis", "photos_and_media_analysis",
      "profile_activity_and_engagement", "competitive_benchmark", "action_plan_timeline", "final_priorities"
    ]
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
    
    return JSON.parse(text) as V5AuditAnalysis;

  } catch (error: any) {
    console.error("Gemini V5 Analysis Error:", error);
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


import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { BusinessProfile, AuditInputs, GeminiAnalysis, BlogPost, AuditLanguage } from "../types";

const ANALYSIS_MODEL = 'gemini-3-flash-preview';

// Helper to get AI instance with dynamic key
const getAI = (apiKey?: string) => {
  // Check both passed key and environment variable (Vite style)
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

// Retry helper for 503 errors
const retryOperation = async <T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    const msg = error.message || JSON.stringify(error);
    const isOverloaded = msg.includes('503') || msg.toLowerCase().includes('overloaded');
    
    if (retries > 0 && isOverloaded) {
      console.warn(`Gemini API Overloaded (503). Retrying in ${delay}ms... (${retries} attempts left)`);
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
  
  // 1. Validate Key immediately
  let ai;
  try {
    ai = getAI(apiKey);
  } catch (e: any) {
    console.warn("Gemini Client Init Failed:", e.message);
    throw e; // Propagate to App.tsx so user sees the "Missing Key" alert
  }

  const targetLanguage = LANGUAGE_MAP[inputs.language || 'en'] || 'English';
  const leaderRatingVal = competitors.length > 0 ? Math.max(...competitors.map((c: any) => c.rating || 0)) : 4.8;

  const prompt = `
    Role: Senior Google Maps Forensic Auditor.
    Task: Conduct a deep-dive technical audit of a Google Business Profile (GBP).
    Output Language: ${targetLanguage}
    
    === BUSINESS DATA ===
    Name: "${business.name}"
    Address: "${business.address}"
    Target City: "${inputs.targetCity}"
    Target Keyword: "${inputs.targetKeyword}"
    Primary Category: "${business.types[0] || 'Unknown'}"
    Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Website: "${business.website || 'No Website'}"
    
    === MARKET BENCHMARK ===
    Competitor Leader Rating: ${leaderRatingVal.toFixed(1)}
    ==================

    === ANALYSIS MODULES (0-10 SCORE) ===

    1. TRANSACTIONAL & ATTRIBUTE READINESS (Conversion)
       - Actions: Does this business type usually have 'Book Online', 'Order', 'Reserve'? If missing, flag it.
       - Attributes: Are critical attributes (Wheelchair, Wi-Fi, Seating, Gender-neutral restrooms) likely missing based on the profile leanness?

    2. INTERACTION & ENGAGEMENT VELOCITY
       - Review Response: Estimate response rate. If they have reviews but no recent activity, assume 'Stale'.
       - Post/Photo Velocity: Compare against a typical market leader who posts 1-3 times/week.

    3. NAP & DATA INTEGRITY (Source of Truth)
       - Consistency: Analyze the address format. Is it standard? 
       - Mentions: Is the business name distinctive enough to be consistent across Yelp/Bing, or is it generic (hard to track)?

    4. TRUST & SECURITY GUARDRAILS (Risk)
       - Keyword Stuffing: Check Name "${business.name}" strictly for non-brand keywords (e.g., "Best Dentist in [City]").
       - Suspension Risk: Is the address a P.O. Box, Virtual Office, or Co-working space? (High risk).

    5. CORE & SEO
       - Primary Category Analysis.
       - Website Content Alignment (H1/Title).

    Provide strict JSON output.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      // Module 1: Transactional
      transactional: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, missingActions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["score", "analysis", "fix", "missingActions"] },
      attributes: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, missingAttributes: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["score", "analysis", "fix", "missingAttributes"] },

      // Module 2: Engagement
      responseRate: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, estimatedRate: { type: Type.STRING } }, required: ["score", "analysis", "fix", "estimatedRate"] },
      postVelocity: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, competitorFrequency: { type: Type.STRING } }, required: ["score", "analysis", "fix", "competitorFrequency"] },

      // Module 3: NAP
      napConsistency: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, inconsistencies: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["score", "analysis", "fix", "inconsistencies"] },

      // Module 4: Trust
      suspensionRisk: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] } }, required: ["score", "analysis", "fix", "riskLevel"] },
      keywordStuffing: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, isDetected: { type: Type.BOOLEAN } }, required: ["score", "analysis", "fix", "isDetected"] },

      // Core & SEO
      primaryCategory: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, suggested: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["score", "analysis", "fix", "suggested"] },
      completeness: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, required: ["score", "analysis", "fix"] },
      websiteOptimization: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, required: ["score", "analysis", "fix"] },
      backlinks: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING }, required: ["score", "analysis", "fix"] },

      executiveSummary: { type: Type.STRING },
      roiForecast: { type: Type.STRING },
      fixPlan: { type: Type.OBJECT, properties: { step1: { type: Type.STRING }, step2: { type: Type.STRING }, step3: { type: Type.STRING }, rankingPotential: { type: Type.STRING } }, required: ["step1", "step2", "step3", "rankingPotential"] }
    },
    required: [
      "transactional", "attributes",
      "responseRate", "postVelocity",
      "napConsistency",
      "suspensionRisk", "keywordStuffing",
      "primaryCategory", "completeness", "websiteOptimization", "backlinks",
      "executiveSummary", "roiForecast", "fixPlan"
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
    
    return JSON.parse(text) as GeminiAnalysis;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Parse JSON error message if provided by SDK
    let errMsg = error.message || '';
    try {
        if (errMsg.trim().startsWith('{')) {
            const parsed = JSON.parse(errMsg);
            if (parsed.error && parsed.error.message) {
                errMsg = parsed.error.message;
            }
        }
    } catch(e) {}

    // Map to specific user-friendly messages
    if (errMsg.includes('403') || errMsg.includes('API key not valid')) {
        throw new Error("API Key Invalid. Please check your Gemini API Key in Admin Settings.");
    }
    if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota')) {
        throw new Error("API Quota exceeded. You may be using a free key with rate limits. Please try again later.");
    }
    if (errMsg.includes('503') || errMsg.toLowerCase().includes('overloaded')) {
        throw new Error("Google AI Model is currently overloaded. Please wait 30 seconds and try again.");
    }

    throw new Error(errMsg || "Unknown Gemini API Error");
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
    // Reuse specific error parsing if needed, or generic
    const msg = error.message || '';
    if (msg.includes('503')) throw new Error("AI Service Overloaded. Try again.");
    throw new Error("Failed to generate blog post: " + msg);
  }
};

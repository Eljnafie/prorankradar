
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

  // --- MASTER PROMPT CONSTRUCTION ---
  const prompt = `
    System Role: You are the lead AI auditor for ProRankRadar. Your goal is to convert raw Google Business Profile data into a high-converting, professional growth strategy. 
    Use the "Ghost Profile" and "Lost Revenue" terminology from our branding.

    Input Data:
    Business Details: [${business.name}, ${business.types[0] || 'Unknown'}, ${business.website || 'No Website'}, ${business.address}]
    Review Data: [${business.rating} Stars, ${business.user_ratings_total} Total Reviews]
    Competitor Leader: [${leaderRatingVal} Stars]
    
    Target Keyword: "${inputs.targetKeyword}"
    Target City: "${inputs.targetCity}"

    REQUIRED AUDIT SECTIONS (Strictly map your analysis to the JSON schema provided):

    1. The "Performance Reality" Check (Maps to 'executiveSummary' & 'roiForecast')
       - Identify the "Conversion Gap": How many more calls would they get if they reached the Top 3?
       - Estimate the % increase in Search Impressions and potential revenue growth if the "High Impact" changes are made.

    2. Core SEO & Category Audit (Maps to 'primaryCategory' & 'completeness')
       - Verify the Primary Category: "${business.types[0] || 'Unknown'}". If generic, suggest 3 "High-Intent" alternatives.
       - Calculate the "Review Gap": Exactly how many 5-star reviews are needed to beat the Leader (${leaderRatingVal})?

    3. Trust & NAP Integrity (Maps to 'napConsistency' & 'suspensionRisk')
       - Audit the "NAP" (Name, Address). Is the name "${business.name}" keyword stuffed? (Risk).
       - Flag any "Suspension Risks" based on recent Google algorithm updates.

    4. Visual & Content "Ghost Profile" Audit (Maps to 'postVelocity' & 'attributes')
       - Is the business a "Ghost Profile" (low photos, no posts)?
       - Check if "Menu," "Outdoor Seating," or "Accessibility" tags appear missing based on category standards.

    5. AI Sentiment Analysis (Maps to 'responseRate' analysis field context)
       - Identify top positive emotions and top pain points from a typical business in this niche.
       - Draft a short "SEO-Optimized Description" snippet.

    6. Step-by-Step Recovery Plan (Maps to 'fixPlan')
       - Provide a numbered list for every [FAIL] or [WARN] status.
       - Instructions must be "Copy-Paste" ready for the business owner.

    IMPORTANT: Return ONLY the raw JSON object matching the schema. No markdown formatting.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      // Module 1: Transactional & Attributes
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
      completeness: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      websiteOptimization: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },
      backlinks: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, analysis: { type: Type.STRING }, fix: { type: Type.STRING } }, required: ["score", "analysis", "fix"] },

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
    const msg = error.message || '';
    if (msg.includes('503')) throw new Error("AI Service Overloaded. Try again.");
    throw new Error("Failed to generate blog post: " + msg);
  }
};

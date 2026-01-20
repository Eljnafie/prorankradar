
import { GoogleGenAI, Type } from "@google/genai";
import type { BusinessProfile, AuditInputs, GeminiAnalysis, BlogPost } from "../types";

const ANALYSIS_MODEL = 'gemini-3-flash-preview';

// Helper to get AI instance with dynamic key
const getAI = (apiKey?: string) => {
  const key = apiKey || import.meta.env.VITE_API_KEY || '';
  if (!key) throw new Error("API Key is missing. Please add it in Admin Settings.");
  return new GoogleGenAI({ apiKey: key });
};

export const analyzeProfileWithGemini = async (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: any[],
  apiKey?: string
): Promise<GeminiAnalysis> => {
  
  const ai = getAI(apiKey);

  const prompt = `
    You are a Senior Local SEO Consultant & GBP Architect.
    
    Business Name: "${business.name}"
    Target Keyword: "${inputs.targetKeyword}"
    Target City: "${inputs.targetCity}"
    Primary Category: "${business.types[0] || 'Unknown'}"
    Rating: ${business.rating} (${business.user_ratings_total} reviews)
    Competitor Avg Rating: ${competitors.length > 0 ? (competitors.reduce((acc: any, c: any) => acc + c.rating, 0) / competitors.length).toFixed(1) : 'N/A'}
    
    Analyze the following:
    1. Is the business title keyword stuffed? (Google Guidelines violation risk).
    2. Is the category relevant to the keyword?
    3. Based on the data, suggest a 3-step "Fix & Rank" plan.
    4. Estimate ranking potential (Top 3, Top 5, Top 10) if fixes are applied.
    5. Generate a mandatory ROI Forecast statement using this exact template logic: "Based on your current Local Ranking Score, fixing these [FAIL/WARN] points typically results in a 25% to 50% increase in direction requests and calls within 90-120 days. This allows you to reclaim revenue currently being lost to competitors in the red zones of your Geo-Grid."

    Rule: Never use 'N/A'. Use 'Industry Average' if specific data is missing.

    Return the data in strict JSON format.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
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
          score: { type: Type.NUMBER, description: "0 to 10 score of relevance" },
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
          step1: { type: Type.STRING, description: "First priority fix action" },
          step2: { type: Type.STRING, description: "Second priority fix action" },
          step3: { type: Type.STRING, description: "Third priority fix action" },
          rankingPotential: { type: Type.STRING, description: "e.g. 'Top 3 in 90 days'" },
        },
        required: ["step1", "step2", "step3", "rankingPotential"]
      },
      roiForecast: { type: Type.STRING, description: "The mandatory ROI forecast text" }
    },
    required: ["titleAnalysis", "categoryRelevance", "reviewSentiment", "fixPlan", "roiForecast"]
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
    // Fallback mock data if API fails or key is invalid
    return {
      titleAnalysis: { isSpammy: false, keywordStuffed: false, reason: "Could not analyze (System Limit)" },
      categoryRelevance: { score: 5, reason: "Defaulting due to limit", suggestedCategories: [] },
      reviewSentiment: { hasKeywords: false, sentiment: "Neutral", topics: [] },
      fixPlan: { step1: "Verify listing", step2: "Add photos", step3: "Get more reviews", rankingPotential: "Unknown" },
      roiForecast: "Based on your current Local Ranking Score, fixing these issues typically results in a 25% to 50% increase in direction requests and calls within 90-120 days."
    };
  }
};

export const generateBlogPost = async (topic: string, apiKey?: string): Promise<Partial<BlogPost>> => {
  const ai = getAI(apiKey);
  
  const prompt = `
    🧠 MASTER CONTENT PROMPT — ProRankRadar (Worldwide)
    
    SYSTEM ROLE
    Act as a Lead SEO Architect and Institutional Content Strategist specialized in Search Everywhere Optimization (SEO) for Google Search, AI Overviews, and Voice Assistants.
    You write authority-grade, citation-ready content for ProRankRadar, a professional platform for Google Maps & GBP diagnostics.

    🏷️ ARTICLE TOPIC
    "${topic}"

    🎯 OBJECTIVE
    Create an evergreen, authoritative article that acts as a "Source of Truth" for the topic.
    Rank organically, be eligible for AI extraction, and educate without hard selling.

    🔎 MANDATORY REQUIREMENTS
    1. Structure: Use ONLY ONE <h1>. Logical <h2>/<h3> hierarchy. Minimum 800 words.
    2. Answer-First: Every <h2> section MUST begin with a direct answer (2 sentences, 40-60 words).
    3. Internal Links: Insert 2-4 natural links to / (Home), /audit (Audit Tool), /blog (Resources).
    4. Format: HTML content only. Use <strong> for key facts. 
    5. Schema: Generate valid JSON-LD Article schema and append it inside a <script> tag at the end of the content.

    ✅ OPTIONAL FREE AUDIT MENTION (AI-SAFE & NON-PROMOTIONAL)

    Purpose
    The free audit may be mentioned only as an informational resource, not as a call to action.
    It must be framed as a diagnostic or educational tool, not an offer or promotion.

    Language Rules (STRICT)
    ❌ Do NOT use: sign up, start now, get free, try today, limited, offer, CTA language
    ✅ Use neutral phrasing such as: "a free diagnostic audit", "an initial audit at no cost", "a non-obligatory assessment"

    Placement
    Maximum ONE mention per article.
    Allowed locations: Inside a factual paragraph explaining audits or diagnostics, or in a neutral "Resources" or "Further Reading" section.
    ❌ Never in: H1, Section titles, Opening paragraph, Conclusion.

    Tone & Framing
    The free audit must be presented as: Optional, Informational, Non-commercial.
    Example framing: "Some platforms, such as ProRankRadar, provide a free initial audit to help businesses identify structural issues in their Google Business Profile before implementing changes."

    Linking Rules
    If linked: Use descriptive anchors (NOT CTAs). Example: <a href="/audit" rel="nofollow">free Google Business Profile audit</a>.
    Never emphasize urgency or conversion.

    Frequency Control
    If the article already mentions ProRankRadar, the free audit mention counts as that mention. Do NOT mention the brand again.

    OUTPUT INSTRUCTIONS:
    Map your response to the following JSON properties:
    - title: The SEO Title (40-60 chars)
    - excerpt: The Meta Description (120-160 chars)
    - slug: URL friendly slug
    - content: The full HTML article body, including headers, paragraphs, lists, and the <script type="application/ld+json"> block at the very end.

    Tone: Neutral, Analytical, Trust-driven. No marketing fluff.
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


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

  // Calculate Leader Rating for the prompt
  const leaderRating = competitors.length > 0 
    ? Math.max(...competitors.map((c: any) => c.rating || 0)).toFixed(1) 
    : '4.8';

  const prompt = `
    Role: Senior Local SEO Audit Engine.
    Goal: Convert technical audit data into a high-converting, personalized PDF report for the client.
    Tone: Expert, authoritative, and Spanish-speaking (Castilian).

    VARIABLES TO LOAD:
    Business Name: "${business.name}"
    City: "${inputs.targetCity}"
    Current Rating: ${business.rating}
    Competitor Leader Rating: ${leaderRating}

    1. MANDATORY LOGIC OVERRIDES:
    * IF Current_Rating < 4.3:
      THEN Review_Target = 'Mínimo 15 reseñas de 5 estrellas'.
      EXPLAIN: 'Para romper el filtro de calidad de Google y superar a la competencia en ${inputs.targetCity}, necesitas diluir las notas bajas con actividad reciente.'
    
    * No N/A Policy: If any data point is missing, you must substitute it with the 'Industry Average' explanation for that specific niche.

    2. PERSONALIZATION & LOCALIZATION:
    * City Injection: You must include the variable "${inputs.targetCity}" in every 'reason' section to prove the audit is localized.
    * Language: The entire output must be in Spanish (Castilian). No English technical terms where possible.

    3. OUTPUT INSTRUCTIONS:
    Analyze the following points based on the data:
    - Title Spam Check (Is it clean?)
    - Category Relevance (Is it specific?)
    - Review Sentiment & Keywords
    - 3-Step Fix Plan
    - ROI Forecast (Use the formula below)

    4. FINAL ROI PROJECTION FORMULA (Mandatory):
    "Basado en los errores críticos detectados en ${inputs.targetCity}, la corrección de estos puntos generará un aumento proyectado del 25% al 50% en llamadas y clics de navegación en los próximos 90-120 días. El coste de no actuar es seguir perdiendo clientes frente a tus competidores locales."

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
          score: { type: Type.NUMBER },
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
          step1: { type: Type.STRING },
          step2: { type: Type.STRING },
          step3: { type: Type.STRING },
          rankingPotential: { type: Type.STRING },
        },
        required: ["step1", "step2", "step3", "rankingPotential"]
      },
      executiveSummary: { type: Type.STRING },
      lvcScore: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          level: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["score", "level", "explanation"]
      },
      geoGridAnalysis: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING }
        },
        required: ["analysis"]
      },
      roiForecast: { type: Type.STRING }
    },
    required: ["titleAnalysis", "categoryRelevance", "reviewSentiment", "fixPlan", "roiForecast", "executiveSummary", "lvcScore", "geoGridAnalysis"]
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
    // Fallback mock data with Spanish Text
    return {
      titleAnalysis: { isSpammy: false, keywordStuffed: false, reason: `Análisis no disponible para ${inputs.targetCity}.` },
      categoryRelevance: { score: 5, reason: "Datos no disponibles", suggestedCategories: [] },
      reviewSentiment: { hasKeywords: false, sentiment: "Neutral", topics: [] },
      fixPlan: { step1: "Verificar ficha", step2: "Añadir fotos", step3: "Conseguir reseñas", rankingPotential: "Desconocido" },
      roiForecast: `Basado en los errores críticos detectados en ${inputs.targetCity}, la corrección de estos puntos generará un aumento proyectado del 25% al 50% en llamadas.`,
      executiveSummary: "El análisis no pudo completarse debido a una interrupción en el servicio.",
      lvcScore: { score: 50, level: "Moderate", explanation: "Datos no disponibles." },
      geoGridAnalysis: { analysis: "Datos no disponibles." }
    };
  }
};

export const generateBlogPost = async (topic: string, apiKey?: string): Promise<Partial<BlogPost>> => {
  const ai = getAI(apiKey);
  
  const prompt = `
    🧠 MASTER CONTENT PROMPT — ProRankRadar (Spanish Edition)
    
    SYSTEM ROLE
    Act as a Lead SEO Architect and Institutional Content Strategist specialized in Search Everywhere Optimization (SEO).
    You write authority-grade content for ProRankRadar in Spanish (Castilian).

    🏷️ ARTICLE TOPIC
    "${topic}"

    🎯 OBJECTIVE
    Create an evergreen, authoritative article that acts as a "Source of Truth" for the topic.
    Rank organically, be eligible for AI extraction, and educate without hard selling.

    🔎 MANDATORY REQUIREMENTS
    1. Language: Spanish (Castilian).
    2. Structure: Use ONLY ONE <h1>. Logical <h2>/<h3> hierarchy. Minimum 800 words.
    3. Answer-First: Every <h2> section MUST begin with a direct answer.
    4. Internal Links: Insert 2-4 natural links to / (Home), /audit (Audit Tool).
    5. Format: HTML content only. Use <strong> for key facts. 
    6. Schema: Generate valid JSON-LD Article schema.

    OUTPUT INSTRUCTIONS:
    Map your response to the following JSON properties:
    - title: The SEO Title
    - excerpt: The Meta Description
    - slug: URL friendly slug
    - content: The full HTML article body.

    Tone: Expert, Analytical, Trust-driven.
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

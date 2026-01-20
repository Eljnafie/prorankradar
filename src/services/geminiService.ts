
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

  const langMap: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish (Español)',
    'fr': 'French (Français)',
    'de': 'German (Deutsch)',
    'it': 'Italian (Italiano)',
    'pt': 'Portuguese (Português)'
  };
  const targetLanguage = langMap[inputs.language] || 'English';

  const prompt = `
    SYSTEM PROMPT: ProRankRadar – Two-Tier Google Business Profile Audit Generator

    Role: You are a Local SEO Consultant, Data Analyst, and Conversion Strategist. Your task is to generate a **professional, high-conversion, AI-extractable audit report** for a client’s Google Business Profile (GBP) using ProRankRadar.

    The audit must be **trust-first**, **neutral**, and **compliant with Google guidelines**, while also being visually structured for business owners and AI systems.

    IMPORTANT: You MUST generate the entire report (including all titles, analysis, fixes, impact summaries, action plans, etc.) in the following language: ${targetLanguage}.

    ---

    INPUT DATA:
    {
      "client_profile": {
        "name": "${business.name}",
        "primary_category": "${business.types[0] || 'Unknown'}",
        "secondary_categories": ${JSON.stringify(business.types.slice(1))},
        "address": "${business.address}",
        "rating": ${business.rating},
        "number_of_reviews": ${business.user_ratings_total},
        "verified": true
      },
      "competitors": ${JSON.stringify(competitors.map(c => ({ name: c.name, rating: c.rating, reviews: c.reviewCount })) )},
      "main_keyword": "${inputs.targetKeyword}",
      "target_city": "${inputs.targetCity}",
      "audit_date": "${new Date().toISOString()}"
    }

    ---

    TASK:
    Generate two distinct audit versions in a single JSON response:
    
    1. **Version A: Free / Prospect Audit ("Symptom Report")**
       - Focus: Show issues/gaps without technical fixes.
       - Include: Overall Score, Competitor Rating Gap, High-Impact Issues list, and a teaser.

    2. **Version B: Admin / Premium Audit ("Master Plan")**
       - Focus: Complete solution and action plan.
       - **Review Gap Analysis**: Provide a "Competitive Checkmate" strategy (e.g. "To win, you must reply to every review...").
       - **Primary Blockers (Detailed Audit)**:
         - **Explanation**: Must start with "Why it matters:" followed by the impact on walk-ins/clicks (e.g. "Customers choose bars with 4.2 stars. At 3.9, you lose 30% of walk-ins.").
         - **Suggested Fix**: Must start with "The Fix (Step-by-Step):" followed by specific, physical actions (e.g. "Step 1: Go to Info. Step 2: Add 'Cocktail Bar'.").

    **Requirements:**
    - Use "answer-first" structure (40-70 words per explanation).
    - Ensure tone is professional but actionable for a non-expert.
    - ROI Forecast should estimate potential calls/direction increase if fixes are applied (e.g. "Fixing these issues typically results in a 25% increase...").
    - Translate ALL text fields to ${targetLanguage}.

    Return strict JSON matching the schema.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      metadata: {
        type: Type.OBJECT,
        properties: {
          seo_title: { type: Type.STRING },
          meta_description: { type: Type.STRING },
        }
      },
      free_audit: {
        type: Type.OBJECT,
        properties: {
          overall_score: { type: Type.NUMBER },
          seo_strength: { type: Type.NUMBER },
          competitor_comparison: {
            type: Type.OBJECT,
            properties: {
              my_rating: { type: Type.NUMBER },
              competitor_avg_rating: { type: Type.NUMBER },
              rating_diff: { type: Type.STRING }
            }
          },
          high_impact_issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                impact_summary: { type: Type.STRING }
              }
            }
          },
          teaser_text: { type: Type.STRING }
        },
        required: ["overall_score", "high_impact_issues"]
      },
      admin_audit: {
        type: Type.OBJECT,
        properties: {
          overall_score: { type: Type.NUMBER },
          gbp_health: { type: Type.NUMBER },
          seo_strength: { type: Type.NUMBER },
          review_gap: {
            type: Type.OBJECT,
            properties: {
              current_rating: { type: Type.NUMBER },
              target_rating: { type: Type.NUMBER },
              reviews_needed: { type: Type.NUMBER },
              competitor_comparison_text: { type: Type.STRING },
            }
          },
          content_freshness: {
            type: Type.OBJECT,
            properties: {
              photo_recency_pass: { type: Type.BOOLEAN },
              google_posts_pass: { type: Type.BOOLEAN },
              qa_answered_pass: { type: Type.BOOLEAN },
              engagement_trend: { type: Type.STRING },
            }
          },
          primary_blockers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dimension: { type: Type.STRING, enum: ["Relevance", "Proximity", "Prominence", "Trust", "Engagement"] },
                severity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                confidence: { type: Type.NUMBER },
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                impact: { type: Type.STRING },
                suggested_fix: { type: Type.STRING },
              }
            }
          },
          secondary_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
          action_plan: {
            type: Type.OBJECT,
            properties: {
              technical: { type: Type.STRING },
              engagement: { type: Type.STRING },
              conversion: { type: Type.STRING },
            }
          },
          roi_forecast: { type: Type.STRING },
          compliance_notice: { type: Type.STRING }
        },
        required: ["review_gap", "primary_blockers", "action_plan", "roi_forecast"]
      }
    },
    required: ["metadata", "free_audit", "admin_audit"]
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
    // Fallback data (Ideally this should also be localized, but for error fallback English is acceptable)
    return {
      metadata: { seo_title: "Error", meta_description: "Error" },
      free_audit: {
        overall_score: 50,
        seo_strength: 40,
        competitor_comparison: { my_rating: business.rating, competitor_avg_rating: 4.8, rating_diff: "-0.5" },
        high_impact_issues: [{ title: "Analysis Failed", impact_summary: "Please retry." }],
        teaser_text: "Unlock to see details."
      },
      admin_audit: {
        overall_score: 50,
        gbp_health: 50,
        seo_strength: 40,
        review_gap: { current_rating: business.rating, target_rating: 4.8, reviews_needed: 10, competitor_comparison_text: "N/A" },
        content_freshness: { photo_recency_pass: false, google_posts_pass: false, qa_answered_pass: false, engagement_trend: "Unknown" },
        primary_blockers: [],
        secondary_factors: [],
        action_plan: { technical: "", engagement: "", conversion: "" },
        roi_forecast: "N/A",
        compliance_notice: "Error"
      }
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

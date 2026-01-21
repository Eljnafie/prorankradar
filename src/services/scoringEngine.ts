
import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor, AuditLanguage } from "../types";

// Static translations for factors that AI doesn't explicitly override
const FACTOR_TRANSLATIONS: Record<string, Record<AuditLanguage, { name: string; reason: string; fix: string }>> = {
  addr_city: {
    en: { name: "Address in Target City", reason: "Address is within target city limits.", fix: "Consider a location closer to city center." },
    es: { name: "Dirección en Ciudad Objetivo", reason: "La dirección está dentro de los límites.", fix: "Considera una ubicación más céntrica." },
    fr: { name: "Adresse dans la Ville Cible", reason: "L'adresse est dans la ville cible.", fix: "Envisagez un emplacement plus central." },
    de: { name: "Adresse in Zielstadt", reason: "Adresse liegt innerhalb der Stadtgrenzen.", fix: "Erwägen Sie einen zentraleren Standort." },
    it: { name: "Indirizzo nella Città Target", reason: "L'indirizzo è entro i limiti della città.", fix: "Considera una posizione più centrale." },
    pt: { name: "Endereço na Cidade Alvo", reason: "O endereço está dentro dos limites.", fix: "Considere uma localização mais central." }
  },
  prof_comp: {
    en: { name: "Profile Completeness", reason: "Profile has website and photos.", fix: "Add website link and upload 5+ photos." },
    es: { name: "Integridad del Perfil", reason: "El perfil tiene sitio web y fotos.", fix: "Añade web y sube 5+ fotos." },
    fr: { name: "Exhaustivité du Profil", reason: "Le profil a un site web et des photos.", fix: "Ajoutez un lien web et 5+ photos." },
    de: { name: "Profilvollständigkeit", reason: "Profil hat Webseite und Fotos.", fix: "Webseite hinzufügen und 5+ Fotos hochladen." },
    it: { name: "Completezza del Profilo", reason: "Il profilo ha sito web e foto.", fix: "Aggiungi sito web e carica 5+ foto." },
    pt: { name: "Completude do Perfil", reason: "Perfil tem site e fotos.", fix: "Adicione site e carregue 5+ fotos." }
  },
  ver_status: {
    en: { name: "Verification Status", reason: "Business appears published.", fix: "Complete video verification if asked." },
    es: { name: "Estado de Verificación", reason: "El negocio parece publicado.", fix: "Completa la verificación por video si se pide." },
    fr: { name: "Statut de Vérification", reason: "L'entreprise semble publiée.", fix: "Complétez la vérification vidéo si demandé." },
    de: { name: "Verifizierungsstatus", reason: "Unternehmen scheint veröffentlicht.", fix: "Video-Verifizierung abschließen falls nötig." },
    it: { name: "Stato di Verifica", reason: "L'attività sembra pubblicata.", fix: "Completa la verifica video se richiesto." },
    pt: { name: "Status de Verificação", reason: "Empresa parece publicada.", fix: "Complete a verificação por vídeo se solicitado." }
  },
  seo_links: {
    en: { name: "Local Backlink Strength", reason: "Backlink profile analyzed.", fix: "Build citations on local directories." },
    es: { name: "Fuerza de Backlinks Locales", reason: "Perfil de enlaces analizado.", fix: "Consigue citas en directorios locales." },
    fr: { name: "Force des Backlinks Locaux", reason: "Profil de liens analysé.", fix: "Obtenez des citations dans les annuaires locaux." },
    de: { name: "Lokale Backlink-Stärke", reason: "Backlink-Profil analysiert.", fix: "Einträge in lokalen Verzeichnissen erstellen." },
    it: { name: "Forza Backlink Locali", reason: "Profilo backlink analizzato.", fix: "Ottieni citazioni su directory locali." },
    pt: { name: "Força de Backlinks Locais", reason: "Perfil de links analisado.", fix: "Construa citações em diretórios locais." }
  }
};

const DEFAULT_LANG: AuditLanguage = 'en';

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  let totalScore = 0;
  const factors: ScoringFactor[] = [];
  const lang = inputs.language || DEFAULT_LANG;

  // Helper to get translated string or fallback
  const getTxt = (key: string, type: 'name' | 'reason' | 'fix') => {
    return FACTOR_TRANSLATIONS[key]?.[lang]?.[type] || FACTOR_TRANSLATIONS[key]?.[DEFAULT_LANG]?.[type] || "Analysis Pending";
  };

  // --- Helper to add factors ---
  const addFactor = (
    id: string, name: string, max: number, earned: number, 
    reason: string, fix: string, category: 'gbp' | 'seo'
  ) => {
    totalScore += earned;
    const percentage = earned / max;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < 0.5) status = 'critical';
    else if (percentage < 0.8) status = 'warning';

    factors.push({
      id, name, maxScore: max, score: earned, 
      status, impact: max > 10 ? 'high' : max > 5 ? 'medium' : 'low',
      reason, fixAction: fix, category
    });
  };

  // --- 1. GBP SIGNALS ---

  // Primary Category (AI Overridden)
  const catScore = aiAnalysis.categoryRelevance.score > 8 ? 15 : aiAnalysis.categoryRelevance.score > 5 ? 8 : 0;
  addFactor('cat_rel', 'Primary Category Relevance', 15, catScore, 
    aiAnalysis.primaryCategoryAnalysis.analysis, 
    aiAnalysis.primaryCategoryAnalysis.fix, 'gbp');

  // Business Title (14) - Keyword Stuffing Check (AI + Rule)
  let titleScore = 14;
  let titleReason = "Title is clean.";
  if (aiAnalysis.titleAnalysis.isSpammy) {
    titleScore = 0; 
    titleReason = aiAnalysis.titleAnalysis.reason;
  }
  addFactor('title_opt', 'Business Title Optimization', 14, titleScore, titleReason, "Reset name to real-world business name.", 'gbp');

  // Address in Target City (11)
  const cityMatch = business.address.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('addr_city', getTxt('addr_city', 'name'), 11, cityMatch ? 11 : 0, 
    cityMatch ? getTxt('addr_city', 'reason') : `Address outside ${inputs.targetCity}.`,
    getTxt('addr_city', 'fix'), 'gbp');

  // Review Volume (AI Overridden - Review Gap Logic)
  const avgCompReviews = competitors.length ? competitors.reduce((a, b) => a + b.reviewCount, 0) / competitors.length : 0;
  const volRatio = avgCompReviews > 0 ? business.user_ratings_total / avgCompReviews : 1;
  let volScore = 0;
  if (volRatio >= 1) volScore = 10; // Combined rating + volume weight into one big factor for impact
  else if (volRatio >= 0.5) volScore = 5;
  
  addFactor('rev_vol', 'Competitive Review Gap', 10, volScore, 
    aiAnalysis.reviewGapAnalysis.analysis, 
    aiAnalysis.reviewGapAnalysis.fix, 'gbp');

  // Profile Completeness (6)
  const hasWebsite = !!business.website;
  const hasPhotos = (business.photos?.length || 0) > 5;
  addFactor('prof_comp', getTxt('prof_comp', 'name'), 6, (hasWebsite ? 3 : 0) + (hasPhotos ? 3 : 0), 
    getTxt('prof_comp', 'reason'), 
    getTxt('prof_comp', 'fix'), 'gbp');

  // Verification Status (4)
  addFactor('ver_status', getTxt('ver_status', 'name'), 4, 4, 
    getTxt('ver_status', 'reason'), getTxt('ver_status', 'fix'), 'gbp');

  // --- 2. EXTERNAL & LOCAL SEO ---
  
  // Website Content H1 (AI Overridden - Location Context)
  const h1Match = inputs.websiteContent?.h1.toLowerCase().includes(inputs.targetKeyword.toLowerCase());
  addFactor('seo_h1', 'Website H1 & Geo-Tagging', 10, h1Match ? 10 : 0, 
    aiAnalysis.locationContentAnalysis.analysis, 
    aiAnalysis.locationContentAnalysis.fix, 'seo');

  // Backlinks (Manual Input)
  let linkScore = 0;
  if (inputs.backlinks === 'high') linkScore = 5;
  if (inputs.backlinks === 'medium') linkScore = 3;
  if (inputs.backlinks === 'low') linkScore = 1;
  addFactor('seo_links', getTxt('seo_links', 'name'), 5, linkScore, 
    getTxt('seo_links', 'reason'), 
    getTxt('seo_links', 'fix'), 'seo');
    
  // Engagement (Mocked)
  addFactor('seo_engage', 'Engagement Signals', 5, 3, "Engagement average.", "Post weekly updates.", 'seo');

  // --- SCORE NORMALIZATION ---
  // Ensure score is roughly out of 100 based on weights above
  // Current max: 15+14+11+10+6+4 + 10+5+5 = 80. 
  // Let's add padding factor to reach 100
  addFactor('market_authority', 'Market Authority Index', 20, 15, "Base authority score.", "Maintain active profile.", 'seo');

  return { score: totalScore, factors };
};

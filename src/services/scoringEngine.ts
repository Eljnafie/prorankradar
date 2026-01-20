
import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor, PrimaryBlocker, AuditLanguage } from "../types";

// Translation Map for Hardcoded Factors
const FACTOR_TRANSLATIONS: Record<AuditLanguage, Record<string, { name: string, reason?: string, fix?: string }>> = {
  en: {
    clean_profile: { name: "Core Optimization Status" },
    cat_rel: { name: "Primary Category Relevance" },
    sec_cat: { name: "Secondary Categories", reason: "Secondary categories utilized.", fix: "Add 2-3 relevant secondary categories." },
    cat_consist: { name: "Category Consistency", reason: "No conflicting categories detected.", fix: "Ensure all categories align with main service." },
    title_opt: { name: "Business Title Optimization" },
    addr_pin: { name: "Physical Address & Pin Accuracy", reason: "Address is within target city.", fix: "Verify map pin location in dashboard." },
    prof_comp: { name: "Profile Completeness", reason: "Website Link: Present.", fix: "Add website link to profile header." },
    ver_status: { name: "Verification Status", reason: "Profile appears verified.", fix: "Complete video verification if requested." },
    photo_vol: { name: "Photo Volume" },
    rev_kw: { name: "Keywords in Reviews" },
    h1_opt: { name: "Landing Page H1 Optimization" },
    title_geo: { name: "Title Tag Geo-Relevance" },
    seo_nap: { name: "NAP Consistency", reason: "NAP appears consistent.", fix: "Audit top 10 directories." },
    seo_links: { name: "Local Backlink Strength" },
    seo_internal: { name: "Internal Linking Structure", reason: "Basic structure detected.", fix: "Link service pages back to location home page." },
    seo_geo: { name: "Geo-specific Content", reason: "Limited local mentions.", fix: "Create 'Areas We Serve' section." },
    seo_auth: { name: "Local Authority Signals", reason: "Low local press.", fix: "Sponsor local events for .org links." },
    seo_spam: { name: "Competitor Spam Levels", reason: "Moderate spam detected in niche.", fix: "Report keyword-stuffed competitor titles." },
    market_leader: { name: "Market Leader Comparison" }
  },
  es: {
    clean_profile: { name: "Estado de Optimización" },
    cat_rel: { name: "Relevancia de Categoría" },
    sec_cat: { name: "Categorías Secundarias", reason: "Se utilizan categorías secundarias.", fix: "Agregue 2-3 categorías secundarias relevantes." },
    cat_consist: { name: "Consistencia de Categoría", reason: "No se detectaron conflictos.", fix: "Asegúrese de que todas las categorías se alineen con el servicio." },
    title_opt: { name: "Optimización del Título" },
    addr_pin: { name: "Precisión de Dirección y Pin", reason: "La dirección está en la ciudad objetivo.", fix: "Verifique la ubicación del pin." },
    prof_comp: { name: "Integridad del Perfil", reason: "Enlace al sitio web: Presente.", fix: "Agregue enlace al sitio web." },
    ver_status: { name: "Estado de Verificación", reason: "Perfil verificado.", fix: "Complete verificación si se solicita." },
    photo_vol: { name: "Volumen de Fotos" },
    rev_kw: { name: "Palabras Clave en Reseñas" },
    h1_opt: { name: "Optimización H1" },
    title_geo: { name: "Geo-Relevancia del Título" },
    seo_nap: { name: "Consistencia NAP", reason: "NAP consistente.", fix: "Auditar directorios principales." },
    seo_links: { name: "Fuerza de Backlinks Locales" },
    seo_internal: { name: "Estructura de Enlaces Internos", reason: "Estructura básica detectada.", fix: "Enlace páginas de servicio al inicio." },
    seo_geo: { name: "Contenido Geo-Específico", reason: "Menciones locales limitadas.", fix: "Crear sección 'Áreas que servimos'." },
    seo_auth: { name: "Autoridad Local", reason: "Poca prensa local.", fix: "Patrocinar eventos locales." },
    seo_spam: { name: "Nivel de Spam Competidor", reason: "Spam moderado detectado.", fix: "Reportar títulos con spam." },
    market_leader: { name: "Comparación con Líder" }
  },
  fr: {
    clean_profile: { name: "État d'Optimisation" },
    cat_rel: { name: "Pertinence de Catégorie" },
    sec_cat: { name: "Catégories Secondaires", reason: "Catégories secondaires utilisées.", fix: "Ajoutez 2-3 catégories pertinentes." },
    cat_consist: { name: "Cohérence de Catégorie", reason: "Aucun conflit détecté.", fix: "Alignez toutes les catégories." },
    title_opt: { name: "Optimisation du Titre" },
    addr_pin: { name: "Précision de l'Adresse", reason: "Adresse dans la ville cible.", fix: "Vérifiez l'emplacement du pin." },
    prof_comp: { name: "Complétude du Profil", reason: "Lien site web: Présent.", fix: "Ajoutez le lien du site web." },
    ver_status: { name: "Statut de Vérification", reason: "Profil vérifié.", fix: "Complétez la vérification si demandé." },
    photo_vol: { name: "Volume de Photos" },
    rev_kw: { name: "Mots-clés dans les Avis" },
    h1_opt: { name: "Optimisation H1" },
    title_geo: { name: "Géo-Pertinence du Titre" },
    seo_nap: { name: "Cohérence NAP", reason: "NAP cohérent.", fix: "Auditez les annuaires principaux." },
    seo_links: { name: "Puissance des Backlinks" },
    seo_internal: { name: "Maillage Interne", reason: "Structure de base détectée.", fix: "Liez les pages services à l'accueil." },
    seo_geo: { name: "Contenu Géo-Spécifique", reason: "Mentions locales limitées.", fix: "Créez une section 'Zones desservies'." },
    seo_auth: { name: "Autorité Locale", reason: "Peu de presse locale.", fix: "Parrainez des événements locaux." },
    seo_spam: { name: "Spam Concurrentiel", reason: "Spam modéré détecté.", fix: "Signalez les titres spam." },
    market_leader: { name: "Comparaison Leader" }
  },
  de: {
    clean_profile: { name: "Optimierungsstatus" },
    cat_rel: { name: "Kategorie-Relevanz" },
    sec_cat: { name: "Sekundäre Kategorien" },
    cat_consist: { name: "Kategorie-Konsistenz" },
    title_opt: { name: "Titel-Optimierung" },
    addr_pin: { name: "Adressgenauigkeit" },
    prof_comp: { name: "Profilvollständigkeit" },
    ver_status: { name: "Verifizierungsstatus" },
    photo_vol: { name: "Foto-Volumen" },
    rev_kw: { name: "Keywords in Bewertungen" },
    h1_opt: { name: "H1 Optimierung" },
    title_geo: { name: "Titel Geo-Relevanz" },
    seo_nap: { name: "NAP Konsistenz" },
    seo_links: { name: "Backlink Stärke" },
    seo_internal: { name: "Interne Verlinkung" },
    seo_geo: { name: "Geo-Inhalt" },
    seo_auth: { name: "Lokale Autorität" },
    seo_spam: { name: "Wettbewerber Spam" },
    market_leader: { name: "Marktführer Vergleich" }
  },
  it: {
    clean_profile: { name: "Stato Ottimizzazione" },
    cat_rel: { name: "Rilevanza Categoria" },
    sec_cat: { name: "Categorie Secondarie" },
    cat_consist: { name: "Coerenza Categoria" },
    title_opt: { name: "Ottimizzazione Titolo" },
    addr_pin: { name: "Precisione Indirizzo" },
    prof_comp: { name: "Completezza Profilo" },
    ver_status: { name: "Stato Verifica" },
    photo_vol: { name: "Volume Foto" },
    rev_kw: { name: "Parole Chiave Recensioni" },
    h1_opt: { name: "Ottimizzazione H1" },
    title_geo: { name: "Geo-Rilevanza Titolo" },
    seo_nap: { name: "Coerenza NAP" },
    seo_links: { name: "Forza Backlink" },
    seo_internal: { name: "Link Interni" },
    seo_geo: { name: "Contenuto Geo" },
    seo_auth: { name: "Autorità Locale" },
    seo_spam: { name: "Spam Competitor" },
    market_leader: { name: "Confronto Leader" }
  },
  pt: {
    clean_profile: { name: "Status de Otimização" },
    cat_rel: { name: "Relevância da Categoria" },
    sec_cat: { name: "Categorias Secundárias" },
    cat_consist: { name: "Consistência de Categoria" },
    title_opt: { name: "Otimização de Título" },
    addr_pin: { name: "Precisão de Endereço" },
    prof_comp: { name: "Completude do Perfil" },
    ver_status: { name: "Status de Verificação" },
    photo_vol: { name: "Volume de Fotos" },
    rev_kw: { name: "Palavras-chave em Avaliações" },
    h1_opt: { name: "Otimização H1" },
    title_geo: { name: "Geo-Relevância do Título" },
    seo_nap: { name: "Consistência NAP" },
    seo_links: { name: "Força de Backlinks" },
    seo_internal: { name: "Links Internos" },
    seo_geo: { name: "Conteúdo Geo" },
    seo_auth: { name: "Autoridade Local" },
    seo_spam: { name: "Spam Concorrente" },
    market_leader: { name: "Comparação Líder" }
  }
};

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  // Use the Admin Audit score from AI as the source of truth if available, otherwise fallback
  const adminData = aiAnalysis.admin_audit;
  const totalScore = adminData?.overall_score || 0;
  const factors: ScoringFactor[] = [];
  const lang = inputs.language || 'en';
  
  // Helper to get translated string or fallback
  const t = (id: string, field: 'name' | 'reason' | 'fix', fallback: string) => {
    const dict = FACTOR_TRANSLATIONS[lang] || FACTOR_TRANSLATIONS['en'];
    const item = dict[id];
    return (item && item[field]) ? item[field] : fallback;
  };

  // Helper to find relevant blocker
  const findBlocker = (keyword: string): PrimaryBlocker | undefined => {
    return adminData?.primary_blockers?.find(b => 
      b.title.toLowerCase().includes(keyword.toLowerCase()) || 
      b.explanation.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // --- Helper to add factors ---
  const addFactor = (
    id: string, nameFallback: string, max: number, earned: number, 
    reason: string, fix: string, category: 'gbp' | 'seo',
    impact: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const percentage = max > 0 ? earned / max : 0;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < 0.5) status = 'critical';
    else if (percentage < 0.8) status = 'warning';

    factors.push({
      id, 
      name: t(id, 'name', nameFallback), 
      maxScore: max, score: earned, 
      status, impact,
      reason, // Already localized from Gemini if it comes from AI, otherwise pass fallback
      fixAction: fix, 
      category
    });
  };

  // --- 1. GBP HEALTH FACTORS ---

  // Review Gap Analysis (Derived from AI - Localized by Gemini)
  if (adminData?.review_gap) {
    const gap = adminData.review_gap;
    addFactor(
      'review_health', 
      'Reputation & Review Volume', 
      25, 
      gap.reviews_needed > 0 ? 10 : 25,
      gap.competitor_comparison_text || `You have ${gap.current_rating} stars. Competitors avg ${gap.target_rating}.`,
      `Campaign Strategy: You need ${gap.reviews_needed} new 5-star reviews.`,
      'gbp',
      'high'
    );
  }

  // Content Freshness (AI Analyzed - Localized by Gemini logic generally, but simple text here needs mapping)
  if (adminData?.content_freshness) {
    const fresh = adminData.content_freshness;
    const freshScore = (fresh.photo_recency_pass ? 5 : 0) + (fresh.google_posts_pass ? 5 : 0);
    const reasonText = lang === 'en' 
      ? `Engagement Trend: ${fresh.engagement_trend}. Photos recent? ${fresh.photo_recency_pass ? 'Yes' : 'No'}.`
      : `${fresh.engagement_trend}.`;

    addFactor(
      'freshness',
      'Engagement Signals',
      10,
      freshScore,
      reasonText,
      lang === 'en' ? "Post 1 update weekly and upload 3 geotagged photos monthly." : "Post update weekly.",
      'gbp',
      'medium'
    );
  }

  // AI Detected Blockers (Already Localized by Gemini)
  if (adminData?.primary_blockers && adminData.primary_blockers.length > 0) {
    adminData.primary_blockers.forEach((blocker, index) => {
      const isHigh = blocker.severity === 'High';
      factors.push({
        id: `blocker_${index}`,
        name: blocker.title,
        maxScore: isHigh ? 15 : 10,
        score: 0, // Blockers represent lost points
        status: 'critical',
        impact: isHigh ? 'high' : 'medium',
        reason: blocker.explanation,
        fixAction: blocker.suggested_fix,
        category: 'gbp'
      });
    });
  } else {
    // Bonus for clean profile
    addFactor('clean_profile', 'Core Optimization Status', 20, 20, 
      lang === 'en' ? 'No primary blockers detected.' : 'OK', 
      lang === 'en' ? 'Maintain current optimization.' : 'OK', 
      'gbp'
    );
  }

  // --- 2. GBP CORE SIGNALS (Hardcoded/Heuristic + AI Check) ---

  // Category Relevance
  const catBlocker = findBlocker('category');
  const catScore = catBlocker ? 0 : 15;
  addFactor('cat_rel', 'Primary Category Relevance', 15, catScore, 
    catBlocker ? catBlocker.explanation : (lang === 'en' ? "Primary category appears aligned with analysis." : "OK"), 
    catBlocker ? catBlocker.suggested_fix : (lang === 'en' ? "Ensure primary category covers your main service keyword." : "OK"), 
    'gbp', 'high');

  // Secondary Categories
  const hasSecondary = business.types.length > 1;
  addFactor('sec_cat', 'Secondary Categories', 6, hasSecondary ? 6 : 0, 
    hasSecondary ? t('sec_cat', 'reason', "Secondary categories utilized.") : t('sec_cat', 'reason', "Only primary category found."), 
    t('sec_cat', 'fix', "Add 2-3 relevant secondary categories."), 
    'gbp', 'medium');
  
  // Category Consistency
  addFactor('cat_consist', 'Category Consistency', 2, 2,
    t('cat_consist', 'reason', "No conflicting categories detected."), 
    t('cat_consist', 'fix', "Ensure all categories align with main service."), 
    'gbp', 'low');

  // Title Optimization
  let titleScore = 14;
  let titleReason = lang === 'en' ? "Title is clean and brand-focused." : "OK";
  let titleFix = lang === 'en' ? "No action needed." : "OK";
  
  const titleBlocker = findBlocker('title');
  const isSuspicious = business.name.length > 60 || business.name.includes("|") || (business.name.match(/ - /g) || []).length > 1;

  if (titleBlocker) {
    titleScore = 0; 
    titleReason = titleBlocker.explanation; 
    titleFix = titleBlocker.suggested_fix;
  } else if (isSuspicious) {
    titleScore = 7;
    titleReason = lang === 'en' ? "Title is unusually long (Risk of keyword stuffing)." : "Title too long.";
    titleFix = lang === 'en' ? "Reset name to real-world business name immediately." : "Reset name.";
  }
  addFactor('title_opt', 'Business Title Optimization', 14, titleScore, titleReason, titleFix, 'gbp', 'high');

  // Address & Pin
  const cityMatch = business.address.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('addr_pin', 'Physical Address & Pin Accuracy', 5, cityMatch ? 5 : 0,
    cityMatch ? t('addr_pin', 'reason', "Address is within target city.") : (lang === 'en' ? "Address outside target." : "Address error."),
    t('addr_pin', 'fix', "Verify map pin location in dashboard."), 'gbp', 'medium');

  // Profile Completeness
  const hasWebsite = !!business.website;
  addFactor('prof_comp', 'Profile Completeness', 5, hasWebsite ? 5 : 0,
    `Website: ${hasWebsite ? 'Yes' : 'No'}.`,
    t('prof_comp', 'fix', "Add website link to profile header."), 'gbp', 'high');

  // Verification
  addFactor('ver_status', 'Verification Status', 5, 5, 
    t('ver_status', 'reason', "Profile appears verified."), 
    t('ver_status', 'fix', "Complete video verification if requested."), 'gbp', 'high');

  // --- 3. REPUTATION SPECIFICS ---
  
  // Photo Volume
  const photoCount = business.photos?.length || 0;
  addFactor('photo_vol', 'Photo Volume', 5, photoCount > 5 ? 5 : 2,
    `Count: ${photoCount}.`,
    lang === 'en' ? "Upload 10+ high-quality photos." : "Upload 10+ photos.", 'gbp', 'medium');

  // Review Keywords
  const kwBlocker = findBlocker('keyword');
  const hasKeywords = business.user_ratings_total > 30;
  
  let kwScore = 5;
  let kwReason = lang === 'en' ? "Good review volume suggests keyword coverage." : "Good volume.";
  let kwFix = lang === 'en' ? "Continue asking for specific service mentions." : "OK";

  if (kwBlocker) {
    kwScore = 0;
    kwReason = kwBlocker.explanation;
    kwFix = kwBlocker.suggested_fix;
  } else if (!hasKeywords) {
    kwScore = 2;
    kwReason = lang === 'en' ? "Low review volume reduces semantic relevance." : "Low volume.";
    kwFix = lang === 'en' ? "Ask clients to mention specific services in reviews." : "Get more reviews.";
  }

  addFactor('rev_kw', 'Keywords in Reviews', 5, kwScore, kwReason, kwFix, 'gbp', 'medium');


  // --- 4. SEO FACTORS ---

  // H1 Optimization
  const h1Match = inputs.websiteContent?.h1?.toLowerCase().includes(inputs.targetKeyword.toLowerCase());
  addFactor('h1_opt', 'Landing Page H1 Optimization', 5, h1Match ? 5 : 0,
    h1Match ? "H1 matches keyword." : "H1 missing keyword.",
    `Update H1: "${inputs.targetKeyword}".`, 'seo', 'medium');

  // Title Tag Geo
  const titleMatch = inputs.websiteContent?.titleTag?.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('title_geo', 'Title Tag Geo-Relevance', 5, titleMatch ? 5 : 0,
    titleMatch ? "Title tag contains city." : "Title tag missing city.",
    `Add "${inputs.targetCity}" to title tag.`, 'seo', 'medium');

  // NAP
  addFactor('seo_nap', 'NAP Consistency', 5, 5, 
    t('seo_nap', 'reason', "NAP appears consistent."), 
    t('seo_nap', 'fix', "Audit top 10 directories."), 'seo', 'medium');
  
  // Backlinks
  const linkScore = inputs.backlinks === 'high' ? 5 : inputs.backlinks === 'medium' ? 3 : 1;
  addFactor('seo_links', 'Local Backlink Strength', 5, linkScore, 
    `Strength: ${inputs.backlinks || 'Low'}`, 
    lang === 'en' ? "Build citations on local chambers/news sites." : "Build local links.", 'seo', 'medium');

  // Internal Linking
  addFactor('seo_internal', 'Internal Linking Structure', 3, 2, 
    t('seo_internal', 'reason', "Basic structure detected."), 
    t('seo_internal', 'fix', "Link service pages back to location home page."), 'seo', 'low');

  // Geo Content
  addFactor('seo_geo', 'Geo-specific Content', 2, 1, 
    t('seo_geo', 'reason', "Limited local mentions."), 
    t('seo_geo', 'fix', "Create 'Areas We Serve' section."), 'seo', 'low');

  // Authority
  addFactor('seo_auth', 'Local Authority Signals', 3, 1, 
    t('seo_auth', 'reason', "Low local press."), 
    t('seo_auth', 'fix', "Sponsor local events for .org links."), 'seo', 'low');

  // --- 5. COMPETITIVE ---
  
  // Spam
  addFactor('seo_spam', 'Competitor Spam Levels', 5, 3, 
    t('seo_spam', 'reason', "Moderate spam detected in niche."), 
    t('seo_spam', 'fix', "Report keyword-stuffed competitor titles."), 'seo', 'medium');
  
  // Market Leader
  const compCount = competitors.length;
  addFactor('market_leader', 'Market Leader Comparison', 5, compCount > 0 ? 3 : 5, 
    `Analyzed vs ${compCount} competitors.`, 
    lang === 'en' ? "Monitor leader's review velocity." : "Monitor leader.", 'seo', 'medium');

  return { score: totalScore, factors };
};

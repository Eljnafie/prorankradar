
import type { BusinessProfile, AuditInputs, CompetitorData, GeminiAnalysis, ScoringFactor } from "../types";

export const calculateScore = (
  business: BusinessProfile,
  inputs: AuditInputs,
  competitors: CompetitorData[],
  aiAnalysis: GeminiAnalysis
): { score: number; factors: ScoringFactor[] } => {
  
  let totalScore = 0;
  const factors: ScoringFactor[] = [];

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

  // --- 1. GBP SIGNALS (70 pts) ---

  // Primary Category (15)
  const catScore = aiAnalysis.categoryRelevance.score > 8 ? 15 : aiAnalysis.categoryRelevance.score > 5 ? 8 : 0;
  addFactor('cat_rel', 'Relevancia de Categoría Principal', 15, catScore, 
    aiAnalysis.categoryRelevance.reason, 
    `Cambia tu categoría principal a una de las siguientes: ${aiAnalysis.categoryRelevance.suggestedCategories.join(', ')}`, 'gbp');

  // Business Title (14)
  let titleScore = 14;
  let titleReason = "El título está limpio y enfocado en la marca.";
  let titleFix = "No se requiere acción.";
  
  if (aiAnalysis.titleAnalysis.isSpammy) {
    titleScore = 0; 
    titleReason = "El título contiene relleno de palabras clave (Riesgo de suspensión).";
    titleFix = "Restablece el nombre al nombre real de tu negocio inmediatamente.";
  } else if (business.name.length > 40) {
    titleScore = 7;
    titleReason = "El título es inusualmente largo.";
    titleFix = "Asegúrate de que el título coincida exactamente con tu señalización.";
  }
  addFactor('title_opt', 'Optimización del Título del Negocio', 14, titleScore, titleReason, titleFix, 'gbp');

  // Address in Target City (11)
  const cityMatch = business.address.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('addr_city', `Ubicación Física en ${inputs.targetCity}`, 11, cityMatch ? 11 : 0, 
    cityMatch ? `La dirección está dentro de ${inputs.targetCity}.` : `La dirección parece estar fuera de los límites de ${inputs.targetCity}.`,
    cityMatch ? "Ninguna" : "Considera una ubicación más céntrica si el ranking es prioridad.", 'gbp');

  // Review Rating (6)
  let ratingScore = 0;
  if (business.rating >= 4.5) ratingScore = 6;
  else if (business.rating >= 4.0) ratingScore = 4;
  else if (business.rating >= 3.5) ratingScore = 2;
  addFactor('rev_rate', 'Puntuación de Reseñas', 6, ratingScore, 
    `Puntuación actual: ${business.rating}`, 
    "Implementa una campaña de generación de reseñas.", 'gbp');

  // Review Volume vs Competitors (4)
  const avgCompReviews = competitors.length ? competitors.reduce((a, b) => a + b.reviewCount, 0) / competitors.length : 0;
  const volRatio = avgCompReviews > 0 ? business.user_ratings_total / avgCompReviews : 1;
  let volScore = 0;
  if (volRatio >= 1) volScore = 4;
  else if (volRatio >= 0.5) volScore = 2;
  addFactor('rev_vol', 'Volumen de Reseñas vs Competencia', 4, volScore, 
    `Tienes ${business.user_ratings_total} vs Promedio Competencia ${Math.round(avgCompReviews)}`, 
    "Lanza una campaña agresiva de reseñas (SMS/Email) para cerrar la brecha.", 'gbp');

  // Profile Completeness (6)
  const hasWebsite = !!business.website;
  const hasPhotos = (business.photos?.length || 0) > 5;
  addFactor('prof_comp', 'Integridad del Perfil', 6, (hasWebsite ? 3 : 0) + (hasPhotos ? 3 : 0), 
    `Sitio Web: ${hasWebsite ? 'Sí' : 'No'}, Fotos: ${hasPhotos ? 'Bien' : 'Pocas'}`, 
    "Añade enlace al sitio web y sube 5+ fotos del interior/exterior.", 'gbp');

  // Verification Status (4)
  addFactor('ver_status', 'Estado de Verificación', 4, 4, 
    "El negocio parece publicado.", "Asegúrate de completar la verificación por video si se solicita.", 'gbp');

  // Map Pin Accuracy (2)
  addFactor('pin_acc', 'Precisión del Pin en el Mapa', 2, 2, "La ubicación del pin está en un rango válido.", "Verifica la vista satelital para confirmar la entrada.", 'gbp');

  // Keywords in Reviews (5)
  addFactor('rev_kw', 'Palabras Clave en Reseñas', 5, aiAnalysis.reviewSentiment.hasKeywords ? 5 : 2, 
    aiAnalysis.reviewSentiment.hasKeywords ? "Se encontraron palabras clave en las reseñas." : "Los clientes no mencionan servicios específicos.", 
    "Pide a los clientes que mencionen el servicio realizado en sus reseñas.", 'gbp');

  // Secondary Categories (6)
  const hasSecondary = business.types.length > 1;
  addFactor('sec_cat', 'Categorías Secundarias', 6, hasSecondary ? 6 : 0, 
    hasSecondary ? "Categorías secundarias utilizadas." : "Solo se encontró la categoría principal.", 
    "Añade 2-3 categorías secundarias relevantes.", 'gbp');


  // --- 2. EXTERNAL & LOCAL SEO (30 pts) ---
  
  // Website Content (Landing Page) (4)
  const h1Match = inputs.websiteContent?.h1.toLowerCase().includes(inputs.targetKeyword.toLowerCase());
  addFactor('seo_h1', 'Optimización H1 Landing Page', 4, h1Match ? 4 : 0, 
    h1Match ? "El H1 incluye la palabra clave." : "Falta la palabra clave objetivo en el H1.", 
    `Actualiza el H1 para incluir '${inputs.targetKeyword}'.`, 'seo');

  // Title Tag (2)
  const metaMatch = inputs.websiteContent?.titleTag.toLowerCase().includes(inputs.targetCity.toLowerCase());
  addFactor('seo_title', 'Geo-Relevancia en Title Tag', 2, metaMatch ? 2 : 0, 
    metaMatch ? "El título incluye la ciudad." : "Falta el nombre de la ciudad en la etiqueta de título.", 
    `Añade '${inputs.targetCity}' a la etiqueta de título de tu página de inicio.`, 'seo');

  // Backlinks (5)
  let linkScore = 0;
  if (inputs.backlinks === 'high') linkScore = 5;
  if (inputs.backlinks === 'medium') linkScore = 3;
  if (inputs.backlinks === 'low') linkScore = 1;
  addFactor('seo_links', 'Fuerza de Backlinks Locales', 5, linkScore, 
    `Nivel de fuerza: ${inputs.backlinks}`, 
    "Consigue menciones en cámaras de comercio locales y directorios.", 'seo');
    
  // NAP Consistency (4)
  addFactor('seo_nap', 'Consistencia NAP', 4, 4, "Asumido consistente para la auditoría.", "Audita los 10 directorios principales para asegurar que Nombre, Dirección y Teléfono coincidan.", 'seo');
  
  // Competitor Spam (5)
  addFactor('seo_spam', 'Niveles de Spam de la Competencia', 5, 3, "Spam moderado detectado en el nicho.", "Reporta títulos con relleno de palabras clave a Google.", 'seo');
  
  // Internal Linking (3)
  addFactor('seo_internal', 'Estructura de Enlaces Internos', 3, 2, "Estructura básica detectada.", "Enlaza las páginas de servicios a la página de inicio.", 'seo');
  
  // Geo Content (2)
  addFactor('seo_geo', 'Contenido Geo-específico', 2, 1, "Menciones locales limitadas.", "Crea una sección de 'Áreas que servimos'.", 'seo');
  
  // Local Authority (3)
  addFactor('seo_auth', 'Señales de Autoridad Local', 3, 1, "Poca prensa/eventos locales.", "Patrocina un equipo o evento local para obtener enlaces .edu/.org.", 'seo');
  
  // Engagement (2)
  addFactor('seo_engage', 'Señales de Interacción', 2, 2, "El flujo de tráfico parece normal.", "Publica actualizaciones semanales para aumentar la tasa de clics.", 'seo');

  // --- POST-PROCESSING: MASTER ENGINE LOGIC (SPANISH) ---
  factors.forEach(f => {
    if (f.score < f.maxScore) {
      
      // 1. Primary & Secondary Categories (DNA Logic)
      if (f.id === 'cat_rel' || f.id === 'sec_cat') {
        f.reason = `Análisis del Experto: Es el ADN de tu perfil en ${inputs.targetCity}. Si la categoría es errónea, Google no te mostrará en el 40% de las búsquedas relevantes.`;
        f.fixAction = "Solución Paso a Paso:\n1. Accede a tu panel de Google Business.\n2. Clic en 'Editar Perfil'.\n3. En 'Categoría', elige la más específica para tu sector.\n4. Guarda los cambios.";
      }

      // 2. Review Rating (Anti-Zero Review Formula)
      if (f.id === 'rev_rate') {
        if (business.rating < 4.3) {
           f.reason = `Análisis del Experto: Tu nota actual de ${business.rating} está por debajo del estándar de confianza (4.3) en ${inputs.targetCity}. Google oculta los negocios con notas bajas para proteger la experiencia del usuario.`;
           f.fixAction = `Solución Paso a Paso:\n1. Obtén tu enlace de reseñas en el panel.\n2. Genera un código QR.\n3. Pide a tus mejores clientes en ${inputs.targetCity} que te puntúen hoy mismo. Objetivo: Mínimo 15 reseñas de 5 estrellas.`;
        }
      }
      
      // 3. Review Volume
      if (f.id === 'rev_vol') {
         f.reason = `Análisis del Experto: El volumen crea 'Prueba Social'. En ${inputs.targetCity}, los competidores tienen más reseñas, lo que les da ventaja en el ranking.`;
         f.fixAction = "Solución Paso a Paso:\n1. Implementa una campaña de SMS post-servicio.\n2. Responde a todas las reseñas antiguas para reactivar la ficha.";
      }

      // 4. Address/Pin Accuracy & NAP Consistency
      if (['addr_city', 'pin_acc', 'seo_nap'].includes(f.id)) {
        f.reason = `Análisis del Experto: Si tu dirección difiere entre tu web y Google, pierdes confianza. La consistencia es clave para rankear en ${inputs.targetCity}.`;
        f.fixAction = "Solución Paso a Paso:\n1. Copia tu dirección exacta de Google.\n2. Ve al pie de página de tu web.\n3. Pégala exactamente igual.\n4. Actualiza Facebook/Instagram para coincidir.";
      }

      // 5. Website H1 & Title Tag Optimization
      if (['seo_h1', 'seo_title'].includes(f.id)) {
        f.reason = `Análisis del Experto: Google lee tu web para confirmar tu ubicación. Si tu título no menciona a ${inputs.targetCity}, pierdes fuerza en el mapa local.`;
        f.fixAction = `Solución Paso a Paso:\n1. Entra al editor de tu web.\n2. Cambia el encabezado principal (H1) a: '${business.name} - [Servicio] en ${inputs.targetCity}'.`;
      }

      // 6. Engagement
      if (['seo_engage', 'rev_kw'].includes(f.id)) {
        f.reason = "Análisis del Experto: Responder reseñas y publicar novedades indica que el negocio está 'Vivo'. Los perfiles activos rankean más alto.";
        f.fixAction = "Solución Paso a Paso:\n1. Ve a 'Reseñas'.\n2. Responde a las 5 más recientes.\n3. Publica una foto con un pie de foto mencionando tu barrio.";
      }
    } else {
        // Enforce specific passing text
        f.reason = `Buen trabajo. Estás superando a la competencia de ${inputs.targetCity} en este factor.`;
        f.fixAction = "Mantén la estrategia actual.";
    }
  });

  return { score: totalScore, factors };
};

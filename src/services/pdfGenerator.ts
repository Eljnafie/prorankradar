
import type { AuditReportData, ScoringFactor, AuditLanguage } from "../types";

// Translation dictionary for PDF Labels
const PDF_TRANSLATIONS: Record<AuditLanguage, Record<string, string>> = {
  en: {
    title: "PREMIUM BUSINESS GROWTH AUDIT",
    prepared_for: "Prepared for:",
    exec_summary: "Executive Performance Summary",
    overall: "Overall Score",
    gbp_health: "GBP Health",
    seo_strength: "SEO Strength",
    ranking_forecast: "RANKING POTENTIAL FORECAST",
    geo_grid: "Visual Geo-Grid (Rank Tracking)",
    grid_legend: "Grid Legend:",
    money_zones: "Money Zones (Top 3)",
    lost_revenue: "Lost Revenue (Ranking > 10)",
    your_loc: "Your Location",
    comp_gap: "Competitive Gap Analysis",
    you: "You",
    leader: "Leader",
    review_goal: "REVIEW GOAL:",
    review_goal_sub: "more 5-star reviews to reach a 4.9 rating and stop being filtered out.",
    detailed_audit: "Detailed Technical Audit",
    step_fix: "Step-by-Step Fix:",
    analysis: "Expert Analysis:",
    roi_forecast: "PROJECTED ROI FORECAST"
  },
  es: {
    title: "AUDITORÍA PREMIUM DE CRECIMIENTO",
    prepared_for: "Preparado para:",
    exec_summary: "Resumen Ejecutivo de Rendimiento",
    overall: "Puntuación General",
    gbp_health: "Salud GBP",
    seo_strength: "Fuerza SEO",
    ranking_forecast: "PRONÓSTICO DE CLASIFICACIÓN",
    geo_grid: "Geo-Grid Visual",
    grid_legend: "Leyenda:",
    money_zones: "Zonas de Dinero (Top 3)",
    lost_revenue: "Ingresos Perdidos (> 10)",
    your_loc: "Tu Ubicación",
    comp_gap: "Análisis de Brecha Competitiva",
    you: "Tú",
    leader: "Líder",
    review_goal: "META DE RESEÑAS:",
    review_goal_sub: "más reseñas de 5 estrellas para alcanzar 4.9 y dejar de ser filtrado.",
    detailed_audit: "Auditoría Técnica Detallada",
    step_fix: "Solución Paso a Paso:",
    analysis: "Análisis del Experto:", 
    roi_forecast: "PRONÓSTICO DE ROI"
  },
  fr: {
    title: "AUDIT DE CROISSANCE PREMIUM",
    prepared_for: "Préparé pour:",
    exec_summary: "Résumé Exécutif de Performance",
    overall: "Score Global",
    gbp_health: "Santé GBP",
    seo_strength: "Force SEO",
    ranking_forecast: "PRÉVISIONS DE CLASSEMENT",
    geo_grid: "Géo-Grille Visuelle",
    grid_legend: "Légende:",
    money_zones: "Zones Rentables (Top 3)",
    lost_revenue: "Revenus Perdus (> 10)",
    your_loc: "Votre Emplacement",
    comp_gap: "Analyse de l'Écart Concurrentiel",
    you: "Vous",
    leader: "Leader",
    review_goal: "OBJECTIF AVIS:",
    review_goal_sub: "avis 5 étoiles de plus pour atteindre 4.9.",
    detailed_audit: "Audit Technique Détaillé",
    step_fix: "Correction Étape par Étape:",
    analysis: "Analyse:",
    roi_forecast: "PRÉVISIONS ROI"
  },
  de: {
    title: "PREMIUM WACHSTUMS-AUDIT",
    prepared_for: "Vorbereitet für:",
    exec_summary: "Leistungszusammenfassung",
    overall: "Gesamtpunktzahl",
    gbp_health: "GBP Gesundheit",
    seo_strength: "SEO Stärke",
    ranking_forecast: "RANKING PROGNOSE",
    geo_grid: "Visuelles Geo-Grid",
    grid_legend: "Legende:",
    money_zones: "Geldzonen (Top 3)",
    lost_revenue: "Verlorener Umsatz (> 10)",
    your_loc: "Ihr Standort",
    comp_gap: "Wettbewerbsanalyse",
    you: "Sie",
    leader: "Führer",
    review_goal: "BEWERTUNGSZIEL:",
    review_goal_sub: "mehr 5-Sterne-Bewertungen, um 4.9 zu erreichen.",
    detailed_audit: "Detailliertes Technisches Audit",
    step_fix: "Schritt-für-Schritt Lösung:",
    analysis: "Expertenanalyse:",
    roi_forecast: "ROI PROGNOSE"
  },
  it: {
    title: "AUDIT DI CRESCITA PREMIUM",
    prepared_for: "Preparato per:",
    exec_summary: "Riepilogo Prestazioni",
    overall: "Punteggio",
    gbp_health: "Salute GBP",
    seo_strength: "Forza SEO",
    ranking_forecast: "PREVISIONE RANKING",
    geo_grid: "Geo-Griglia Visiva",
    grid_legend: "Legenda:",
    money_zones: "Zone Redditizie (Top 3)",
    lost_revenue: "Ricavi Persi (> 10)",
    your_loc: "Tua Posizione",
    comp_gap: "Analisi Competitiva",
    you: "Tu",
    leader: "Leader",
    review_goal: "OBIETTIVO RECENSIONI:",
    review_goal_sub: "recensioni a 5 stelle in più per raggiungere 4.9.",
    detailed_audit: "Audit Tecnico Dettagliato",
    step_fix: "Soluzione Passo-Passo:",
    analysis: "Analisi dell'Esperto:",
    roi_forecast: "PREVISIONE ROI"
  },
  pt: {
    title: "AUDITORIA DE CRESCIMENTO PREMIUM",
    prepared_for: "Preparado para:",
    exec_summary: "Resumo Executivo",
    overall: "Pontuação Geral",
    gbp_health: "Saúde GBP",
    seo_strength: "Força SEO",
    ranking_forecast: "PREVISÃO DE RANKING",
    geo_grid: "Geo-Grade Visual",
    grid_legend: "Legenda:",
    money_zones: "Zonas de Lucro (Top 3)",
    lost_revenue: "Receita Perdida (> 10)",
    your_loc: "Sua Localização",
    comp_gap: "Análise Competitiva",
    you: "Você",
    leader: "Líder",
    review_goal: "META DE AVALIAÇÕES:",
    review_goal_sub: "mais avaliações de 5 estrelas para atingir 4.9.",
    detailed_audit: "Auditoria Técnica Detalhada",
    step_fix: "Correção Passo a Passo:",
    analysis: "Análise do Especialista:",
    roi_forecast: "PREVISÃO DE ROI"
  }
};

export const generateAuditPdf = (data: AuditReportData) => {
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();
  
  const lang = data.inputs.language || 'en';
  const t = PDF_TRANSLATIONS[lang] || PDF_TRANSLATIONS['en'];

  let y = 20; // Start Y position
  const leftMargin = 20;
  const rightMargin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const maxLineWidth = pageWidth - (leftMargin + rightMargin);
  const pageHeight = doc.internal.pageSize.height;

  // Colors
  const COLORS = {
    slate900: [30, 41, 59],
    slate600: [71, 85, 105],
    blue600: [37, 99, 235],
    green500: [34, 197, 94],
    yellow500: [234, 179, 8],
    red500: [239, 68, 68],
    white: [255, 255, 255]
  };

  // --- Helper: Check Page Break ---
  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - 20) {
      doc.addPage();
      y = 20;
      addHeader();
    }
  };

  // --- Helper: Add Text with wrapping ---
  const addWrappedText = (text: string, fontSize: number, fontType: string = "normal", color: number[] = COLORS.slate900, indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontType);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxLineWidth - indent);
    const lineHeight = fontSize * 0.5; 

    lines.forEach((line: string) => {
      checkPageBreak(lineHeight + 2);
      doc.text(line, leftMargin + indent, y);
      y += lineHeight + 2;
    });
    y += 2;
  };

  // --- Header Function (Applied to subsequent pages) ---
  const addHeader = () => {
    doc.setFontSize(10);
    doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
    doc.setFont("helvetica", "bold");
    doc.text("ProRankRadar", leftMargin, 10);
    doc.setFont("helvetica", "normal");
    doc.text(t.title, pageWidth - rightMargin - 70, 10);
  };

  // --- 1. COVER / INTRO ---
  // Background Header Block
  doc.setFillColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ProRankRadar", leftMargin, 15);

  // Document Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(t.title.split(' ')[0] + ' ' + t.title.split(' ')[1], leftMargin, 28);
  doc.text(t.title.split(' ').slice(2).join(' '), leftMargin, 38);
  
  // Client Details
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`${t.prepared_for} ${data.business.name}`, leftMargin, 65);
  
  // Extract Zip/Neighborhood from address
  const addressParts = data.business.address.split(',');
  const cityZip = addressParts.slice(Math.max(0, addressParts.length - 2)).join(',').trim();
  
  doc.setFontSize(11);
  doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(`${cityZip || data.inputs.targetCity} | ${new Date().toLocaleDateString()}`, leftMargin, 72);

  y = 90;

  // --- 2. EXECUTIVE VISUALS ---
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(t.exec_summary, leftMargin, y);
  y += 20;

  // Draw Circles for Scores
  const drawScoreCircle = (label: string, score: number, xPos: number) => {
    const radius = 15;
    const color = score >= 80 ? COLORS.green500 : score >= 50 ? COLORS.yellow500 : COLORS.red500;
    
    // Ring
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(2);
    doc.circle(xPos, y + radius, radius);
    
    // Text
    doc.setFontSize(16);
    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`${score}`, xPos, y + radius + 2, { align: "center" });
    
    // Label
    doc.setFontSize(9);
    doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
    doc.setFont("helvetica", "bold");
    doc.text(label, xPos, y + radius * 2 + 8, { align: "center" });
  };

  // --- SCORE CALCULATION ALIGNMENT ---
  // To match Web UI exactly:
  // "GBP Health" = Section 1 only (Core Signals)
  // "SEO Strength" = Section 3 only (Website & Local SEO)
  const gbpSectionFactors = data.factors.filter(f => 
    ['cat_rel', 'title_opt', 'addr_prox', 'prof_comp', 'ver_status', 'pin_acc', 'sec_cat'].includes(f.id)
  );
  const seoSectionFactors = data.factors.filter(f => 
    ['seo_h1', 'seo_title', 'seo_links', 'seo_nap', 'seo_int', 'seo_geo', 'seo_auth'].includes(f.id)
  );

  const gbpSectionScore = gbpSectionFactors.reduce((acc, f) => acc + f.score, 0); 
  const gbpSectionMax = gbpSectionFactors.reduce((acc, f) => acc + f.maxScore, 0);
  const seoSectionScore = seoSectionFactors.reduce((acc, f) => acc + f.score, 0); 
  const seoSectionMax = seoSectionFactors.reduce((acc, f) => acc + f.maxScore, 0);

  const gbpPercent = Math.round((gbpSectionScore / (gbpSectionMax || 1)) * 100);
  const seoPercent = Math.round((seoSectionScore / (seoSectionMax || 1)) * 100);

  // Position circles nicely
  drawScoreCircle(t.overall, data.overallScore, leftMargin + 30);
  drawScoreCircle(t.gbp_health, gbpPercent, leftMargin + 85);
  drawScoreCircle(t.seo_strength, seoPercent, leftMargin + 140);

  y += 55;

  // Ranking Potential Forecast Box (Blue Box from screenshot)
  doc.setFillColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
  doc.rect(leftMargin, y, maxLineWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(t.ranking_forecast, leftMargin + 5, y + 8);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  // Use the short ranking potential string
  const potentialText = data.geminiAnalysis.fixPlan.rankingPotential || "Fixing critical issues can push this profile to the Top 5.";
  doc.text(potentialText, leftMargin + 5, y + 16);
  
  y += 40;

  // --- 3. VISUAL GEO-GRID ---
  checkPageBreak(80);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(t.geo_grid, leftMargin, y);
  y += 15;

  // Draw 7x7 Grid
  const gridSize = 7;
  const circleSize = 3;
  const gap = 8;
  const startX = leftMargin + 15;
  
  for(let row=0; row<gridSize; row++) {
    for(let col=0; col<gridSize; col++) {
      const cx = startX + (col * gap);
      const cy = y + (row * gap);
      
      const isCenter = row === 3 && col === 3;
      const dist = Math.abs(row - 3) + Math.abs(col - 3);
      
      let color = COLORS.red500;
      // Grid logic based on overall score
      const greenRadius = data.overallScore > 80 ? 3 : data.overallScore > 60 ? 2 : 1;
      const yellowRadius = greenRadius + 1;

      if (isCenter) color = COLORS.blue600; 
      else if (dist <= greenRadius) color = COLORS.green500;
      else if (dist <= yellowRadius) color = COLORS.yellow500;
      
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(cx, cy, circleSize, 'F');

      // Add 'You' label to center
      if (isCenter) {
         doc.setTextColor(255, 255, 255);
         doc.setFontSize(4);
         doc.text("YOU", cx, cy+0.5, {align:'center'});
      }
    }
  }

  // Grid Legend/Context
  const legendX = startX + (gridSize * gap) + 20;
  doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.setFontSize(10);
  doc.text(t.grid_legend, legendX, y + 10);
  
  // Legend Dots
  doc.setFillColor(COLORS.green500[0], COLORS.green500[1], COLORS.green500[2]);
  doc.circle(legendX + 2, y + 18, 2, 'F');
  doc.text(t.money_zones, legendX + 6, y + 20);

  doc.setFillColor(COLORS.red500[0], COLORS.red500[1], COLORS.red500[2]);
  doc.circle(legendX + 2, y + 28, 2, 'F');
  doc.text(t.lost_revenue, legendX + 6, y + 30);

  doc.setFillColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
  doc.circle(legendX + 2, y + 38, 2, 'F');
  doc.text(t.your_loc, legendX + 6, y + 40);

  y += (gridSize * gap) + 15;

  // --- 4. COMPETITIVE GAP ---
  checkPageBreak(60);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(t.comp_gap, leftMargin, y);
  y += 10;

  // Simple Bar Chart
  const clientRating = data.business.rating;
  const competitorRating = data.competitors.length > 0 
    ? Math.max(...data.competitors.map(c => c.rating)) 
    : 4.8;

  const maxBarWidth = 100;
  
  // You
  doc.setFontSize(11);
  doc.text(t.you, leftMargin, y + 10);
  doc.setFillColor(COLORS.yellow500[0], COLORS.yellow500[1], COLORS.yellow500[2]);
  doc.rect(leftMargin + 30, y + 2, (clientRating / 5) * maxBarWidth, 8, 'F'); 
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(clientRating.toString(), leftMargin + 30 + ((clientRating / 5) * maxBarWidth) + 5, y + 8);

  // Market Leader
  doc.text(t.leader, leftMargin, y + 25);
  doc.setFillColor(COLORS.green500[0], COLORS.green500[1], COLORS.green500[2]);
  doc.rect(leftMargin + 30, y + 17, (competitorRating / 5) * maxBarWidth, 8, 'F');
  doc.text(competitorRating.toString(), leftMargin + 30 + ((competitorRating / 5) * maxBarWidth) + 5, y + 23);

  y += 40;

  // Review Goal Text
  // Calculate review goal based on ratings gap
  let reviewsNeeded = 0;
  if (clientRating < competitorRating) {
      const currentReviews = data.business.user_ratings_total || 1;
      const safeTarget = Math.min(competitorRating, 4.9);
      // X = N * (Target - Current) / (5 - Target)
      reviewsNeeded = Math.ceil((currentReviews * (safeTarget - clientRating)) / (5 - safeTarget));
      if (reviewsNeeded < 5) reviewsNeeded = 5;
      if (reviewsNeeded > 1000) reviewsNeeded = 999;
  }
  
  doc.setFontSize(11);
  doc.setTextColor(COLORS.red500[0], COLORS.red500[1], COLORS.red500[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`${t.review_goal} ${reviewsNeeded} ${t.review_goal_sub}`, leftMargin, y);
  y += 15;

  // --- 5. DETAILED TECHNICAL AUDIT ---
  doc.addPage(); // Force new page
  y = 20;
  addHeader();
  y += 15;

  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(t.detailed_audit, leftMargin, y);
  y += 15;

  // Helper for rows
  const addAuditRow = (factor: ScoringFactor) => {
    checkPageBreak(45);
    
    // Status Badge
    let statusText = "[PASS]";
    let statusColor = COLORS.green500;
    
    if (factor.status === 'warning') { statusText = "[WARN]"; statusColor = COLORS.yellow500; }
    if (factor.status === 'critical') { statusText = "[FAIL]"; statusColor = COLORS.red500; }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, leftMargin, y);

    // Title
    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.text(factor.name, leftMargin + 15, y);

    y += 6;

    // Analysis
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.text(t.analysis, leftMargin, y);
    addWrappedText(factor.reason, 10, "normal", COLORS.slate600, 0); // starts below title
    
    // Fix (Only for Warn/Fail)
    if (factor.status !== 'good') {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
        doc.text(t.step_fix, leftMargin, y);
        y += 5;
        // Fix instructions in plain color
        addWrappedText(factor.fixAction, 10, "normal", COLORS.slate900);
    }
    
    y += 4; // Spacing
  };

  // Grouped Rendering matching exactly the Web UI Sections
  const groups = {
    "1. Google Business Profile Core Signals": data.factors.filter(f => 
      ['cat_rel', 'title_opt', 'addr_prox', 'prof_comp', 'ver_status', 'pin_acc', 'sec_cat'].includes(f.id)),
    
    "2. Reputation & Engagement": data.factors.filter(f => 
      ['rev_rate', 'rev_vol', 'rev_kw'].includes(f.id)),
    
    "3. Website & Local SEO": data.factors.filter(f => 
      ['seo_h1', 'seo_title', 'seo_links', 'seo_nap', 'seo_int', 'seo_geo', 'seo_auth'].includes(f.id)),
    
    "4. Competitive Environment": data.factors.filter(f => 
      ['seo_eng', 'comp_spam'].includes(f.id))
  };

  Object.entries(groups).forEach(([groupTitle, factors]) => {
     if (factors.length === 0) return;
     checkPageBreak(25);
     
     // Section Header Bar
     doc.setFillColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
     doc.rect(leftMargin, y, maxLineWidth, 8, 'F');
     doc.setTextColor(255, 255, 255);
     doc.setFontSize(11);
     doc.setFont("helvetica", "bold");
     doc.text(groupTitle, leftMargin + 2, y + 5.5);
     y += 15;

     factors.forEach(addAuditRow);
     y += 5;
  });

  // --- 6. ROI FORECAST ---
  checkPageBreak(40);
  doc.setDrawColor(COLORS.green500[0], COLORS.green500[1], COLORS.green500[2]);
  doc.setLineWidth(1);
  doc.rect(leftMargin, y, maxLineWidth, 30);
  
  doc.setTextColor(COLORS.green500[0], COLORS.green500[1], COLORS.green500[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t.roi_forecast, leftMargin + 5, y + 10);
  
  // Use the dynamic ROI forecast string from Gemini
  const roiText = data.geminiAnalysis.roiForecast || "Resolving these gaps typically results in a 25% to 50% increase in calls.";
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(11);
  
  const splitRoi = doc.splitTextToSize(roiText, maxLineWidth - 10);
  doc.text(splitRoi, leftMargin + 5, y + 18);

  // Footer Numbers
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`ProRankRadar Audit | Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  doc.save(`${data.business.name.replace(/\s+/g, '_')}_audit.pdf`);
};

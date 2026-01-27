
import type { AuditReportData, ScoringFactor, AuditLanguage } from "../types";

// Translation dictionary for PDF Labels
const PDF_TRANSLATIONS: Record<AuditLanguage, Record<string, string>> = {
  en: {
    title: "PREMIUM BUSINESS GROWTH AUDIT",
    prepared_for: "Prepared for:",
    exec_summary: "Executive Performance Summary",
    overall: "Overall Score",
    gbp_health: "Trust Health",
    seo_strength: "Comm. Engine",
    ranking_forecast: "90-DAY SUCCESS ROADMAP",
    geo_grid: "Visual Geo-Grid (Rank Tracking)",
    grid_legend: "Grid Legend:",
    money_zones: "Money Zones (Top 3)",
    lost_revenue: "Lost Revenue (Ranking > 10)",
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
    exec_summary: "Resumen Ejecutivo",
    overall: "Puntuación General",
    gbp_health: "Salud de Confianza",
    seo_strength: "Motor Comercial",
    ranking_forecast: "HOJA DE RUTA DE 90 DÍAS",
    geo_grid: "Geo-Grid Visual",
    grid_legend: "Leyenda:",
    money_zones: "Zonas de Dinero (Top 3)",
    lost_revenue: "Ingresos Perdidos (> 10)",
    comp_gap: "Análisis Competitivo",
    you: "Tú",
    leader: "Líder",
    review_goal: "META DE RESEÑAS:",
    review_goal_sub: "más reseñas de 5 estrellas para alcanzar 4.9.",
    detailed_audit: "Auditoría Técnica Detallada",
    step_fix: "Solución:",
    analysis: "Análisis:", 
    roi_forecast: "PRONÓSTICO DE ROI"
  },
  fr: { title: "AUDIT DE CROISSANCE PREMIUM", prepared_for: "Préparé pour:", exec_summary: "Résumé Exécutif", overall: "Score Global", gbp_health: "Santé Confiance", seo_strength: "Moteur Comm.", ranking_forecast: "FEUILLE DE ROUTE 90 JOURS", geo_grid: "Géo-Grille Visuelle", grid_legend: "Légende:", money_zones: "Zones Rentables (Top 3)", lost_revenue: "Revenus Perdus (> 10)", comp_gap: "Écart Concurrentiel", you: "Vous", leader: "Leader", review_goal: "OBJECTIF AVIS:", review_goal_sub: "avis 5 étoiles de plus.", detailed_audit: "Audit Technique", step_fix: "Correction:", analysis: "Analyse:", roi_forecast: "PRÉVISIONS ROI" },
  de: { title: "PREMIUM WACHSTUMS-AUDIT", prepared_for: "Vorbereitet für:", exec_summary: "Zusammenfassung", overall: "Gesamt", gbp_health: "Vertrauensbasis", seo_strength: "Kommerziell", ranking_forecast: "90-TAGE PLAN", geo_grid: "Visuelles Geo-Grid", grid_legend: "Legende:", money_zones: "Geldzonen (Top 3)", lost_revenue: "Verlust (> 10)", comp_gap: "Wettbewerb", you: "Sie", leader: "Führer", review_goal: "ZIEL:", review_goal_sub: "mehr 5-Sterne Bewertungen.", detailed_audit: "Technisches Audit", step_fix: "Lösung:", analysis: "Analyse:", roi_forecast: "ROI PROGNOSE" },
  it: { title: "AUDIT PREMIUM", prepared_for: "Per:", exec_summary: "Riepilogo", overall: "Punteggio", gbp_health: "Salute Fiducia", seo_strength: "Motore Comm.", ranking_forecast: "PIANO 90 GIORNI", geo_grid: "Geo-Griglia", grid_legend: "Legenda:", money_zones: "Zone Top 3", lost_revenue: "Perdite (> 10)", comp_gap: "Gap Competitivo", you: "Tu", leader: "Leader", review_goal: "OBIETTIVO:", review_goal_sub: "recensioni 5 stelle in più.", detailed_audit: "Audit Dettagliato", step_fix: "Soluzione:", analysis: "Analisi:", roi_forecast: "PREVISIONE ROI" },
  pt: { title: "AUDITORIA PREMIUM", prepared_for: "Para:", exec_summary: "Resumo Executivo", overall: "Geral", gbp_health: "Saúde Confiança", seo_strength: "Motor Coml.", ranking_forecast: "ROTEIRO 90 DIAS", geo_grid: "Geo-Grade", grid_legend: "Legenda:", money_zones: "Zonas Lucro", lost_revenue: "Perda (> 10)", comp_gap: "Competição", you: "Você", leader: "Líder", review_goal: "META:", review_goal_sub: "mais avaliações.", detailed_audit: "Auditoria Técnica", step_fix: "Correção:", analysis: "Análise:", roi_forecast: "PREVISÃO ROI" }
};

export const generateAuditPdf = (data: AuditReportData) => {
  const { jsPDF } = (window as any).jspdf || (window as any).jsPDF;
  if (!jsPDF) {
    console.error("jsPDF library not loaded");
    alert("PDF generation failed. Library not loaded.");
    return;
  }
  const doc = new jsPDF();
  
  const lang = data.inputs.language || 'en';
  const t = PDF_TRANSLATIONS[lang] || PDF_TRANSLATIONS['en'];

  let y = 20; 
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

  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - 20) {
      doc.addPage();
      y = 20;
      addHeader();
    }
  };

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
  };

  const addHeader = () => {
    doc.setFontSize(10);
    doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
    doc.setFont("helvetica", "bold");
    doc.text("ProRankRadar", leftMargin, 10);
    doc.setFont("helvetica", "normal");
    doc.text(t.title, pageWidth - rightMargin - 70, 10);
  };

  // --- 1. COVER ---
  doc.setFillColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10); doc.text("ProRankRadar", leftMargin, 15);
  doc.setFontSize(24); doc.setFont("helvetica", "bold");
  doc.text(t.title, leftMargin, 35);
  
  doc.setFontSize(14); doc.setFont("helvetica", "normal");
  doc.text(`${t.prepared_for} ${data.business.name}`, leftMargin, 65);
  doc.setFontSize(11); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(`${data.inputs.targetCity} | ${new Date().toLocaleDateString()}`, leftMargin, 72);

  y = 90;

  // --- 2. EXECUTIVE VISUALS ---
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.exec_summary, leftMargin, y);
  y += 10;

  if (data.geminiAnalysis.executiveSummary) {
    addWrappedText(data.geminiAnalysis.executiveSummary, 10, "normal", COLORS.slate600);
    y += 10;
  }

  // Draw Circles
  const drawScoreCircle = (label: string, score: number, xPos: number) => {
    const radius = 15;
    const color = score >= 80 ? COLORS.green500 : score >= 50 ? COLORS.yellow500 : COLORS.red500;
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(2);
    doc.circle(xPos, y + radius, radius);
    doc.setFontSize(16); doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.text(`${score}`, xPos, y + radius + 2, { align: "center" });
    doc.setFontSize(9); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
    doc.text(label, xPos, y + radius * 2 + 8, { align: "center" });
  };

  const trustScore = data.geminiAnalysis.commercialStatus.trustHealthScore || 0;
  const engineScore = data.geminiAnalysis.commercialStatus.isGhostProfile ? 0 : 85; 

  drawScoreCircle(t.overall, data.overallScore, leftMargin + 30);
  drawScoreCircle(t.gbp_health, trustScore, leftMargin + 85);
  drawScoreCircle(t.seo_strength, engineScore, leftMargin + 140);

  y += 55;

  // 90-Day Roadmap Box
  checkPageBreak(60);
  doc.setFillColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
  doc.rect(leftMargin, y, maxLineWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text(t.ranking_forecast, leftMargin + 2, y + 6);
  y += 15;

  const phases = [data.geminiAnalysis.roadmap.phase1, data.geminiAnalysis.roadmap.phase2, data.geminiAnalysis.roadmap.phase3];
  phases.forEach((phase, i) => {
      checkPageBreak(25);
      doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
      doc.setFontSize(10); doc.setFont("helvetica", "bold");
      doc.text(`Phase ${i+1}: ${phase.title}`, leftMargin, y);
      y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      phase.steps.forEach(step => {
          doc.text(`• ${step}`, leftMargin + 5, y);
          y += 4;
      });
      y += 4;
  });

  y += 10;

  // --- 3. VISUAL GEO-GRID ---
  checkPageBreak(80);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.geo_grid, leftMargin, y);
  y += 15;

  const gridSize = 7;
  const circleSize = 3;
  const gap = 8;
  const startX = leftMargin + 15;
  for(let row=0; row<gridSize; row++) {
    for(let col=0; col<gridSize; col++) {
      const cx = startX + (col * gap); const cy = y + (row * gap);
      const isCenter = row === 3 && col === 3;
      const dist = Math.abs(row - 3) + Math.abs(col - 3);
      let color = COLORS.red500;
      const greenRadius = data.overallScore > 80 ? 3 : data.overallScore > 60 ? 2 : 1;
      if (isCenter) color = COLORS.blue600; else if (dist <= greenRadius) color = COLORS.green500; else if (dist <= greenRadius+1) color = COLORS.yellow500;
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(cx, cy, circleSize, 'F');
    }
  }
  y += (gridSize * gap) + 15;

  // --- 4. COMPETITIVE GAP ---
  checkPageBreak(60);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.comp_gap, leftMargin, y);
  y += 10;

  const clientRating = data.business.rating;
  const leaderRating = 4.9;
  const reviewsNeeded = data.geminiAnalysis.sentimentAnalysis.reviewsNeeded;

  doc.setFontSize(11);
  doc.text(t.you + `: ${clientRating}`, leftMargin, y + 10);
  doc.setFillColor(COLORS.yellow500[0], COLORS.yellow500[1], COLORS.yellow500[2]);
  doc.rect(leftMargin + 30, y + 2, (clientRating / 5) * 100, 8, 'F');

  doc.text(t.leader + `: ${leaderRating}`, leftMargin, y + 25);
  doc.setFillColor(COLORS.green500[0], COLORS.green500[1], COLORS.green500[2]);
  doc.rect(leftMargin + 30, y + 17, (leaderRating / 5) * 100, 8, 'F');

  y += 40;
  doc.setFontSize(11); doc.setTextColor(COLORS.red500[0], COLORS.red500[1], COLORS.red500[2]); doc.setFont("helvetica", "bold");
  doc.text(`${t.review_goal} ${reviewsNeeded} ${t.review_goal_sub}`, leftMargin, y);
  y += 15;

  // --- 5. DETAILED AUDIT ---
  doc.addPage(); y = 20; addHeader(); y += 15;
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text(t.detailed_audit, leftMargin, y); y += 15;

  const addAuditRow = (factor: ScoringFactor) => {
    checkPageBreak(50);
    let statusText = "[PASS]"; let statusColor = COLORS.green500;
    if (factor.status === 'warning') { statusText = "[WARN]"; statusColor = COLORS.yellow500; }
    if (factor.status === 'critical') { statusText = "[FAIL]"; statusColor = COLORS.red500; }
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, leftMargin, y);
    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.text(factor.name, leftMargin + 15, y);
    y += 6;
    doc.setFont("helvetica", "bold"); doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.text(t.analysis, leftMargin, y); y += 5;
    addWrappedText(factor.reason, 10, "normal", COLORS.slate600, 0); y += 4;
    if (factor.status !== 'good') {
        doc.setFont("helvetica", "bold"); doc.setTextColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
        doc.text(t.step_fix, leftMargin, y); y += 5;
        addWrappedText(factor.fixAction, 10, "normal", COLORS.slate900); y += 4;
    }
    y += 4;
  };

  const groups = {
    "1. Trust & Technical": data.factors.filter(f => f.category === 'trust'),
    "2. Commercial Engine": data.factors.filter(f => f.category === 'gbp'),
    "3. Conversion": data.factors.filter(f => f.category === 'conversion'),
    "4. Local SEO": data.factors.filter(f => f.category === 'seo')
  };

  Object.entries(groups).forEach(([groupTitle, factors]) => {
     if (factors.length === 0) return;
     checkPageBreak(30);
     doc.setFillColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
     doc.rect(leftMargin, y, maxLineWidth, 8, 'F');
     doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont("helvetica", "bold");
     doc.text(groupTitle, leftMargin + 2, y + 5.5); y += 15;
     factors.forEach(addAuditRow); y += 5;
  });

  doc.save(`${data.business.name.replace(/\s+/g, '_')}_audit.pdf`);
};


import type { AuditReportData, ScoringFactor, AuditLanguage } from "../types";

// Translation dictionary for PDF Labels
const PDF_TRANSLATIONS: Record<AuditLanguage, Record<string, string>> = {
  en: {
    title: "MASTER VISIBILITY AUDIT",
    prepared_for: "Prepared for:",
    exec_summary: "Executive Visibility Summary",
    lvc_score: "Local Visibility Coverage (LVC)",
    roadmap_title: "90-DAY ACTION ROADMAP",
    geo_grid: "Geo-Grid Analysis",
    grid_legend: "Grid Legend:",
    money_zones: "Prime Zone (Top 3)",
    lost_revenue: "Invisible Zone (10+)",
    trust_gap: "Trust Gap Analysis",
    reviews_needed: "Reviews Needed",
    immediate: "Phase 1: Immediate (0-7 Days)",
    short_term: "Phase 2: Short Term (14-30 Days)",
    growth: "Phase 3: Growth (30-90 Days)",
    detailed_audit: "Detailed Compliance Audit"
  },
  es: {
    title: "AUDITORÍA MAESTRA DE VISIBILIDAD",
    prepared_for: "Preparado para:",
    exec_summary: "Resumen Ejecutivo",
    lvc_score: "Cobertura de Visibilidad Local",
    roadmap_title: "HOJA DE RUTA 90 DÍAS",
    geo_grid: "Análisis Geo-Grid",
    grid_legend: "Leyenda:",
    money_zones: "Zona Prime",
    lost_revenue: "Zona Invisible",
    trust_gap: "Brecha de Confianza",
    reviews_needed: "Reseñas Necesarias",
    immediate: "Fase 1: Inmediato (0-7 Días)",
    short_term: "Fase 2: Corto Plazo (14-30 Días)",
    growth: "Fase 3: Crecimiento (30-90 Días)",
    detailed_audit: "Auditoría Detallada"
  },
  fr: { title: "AUDIT DE VISIBILITÉ MASTER", prepared_for: "Pour:", exec_summary: "Résumé Exécutif", lvc_score: "Score de Visibilité", roadmap_title: "FEUILLE DE ROUTE", geo_grid: "Analyse Géo-Grille", grid_legend: "Légende:", money_zones: "Zone Prime", lost_revenue: "Zone Invisible", trust_gap: "Écart de Confiance", reviews_needed: "Avis Requis", immediate: "Phase 1: Immédiat", short_term: "Phase 2: Court Terme", growth: "Phase 3: Croissance", detailed_audit: "Audit Détaillé" },
  de: { title: "MASTER SICHTBARKEITSAUDIT", prepared_for: "Für:", exec_summary: "Zusammenfassung", lvc_score: "Sichtbarkeitsindex", roadmap_title: "90-TAGE PLAN", geo_grid: "Geo-Grid Analyse", grid_legend: "Legende:", money_zones: "Prime Zone", lost_revenue: "Unsichtbar", trust_gap: "Vertrauenslücke", reviews_needed: "Benötigte Bewertungen", immediate: "Phase 1: Sofort", short_term: "Phase 2: Kurzfristig", growth: "Phase 3: Wachstum", detailed_audit: "Detailaudit" },
  it: { title: "AUDIT MASTER VISIBILITÀ", prepared_for: "Per:", exec_summary: "Riepilogo", lvc_score: "Punteggio Visibilità", roadmap_title: "PIANO D'AZIONE", geo_grid: "Analisi Geo-Grid", grid_legend: "Legenda:", money_zones: "Zona Prime", lost_revenue: "Zona Invisibile", trust_gap: "Gap Fiducia", reviews_needed: "Recensioni Necessarie", immediate: "Fase 1: Immediato", short_term: "Fase 2: Breve Termine", growth: "Fase 3: Crescita", detailed_audit: "Audit Dettagliato" },
  pt: { title: "AUDITORIA MESTRA DE VISIBILIDADE", prepared_for: "Para:", exec_summary: "Resumo Executivo", lvc_score: "Pontuação Visibilidade", roadmap_title: "ROTEIRO DE AÇÃO", geo_grid: "Análise Geo-Grid", grid_legend: "Legenda:", money_zones: "Zona Prime", lost_revenue: "Zona Invisível", trust_gap: "Lacuna de Confiança", reviews_needed: "Avaliações Necessárias", immediate: "Fase 1: Imediato", short_term: "Fase 2: Curto Prazo", growth: "Fase 3: Crescimento", detailed_audit: "Auditoria Detalhada" }
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

  // --- 1. COVER PAGE ---
  doc.setFillColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10); doc.text("ProRankRadar Intelligence", leftMargin, 15);
  doc.setFontSize(22); doc.setFont("helvetica", "bold");
  doc.text(t.title, leftMargin, 35);
  
  doc.setFontSize(14); doc.setFont("helvetica", "normal");
  doc.text(`${t.prepared_for} ${data.business.name}`, leftMargin, 65);
  doc.setFontSize(11); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(`${data.inputs.targetCity} | ${new Date().toLocaleDateString()}`, leftMargin, 72);

  y = 90;

  // --- 2. EXECUTIVE SUMMARY & LVC SCORE ---
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.exec_summary, leftMargin, y);
  y += 10;

  if (data.geminiAnalysis.executiveSummary) {
    addWrappedText(data.geminiAnalysis.executiveSummary, 10, "normal", COLORS.slate600);
    y += 10;
  }

  // Draw LVC Score Circle
  const score = data.geminiAnalysis.visibility.score;
  const scoreColor = score >= 70 ? COLORS.green500 : score >= 40 ? COLORS.yellow500 : COLORS.red500;
  
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(3);
  doc.circle(pageWidth - 40, y + 10, 15);
  doc.setFontSize(16); doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(`${score}`, pageWidth - 40, y + 12, { align: "center" });
  doc.setFontSize(9); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(t.lvc_score, pageWidth - 40, y + 32, { align: "center" });

  y += 45;

  // --- 3. 3-PHASE ROADMAP ---
  checkPageBreak(80);
  doc.setFillColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
  doc.rect(leftMargin, y, maxLineWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.text(t.roadmap_title, leftMargin + 2, y + 6);
  y += 15;

  const phases = [
    { title: t.immediate, steps: data.geminiAnalysis.roadmap.immediate },
    { title: t.short_term, steps: data.geminiAnalysis.roadmap.shortTerm },
    { title: t.growth, steps: data.geminiAnalysis.roadmap.growth }
  ];

  phases.forEach((phase) => {
      checkPageBreak(30);
      doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
      doc.setFontSize(10); doc.setFont("helvetica", "bold");
      doc.text(phase.title, leftMargin, y);
      y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      phase.steps.forEach(step => {
          doc.text(`• ${step}`, leftMargin + 5, y);
          y += 4;
      });
      y += 6;
  });

  y += 5;

  // --- 4. VISUAL GEO-GRID ---
  checkPageBreak(80);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.geo_grid, leftMargin, y);
  y += 15;

  const gridSize = 7;
  const circleSize = 3;
  const gap = 8;
  const startX = leftMargin + 15;
  
  // Render simulated grid
  for(let row=0; row<gridSize; row++) {
    for(let col=0; col<gridSize; col++) {
      const cx = startX + (col * gap); 
      const cy = y + (row * gap);
      const isCenter = row === 3 && col === 3;
      const dist = Math.abs(row - 3) + Math.abs(col - 3);
      
      let color = COLORS.red500;
      // Simulate ranking decay based on score
      const greenRadius = score > 80 ? 3 : score > 50 ? 2 : 1;
      
      if (isCenter) color = COLORS.blue600; 
      else if (dist <= greenRadius) color = COLORS.green500; 
      else if (dist <= greenRadius+1) color = COLORS.yellow500;
      
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(cx, cy, circleSize, 'F');
    }
  }
  y += (gridSize * gap) + 15;

  // --- 5. DETAILED AUDIT FACTORS ---
  doc.addPage(); y = 20; addHeader(); y += 15;
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text(t.detailed_audit, leftMargin, y); y += 15;

  const addAuditRow = (factor: ScoringFactor) => {
    checkPageBreak(40);
    let statusText = "[PASS]"; let statusColor = COLORS.green500;
    if (factor.status === 'warning') { statusText = "[WARN]"; statusColor = COLORS.yellow500; }
    if (factor.status === 'critical') { statusText = "[FAIL]"; statusColor = COLORS.red500; }
    
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, leftMargin, y);
    
    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.text(factor.name, leftMargin + 15, y);
    y += 6;
    
    // Analysis
    doc.setFont("helvetica", "normal"); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
    addWrappedText(factor.reason, 9, "normal", COLORS.slate600, 5); y += 2;
    
    // Action if needed
    if (factor.status !== 'good') {
        doc.setFont("helvetica", "bold"); doc.setTextColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
        doc.text("Fix:", leftMargin + 5, y);
        addWrappedText(factor.fixAction, 9, "normal", COLORS.slate900, 15); y += 4;
    }
    y += 6;
  };

  const groups = {
    "Compliance & Safety": data.factors.filter(f => f.category === 'compliance'),
    "Trust & Reputation": data.factors.filter(f => f.category === 'trust'),
    "Engagement": data.factors.filter(f => f.category === 'engagement'),
    "SEO & Authority": data.factors.filter(f => f.category === 'seo')
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

  doc.save(`${data.business.name.replace(/\s+/g, '_')}_MasterAudit.pdf`);
};

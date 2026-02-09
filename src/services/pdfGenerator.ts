
import type { AuditReportData, AuditLanguage } from "../types";

const PDF_TRANSLATIONS: Record<AuditLanguage, Record<string, string>> = {
  en: { title: "AUDIT MASTER REPORT", subtitle: "CONFIDENCE INTELLIGENCE SYSTEM v6", kpi_section: "EXECUTIVE KPIs", gaps: "REALITY MIRROR (GAP ANALYSIS)", roadmap: "PRIORITIZED ACTION ROADMAP", signals: "TECHNICAL AUDIT SIGNALS", content: "CONTENT & ENGAGEMENT", grid: "GEO-DOMINANCE GRID", notes: "CONFIDENTIAL / STRATEGIC USE ONLY" },
  es: { title: "REPORTE DE AUDITORÍA", subtitle: "SISTEMA DE INTELIGENCIA v6", kpi_section: "KPIs EJECUTIVOS", gaps: "ANÁLISIS DE BRECHAS", roadmap: "HOJA DE RUTA", signals: "SEÑALES TÉCNICAS", content: "CONTENIDO Y COMPROMISO", grid: "RED DE GEO-DOMINANCIA", notes: "CONFIDENCIAL" },
  fr: { title: "RAPPORT D'AUDIT", subtitle: "SYSTÈME D'INTELLIGENCE v6", kpi_section: "KPIs", gaps: "ANALYSE DES ÉCARTS", roadmap: "FEUILLE DE ROUTE", signals: "SIGNAUX TECHNIQUES", content: "CONTENU ET ENGAGEMENT", grid: "GRILLE DE GÉO-DOMINATION", notes: "CONFIDENTIEL" },
  de: { title: "AUDIT-BERICHT", subtitle: "INTELLIGENZSYSTEM v6", kpi_section: "KPIs", gaps: "LÜCKENANALYSE", roadmap: "AKTIONSPLAN", signals: "TECHNISCHE SIGNALE", content: "INHALT UND ENGAGEMENT", grid: "GEO-DOMINANZ-RASTER", notes: "VERTRAULICH" },
  it: { title: "RAPPORTO DI AUDIT", subtitle: "SISTEMA DI INTELLIGENZA v6", kpi_section: "KPIs", gaps: "ANALISI DEI GAP", roadmap: "TABELLA DI MARCIA", signals: "SEGNALI TECNICI", content: "CONTENUTO E COINVOLGIMENTO", grid: "GRIGLIA DI GEO-DOMINIO", notes: "RISERVATO" },
  pt: { title: "RELATÓRIO DE AUDITORIA", subtitle: "SISTEMA DE INTELIGÊNCIA v6", kpi_section: "KPIs", gaps: "ANÁLISIS DE LACUNAS", roadmap: "ROTEIRO DE AÇÃO", signals: "SINAIS TÉCNICOS", content: "CONTEÚDO E ENGAJAMENTO", grid: "GRADE DE GEO-DOMÍNIO", notes: "CONFIDENCIAL" }
};

export const generateAuditPdf = (data: AuditReportData) => {
  // Safe Library Access
  const w = window as any;
  const lib = w.jspdf || w.jsPDF;
  
  if (!lib) {
    alert("PDF Generator is initializing... please wait 2 seconds and try again.");
    return;
  }

  // Handle different library versions (UMD vs Global)
  const jsPDF = lib.jsPDF ? lib.jsPDF : lib;
  const doc = new jsPDF();
  
  const lang = data.inputs.language || 'en';
  const t = PDF_TRANSLATIONS[lang] || PDF_TRANSLATIONS['en'];
  const analysis = data.geminiAnalysis;
  const kpis = analysis.executive_dashboard.kpis;
  const geoGrid = analysis.geo_grid_dominance;
  const contentStrat = analysis.engagement_and_content;

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let y = 20;

  // COLORS
  const C_DARK = [15, 23, 42]; // Slate 900
  const C_BLUE = [37, 99, 235]; // Blue 600
  const C_GRAY = [100, 116, 139]; // Slate 500
  const C_LIGHT_GRAY = [241, 245, 249]; // Slate 100
  const C_RED = [220, 38, 38]; // Red 600
  const C_GREEN = [22, 163, 74]; // Green 600
  const C_YELLOW = [202, 138, 4]; // Yellow 600

  // Helper: Text Wrapping
  const printText = (text: string, x: number, y: number, size: number, weight: "normal" | "bold", color: number[], maxWidth?: number) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", weight);
    doc.setTextColor(color[0], color[1], color[2]);
    if (maxWidth) {
      const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
      const lines = doc.splitTextToSize(cleanText, maxWidth);
      doc.text(lines, x, y);
      return lines.length * (size * 0.55); 
    } else {
      doc.text(text, x, y);
      return size * 0.55;
    }
  };

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // --- PAGE 1: EXECUTIVE DASHBOARD ---
  
  // Header Background
  doc.setFillColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.rect(0, 0, pageWidth, 55, 'F');

  // Title
  printText(t.title, margin, 22, 22, "bold", [255, 255, 255]);
  printText(t.subtitle, margin, 32, 9, "normal", [148, 163, 184]); // Light slate
  
  // Date & Business
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  const busName = data.business.name.length > 30 ? data.business.name.substring(0, 27) + '...' : data.business.name;
  doc.text(busName, pageWidth - margin - doc.getTextWidth(busName), 22);
  
  doc.setFontSize(9); doc.setTextColor(148, 163, 184);
  const dateStr = new Date().toLocaleDateString();
  doc.text(dateStr, pageWidth - margin - doc.getTextWidth(dateStr), 32);

  y = 75;

  // KPI SECTION
  printText(t.kpi_section, margin, y, 12, "bold", C_DARK);
  y += 8;

  // Add Friction Score to the list for V6
  const kpiList = [kpis.trust_health_score, kpis.visibility_confidence, kpis.commercial_engine, kpis.friction_score];
  const boxW = (pageWidth - (margin * 2) - 15) / 4; // 4 boxes now
  
  kpiList.forEach((kpi, i) => {
    const bx = margin + (i * (boxW + 5));
    
    // Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(bx, y, boxW, 45, 2, 2, 'FD');
    
    // Label
    doc.setFontSize(6); doc.setFont("helvetica", "bold"); doc.setTextColor(C_GRAY[0], C_GRAY[1], C_GRAY[2]);
    doc.text(kpi.label.toUpperCase(), bx + 5, y + 10);
    
    // Score
    const color = kpi.value > 75 ? C_GREEN : kpi.value > 40 ? C_YELLOW : C_RED;
    doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(color[0], color[1], color[2]);
    doc.text(kpi.value.toString(), bx + 5, y + 24);

    // Desc
    printText(kpi.description, bx + 5, y + 32, 6, "normal", C_DARK, boxW - 10);
  });

  y += 60;

  // ROI PROJECTION
  doc.setFillColor(C_LIGHT_GRAY[0], C_LIGHT_GRAY[1], C_LIGHT_GRAY[2]);
  doc.roundedRect(margin, y, pageWidth - (margin*2), 30, 2, 2, 'F');
  
  doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(C_BLUE[0], C_BLUE[1], C_BLUE[2]);
  doc.text("ROI PROJECTION", margin + 10, y + 10);
  
  doc.setFontSize(12); doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.text(analysis.roi_projection.estimated_growth, margin + 10, y + 20);
  
  // Right side conclusion
  printText(analysis.roi_projection.expert_conclusion, margin + 100, y + 8, 8, "normal", C_DARK, pageWidth - margin - 120);

  y += 45;

  // --- GEO GRID SECTION (New V6) ---
  printText(t.grid, margin, y, 12, "bold", C_DARK);
  y += 8;
  
  doc.setDrawColor(C_BLUE[0], C_BLUE[1], C_BLUE[2]);
  doc.rect(margin, y, pageWidth - (margin*2), 35);
  
  doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text(`Center Rank: #${geoGrid.visual_ranking_grid.center_rank}`, margin + 5, y + 10);
  
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text(`Radius: ${geoGrid.visual_ranking_grid.proximity_trap_radius}`, margin + 5, y + 16);
  doc.text(`Share of Voice: ${geoGrid.share_of_voice}`, margin + 5, y + 22);
  
  printText(`Insight: ${geoGrid.visual_ranking_grid.insight}`, margin + 80, y + 5, 8, "normal", C_DARK, pageWidth - margin - 90);
  
  y += 45;

  // --- REALITY MIRROR ---
  printText(t.gaps, margin, y, 12, "bold", C_DARK);
  y += 8;

  const sections = [
    { t: "Profile Accuracy", d: analysis.audit_analysis_breakdown.profile_accuracy },
    { t: "Reputation Intelligence", d: analysis.audit_analysis_breakdown.reputation_intelligence },
    { t: "Media & Engagement", d: analysis.audit_analysis_breakdown.media_engagement },
    { t: "Competitive Positioning", d: analysis.audit_analysis_breakdown.competitive_positioning }
  ];

  sections.forEach(sec => {
    checkPage(40);
    
    // Section Title
    doc.setDrawColor(C_BLUE[0], C_BLUE[1], C_BLUE[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 5, y);
    printText(sec.t, margin + 8, y + 1, 10, "bold", C_DARK);
    y += 6;

    // Expert Insight
    doc.setFontSize(8); doc.setTextColor(C_BLUE[0], C_BLUE[1], C_BLUE[2]); doc.setFont("helvetica", "bold");
    doc.text("INSIGHT:", margin, y);
    const h1 = printText(sec.d.expert_insight, margin + 25, y, 8, "normal", C_DARK, pageWidth - margin - 30);
    y += h1 + 4; 

    // Gap
    doc.setTextColor(C_RED[0], C_RED[1], C_RED[2]); doc.setFont("helvetica", "bold");
    doc.text("THE GAP:", margin, y);
    const h2 = printText(sec.d.the_gap, margin + 25, y, 8, "bold", C_DARK, pageWidth - margin - 30);
    y += h2 + 8; // Extra padding between sections
  });

  // --- PAGE 2: ROADMAP ---
  doc.addPage();
  y = margin;

  // Header P2
  printText(t.roadmap, margin, y, 12, "bold", C_DARK);
  y += 12;

  const phases = [
    { p: "PHASE 1", d: analysis.prioritized_action_roadmap.phase_1_foundation, c: C_BLUE },
    { p: "PHASE 2", d: analysis.prioritized_action_roadmap.phase_2_conversion, c: [147, 51, 234] }, // Purple
    { p: "PHASE 3", d: analysis.prioritized_action_roadmap.phase_3_authority, c: C_GREEN }
  ];

  phases.forEach((phase) => {
    checkPage(40);
    // Phase Header
    doc.setFillColor(phase.c[0], phase.c[1], phase.c[2]);
    doc.roundedRect(margin, y, 20, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont("helvetica", "bold");
    doc.text(phase.p, margin + 3, y + 4);
    
    doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]); doc.setFontSize(11);
    doc.text(phase.d.title, margin + 25, y + 5);
    
    y += 10;

    // Actions
    phase.d.actions.forEach(act => {
      doc.setFillColor(200, 200, 200);
      doc.circle(margin + 4, y - 1, 1, 'F');
      const h = printText(act, margin + 8, y, 9, "normal", C_DARK, pageWidth - margin - 15);
      y += h + 3;
    });

    // Goal
    y += 2;
    doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(phase.c[0], phase.c[1], phase.c[2]);
    doc.text(`Goal: ${phase.d.goal}`, margin + 8, y);
    doc.setFont("helvetica", "normal");
    
    y += 12;
  });

  // --- CONTENT STRATEGY (New V6) ---
  checkPage(60);
  printText(t.content, margin, y, 12, "bold", C_DARK);
  y += 8;
  
  // Frequency
  printText(`Posting Analysis: ${contentStrat.post_frequency_analysis}`, margin, y, 9, "normal", C_DARK, pageWidth - (margin*2));
  y += 10;
  
  // Post Ideas
  doc.setFont("helvetica", "bold");
  doc.text("AI Post Ideas:", margin, y);
  y += 6;
  contentStrat.ai_generated_templates.post_ideas.forEach(idea => {
      doc.setFillColor(200, 200, 200);
      doc.circle(margin + 4, y - 1, 1, 'F');
      const h = printText(idea, margin + 8, y, 8, "normal", C_DARK, pageWidth - margin - 15);
      y += h + 3;
  });

  // --- PAGE 3: TECHNICAL SIGNALS ---
  doc.addPage();
  y = margin;
  printText(t.signals || "TECHNICAL AUDIT SIGNALS", margin, y, 12, "bold", C_DARK);
  y += 10;

  // Table Header
  doc.setFillColor(C_LIGHT_GRAY[0], C_LIGHT_GRAY[1], C_LIGHT_GRAY[2]);
  doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.text("FACTOR", margin + 2, y + 5);
  doc.text("STATUS", margin + 80, y + 5);
  doc.text("SCORE", margin + 120, y + 5);
  y += 12;

  data.factors.forEach((factor) => {
    checkPage(30); // Ensure space for item

    // Status visual
    let statusColor = C_GREEN;
    let statusText = "PASS";
    if (factor.status === 'warning') { statusColor = C_YELLOW; statusText = "WARN"; }
    if (factor.status === 'critical') { statusColor = C_RED; statusText = "FAIL"; }

    // Name row
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]);
    doc.text(factor.name, margin + 2, y);

    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, margin + 80, y);

    doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]);
    doc.text(`${factor.score} / ${factor.maxScore}`, margin + 120, y);

    y += 5;

    // Reason & Fix
    const reasonText = `Analysis: ${factor.reason}`;
    const fixText = `Fix: ${factor.fixAction}`;
    
    // Print Analysis
    const h1 = printText(reasonText, margin + 5, y, 8, "normal", C_GRAY, pageWidth - margin - 30);
    y += h1 + 2;
    
    // Print Fix (only if not passing perfectly)
    if (factor.status !== 'good') {
        const h2 = printText(fixText, margin + 5, y, 8, "bold", C_BLUE, pageWidth - margin - 30);
        y += h2 + 2;
    }
    
    y += 4;
    
    // Divider
    doc.setDrawColor(240, 240, 240);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
  });

  // Footer
  doc.setFontSize(7); doc.setTextColor(150, 150, 150);
  doc.text(t.notes, pageWidth / 2, pageHeight - 10, { align: "center" });

  doc.save(`V6_Executive_Report_${data.business.name.replace(/\s+/g, '_')}.pdf`);
};


import type { AuditReportData, AuditLanguage } from "../types";

const PDF_TRANSLATIONS: Record<AuditLanguage, Record<string, string>> = {
  en: { title: "AUDIT MASTER REPORT", subtitle: "CONFIDENCE INTELLIGENCE SYSTEM v5", kpis: "EXECUTIVE DASHBOARD", gaps: "REALITY MIRROR (GAP ANALYSIS)", roadmap: "PRIORITIZED ACTION ROADMAP", notes: "CONFIDENTIAL / STRATEGIC USE ONLY" },
  es: { title: "REPORTE DE AUDITORÍA", subtitle: "SISTEMA DE INTELIGENCIA v5", kpis: "PANEL EJECUTIVO", gaps: "ANÁLISIS DE BRECHAS", roadmap: "HOJA DE RUTA", notes: "CONFIDENCIAL" },
  fr: { title: "RAPPORT D'AUDIT", subtitle: "SYSTÈME D'INTELLIGENCE v5", kpis: "TABLEAU DE BORD", gaps: "ANALYSE DES ÉCARTS", roadmap: "FEUILLE DE ROUTE", notes: "CONFIDENTIEL" },
  de: { title: "AUDIT-BERICHT", subtitle: "INTELLIGENZSYSTEM v5", kpis: "EXECUTIVE DASHBOARD", gaps: "LÜCKENANALYSE", roadmap: "AKTIONSPLAN", notes: "VERTRAULICH" },
  it: { title: "RAPPORTO DI AUDIT", subtitle: "SISTEMA DI INTELLIGENZA v5", kpis: "CRUSCOTTO ESECUTIVO", gaps: "ANALISI DEI GAP", roadmap: "TABELLA DI MARCIA", notes: "RISERVATO" },
  pt: { title: "RELATÓRIO DE AUDITORIA", subtitle: "SISTEMA DE INTELIGÊNCIA v5", kpis: "PAINEL EXECUTIVO", gaps: "ANÁLISE DE LACUNAS", roadmap: "ROTEIRO DE AÇÃO", notes: "CONFIDENCIAL" }
};

export const generateAuditPdf = (data: AuditReportData) => {
  const { jsPDF } = (window as any).jspdf || (window as any).jsPDF;
  if (!jsPDF) {
    alert("PDF library not loaded.");
    return;
  }
  const doc = new jsPDF();
  
  const lang = data.inputs.language || 'en';
  const t = PDF_TRANSLATIONS[lang] || PDF_TRANSLATIONS['en'];
  const analysis = data.geminiAnalysis;
  const kpis = analysis.executive_dashboard.kpis;

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let y = 20;

  // COLORS
  const C_DARK = [15, 23, 42]; // Slate 900
  const C_BLUE = [37, 99, 235]; // Blue 600
  const C_GRAY = [100, 116, 139]; // Slate 500
  const C_LIGHT_GRAY = [241, 245, 249]; // Slate 100
  const C_RED = [239, 68, 68];
  const C_GREEN = [34, 197, 94];

  // Helper: Text Wrapping
  const printText = (text: string, x: number, y: number, size: number, weight: "normal" | "bold", color: number[], maxWidth?: number) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", weight);
    doc.setTextColor(color[0], color[1], color[2]);
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return lines.length * (size * 0.4); // Return approximate height
    } else {
      doc.text(text, x, y);
      return size * 0.4;
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
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Title
  printText(t.title, margin, 25, 24, "bold", [255, 255, 255]);
  printText(t.subtitle, margin, 35, 10, "normal", [148, 163, 184]); // Light slate
  
  // Date & Business
  printText(data.business.name, pageWidth - margin, 25, 16, "bold", [255, 255, 255], 0); // Align right manually below
  doc.text(data.business.name, pageWidth - margin - doc.getTextWidth(data.business.name), 25);
  
  doc.setFontSize(10); doc.setTextColor(148, 163, 184);
  const dateStr = new Date().toLocaleDateString();
  doc.text(dateStr, pageWidth - margin - doc.getTextWidth(dateStr), 35);

  y = 80;

  // KPI SECTION
  printText(t.kpi_section, margin, y, 14, "bold", C_DARK);
  y += 10;

  const kpiData = [kpis.trust_health_score, kpis.visibility_confidence, kpis.commercial_engine];
  const boxW = (pageWidth - (margin * 2) - 10) / 3;
  
  kpiData.forEach((kpi, i) => {
    const bx = margin + (i * (boxW + 5));
    
    // Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(bx, y, boxW, 50, 3, 3, 'FD');
    
    // Label
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C_GRAY[0], C_GRAY[1], C_GRAY[2]);
    doc.text(kpi.label.toUpperCase(), bx + 5, y + 10);
    
    // Score
    const color = kpi.value > 75 ? C_GREEN : kpi.value > 40 ? [234, 179, 8] : C_RED;
    doc.setFontSize(28); doc.setFont("helvetica", "bold"); doc.setTextColor(color[0], color[1], color[2]);
    doc.text(kpi.value.toString(), bx + 5, y + 25);
    doc.setFontSize(10); doc.setTextColor(C_GRAY[0], C_GRAY[1], C_GRAY[2]);
    doc.text("/ 100", bx + 5 + doc.getTextWidth(kpi.value.toString()) + 2, y + 25);

    // Desc
    printText(kpi.description, bx + 5, y + 35, 8, "normal", C_DARK, boxW - 10);
  });

  y += 70;

  // ROI PROJECTION
  doc.setFillColor(C_LIGHT_GRAY[0], C_LIGHT_GRAY[1], C_LIGHT_GRAY[2]);
  doc.roundedRect(margin, y, pageWidth - (margin*2), 35, 3, 3, 'F');
  
  printText("ROI PROJECTION", margin + 10, y + 10, 10, "bold", C_BLUE);
  printText(analysis.roi_projection.estimated_growth, margin + 10, y + 22, 14, "bold", C_DARK);
  printText(analysis.roi_projection.expert_conclusion, margin + 100, y + 12, 9, "normal", C_DARK, pageWidth - margin - 120);

  y += 50;

  // --- REALITY MIRROR ---
  printText(t.gaps, margin, y, 14, "bold", C_DARK);
  y += 10;

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
    printText(sec.t, margin + 8, y + 1, 11, "bold", C_DARK);
    y += 8;

    // Expert Insight
    printText("EXPERT INSIGHT:", margin, y, 8, "bold", C_BLUE);
    const h1 = printText(sec.d.expert_insight, margin + 35, y, 9, "normal", C_DARK, pageWidth - margin - 40);
    y += h1 + 4;

    // Gap
    printText("THE GAP:", margin, y, 8, "bold", C_RED);
    const h2 = printText(sec.d.the_gap, margin + 35, y, 9, "bold", C_DARK, pageWidth - margin - 40);
    y += h2 + 8;
  });

  // --- PAGE 2: ROADMAP ---
  doc.addPage();
  y = margin;

  // Header P2
  printText(t.roadmap, margin, y, 14, "bold", C_DARK);
  y += 15;

  const phases = [
    { p: "PHASE 1", d: analysis.prioritized_action_roadmap.phase_1_foundation, c: C_BLUE },
    { p: "PHASE 2", d: analysis.prioritized_action_roadmap.phase_2_conversion, c: [147, 51, 234] }, // Purple
    { p: "PHASE 3", d: analysis.prioritized_action_roadmap.phase_3_authority, c: C_GREEN }
  ];

  phases.forEach(phase => {
    // Phase Header
    doc.setFillColor(phase.c[0], phase.c[1], phase.c[2]);
    doc.roundedRect(margin, y, 25, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(phase.p, margin + 4, y + 5);
    
    doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]); doc.setFontSize(12);
    doc.text(phase.d.title, margin + 35, y + 6);
    
    y += 15;

    // Actions
    phase.d.actions.forEach(act => {
      doc.setFillColor(200, 200, 200);
      doc.circle(margin + 5, y - 1, 1, 'F');
      const h = printText(act, margin + 10, y, 10, "normal", C_DARK, pageWidth - margin - 20);
      y += h + 3;
    });

    // Goal
    y += 2;
    doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(phase.c[0], phase.c[1], phase.c[2]);
    doc.text(`Goal: ${phase.d.goal}`, margin + 10, y);
    doc.setFont("helvetica", "normal");
    
    y += 15;
  });

  // Footer
  doc.setFontSize(8); doc.setTextColor(150, 150, 150);
  doc.text(t.notes, pageWidth / 2, pageHeight - 10, { align: "center" });

  doc.save(`V5_Executive_Report_${data.business.name.replace(/\s+/g, '_')}.pdf`);
};

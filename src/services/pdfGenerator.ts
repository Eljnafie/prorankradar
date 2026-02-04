
import type { AuditReportData, AuditLanguage } from "../types";

const PDF_TRANSLATIONS: Record<AuditLanguage, Record<string, string>> = {
  en: {
    title: "EXECUTIVE AUDIT REPORT",
    prepared_for: "Prepared for:",
    kpi_section: "Executive Dashboard",
    gap_section: "Strategic Analysis & Gaps",
    roadmap_section: "Prioritized Action Roadmap",
    notes: "Confidence Intelligence System v5 - Confidential"
  },
  es: { title: "INFORME EJECUTIVO", prepared_for: "Preparado para:", kpi_section: "Panel Ejecutivo", gap_section: "Análisis Estratégico", roadmap_section: "Hoja de Ruta", notes: "Sistema v5 - Confidencial" },
  fr: { title: "RAPPORT EXÉCUTIF", prepared_for: "Préparé pour:", kpi_section: "Tableau de Bord", gap_section: "Analyse Stratégique", roadmap_section: "Feuille de Route", notes: "Système v5 - Confidentiel" },
  de: { title: "EXECUTIVE REPORT", prepared_for: "Für:", kpi_section: "Executive Dashboard", gap_section: "Strategische Analyse", roadmap_section: "Aktionsplan", notes: "v5 System - Vertraulich" },
  it: { title: "REPORT ESECUTIVO", prepared_for: "Per:", kpi_section: "Cruscotto Esecutivo", gap_section: "Analisi Strategica", roadmap_section: "Piano d'Azione", notes: "Sistema v5 - Riservato" },
  pt: { title: "RELATÓRIO EXECUTIVO", prepared_for: "Para:", kpi_section: "Painel Executivo", gap_section: "Análise Estratégica", roadmap_section: "Roteiro de Ação", notes: "Sistema v5 - Confidencial" }
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

  let y = 20; 
  const leftMargin = 20;
  const rightMargin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const maxLineWidth = pageWidth - (leftMargin + rightMargin);
  const pageHeight = doc.internal.pageSize.height;

  const COLORS = {
    slate900: [15, 23, 42],
    slate600: [71, 85, 105],
    blue600: [37, 99, 235],
    green600: [22, 163, 74]
  };

  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - 20) {
      doc.addPage();
      y = 20;
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

  // --- 1. HEADER ---
  doc.setFillColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont("helvetica", "bold");
  doc.text(t.title, leftMargin, 20);
  
  doc.setFontSize(12); doc.setFont("helvetica", "normal");
  doc.text(`${t.prepared_for} ${data.business.name}`, leftMargin, 35);
  doc.text(`${new Date().toLocaleDateString()}`, pageWidth - rightMargin - 30, 20);

  y = 70;

  // --- 2. KPIS ---
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(t.kpi_section, leftMargin, y);
  y += 15;

  const kpiList = [kpis.trust_health_score, kpis.visibility_confidence, kpis.commercial_engine];
  const boxWidth = (pageWidth - 40) / 3 - 5;
  
  kpiList.forEach((kpi, i) => {
    const xPos = leftMargin + (i * (boxWidth + 7));
    doc.setFillColor(248, 250, 252);
    doc.rect(xPos, y, boxWidth, 30, 'F');
    
    doc.setFontSize(8); doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), xPos + 5, y + 8);
    
    doc.setFontSize(16); doc.setTextColor(15, 23, 42);
    doc.text(`${kpi.value}/100`, xPos + 5, y + 20);
  });
  y += 40;

  // --- 3. GAP ANALYSIS ---
  checkPageBreak(50);
  doc.setFontSize(14); doc.text(t.gap_section, leftMargin, y);
  y += 10;

  const breakdown = analysis.audit_analysis_breakdown;
  const items = [
    { title: "Profile Accuracy", data: breakdown.profile_accuracy },
    { title: "Reputation", data: breakdown.reputation_intelligence },
    { title: "Media Engagement", data: breakdown.media_engagement }
  ];

  items.forEach(item => {
    checkPageBreak(30);
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
    doc.text(item.title, leftMargin, y);
    y += 6;
    addWrappedText(`Insight: ${item.data.expert_insight}`, 10, "normal", COLORS.slate600);
    y += 2;
    addWrappedText(`Gap: ${item.data.the_gap}`, 10, "bold", COLORS.slate900);
    y += 8;
  });

  // --- 4. ROADMAP ---
  checkPageBreak(50);
  doc.setFontSize(14); doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(t.roadmap_section, leftMargin, y);
  y += 10;

  const roadmap = analysis.prioritized_action_roadmap;
  const phases = [roadmap.phase_1_foundation, roadmap.phase_2_conversion, roadmap.phase_3_authority];

  phases.forEach((phase, i) => {
    checkPageBreak(40);
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text(`Phase ${i+1}: ${phase.title}`, leftMargin, y);
    y += 6;
    phase.actions.forEach(action => {
      addWrappedText(`• ${action}`, 10, "normal", COLORS.slate600, 5);
    });
    y += 5;
    doc.setFontSize(9); doc.setTextColor(COLORS.green600[0], COLORS.green600[1], COLORS.green600[2]);
    doc.text(`Goal: ${phase.goal}`, leftMargin + 5, y);
    y += 10;
  });

  // Footer
  y = pageHeight - 15;
  doc.setFontSize(8); doc.setTextColor(150, 150, 150);
  doc.text(t.notes, pageWidth / 2, y, { align: "center" });

  doc.save(`Executive_Report_${data.business.name.replace(/\s+/g, '_')}.pdf`);
};

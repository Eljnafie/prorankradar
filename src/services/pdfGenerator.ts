
import type { AuditReportData, AuditLanguage } from "../types";

const PDF_TRANSLATIONS: Record<AuditLanguage, Record<string, string>> = {
  en: {
    title: "V5 MASTER AUDIT",
    prepared_for: "Prepared for:",
    score_label: "Visibility Confidence Score",
    summary_section: "Executive Summary",
    timeline_section: "90-Day Action Plan",
    notes: "Proprietary V5 Confidence Intelligence System."
  },
  es: { title: "AUDITORÍA MAESTRA V5", prepared_for: "Preparado para:", score_label: "Puntuación de Confianza", summary_section: "Resumen Ejecutivo", timeline_section: "Plan de Acción 90 Días", notes: "Sistema V5." },
  fr: { title: "AUDIT MAÎTRE V5", prepared_for: "Préparé pour:", score_label: "Score de Confiance", summary_section: "Résumé Exécutif", timeline_section: "Plan d'Action 90 Jours", notes: "Système V5." },
  de: { title: "V5 MASTER AUDIT", prepared_for: "Für:", score_label: "Vertrauensscore", summary_section: "Zusammenfassung", timeline_section: "90-Tage-Aktionsplan", notes: "V5 System." },
  it: { title: "AUDIT MASTER V5", prepared_for: "Per:", score_label: "Punteggio di Fiducia", summary_section: "Sintesi Esecutiva", timeline_section: "Piano d'Azione 90 Giorni", notes: "Sistema V5." },
  pt: { title: "AUDITORIA MESTRE V5", prepared_for: "Para:", score_label: "Pontuação de Confiança", summary_section: "Resumo Executivo", timeline_section: "Plano de Ação 90 Dias", notes: "Sistema V5." }
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
  const v5 = data.geminiAnalysis;

  let y = 20; 
  const leftMargin = 20;
  const rightMargin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const maxLineWidth = pageWidth - (leftMargin + rightMargin);
  const pageHeight = doc.internal.pageSize.height;

  const COLORS = {
    slate900: [15, 23, 42],
    slate600: [71, 85, 105],
    green500: [34, 197, 94],
    red500: [239, 68, 68],
    blue600: [37, 99, 235]
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
  doc.setFontSize(22); doc.setFont("helvetica", "bold");
  doc.text(t.title, leftMargin, 20);
  
  doc.setFontSize(12); doc.setFont("helvetica", "normal");
  doc.text(`${t.prepared_for} ${data.business.name}`, leftMargin, 35);
  doc.text(`${new Date().toLocaleDateString()}`, pageWidth - rightMargin - 40, 20);

  y = 70;

  // --- 2. SCORE & SUMMARY ---
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.score_label, leftMargin, y);
  
  const score = v5.local_visibility_confidence.score;
  doc.setFontSize(30);
  doc.text(score.toString(), pageWidth - 40, y);
  y += 20;

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(leftMargin, y, maxLineWidth, 40, 2, 2, 'F');
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text(t.summary_section, leftMargin + 5, y + 10);
  y += 15;
  addWrappedText(v5.executive_summary.summary, 10, "normal", COLORS.slate600, 5);
  y += 35;

  // --- 3. TIMELINE ---
  checkPageBreak(50);
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(t.timeline_section, leftMargin, y);
  y += 10;

  const phases = [
    { name: "Day 0-30", data: v5.action_plan_timeline.days_0_30 },
    { name: "Day 31-60", data: v5.action_plan_timeline.days_31_60 },
    { name: "Day 61-90", data: v5.action_plan_timeline.days_61_90 }
  ];

  phases.forEach(phase => {
    checkPageBreak(30);
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text(`${phase.name}: ${phase.data.focus}`, leftMargin, y);
    y += 6;
    phase.data.actions.forEach(act => {
      addWrappedText(`- ${act}`, 10, "normal", COLORS.slate600, 5);
    });
    y += 5;
  });

  // Footer
  y = pageHeight - 15;
  doc.setFontSize(8); doc.setTextColor(150, 150, 150);
  doc.text(t.notes, pageWidth / 2, y, { align: "center" });

  doc.save(`V5_Master_Audit_${data.business.name.replace(/\s+/g, '_')}.pdf`);
};

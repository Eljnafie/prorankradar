
import type { AuditReportData, AuditLanguage } from "../types";

// Translation dictionary for PDF Labels
const PDF_TRANSLATIONS: Record<AuditLanguage, Record<string, string>> = {
  en: {
    title: "V3 VISIBILITY AUDIT",
    prepared_for: "Prepared for:",
    methodology: "Methodology",
    exec_summary: "Executive Summary",
    lvc_score: "Local Visibility Coverage (LVC)",
    lvc_sub: "Real-world market reach",
    signal_sep: "Signal Separation",
    scorecard: "Baseline Scorecard",
    safety: "A. Profile Safety",
    trust: "B. User Trust",
    visibility: "C. Visibility & Competition",
    notes: "Important: Results vary by location. Google updates systems regularly."
  },
  es: {
    title: "AUDITORÍA DE VISIBILIDAD V3",
    prepared_for: "Preparado para:",
    methodology: "Metodología",
    exec_summary: "Resumen Ejecutivo",
    lvc_score: "Cobertura de Visibilidad (LVC)",
    lvc_sub: "Alcance real",
    signal_sep: "Separación de Señales",
    scorecard: "Tarjeta de Puntuación",
    safety: "A. Seguridad",
    trust: "B. Confianza",
    visibility: "C. Visibilidad",
    notes: "Nota: Los resultados varían por ubicación."
  },
  fr: { title: "AUDIT DE VISIBILITÉ V3", prepared_for: "Préparé pour:", methodology: "Méthodologie", exec_summary: "Résumé Exécutif", lvc_score: "Score LVC", lvc_sub: "Portée réelle", signal_sep: "Séparation des Signaux", scorecard: "Tableau de Bord", safety: "A. Sécurité", trust: "B. Confiance", visibility: "C. Visibilité", notes: "Note: Résultats variables." },
  de: { title: "V3 SICHTBARKEITSAUDIT", prepared_for: "Für:", methodology: "Methodik", exec_summary: "Zusammenfassung", lvc_score: "LVC Score", lvc_sub: "Marktreichweite", signal_sep: "Signaltrennung", scorecard: "Scorecard", safety: "A. Sicherheit", trust: "B. Vertrauen", visibility: "C. Sichtbarkeit", notes: "Hinweis: Ergebnisse variieren." },
  it: { title: "AUDIT VISIBILITÀ V3", prepared_for: "Per:", methodology: "Metodologia", exec_summary: "Riepilogo", lvc_score: "Punteggio LVC", lvc_sub: "Portata reale", signal_sep: "Separazione Segnali", scorecard: "Scheda di Valutazione", safety: "A. Sicurezza", trust: "B. Fiducia", visibility: "C. Visibilità", notes: "Nota: I risultati variano." },
  pt: { title: "AUDITORIA DE VISIBILIDADE V3", prepared_for: "Para:", methodology: "Metodologia", exec_summary: "Resumo Executivo", lvc_score: "Pontuação LVC", lvc_sub: "Alcance real", signal_sep: "Separação de Sinais", scorecard: "Scorecard", safety: "A. Segurança", trust: "B. Confiança", visibility: "C. Visibilidade", notes: "Nota: Resultados variam." }
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
    blue50: [239, 246, 255],
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
    doc.text("ProRankRadar V3", leftMargin, 10);
    doc.setFont("helvetica", "normal");
    doc.text(t.title, pageWidth - rightMargin - 70, 10);
  };

  // --- 1. COVER PAGE ---
  doc.setFillColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10); doc.text("ProRankRadar Intelligence", leftMargin, 15);
  doc.setFontSize(26); doc.setFont("helvetica", "bold");
  doc.text(t.title, leftMargin, 35);
  
  doc.setFontSize(14); doc.setFont("helvetica", "normal");
  doc.text(`${t.prepared_for} ${data.business.name}`, leftMargin, 75);
  doc.setFontSize(11); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(`${data.inputs.targetCity} | ${data.geminiAnalysis.business_overview.audit_date}`, leftMargin, 82);

  y = 100;

  // --- 2. METHODOLOGY ---
  doc.setFillColor(COLORS.blue50[0], COLORS.blue50[1], COLORS.blue50[2]);
  doc.setDrawColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
  doc.roundedRect(leftMargin, y, maxLineWidth, 35, 3, 3, 'FD');
  
  doc.setTextColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text(t.methodology, leftMargin + 5, y + 8);
  
  y += 15;
  addWrappedText(data.geminiAnalysis.methodology.maps_data_explanation, 10, "normal", COLORS.slate600, 5);
  addWrappedText(data.geminiAnalysis.methodology.ai_explanation_role, 10, "normal", COLORS.slate600, 5);
  y += 20;

  // --- 3. EXECUTIVE SUMMARY & LVC ---
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.exec_summary, leftMargin, y);
  y += 10;

  addWrappedText(data.geminiAnalysis.executive_summary.plain_language_summary, 11, "normal", COLORS.slate600);
  y += 5;
  doc.setFont("helvetica", "bold");
  addWrappedText(`Status: ${data.geminiAnalysis.executive_summary.current_visibility_status.replace('_', ' ').toUpperCase()}`, 11, "bold", COLORS.slate900);
  y += 2;
  addWrappedText(`Opportunity: ${data.geminiAnalysis.executive_summary.primary_opportunity}`, 11, "bold", COLORS.blue600);
  y += 10;

  // Draw LVC Gauge
  const lvcY = y; 
  const score = data.geminiAnalysis.local_visibility_coverage.lvc_score_percent;
  const scoreColor = score >= 50 ? COLORS.green500 : score >= 20 ? COLORS.yellow500 : COLORS.red500;
  
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(4);
  doc.circle(pageWidth - 45, lvcY + 15, 18);
  doc.setFontSize(20); doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(`${score}%`, pageWidth - 45, lvcY + 17, { align: "center" });
  
  doc.setFontSize(10); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(t.lvc_score, pageWidth - 45, lvcY + 40, { align: "center" });
  doc.setFontSize(8);
  doc.text(t.lvc_sub, pageWidth - 45, lvcY + 45, { align: "center" });

  y = Math.max(y, lvcY + 55); 

  // --- 4. SIGNAL SEPARATION (V3) ---
  checkPageBreak(120);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.signal_sep, leftMargin, y);
  y += 12;

  const drawSignalCard = (title: string, dataObj: any, color: number[]) => {
    checkPageBreak(40);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(leftMargin, y, maxLineWidth, 35, 2, 2, 'FD');
    
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(leftMargin, y, 2, 35, 'F');

    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text(title, leftMargin + 6, y + 8);

    doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    
    let currentY = y + 14;
    doc.setFont("helvetica", "bold"); doc.text("State:", leftMargin + 6, currentY);
    doc.setFont("helvetica", "normal"); doc.text(dataObj.current_state, leftMargin + 25, currentY);
    
    currentY += 6;
    doc.setFont("helvetica", "bold"); doc.text("Impact:", leftMargin + 6, currentY);
    doc.setFont("helvetica", "normal"); doc.text(dataObj.why_it_matters, leftMargin + 25, currentY);

    y += 40;
  };

  drawSignalCard(t.safety, data.geminiAnalysis.signal_separation.profile_safety, COLORS.blue600);
  drawSignalCard(t.trust, data.geminiAnalysis.signal_separation.user_trust, COLORS.green500);
  drawSignalCard(t.visibility, data.geminiAnalysis.signal_separation.visibility_and_competition, COLORS.yellow500);

  // --- 5. BASELINE SCORECARD ---
  checkPageBreak(60);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.scorecard, leftMargin, y);
  y += 10;

  const scores = data.geminiAnalysis.baseline_scorecard;
  const scoreRow = (label: string, val: string) => {
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text(label, leftMargin, y);
    doc.text(val.toUpperCase(), leftMargin + 60, y);
    y += 6;
  };

  scoreRow("Profile Safety", scores.profile_safety);
  scoreRow("User Trust", scores.user_trust);
  scoreRow("Engagement", scores.engagement_activity);
  scoreRow("Visibility", scores.local_visibility);
  
  y += 5;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(`Notes: ${scores.notes}`, leftMargin, y);

  // --- 6. FOOTER NOTES ---
  y = pageHeight - 20;
  doc.setFontSize(8); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(t.notes, pageWidth / 2, y, { align: "center" });

  doc.save(`${data.business.name.replace(/\s+/g, '_')}_Audit_V3.pdf`);
};

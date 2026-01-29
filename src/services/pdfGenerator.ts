
import type { AuditReportData, AuditLanguage } from "../types";

// Translation dictionary
const PDF_TRANSLATIONS: Record<AuditLanguage, Record<string, string>> = {
  en: {
    title: "V4 CONFIDENCE AUDIT",
    prepared_for: "Prepared for:",
    lvc_score: "LVC Confidence Score",
    lvc_sub: "Local Visibility Confidence",
    alert_section: "Status Alert",
    outlook_section: "Growth Outlook",
    opps_section: "Strategic Opportunities",
    notes: "Proprietary Confidence Intelligence System V4."
  },
  es: {
    title: "AUDITORÍA DE CONFIANZA V4",
    prepared_for: "Preparado para:",
    lvc_score: "Puntuación de Confianza LVC",
    lvc_sub: "Confianza de Visibilidad Local",
    alert_section: "Alerta de Estado",
    outlook_section: "Perspectiva de Crecimiento",
    opps_section: "Oportunidades Estratégicas",
    notes: "Sistema de Inteligencia de Confianza V4."
  },
  fr: { title: "AUDIT DE CONFIANCE V4", prepared_for: "Préparé pour:", lvc_score: "Score LVC", lvc_sub: "Confiance Visibilité Locale", alert_section: "Alerte Statut", outlook_section: "Perspectives", opps_section: "Opportunités", notes: "Système V4 Propriétaire." },
  de: { title: "V4 VERTRAUENSAUDIT", prepared_for: "Für:", lvc_score: "LVC Score", lvc_sub: "Lokale Sichtbarkeit", alert_section: "Statusmeldung", outlook_section: "Ausblick", opps_section: "Chancen", notes: "V4 System." },
  it: { title: "AUDIT FIDUCIA V4", prepared_for: "Per:", lvc_score: "Punteggio LVC", lvc_sub: "Fiducia Locale", alert_section: "Avviso Stato", outlook_section: "Prospettive", opps_section: "Opportunità", notes: "Sistema V4." },
  pt: { title: "AUDITORIA DE CONFIANÇA V4", prepared_for: "Para:", lvc_score: "Pontuação LVC", lvc_sub: "Confiança Local", alert_section: "Alerta de Estado", outlook_section: "Perspectiva", opps_section: "Oportunidades", notes: "Sistema V4." }
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
  const dashboard = data.externalDashboard;

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
    red500: [239, 68, 68],
    yellow500: [234, 179, 8]
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
  doc.text(`${new Date().toLocaleDateString()}`, pageWidth - rightMargin - 30, 20);

  y = 70;

  // --- 2. LVC SCORE ---
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.lvc_score, leftMargin, y);
  
  const score = dashboard.lvc_score;
  const scoreColor = score >= 70 ? COLORS.green500 : score >= 40 ? COLORS.yellow500 : COLORS.red500;
  
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(3);
  doc.circle(pageWidth - 40, y - 5, 15);
  doc.setFontSize(14);
  doc.text(`${score}`, pageWidth - 40, y, { align: "center" });
  
  y += 20;

  // --- 3. ALERT SECTION ---
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(leftMargin, y, maxLineWidth, 35, 2, 2, 'FD');
  
  // Alert Color Strip
  const alertColor = dashboard.alert_status.type === 'risk' ? COLORS.red500 : dashboard.alert_status.type === 'growth' ? COLORS.green500 : COLORS.yellow500;
  doc.setFillColor(alertColor[0], alertColor[1], alertColor[2]);
  doc.rect(leftMargin, y, 2, 35, 'F');

  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text(dashboard.alert_status.title, leftMargin + 6, y + 10);
  
  y += 16;
  addWrappedText(dashboard.alert_status.message, 10, "normal", COLORS.slate600, 6);
  y += 25;

  // --- 4. OUTLOOK ---
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(t.outlook_section, leftMargin, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold"); doc.text("30 Days:", leftMargin, y);
  doc.setFont("helvetica", "normal"); doc.text(dashboard.outlook.timeline_30_day, leftMargin + 25, y);
  y += 8;
  doc.setFont("helvetica", "bold"); doc.text("90 Days:", leftMargin, y);
  doc.setFont("helvetica", "normal"); doc.text(dashboard.outlook.timeline_90_day, leftMargin + 25, y);
  y += 20;

  // --- 5. OPPORTUNITIES ---
  checkPageBreak(100);
  doc.setFontSize(14); doc.setFont("helvetica", "bold");
  doc.text(t.opps_section, leftMargin, y);
  y += 10;

  dashboard.opportunities.forEach(op => {
    checkPageBreak(30);
    doc.setDrawColor(220, 220, 220);
    doc.line(leftMargin, y, pageWidth - rightMargin, y);
    y += 8;
    
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text(op.title, leftMargin, y);
    doc.setFontSize(10); doc.setTextColor(op.impact === 'High' ? COLORS.red500[0] : COLORS.blue600[0], 0, 0);
    doc.text(`[${op.impact}]`, pageWidth - rightMargin - 20, y);
    
    y += 6;
    addWrappedText(op.description, 10, "normal", COLORS.slate600);
    y += 10;
  });

  // Footer
  y = pageHeight - 15;
  doc.setFontSize(8); doc.setTextColor(150, 150, 150);
  doc.text(t.notes, pageWidth / 2, y, { align: "center" });

  doc.save(`V4_Confidence_Audit_${data.business.name.replace(/\s+/g, '_')}.pdf`);
};


import type { AuditReportData, ScoringFactor, AuditLanguage } from "../types";

// Translation dictionary for PDF Labels
const PDF_TRANSLATIONS: Record<AuditLanguage, Record<string, string>> = {
  en: {
    title: "CLIENT VISIBILITY GUIDE",
    prepared_for: "Prepared for:",
    how_it_works: "How This Audit Works",
    how_it_works_text: "We use Google Maps data to see where your business appears for real people searching nearby. We then use AI to help explain patterns in that data — not to control Google or predict results. Think of this as a diagnosis, not a crystal ball.",
    exec_summary: "Executive Summary",
    lvc_score: "Local Visibility Coverage (LVC)",
    lvc_sub: "Real-world market reach",
    health_check: "Profile Health Check",
    safety: "A. Profile Safety",
    trust: "B. Trust & Reputation",
    visibility: "C. Visibility & Power",
    improvement: "Step-by-Step Improvement Plan",
    immediate: "Phase 1: Immediate Fixes (Safety)",
    short_term: "Phase 2: Quick Wins (Activity)",
    long_term: "Phase 3: Growth (Dominance)",
    notes: "Important Notes: Results vary by user location. Google updates often."
  },
  es: {
    title: "GUÍA DE VISIBILIDAD DEL CLIENTE",
    prepared_for: "Preparado para:",
    how_it_works: "Cómo Funciona Esta Auditoría",
    how_it_works_text: "Usamos datos de Google Maps para ver dónde aparece su negocio. Usamos IA para explicar patrones, no para controlar a Google. Piense en esto como un diagnóstico.",
    exec_summary: "Resumen Ejecutivo",
    lvc_score: "Cobertura de Visibilidad Local (LVC)",
    lvc_sub: "Alcance real del mercado",
    health_check: "Chequeo de Salud del Perfil",
    safety: "A. Seguridad del Perfil",
    trust: "B. Confianza y Reputación",
    visibility: "C. Visibilidad y Poder",
    improvement: "Plan de Mejora Paso a Paso",
    immediate: "Fase 1: Arreglos Inmediatos",
    short_term: "Fase 2: Victorias Rápidas",
    long_term: "Fase 3: Crecimiento",
    notes: "Notas Importantes: Los resultados varían por ubicación."
  },
  fr: { title: "GUIDE DE VISIBILITÉ CLIENT", prepared_for: "Préparé pour:", how_it_works: "Comment Ça Marche", how_it_works_text: "Basé sur les données réelles de Google Maps. Ceci est un diagnostic.", exec_summary: "Résumé Exécutif", lvc_score: "Score de Visibilité (LVC)", lvc_sub: "Portée réelle", health_check: "Bilan de Santé", safety: "A. Sécurité", trust: "B. Confiance", visibility: "C. Visibilité", improvement: "Plan d'Amélioration", immediate: "Phase 1: Immédiat", short_term: "Phase 2: Court Terme", long_term: "Phase 3: Croissance", notes: "Note: Les résultats varient." },
  de: { title: "KUNDEN-SICHTBARKEITS-GUIDE", prepared_for: "Für:", how_it_works: "Wie es funktioniert", how_it_works_text: "Basierend auf echten Google Maps Daten.", exec_summary: "Zusammenfassung", lvc_score: "Sichtbarkeitsindex (LVC)", lvc_sub: "Markreichweite", health_check: "Profil-Check", safety: "A. Sicherheit", trust: "B. Vertrauen", visibility: "C. Sichtbarkeit", improvement: "Verbesserungsplan", immediate: "Phase 1: Sofort", short_term: "Phase 2: Kurzfristig", long_term: "Phase 3: Wachstum", notes: "Hinweis: Ergebnisse variieren." },
  it: { title: "GUIDA ALLA VISIBILITÀ", prepared_for: "Per:", how_it_works: "Come Funziona", how_it_works_text: "Basato su dati reali di Google Maps.", exec_summary: "Riepilogo Esecutivo", lvc_score: "Punteggio Visibilità (LVC)", lvc_sub: "Portata reale", health_check: "Controllo Salute", safety: "A. Sicurezza", trust: "B. Fiducia", visibility: "C. Visibilità", improvement: "Piano di Miglioramento", immediate: "Fase 1: Immediato", short_term: "Fase 2: Breve Termine", long_term: "Fase 3: Crescita", notes: "Nota: I risultati variano." },
  pt: { title: "GUIA DE VISIBILIDADE", prepared_for: "Para:", how_it_works: "Como Funciona", how_it_works_text: "Baseado em dados reais do Google Maps.", exec_summary: "Resumo Executivo", lvc_score: "Pontuação LVC", lvc_sub: "Alcance real", health_check: "Verificação de Saúde", safety: "A. Segurança", trust: "B. Confiança", visibility: "C. Visibilidade", improvement: "Plano de Melhoria", immediate: "Fase 1: Imediato", short_term: "Fase 2: Curto Prazo", long_term: "Fase 3: Crescimento", notes: "Nota: Resultados variam." }
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
    green50: [240, 253, 244],
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
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10); doc.text("ProRankRadar Intelligence", leftMargin, 15);
  doc.setFontSize(26); doc.setFont("helvetica", "bold");
  doc.text(t.title, leftMargin, 35);
  
  doc.setFontSize(14); doc.setFont("helvetica", "normal");
  doc.text(`${t.prepared_for} ${data.business.name}`, leftMargin, 75);
  doc.setFontSize(11); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(`${data.inputs.targetCity} | ${new Date().toLocaleDateString()}`, leftMargin, 82);

  y = 100;

  // --- 2. HOW IT WORKS (Methodology) ---
  doc.setFillColor(COLORS.blue50[0], COLORS.blue50[1], COLORS.blue50[2]);
  doc.setDrawColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
  doc.roundedRect(leftMargin, y, maxLineWidth, 30, 3, 3, 'FD');
  
  doc.setTextColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text(t.how_it_works, leftMargin + 5, y + 8);
  
  y += 15;
  addWrappedText(t.how_it_works_text, 10, "normal", COLORS.slate600, 5);
  y += 20;

  // --- 3. EXECUTIVE SUMMARY ---
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.exec_summary, leftMargin, y);
  y += 10;

  if (data.geminiAnalysis.executiveSummary) {
    addWrappedText(data.geminiAnalysis.executiveSummary.plainLanguageInsight, 11, "normal", COLORS.slate600);
    y += 5;
    doc.setFont("helvetica", "bold");
    addWrappedText(`Status: ${data.geminiAnalysis.executiveSummary.visibilityStatus}`, 11, "bold", COLORS.slate900);
    y += 2;
    addWrappedText(`Opportunity: ${data.geminiAnalysis.executiveSummary.mainOpportunity}`, 11, "bold", COLORS.blue600);
    y += 10;
  }

  // Draw LVC Gauge (Visual)
  const lvcY = y; // save Y
  const score = data.geminiAnalysis.lvc.score;
  const scoreColor = score >= 70 ? COLORS.green500 : score >= 40 ? COLORS.yellow500 : COLORS.red500;
  
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(4);
  doc.circle(pageWidth - 45, lvcY + 15, 18); // Circle
  doc.setFontSize(20); doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(`${score}`, pageWidth - 45, lvcY + 17, { align: "center" });
  
  doc.setFontSize(10); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(t.lvc_score, pageWidth - 45, lvcY + 40, { align: "center" });
  doc.setFontSize(8);
  doc.text(t.lvc_sub, pageWidth - 45, lvcY + 45, { align: "center" });

  // Add LVC Explanation Text on the left
  y += 10;
  addWrappedText(data.geminiAnalysis.lvc.scoreExplanation, 10, "italic", COLORS.slate600, 0); 
  
  y = Math.max(y, lvcY + 55); // Advance Y past the gauge

  // --- 4. PROFILE HEALTH CHECK (Cards) ---
  checkPageBreak(120);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(t.health_check, leftMargin, y);
  y += 12;

  const drawHealthCard = (title: string, text: string, color: number[]) => {
    checkPageBreak(35);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(leftMargin, y, maxLineWidth, 30, 2, 2, 'FD'); // Box
    
    // Colored strip
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(leftMargin, y, 2, 30, 'F');

    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text(title, leftMargin + 6, y + 8);

    doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(text, maxLineWidth - 10);
    doc.text(splitText, leftMargin + 6, y + 16);
    
    y += 35;
  };

  drawHealthCard(t.safety, data.geminiAnalysis.profileHealth.safetyCheck, COLORS.blue600);
  drawHealthCard(t.trust, data.geminiAnalysis.profileHealth.trustCheck, COLORS.green500);
  drawHealthCard(t.visibility, data.geminiAnalysis.profileHealth.visibilityCheck, COLORS.yellow500);

  y += 5;

  // --- 5. IMPROVEMENT PLAN ---
  checkPageBreak(80);
  doc.setFillColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.rect(leftMargin, y, maxLineWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text(t.improvement, leftMargin + 5, y + 7);
  y += 18;

  const phases = [
    { title: t.immediate, text: data.geminiAnalysis.improvementPlan.immediateAction },
    { title: t.short_term, text: data.geminiAnalysis.improvementPlan.shortTermStrategy },
    { title: t.long_term, text: data.geminiAnalysis.improvementPlan.longTermGrowth }
  ];

  phases.forEach((phase) => {
      checkPageBreak(25);
      doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
      doc.setFontSize(11); doc.setFont("helvetica", "bold");
      doc.text(phase.title, leftMargin, y);
      y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
      const split = doc.splitTextToSize(phase.text, maxLineWidth - 5);
      doc.text(split, leftMargin + 5, y);
      y += (split.length * 5) + 8;
  });

  // --- 6. FOOTER NOTES ---
  y = pageHeight - 20;
  doc.setFontSize(8); doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(t.notes, pageWidth / 2, y, { align: "center" });

  doc.save(`${data.business.name.replace(/\s+/g, '_')}_Audit_V2.pdf`);
};

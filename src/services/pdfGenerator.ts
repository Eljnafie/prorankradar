import { jsPDF } from "jspdf";
import type { AuditReportData, ScoringFactor } from "../types";

export const generateAuditPdf = (data: AuditReportData) => {
  const doc = new jsPDF();
  let y = 20; // Start Y position
  const leftMargin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const maxLineWidth = pageWidth - (leftMargin * 2);
  const pageHeight = doc.internal.pageSize.height;

  // --- Helper: Add Text with Page Break Logic ---
  const addWrappedText = (text: string, fontSize: number, fontType: string = "normal", color: string = "#000000") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontType);
    doc.setTextColor(color);

    const lines = doc.splitTextToSize(text, maxLineWidth);
    const lineHeight = fontSize * 0.5; // Approximation

    lines.forEach((line: string) => {
      if (y + lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20; // Reset Y for new page
      }
      doc.text(line, leftMargin, y);
      y += lineHeight + 2;
    });
    
    // Add extra spacing after block
    y += 4;
  };

  // --- 1. Header ---
  doc.setFillColor(30, 41, 59); // Slate 900
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ProRankRadar Audit", leftMargin, 18);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated for: ${data.business.name}`, leftMargin, 28);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, leftMargin, 35);

  y = 55; // Reset Y below header

  // --- 2. Executive Summary ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", leftMargin, y);
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(data.overallScore >= 80 ? "#22c55e" : data.overallScore >= 50 ? "#eab308" : "#ef4444");
  doc.text(`Overall Score: ${data.overallScore}/100`, leftMargin, y);
  y += 10;

  // Add ROI / Ranking Potential
  if (data.geminiAnalysis.admin_audit?.roi_forecast) {
    addWrappedText("Projected Impact:", 12, "bold", "#000000");
    addWrappedText(data.geminiAnalysis.admin_audit.roi_forecast, 11, "normal", "#334155");
    y += 5;
  }

  // --- 3. Priority Action Plan ---
  if (data.geminiAnalysis.admin_audit?.action_plan) {
    const plan = data.geminiAnalysis.admin_audit.action_plan;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    
    if (y + 20 > pageHeight - 20) { doc.addPage(); y = 20; }
    doc.text("Priority 3-Step Fix Plan", leftMargin, y);
    y += 10;

    const steps = [
      { t: "1. Technical Fix", d: plan.technical },
      { t: "2. Engagement Strategy", d: plan.engagement },
      { t: "3. Conversion Optimization", d: plan.conversion },
    ];

    steps.forEach(step => {
        addWrappedText(step.t, 12, "bold", "#1e293b");
        addWrappedText(step.d, 11, "normal", "#475569");
        y += 3;
    });
  }

  y += 10;

  // --- 4. Detailed Technical Audit (Categorized) ---
  
  // Define Groups
  const groups: Record<string, ScoringFactor[]> = {
    "1. Google Business Profile (GBP) Core Signals": [],
    "2. Reputation & Engagement Metrics": [],
    "3. External & Local SEO (Website Signals)": [],
    "4. Competitive Environment": []
  };

  // Sort Factors into Groups
  data.factors.forEach(f => {
    // Group 1: GBP Core
    if (["cat_rel", "sec_cat", "title_opt", "addr_city", "pin_acc", "prof_comp", "ver_status", "clean_profile", "website_link"].includes(f.id) || f.id.startsWith("blocker_")) {
       groups["1. Google Business Profile (GBP) Core Signals"].push(f);
    } 
    // Group 2: Reputation
    else if (["rev_rate", "rev_vol", "rev_kw", "seo_engage", "content_freshness", "freshness", "review_health"].includes(f.id)) {
       groups["2. Reputation & Engagement Metrics"].push(f);
    } 
    // Group 3: Website/SEO
    else if (["seo_h1", "seo_title", "seo_nap", "seo_links", "seo_internal", "seo_geo", "seo_auth", "h1_opt", "title_geo"].includes(f.id)) {
       groups["3. External & Local SEO (Website Signals)"].push(f);
    } 
    // Group 4: Competitive
    else if (["seo_spam", "comp_density"].includes(f.id)) {
       groups["4. Competitive Environment"].push(f);
    } 
    // Fallback
    else {
       if (f.category === 'gbp') groups["1. Google Business Profile (GBP) Core Signals"].push(f);
       else groups["3. External & Local SEO (Website Signals)"].push(f);
    }
  });

  // Render Groups
  Object.entries(groups).forEach(([title, factors]) => {
    if (factors.length === 0) return;

    if (y + 20 > pageHeight - 20) { doc.addPage(); y = 20; }
    
    // Section Header
    doc.setTextColor(30, 41, 59); // Dark Slate
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, leftMargin, y);
    y += 10;

    // Render Factors in this group
    factors.forEach((factor) => {
      // Check if we need a new page
      if (y + 25 > pageHeight - 20) {
          doc.addPage();
          y = 20;
      }

      // Factor Title Line
      const statusColor = factor.status === 'good' ? "#22c55e" : factor.status === 'warning' ? "#eab308" : "#ef4444";
      doc.setTextColor(statusColor);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      
      // Calculate icon representation (simple text for PDF)
      const statusIcon = factor.status === 'good' ? "[PASS]" : factor.status === 'warning' ? "[WARN]" : "[FAIL]";
      doc.text(`${statusIcon} ${factor.name} (${factor.score}/${factor.maxScore})`, leftMargin, y);
      y += 7;

      // Reason
      addWrappedText(`Analysis: ${factor.reason}`, 10, "normal", "#334155");
      
      // Fix Action
      addWrappedText(`Recommendation: ${factor.fixAction}`, 10, "italic", "#475569");
      
      y += 3; // Spacing between factors
    });
    
    y += 5; // Spacing between sections
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} - ProRankRadar.com`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  doc.save(`${data.business.name.replace(/\s+/g, '_')}_audit.pdf`);
};
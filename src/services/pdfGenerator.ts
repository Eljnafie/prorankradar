import type { AuditReportData, ScoringFactor } from "../types";

export const generateAuditPdf = (data: AuditReportData) => {
  // Use global jsPDF from CDN script (defined in index.html)
  // This bypasses build-time dependency checks
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();
  
  let y = 20; // Start Y position
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

  // --- Helper: Check Page Break ---
  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - 20) {
      doc.addPage();
      y = 20;
      addHeader();
    }
  };

  // --- Helper: Add Text with wrapping ---
  const addWrappedText = (text: string, fontSize: number, fontType: string = "normal", color: number[] = COLORS.slate900) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontType);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxLineWidth);
    const lineHeight = fontSize * 0.5; 

    lines.forEach((line: string) => {
      checkPageBreak(lineHeight + 2);
      doc.text(line, leftMargin, y);
      y += lineHeight + 2;
    });
    y += 2;
  };

  // --- Header Function (Applied to subsequent pages) ---
  const addHeader = () => {
    doc.setFontSize(10);
    doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
    doc.setFont("helvetica", "bold");
    doc.text("ProRankRadar", leftMargin, 10);
    doc.setFont("helvetica", "normal");
    doc.text("PREMIUM BUSINESS GROWTH AUDIT", pageWidth - rightMargin - 70, 10);
  };

  // --- 1. COVER / INTRO ---
  // Background Header Block
  doc.setFillColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ProRankRadar", leftMargin, 15);

  // Document Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("PREMIUM BUSINESS", leftMargin, 28);
  doc.text("GROWTH AUDIT", leftMargin, 38);
  
  // Client Details
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`Prepared for: ${data.business.name}`, leftMargin, 65);
  
  // Extract Zip/Neighborhood from address
  const addressParts = data.business.address.split(',');
  const cityZip = addressParts.slice(Math.max(0, addressParts.length - 2)).join(',').trim();
  
  doc.setFontSize(11);
  doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.text(`${cityZip || data.inputs.targetCity} | ${new Date().toLocaleDateString()}`, leftMargin, 72);

  y = 90;

  // --- 2. EXECUTIVE VISUALS ---
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Performance Summary", leftMargin, y);
  y += 15;

  // Draw Circles for Scores
  const drawScoreCircle = (label: string, score: number, xPos: number) => {
    const radius = 15;
    const color = score >= 80 ? COLORS.green500 : score >= 50 ? COLORS.yellow500 : COLORS.red500;
    
    // Ring
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(2);
    doc.circle(xPos, y + radius, radius);
    
    // Text
    doc.setFontSize(16);
    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`${score}`, xPos, y + radius + 2, { align: "center" });
    
    // Label
    doc.setFontSize(9);
    doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
    doc.setFont("helvetica", "bold");
    doc.text(label, xPos, y + radius * 2 + 8, { align: "center" });
  };

  // Calculate Subscores
  const gbpFactors = data.factors.filter(f => f.category === 'gbp');
  const seoFactors = data.factors.filter(f => f.category === 'seo');
  const gbpScore = gbpFactors.reduce((acc, f) => acc + f.score, 0); 
  const gbpMax = gbpFactors.reduce((acc, f) => acc + f.maxScore, 0);
  const seoScore = seoFactors.reduce((acc, f) => acc + f.score, 0); 
  const seoMax = seoFactors.reduce((acc, f) => acc + f.maxScore, 0);

  const gbpPercent = Math.round((gbpScore / (gbpMax || 1)) * 100);
  const seoPercent = Math.round((seoScore / (seoMax || 1)) * 100);

  // Position circles nicely
  const circleY = y;
  drawScoreCircle("Overall Score", data.overallScore, leftMargin + 30);
  drawScoreCircle("GBP Health", gbpPercent, leftMargin + 85);
  drawScoreCircle("SEO Strength", seoPercent, leftMargin + 140);

  y += 55;

  // Ranking Potential Forecast Box
  doc.setFillColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
  doc.rect(leftMargin, y, maxLineWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("RANKING POTENTIAL FORECAST", leftMargin + 5, y + 8);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const potentialText = data.geminiAnalysis.admin_audit?.roi_forecast || "Fixing these critical issues can push this profile to the Top 5 in 120 Days.";
  doc.text(potentialText, leftMargin + 5, y + 16);
  
  y += 40;

  // --- 3. VISUAL GEO-GRID ---
  checkPageBreak(80);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Visual Geo-Grid (Rank Tracking)", leftMargin, y);
  y += 10;

  // Draw 7x7 Grid
  const gridSize = 7;
  const circleSize = 3;
  const gap = 7;
  const startX = leftMargin + 10;
  
  for(let row=0; row<gridSize; row++) {
    for(let col=0; col<gridSize; col++) {
      const cx = startX + (col * gap);
      const cy = y + (row * gap);
      
      const isCenter = row === 3 && col === 3;
      const dist = Math.abs(row - 3) + Math.abs(col - 3);
      
      let color = COLORS.red500;
      if (isCenter) color = COLORS.blue600; // Home
      else if (dist <= 1) color = COLORS.green500;
      else if (dist <= 2) color = COLORS.green500; 
      else if (dist <= 3) color = COLORS.yellow500;
      
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(cx, cy, circleSize, 'F');

      // Add 'You' label to center
      if (isCenter) {
         doc.setTextColor(255, 255, 255);
         doc.setFontSize(4);
         doc.text("YOU", cx, cy+0.5, {align:'center'});
      }
    }
  }

  // Grid Legend/Context
  const legendX = startX + (gridSize * gap) + 20;
  doc.setTextColor(COLORS.slate600[0], COLORS.slate600[1], COLORS.slate600[2]);
  doc.setFontSize(10);
  doc.text("Grid Legend:", legendX, y + 10);
  
  // Legend Dots
  doc.setFillColor(COLORS.green500[0], COLORS.green500[1], COLORS.green500[2]);
  doc.circle(legendX + 2, y + 18, 2, 'F');
  doc.text("Money Zones (Top 3)", legendX + 6, y + 20);

  doc.setFillColor(COLORS.red500[0], COLORS.red500[1], COLORS.red500[2]);
  doc.circle(legendX + 2, y + 28, 2, 'F');
  doc.text("Lost Revenue (Ranking > 10)", legendX + 6, y + 30);

  doc.setFillColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
  doc.circle(legendX + 2, y + 38, 2, 'F');
  doc.text("Your Location", legendX + 6, y + 40);

  y += (gridSize * gap) + 15;

  // --- 4. COMPETITIVE GAP ---
  checkPageBreak(60);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Competitive Gap Analysis", leftMargin, y);
  y += 10;

  // Simple Bar Chart
  const clientRating = data.business.rating;
  const competitorRating = data.geminiAnalysis.admin_audit?.review_gap?.target_rating || 4.8;
  const maxBarWidth = 100;
  
  // You
  doc.setFontSize(11);
  doc.text("You", leftMargin, y + 10);
  doc.setFillColor(COLORS.yellow500[0], COLORS.yellow500[1], COLORS.yellow500[2]);
  doc.rect(leftMargin + 30, y + 2, (clientRating / 5) * maxBarWidth, 8, 'F'); 
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(clientRating.toString(), leftMargin + 30 + ((clientRating / 5) * maxBarWidth) + 5, y + 8);

  // Market Leader
  doc.text("Leader", leftMargin, y + 25);
  doc.setFillColor(COLORS.green500[0], COLORS.green500[1], COLORS.green500[2]);
  doc.rect(leftMargin + 30, y + 17, (competitorRating / 5) * maxBarWidth, 8, 'F');
  doc.text(competitorRating.toString(), leftMargin + 30 + ((competitorRating / 5) * maxBarWidth) + 5, y + 23);

  y += 40;

  // Review Goal Text
  const reviewsNeeded = data.geminiAnalysis.admin_audit?.review_gap?.reviews_needed || 0;
  doc.setFontSize(11);
  doc.setTextColor(COLORS.red500[0], COLORS.red500[1], COLORS.red500[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`REVIEW GOAL: You need exactly ${reviewsNeeded} more 5-star reviews to reach a 4.3+ rating`, leftMargin, y);
  doc.text(`and stop being filtered out by customers.`, leftMargin, y + 6);
  y += 15;

  // --- 5. DETAILED TECHNICAL AUDIT ---
  checkPageBreak(40);
  doc.addPage(); // Force new page
  y = 20;
  addHeader();
  y += 15;

  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Technical Audit", leftMargin, y);
  y += 15;

  // Helper for rows
  const addAuditRow = (factor: ScoringFactor) => {
    checkPageBreak(35);
    
    // Status Badge
    let statusText = "[PASS]";
    let statusColor = COLORS.green500;
    
    if (factor.status === 'warning') { statusText = "[WARN]"; statusColor = COLORS.yellow500; }
    if (factor.status === 'critical') { statusText = "[FAIL]"; statusColor = COLORS.red500; }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, leftMargin, y);

    // Title
    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.text(factor.name, leftMargin + 15, y);

    y += 5;

    // Analysis
    addWrappedText(`Analysis: ${factor.reason}`, 10, "normal", COLORS.slate600);
    
    // Fix (Only for Warn/Fail)
    if (factor.status !== 'good') {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(COLORS.blue600[0], COLORS.blue600[1], COLORS.blue600[2]);
        doc.text("Step-by-Step Fix:", leftMargin, y);
        y += 5;
        addWrappedText(factor.fixAction, 10, "normal", COLORS.slate900);
    }
    
    y += 4; // Spacing
  };

  // Grouped Rendering
  const groups: Record<string, ScoringFactor[]> = {
    "1. Google Business Profile (GBP) Core Signals": [],
    "2. Reputation & Engagement Metrics": [],
    "3. External & Local SEO (Website Signals)": [],
    "4. Competitive Environment": []
  };

  // Sort Factors into Groups based on new IDs from scoringEngine.ts
  data.factors.forEach(f => {
    // Group 1: GBP Core
    if (["cat_rel", "sec_cat", "title_opt", "addr_pin", "prof_comp", "ver_status", "cat_consist", "clean_profile", "website_link"].includes(f.id) || f.id.startsWith("blocker_")) {
       groups["1. Google Business Profile (GBP) Core Signals"].push(f);
    } 
    // Group 2: Reputation
    else if (["review_health", "rev_kw", "freshness", "photo_vol"].includes(f.id)) {
       groups["2. Reputation & Engagement Metrics"].push(f);
    } 
    // Group 3: Website/SEO
    else if (["h1_opt", "title_geo", "seo_nap", "seo_links", "seo_internal", "seo_geo", "seo_auth"].includes(f.id)) {
       groups["3. External & Local SEO (Website Signals)"].push(f);
    } 
    // Group 4: Competitive
    else if (["seo_spam", "market_leader"].includes(f.id)) {
       groups["4. Competitive Environment"].push(f);
    } 
    // Fallback logic
    else {
       if (f.category === 'gbp') groups["1. Google Business Profile (GBP) Core Signals"].push(f);
       else groups["3. External & Local SEO (Website Signals)"].push(f);
    }
  });

  Object.entries(groups).forEach(([groupTitle, factors]) => {
     if (factors.length === 0) return;
     checkPageBreak(20);
     doc.setFillColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
     doc.rect(leftMargin, y, maxLineWidth, 8, 'F');
     doc.setTextColor(255, 255, 255);
     doc.setFontSize(11);
     doc.setFont("helvetica", "bold");
     doc.text(groupTitle, leftMargin + 2, y + 5.5);
     y += 15;

     factors.forEach(addAuditRow);
     y += 5;
  });

  // --- 6. ROI FORECAST ---
  checkPageBreak(40);
  doc.setDrawColor(COLORS.green500[0], COLORS.green500[1], COLORS.green500[2]);
  doc.setLineWidth(1);
  doc.rect(leftMargin, y, maxLineWidth, 30);
  
  doc.setTextColor(COLORS.green500[0], COLORS.green500[1], COLORS.green500[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PROJECTED ROI FORECAST", leftMargin + 5, y + 10);
  
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Resolving these gaps typically results in a 25% to 50% increase in calls", leftMargin + 5, y + 18);
  doc.text("and direction requests within 90-120 days.", leftMargin + 5, y + 24);

  // Footer Numbers
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`ProRankRadar Audit | Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  doc.save(`${data.business.name.replace(/\s+/g, '_')}_audit.pdf`);
};
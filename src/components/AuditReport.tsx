
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Download, ExternalLink, Lock, MessageCircle, X, Check, Unlock, ArrowUpRight, FileText, Grid, TrendingUp } from 'lucide-react';
import type { AuditReportData, ScoringFactor, SiteContent } from '../types';
import { generateAuditPdf } from '../services/pdfGenerator';

interface AuditReportProps {
  data: AuditReportData;
  onReset: () => void;
  isUnlocked?: boolean;
  content?: SiteContent;
}

const AuditReport: React.FC<AuditReportProps> = ({ data, onReset, isUnlocked = false, content }) => {
  const [expandedFactor, setExpandedFactor] = React.useState<string | null>(null);
  const [showPricing, setShowPricing] = React.useState(false);

  // Group factors by section for UI similar to PDF
  const sections = {
    "1. Google Business Profile Core Signals": data.factors.filter(f => ['cat_rel', 'title_opt', 'addr_prox', 'prof_photo'].includes(f.id)),
    "2. Reputation & Engagement": data.factors.filter(f => ['rev_rate', 'rev_vol', 'rev_fresh'].includes(f.id)),
    "3. Website & Local SEO": data.factors.filter(f => ['seo_web', 'seo_title'].includes(f.id)),
    "4. Competitive Environment": data.factors.filter(f => ['comp_gap'].includes(f.id))
  };

  const overallScore = data.overallScore;
  const scoreColor = overallScore >= 80 ? '#22c55e' : overallScore >= 50 ? '#eab308' : '#ef4444';

  const chartData = [
    { name: 'Score', value: overallScore },
    { name: 'Gap', value: 100 - overallScore }
  ];

  const handlePdfDownload = () => {
    if (isUnlocked) {
      generateAuditPdf(data);
    } else {
      setShowPricing(true);
    }
  };

  const whatsappNumber = content?.contact?.phone?.replace(/[^0-9]/g, '') || '15550123456';

  // --- CALCULATE REVIEW GOAL ---
  const competitorRating = data.competitors.length > 0 ? Math.max(...data.competitors.map(c => c.rating)) : 4.8;
  const myRating = data.business.rating || 0;
  const myCount = data.business.user_ratings_total || 0;
  
  let reviewsNeeded = 0;
  if (myRating < competitorRating) {
      const target = Math.min(competitorRating, 4.9);
      reviewsNeeded = Math.ceil((myCount * (target - myRating)) / (5 - target));
      if (reviewsNeeded < 0) reviewsNeeded = 0;
      if (reviewsNeeded > 1000) reviewsNeeded = 999;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className={`px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1 ${isUnlocked ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
               {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
               {isUnlocked ? 'PREMIUM AUDIT UNLOCKED' : 'FREE AUDIT PREVIEW'}
             </span>
           </div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             {data.business.name}
             <a href={data.business.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500">
               <ExternalLink className="w-5 h-5" />
             </a>
           </h1>
           <p className="text-slate-500 text-sm mt-1">{data.business.address}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0 justify-center">
          <button 
            onClick={handlePdfDownload} 
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          
          <button 
            onClick={() => setShowPricing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm transition-colors shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="w-4 h-4" /> Get Help Fixing This
          </button>

          <button onClick={onReset} className="text-sm text-slate-500 hover:text-slate-800 underline ml-2">
            New Audit
          </button>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY (Uses FileText) */}
      {data.geminiAnalysis.executiveSummary && (
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg print:break-inside-avoid">
           <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-300">
             <FileText className="w-5 h-5" /> Executive Summary
           </h3>
           <p className="text-slate-200 leading-relaxed text-sm md:text-base">
             {data.geminiAnalysis.executiveSummary}
           </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Summary & Visuals */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 1. Executive Summary Circles */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
             <h3 className="font-bold text-slate-700 mb-6">Performance Score</h3>
             
             <div className="relative w-40 h-40 mb-4">
               <ResponsiveContainer>
                 <PieChart>
                   <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={65} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                     <Cell fill={scoreColor} />
                     <Cell fill="#f1f5f9" />
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl font-extrabold text-slate-800">{overallScore}</span>
                 <span className="text-xs font-bold text-slate-400 uppercase">Overall</span>
               </div>
             </div>

             <div className="flex justify-center gap-4 w-full">
                <div className="p-3 bg-slate-50 rounded-lg w-1/2">
                   <div className="text-2xl font-bold text-slate-700">
                     {Math.round(sections["1. Google Business Profile Core Signals"].reduce((a,b)=>a+b.score,0) / (45 || 1) * 100)}%
                   </div>
                   <div className="text-[10px] uppercase font-bold text-slate-400">GBP Health</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg w-1/2">
                   <div className="text-2xl font-bold text-slate-700">
                     {Math.round(sections["3. Website & Local SEO"].reduce((a,b)=>a+b.score,0) / (20 || 1) * 100)}%
                   </div>
                   <div className="text-[10px] uppercase font-bold text-slate-400">SEO Strength</div>
                </div>
             </div>
          </div>

          {/* 2. Ranking Forecast (Blue Box) */}
          <div className="bg-blue-600 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Ranking Potential Forecast</h3>
               <p className="font-medium text-lg leading-snug">
                 {data.geminiAnalysis.fixPlan.rankingPotential || "Fixing critical issues can push this profile to the Top 5 within 90 days."}
               </p>
             </div>
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/30 rounded-full blur-xl"></div>
          </div>

          {/* 3. Visual Geo-Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <div className="flex items-center gap-2 mb-4">
                <Grid className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-700">Visual Geo-Grid</h3>
             </div>
             
             <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: 49 }).map((_, i) => {
                   const row = Math.floor(i / 7);
                   const col = i % 7;
                   const isCenter = row === 3 && col === 3;
                   // Logic to simulate grid based on score
                   const dist = Math.max(Math.abs(row - 3), Math.abs(col - 3));
                   
                   let bgClass = 'bg-red-400';
                   const greenRadius = overallScore > 80 ? 3 : overallScore > 60 ? 2 : 1;
                   const yellowRadius = greenRadius + 1;

                   if (isCenter) bgClass = 'bg-blue-600';
                   else if (dist <= greenRadius) bgClass = 'bg-green-500';
                   else if (dist <= yellowRadius) bgClass = 'bg-yellow-400';

                   return (
                     <div key={i} className={`aspect-square rounded-full ${bgClass} shadow-sm transition-all hover:scale-110`} title={isCenter ? "Your Location" : `Rank Check Point ${i+1}`}></div>
                   );
                })}
             </div>
             
             <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Top 3</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div> 10+</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> You</div>
             </div>
          </div>

          {/* 4. ROI Forecast (Green Box) */}
          <div className="bg-green-50 border border-green-200 text-green-900 rounded-xl p-6">
             <h3 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Projected ROI Forecast
             </h3>
             <p className="text-sm leading-relaxed">
               {data.geminiAnalysis.roiForecast || "Resolving these gaps typically results in a 25% to 50% increase in calls and directions within 90-120 days."}
             </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Detailed Audit */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Competitor Gap */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-blue-600" /> Competitive Gap Analysis
              </h3>
              
              <div className="space-y-6">
                 {/* Rating Bars */}
                 <div className="space-y-3">
                    <div className="flex items-center gap-4">
                       <span className="w-16 text-sm font-bold text-slate-600">You</span>
                       <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400" style={{ width: `${(myRating/5)*100}%` }}></div>
                       </div>
                       <span className="w-8 text-sm font-bold text-slate-800">{myRating}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="w-16 text-sm font-bold text-slate-600">Leader</span>
                       <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${(competitorRating/5)*100}%` }}></div>
                       </div>
                       <span className="w-8 text-sm font-bold text-slate-800">{competitorRating}</span>
                    </div>
                 </div>

                 {/* Review Goal Text */}
                 <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                       <div className="text-sm font-bold text-red-700 uppercase mb-1">Review Goal</div>
                       <p className="text-sm text-red-600">
                         You need <strong>{reviewsNeeded} more 5-star reviews</strong> to reach a {Math.min(competitorRating, 4.9).toFixed(1)}+ rating and stop being filtered out by "Top Rated" searches.
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Detailed Sections */}
           {Object.entries(sections).map(([title, factors], idx) => (
             <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                   <h3 className="font-bold text-slate-800">{title}</h3>
                   <span className="text-xs font-bold text-slate-400 uppercase">{factors.length} Checks</span>
                </div>
                <div className="divide-y divide-slate-100">
                   {factors.map(factor => (
                     <FactorRow 
                        key={factor.id} 
                        factor={factor} 
                        isExpanded={expandedFactor === factor.id}
                        onToggle={() => setExpandedFactor(expandedFactor === factor.id ? null : factor.id)}
                        isLocked={!isUnlocked && factor.status !== 'good'}
                        onUnlock={() => setShowPricing(true)}
                     />
                   ))}
                </div>
             </div>
           ))}

        </div>
      </div>

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPricing(false)}></div>
          <div className="relative bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <PricingContent onClose={() => setShowPricing(false)} data={data} content={content} whatsappNumber={whatsappNumber} />
          </div>
        </div>
      )}

    </div>
  );
};

// Extracted Pricing Content to re-enable Check icon usage and better organization
const PricingContent: React.FC<{ onClose: any, data: any, content?: SiteContent, whatsappNumber: string }> = ({ onClose, data, content, whatsappNumber }) => {
  const pricing = content?.pricing || {
    auditOneTime: "30",
    expertOneTime: "150",
    managementSetup: "300",
    managementMonthly: "100"
  };

  return (
  <>
    <div className="p-6 md:p-8 text-center bg-white border-b border-slate-100">
      <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
        <X className="w-6 h-6" />
      </button>
      <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Upgrade Your Ranking Power</h2>
      <p className="text-slate-500 max-w-2xl mx-auto">Choose a plan to fix your Google Business Profile and dominate local search results.</p>
    </div>

    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Plan 1: Basic Audit */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-blue-300 transition-all relative group">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Unlock Full Report</h3>
          <div className="text-sm text-slate-500">For DIY Business Owners</div>
        </div>
        <div className="mb-6">
          <span className="text-4xl font-extrabold text-slate-900">€{pricing.auditOneTime}</span>
          <span className="text-slate-400">/one-time</span>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Unlock specific fix instructions
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Full PDF Download
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> AI Step-by-Step Strategy
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Keyword Optimization Guide
          </li>
        </ul>
        <a 
           href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to purchase the €${pricing.auditOneTime} Full Audit Report for ${data.business.name}.`)}`}
           target="_blank"
           rel="noopener noreferrer"
           className="w-full py-3 rounded-lg border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors text-center"
        >
          Unlock Report
        </a>
      </div>

      {/* Plan 2: Expert Fix (Most Popular) */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-600 p-6 flex flex-col relative transform md:-translate-y-2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
          Most Popular
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Expert Fix</h3>
          <div className="text-sm text-slate-500">We Fix It For You</div>
        </div>
        <div className="mb-6">
          <span className="text-4xl font-extrabold text-slate-900">€{pricing.expertOneTime}</span>
          <span className="text-slate-400 font-medium">/one-time</span>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-700 font-medium">
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" /> <strong>We implement all fixes</strong>
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" /> Title & Category Optimization
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" /> Description & Service Writing
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" /> Photo Geo-tagging & Upload
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" /> One-time detailed consultation
          </li>
        </ul>
        <a 
           href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in the €${pricing.expertOneTime} Expert Fix Service for ${data.business.name}. Please help me fix my profile.`)}`}
           target="_blank"
           rel="noopener noreferrer"
           className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 text-center"
        >
          Hire Expert to Fix
        </a>
      </div>

      {/* Plan 3: Full Management */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-purple-300 transition-all">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Full Management</h3>
          <div className="text-sm text-slate-500">Complete Peace of Mind</div>
        </div>
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-slate-900">€{pricing.managementSetup}</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Setup</span>
          </div>
          <div className="text-sm text-slate-500 mt-1">+ €{pricing.managementMonthly}/month</div>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-purple-600 flex-shrink-0" /> <strong>Everything in Expert Fix</strong>
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-purple-600 flex-shrink-0" /> Weekly GBP Posts (AI Optimized)
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-purple-600 flex-shrink-0" /> Professional Review Replies
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-purple-600 flex-shrink-0" /> Spam Monitoring & Fighting
          </li>
          <li className="flex gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-purple-600 flex-shrink-0" /> Monthly Performance Report
          </li>
        </ul>
        <a 
           href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in the Full Management Plan (€${pricing.managementSetup}+€${pricing.managementMonthly}/mo) for ${data.business.name}.`)}`}
           target="_blank"
           rel="noopener noreferrer"
           className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg text-center"
        >
          Start Management
        </a>
      </div>

    </div>
    
    <div className="p-6 text-center bg-slate-50 border-t border-slate-100">
       <p className="text-sm text-slate-500">All plans include a 100% Satisfaction Guarantee. Secure payment via Stripe or Bank Transfer handled via WhatsApp.</p>
    </div>
  </>
  );
};

const FactorRow: React.FC<{ 
  factor: ScoringFactor; 
  isExpanded: boolean; 
  onToggle: () => void;
  isLocked: boolean;
  onUnlock: () => void;
}> = ({ factor, isExpanded, onToggle, isLocked, onUnlock }) => {
  return (
    <div className="group transition-colors hover:bg-slate-50/50">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {/* Use CheckCircle, AlertTriangle, XCircle to consume imports */}
          {factor.status === 'good' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {factor.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          {factor.status === 'critical' && <XCircle className="w-5 h-5 text-red-500" />}
          
          <div>
            <div className="font-medium text-slate-700 text-sm flex items-center gap-2">
              {factor.name}
              {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
            </div>
            <div className="text-xs text-slate-400 font-normal mt-0.5">
               Impact: <span className={`font-medium ${factor.impact === 'high' ? 'text-red-500' : 'text-slate-500'}`}>{factor.impact.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
              <span className={`text-sm font-bold ${factor.score === factor.maxScore ? 'text-green-600' : 'text-slate-600'}`}>
                {factor.score}/{factor.maxScore}
              </span>
           </div>
           {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-12 pb-4 pt-0">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-sm relative overflow-hidden print:border-slate-300">
             
             {isLocked ? (
                <>
                  <div className="filter blur-sm select-none opacity-60">
                     <div className="mb-3">
                        <span className="font-semibold text-slate-700 block mb-1">Why it Matters:</span>
                        <p className="text-slate-600">Hidden analysis content for pro users only. This specific factor is critical for your local ranking.</p>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-600 block mb-1">The Fix (Step-by-Step):</span>
                        <p className="text-slate-700">Hidden fix content for pro users only. Follow step 1 to 5 to resolve this issue.</p>
                      </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                     <button 
                       onClick={onUnlock}
                       className="px-5 py-2.5 bg-white border-2 border-yellow-400 shadow-lg rounded-lg text-sm font-bold text-slate-800 hover:bg-yellow-50 transition-colors flex items-center gap-2 print:hidden"
                     >
                       <Lock className="w-4 h-4 text-yellow-600" /> Unlock This Result
                     </button>
                     <div className="hidden print:block text-xs font-bold text-slate-500 bg-white/80 p-1 rounded">
                        Upgrade to View
                     </div>
                  </div>
                </>
             ) : (
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Why it Matters:</span>
                    <p className="text-slate-600 whitespace-pre-wrap">{factor.reason}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-600 block mb-1">The Fix (Step-by-Step):</span>
                    <p className="text-slate-700 whitespace-pre-wrap">{factor.fixAction}</p>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditReport;

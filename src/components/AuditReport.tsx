import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Download, ExternalLink, Lock, MessageCircle, X, Check, Unlock, Grid, TrendingUp, ListChecks, Rocket, MapPin, Star, ArrowUpRight, AlertTriangle } from 'lucide-react';
import type { AuditReportData, ScoringFactor, SiteContent } from '../types';
import { generateAuditPdf } from '../services/pdfGenerator';

interface AuditReportProps {
  data: AuditReportData;
  onReset: () => void;
  isUnlocked?: boolean;
  content?: SiteContent;
}

const WHATSAPP_NUMBER = '15550123456'; 

const AuditReport: React.FC<AuditReportProps> = ({ data, onReset, isUnlocked = false, content }) => {
  const [expandedFactor, setExpandedFactor] = React.useState<string | null>(null);
  const [showPricing, setShowPricing] = React.useState(false);

  // If unlocked, use Admin data. If locked, use Free data.
  const isFreeView = !isUnlocked;
  const freeData = data.geminiAnalysis.free_audit;
  const adminData = data.geminiAnalysis.admin_audit;

  // Use correct score based on view
  const displayScore = isUnlocked ? adminData.overall_score : freeData.overall_score;
  const seoStrength = isUnlocked ? adminData.seo_strength : freeData.seo_strength;
  const gbpHealth = isUnlocked ? adminData.gbp_health : freeData.overall_score; // Fallback for free view

  // Group factors for Detailed Technical Audit
  const gbpFactors = data.factors.filter(f => f.category === 'gbp');
  const seoFactors = data.factors.filter(f => f.category === 'seo');
  const gbpScore = gbpFactors.reduce((acc, f) => acc + f.score, 0);
  const gbpMax = gbpFactors.reduce((acc, f) => acc + f.maxScore, 0);
  const seoScoreVal = seoFactors.reduce((acc, f) => acc + f.score, 0);
  const seoMax = seoFactors.reduce((acc, f) => acc + f.maxScore, 0);

  const chartData = [
    { name: 'Score', value: displayScore },
    { name: 'Gap', value: 100 - displayScore }
  ];

  // Score Color
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  // Ranking Potential Text
  const rankingPotentialText = isUnlocked 
    ? adminData.action_plan.technical.includes("Top 3") ? "Top 3 in 90 Days" : "Top 5 in 120 Days"
    : "Top 5 in 120 days"; // Default for free view if not available

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-12 relative print:max-w-full">
      
      {/* 1. Header / Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-0 print:shadow-none print:p-0">
        <div className="w-full">
           {/* Professional Brand Header for PDF */}
           <div className="hidden print:flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-4">
              <div className="font-extrabold text-xl text-slate-900 uppercase tracking-widest">ProRankRadar</div>
              <div className="text-xs font-bold text-slate-500 uppercase">Premium Business Growth Audit</div>
           </div>

           <div className="flex items-center gap-2 mb-1 print:hidden">
             {isUnlocked ? (
               <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                 <Unlock className="w-3 h-3" /> FULL AUDIT (UNLOCKED)
               </span>
             ) : (
               <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 print:border-slate-400">
                 SYMPTOM REPORT
               </span>
             )}
             <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
               {new Date().toLocaleDateString()}
             </span>
           </div>
           
           <div className="flex justify-between items-end">
             <div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 hidden print:block">Prepared For:</div>
               <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mt-2">
                 {data.business.name}
                 <a href={data.business.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 print:hidden">
                   <ExternalLink className="w-5 h-5" />
                 </a>
               </h1>
               <p className="text-slate-500 text-base mt-1">{data.business.address}</p>
             </div>
             <div className="hidden print:block text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Audit Date</div>
                <div className="font-bold text-slate-900">{new Date().toLocaleDateString()}</div>
             </div>
           </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0 justify-center print:hidden flex-shrink-0 ml-4">
          <button 
            onClick={() => generateAuditPdf(data)} 
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          {!isUnlocked && (
             <button 
                onClick={() => setShowPricing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium text-sm transition-colors shadow-lg animate-pulse"
             >
                <Unlock className="w-4 h-4" /> Unlock Master Plan
             </button>
          )}
          {isUnlocked && (
             <button 
               onClick={() => setShowPricing(true)}
               className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm transition-colors shadow-lg shadow-green-500/20"
             >
               <MessageCircle className="w-4 h-4" /> Hire Expert
             </button>
          )}
          <button onClick={onReset} className="text-sm text-slate-500 hover:text-slate-800 underline ml-2">
            New Audit
          </button>
        </div>
      </div>

      {/* --- PAGE 1: EXECUTIVE PERFORMANCE SUMMARY --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-slate-300 print:break-after-page">
         <h2 className="text-center text-lg font-semibold text-slate-700 mb-8 uppercase tracking-wide">Local Ranking Score</h2>
         
         <div className="flex flex-col items-center mb-10">
             <div className="relative w-64 h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData}
                     cx="50%"
                     cy="50%"
                     innerRadius={85}
                     outerRadius={110}
                     startAngle={90}
                     endAngle={-270}
                     dataKey="value"
                     stroke="none"
                   >
                     <Cell key="cell-0" fill={getScoreColor(displayScore)} />
                     <Cell key="cell-1" fill="#f1f5f9" />
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-6xl font-bold text-slate-900 tracking-tighter">{displayScore}</span>
                 <span className="text-sm text-slate-400 uppercase font-bold mt-2">Out of 100</span>
               </div>
             </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
            <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 text-center">
               <div className="text-xs font-bold text-slate-400 uppercase mb-1">GBP Health</div>
               <div className="text-2xl font-bold text-slate-800">{gbpHealth}%</div>
            </div>
            <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 text-center">
               <div className="text-xs font-bold text-slate-400 uppercase mb-1">SEO Strength</div>
               <div className="text-2xl font-bold text-slate-800">{seoStrength}%</div>
            </div>
         </div>

         {/* RANKING POTENTIAL (Always Visible) */}
         <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-red-100 text-red-600 rounded-full flex-shrink-0">
                  <Rocket className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Ranking Potential</h3>
                  <p className="text-slate-500 text-sm mb-3">
                    Based on our analysis, fixing the critical issues below could push this profile to:
                  </p>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {rankingPotentialText}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* --- PAGE 2: VISUAL PROOF & FIX PLAN --- */}
      <div className="space-y-12">
        
        {/* Section 2: Visual "Wow" Factor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:break-inside-avoid">
            
            {/* Geo-Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full print:border-slate-300">
               <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <Grid className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800">Visual Geo-Grid</h3>
               </div>
               
               {/* Client Name & Keyword Label */}
               <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Entity</div>
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-red-500 fill-red-100" />
                      {data.business.name}
                  </div>
                  <div className="text-xs text-slate-500">
                      Keyword: <strong>"{data.inputs.targetKeyword}"</strong>
                  </div>
               </div>
               
               <div className="flex-1 flex flex-col items-center justify-center">
                 <div 
                   className={`grid grid-cols-7 gap-3 aspect-square w-full max-w-[300px] transition-all duration-500 ${isFreeView ? 'blur-md opacity-60' : ''}`}
                   style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                 >
                   {Array.from({ length: 49 }).map((_, i) => {
                     const isCenter = i === 24; // Center of 7x7 grid
                     const dist = Math.abs((i % 7) - 3) + Math.abs(Math.floor(i / 7) - 3);
                     
                     // Center Pin "You Are Here"
                     if (isCenter) {
                        return (
                          <div key={i} className="relative flex items-center justify-center aspect-square z-20">
                              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
                              <div className="relative z-10 bg-blue-600 rounded-full p-1.5 shadow-lg border-2 border-white text-white">
                                  <Star className="w-3.5 h-3.5 fill-current" />
                              </div>
                              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-md">
                                  YOU
                              </div>
                          </div>
                        );
                     }

                     // Simulate ranking distribution: Green in center, yellow mid, red edges
                     let bgClass = 'bg-red-500';
                     let rank = '20+';
                     
                     if (dist <= 1) { bgClass = 'bg-green-500'; rank = '1'; }
                     else if (dist <= 2) { bgClass = 'bg-green-400'; rank = '3'; }
                     else if (dist <= 3) { bgClass = 'bg-yellow-400'; rank = '6'; }
                     else if (dist <= 4) { bgClass = 'bg-orange-400'; rank = '12'; }

                     return (
                       <div 
                         key={i} 
                         className={`${bgClass} rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm print:shadow-none aspect-square`}
                         style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                       >
                         {rank}
                       </div>
                     )
                   })}
                 </div>
                 
                 {isFreeView && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[1px] z-10 pointer-events-none">
                      <div className="bg-white/90 p-4 rounded-xl shadow-xl text-center border border-slate-200 pointer-events-auto">
                         <Lock className="w-6 h-6 text-slate-800 mx-auto mb-2" />
                         <p className="text-xs font-bold text-slate-800 mb-2">Unlock Rankings</p>
                         <button onClick={() => setShowPricing(true)} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-full font-bold">
                            View Grid
                         </button>
                      </div>
                   </div>
                 )}
               </div>
               
               <div className="mt-6 flex justify-between text-xs font-bold text-slate-400 px-4">
                  <span className="text-green-600">● Top 3</span>
                  <span className="text-yellow-500">● 4-9</span>
                  <span className="text-red-500">● 10+</span>
               </div>
            </div>

            {/* Competitor / Review Gap */}
            <div className="bg-slate-900 rounded-xl shadow-lg p-8 text-white flex flex-col h-full print:bg-slate-800 print:text-white print:border-slate-800">
               <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-blue-400" /> The Competitive "Checkmate"
               </h3>
               
               <div className="space-y-8 flex-1">
                  <div className="grid grid-cols-2 gap-4 text-center">
                     <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-sm text-slate-400 mb-1">Your Rating</div>
                        <div className="text-3xl font-bold text-yellow-400">{isFreeView ? freeData.competitor_comparison.my_rating : data.business.rating}</div>
                     </div>
                     <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-sm text-slate-400 mb-1">Market Leader</div>
                        <div className="text-3xl font-bold text-white">{isFreeView ? freeData.competitor_comparison.competitor_avg_rating : adminData.review_gap.target_rating}</div>
                     </div>
                  </div>

                  {isFreeView ? (
                     <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center">
                        <div className="text-red-200 text-xs font-bold uppercase mb-1">Gap Detected</div>
                        <div className="text-white font-medium text-sm">
                           You are <strong>{freeData.competitor_comparison.rating_diff}</strong> points behind the top competitors in {data.inputs.targetCity}.
                        </div>
                     </div>
                  ) : (
                     <div className="text-center">
                       <div className="text-5xl font-extrabold text-blue-400 mb-2">{adminData.review_gap.reviews_needed}</div>
                       <p className="text-sm text-slate-300 font-medium">5-Star Reviews Needed to Win</p>
                       <p className="text-xs text-slate-500 mt-4 leading-relaxed px-4 italic border-t border-white/10 pt-4">
                         "{adminData.review_gap.competitor_comparison_text}"
                       </p>
                     </div>
                  )}
               </div>
            </div>
        </div>

        {/* Section 5: Priority Fix Plan (Roadmap) */}
        {isUnlocked ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:border-slate-300 print:break-inside-avoid">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Priority Fix Plan</h3>
                <Unlock className="w-5 h-5 text-green-500" />
             </div>
             <div className="space-y-6">
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                   <div>
                      <h4 className="font-bold text-slate-800 mb-1">Reputation Management</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {adminData.action_plan.technical || "Launch a reputation campaign to bridge the gap with competitors."}
                      </p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                   <div>
                      <h4 className="font-bold text-slate-800 mb-1">Local Relevance Optimization</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {adminData.action_plan.engagement || "Update business description and posts with neighborhood keywords."}
                      </p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                   <div>
                      <h4 className="font-bold text-slate-800 mb-1">Conversion Triggers</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {adminData.action_plan.conversion || "Implement targeted Q&A and review responses."}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:border-slate-300">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Priority Fix Plan</h3>
                <Lock className="w-5 h-5 text-slate-400" />
             </div>
             <div className="relative">
                <div className="space-y-6 filter blur-sm select-none opacity-50">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="flex gap-4">
                       <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm flex-shrink-0">{i}</div>
                       <div className="w-full">
                          <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-slate-100 rounded w-full"></div>
                          <div className="h-3 bg-slate-100 rounded w-2/3 mt-1"></div>
                       </div>
                     </div>
                   ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                   <button 
                     onClick={() => setShowPricing(true)}
                     className="px-6 py-3 bg-slate-900 text-white font-bold rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                   >
                     <Unlock className="w-4 h-4" /> Unlock Action Plan
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* --- PAGE 3: DETAILED TECHNICAL AUDIT --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-slate-300 print:shadow-none print:break-before-page">
         <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <ListChecks className="w-5 h-5 text-blue-600" /> Detailed Technical Audit
            </h3>
            <span className="text-xs font-bold uppercase bg-white px-3 py-1 rounded border border-slate-200 text-slate-500">Full Analysis</span>
         </div>
         
         <div className="p-8 space-y-12">
            
            {/* GBP Core Signals */}
            <div>
               <div className="flex justify-between items-end mb-4 border-b-2 border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800 text-lg">GBP Core Signals</h4>
                  <span className="font-bold text-slate-600 text-sm">{gbpScore} / {gbpMax} pts</span>
               </div>
               <div className="divide-y divide-slate-100">
                  {gbpFactors.map((factor) => (
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

            {/* External SEO */}
            <div>
               <div className="flex justify-between items-end mb-4 border-b-2 border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800 text-lg">External & Local SEO</h4>
                  <span className="font-bold text-slate-600 text-sm">{seoScoreVal} / {seoMax} pts</span>
               </div>
               <div className="divide-y divide-slate-100">
                  {seoFactors.map((factor) => (
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

         </div>
      </div>

      {/* ROI & Compliance */}
      {isUnlocked && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 flex items-start gap-4 print:break-inside-avoid">
            <div className="p-3 bg-green-100 rounded-full text-green-700 flex-shrink-0">
               <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
               <h3 className="font-bold text-green-900 text-lg mb-1">Projected ROI Forecast</h3>
               <p className="text-green-800 text-sm leading-relaxed">{adminData.roi_forecast}</p>
            </div>
        </div>
      )}

      <div className="text-xs text-slate-400 text-center px-8 italic print:hidden">
         {isUnlocked ? adminData.compliance_notice : "Unlock full report to see compliance details."}
      </div>

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPricing(false)}></div>
          <div className="relative bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <PricingContent onContact={() => {}} onClose={() => setShowPricing(false)} data={data} content={content} />
          </div>
        </div>
      )}

    </div>
  );
};

// --- Helper Components ---

const PricingContent: React.FC<{ onContact: any, onClose: any, data: any, content?: SiteContent }> = ({ onClose, data, content }) => {
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
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Unlock Master Plan View</li>
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> View Ranking Blockers</li>
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> AI Step-by-Step Strategy</li>
        </ul>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'd like to purchase the €${pricing.auditOneTime} Full Master Plan Report for ${data.business.name}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors text-center">Unlock Report</a>
      </div>
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-600 p-6 flex flex-col relative transform md:-translate-y-2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">Most Popular</div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Expert Fix</h3>
          <div className="text-sm text-slate-500">We Fix It For You</div>
        </div>
        <div className="mb-6"><span className="text-4xl font-extrabold text-slate-900">€{pricing.expertOneTime}</span></div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-700 font-medium"><Check className="w-4 h-4 text-blue-600 flex-shrink-0" /> <strong>We implement all fixes</strong></li>
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-blue-600 flex-shrink-0" /> Photo Geo-tagging & Upload</li>
        </ul>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in the €${pricing.expertOneTime} Expert Fix Service for ${data.business.name}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg text-center">Hire Expert</a>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-purple-300 transition-all">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Full Management</h3>
          <div className="text-sm text-slate-500">Complete Peace of Mind</div>
        </div>
        <div className="mb-6"><span className="text-4xl font-extrabold text-slate-900">€{pricing.managementSetup}</span></div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-purple-600 flex-shrink-0" /> <strong>Everything in Expert Fix</strong></li>
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-purple-600 flex-shrink-0" /> Monthly Reporting</li>
        </ul>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in the Full Management Plan for ${data.business.name}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg text-center">Start Management</a>
      </div>
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
        className="py-4 px-2 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex-shrink-0">
             {factor.status === 'good' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
             ) : factor.status === 'warning' ? (
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
             ) : (
                <XCircle className="w-6 h-6 text-red-500" />
             )}
          </div>
          
          <div>
            <div className="font-bold text-slate-800 text-base flex items-center gap-2">
              {factor.name}
              {isLocked && <Lock className="w-3 h-3 text-slate-300" />}
            </div>
            <div className="text-xs font-bold mt-1">
               Impact: <span className={`uppercase ${factor.impact === 'high' ? 'text-red-600' : factor.impact === 'medium' ? 'text-slate-600' : 'text-slate-400'}`}>{factor.impact}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right">
              <span className={`text-base font-bold ${factor.score === factor.maxScore ? 'text-green-600' : 'text-slate-700'}`}>
                {factor.score}/{factor.maxScore}
              </span>
           </div>
           {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="pl-12 pr-4 pb-6 pt-0">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm relative overflow-hidden print:border-slate-300">
             
             {isLocked ? (
                <>
                  <div className="filter blur-sm select-none opacity-60">
                     <div className="mb-4">
                        <span className="font-bold text-slate-800 block mb-1">Why it matters</span>
                        <p className="text-slate-600">Hidden analysis content for pro users only.</p>
                      </div>
                      <div>
                        <span className="font-bold text-blue-700 block mb-1">The Fix (Step-by-Step)</span>
                        <p className="text-slate-700">Hidden fix content for pro users only.</p>
                      </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                     <button 
                       onClick={onUnlock}
                       className="px-5 py-2 bg-white border border-slate-200 shadow-lg rounded-full text-xs font-bold text-slate-800 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center gap-2 print:hidden"
                     >
                       <Lock className="w-3 h-3" /> Unlock Solution
                     </button>
                  </div>
                </>
             ) : (
                <div className="space-y-4">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">Why it matters</span>
                    <p className="text-slate-600 leading-relaxed">{factor.reason}</p>
                  </div>
                  <div>
                    <span className="font-bold text-blue-700 block mb-1">The Fix (Step-by-Step)</span>
                    <div className="text-slate-700 leading-relaxed whitespace-pre-line">{factor.fixAction}</div>
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
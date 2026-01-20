import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Download, ExternalLink, Lock, MessageCircle, X, Check, Unlock, ArrowUpRight } from 'lucide-react';
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

  // Group factors
  const gbpFactors = data.factors.filter(f => f.category === 'gbp');
  const seoFactors = data.factors.filter(f => f.category === 'seo');
  
  // Calculate sub-scores
  const gbpScore = gbpFactors.reduce((acc, f) => acc + f.score, 0);
  const gbpMax = gbpFactors.reduce((acc, f) => acc + f.maxScore, 0);
  const seoScore = seoFactors.reduce((acc, f) => acc + f.score, 0);
  const seoMax = seoFactors.reduce((acc, f) => acc + f.maxScore, 0);

  // Score Color
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const chartData = [
    { name: 'Score', value: data.overallScore },
    { name: 'Gap', value: 100 - data.overallScore }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 relative">
      
      {/* Header / Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-0 print:shadow-none print:p-0">
        <div>
           <div className="flex items-center gap-2 mb-1">
             {isUnlocked ? (
               <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                 <Unlock className="w-3 h-3" /> FULL AUDIT (UNLOCKED)
               </span>
             ) : (
               <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 print:border-slate-400">
                 BASIC AUDIT
               </span>
             )}
           </div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             {data.business.name}
             <a href={data.business.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 print:hidden">
               <ExternalLink className="w-5 h-5" />
             </a>
           </h1>
           <p className="text-slate-500 text-sm mt-1">{data.business.address}</p>
        </div>
        
        {/* Actions - Hidden on Print */}
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0 justify-center print:hidden">
          <button onClick={() => generateAuditPdf(data)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
            <Download className="w-4 h-4" /> PDF
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Score & Fix Plan */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Overall Score Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center print:border-slate-300 print:break-inside-avoid">
             <h2 className="text-lg font-semibold text-slate-700 mb-4">Local Ranking Score</h2>
             <div className="relative w-48 h-48">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     startAngle={90}
                     endAngle={-270}
                     dataKey="value"
                     stroke="none"
                   >
                     <Cell key="cell-0" fill={getScoreColor(data.overallScore)} />
                     <Cell key="cell-1" fill="#f1f5f9" />
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl font-bold text-slate-800">{data.overallScore}</span>
                 <span className="text-xs text-slate-500 uppercase font-medium">Out of 100</span>
               </div>
             </div>
             
             <div className="w-full grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-slate-50 rounded-lg print:border print:border-slate-200">
                  <div className="text-xs text-slate-500 uppercase mb-1">GBP Health</div>
                  <div className="font-bold text-slate-700">{Math.round((gbpScore/(gbpMax || 1))*100)}%</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg print:border print:border-slate-200">
                  <div className="text-xs text-slate-500 uppercase mb-1">SEO Strength</div>
                  <div className="font-bold text-slate-700">{Math.round((seoScore/(seoMax || 1))*100)}%</div>
                </div>
             </div>
          </div>

          {/* AI Ranking Potential */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden print:bg-none print:bg-slate-800 print:text-white print:break-inside-avoid">
             <div className="relative z-10">
               <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                 🚀 Ranking Potential
               </h3>
               <p className="opacity-90 text-sm mb-4 leading-relaxed">
                 Based on our analysis, fixing the critical issues below could push this profile to:
               </p>
               <div className="text-2xl font-bold bg-white/20 inline-block px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 print:border-white">
                 {data.geminiAnalysis.fixPlan.rankingPotential}
               </div>
             </div>
          </div>

          {/* ROI FORECAST (New Section) */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 print:break-inside-avoid shadow-sm">
             <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-full text-green-700 flex-shrink-0 mt-1">
                   <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-green-900 text-sm mb-2 uppercase tracking-wide">Projected ROI Forecast</h3>
                   <p className="text-green-800 text-sm leading-relaxed">
                     {data.geminiAnalysis.roiForecast || "Based on your current Local Ranking Score, fixing these points typically results in a 25% to 50% increase in calls within 90-120 days."}
                   </p>
                </div>
             </div>
          </div>

          {/* Fix Plan (LOCKED or UNLOCKED) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden print:border-slate-300 print:break-inside-avoid">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Priority Fix Plan</h3>
              {isUnlocked ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
            </div>
            
            <div className={`space-y-4 ${isUnlocked ? '' : 'blur-sm select-none opacity-50'}`}>
              {[
                data.geminiAnalysis.fixPlan.step1,
                data.geminiAnalysis.fixPlan.step2,
                data.geminiAnalysis.fixPlan.step3
              ].map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5 print:bg-slate-200 print:text-slate-800">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            {/* Lock Overlay - Only if NOT unlocked */}
            {!isUnlocked && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 z-10">
                  <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 max-w-xs print:shadow-none print:border-slate-300">
                    <Lock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-800 mb-1">Unlock Pro Plan</h4>
                    <p className="text-xs text-slate-500 mb-3">Reveal the step-by-step strategy.</p>
                    <button 
                      onClick={() => setShowPricing(true)}
                      className="block w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-lg text-sm font-bold hover:shadow-lg transition-all print:hidden"
                    >
                      View Upgrade Options
                    </button>
                    <div className="hidden print:block text-xs font-bold text-slate-500 mt-2">
                      (Upgrade required to view)
                    </div>
                  </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Detailed Audit Factors */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Section 1: GBP Signals */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-slate-300 print:break-inside-avoid">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center print:bg-slate-100 print:border-slate-300">
                 <h3 className="font-bold text-slate-800">GBP Core Signals</h3>
                 <span className="text-sm font-medium text-slate-500">{gbpScore} / {gbpMax} pts</span>
              </div>
              <div className="divide-y divide-slate-100 print:divide-slate-200">
                {gbpFactors.map((factor) => (
                  <FactorRow 
                    key={factor.id} 
                    factor={factor} 
                    isExpanded={expandedFactor === factor.id}
                    onToggle={() => setExpandedFactor(expandedFactor === factor.id ? null : factor.id)}
                    isLocked={!isUnlocked && factor.status !== 'good'} // If unlocked, show everything. If not, lock issues.
                    onUnlock={() => setShowPricing(true)}
                  />
                ))}
              </div>
           </div>

           {/* Section 2: External SEO */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-slate-300 print:break-inside-avoid">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center print:bg-slate-100 print:border-slate-300">
                 <h3 className="font-bold text-slate-800">External & Local SEO</h3>
                 <span className="text-sm font-medium text-slate-500">{seoScore} / {seoMax} pts</span>
              </div>
              <div className="divide-y divide-slate-100 print:divide-slate-200">
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

      {/* Pricing Modal - Hidden on Print */}
      {showPricing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPricing(false)}></div>
          <div className="relative bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <PricingContent onClose={() => setShowPricing(false)} data={data} content={content} />
          </div>
        </div>
      )}

    </div>
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
          {factor.status === 'good' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {factor.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          {factor.status === 'critical' && <XCircle className="w-5 h-5 text-red-500" />}
          
          <div>
            <div className="font-medium text-slate-700 text-sm flex items-center gap-2">
              {factor.name}
              {isLocked && <Lock className="w-3 h-3 text-slate-300" />}
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
             
             {/* If Locked, blur content and show CTA */}
             {isLocked ? (
                <>
                  <div className="filter blur-sm select-none opacity-60">
                     <div className="mb-3">
                        <span className="font-semibold text-slate-700 block mb-1">Why it Matters:</span>
                        <p className="text-slate-600">Hidden analysis content for pro users only.</p>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-600 block mb-1">The Fix (Step-by-Step):</span>
                        <p className="text-slate-700">Hidden fix content for pro users only.</p>
                      </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                     <button 
                       onClick={onUnlock}
                       className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-full text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center gap-2 print:hidden"
                     >
                       <Lock className="w-3 h-3" /> Unlock Solution
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

const PricingContent: React.FC<{ onClose: any, data: any, content?: SiteContent }> = ({ onClose, data, content }) => {
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
           href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'd like to purchase the €${pricing.auditOneTime} Full Audit Report for ${data.business.name}.`)}`}
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
          <span className="text-slate-400">/one-time</span>
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
           href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in the €${pricing.expertOneTime} Expert Fix Service for ${data.business.name}. Please help me fix my profile.`)}`}
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
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">Setup</span>
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
           href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in the Full Management Plan (€${pricing.managementSetup}+€${pricing.managementMonthly}/mo) for ${data.business.name}.`)}`}
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

export default AuditReport;
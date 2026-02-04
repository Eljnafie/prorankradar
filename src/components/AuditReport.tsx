
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Download, ExternalLink, Lock, MessageCircle, Unlock, Shield, TrendingUp, Zap, Target, BarChart2, X } from 'lucide-react';
import type { AuditReportData, ScoringFactor, SiteContent } from '../types';
import { generateAuditPdf } from '../services/pdfGenerator';

interface AuditReportProps {
  data: AuditReportData;
  onReset: () => void;
  isUnlocked?: boolean;
  content?: SiteContent;
}

const AuditReport: React.FC<AuditReportProps> = ({ data, onReset, isUnlocked = false, content }) => {
  const [showPricing, setShowPricing] = React.useState(false);
  const [expandedFactor, setExpandedFactor] = React.useState<string | null>(null);

  const dashboard = data.geminiAnalysis.executive_dashboard;
  const kpis = dashboard.kpis;
  const roadmap = data.geminiAnalysis.prioritized_action_roadmap;
  const breakdown = data.geminiAnalysis.audit_analysis_breakdown;

  // Chart Data for the main Visibility Score
  const score = kpis.visibility_confidence.value;
  const scoreColor = score >= 75 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444';
  const chartData = [{ name: 'Score', value: score }, { name: 'Gap', value: 100 - score }];

  const handlePdfDownload = () => {
    if (isUnlocked) {
      generateAuditPdf(data);
    } else {
      setShowPricing(true);
    }
  };

  const whatsappNumber = content?.contact?.phone?.replace(/[^0-9]/g, '') || '15550123456';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 relative font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className={`px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1 ${isUnlocked ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
               {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
               {isUnlocked ? 'EXECUTIVE REPORT (UNLOCKED)' : 'AUDIT PREVIEW'}
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
          <button onClick={handlePdfDownload} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
            <Download className="w-4 h-4" /> PDF Report
          </button>
          <button onClick={() => setShowPricing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-lg shadow-blue-500/20">
            <MessageCircle className="w-4 h-4" /> Speak to Strategist
          </button>
          <button onClick={onReset} className="text-sm text-slate-500 hover:text-slate-800 underline ml-2">New Audit</button>
        </div>
      </div>

      {/* KPI DASHBOARD (Fintech Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Trust Health (Dark Card) */}
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 relative overflow-hidden group shadow-lg">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield className="w-24 h-24" />
           </div>
           <div className="relative z-10">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{kpis.trust_health_score.label}</div>
              <div className="text-4xl font-extrabold mb-2">{kpis.trust_health_score.value}/100</div>
              <p className="text-slate-400 text-sm leading-relaxed">{kpis.trust_health_score.description}</p>
           </div>
        </div>

        {/* KPI 2: Visibility Confidence (Main Score) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative">
           <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{kpis.visibility_confidence.label}</div>
           <div className="relative w-32 h-32 my-2">
             <ResponsiveContainer>
               <PieChart>
                 <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                   <Cell fill={scoreColor} />
                   <Cell fill="#f1f5f9" />
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-2xl font-extrabold text-slate-800">{score}</span>
             </div>
           </div>
           <p className="text-slate-600 text-sm px-4">{kpis.visibility_confidence.description}</p>
        </div>

        {/* KPI 3: Commercial Engine */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 relative">
           <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{kpis.commercial_engine.label}</div>
           <div className="text-4xl font-extrabold text-slate-800 mb-2">{kpis.commercial_engine.value}/100</div>
           <p className="text-slate-600 text-sm leading-relaxed">{kpis.commercial_engine.description}</p>
           <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-xs font-bold text-green-600 flex items-center gap-1">
                 <TrendingUp className="w-3 h-3" /> Potential Growth: {data.geminiAnalysis.roi_projection.estimated_growth}
              </div>
           </div>
        </div>
      </div>

      {/* STRATEGIC BREAKDOWN & ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Left: Analysis Breakdown (Reality Mirror) */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
               <Target className="w-5 h-5 text-blue-600" /> Strategic Analysis
            </h3>
            
            <div className="space-y-4">
               <AnalysisCard title="Profile Accuracy" data={breakdown.profile_accuracy} />
               <AnalysisCard title="Reputation Intelligence" data={breakdown.reputation_intelligence} />
               <AnalysisCard title="Media & Engagement" data={breakdown.media_engagement} />
               <AnalysisCard title="Competitive Positioning" data={breakdown.competitive_positioning} />
            </div>
         </div>

         {/* Right: Roadmap & Actions */}
         <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
               <Zap className="w-5 h-5 text-yellow-500" /> Action Roadmap
            </h3>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               {/* Phase 1 */}
               <div className="p-5 border-b border-slate-100">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Phase 1: Foundation</div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2">{roadmap.phase_1_foundation.title}</h4>
                  <ul className="space-y-2 mb-3">
                     {roadmap.phase_1_foundation.actions.map((act, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                           {act}
                        </li>
                     ))}
                  </ul>
                  <div className="text-xs text-slate-400 italic">Goal: {roadmap.phase_1_foundation.goal}</div>
               </div>

               {/* Phase 2 (Blurred if locked) */}
               <div className={`p-5 border-b border-slate-100 relative ${!isUnlocked ? 'bg-slate-50' : ''}`}>
                  <div className={!isUnlocked ? 'filter blur-sm select-none opacity-50' : ''}>
                     <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Phase 2: Conversion</div>
                     <h4 className="font-bold text-slate-800 text-sm mb-2">{roadmap.phase_2_conversion.title}</h4>
                     <ul className="space-y-2 mb-3">
                        {roadmap.phase_2_conversion.actions.map((act, i) => (
                           <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
                              {act}
                           </li>
                        ))}
                     </ul>
                     <div className="text-xs text-slate-400 italic">Goal: {roadmap.phase_2_conversion.goal}</div>
                  </div>
                  {!isUnlocked && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-slate-400" />
                     </div>
                  )}
               </div>

               {/* Phase 3 (Blurred if locked) */}
               <div className={`p-5 relative ${!isUnlocked ? 'bg-slate-50' : ''}`}>
                  <div className={!isUnlocked ? 'filter blur-sm select-none opacity-50' : ''}>
                     <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Phase 3: Authority</div>
                     <h4 className="font-bold text-slate-800 text-sm mb-2">{roadmap.phase_3_authority.title}</h4>
                     <ul className="space-y-2 mb-3">
                        {roadmap.phase_3_authority.actions.map((act, i) => (
                           <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                              {act}
                           </li>
                        ))}
                     </ul>
                     <div className="text-xs text-slate-400 italic">Goal: {roadmap.phase_3_authority.goal}</div>
                  </div>
                  {!isUnlocked && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <button onClick={() => setShowPricing(true)} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 transition-colors">
                           Unlock Full Plan
                        </button>
                     </div>
                  )}
               </div>
            </div>

            {/* Technical Factors List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
               <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                     <BarChart2 className="w-4 h-4 text-slate-500" /> Technical Signals
                  </h4>
               </div>
               <div className="divide-y divide-slate-100">
                  {data.factors.map(factor => (
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

// Sub-components

const AnalysisCard: React.FC<{ title: string; data: any }> = ({ title, data }) => (
   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
      <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
      <div className="space-y-2">
         <div className="text-sm text-slate-600"><strong className="text-blue-600">Expert Insight:</strong> {data.expert_insight}</div>
         <div className="text-sm text-slate-600"><strong className="text-red-500">The Gap:</strong> {data.the_gap}</div>
      </div>
   </div>
);

const PricingContent: React.FC<{ onClose: any, data: any, content?: SiteContent, whatsappNumber: string }> = ({ onClose, data, content, whatsappNumber }) => {
  const pricing = content?.pricing || { auditOneTime: "30", expertOneTime: "150", managementSetup: "300", managementMonthly: "100" };
  return (
  <>
    <div className="p-6 md:p-8 text-center bg-white border-b border-slate-100">
      <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
      <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Execute The Roadmap</h2>
      <p className="text-slate-500 max-w-2xl mx-auto">Turn these insights into revenue. Choose your execution path.</p>
    </div>
    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-blue-300 transition-all relative group">
        <div className="mb-4"><h3 className="text-lg font-bold text-slate-800">Unlock Report</h3><div className="text-sm text-slate-500">Do It Yourself</div></div>
        <div className="mb-6"><span className="text-4xl font-extrabold text-slate-900">€{pricing.auditOneTime}</span><span className="text-slate-400">/one-time</span></div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Full Roadmap Access</li>
          <li className="flex gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Technical Fix Guide</li>
        </ul>
        <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to purchase the €${pricing.auditOneTime} Full Audit Report for ${data.business.name}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors text-center">Unlock Now</a>
      </div>
      <div className="bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 p-6 flex flex-col relative transform md:-translate-y-2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">Recommended</div>
        <div className="mb-4"><h3 className="text-lg font-bold">Expert Fix</h3><div className="text-sm text-slate-400">We Fix It For You</div></div>
        <div className="mb-6"><span className="text-4xl font-extrabold">€{pricing.expertOneTime}</span><span className="text-slate-400 font-medium">/one-time</span></div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-300"><CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" /> <strong>We implement Phase 1 & 2</strong></li>
          <li className="flex gap-2 text-sm text-slate-300"><CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" /> Eliminate "Trust Health" Risks</li>
          <li className="flex gap-2 text-sm text-slate-300"><CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" /> Optimize for Visibility</li>
        </ul>
        <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in the €${pricing.expertOneTime} Expert Fix Service for ${data.business.name}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 text-center">Book Expert Fix</a>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-purple-300 transition-all">
        <div className="mb-4"><h3 className="text-lg font-bold text-slate-800">Growth Partner</h3><div className="text-sm text-slate-500">Full Management</div></div>
        <div className="mb-6"><div className="flex items-baseline gap-1"><span className="text-4xl font-extrabold text-slate-900">€{pricing.managementSetup}</span><span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Setup</span></div><div className="text-sm text-slate-500 mt-1">+ €{pricing.managementMonthly}/month</div></div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" /> <strong>Phase 3 Authority Building</strong></li>
          <li className="flex gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" /> Weekly Optimization</li>
          <li className="flex gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" /> Review & Q&A Management</li>
        </ul>
        <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in the Full Management Plan (€${pricing.managementSetup}+€${pricing.managementMonthly}/mo) for ${data.business.name}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg text-center">Partner With Us</a>
      </div>
    </div>
  </>
  );
};

const FactorRow: React.FC<{ factor: ScoringFactor; isExpanded: boolean; onToggle: () => void; isLocked: boolean; onUnlock: () => void; }> = ({ factor, isExpanded, onToggle, isLocked, onUnlock }) => {
  return (
    <div className="group transition-colors hover:bg-slate-50/50 bg-white">
      <div className="p-3 flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3">
          {factor.status === 'good' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {factor.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          {factor.status === 'critical' && <XCircle className="w-4 h-4 text-red-500" />}
          <div>
            <div className="font-medium text-slate-700 text-xs flex items-center gap-2">{factor.name} {isLocked && <Lock className="w-3 h-3 text-slate-400" />}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      {isExpanded && (
        <div className="px-3 pb-3 pt-0">
          <div className="bg-slate-50 rounded p-3 text-xs relative overflow-hidden">
             {isLocked ? (
                <>
                  <div className="filter blur-sm select-none opacity-60">
                     <div className="mb-2"><span className="font-bold text-slate-700 block">Analysis:</span><p className="text-slate-600 whitespace-pre-wrap">{factor.reason}</p></div>
                     <div><span className="font-bold text-blue-600 block">Fix:</span><p className="text-slate-700 whitespace-pre-wrap">{factor.fixAction}</p></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                     <button onClick={onUnlock} className="px-3 py-1.5 bg-white border border-slate-300 shadow-sm rounded text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1 print:hidden"><Lock className="w-3 h-3" /> Unlock</button>
                  </div>
                </>
             ) : (
                <div className="space-y-2">
                  <div><span className="font-bold text-slate-700 block">Analysis:</span><p className="text-slate-600 whitespace-pre-wrap">{factor.reason}</p></div>
                  <div><span className="font-bold text-blue-600 block">Fix:</span><p className="text-slate-700 whitespace-pre-wrap">{factor.fixAction}</p></div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditReport;

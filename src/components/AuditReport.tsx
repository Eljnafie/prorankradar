
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Download, ExternalLink, Lock, MessageCircle, Check, Unlock, TrendingUp, Shield, MousePointerClick, Activity, X, FileText } from 'lucide-react';
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

  const { geminiAnalysis } = data;

  // Group Factors based on V3 Categories
  const sections = {
    "A. Profile Safety": {
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      factors: data.factors.filter(f => f.category === 'profile_safety'),
      analysis: geminiAnalysis.signal_separation.profile_safety
    },
    "B. User Trust": {
      icon: <Activity className="w-5 h-5 text-green-600" />,
      factors: data.factors.filter(f => f.category === 'user_trust'),
      analysis: geminiAnalysis.signal_separation.user_trust
    },
    "C. Visibility & Competition": {
      icon: <MousePointerClick className="w-5 h-5 text-purple-600" />,
      factors: data.factors.filter(f => f.category === 'visibility_and_competition'),
      analysis: geminiAnalysis.signal_separation.visibility_and_competition
    }
  };

  const lvcScore = geminiAnalysis.local_visibility_coverage.lvc_score_percent;
  const scoreColor = lvcScore >= 50 ? '#22c55e' : lvcScore >= 20 ? '#eab308' : '#ef4444';
  const chartData = [{ name: 'Score', value: lvcScore }, { name: 'Gap', value: 100 - lvcScore }];

  const handlePdfDownload = () => {
    if (isUnlocked) {
      generateAuditPdf(data);
    } else {
      setShowPricing(true);
    }
  };

  const whatsappNumber = content?.contact?.phone?.replace(/[^0-9]/g, '') || '15550123456';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className={`px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1 ${isUnlocked ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
               {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
               {isUnlocked ? 'V3 AUDIT (UNLOCKED)' : 'AUDIT PREVIEW'}
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
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button onClick={() => setShowPricing(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm transition-colors shadow-lg shadow-green-500/20">
            <MessageCircle className="w-4 h-4" /> Get Help Fixing This
          </button>
          <button onClick={onReset} className="text-sm text-slate-500 hover:text-slate-800 underline ml-2">New Audit</button>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY & WARNINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Main Opportunity */}
         <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 relative z-10">
               <FileText className="w-5 h-5 text-blue-500" /> Executive Summary
            </h3>
            <div className="space-y-4 relative z-10">
               <p className="text-sm text-slate-600 leading-relaxed">
                 {geminiAnalysis.executive_summary.plain_language_summary}
               </p>
               <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-900">
                 <strong>Primary Opportunity:</strong> {geminiAnalysis.executive_summary.primary_opportunity}
               </div>
            </div>
         </div>

         {/* LVC Score Box */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
               <Activity className="w-5 h-5 text-blue-600" /> Local Visibility Coverage (LVC)
            </h3>
            <div className="flex items-center gap-4">
               <div className="text-4xl font-extrabold text-slate-900">{lvcScore}%</div>
               <div className="flex-1">
                  <div className="text-sm font-bold text-slate-700 mb-1 capitalize">
                    {geminiAnalysis.executive_summary.current_visibility_status.replace('_', ' ')}
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div className="h-full" style={{ width: `${lvcScore}%`, backgroundColor: scoreColor }}></div>
                  </div>
               </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">{geminiAnalysis.local_visibility_coverage.simple_explanation}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Visuals & Scorecard */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
             <h3 className="font-bold text-slate-700 mb-6">Market Reach</h3>
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
                 <span className="text-4xl font-extrabold text-slate-800">{lvcScore}</span>
                 <span className="text-xs font-bold text-slate-400 uppercase">/ 100</span>
               </div>
             </div>
          </div>

          {/* Baseline Scorecard */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Baseline Scorecard</h3>
             <div className="space-y-3">
                <ScorecardRow label="Profile Safety" value={geminiAnalysis.baseline_scorecard.profile_safety} />
                <ScorecardRow label="User Trust" value={geminiAnalysis.baseline_scorecard.user_trust} />
                <ScorecardRow label="Engagement" value={geminiAnalysis.baseline_scorecard.engagement_activity} />
                <ScorecardRow label="Visibility" value={geminiAnalysis.baseline_scorecard.local_visibility} />
             </div>
             <p className="text-xs text-slate-400 mt-4 italic">{geminiAnalysis.baseline_scorecard.notes}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Signal Separation */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Detailed Signal Analysis */}
           {Object.entries(sections).map(([title, { icon, factors, analysis }], idx) => (
             <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                   <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">{icon} {title}</h3>
                      <span className="text-xs font-bold text-slate-400 uppercase bg-white border border-slate-200 px-2 py-1 rounded-full">{factors.length} Checks</span>
                   </div>
                   <div className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">Analysis: </span>{analysis.current_state}
                   </div>
                </div>
                <div className="divide-y divide-slate-100">
                   {factors.map(factor => (
                     <FactorRow key={factor.id} factor={factor} isExpanded={expandedFactor === factor.id} onToggle={() => setExpandedFactor(expandedFactor === factor.id ? null : factor.id)} isLocked={!isUnlocked && factor.status !== 'good'} onUnlock={() => setShowPricing(true)} />
                   ))}
                </div>
             </div>
           ))}
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

const ScorecardRow: React.FC<{ label: string, value: string }> = ({ label, value }) => {
  const getColor = (v: string) => {
    switch(v.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-50 border-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'low': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };
  return (
    <div className="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-2 last:pb-0">
      <span className="text-slate-600">{label}</span>
      <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase ${getColor(value)}`}>{value}</span>
    </div>
  );
};

const PricingContent: React.FC<{ onClose: any, data: any, content?: SiteContent, whatsappNumber: string }> = ({ onClose, data, content, whatsappNumber }) => {
  const pricing = content?.pricing || { auditOneTime: "30", expertOneTime: "150", managementSetup: "300", managementMonthly: "100" };
  return (
  <>
    <div className="p-6 md:p-8 text-center bg-white border-b border-slate-100">
      <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
      <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Upgrade Your Ranking Power</h2>
      <p className="text-slate-500 max-w-2xl mx-auto">Unlock critical Trust & Transactional insights to protect and grow your profile.</p>
    </div>
    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-blue-300 transition-all relative group">
        <div className="mb-4"><h3 className="text-lg font-bold text-slate-800">Unlock Full Report</h3><div className="text-sm text-slate-500">For DIY Business Owners</div></div>
        <div className="mb-6"><span className="text-4xl font-extrabold text-slate-900">€{pricing.auditOneTime}</span><span className="text-slate-400">/one-time</span></div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Unlock Suspension Risk Fixes</li>
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Unlock NAP Inconsistencies</li>
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Full PDF Download</li>
        </ul>
        <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to purchase the €${pricing.auditOneTime} Full Audit Report for ${data.business.name}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors text-center">Unlock Report</a>
      </div>
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-600 p-6 flex flex-col relative transform md:-translate-y-2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">Most Popular</div>
        <div className="mb-4"><h3 className="text-lg font-bold text-slate-800">Expert Fix</h3><div className="text-sm text-slate-500">We Fix It For You</div></div>
        <div className="mb-6"><span className="text-4xl font-extrabold text-slate-900">€{pricing.expertOneTime}</span><span className="text-slate-400 font-medium">/one-time</span></div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-700 font-medium"><Check className="w-4 h-4 text-blue-600 flex-shrink-0" /> <strong>We implement all fixes</strong></li>
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-blue-600 flex-shrink-0" /> Clean up NAP Data Errors</li>
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-blue-600 flex-shrink-0" /> Remove Risk of Suspension</li>
        </ul>
        <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in the €${pricing.expertOneTime} Expert Fix Service for ${data.business.name}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 text-center">Hire Expert to Fix</a>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-purple-300 transition-all">
        <div className="mb-4"><h3 className="text-lg font-bold text-slate-800">Full Management</h3><div className="text-sm text-slate-500">Complete Peace of Mind</div></div>
        <div className="mb-6"><div className="flex items-baseline gap-1"><span className="text-4xl font-extrabold text-slate-900">€{pricing.managementSetup}</span><span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Setup</span></div><div className="text-sm text-slate-500 mt-1">+ €{pricing.managementMonthly}/month</div></div>
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-purple-600 flex-shrink-0" /> <strong>Everything in Expert Fix</strong></li>
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-purple-600 flex-shrink-0" /> Weekly Activity Posts</li>
          <li className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-purple-600 flex-shrink-0" /> Ongoing Spam Protection</li>
        </ul>
        <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in the Full Management Plan (€${pricing.managementSetup}+€${pricing.managementMonthly}/mo) for ${data.business.name}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg text-center">Start Management</a>
      </div>
    </div>
  </>
  );
};

const FactorRow: React.FC<{ factor: ScoringFactor; isExpanded: boolean; onToggle: () => void; isLocked: boolean; onUnlock: () => void; }> = ({ factor, isExpanded, onToggle, isLocked, onUnlock }) => {
  return (
    <div className="group transition-colors hover:bg-slate-50/50">
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3">
          {factor.status === 'good' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {factor.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          {factor.status === 'critical' && <XCircle className="w-5 h-5 text-red-500" />}
          <div>
            <div className="font-medium text-slate-700 text-sm flex items-center gap-2">{factor.name} {isLocked && <Lock className="w-3 h-3 text-slate-400" />}</div>
            <div className="text-xs text-slate-400 font-normal mt-0.5">Impact: <span className={`font-medium ${factor.impact === 'high' ? 'text-red-500' : 'text-slate-500'}`}>{factor.impact.toUpperCase()}</span></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end"><span className={`text-sm font-bold ${factor.score === factor.maxScore ? 'text-green-600' : 'text-slate-600'}`}>{factor.score}/{factor.maxScore}</span></div>
           {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      {isExpanded && (
        <div className="px-12 pb-4 pt-0">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-sm relative overflow-hidden print:border-slate-300">
             {isLocked ? (
                <>
                  <div className="filter blur-sm select-none opacity-60">
                     <div className="mb-3"><span className="font-semibold text-slate-700 block mb-1">Analysis:</span><p className="text-slate-600 whitespace-pre-wrap">{factor.reason}</p></div>
                     <div><span className="font-semibold text-blue-600 block mb-1">Recommended Fix:</span><p className="text-slate-700 whitespace-pre-wrap">{factor.fixAction}</p></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                     <button onClick={onUnlock} className="px-5 py-2.5 bg-white border-2 border-yellow-400 shadow-lg rounded-lg text-sm font-bold text-slate-800 hover:bg-yellow-50 transition-colors flex items-center gap-2 print:hidden"><Lock className="w-4 h-4 text-yellow-600" /> Unlock This Result</button>
                     <div className="hidden print:block text-xs font-bold text-slate-500 bg-white/80 p-1 rounded">Upgrade to View</div>
                  </div>
                </>
             ) : (
                <div className="space-y-3">
                  <div><span className="font-semibold text-slate-700 block mb-1">Analysis:</span><p className="text-slate-600 whitespace-pre-wrap">{factor.reason}</p></div>
                  <div><span className="font-semibold text-blue-600 block mb-1">Recommended Fix:</span><p className="text-slate-700 whitespace-pre-wrap">{factor.fixAction}</p></div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditReport;

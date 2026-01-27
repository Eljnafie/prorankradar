
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Download, ExternalLink, Lock, MessageCircle, Check, Unlock, ArrowUpRight, Grid, TrendingUp, Shield, Zap, MousePointerClick, Activity, HeartCrack, X } from 'lucide-react';
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

  // Group Factors
  const sections = {
    "1. Trust & Technical Foundation": {
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      factors: data.factors.filter(f => f.category === 'trust')
    },
    "2. Commercial Engine & Engagement": {
      icon: <Activity className="w-5 h-5 text-green-600" />,
      factors: data.factors.filter(f => f.category === 'gbp')
    },
    "3. Conversion & Action Readiness": {
      icon: <MousePointerClick className="w-5 h-5 text-purple-600" />,
      factors: data.factors.filter(f => f.category === 'conversion')
    },
    "4. Local SEO Authority": {
      icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
      factors: data.factors.filter(f => f.category === 'seo')
    }
  };

  const overallScore = data.overallScore;
  const scoreColor = overallScore >= 80 ? '#22c55e' : overallScore >= 50 ? '#eab308' : '#ef4444';
  const chartData = [{ name: 'Score', value: overallScore }, { name: 'Gap', value: 100 - overallScore }];

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
         {/* Sentiment / Trust Gap Warning */}
         <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-2 -mt-2"></div>
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 relative z-10">
               <HeartCrack className="w-5 h-5 text-red-500" /> Review Sentiment Gap
            </h3>
            <div className="space-y-3 relative z-10">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Your Rating</span>
                  <span className="font-bold text-red-600">{data.business.rating} ★</span>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${(data.business.rating / 5) * 100}%` }}></div>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Market Leader Target</span>
                  <span className="font-bold text-green-600">4.9 ★</span>
               </div>
               <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                  <strong>Trust Gap Analysis:</strong> You are {data.geminiAnalysis.sentimentAnalysis.trustGap.toFixed(1)} stars behind the leader. This gap acts as a "Conversion Killer". You need approximately <strong>{data.geminiAnalysis.sentimentAnalysis.reviewsNeeded} new 5-star reviews</strong> to compete.
               </p>
            </div>
         </div>

         {/* Commercial Status / Ghost Profile */}
         <div className={`p-6 rounded-xl border shadow-sm relative overflow-hidden ${data.geminiAnalysis.commercialStatus.isGhostProfile ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
            <h3 className={`font-bold mb-2 flex items-center gap-2 ${data.geminiAnalysis.commercialStatus.isGhostProfile ? 'text-orange-800' : 'text-green-800'}`}>
               <Activity className="w-5 h-5" /> Commercial Engine Status
            </h3>
            <div className="space-y-2">
               <div className="text-sm font-medium">
                  Status: <strong>{data.geminiAnalysis.commercialStatus.isGhostProfile ? 'GHOST PROFILE DETECTED' : 'Active Engine'}</strong>
               </div>
               <p className={`text-sm ${data.geminiAnalysis.commercialStatus.isGhostProfile ? 'text-orange-700' : 'text-green-700'}`}>
                  {data.geminiAnalysis.commercialStatus.revenueImpact}
               </p>
               {data.geminiAnalysis.commercialStatus.isGhostProfile && (
                  <div className="text-xs bg-white/60 p-2 rounded mt-2 text-orange-900">
                     Despite a technical score of {data.geminiAnalysis.commercialStatus.trustHealthScore}%, your commercial activity is zero. The engine is perfect, but it's turned off.
                  </div>
               )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Visuals */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
             <h3 className="font-bold text-slate-700 mb-6">Overall Health Score</h3>
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
                 <span className="text-xs font-bold text-slate-400 uppercase">/ 100</span>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <div className="flex items-center gap-2 mb-4">
                <Grid className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-700">Visual Geo-Grid</h3>
             </div>
             <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: 49 }).map((_, i) => {
                   const row = Math.floor(i / 7); const col = i % 7;
                   const isCenter = row === 3 && col === 3;
                   const dist = Math.max(Math.abs(row - 3), Math.abs(col - 3));
                   let bgClass = 'bg-red-400';
                   const greenRadius = overallScore > 80 ? 3 : overallScore > 60 ? 2 : 1;
                   if (isCenter) bgClass = 'bg-blue-600'; else if (dist <= greenRadius) bgClass = 'bg-green-500'; else if (dist <= greenRadius + 1) bgClass = 'bg-yellow-400';
                   return <div key={i} className={`aspect-square rounded-full ${bgClass} shadow-sm transition-all hover:scale-110`}></div>;
                })}
             </div>
             <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Top 3</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div> 10+</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> You</div>
             </div>
          </div>

          <div className="bg-green-50 border border-green-200 text-green-900 rounded-xl p-6">
             <h3 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> ROI Forecast</h3>
             <p className="text-sm leading-relaxed">{data.geminiAnalysis.roiForecast}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Roadmap & Details */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* 90-Day Roadmap */}
           <div className="bg-slate-900 text-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                 <h3 className="text-xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-400" /> 90-Day Success Roadmap</h3>
                 {!isUnlocked && <Lock className="w-5 h-5 text-slate-500" />}
              </div>
              <div className={`p-6 space-y-6 ${!isUnlocked ? 'blur-sm select-none opacity-50' : ''}`}>
                 <RoadmapPhase phase="Phase 1: Security & Foundation (Days 1-7)" steps={data.geminiAnalysis.roadmap.phase1.steps} icon={<Shield className="w-5 h-5 text-blue-400" />} />
                 <RoadmapPhase phase="Phase 2: Lead Generation (Days 8-30)" steps={data.geminiAnalysis.roadmap.phase2.steps} icon={<MousePointerClick className="w-5 h-5 text-purple-400" />} />
                 <RoadmapPhase phase="Phase 3: Authority & Dominance (Month 2+)" steps={data.geminiAnalysis.roadmap.phase3.steps} icon={<TrendingUp className="w-5 h-5 text-green-400" />} />
              </div>
              {!isUnlocked && (
                 <div className="absolute inset-0 top-20 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <button onClick={() => setShowPricing(true)} className="pointer-events-auto px-6 py-3 bg-yellow-500 text-slate-900 font-bold rounded-lg shadow-lg hover:bg-yellow-400 transition-colors">
                       Unlock Full Roadmap
                    </button>
                 </div>
              )}
           </div>

           {/* Detailed Audit Factors */}
           {Object.entries(sections).map(([title, { icon, factors }], idx) => (
             <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">{icon} {title}</h3>
                   <span className="text-xs font-bold text-slate-400 uppercase bg-white border border-slate-200 px-2 py-1 rounded-full">{factors.length} Checks</span>
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

const RoadmapPhase: React.FC<{ phase: string, steps: string[], icon: any }> = ({ phase, steps, icon }) => (
  <div className="flex gap-4">
     <div className="mt-1 p-2 bg-slate-800 rounded-lg h-fit">{icon}</div>
     <div>
        <h4 className="font-bold text-lg text-slate-100 mb-2">{phase}</h4>
        <ul className="space-y-2">
           {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                 <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                 {step}
              </li>
           ))}
        </ul>
     </div>
  </div>
);

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

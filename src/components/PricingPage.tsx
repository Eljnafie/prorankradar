
import React from 'react';
import { Check, HelpCircle, ArrowRight } from 'lucide-react';
import type { SiteContent } from '../types';

interface PricingPageProps {
  onNavigateToAudit: () => void;
  content?: SiteContent;
}

const PricingPage: React.FC<PricingPageProps> = ({ onNavigateToAudit, content }) => {
  
  // Use number from content if available, otherwise default
  const whatsappNumber = content?.contact?.phone?.replace(/[^0-9]/g, '') || '15550123456';

  // Use dynamic pricing
  const pricing = content?.pricing || {
    auditOneTime: "30",
    expertOneTime: "150",
    managementSetup: "300",
    managementMonthly: "100"
  };

  const handleContact = (planName: string) => {
    const text = encodeURIComponent(`Hi ProRankRadar, I am interested in the ${planName}. Please provide more details.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white font-sans text-slate-800">
      
      {/* HERO */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
         
         <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Transparent Pricing for <br/><span className="text-blue-400">Local Domination</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
              Whether you need a one-time fix or a dedicated team to manage your growth, we have a plan designed to boost your Google Maps ranking.
            </p>
         </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-20 bg-slate-50 -mt-10">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
               
               {/* PLAN 1: DIY */}
               <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 hover:border-blue-200 transition-all flex flex-col">
                  <div className="mb-4">
                     <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">The Blueprint</span>
                     <h3 className="text-2xl font-bold mt-3 text-slate-900">Audit & Strategy</h3>
                     <p className="text-slate-500 text-sm mt-2">Perfect for business owners who want to fix issues themselves.</p>
                  </div>
                  <div className="mb-8">
                     <span className="text-4xl font-extrabold text-slate-900">€{pricing.auditOneTime}</span>
                     <span className="text-slate-400 font-medium">/one-time</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                     <FeatureItem text="Unlock Full 100-Point Audit Report" />
                     <FeatureItem text="AI Step-by-Step Fix Instructions" />
                     <FeatureItem text="Keyword Optimization Guide" />
                     <FeatureItem text="Downloadable PDF Report" />
                     <FeatureItem text="Competitor Gap Analysis" />
                  </ul>
                  <button 
                    onClick={() => handleContact('DIY Audit Plan')}
                    className="w-full py-4 rounded-xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all"
                  >
                    Get Full Report
                  </button>
               </div>

               {/* PLAN 2: EXPERT FIX (POPULAR) */}
               <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-8 border border-slate-700 relative transform md:-translate-y-6 flex flex-col">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                  <div className="mb-4">
                     <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">The Overhaul</span>
                     <h3 className="text-2xl font-bold mt-3 text-white">Expert Fix Service</h3>
                     <p className="text-slate-400 text-sm mt-2">We log in, clean up the mess, and set you up for success.</p>
                  </div>
                  <div className="mb-8">
                     <span className="text-5xl font-extrabold text-white">€{pricing.expertOneTime}</span>
                     <span className="text-slate-400 font-medium">/one-time</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                     <FeatureItem text="We Implement All Fixes For You" highlight />
                     <FeatureItem text="Title, Category & Description Optimization" />
                     <FeatureItem text="Photo Geo-tagging & Upload (10+ Images)" />
                     <FeatureItem text="Service Area & Attributes Cleanup" />
                     <FeatureItem text="Spam check & Settings Configuration" />
                     <FeatureItem text="30-Minute Strategy Consultation" />
                  </ul>
                  <button 
                    onClick={() => handleContact('Expert Fix Service')}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-50 text-white font-bold transition-all shadow-lg shadow-blue-900/50"
                  >
                    Book Expert Fix
                  </button>
               </div>

               {/* PLAN 3: MANAGEMENT */}
               <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 hover:border-purple-200 transition-all flex flex-col">
                  <div className="mb-4">
                     <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">The Growth Engine</span>
                     <h3 className="text-2xl font-bold mt-3 text-slate-900">Full Management</h3>
                     <p className="text-slate-500 text-sm mt-2">Complete peace of mind and ongoing growth strategies.</p>
                  </div>
                  <div className="mb-8">
                     <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-900">€{pricing.managementSetup}</span>
                        <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Setup</span>
                     </div>
                     <div className="text-slate-500 font-medium mt-1">+ €{pricing.managementMonthly}/month</div>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                     <FeatureItem text="Everything in Expert Fix included" highlight />
                     <FeatureItem text="Weekly GBP Posts (AI Optimized)" />
                     <FeatureItem text="Professional Review Replies (24h)" />
                     <FeatureItem text="Competitor Spam Monitoring" />
                     <FeatureItem text="Monthly Performance Reporting" />
                     <FeatureItem text="Q&A Section Management" />
                  </ul>
                  <button 
                    onClick={() => handleContact('Full Management Plan')}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-all shadow-lg"
                  >
                    Start Management
                  </button>
               </div>

            </div>
         </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-20 bg-white">
         <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">Detailed Service Comparison</h2>
            
            <div className="overflow-x-auto">
               <table className="w-full border-collapse">
                  <thead>
                     <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 w-1/3">Feature</th>
                        <th className="text-center py-4 px-4 text-slate-600">DIY Audit</th>
                        <th className="text-center py-4 px-4 text-blue-700 font-bold bg-blue-50 rounded-t-lg">Expert Fix</th>
                        <th className="text-center py-4 px-4 text-purple-700 font-bold">Management</th>
                     </tr>
                  </thead>
                  <tbody>
                     <TableRow feature="Full 100-Point Audit Report" diy={true} fix={true} manage={true} />
                     <TableRow feature="AI Ranking Strategy" diy={true} fix={true} manage={true} />
                     <TableRow feature="Implementation of Fixes" diy={false} fix={true} manage={true} />
                     <TableRow feature="Photo Optimization" diy={false} fix={true} manage={true} />
                     <TableRow feature="Metadata & Keyword Setup" diy={false} fix={true} manage={true} />
                     <TableRow feature="Personal Consultant" diy={false} fix={true} manage={true} />
                     <TableRow feature="Weekly Posts & Updates" diy={false} fix={false} manage={true} />
                     <TableRow feature="Review Management" diy={false} fix={false} manage={true} />
                     <TableRow feature="Spam Fighting" diy={false} fix={false} manage={true} />
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-slate-50">
         <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Frequently Asked Questions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <FAQItem 
                 question="How fast will I see results?" 
                 answer="Typically, technical fixes (Expert Fix) show results in 2-4 weeks. Competitive rankings often improve significantly within 60-90 days of consistent management."
               />
               <FAQItem 
                 question="Do I need to give you my password?" 
                 answer="No. You simply add our agency email as a 'Manager' to your Google Business Profile. You retain full ownership and control at all times."
               />
               <FAQItem 
                 question="Is this compliant with Google?" 
                 answer="100%. We strictly follow Google's Guidelines. We do not use bots, fake reviews, or location spoofing which can get your account banned."
               />
               <FAQItem 
                 question="Can I upgrade later?" 
                 answer="Yes! Many clients start with the Expert Fix to get the foundation right, then switch to Monthly Management to maintain their lead."
               />
            </div>
         </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-20 bg-white text-center">
         <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-6 text-slate-900">Not sure where to start?</h2>
            <p className="text-lg text-slate-600 mb-8">Run a free audit first to see exactly what's holding you back. It takes less than 60 seconds.</p>
            <button 
               onClick={onNavigateToAudit}
               className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
            >
               Run Free Audit <ArrowRight className="w-5 h-5" />
            </button>
         </div>
      </section>
    </div>
  );
};

// --- Subcomponents ---

const FeatureItem: React.FC<{ text: string; highlight?: boolean }> = ({ text, highlight }) => (
  <li className={`flex items-start gap-3 text-sm ${highlight ? 'font-bold' : ''}`}>
    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
       <Check className="w-3 h-3" />
    </div>
    <span className={highlight ? '' : 'text-slate-600'}>{text}</span>
  </li>
);

const TableRow: React.FC<{ feature: string; diy: boolean; fix: boolean; manage: boolean }> = ({ feature, diy, fix, manage }) => (
  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
     <td className="py-4 px-4 text-sm font-medium text-slate-700">{feature}</td>
     <td className="py-4 px-4 text-center">
        {diy ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto"></div>}
     </td>
     <td className="py-4 px-4 text-center bg-blue-50/30">
        {fix ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto"></div>}
     </td>
     <td className="py-4 px-4 text-center">
        {manage ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto"></div>}
     </td>
  </tr>
);

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
     <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-blue-500" /> {question}
     </h4>
     <p className="text-sm text-slate-600 leading-relaxed">{answer}</p>
  </div>
);

export default PricingPage;

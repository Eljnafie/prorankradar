
import React from 'react';
import { Search, BarChart3, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, TrendingUp, BookOpen, Grid, AlertTriangle, Lock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { SiteContent, BlogPost, BusinessProfile, AuditInputs } from '../types';
import AuditForm from './AuditForm';

interface LandingPageProps {
  onStart: () => void;
  onOpenAdmin: () => void;
  content: SiteContent;
  onViewBlog: () => void;
  recentPosts: BlogPost[];
  // Audit Form Props
  onRunAudit: (business: BusinessProfile, inputs: AuditInputs) => void;
  isLoading: boolean;
  mapsApiKey: string;
  setMapsApiKey: (key: string) => void;
  isMapsLoaded: boolean;
  bypassLimits?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, content, onViewBlog, recentPosts,
  onRunAudit, isLoading, mapsApiKey, setMapsApiKey, isMapsLoaded, bypassLimits
}) => {
  
  // JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "ProRankRadar",
        "applicationCategory": "SEOApplication",
        "description": "Professional Google Business Profile auditor.",
      }
    ]
  };

  const scrollToAudit = () => {
    const el = document.getElementById('audit-tool-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      onStart();
    }
  };

  return (
    <div className="bg-white text-slate-800 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-slate-50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393798-3828fb409032?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] opacity-[0.03] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-200">
            <ShieldCheck className="w-3 h-3" /> 100% Google Compliant Audit
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            {content.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {content.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button onClick={scrollToAudit} className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2">
              {content.hero.ctaText} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">{content.problem.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="p-6 bg-red-50 rounded-2xl border border-red-100">
              <Search className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-bold text-slate-800 mb-3 text-lg">{content.problem.card1Title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{content.problem.card1Text}</p>
            </article>
            <article className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
              <TrendingUp className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-bold text-slate-800 mb-3 text-lg">{content.problem.card2Title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{content.problem.card2Text}</p>
            </article>
            <article className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <AlertCircle className="w-8 h-8 text-slate-600 mb-4" />
              <h3 className="font-bold text-slate-800 mb-3 text-lg">{content.problem.card3Title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{content.problem.card3Text}</p>
            </article>
          </div>
        </div>
      </section>

      {/* 4. AUDIT TOOL SECTION */}
      <section id="audit-tool-anchor" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
           <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Audit Your Business?</h2>
           <p className="text-slate-600 mb-10">Enter your details below to uncover ranking blockers instantly.</p>
           
           <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-left">
              <AuditForm 
                  onRunAudit={onRunAudit}
                  isLoading={isLoading}
                  mapsApiKey={mapsApiKey}
                  setMapsApiKey={setMapsApiKey}
                  isMapsLoaded={isMapsLoaded}
                  bypassLimits={bypassLimits}
                />
           </div>
        </div>
      </section>
      
      {/* 5. BLOG */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-slate-900 mb-4">Latest Insights</h2>
           </div>
           
           {recentPosts.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
               {recentPosts.map(post => (
                 <article key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <div className="h-48 bg-slate-200 relative overflow-hidden">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} className="w-full h-full object-cover" alt={post.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200 font-bold">ProRank Insights</div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                       <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{post.title}</h3>
                       <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                       <button onClick={onViewBlog} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                         Read Article <ArrowRight className="w-4 h-4" />
                       </button>
                    </div>
                 </article>
               ))}
             </div>
           ) : (
             <div className="text-center py-10 text-slate-400 italic mb-8">No articles published yet.</div>
           )}
        </div>
      </section>
    </div>
  );
};

const TeaserSection: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">See Why Your Business Isn't Ranking</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold border-b border-slate-100 pb-2">
                <Grid className="w-5 h-5 text-blue-600" /> <span>Visual Ranking Grid</span>
              </div>
              <div className="grid grid-cols-7 gap-2 opacity-80 filter blur-[1px]">
                {Array.from({ length: 49 }).map((_, i) => (
                     <div key={i} className={`aspect-square rounded-full bg-red-400 shadow-sm`}></div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="bg-slate-900/90 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-xl flex items-center gap-2"><Lock className="w-4 h-4" /> Example Output</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
             <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Competitor Gap Analysis</h3>
             <button onClick={onCta} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
               Run Free Audit <ArrowRight className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;

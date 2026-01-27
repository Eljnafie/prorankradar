
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
  
  // JSON-LD Schema for SEO (2026 Standard)
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "ProRankRadar",
        "applicationCategory": "SEOApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Professional Google Business Profile auditor powered by ProRank Neural Engine. Analyzes ranking signals, detects blockers, and generates actionable fix plans for local businesses.",
        "softwareVersion": "2.0",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "120"
        }
      },
      {
        "@type": "Organization",
        "name": "ProRankRadar",
        "url": "https://prorankradar.com",
        "sameAs": [
          "https://www.linkedin.com/company/prorankradar",
          "https://twitter.com/prorankradar"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@prorankradar.com",
          "contactType": "customer support"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How fast will I see results from a GBP Audit?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Typically, technical fixes (Expert Fix) show results in 2-4 weeks. Competitive rankings often improve significantly within 60-90 days of consistent management."
            }
          },
          {
            "@type": "Question",
            "name": "Is ProRankRadar compliant with Google Guidelines?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, 100%. We strictly follow Google's Guidelines. We do not use bots, fake reviews, or location spoofing which can get your account banned."
            }
          }
        ]
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

      {/* 1. HERO SECTION (H1) */}
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
            <button 
              onClick={scrollToAudit}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              {content.hero.ctaText} <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-slate-500 sm:hidden mt-2">No credit card required · Takes 30 seconds</p>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Official Google API</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Powered by ProRank AI</span>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM (H2) */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">{content.problem.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="p-6 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-3 text-lg">{content.problem.card1Title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                <strong>Even with excellent services</strong>, {content.problem.card1Text.toLowerCase().replace("even with excellent services, ", "")}
              </p>
            </article>
            
            <article className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-3 text-lg">{content.problem.card2Title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                <strong>Inferior competitors may receive calls</strong> over you. {content.problem.card2Text.toLowerCase().replace("inferior competitors may receive calls and clicks over you. ", "")}
              </p>
            </article>
            
            <article className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-3 text-lg">{content.problem.card3Title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                <strong>Google doesn't reveal exact reasons</strong> for your ranking. {content.problem.card3Text.toLowerCase().replace("google doesn't reveal exact reasons for your ranking. ", "")}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 3. METHODOLOGY (H2) */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-blue-400 font-bold tracking-wide uppercase text-sm mb-2">Our Methodology</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">ProRankRadar: The MRI for Your Google Business Profile</h2>
              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                We utilize a proprietary neural engine to scan your profile against 20+ ranking factors and compare you directly with the top 3 competitors in your city.
              </p>
              <ul className="space-y-4">
                {[
                  "Official Google Maps Data Integration",
                  "Deep-Scan Competitor Gap Analysis",
                  "Actionable 'Fix & Rank' Strategy"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button 
                  onClick={scrollToAudit}
                  className="px-6 py-3 bg-white text-slate-900 hover:bg-blue-50 font-bold rounded-lg transition-colors"
                >
                  Start Free Analysis
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
                <div className="flex items-center gap-4 border-b border-slate-700 pb-4 mb-4">
                   <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h3 className="font-bold text-white text-lg">Audit Result Example</h3>
                     <div className="text-sm text-red-400 font-bold">Score: 42/100 – Critical Issues</div>
                   </div>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  ProRankRadar highlights areas like categories, reviews, and photos that directly affect your visibility.
                </p>
                <div className="space-y-3 opacity-75">
                   <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                   <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                   <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5. TEASER SECTION (New) */}
      <TeaserSection onCta={scrollToAudit} />

      {/* 4. AUDIT TOOL SECTION (New Location) */}
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
      
      {/* 5. BLOG / LATEST INSIGHTS (H2) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-slate-900 mb-4">Latest Insights for Local SEO in 2026</h2>
             <p className="text-slate-600 max-w-2xl mx-auto">
               Discover the principles of Google Business Profile in 2026, focusing on AI-driven entity validation, geospatial authority, and semantic sentiment analysis.
             </p>
           </div>
           
           {recentPosts.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
               {recentPosts.map(post => (
                 <article key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <div className="h-48 bg-slate-200 relative overflow-hidden">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" alt={post.title} />
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
             <div className="text-center py-10 text-slate-400 italic mb-8">
               No articles published yet. Check back soon.
             </div>
           )}

           <div className="flex justify-center">
             <button 
               onClick={onViewBlog}
               className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-300 rounded-xl shadow-sm transition-all"
             >
               <BookOpen className="w-5 h-5" /> Visit Full Blog
             </button>
           </div>
        </div>
      </section>

      {/* 6. MAIN CTA */}
      <section className="pt-20 pb-20 bg-white text-center">
         <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Run Your Free Audit Today</h2>
            <button 
              onClick={scrollToAudit}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-xl shadow-xl shadow-blue-500/30 transition-all transform hover:-translate-y-1"
            >
              Start Free Analysis
            </button>
            <p className="mt-4 text-slate-500 text-sm">Fast · Safe · No Commitment</p>
         </div>
      </section>

    </div>
  );
};

// --- Teaser Component ---

const TeaserSection: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  // Hardcoded example data for teaser
  const exampleData = {
    gbpHealth: 95,
    seoStrength: 73,
    rating: 3.9,
    topCompetitorRating: 4.5,
    issues: [
      "Missing secondary categories",
      "Weak visibility in nearby streets",
      "Unanswered Q&A or stale posts"
    ]
  };

  const getChartData = (val: number) => [
    { name: 'Score', value: val },
    { name: 'Gap', value: 100 - val }
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            See Why Your Business Isn't Ranking
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            ProRankRadar evaluates 20+ ranking factors in seconds. See your ranking in your city for your top keywords.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Visuals */}
          <div className="space-y-8">
            
            {/* Geo Grid Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold border-b border-slate-100 pb-2">
                <Grid className="w-5 h-5 text-blue-600" />
                <span>Visual Ranking Grid</span>
              </div>
              
              {/* Blurred Grid */}
              <div className="grid grid-cols-7 gap-2 opacity-80 filter blur-[1px] transition-all duration-700 group-hover:blur-0">
                {Array.from({ length: 49 }).map((_, i) => {
                   const dist = Math.abs((i % 7) - 3) + Math.abs(Math.floor(i / 7) - 3);
                   let bgClass = 'bg-red-400';
                   if (dist === 0) bgClass = 'bg-green-500';
                   else if (dist <= 1) bgClass = 'bg-green-400';
                   else if (dist <= 2) bgClass = 'bg-yellow-400';
                   
                   return (
                     <div key={i} className={`aspect-square rounded-full ${bgClass} shadow-sm transform transition-transform hover:scale-110`}></div>
                   )
                })}
              </div>

              {/* Overlay Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="bg-slate-900/90 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-xl backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Example Output
                 </div>
              </div>
              
              <div className="mt-4 text-xs text-slate-500 text-center">
                Green = Top 3 (You Win) · Red = Competitors Winning
              </div>
            </div>

            {/* Circular Charts */}
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: "GBP Health", val: exampleData.gbpHealth, color: "#22c55e" },
                 { label: "SEO Strength", val: exampleData.seoStrength, color: "#eab308" }
               ].map((chart, idx) => (
                 <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getChartData(chart.val)}
                            cx="50%" cy="50%"
                            innerRadius={30} outerRadius={40}
                            startAngle={90} endAngle={-270}
                            dataKey="value" stroke="none"
                          >
                            <Cell key="cell-0" fill={chart.color} />
                            <Cell key="cell-1" fill="#f1f5f9" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800">
                        {chart.val}%
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase mt-2">{chart.label}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Right Column: Data & CTA */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
             <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> Competitor Gap Analysis
                </h3>
                
                <div className="space-y-4">
                   <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Your Rating</span>
                        <span className="font-bold text-slate-800">{exampleData.rating} ★</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 w-[78%]"></div>
                      </div>
                   </div>
                   
                   <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Market Leader</span>
                        <span className="font-bold text-slate-800">{exampleData.topCompetitorRating} ★</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[90%]"></div>
                      </div>
                   </div>
                </div>
                
                <p className="text-sm text-red-500 mt-4 font-medium flex items-start gap-2">
                   <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                   You need approximately <strong>12 new 5-star reviews</strong> to catch up to the market leader.
                </p>
             </div>

             <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Critical Issues Detected</h4>
                <ul className="space-y-3">
                   {exampleData.issues.map((issue, i) => (
                     <li key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100 text-sm text-slate-700">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        {issue}
                     </li>
                   ))}
                </ul>
             </div>

             <button 
               onClick={onCta}
               className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
             >
               Run Free Audit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
             <p className="text-center text-xs text-slate-400 mt-3">Unlock your full Priority Fix Plan instantly.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingPage;

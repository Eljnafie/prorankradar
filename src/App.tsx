
import React, { useState, useEffect } from 'react';
import AuditForm from './components/AuditForm';
import AuditReport from './components/AuditReport';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';
import BlogView from './components/BlogView';
import PricingPage from './components/PricingPage';
import LegalPage from './components/LegalPages';
import ContactPage from './components/ContactPage';
import Footer from './components/Footer';
import { loadGoogleMapsScript } from './services/mapsLoader';
import { analyzeProfileWithGemini } from './services/geminiService';
import { calculateScore } from './services/scoringEngine';
import type { BusinessProfile, AuditInputs, AuditReportData, CompetitorData, SiteContent, BlogPost } from './types';
import { Radar } from 'lucide-react';

type ViewState = 'landing' | 'audit' | 'report' | 'blog' | 'pricing' | 'privacy' | 'terms' | 'cookies' | 'contact';

// Default Content
const DEFAULT_CONTENT: SiteContent = {
  hero: {
    title: "Google Maps Ranking Audit for Businesses Worldwide",
    subtitle: "Stop guessing. ProRankRadar uncovers hidden ranking blockers in your Google Business Profile in seconds, giving you a clear roadmap to improve visibility globally.",
    ctaText: "Run My Free Audit"
  },
  problem: {
    title: "Why Your Business Isn't Ranking",
    card1Title: "Why Customers Can't Find Your Business",
    card1Text: "Even with excellent services, businesses often remain invisible on Google Maps. Missing reviews, incorrect categories, or inaccurate location pins prevent your profile from appearing in the Map Pack for local searches worldwide.",
    card2Title: "Why Competitors Rank Higher",
    card2Text: "Inferior competitors may receive calls and clicks over you. ProRankRadar identifies gaps in categories, content, reviews, and geospatial signals that allow competitors to outrank you.",
    card3Title: "How You Can Know What's Holding You Back",
    card3Text: "Google doesn't reveal exact reasons for your ranking. Our proprietary AI scans your profile across 20+ ranking factors and compares you with the top competitors in your area globally."
  },
  contact: {
    email: "support@prorankradar.com",
    phone: "",
    address: ""
  },
  pricing: {
    auditOneTime: "30",
    expertOneTime: "150",
    managementSetup: "300",
    managementMonthly: "100"
  }
};

const PILLAR_POST: BlogPost = {
  id: 'checklist-2026',
  title: 'The Ultimate Google Maps Ranking & SEO Audit Checklist (2026 Standards)',
  slug: 'google-maps-ranking-seo-checklist-2026',
  author: 'ProRank Strategy Team',
  date: 'January 25, 2026',
  language: 'en',
  excerpt: 'A complete 15-point framework for dominating Local SEO in the age of AI Search. Covers Technical SEO, Entity Authority, and SGE Readiness.',
  imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  content: `
    <h2>1. Technical SEO (The 2026 Foundation)</h2>
    <p><strong>Server-Side Rendering & Core Web Vitals:</strong> AI Search engines prioritize pages that render instantly. Ensure your audit pages load under 2.5s (LCP) and have Interaction to Next Paint (INP) under 200ms.</p>
    <ul>
      <li>Enable self-referencing canonical tags.</li>
      <li>Ensure <code>sitemap.xml</code> auto-updates with new content.</li>
      <li>Audit <code>robots.txt</code> to allow GPTBot and Google-Extended.</li>
    </ul>

    <h2>2. On-Page SEO (Semantic Structure)</h2>
    <p><strong>Semantic Hierarchy:</strong> Google parses structure, not just keywords. Your H1 must clearly state the entity ("Audit"), and H2s must be questions or sub-topics ("How to fix").</p>
    <ul>
      <li>Optimize Title Tags for CTR (e.g., "Free Instant Audit").</li>
      <li>Use Keyword Clusters (e.g., "GBP Audit" + "Ranking Blockers").</li>
    </ul>

    <h2>3. Entity-Based SEO (Critical)</h2>
    <p><strong>Establish Identity:</strong> Google ranks Entities, not websites. Use <code>Organization</code> and <code>SoftwareApplication</code> schema to explicitly tell Google who you are.</p>
    <ul>
      <li>Validate JSON-LD Schema on Homepage.</li>
      <li>Link "SameAs" properties to LinkedIn/Twitter/YouTube.</li>
    </ul>

    <h2>4. Local SEO & Optimization</h2>
    <p><strong>Geospatial Relevance:</strong> Infuse content with "Proximity", "Service Area", and "Grid Ranking" terminology to signal topical authority.</p>

    <h2>5. Content Strategy (Answer Engine Optimization)</h2>
    <p><strong>Answer First:</strong> Every H2 must be followed by a direct 40-60 word bold answer to win Featured Snippets and AI citations.</p>
    <p><em>Some platforms, such as ProRankRadar, provide a <a href="#" onclick="document.getElementById('audit-tool-anchor').scrollIntoView()">free initial audit</a> to help businesses identify structural issues in their Google Business Profile before implementing changes.</em></p>

    <h2>6. AI Search & SGE Readiness</h2>
    <p><strong>Conversational Queries:</strong> Target natural language questions like "How do I fix a suspended profile?" rather than just keywords.</p>

    <h2>7. E-E-A-T (Trust & Authority)</h2>
    <p><strong>Transparency:</strong> Ensure Privacy Policy and Terms are visible. Display security badges (SSL/Stripe) to prevent algorithmic demotion.</p>

    <h2>8. UX & Conversion</h2>
    <p><strong>Funnel Speed:</strong> Ensure the audit tool feels instant. Use progress bars to reduce bounce rates during analysis.</p>

    <h2>9. Analytics & Tracking</h2>
    <p><strong>Event Tracking:</strong> configuring GA4 events for "Audit Start" and "Audit Complete" is vital for understanding user drop-off.</p>

    <h2>10. Prioritized Action Plan</h2>
    <p>Focus on Critical Fixes (Schema/Meta) in Week 1, Content Growth in Month 1, and Authority Scaling in Month 2+.</p>

    <h2>11. Crawl Budget & Indexation Control</h2>
    <p><strong>Log Monitoring:</strong> Analyze Googlebot behavior. Shield API endpoints via <code>robots.txt</code> to preserve crawl budget for content.</p>

    <h2>12. Structured Data for AI</h2>
    <p><strong>Beyond Basic Schema:</strong> Implement <code>FAQPage</code> schema on blog posts and <code>Dataset</code> schema for aggregated audit data.</p>

    <h2>13. Programmatic SEO Expansion</h2>
    <p><strong>Scale Insights:</strong> Generate city-specific insight pages (e.g., "/insights/restaurant-gbp-errors") to capture long-tail local traffic.</p>

    <h2>14. AI Trust Signals</h2>
    <p><strong>Data Transparency:</strong> AI models prefer sources that disclose methodology. Explicitly state data sources (Google Maps API, Gemini AI).</p>

    <h2>15. International Signals</h2>
    <p><strong>Global Readiness:</strong> Use <code>hreflang="x-default"</code> and country-neutral phrasing to avoid narrowing your market accidentally.</p>
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "The Ultimate Google Maps Ranking & SEO Audit Checklist (2026 Standards)",
      "author": { "@type": "Organization", "name": "ProRankRadar" },
      "datePublished": "2026-01-25",
      "description": "A complete 15-point framework for dominating Local SEO in the age of AI Search."
    }
    </script>
  `
};

const App: React.FC = () => {
  const [mapsKey, setMapsKey] = useState<string>('');
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReportData | null>(null);
  
  // Admin & State
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false); 
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // View State Management
  const [currentView, setCurrentView] = useState<ViewState>('landing');

  // Load key & state from LocalStorage or ENV
  useEffect(() => {
    // VITE USES import.meta.env
    const envMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const envGeminiKey = import.meta.env.VITE_API_KEY || '';

    const storedMapsKey = localStorage.getItem('google_maps_api_key');
    const storedGeminiKey = localStorage.getItem('gemini_api_key');
    const storedContent = localStorage.getItem('site_content');
    const storedBlogs = localStorage.getItem('blog_posts');
    
    if (envMapsKey) setMapsKey(envMapsKey);
    else if (storedMapsKey) setMapsKey(storedMapsKey);

    if (envGeminiKey) setGeminiKey(envGeminiKey);
    else if (storedGeminiKey) setGeminiKey(storedGeminiKey);

    if (storedContent) {
      const parsed = JSON.parse(storedContent);
      // Ensure backward compatibility with new fields like pricing
      setSiteContent({
        ...DEFAULT_CONTENT,
        ...parsed,
        pricing: parsed.pricing || DEFAULT_CONTENT.pricing
      });
    }
    
    // Initialize Blogs with Pillar Post if empty
    if (storedBlogs) {
      setBlogPosts(JSON.parse(storedBlogs));
    } else {
      setBlogPosts([PILLAR_POST]);
      localStorage.setItem('blog_posts', JSON.stringify([PILLAR_POST]));
    }

  }, []);

  // Update Unlock state based on Admin Login
  useEffect(() => {
    if (isAdminLoggedIn) {
      setIsUnlocked(true); // Admin always sees full report
    } else {
      setIsUnlocked(false); // Public sees locked
    }
  }, [isAdminLoggedIn]);

  // Handlers
  const handleSetMapsKey = (key: string) => {
    setMapsKey(key);
    localStorage.setItem('google_maps_api_key', key);
  };

  const handleSetGeminiKey = (key: string) => {
    setGeminiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleResetKey = () => {
    setMapsKey('');
    localStorage.removeItem('google_maps_api_key');
    window.location.reload(); 
  };

  const handleUpdateContent = (newContent: SiteContent) => {
    setSiteContent(newContent);
    localStorage.setItem('site_content', JSON.stringify(newContent));
  };

  const handleAddBlogPost = (post: BlogPost) => {
    // Check if post exists (update) or new (add)
    const exists = blogPosts.find(p => p.id === post.id);
    let newPosts;
    if (exists) {
      newPosts = blogPosts.map(p => p.id === post.id ? post : p);
    } else {
      newPosts = [post, ...blogPosts];
    }
    setBlogPosts(newPosts);
    localStorage.setItem('blog_posts', JSON.stringify(newPosts));
  };

  const handleDeletePost = (id: string) => {
    const newPosts = blogPosts.filter(p => p.id !== id);
    setBlogPosts(newPosts);
    localStorage.setItem('blog_posts', JSON.stringify(newPosts));
  };

  useEffect(() => {
    if (mapsKey && !isMapsLoaded) {
      loadGoogleMapsScript(mapsKey)
        .then(() => setIsMapsLoaded(true))
        .catch((err) => {
          console.error("Maps Load Error", err);
          handleResetKey();
        });
    }
  }, [mapsKey, isMapsLoaded]);

  const handleRunAudit = async (business: BusinessProfile, inputs: AuditInputs) => {
    setLoading(true);
    try {
      const competitors: CompetitorData[] = [];
      if (isMapsLoaded && business.location) {
         competitors.push(
            { name: "Competitor A", rating: 4.8, reviewCount: business.user_ratings_total + 50 },
            { name: "Competitor B", rating: 4.5, reviewCount: Math.max(0, business.user_ratings_total - 10) },
            { name: "Competitor C", rating: 4.2, reviewCount: Math.max(0, business.user_ratings_total - 50) }
         );
      }
      // Pass Gemini Key
      const geminiAnalysis = await analyzeProfileWithGemini(business, inputs, competitors, geminiKey);
      const { score, factors } = calculateScore(business, inputs, competitors, geminiAnalysis);

      setReport({ business, inputs, overallScore: score, factors, geminiAnalysis, competitors });
      setCurrentView('report');
    } catch (error) {
      console.error("Audit failed", error);
      alert("Audit failed. Ensure Maps and Gemini API Keys are set in Admin.");
    } finally {
      setLoading(false);
    }
  };

  // Render Logic
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return (
           <div className="animate-in fade-in duration-500">
             <LandingPage 
               onStart={() => { setCurrentView('audit'); window.scrollTo(0, 0); }} 
               onOpenAdmin={() => setShowAdmin(true)}
               content={siteContent}
               onViewBlog={() => { setCurrentView('blog'); window.scrollTo(0, 0); }}
               recentPosts={blogPosts.slice(0, 3)}
               onRunAudit={handleRunAudit}
               isLoading={loading}
               mapsApiKey={mapsKey}
               setMapsApiKey={handleSetMapsKey}
               isMapsLoaded={isMapsLoaded}
             />
           </div>
        );
      case 'pricing':
        return (
           <div className="animate-in fade-in duration-500">
              <PricingPage 
                onNavigateToAudit={() => { setCurrentView('audit'); window.scrollTo(0, 0); }}
                content={siteContent}
              />
           </div>
        );
      case 'blog':
        return (
           <div className="animate-in fade-in duration-500">
              <BlogView 
                posts={blogPosts}
                onBack={() => setCurrentView('landing')}
              />
           </div>
        );
      case 'contact':
        return (
           <div className="animate-in fade-in duration-500">
             <ContactPage 
               onBack={() => setCurrentView('landing')} 
               content={siteContent}
             />
           </div>
        );
      case 'privacy':
      case 'terms':
      case 'cookies':
        return (
           <div className="animate-in fade-in duration-500">
             <LegalPage type={currentView} onBack={() => setCurrentView('landing')} />
           </div>
        );
      case 'audit':
        return (
          <div className="p-6">
             <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-10 max-w-2xl mx-auto">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Audit Your Business Profile
                  </h1>
                  <p className="text-lg text-slate-500">
                    Enter your business details below to generate your 100-point ranking score.
                  </p>
                </div>
                
                <AuditForm 
                  onRunAudit={handleRunAudit} 
                  isLoading={loading} 
                  mapsApiKey={mapsKey}
                  setMapsApiKey={handleSetMapsKey}
                  isMapsLoaded={isMapsLoaded}
                />
             </div>
          </div>
        );
      case 'report':
        return report ? (
          <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AuditReport 
              data={report} 
              onReset={() => { setReport(null); setCurrentView('audit'); }}
              isUnlocked={isUnlocked}
              content={siteContent}
            />
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 print:bg-white flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2 text-blue-700 hover:opacity-80 transition-opacity"
          >
            <Radar className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">ProRankRadar</span>
          </button>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button onClick={() => setCurrentView('landing')} className={`transition-colors ${currentView === 'landing' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>Home</button>
            <button onClick={() => setCurrentView('audit')} className={`transition-colors ${currentView === 'audit' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>Run Audit</button>
            <button onClick={() => setCurrentView('pricing')} className={`transition-colors ${currentView === 'pricing' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>Services & Pricing</button>
            <button onClick={() => setCurrentView('blog')} className={`transition-colors ${currentView === 'blog' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>Insights</button>
            <button onClick={() => setCurrentView('contact')} className={`transition-colors ${currentView === 'contact' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>Contact</button>
          </div>
        </div>
      </nav>

      <main className="flex-grow print:p-0">
        {renderView()}
      </main>

      {/* Global Footer */}
      <Footer 
        onNavigate={(page) => { setCurrentView(page); window.scrollTo(0, 0); }}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      <AdminPanel 
        isOpen={showAdmin} 
        onClose={() => setShowAdmin(false)}
        mapsApiKey={mapsKey}
        setMapsApiKey={handleSetMapsKey}
        geminiApiKey={geminiKey}
        setGeminiApiKey={handleSetGeminiKey}
        isLoggedIn={isAdminLoggedIn}
        onLogin={setIsAdminLoggedIn}
        siteContent={siteContent}
        onUpdateContent={handleUpdateContent}
        blogPosts={blogPosts}
        onAddPost={handleAddBlogPost}
        onDeletePost={handleDeletePost}
        onNavigateToAudit={() => { setShowAdmin(false); setCurrentView('audit'); }}
      />
    </div>
  );
};

export default App;

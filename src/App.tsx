import React, { useState, useEffect } from 'react';
import AuditForm from './components/AuditForm';
import AuditReport from './components/AuditReport';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';
import BlogView from './components/BlogView';
import PricingPage from './components/PricingPage';
import LegalPage from './components/LegalPages';
import ContactPage from './components/ContactPage';
import ReviewQRGenerator from './components/ReviewQRGenerator';
import Footer from './components/Footer';
import { loadGoogleMapsScript } from './services/mapsLoader';
import { analyzeProfileWithGemini } from './services/geminiService';
import { calculateScore } from './services/scoringEngine';
import type { BusinessProfile, AuditInputs, AuditReportData, CompetitorData, SiteContent, BlogPost } from './types';
import { Radar, QrCode } from 'lucide-react';

type ViewState = 'landing' | 'audit' | 'report' | 'blog' | 'pricing' | 'contact' | 'qr-tool' | 'privacy' | 'terms' | 'cookies';

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
  content: `<h2>1. Technical SEO (The 2026 Foundation)</h2><p>Server-Side Rendering & Core Web Vitals: AI Search engines prioritize pages that render instantly.</p>` 
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');

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

  // Load key & state from LocalStorage or ENV
  useEffect(() => {
    // VITE USES import.meta.env
    const envMapsKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';
    const envGeminiKey = (import.meta as any).env.VITE_API_KEY || '';

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
      setSiteContent({
        ...DEFAULT_CONTENT,
        ...parsed,
        pricing: parsed.pricing || DEFAULT_CONTENT.pricing
      });
    }
    
    if (storedBlogs) {
      setBlogPosts(JSON.parse(storedBlogs));
    } else {
      setBlogPosts([PILLAR_POST]);
      localStorage.setItem('blog_posts', JSON.stringify([PILLAR_POST]));
    }

  }, []);

  useEffect(() => {
    if (isAdminLoggedIn) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false); 
    }
  }, [isAdminLoggedIn]);

  const handleSetMapsKey = (key: string) => {
    setMapsKey(key);
    localStorage.setItem('google_maps_api_key', key);
  };

  const handleSetGeminiKey = (key: string) => {
    setGeminiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleUpdateContent = (newContent: SiteContent) => {
    setSiteContent(newContent);
    localStorage.setItem('site_content', JSON.stringify(newContent));
  };

  const handleAddBlogPost = (post: BlogPost) => {
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
          // Only reset if it fails, but retry logic or manual update is better
        });
    }
  }, [mapsKey, isMapsLoaded]);

  const handleAppNavigation = (view: string) => {
    // Map legacy paths if any, or just set view
    const viewMap: Record<string, ViewState> = {
      'landing': 'landing',
      '/': 'landing',
      'audit': 'audit',
      '/audit': 'audit',
      'report': 'report',
      '/report': 'report',
      'pricing': 'pricing',
      '/pricing': 'pricing',
      'blog': 'blog',
      'insights': 'blog',
      '/insights': 'blog',
      'contact': 'contact',
      '/contact': 'contact',
      'qr-tool': 'qr-tool',
      '/free-qr': 'qr-tool',
      'privacy': 'privacy',
      'terms': 'terms',
      'cookies': 'cookies'
    };
    
    const target = viewMap[view] || (view as ViewState);
    if (target) {
        setCurrentView(target);
        window.scrollTo(0, 0);
    }
  };

  const handleRunAudit = async (business: BusinessProfile, inputs: AuditInputs) => {
    setLoading(true);
    try {
      const competitors: CompetitorData[] = [];
      // Pass Gemini Key (ensure it's not empty)
      const geminiAnalysis = await analyzeProfileWithGemini(business, inputs, competitors, geminiKey);
      const { score, factors } = calculateScore(business, inputs, competitors, geminiAnalysis);

      setReport({ business, inputs, overallScore: score, factors, geminiAnalysis, competitors });
      handleAppNavigation('report');
    } catch (error: any) {
      console.error("Audit failed", error);
      const msg = error?.message || "Unknown error";
      
      const isKeyError = msg.toLowerCase().includes("key") || msg.includes("403");
      
      if (isKeyError) {
         alert(`Audit failed: ${msg}\n\nPlease verify your Gemini API Key in Admin Settings.`);
      } else {
         alert(`Audit failed: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    switch(currentView) {
        case 'landing':
            return (
                <div className="animate-in fade-in duration-500">
                    <LandingPage 
                        onStart={() => handleAppNavigation('audit')} 
                        onOpenAdmin={() => setShowAdmin(true)}
                        content={siteContent}
                        onViewBlog={() => handleAppNavigation('blog')}
                        recentPosts={blogPosts.slice(0, 3)}
                        onRunAudit={handleRunAudit}
                        isLoading={loading}
                        mapsApiKey={mapsKey}
                        setMapsApiKey={handleSetMapsKey}
                        isMapsLoaded={isMapsLoaded}
                    />
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
                    onReset={() => { setReport(null); handleAppNavigation('audit'); }}
                    isUnlocked={isUnlocked}
                    content={siteContent}
                  />
                </div>
              ) : (
                // Redirect if no report
                (() => {
                    setTimeout(() => handleAppNavigation('audit'), 0);
                    return null;
                })()
              );
        case 'pricing':
            return (
                 <div className="animate-in fade-in duration-500">
                    <PricingPage 
                      onNavigateToAudit={() => handleAppNavigation('audit')}
                      content={siteContent}
                    />
                 </div>
            );
        case 'blog':
            return (
                 <div className="animate-in fade-in duration-500">
                    <BlogView 
                      posts={blogPosts}
                      onBack={() => handleAppNavigation('landing')}
                    />
                 </div>
            );
        case 'contact':
            return (
                 <div className="animate-in fade-in duration-500">
                   <ContactPage 
                     onBack={() => handleAppNavigation('landing')} 
                     content={siteContent}
                   />
                 </div>
            );
        case 'qr-tool':
            return (
                <div className="animate-in fade-in duration-500">
                  <ReviewQRGenerator 
                    onNavigateToAudit={() => handleAppNavigation('audit')}
                  />
                </div>
            );
        case 'privacy':
            return <div className="animate-in fade-in duration-500"><LegalPage type="privacy" onBack={() => handleAppNavigation('landing')} /></div>;
        case 'terms':
            return <div className="animate-in fade-in duration-500"><LegalPage type="terms" onBack={() => handleAppNavigation('landing')} /></div>;
        case 'cookies':
            return <div className="animate-in fade-in duration-500"><LegalPage type="cookies" onBack={() => handleAppNavigation('landing')} /></div>;
        default:
            return (
                <div className="p-10 text-center">
                    <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                    <button onClick={() => handleAppNavigation('landing')} className="text-blue-600 mt-4 underline">Go Home</button>
                </div>
            );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 print:bg-white flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => handleAppNavigation('landing')}
            className="flex items-center gap-2 text-blue-700 hover:opacity-80 transition-opacity"
          >
            <Radar className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">ProRankRadar</span>
          </button>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button 
              onClick={() => handleAppNavigation('landing')} 
              className={`transition-colors ${currentView === 'landing' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              Home
            </button>
            <button 
              onClick={() => handleAppNavigation('audit')} 
              className={`transition-colors ${currentView === 'audit' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              Run Audit
            </button>
            <button 
              onClick={() => handleAppNavigation('qr-tool')} 
              className={`flex items-center gap-1 transition-colors ${currentView === 'qr-tool' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              <QrCode className="w-3 h-3" /> Free QR Tool
            </button>
            <button 
              onClick={() => handleAppNavigation('pricing')} 
              className={`transition-colors ${currentView === 'pricing' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              Services & Pricing
            </button>
            <button 
              onClick={() => handleAppNavigation('blog')} 
              className={`transition-colors ${currentView === 'blog' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              Insights
            </button>
            <button 
              onClick={() => handleAppNavigation('contact')} 
              className={`transition-colors ${currentView === 'contact' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              Contact
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow print:p-0">
        {renderView()}
      </main>

      {/* Global Footer */}
      <Footer 
        onNavigate={(page) => handleAppNavigation(page)}
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
        onNavigateToAudit={() => { setShowAdmin(false); handleAppNavigation('audit'); }}
      />
    </div>
  );
};

export default App;
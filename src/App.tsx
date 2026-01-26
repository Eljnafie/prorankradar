
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

type ViewState = 'landing' | 'audit' | 'report' | 'blog' | 'pricing' | 'privacy' | 'terms' | 'cookies' | 'contact' | 'qr-tool';

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
      // Pass Gemini Key (ensure it's not empty)
      const geminiAnalysis = await analyzeProfileWithGemini(business, inputs, competitors, geminiKey);
      const { score, factors } = calculateScore(business, inputs, competitors, geminiAnalysis);

      setReport({ business, inputs, overallScore: score, factors, geminiAnalysis, competitors });
      setCurrentView('report');
    } catch (error: any) {
      console.error("Audit failed", error);
      const msg = error?.message || "Unknown error";
      
      // Determine if it is a key issue to offer helpful hint, otherwise just show message
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
      case 'qr-tool':
        return (
          <div className="animate-in fade-in duration-500">
            <ReviewQRGenerator 
              onNavigateToAudit={() => { setCurrentView('audit'); window.scrollTo(0, 0); }}
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
            <button onClick={() => setCurrentView('qr-tool')} className={`flex items-center gap-1 transition-colors ${currentView === 'qr-tool' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>
              <QrCode className="w-3 h-3" /> Free QR Tool
            </button>
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

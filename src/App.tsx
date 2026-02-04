
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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

const DEFAULT_CONTENT: SiteContent = {
  hero: { title: "Google Maps Ranking Audit for Businesses Worldwide", subtitle: "Stop guessing. ProRankRadar uncovers hidden ranking blockers in your Google Business Profile in seconds.", ctaText: "Run My Free Audit" },
  problem: { title: "Why Your Business Isn't Ranking", card1Title: "Why Customers Can't Find Your Business", card1Text: "Missing reviews, incorrect categories, or inaccurate location pins prevent your profile from appearing.", card2Title: "Why Competitors Rank Higher", card2Text: "Inferior competitors may receive calls and clicks over you due to optimized categories.", card3Title: "How You Can Know What's Holding You Back", card3Text: "Our proprietary AI scans your profile across 20+ ranking factors." },
  contact: { email: "support@prorankradar.com", phone: "", address: "" },
  pricing: { auditOneTime: "30", expertOneTime: "150", managementSetup: "300", managementMonthly: "100" }
};

const PILLAR_POST: BlogPost = {
  id: 'checklist-2026', title: 'The Ultimate Google Maps Ranking & SEO Audit Checklist (2026 Standards)', slug: 'google-maps-ranking-seo-checklist-2026', author: 'ProRank Strategy Team', date: 'January 25, 2026', language: 'en',
  excerpt: 'A complete 15-point framework for dominating Local SEO.', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', content: `<h2>1. Technical SEO</h2><p>Server-Side Rendering & Core Web Vitals...</p>` 
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mapsKey, setMapsKey] = useState<string>('');
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReportData | null>(null);
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false); 
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const envMapsKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || (window as any).process?.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const envGeminiKey = (import.meta as any).env?.VITE_API_KEY || (window as any).process?.env?.API_KEY || '';

    const storedMapsKey = localStorage.getItem('google_maps_api_key');
    const storedGeminiKey = localStorage.getItem('gemini_api_key');
    const storedContent = localStorage.getItem('site_content');
    const storedBlogs = localStorage.getItem('blog_posts');
    
    if (envMapsKey) setMapsKey(envMapsKey); else if (storedMapsKey) setMapsKey(storedMapsKey);
    if (envGeminiKey) setGeminiKey(envGeminiKey); else if (storedGeminiKey) setGeminiKey(storedGeminiKey);

    if (storedContent) {
      try { const parsed = JSON.parse(storedContent); setSiteContent({ ...DEFAULT_CONTENT, ...parsed, pricing: parsed.pricing || DEFAULT_CONTENT.pricing }); } catch(e) { console.error("Content Parse Error", e); }
    }
    
    if (storedBlogs) {
      try { setBlogPosts(JSON.parse(storedBlogs)); } catch(e) { setBlogPosts([PILLAR_POST]); }
    } else {
      setBlogPosts([PILLAR_POST]);
      localStorage.setItem('blog_posts', JSON.stringify([PILLAR_POST]));
    }
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn) setIsUnlocked(true); else setIsUnlocked(false);
  }, [isAdminLoggedIn]);

  const handleSetMapsKey = (key: string) => { setMapsKey(key); localStorage.setItem('google_maps_api_key', key); };
  const handleSetGeminiKey = (key: string) => { setGeminiKey(key); localStorage.setItem('gemini_api_key', key); };
  const handleUpdateContent = (newContent: SiteContent) => { setSiteContent(newContent); localStorage.setItem('site_content', JSON.stringify(newContent)); };
  const handleAddBlogPost = (post: BlogPost) => {
    const exists = blogPosts.find(p => p.id === post.id);
    let newPosts = exists ? blogPosts.map(p => p.id === post.id ? post : p) : [post, ...blogPosts];
    setBlogPosts(newPosts); localStorage.setItem('blog_posts', JSON.stringify(newPosts));
  };
  const handleDeletePost = (id: string) => {
    const newPosts = blogPosts.filter(p => p.id !== id);
    setBlogPosts(newPosts); localStorage.setItem('blog_posts', JSON.stringify(newPosts));
  };

  useEffect(() => {
    if (mapsKey && !isMapsLoaded) {
      loadGoogleMapsScript(mapsKey).then(() => setIsMapsLoaded(true)).catch((err) => console.error("Maps Load Error", err));
    }
  }, [mapsKey, isMapsLoaded]);

  const handleRunAudit = async (business: BusinessProfile, inputs: AuditInputs) => {
    setLoading(true);
    try {
      const competitors: CompetitorData[] = [];
      const geminiAnalysis = await analyzeProfileWithGemini(business, inputs, competitors, geminiKey);
      
      const reportData = calculateScore(business, inputs, competitors, geminiAnalysis);
      
      setReport(reportData);
      navigate('/report');
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error("Audit failed", error);
      alert(`Audit failed: ${error?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const nav = (path: string) => { navigate(path); window.scrollTo(0, 0); };
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => nav('/')} className="flex items-center gap-2 text-blue-700 hover:opacity-80">
            <Radar className="w-8 h-8" /> <span className="text-xl font-bold">ProRankRadar</span>
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button onClick={() => nav('/')} className={`transition-colors ${isActive('/') ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>Home</button>
            <button onClick={() => nav('/audit')} className={`transition-colors ${isActive('/audit') ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>Run Audit</button>
            <button onClick={() => nav('/free-qr')} className={`flex items-center gap-1 transition-colors ${isActive('/free-qr') ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}><QrCode className="w-3 h-3" /> Free QR Tool</button>
            <button onClick={() => nav('/pricing')} className={`transition-colors ${isActive('/pricing') ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>Services & Pricing</button>
            <button onClick={() => nav('/insights')} className={`transition-colors ${isActive('/insights') ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>Insights</button>
            <button onClick={() => nav('/contact')} className={`transition-colors ${isActive('/contact') ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}>Contact</button>
          </div>
        </div>
      </nav>

      <main className="flex-grow print:p-0">
        <Routes>
          <Route path="/" element={<div className="animate-in fade-in duration-500"><LandingPage onStart={() => nav('/audit')} onOpenAdmin={() => setShowAdmin(true)} content={siteContent} onViewBlog={() => nav('/insights')} recentPosts={blogPosts.slice(0, 3)} onRunAudit={handleRunAudit} isLoading={loading} mapsApiKey={mapsKey} setMapsApiKey={handleSetMapsKey} isMapsLoaded={isMapsLoaded} bypassLimits={isAdminLoggedIn} /></div>} />
          <Route path="/audit" element={<div className="p-6"><div className="flex flex-col items-center justify-center min-h-[80vh] py-12 animate-in fade-in slide-in-from-bottom-4 duration-500"><div className="text-center mb-10 max-w-2xl mx-auto"><h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Audit Your Business Profile</h1><p className="text-lg text-slate-500">Enter your business details below to generate your 100-point ranking score.</p></div><AuditForm onRunAudit={handleRunAudit} isLoading={loading} mapsApiKey={mapsKey} setMapsApiKey={handleSetMapsKey} isMapsLoaded={isMapsLoaded} bypassLimits={isAdminLoggedIn} /></div></div>} />
          <Route path="/report" element={report ? <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500"><AuditReport data={report} onReset={() => { setReport(null); nav('/audit'); }} isUnlocked={isUnlocked} content={siteContent} /></div> : <Navigate to="/audit" replace />} />
          <Route path="/free-qr" element={<div className="animate-in fade-in duration-500"><ReviewQRGenerator onNavigateToAudit={() => nav('/audit')} /></div>} />
          <Route path="/pricing" element={<div className="animate-in fade-in duration-500"><PricingPage onNavigateToAudit={() => nav('/audit')} content={siteContent} /></div>} />
          <Route path="/insights" element={<div className="animate-in fade-in duration-500"><BlogView posts={blogPosts} onBack={() => nav('/')} /></div>} />
          <Route path="/contact" element={<div className="animate-in fade-in duration-500"><ContactPage onBack={() => nav('/')} content={siteContent} /></div>} />
          <Route path="/privacy" element={<div className="animate-in fade-in duration-500"><LegalPage type="privacy" onBack={() => nav('/')} /></div>} />
          <Route path="/terms" element={<div className="animate-in fade-in duration-500"><LegalPage type="terms" onBack={() => nav('/')} /></div>} />
          <Route path="/cookies" element={<div className="animate-in fade-in duration-500"><LegalPage type="cookies" onBack={() => nav('/')} /></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer onNavigate={(page) => nav(`/${page}`)} onOpenAdmin={() => setShowAdmin(true)} />
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} mapsApiKey={mapsKey} setMapsApiKey={handleSetMapsKey} geminiApiKey={geminiKey} setGeminiApiKey={handleSetGeminiKey} isLoggedIn={isAdminLoggedIn} onLogin={setIsAdminLoggedIn} siteContent={siteContent} onUpdateContent={handleUpdateContent} blogPosts={blogPosts} onAddPost={handleAddBlogPost} onDeletePost={handleDeletePost} onNavigateToAudit={() => { setShowAdmin(false); nav('/audit'); }} />
    </div>
  );
};

const App = () => (<BrowserRouter><AppContent /></BrowserRouter>);
export default App;

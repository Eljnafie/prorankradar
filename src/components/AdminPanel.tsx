
import React, { useState, useEffect } from 'react';
import { X, Key, Lock, Save, Edit, Layout, FileText, Loader2, LogOut, PlusCircle, Trash2, ArrowLeft, RefreshCw, UserCog, Radar, Phone, Mail, MapPin, DollarSign, ShieldCheck } from 'lucide-react';
import type { SiteContent, BlogPost } from '../types';
import { generateBlogPost } from '../services/geminiService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mapsApiKey: string;
  setMapsApiKey: (key: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  isLoggedIn: boolean;
  onLogin: (status: boolean) => void;
  siteContent: SiteContent;
  onUpdateContent: (content: SiteContent) => void;
  blogPosts: BlogPost[];
  onAddPost: (post: BlogPost) => void;
  onDeletePost: (id: string) => void;
  onNavigateToAudit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, onClose, mapsApiKey, setMapsApiKey, geminiApiKey, setGeminiApiKey, 
  isLoggedIn, onLogin, siteContent, onUpdateContent, blogPosts, onAddPost, onDeletePost, onNavigateToAudit
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'blog' | 'settings'>('content');
  
  // Login State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);

  // Stored Credentials
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Change Credential State
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');

  // Blog Management State
  const [blogView, setBlogView] = useState<'list' | 'edit'>('list');
  const [blogTopic, setBlogTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // The Post being edited (or new)
  const defaultPost: BlogPost = {
    id: '',
    title: '',
    excerpt: '',
    content: '',
    slug: '',
    author: 'ProRank Team',
    date: new Date().toLocaleDateString(),
    imageUrl: ''
  };
  const [editingPost, setEditingPost] = useState<BlogPost>(defaultPost);

  // Content Edit State
  const [tempContent, setTempContent] = useState<SiteContent>(siteContent);
  
  // Pricing Defaults
  const defaultPricing = {
    auditOneTime: "30",
    expertOneTime: "150",
    managementSetup: "300",
    managementMonthly: "100"
  };

  // Load credentials on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_username');
    const storedPass = localStorage.getItem('admin_password');
    
    if (storedUser && storedPass) {
      setAdminUser(storedUser);
      setAdminPass(storedPass);
      // Pre-fill change fields
      setNewUser(storedUser);
      // Don't pre-fill password for security
    } else {
      // SECURITY: If no credentials exist, enable setup mode instead of default fallback
      setIsSetupMode(true);
    }
  }, []);

  // Sync temp content when siteContent changes (external update)
  useEffect(() => {
    setTempContent(siteContent);
  }, [siteContent]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSetupMode) {
      // First time setup logic
      if (!usernameInput || !passwordInput) {
        setLoginError('Username and Password are required for setup.');
        return;
      }
      if (passwordInput.length < 6) {
        setLoginError('Password must be at least 6 characters.');
        return;
      }
      
      localStorage.setItem('admin_username', usernameInput);
      localStorage.setItem('admin_password', passwordInput);
      setAdminUser(usernameInput);
      setAdminPass(passwordInput);
      setIsSetupMode(false);
      onLogin(true);
      alert("Admin account created successfully! Please keep your credentials safe.");
      return;
    }

    if (usernameInput === adminUser && passwordInput === adminPass) {
      onLogin(true);
      setLoginError('');
      setUsernameInput('');
      setPasswordInput('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    onLogin(false);
  };

  const handleSaveCredentials = () => {
    if (!newUser || !newPass) {
      alert("Username and Password cannot be empty.");
      return;
    }
    if (newPass.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setAdminUser(newUser);
    setAdminPass(newPass);
    localStorage.setItem('admin_username', newUser);
    localStorage.setItem('admin_password', newPass);
    setNewPass(''); // Clear for security
    alert("Admin credentials updated successfully!");
  };

  // --- BLOG ACTIONS ---

  const handleGenerateBlog = async () => {
    if (!blogTopic) return;
    if (!geminiApiKey) {
      alert("Please add your Gemini API Key in Settings first.");
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await generateBlogPost(blogTopic, geminiApiKey);
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: generated.title || 'Untitled',
        excerpt: generated.excerpt || '',
        content: generated.content || '',
        slug: generated.slug || 'untitled-post',
        author: 'ProRank Team',
        date: new Date().toLocaleDateString(),
        imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80'
      };
      
      // Load generated post into editor
      setEditingPost(newPost);
      setBlogView('edit');
      setBlogTopic('');
    } catch (e) {
      alert('Failed to generate blog post. Check API Key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setBlogView('edit');
  };

  const handleCreateManualPost = () => {
    setEditingPost({ ...defaultPost, id: Date.now().toString() });
    setBlogView('edit');
  };

  const handleSavePost = () => {
    if (!editingPost.title) {
       alert("Title is required");
       return;
    }
    onAddPost(editingPost);
    setBlogView('list');
    setEditingPost(defaultPost);
  };

  const handleSaveContent = () => {
    onUpdateContent(tempContent);
    alert('Website content updated!');
  };

  // --- LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
           <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
             <X className="w-5 h-5" />
           </button>
           <div className="text-center mb-6">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isSetupMode ? 'bg-green-600' : 'bg-slate-900'}`}>
               {isSetupMode ? <ShieldCheck className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6 text-white" />}
             </div>
             <h2 className="text-xl font-bold text-slate-900">{isSetupMode ? 'Admin Setup' : 'Admin Access'}</h2>
             <p className="text-sm text-slate-500">
                {isSetupMode ? 'Create your admin account to secure the CMS.' : 'Enter credentials to manage site'}
             </p>
           </div>
           
           <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
               <input 
                 type="text" 
                 value={usernameInput}
                 onChange={e => setUsernameInput(e.target.value)}
                 className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                 placeholder={isSetupMode ? "Choose a username" : ""}
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
               <input 
                 type="password" 
                 value={passwordInput}
                 onChange={e => setPasswordInput(e.target.value)}
                 className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                 placeholder={isSetupMode ? "Choose a strong password" : ""}
               />
             </div>
             {loginError && <p className="text-xs text-red-500 font-bold text-center">{loginError}</p>}
             <button type="submit" className={`w-full py-2 text-white font-bold rounded-lg transition-colors ${isSetupMode ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
               {isSetupMode ? 'Create Account' : 'Login'}
             </button>
           </form>
           {!isSetupMode && (
             <div className="mt-4 text-center text-xs text-slate-400">
               Secure Login
             </div>
           )}
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Layout className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg">ProRank CMS</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">Logged in as {adminUser}</span>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-48 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2 shrink-0">
            <button 
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'content' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Edit className="w-4 h-4" /> Site Content
            </button>
            <button 
              onClick={() => setActiveTab('blog')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'blog' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <FileText className="w-4 h-4" /> Blog Manager
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Key className="w-4 h-4" /> Settings
            </button>

            <div className="mt-auto pt-4 border-t border-slate-200">
               <button 
                onClick={onNavigateToAudit}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
               >
                 <Radar className="w-4 h-4" /> Run Pro Audit
               </button>
               <p className="text-[10px] text-center text-slate-400 mt-2">Unlocks full audit features</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            
            {/* --- CONTENT EDITOR --- */}
            {activeTab === 'content' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                
                {/* Pricing Configuration Section */}
                <div>
                   <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                     <DollarSign className="w-5 h-5 text-green-600" /> Pricing Configuration
                   </h3>
                   <div className="bg-green-50 p-6 rounded-lg border border-green-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-green-800 mb-1">Audit Report (One-time)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-green-600">€</span>
                            <input 
                              type="text" 
                              value={tempContent.pricing?.auditOneTime || "30"}
                              onChange={(e) => setTempContent({...tempContent, pricing: {...(tempContent.pricing || defaultPricing), auditOneTime: e.target.value}})}
                              className="w-full pl-8 pr-3 py-2 border border-green-200 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-green-800 mb-1">Expert Fix (One-time)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-green-600">€</span>
                            <input 
                              type="text" 
                              value={tempContent.pricing?.expertOneTime || "150"}
                              onChange={(e) => setTempContent({...tempContent, pricing: {...(tempContent.pricing || defaultPricing), expertOneTime: e.target.value}})}
                              className="w-full pl-8 pr-3 py-2 border border-green-200 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-green-800 mb-1">Management (Setup)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-green-600">€</span>
                            <input 
                              type="text" 
                              value={tempContent.pricing?.managementSetup || "300"}
                              onChange={(e) => setTempContent({...tempContent, pricing: {...(tempContent.pricing || defaultPricing), managementSetup: e.target.value}})}
                              className="w-full pl-8 pr-3 py-2 border border-green-200 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-green-800 mb-1">Management (Monthly)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-green-600">€</span>
                            <input 
                              type="text" 
                              value={tempContent.pricing?.managementMonthly || "100"}
                              onChange={(e) => setTempContent({...tempContent, pricing: {...(tempContent.pricing || defaultPricing), managementMonthly: e.target.value}})}
                              className="w-full pl-8 pr-3 py-2 border border-green-200 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                      </div>
                   </div>
                </div>

                {/* Contact Information Section */}
                <div>
                   <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Contact Information</h3>
                   <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Support Email
                        </label>
                        <input 
                          type="text" 
                          value={tempContent.contact.email}
                          onChange={(e) => setTempContent({...tempContent, contact: {...tempContent.contact, email: e.target.value}})}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Phone / WhatsApp
                        </label>
                        <input 
                          type="text" 
                          value={tempContent.contact.phone}
                          onChange={(e) => setTempContent({...tempContent, contact: {...tempContent.contact, phone: e.target.value}})}
                          className="w-full px-3 py-2 border rounded"
                          placeholder="e.g. 15550123456"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Headquarters Address
                        </label>
                        <input 
                          type="text" 
                          value={tempContent.contact.address}
                          onChange={(e) => setTempContent({...tempContent, contact: {...tempContent.contact, address: e.target.value}})}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                   </div>
                </div>

                <div>
                   <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Homepage Hero Section</h3>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Main Headline</label>
                        <input 
                          type="text" 
                          value={tempContent.hero.title}
                          onChange={(e) => setTempContent({...tempContent, hero: {...tempContent.hero, title: e.target.value}})}
                          className="w-full px-3 py-2 border rounded font-bold text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Sub Headline</label>
                        <textarea 
                          value={tempContent.hero.subtitle}
                          onChange={(e) => setTempContent({...tempContent, hero: {...tempContent.hero, subtitle: e.target.value}})}
                          className="w-full px-3 py-2 border rounded h-20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">CTA Button Text</label>
                        <input 
                          type="text" 
                          value={tempContent.hero.ctaText}
                          onChange={(e) => setTempContent({...tempContent, hero: {...tempContent.hero, ctaText: e.target.value}})}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                   </div>
                </div>

                <div>
                   <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Problem Section</h3>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Section Title</label>
                        <input 
                          type="text" 
                          value={tempContent.problem.title}
                          onChange={(e) => setTempContent({...tempContent, problem: {...tempContent.problem, title: e.target.value}})}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                         {[1, 2, 3].map(i => (
                           <div key={i} className="p-3 border rounded bg-slate-50">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Card {i} Title</label>
                              <input 
                                type="text" 
                                // @ts-ignore
                                value={tempContent.problem[`card${i}Title`]}
                                // @ts-ignore
                                onChange={(e) => setTempContent({...tempContent, problem: {...tempContent.problem, [`card${i}Title`]: e.target.value}})}
                                className="w-full px-2 py-1 border rounded mb-2 text-sm"
                              />
                              <label className="block text-xs font-bold text-slate-500 mb-1">Card {i} Text</label>
                              <textarea 
                                // @ts-ignore
                                value={tempContent.problem[`card${i}Text`]}
                                // @ts-ignore
                                onChange={(e) => setTempContent({...tempContent, problem: {...tempContent.problem, [`card${i}Text`]: e.target.value}})}
                                className="w-full px-2 py-1 border rounded text-xs h-20"
                              />
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="pt-4">
                  <button onClick={handleSaveContent} className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">
                    <Save className="w-4 h-4" /> Save Changes to Website
                  </button>
                </div>
              </div>
            )}

            {/* --- BLOG MANAGER --- */}
            {activeTab === 'blog' && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                 
                 {/* LIST VIEW */}
                 {blogView === 'list' && (
                   <div className="space-y-8">
                      {/* Generator / Creator */}
                      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row gap-6 items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> AI Blog Generator
                            </h3>
                            <p className="text-sm text-blue-700 mb-4">Enter a topic and our AI Engine will write, format, and prepare an article.</p>
                            <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={blogTopic}
                                  onChange={(e) => setBlogTopic(e.target.value)}
                                  placeholder="e.g. 'Why Google Reviews matter for Dentists'..."
                                  className="flex-1 px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                  disabled={isGenerating}
                                />
                                <button 
                                  onClick={handleGenerateBlog}
                                  disabled={isGenerating || !blogTopic}
                                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} 
                                  {isGenerating ? 'Writing...' : 'Generate with AI'}
                                </button>
                            </div>
                          </div>
                          <div className="h-full border-l border-blue-200 pl-6 flex items-center">
                              <button 
                                onClick={handleCreateManualPost}
                                className="flex items-center gap-2 px-4 py-3 bg-white border border-blue-200 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <PlusCircle className="w-5 h-5" /> Manual Post
                              </button>
                          </div>
                      </div>

                      {/* Post List */}
                      <div>
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Published Articles <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{blogPosts.length}</span>
                          </h3>
                          {blogPosts.length === 0 ? (
                            <p className="text-slate-400 italic">No posts yet. Generate one above!</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {blogPosts.map(post => (
                                  <div key={post.id} className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                      {post.imageUrl && (
                                        <div className="h-32 overflow-hidden bg-slate-100">
                                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                      )}
                                      <div className="p-4 flex-1">
                                        <h4 className="font-bold text-slate-800 mb-1 line-clamp-1">{post.title}</h4>
                                        <div className="text-xs text-slate-400 mb-2">{post.date}</div>
                                        <p className="text-xs text-slate-500 line-clamp-2">{post.excerpt}</p>
                                      </div>
                                      <div className="p-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                                          <button 
                                            onClick={() => handleEditPost(post)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                            title="Edit"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </button>
                                          <button 
                                            onClick={() => onDeletePost(post.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                                            title="Delete"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                                ))}
                            </div>
                          )}
                      </div>
                   </div>
                 )}

                 {/* EDITOR VIEW (GRID LAYOUT) */}
                 {blogView === 'edit' && (
                   <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-6">
                        <button 
                          onClick={() => setBlogView('list')}
                          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back to List
                        </button>
                        <h3 className="text-xl font-bold text-slate-800">
                          {editingPost.id ? 'Edit Article' : 'New Article'}
                        </h3>
                        <div className="flex-1"></div>
                        <button 
                          onClick={handleSavePost}
                          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" /> Save Article
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                         {/* LEFT COL: Metadata Inputs */}
                         <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                              <h4 className="font-bold text-sm text-slate-700 mb-3 border-b border-slate-200 pb-2">Meta Data</h4>
                              
                              <div className="mb-3">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Article Title (H1)</label>
                                <input 
                                  type="text" 
                                  value={editingPost.title}
                                  onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                                  className="w-full px-3 py-2 border rounded text-sm font-bold"
                                />
                              </div>

                              <div className="mb-3">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Slug</label>
                                <input 
                                  type="text" 
                                  value={editingPost.slug}
                                  onChange={e => setEditingPost({...editingPost, slug: e.target.value})}
                                  className="w-full px-3 py-2 border rounded text-sm font-mono text-slate-600"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">Author</label>
                                  <input 
                                    type="text" 
                                    value={editingPost.author}
                                    onChange={e => setEditingPost({...editingPost, author: e.target.value})}
                                    className="w-full px-3 py-2 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                                  <input 
                                    type="text" 
                                    value={editingPost.date}
                                    onChange={e => setEditingPost({...editingPost, date: e.target.value})}
                                    className="w-full px-3 py-2 border rounded text-sm"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                              <h4 className="font-bold text-sm text-slate-700 mb-3 border-b border-slate-200 pb-2">Visuals & SEO</h4>
                              <div className="mb-3">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Featured Image URL</label>
                                <input 
                                  type="text" 
                                  value={editingPost.imageUrl || ''}
                                  onChange={e => setEditingPost({...editingPost, imageUrl: e.target.value})}
                                  className="w-full px-3 py-2 border rounded text-sm"
                                  placeholder="https://..."
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Excerpt / Meta Description</label>
                                <textarea 
                                  value={editingPost.excerpt}
                                  onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})}
                                  className="w-full px-3 py-2 border rounded text-sm h-24"
                                />
                              </div>
                            </div>
                         </div>

                         {/* RIGHT COL: Content Editor */}
                         <div className="lg:col-span-2 flex flex-col h-full">
                            <label className="block text-sm font-bold text-slate-700 mb-2">HTML Content</label>
                            <textarea 
                              value={editingPost.content}
                              onChange={e => setEditingPost({...editingPost, content: e.target.value})}
                              className="w-full flex-1 p-4 border border-slate-300 rounded-lg font-mono text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[500px]"
                              placeholder="<p>Write your article content here...</p>"
                            />
                            <p className="text-xs text-slate-400 mt-2">Use HTML tags: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;</p>
                         </div>
                      </div>
                   </div>
                 )}

              </div>
            )}

            {/* --- SETTINGS --- */}
            {activeTab === 'settings' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  
                  {/* API Keys */}
                  <div>
                    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">API Configuration</h3>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Key className="w-4 h-4 text-blue-600" /> Google Maps API Key
                      </label>
                      <input 
                        type="text" 
                        value={mapsApiKey}
                        onChange={(e) => setMapsApiKey(e.target.value)}
                        placeholder="Paste Maps API Key..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono mb-2"
                      />
                      <p className="text-xs text-slate-500">Required for searching businesses and gathering reviews/photos.</p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-purple-600" /> Gemini API Key
                      </label>
                      <input 
                        type="password" 
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="Paste Gemini AI Key..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono mb-2"
                      />
                      <p className="text-xs text-slate-500">Required for generating Audit Analysis and AI Blog Posts.</p>
                    </div>
                  </div>

                  {/* Account Security */}
                  <div>
                    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Account Security</h3>
                    
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">New Username</label>
                                <input 
                                  type="text" 
                                  value={newUser}
                                  onChange={e => setNewUser(e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">New Password</label>
                                <input 
                                  type="password" 
                                  value={newPass}
                                  onChange={e => setNewPass(e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>
                        </div>
                        <button 
                          onClick={handleSaveCredentials}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900"
                        >
                            <UserCog className="w-4 h-4" /> Update Credentials
                        </button>
                    </div>
                  </div>

               </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

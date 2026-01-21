
import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, ArrowRight, Languages } from 'lucide-react';
import type { BlogPost, AuditLanguage } from '../types';

interface BlogViewProps {
  posts: BlogPost[];
  onBack: () => void;
}

const BlogView: React.FC<BlogViewProps> = ({ posts, onBack }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<AuditLanguage | 'all'>('all');

  // Browser-native sanitizer to prevent simple XSS without external dependencies
  const sanitizeHTML = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Remove scripts
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove potentially dangerous attributes
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
      const attrs = el.getAttributeNames();
      attrs.forEach(attr => {
        if (attr.startsWith('on') || attr.startsWith('javascript:')) {
          el.removeAttribute(attr);
        }
      });
    });

    return doc.body.innerHTML;
  };

  // Filter posts by language
  const filteredPosts = posts.filter(post => 
    selectedLanguage === 'all' || post.language === selectedLanguage
  );

  // Available languages in current posts
  const availableLanguages = Array.from(new Set(posts.map(p => p.language || 'en')));

  const LANGUAGES_DISPLAY: Record<string, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português'
  };

  // Single Post View
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <button 
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </button>

          <article className="prose lg:prose-xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                {LANGUAGES_DISPLAY[selectedPost.language || 'en']}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {selectedPost.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-10 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" /> {selectedPost.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {selectedPost.date}
              </div>
            </div>

            {selectedPost.imageUrl && (
              <img 
                src={selectedPost.imageUrl} 
                alt={selectedPost.title}
                className="w-full h-64 md:h-96 object-cover rounded-xl mb-10 shadow-lg"
              />
            )}

            {/* Render HTML content safely using local sanitizer */}
            <div 
              className="text-slate-700 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(selectedPost.content) }} 
            />
          </article>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
           <button 
             onClick={onBack}
             className="text-slate-500 hover:text-blue-600 text-sm font-medium mb-4 inline-block"
           >
             ← Back to Home
           </button>
           <h1 className="text-4xl font-bold text-slate-900">Local SEO Insights</h1>
           <p className="text-slate-600 mt-2">Strategies to grow your business presence on Google Maps.</p>
        </div>

        {/* Language Filter */}
        {posts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedLanguage('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedLanguage === 'all' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Articles
            </button>
            {availableLanguages.map(lang => (
               <button
               key={lang}
               onClick={() => setSelectedLanguage(lang)}
               className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                 selectedLanguage === lang 
                   ? 'bg-blue-600 text-white shadow-md' 
                   : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
               }`}
             >
               {selectedLanguage === lang && <Languages className="w-3 h-3" />}
               {LANGUAGES_DISPLAY[lang] || lang.toUpperCase()}
             </button>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 italic">No articles found for this language.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <div 
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
              >
                <div className="h-48 bg-slate-200 relative">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                      ProRank Insights
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                     <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 shadow-sm">
                       {LANGUAGES_DISPLAY[post.language || 'en']}
                     </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                   <div className="text-xs text-slate-400 mb-2">{post.date}</div>
                   <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                     {post.title}
                   </h3>
                   <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                     {post.excerpt}
                   </p>
                   <span className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                     Read Article <ArrowRight className="w-4 h-4" />
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogView;

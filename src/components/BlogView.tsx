import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react';
import type { BlogPost } from '../types';

interface BlogViewProps {
  posts: BlogPost[];
  onBack: () => void;
}

const BlogView: React.FC<BlogViewProps> = ({ posts, onBack }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Browser-native sanitizer to prevent simple XSS without external dependencies
  // Note: In a full production build with npm access, use 'dompurify'
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
        <div className="mb-12">
           <button 
             onClick={onBack}
             className="text-slate-500 hover:text-blue-600 text-sm font-medium mb-4 inline-block"
           >
             ← Back to Home
           </button>
           <h1 className="text-4xl font-bold text-slate-900">Local SEO Insights</h1>
           <p className="text-slate-600 mt-2">Strategies to grow your business presence on Google Maps.</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 italic">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <div 
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
              >
                <div className="h-48 bg-slate-200 relative">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                      ProRank Insights
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                   <div className="text-xs text-slate-400 mb-2">{post.date}</div>
                   <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight group-hover:text-blue-600">
                     {post.title}
                   </h3>
                   <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                     {post.excerpt}
                   </p>
                   <span className="text-blue-600 font-bold text-sm flex items-center gap-1">
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
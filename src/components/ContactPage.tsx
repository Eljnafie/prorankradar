
import React, { useState } from 'react';
import { ArrowLeft, Mail, MapPin, Send, MessageSquare, ExternalLink } from 'lucide-react';
import type { SiteContent } from '../types';

interface ContactPageProps {
  onBack: () => void;
  content: SiteContent;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack, content }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const email = content.contact.email || 'support@prorankradar.com';
  const phone = content.contact.phone || '';
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Info Side */}
          <div className="space-y-6">
             <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
                <p className="text-slate-600 text-lg">Have questions about your audit or need enterprise pricing? We're here to help.</p>
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                {/* Email Section */}
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Mail className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                      <h3 className="font-bold text-slate-800">Email</h3>
                      <a 
                        href={`mailto:${email}`} 
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all font-medium transition-colors"
                      >
                        {email}
                      </a>
                   </div>
                </div>

                {/* Phone/WhatsApp Section */}
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                      <MessageSquare className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                      <h3 className="font-bold text-slate-800">WhatsApp / Phone</h3>
                      {cleanPhone ? (
                        <a 
                          href={`https://wa.me/${cleanPhone}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 px-3 py-1.5 mt-1 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all text-sm font-bold"
                        >
                          Chat on WhatsApp <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-slate-400 italic text-sm mt-1">Not configured</p>
                      )}
                   </div>
                </div>

                {/* Address Section */}
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-800">Headquarters</h3>
                      <p className="text-slate-600">{content.contact.address || 'Global (Online)'}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
             {submitted ? (
               <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                     <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600">Thanks for reaching out. Our team will get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-blue-600 font-bold hover:underline"
                  >
                    Send another message
                  </button>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                    <input type="text" required className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                    <input type="email" required className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
                    <textarea required className="w-full px-4 py-3 border border-slate-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                     Send Message <Send className="w-4 h-4" />
                  </button>
               </form>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;

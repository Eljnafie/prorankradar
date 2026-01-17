import React from 'react';
import { ArrowLeft, Shield, FileText, Cookie } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
  type: 'privacy' | 'terms' | 'cookies';
}

const LegalPage: React.FC<LegalPageProps> = ({ onBack, type }) => {
  const renderContent = () => {
    switch (type) {
      case 'cookies':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Cookie className="w-8 h-8 text-blue-600" /> Cookie Policy
            </h1>
            <p className="text-sm text-slate-500 mb-6">Effective Date: January 2026</p>
            
            <div className="space-y-6 text-slate-700 leading-relaxed">
              <p>ProRankRadar uses cookies and similar technologies to enhance your experience, analyze site performance, and provide personalized services. By using our website, you consent to our use of cookies as described below.</p>
              
              <h2 className="text-xl font-bold text-slate-900 mt-6">What Are Cookies?</h2>
              <p>Cookies are small text files stored on your device that help us remember your preferences, track website activity, and improve your services.</p>
              
              <h2 className="text-xl font-bold text-slate-900 mt-6">Types of Cookies We Use</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Necessary Cookies:</strong> Required for website functionality (e.g., session management, security).</li>
                <li><strong>Performance & Analytics Cookies:</strong> Track page visits, clicks, and interactions to improve our platform.</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings (e.g., language, theme).</li>
                <li><strong>Marketing / Third-Party Cookies:</strong> Optional cookies for ads and tracking by third parties. We only use them if you consent.</li>
              </ul>
              
              <h2 className="text-xl font-bold text-slate-900 mt-6">Managing Cookies</h2>
              <p>You can manage or disable cookies via your browser settings. Note that disabling certain cookies may affect website functionality and user experience.</p>
              
              <h2 className="text-xl font-bold text-slate-900 mt-6">Consent</h2>
              <p>When you visit ProRankRadar, you are prompted to accept cookies. You may withdraw consent at any time via browser settings.</p>
            </div>
          </>
        );
      case 'privacy':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" /> Privacy Policy
            </h1>
            <p className="text-sm text-slate-500 mb-6">Effective Date: January 2026</p>
            <div className="space-y-6 text-slate-700 leading-relaxed">
               <p>At ProRankRadar, we prioritize your data privacy. This policy outlines how we collect, use, and protect your information.</p>
               <h2 className="text-xl font-bold text-slate-900">Information We Collect</h2>
               <p>We collect information you provide directly, such as business details for audits, email addresses for account management, and payment information processed securely by Stripe.</p>
               <h2 className="text-xl font-bold text-slate-900">How We Use Information</h2>
               <p>We use your data to generate audit reports, improve our AI algorithms, and communicate with you regarding your account or services.</p>
               <h2 className="text-xl font-bold text-slate-900">Data Protection</h2>
               <p>We implement industry-standard security measures including SSL encryption and secure database storage to protect your data.</p>
            </div>
          </>
        );
      case 'terms':
        return (
          <>
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" /> Terms of Service
            </h1>
            <p className="text-sm text-slate-500 mb-6">Effective Date: January 2026</p>
            <div className="space-y-6 text-slate-700 leading-relaxed">
               <p>Welcome to ProRankRadar. By accessing our website and using our services, you agree to these Terms of Service.</p>
               <h2 className="text-xl font-bold text-slate-900">Service Usage</h2>
               <p>You agree to use our audit tools and services only for lawful purposes. You must not abuse the API, attempt to scrape data, or compromise the security of the platform.</p>
               <h2 className="text-xl font-bold text-slate-900">Intellectual Property</h2>
               <p>All content, branding, and algorithms on ProRankRadar are the intellectual property of ProRankRadar. Unauthorized reproduction is prohibited.</p>
               <h2 className="text-xl font-bold text-slate-900">Limitation of Liability</h2>
               <p>ProRankRadar provides recommendations based on data. We do not guarantee specific ranking results on Google Maps, as Google's algorithm is subject to change.</p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: 'privacy' | 'terms' | 'cookies' | 'contact') => void;
  onOpenAdmin: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-10 pb-10 text-slate-400 text-sm print:hidden">
      <div className="flex items-center justify-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5" />
        <span className="font-semibold text-slate-600">ProRankRadar</span>
      </div>
      
      <p className="max-w-lg mx-auto mb-6 text-center px-6">
        Trusted, Compliant, and Global. ProRankRadar is fully Google-compliant and designed for businesses worldwide. 
        We provide factual, actionable insights without guessing or breaking guidelines.
      </p>

      <div className="flex flex-wrap justify-center gap-6 mb-8 text-slate-500 px-6">
          <button onClick={() => onNavigate('privacy')} className="hover:text-blue-600">Privacy Policy</button>
          <button onClick={() => onNavigate('terms')} className="hover:text-blue-600">Terms of Service</button>
          <button onClick={() => onNavigate('cookies')} className="hover:text-blue-600">Cookie Policy</button>
          <button onClick={() => onNavigate('contact')} className="hover:text-blue-600">Contact Us</button>
      </div>

      <div className="mt-8 flex justify-center items-center gap-6 px-6">
        <span>&copy; 2026 ProRankRadar. All rights reserved.</span>
        
        <button 
          onClick={onOpenAdmin}
          className="flex items-center gap-1 text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
          title="Admin Access"
        >
          <Lock className="w-3 h-3" />
          <span className="text-xs font-medium">Admin Access</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
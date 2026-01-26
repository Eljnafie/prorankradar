
import React, { useState, useEffect, useRef } from 'react';
import { Download, ShieldCheck, Printer, Check, Star, QrCode as QrIcon, AlertTriangle, Link as LinkIcon, Building2, ArrowRight } from 'lucide-react';

interface ReviewQRGeneratorProps {
  onNavigateToAudit: () => void;
}

const GOOGLE_G_LOGO_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23EA4335' d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'/%3E%3Cpath fill='%234285F4' d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'/%3E%3Cpath fill='%23FBBC05' d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'/%3E%3Cpath fill='%2334A853' d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'/%3E%3C/svg%3E`;

const ReviewQRGenerator: React.FC<ReviewQRGeneratorProps> = ({ onNavigateToAudit }) => {
  const [businessName, setBusinessName] = useState('');
  const [reviewLink, setReviewLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Free Google Review QR Code Generator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ProRankRadar"
    },
    "description": "Generate a high-conversion Google Review QR code stand for your business. Free, instant, and compliant with Google policies."
  };

  const validateLink = (url: string) => {
    if (!url) return true; // Allow empty while typing
    try {
      const u = new URL(url);
      const allowed = ['google.com', 'goo.gl', 'g.page', 'search.google.com'];
      if (!allowed.some(domain => u.hostname.includes(domain))) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReviewLink(val);
    if (val && !validateLink(val)) {
      setError("Please enter a valid Google Review link (e.g., g.page/...).");
    } else {
      setError(null);
    }
  };

  // Main Drawing Function
  useEffect(() => {
    const drawCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const QRCodeLib = window.QRCode;
      
      // Canvas Config (High Res A4 Ratio for quality)
      // Width: 1200px, Height: 1600px (Roughly A4/4x6 vertical ratio)
      const WIDTH = 1200;
      const HEIGHT = 1600;
      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      // 1. Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // 2. Border
      const borderWidth = 30;
      const margin = 60;
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = '#2563EB'; // Blue
      ctx.beginPath();
      // Rounded rect manually
      const r = 40;
      const x = margin, y = margin, w = WIDTH - margin*2, h = HEIGHT - margin*2;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.stroke();

      // 3. Header Text
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e293b'; // Slate 800
      
      // Title
      ctx.font = 'bold 64px Inter, system-ui, sans-serif';
      ctx.fillText("Valued Customer,", WIDTH / 2, 280);
      ctx.fillText("Your Opinion Matters!", WIDTH / 2, 360);

      // Subtitle
      ctx.font = 'normal 40px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#475569'; // Slate 600
      ctx.fillText("Scan to share your experience on Google.", WIDTH / 2, 450);

      // 4. QR Code Generation
      const qrSize = 550;
      const qrX = (WIDTH - qrSize) / 2;
      const qrY = 550;

      if (reviewLink && !error && QRCodeLib) {
        try {
          const qrDataUrl = await QRCodeLib.toDataURL(reviewLink, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: qrSize,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });

          const qrImage = new Image();
          qrImage.src = qrDataUrl;
          await new Promise(r => qrImage.onload = r);
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

          // 5. Draw Google G Logo in Center
          const logoSize = qrSize * 0.22; // 22% of QR
          const logoX = qrX + (qrSize - logoSize) / 2;
          const logoY = qrY + (qrSize - logoSize) / 2;

          // White circle background for logo
          ctx.beginPath();
          ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 5, 0, 2 * Math.PI);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          const logoImg = new Image();
          logoImg.src = GOOGLE_G_LOGO_SVG;
          await new Promise(r => logoImg.onload = r);
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        } catch (e) {
          console.error("QR Gen Error", e);
        }
      } else {
        // Placeholder box if no link
        ctx.fillStyle = '#F1F5F9';
        ctx.fillRect(qrX, qrY, qrSize, qrSize);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 4;
        ctx.strokeRect(qrX, qrY, qrSize, qrSize);
        
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 30px sans-serif';
        if (!QRCodeLib) {
           ctx.fillText("Library Loading...", WIDTH / 2, qrY + qrSize / 2);
        } else {
           ctx.fillText("Paste Link to Generate QR", WIDTH / 2, qrY + qrSize / 2);
        }
      }

      // 6. Call To Action & Business Name
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 48px Inter, system-ui, sans-serif';
      
      // Auto-scale business name if too long
      let nameFontSize = 56;
      if (businessName.length > 20) nameFontSize = 48;
      if (businessName.length > 35) nameFontSize = 36;
      ctx.font = `bold ${nameFontSize}px Inter, system-ui, sans-serif`;
      
      // Draw text
      ctx.fillText("Thank you for supporting", WIDTH / 2, 1200);
      
      ctx.fillStyle = '#2563EB'; // Blue branding
      ctx.fillText(businessName || "Our Local Business", WIDTH / 2, 1280);

      // 7. Footer Branding (Mandatory)
      ctx.fillStyle = '#94A3B8'; // Light slate
      ctx.font = 'normal 24px Inter, system-ui, sans-serif';
      ctx.fillText("Powered by ProRankRadar — Growth Audit & SEO for Google Business Profiles", WIDTH / 2, HEIGHT - 60);
    };

    // Debounce drawing
    const timeout = setTimeout(drawCanvas, 100);
    return () => clearTimeout(timeout);
  }, [businessName, reviewLink, error]);

  // Download Handlers
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas || error || !reviewLink) {
        if(!reviewLink) alert("Please paste your review link first.");
        return;
    }
    const link = document.createElement('a');
    link.download = `Google_Review_QR_${businessName.replace(/\s+/g, '_') || 'Flyer'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas || error || !reviewLink) {
        if(!reviewLink) alert("Please paste your review link first.");
        return;
    }
    
    setIsGenerating(true);
    // Use jspdf
    const { jsPDF } = window.jspdf || (window as any).jspdf;
    if (!jsPDF) {
      alert("PDF library not loaded yet. Please try again.");
      setIsGenerating(false);
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    doc.save(`Google_Review_QR_${businessName.replace(/\s+/g, '_') || 'Flyer'}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
             Free Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Free Google Review QR Code Generator <br className="hidden md:block"/> for Local Businesses
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Create a professional, print-ready QR code stand that sends customers directly to your Google review page. No signup required.
          </p>
        </div>
      </section>

      {/* Tool Section */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Inputs */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
             <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <QrIcon className="w-6 h-6 text-blue-600" /> Customize Your QR Stand
             </h3>

             <div className="space-y-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                     <Building2 className="w-4 h-4 text-slate-400" /> Business Name
                   </label>
                   <input 
                     type="text" 
                     maxLength={60}
                     placeholder="e.g. Joe's Coffee Shop"
                     value={businessName}
                     onChange={(e) => setBusinessName(e.target.value)}
                     className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                   <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Appears below QR code</span>
                      <span>{businessName.length}/60</span>
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                     <LinkIcon className="w-4 h-4 text-slate-400" /> Google Review Link
                   </label>
                   <input 
                     type="text" 
                     placeholder="e.g. https://g.page/r/CbX..."
                     value={reviewLink}
                     onChange={handleLinkChange}
                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'}`}
                   />
                   {error ? (
                     <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {error}
                     </p>
                   ) : (
                     <p className="text-xs text-slate-500 mt-2">Paste your "Get more reviews" link from your GBP dashboard.</p>
                   )}
                </div>

                <div className="pt-6 border-t border-slate-100">
                   <h4 className="text-sm font-bold text-slate-700 mb-3">Download Options</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={handleDownloadPDF}
                        disabled={!reviewLink || !!error || isGenerating}
                        className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all disabled:opacity-50 group"
                      >
                         <Printer className="w-6 h-6 text-slate-700 mb-2 group-hover:text-blue-600" />
                         <span className="font-bold text-sm text-slate-800">Print PDF</span>
                         <span className="text-xs text-slate-500">Best for Flyer/Stand</span>
                      </button>
                      <button 
                        onClick={handleDownloadPNG}
                        disabled={!reviewLink || !!error}
                        className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all disabled:opacity-50 group"
                      >
                         <Download className="w-6 h-6 text-slate-700 mb-2 group-hover:text-blue-600" />
                         <span className="font-bold text-sm text-slate-800">Digital PNG</span>
                         <span className="text-xs text-slate-500">For Social/Email</span>
                      </button>
                   </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                   <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                   <div className="text-xs text-blue-800 leading-relaxed">
                      <strong>Safe & Compliant:</strong> This tool generates a direct link to your Google profile. We do not use redirects or track your customers. Fully compliant with Google's guidelines.
                   </div>
                </div>
             </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center">
             <h3 className="font-bold text-slate-500 mb-4 uppercase tracking-wider text-sm">Live Preview</h3>
             <div className="shadow-2xl rounded-lg overflow-hidden border-[8px] border-slate-800 bg-white">
                {/* 
                  We render the canvas at a scaled down size for preview using CSS, 
                  but keep internal resolution high for download 
                */}
                <canvas 
                  ref={canvasRef} 
                  style={{ width: '100%', maxWidth: '400px', height: 'auto', display: 'block' }}
                />
             </div>
             <p className="text-sm text-slate-400 mt-4 text-center">
                Preview automatically updates as you type. <br/>Download to get high-resolution version.
             </p>
          </div>

        </div>
      </section>

      {/* SEO Content & FAQ */}
      <section className="bg-white py-20 border-t border-slate-200">
         <div className="max-w-4xl mx-auto px-6">
            
            <div className="mb-16">
               <h2 className="text-3xl font-bold text-slate-900 mb-6">Why use a Google Review QR Code?</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { title: "Instant Access", text: "Removes friction. Customers don't need to search for your business manually." },
                    { title: "More 5-Star Ratings", text: "Capture happy customers while they are still on-premise." },
                    { title: "Zero Cost", text: "Our tool is 100% free. No monthly fees, no scan limits, no signup." }
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-xl">
                       <Check className="w-5 h-5 text-green-500 mb-3" />
                       <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                       <p className="text-sm text-slate-600">{item.text}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div>
               <h2 className="text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
               <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-6">
                     <h3 className="font-bold text-lg text-slate-800 mb-2">Is this Google Review QR code generator really free?</h3>
                     <p className="text-slate-600">Yes, it is 100% free. There are no hidden costs, no signup required, and no limits on how many times the QR code can be scanned. We built this as a free utility for the ProRankRadar community.</p>
                  </div>
                  <div className="border-b border-slate-100 pb-6">
                     <h3 className="font-bold text-lg text-slate-800 mb-2">Will this help me get more Google reviews?</h3>
                     <p className="text-slate-600">Yes. By placing a QR stand at your checkout counter or on tables, you make it incredibly easy for customers to leave a review. Reducing the effort required significantly increases conversion rates.</p>
                  </div>
                  <div className="border-b border-slate-100 pb-6">
                     <h3 className="font-bold text-lg text-slate-800 mb-2">Is the QR code safe to scan?</h3>
                     <p className="text-slate-600">Absolutely. The QR code links directly to the Google URL you provide. We do not use intermediary redirects or tracking links, ensuring complete safety and transparency for your customers.</p>
                  </div>
                  <div className="pb-6">
                     <h3 className="font-bold text-lg text-slate-800 mb-2">Can I print the QR code?</h3>
                     <p className="text-slate-600">Yes. Our tool generates a high-resolution PDF designed specifically for printing. You can print it on standard A4 paper or resize it for 4x6 table tents.</p>
                  </div>
               </div>
            </div>

         </div>
      </section>

      {/* Upsell / CTA */}
      <section className="bg-slate-900 text-white py-20 text-center">
         <div className="max-w-3xl mx-auto px-6">
            <Star className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Reviews are just one part of the puzzle.</h2>
            <p className="text-slate-400 mb-8 text-lg">
               To rank #1 on Google Maps, you also need optimized categories, consistent NAP data, and a healthy profile structure.
            </p>
            <button 
               onClick={onNavigateToAudit}
               className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 mx-auto"
            >
               Run Full Ranking Audit <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-slate-500 mt-4">Takes 60 seconds · Free Analysis</p>
         </div>
      </section>

    </div>
  );
};

export default ReviewQRGenerator;

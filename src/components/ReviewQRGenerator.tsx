
import React, { useState, useEffect, useRef } from 'react';
import { Download, ShieldCheck, Printer, Check, Star, AlertTriangle, Link as LinkIcon, Building2, RefreshCw, QrCode, Loader2, ArrowRight, Globe } from 'lucide-react';

interface ReviewQRGeneratorProps {
  onNavigateToAudit: () => void;
}

const GOOGLE_G_LOGO_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23EA4335' d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'/%3E%3Cpath fill='%234285F4' d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'/%3E%3Cpath fill='%23FBBC05' d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'/%3E%3Cpath fill='%2334A853' d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'/%3E%3C/svg%3E`;

const ReviewQRGenerator: React.FC<ReviewQRGeneratorProps> = ({ onNavigateToAudit }) => {
  const [businessName, setBusinessName] = useState('');
  const [reviewLink, setReviewLink] = useState('');
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load QRCode Library Dynamically if missing
  useEffect(() => {
    let interval: any;
    let attempts = 0;

    const checkLibrary = () => {
      // Specifically check for toDataURL to ensure we have the correct library (node-qrcode),
      // not the legacy qrcodejs which doesn't support canvas generation this way.
      if ((window as any).QRCode && (window as any).QRCode.toDataURL) {
        setIsLibLoaded(true);
        if (interval) clearInterval(interval);
        return true;
      }
      return false;
    };

    // Immediate check
    if (checkLibrary()) return;

    // Poll for library
    interval = setInterval(() => {
      attempts++;
      if (checkLibrary()) return;

      // If not loaded after 5 seconds, try injecting fallback
      if (attempts === 10) { // 500ms * 10 = 5s
         if (!document.getElementById('qrcode-lib-fallback')) {
            console.warn("QR Code lib slow to load, trying unpkg fallback...");
            const script = document.createElement('script');
            script.id = 'qrcode-lib-fallback';
            script.src = "https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js";
            script.async = true;
            script.onload = () => {
              // Wait slightly for execution
              setTimeout(checkLibrary, 200);
            };
            document.body.appendChild(script);
         }
      }

      // Timeout after 10 seconds
      if (attempts > 20) {
        clearInterval(interval);
        if (!checkLibrary()) {
            setLoadError(true);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Free Google Review QR Code Generator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Generate a high-conversion Google Review QR code stand for your business."
  };

  const validateLink = (url: string) => {
    if (!url) return true;
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
    setHasGenerated(false); // Reset generated state on change
    
    if (val && !validateLink(val)) {
      setValidationWarning("Link doesn't look like a standard Google Review URL, but we'll generate it anyway.");
    } else {
      setValidationWarning(null);
    }
  };

  // Helper to draw a star
  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = '#FBBC05'; // Google Yellow
    ctx.fill();
  };

  const drawCanvas = async (forceQr: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard 4x6 inch ratio @ 300 DPI approx
    const WIDTH = 1200;
    const HEIGHT = 1800;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // 1. Background (Clean White)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. Google Logo (Top Center)
    const logoSize = 180;
    const logoY = 180;
    const logoX = (WIDTH - logoSize) / 2;
    
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "Anonymous";
      logoImg.src = GOOGLE_G_LOGO_SVG;
      await new Promise((resolve) => { 
          logoImg.onload = resolve; 
          logoImg.onerror = resolve; 
          if(logoImg.complete) resolve(null); 
      });
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    } catch (e) {
      console.warn("Logo load failed", e);
    }

    // 3. Header Text
    ctx.textAlign = 'center';
    
    // "review us on"
    ctx.font = '500 48px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#64748b'; // Slate 500
    ctx.fillText("review us on", WIDTH / 2, logoY + logoSize + 80);

    // "Google"
    ctx.font = 'bold 96px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#1e293b'; // Slate 800
    ctx.fillText("Google", WIDTH / 2, logoY + logoSize + 190);

    // 4. Five Stars
    const starY = logoY + logoSize + 260;
    const starGap = 90;
    const startX = (WIDTH - (starGap * 4)) / 2;
    
    for(let i=0; i<5; i++) {
      drawStar(ctx, startX + (i * starGap), starY, 5, 35, 16);
    }

    // 5. QR Code Area
    const qrSize = 650;
    const qrY = starY + 120;
    const qrX = (WIDTH - qrSize) / 2;

    // QR Container Box
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    
    const r = 40;
    const p = 40; // padding inside box
    const boxSize = qrSize + (p*2);
    const boxX = (WIDTH - boxSize) / 2;
    const boxY = qrY - p;
    
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(boxX, boxY, boxSize, boxSize, r);
    } else {
      ctx.rect(boxX, boxY, boxSize, boxSize);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // GENERATE QR
    // Only generate if forceQr is true OR we already generated it and just redrawing for text updates
    if ((forceQr || hasGenerated) && reviewLink) {
      try {
        const QRCode = (window as any).QRCode;
        let qrImageSrc = '';

        if (QRCode && QRCode.toDataURL) {
            // STRATEGY A: Local Library (Correct one loaded)
            qrImageSrc = await QRCode.toDataURL(reviewLink, {
                errorCorrectionLevel: 'H',
                margin: 0,
                width: qrSize,
                color: {
                    dark: '#1e293b',
                    light: '#ffffff'
                }
            });
        } else {
            // STRATEGY B: API Fallback (Online Mode)
            // Use qrserver.com if local lib fails or is blocked
            console.warn("Using Online QR Fallback");
            const safeLink = encodeURIComponent(reviewLink);
            // API returns an image. 
            // Color: 1e293b (Slate 800), Bg: ffffff
            qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${safeLink}&color=1e293b&bgcolor=ffffff&margin=0`;
        }

        const qrImage = new Image();
        qrImage.crossOrigin = "Anonymous"; // Important for allowing download
        qrImage.src = qrImageSrc;
        
        await new Promise((resolve, reject) => { 
            qrImage.onload = resolve; 
            qrImage.onerror = reject; 
            if(qrImage.complete) resolve(null);
        });
        
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      } catch (e) {
        console.error("QR Gen Error", e);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText("Error Generating QR", WIDTH / 2, qrY + qrSize / 2);
      }
    } else {
      // Placeholder state
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 32px sans-serif';
      
      let msg = "Click 'Generate Preview'";
      if (hasGenerated) msg = "Generating...";
      
      ctx.fillText(msg, WIDTH / 2, qrY + qrSize / 2);
    }

    // 6. Footer Text (Business Name & CTA)
    const footerY = boxY + boxSize + 120;
    
    if (businessName) {
      ctx.font = 'bold 56px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#0f172a'; // Slate 900
      ctx.fillText(businessName, WIDTH / 2, footerY);
      
      ctx.font = 'normal 36px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#64748b'; // Slate 500
      ctx.fillText("Scan to share your experience", WIDTH / 2, footerY + 70);
    } else {
      ctx.font = 'bold 48px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText("Scan to share your experience", WIDTH / 2, footerY + 30);
    }

    // 7. Branding
    ctx.font = 'normal 20px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#cbd5e1'; 
    ctx.fillText("Generated by ProRankRadar", WIDTH / 2, HEIGHT - 40);
  };

  // Redraw when text changes, but don't force QR regen unless explicitly triggered
  useEffect(() => {
    drawCanvas(false);
  }, [businessName]); 

  const handleGenerate = async () => {
    if (!reviewLink) {
        alert("Please paste your review link first.");
        return;
    }
    
    // Check if we can proceed (Either lib loaded OR we decided to use fallback)
    if (!isLibLoaded && !loadError) {
        alert("Resources are still loading. Please wait a moment.");
        return;
    }

    setIsGenerating(true);
    // Add artificial delay to make it feel like "work" and ensure UI updates
    await new Promise(r => setTimeout(r, 500));
    await drawCanvas(true);
    setHasGenerated(true);
    setIsGenerating(false);
  };

  // Download Handlers
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas || !reviewLink || !hasGenerated) return;
    const link = document.createElement('a');
    link.download = `Google_Review_Stand_${businessName.replace(/\s+/g, '_') || 'ProRankRadar'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas || !reviewLink || !hasGenerated) return;
    
    // Use jspdf
    const { jsPDF } = (window as any).jspdf || window.jspdf;
    if (!jsPDF) {
      alert("PDF library not loaded yet. Please try again.");
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a6');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    doc.save(`Google_Review_Stand_${businessName.replace(/\s+/g, '_') || 'ProRankRadar'}.pdf`);
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
            Free Google Review Stand Generator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Create a professional, printable QR table tent. Convert happy customers into 5-star reviews instantly.
          </p>
        </div>
      </section>

      {/* Tool Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Inputs */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 lg:sticky lg:top-24">
             <div className="mb-8 border-b border-slate-100 pb-6">
               <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" /> 1. Enter Details
               </h3>
               <p className="text-slate-500 text-sm mt-1">Configure your printable sign.</p>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                     <Building2 className="w-4 h-4 text-slate-400" /> Business Name (Optional)
                   </label>
                   <input 
                     type="text" 
                     maxLength={30}
                     placeholder="e.g. Joe's Coffee"
                     value={businessName}
                     onChange={(e) => setBusinessName(e.target.value)}
                     className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                   />
                   <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Appears at bottom of stand</span>
                      <span>{businessName.length}/30</span>
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                     <LinkIcon className="w-4 h-4 text-slate-400" /> Google Review Link
                   </label>
                   <div className="relative">
                     <input 
                       type="text" 
                       placeholder="https://g.page/r/..."
                       value={reviewLink}
                       onChange={handleLinkChange}
                       className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${validationWarning ? 'border-yellow-300 focus:ring-yellow-200' : 'border-slate-200 focus:ring-blue-500'}`}
                     />
                     {!reviewLink && (
                       <div className="absolute right-3 top-3.5 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                         Required
                       </div>
                     )}
                   </div>
                   {validationWarning ? (
                     <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {validationWarning}
                     </p>
                   ) : (
                     <p className="text-xs text-slate-500 mt-2">Paste your "Get more reviews" link from your Google Business Profile.</p>
                   )}
                </div>

                {/* Generate Action */}
                <div className="pt-2">
                   <button 
                     onClick={handleGenerate}
                     disabled={!reviewLink || isGenerating || (!isLibLoaded && !loadError)}
                     className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                        ${loadError ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/30' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'}`}
                   >
                     {isGenerating ? (
                        <>Generating...</>
                     ) : loadError ? (
                        <><Globe className="w-5 h-5" /> Generate (Online Mode)</>
                     ) : !isLibLoaded ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Loading Resources...</>
                     ) : (
                        <><QrCode className="w-5 h-5" /> Generate Preview</>
                     )}
                   </button>
                   {loadError && (
                       <p className="text-xs text-orange-600 mt-2 text-center">
                           Network blocked local library. Using online backup generator.
                       </p>
                   )}
                </div>

                {/* Downloads - Only active after generation */}
                <div className={`pt-6 border-t border-slate-100 transition-opacity duration-500 ${hasGenerated ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                   <h4 className="text-sm font-bold text-slate-700 mb-4">2. Download & Print</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={handleDownloadPDF}
                        disabled={!hasGenerated}
                        className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-slate-900/20"
                      >
                         <Printer className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                         <span className="font-bold text-sm">Print PDF</span>
                         <span className="text-xs opacity-70">Best for Table Tents</span>
                      </button>
                      <button 
                        onClick={handleDownloadPNG}
                        disabled={!hasGenerated}
                        className="flex flex-col items-center justify-center p-4 bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                         <Download className="w-6 h-6 mb-2 group-hover:text-blue-600 transition-colors" />
                         <span className="font-bold text-sm">Download PNG</span>
                         <span className="text-xs text-slate-400">For Social Media</span>
                      </button>
                   </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg flex gap-3 border border-blue-100">
                   <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                   <div className="text-xs text-blue-800 leading-relaxed">
                      <strong>Safe & Direct:</strong> We generate a QR code that links directly to Google. No intermediaries, no tracking, no expiring links.
                   </div>
                </div>
             </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center justify-center">
             <div className="relative group perspective-1000">
                {/* Acrylic Stand Effect Container */}
                <div className="relative transform transition-transform duration-500 preserve-3d">
                   {/* Reflection/Shine overlay */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent z-20 pointer-events-none rounded-lg"></div>
                   
                   {/* Canvas Wrapper */}
                   <div className="bg-white rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border-[1px] border-slate-200 overflow-hidden relative z-10">
                      <canvas 
                        ref={canvasRef} 
                        style={{ width: '100%', maxWidth: '400px', height: 'auto', display: 'block' }}
                      />
                   </div>

                   {/* Stand Base Mimic (CSS) */}
                   <div className="absolute -bottom-8 left-10 right-10 h-8 bg-black/20 blur-xl rounded-[100%] z-0"></div>
                </div>
             </div>
             
             <p className="text-sm text-slate-400 mt-12 text-center flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" /> High Resolution (300 DPI) Rendering
             </p>
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

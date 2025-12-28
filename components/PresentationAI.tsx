
import React, { useState } from 'react';
import { generatePresentation } from '../services/gemini';
import { jsPDF } from 'jspdf';

interface Slide {
  slideNumber: number;
  title: string;
  content: string[];
  visualKeyword: string;
  footer: string;
}

interface PresentationData {
  title: string;
  slides: Slide[];
}

const PresentationAI: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [language, setLanguage] = useState('O\'zbekcha');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const steps = [
    { label: "Mavzu tahlili", icon: "🔍" },
    { label: "Struktura yaratish", icon: "🏗️" },
    { label: "Matnlar tayyorlash", icon: "📚" },
    { label: "Vizual effektlar", icon: "🎨" },
    { label: "Tayyor!", icon: "✨" }
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setPresentation(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 3500);

    try {
      const result = await generatePresentation(topic, slideCount, language);
      if (result && result.slides) {
        setPresentation(result);
      } else {
        throw new Error("Invalid output");
      }
    } catch (error) {
      alert("AI xatosi! Iltimos mavzuni qisqaroq qilib qaytadan yozing.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!presentation) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    
    presentation.slides.forEach((slide, i) => {
      if (i > 0) doc.addPage();
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, 297, 210, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text(slide.title, 20, 30);
      
      doc.setFontSize(14);
      doc.setTextColor(200, 200, 200);
      slide.content.forEach((point, idx) => {
        doc.text(`• ${point}`, 20, 60 + (idx * 12));
      });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`PDF.uz AI • Created by Doniyorbek • Slide ${i+1}`, 20, 195);
    });
    
    doc.save(`Taqdimot_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter dark:text-white">Presentation AI</h2>
        <p className="text-slate-500 font-medium">Gamma uslubidagi professional taqdimotlar.</p>
      </div>

      {!presentation && !loading && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-14 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mavzu</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Masalan: Robototexnika kelajagi..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-8 py-6 font-bold text-xl h-40"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase">Slaydlar soni: {slideCount}</label>
                <input type="range" min="4" max="15" value={slideCount} onChange={(e) => setSlideCount(parseInt(e.target.value))} className="w-full accent-indigo-600" />
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase">Til</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold">
                  {['O\'zbekcha', 'Inglizcha', 'Ruscha'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
             </div>
          </div>

          <button onClick={handleGenerate} className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all active:scale-95">
             YARATISH ✨
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-10">
           <div className="w-20 h-20 border-8 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
           <p className="text-2xl font-black text-indigo-600">{steps[currentStep].label}...</p>
        </div>
      )}

      {presentation && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
             <h4 className="font-black truncate max-w-md">{presentation.title}</h4>
             <button onClick={downloadPDF} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm">PDF YUKLASH</button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
             <div className="hidden lg:flex flex-col gap-3 w-64 overflow-y-auto pr-2 no-scrollbar">
                {presentation.slides.map((s, idx) => (
                  <button key={idx} onClick={() => setCurrentSlideIndex(idx)} className={`p-4 rounded-2xl border text-left transition-all ${currentSlideIndex === idx ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900'}`}>
                    <p className="text-[9px] font-black opacity-50">SLAYD {idx+1}</p>
                    <p className="text-xs font-bold line-clamp-1">{s.title}</p>
                  </button>
                ))}
             </div>

             <div className="flex-1 bg-slate-950 rounded-[40px] p-10 md:p-16 relative overflow-hidden flex flex-col shadow-2xl">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
                <div className="relative z-10 space-y-8 flex-1">
                   <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.4em]">Slide {currentSlideIndex + 1} / {presentation.slides.length}</p>
                   <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight animate-slide-up">{presentation.slides[currentSlideIndex].title}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
                      <ul className="space-y-4">
                        {presentation.slides[currentSlideIndex].content.map((p, i) => (
                          <li key={i} className="flex gap-4 items-start text-slate-300 text-lg leading-relaxed">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2.5"></span>
                            {p}
                          </li>
                        ))}
                      </ul>
                      <div className="rounded-3xl overflow-hidden bg-slate-800 border-4 border-white/5">
                        <img src={`https://images.unsplash.com/photo-1557804506-669a67965ba0?sig=${currentSlideIndex}&q=80&w=800`} className="w-full h-full object-cover" alt="visual" />
                      </div>
                   </div>
                </div>
                <footer className="mt-auto pt-10 border-t border-white/5 flex justify-between items-center opacity-40">
                   <p className="text-[9px] font-black text-white uppercase tracking-widest">PDF.uz AI • {presentation.title}</p>
                </footer>
             </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PresentationAI;

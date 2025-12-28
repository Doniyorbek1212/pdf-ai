
import React, { useState } from 'react';
import { generateArticle } from '../services/gemini';

const ArticleAI: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<'blog' | 'scientific'>('blog');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Mavzu tahlil qilinmoqda",
    "Ma'lumotlar to'planmoqda",
    "Struktura shakllantirilmoqda",
    "Matn yozilmoqda",
    "Yakuniy tahrir"
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setArticle(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 4000);

    try {
      const result = await generateArticle(topic, type, tone);
      setArticle(result || "Xatolik yuz berdi.");
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const downloadWord = () => {
    if (!article) return;
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>
      <body style="font-family: 'Times New Roman', serif; line-height: 1.5; padding: 50px;">
        ${article}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pdfuz_ai_article_${Date.now()}.doc`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-5 py-2 rounded-full">
           <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Professional AI Copywriter</span>
        </div>
        <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">Maqola AI</h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg md:text-xl">Faqat bitta mavzu bering, qolganini AI mukammal bajaradi.</p>
      </div>

      {!article && !loading && (
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-2xl space-y-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Maqola Mavzusi</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Masalan: O'zbekistonda raqamli iqtisodiyotning rivojlanish istiqbollari..."
              className="w-full bg-slate-50 border-none rounded-[30px] px-8 py-8 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-xl md:text-2xl text-slate-800 h-44 resize-none placeholder:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Format</label>
               <div className="grid grid-cols-2 gap-2">
                 {['blog', 'scientific'].map((t) => (
                   <button
                    key={t}
                    onClick={() => setType(t as any)}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      type === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                   >
                     {t === 'blog' ? 'Blog Post' : 'Ilmiy Maqola'}
                   </button>
                 ))}
               </div>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ohang (Tone)</label>
               <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-slate-700 focus:ring-4 focus:ring-blue-50"
               >
                 {['Professional', 'Akademik', 'Oddiy/Do\'stona', 'Rasmiy', 'Ijodiy'].map(t => (
                   <option key={t} value={t}>{t}</option>
                 ))}
               </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim()}
            className="w-full bg-slate-900 text-white py-8 rounded-[35px] font-black text-2xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 group transform active:scale-95"
          >
            MAQOLANI YARATISH <span className="group-hover:translate-x-2 transition-transform">✍️</span>
          </button>
        </div>
      )}

      {loading && (
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center space-y-12 py-20">
           <div className="relative">
              <div className="w-32 h-32 md:w-44 md:h-44 border-[12px] border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-5xl md:text-7xl animate-bounce">✍️</div>
           </div>
           <div className="space-y-6 text-center w-full">
              <h4 className="text-3xl font-black text-slate-900 tracking-tight">{steps[currentStep]}...</h4>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-blue-600 transition-all duration-1000" 
                   style={{ width: `${(currentStep + 1) * 20}%` }}
                 ></div>
              </div>
           </div>
        </div>
      )}

      {article && (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">📄</div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-none mb-1">Maqola Tayyor</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{type === 'blog' ? 'Digital Content' : 'Academic Paper'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={downloadWord} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-xl shadow-emerald-100">
                   <span>📥</span> Microsoft Word
                </button>
                <button onClick={() => { setArticle(null); setTopic(''); }} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                   🔄 Yangi
                </button>
              </div>
           </div>

           <div className="bg-white p-10 md:p-20 rounded-[40px] md:rounded-[60px] border border-slate-50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
              <div className="prose prose-blue max-w-none text-slate-800 selection:bg-blue-100 article-viewer">
                 <div dangerouslySetInnerHTML={{ __html: article }} />
              </div>
           </div>
        </div>
      )}

      <style>{`
        .article-viewer h1 { font-size: 3rem; font-weight: 900; letter-spacing: -0.05em; line-height: 1; margin-bottom: 2rem; color: #0f172a; }
        .article-viewer h2 { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 3rem; margin-bottom: 1rem; color: #1e293b; border-left: 4px solid #2563eb; padding-left: 1rem; }
        .article-viewer p { font-size: 1.25rem; line-height: 1.7; margin-bottom: 1.5rem; color: #475569; }
        .article-viewer table { width: 100%; border-collapse: collapse; margin: 2rem 0; background: #f8fafc; border-radius: 1rem; overflow: hidden; }
        .article-viewer th { background: #e2e8f0; padding: 1rem; text-align: left; font-weight: 800; color: #0f172a; }
        .article-viewer td { padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #475569; }
        .article-viewer em { color: #64748b; font-size: 1.1rem; }
      `}</style>
    </div>
  );
};

export default ArticleAI;


import React, { useState, useEffect } from 'react';
import { generateTest } from '../services/gemini';

const TestAI: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [file, setFile] = useState<{ content: string; type: string; name: string } | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardNumber = "8600 3129 7497 6660";

  useEffect(() => {
    // Show support modal automatically when entering Test AI
    setShowSupport(true);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setFile({
          content: base64,
          type: uploadedFile.type,
          name: uploadedFile.name
        });
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim() && !file) {
      alert("Iltimos, mavzu yozing yoki fayl yuklang!");
      return;
    }
    
    setLoading(true);
    setTestResult(null);
    setStatus('AI ma\'lumotlarni tahlil qilmoqda...');

    try {
      setTimeout(() => setStatus('Test savollari tuzilmoqda...'), 3000);
      setTimeout(() => setStatus('Variantlar va kalitlar tayyorlanmoqda...'), 7000);

      const result = await generateTest(
        topic || (file ? `Fayl: ${file.name}` : ""), 
        count, 
        file?.content, 
        file?.type
      );
      
      setTestResult(result || "Kechirasiz, test yaratishda xatolik yuz berdi.");
      setStatus('Test tayyor!');
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const downloadWord = () => {
    if (!testResult) return;
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1 style="text-align: center;">Test Savollari</h1>
        <p style="text-align: center;">Mavzu: ${topic || file?.name || "Belgilanmagan"}</p>
        <hr/>
        ${testResult}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pdfuz_ai_test_${Date.now()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in pb-20 px-2">
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">Test AI</h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-sm sm:text-base">
          Istalgan mavzu yoki fayl asosida 5 tadan 50 tagacha professional test savollari tuzib oling.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6 sm:gap-8">
        {/* Configuration Panel */}
        <div className="bg-white p-6 sm:p-10 rounded-[30px] sm:rounded-[40px] border border-slate-100 shadow-sm space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-sm sm:text-base">Mavzu yoki matn:</h4>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan: O'zbekiston tarixi, Fizika qonunlari..."
                className="w-full h-32 p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-sm transition-all"
              />
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-sm sm:text-base">Hujjat yuklash (ixtiyoriy):</h4>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center relative hover:border-blue-400 transition-colors bg-slate-50/50 group">
                <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">{file ? '📄' : '📤'}</div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-tight">{file ? file.name : 'PDF yoki Word yuklang'}</p>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileSelect} accept=".pdf,.doc,.docx" />
              </div>
              {file && <button onClick={() => setFile(null)} className="text-[10px] text-rose-500 font-black uppercase tracking-widest hover:underline">Faylni o'chirish 🗑️</button>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h4 className="font-bold text-slate-700 text-sm sm:text-base">Savollar soni: <span className="text-blue-600 ml-1">{count} ta</span></h4>
              <span className="text-[10px] sm:text-xs text-slate-400 font-black tracking-widest">5 - 50</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={count} 
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || (!topic.trim() && !file)}
            className="w-full bg-indigo-600 text-white py-4 sm:py-5 rounded-2xl sm:rounded-[24px] font-black text-lg sm:text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3 transform active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Shakllantirilmoqda...
              </>
            ) : (
              <>✨ Testni yaratish</>
            )}
          </button>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-10 animate-pulse">
            <div className="text-6xl mb-4">✍️</div>
            <p className="text-indigo-600 font-bold">{status}</p>
          </div>
        )}

        {testResult && (
          <div className="bg-white p-6 sm:p-12 rounded-[30px] sm:rounded-[40px] border border-slate-100 shadow-2xl space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl">📋</div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg sm:text-xl">Tayyor testlar</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">{count} TA SAVOL • JAVOBLAR BILAN</p>
                </div>
              </div>
              <button
                onClick={downloadWord}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
              >
                📥 Word formatda yuklash
              </button>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700 overflow-x-auto">
              <div dangerouslySetInnerHTML={{ __html: testResult }} className="test-preview" />
            </div>
            
            <div className="pt-8 border-t border-slate-50 flex justify-center">
               <button onClick={() => setTestResult(null)} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors">Yangi test tuzish 🔄</button>
            </div>
          </div>
        )}
      </div>

      {/* Support Modal - Optimized UI for mobile */}
      {showSupport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-md p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-100 mx-auto">
            <button 
              onClick={() => setShowSupport(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-10 p-2 bg-slate-50 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-[24px] flex items-center justify-center mx-auto text-3xl shadow-inner shadow-blue-100">💡</div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Test AI Xizmati</h3>
              <p className="text-slate-500 text-sm font-medium">Loyiha rivoji uchun yordamingizni ayamang. Har bir qo'llab-quvvatlash biz uchun juda muhim! ❤️</p>
            </div>

            <div className="bg-slate-50 rounded-[35px] p-6 sm:p-8 border border-slate-100 space-y-6 relative group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">UZCARD TO'LOV</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-mono font-black text-slate-800 tracking-tight">{cardNumber}</p>
                </div>
                <div className="w-10 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-[8px] font-black text-white">UZCARD</div>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">KARTA SOHIBI</p>
                <p className="text-base sm:text-lg font-black text-slate-700">Abdujabborov Doniyorbek</p>
              </div>

              <button 
                onClick={handleCopy}
                className={`w-full py-4 rounded-2xl md:rounded-3xl font-black text-base transition-all flex items-center justify-center gap-2 ${
                  copied ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-100' : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200'
                }`}
              >
                {copied ? (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> NUSXALANDI</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg> NUSXA OLISH</>
                )}
              </button>
            </div>
            
            <button 
              onClick={() => setShowSupport(false)}
              className="mt-6 w-full text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-700 transition-colors"
            >
              Yopish va davom etish
            </button>
          </div>
        </div>
      )}

      <style>{`
        .test-preview h1 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 1rem; text-align: center; }
        .test-preview div { margin-bottom: 1.5rem; background: #f8fafc; padding: 1rem; sm:padding: 1.5rem; border-radius: 1.5rem; border: 1px solid #f1f5f9; }
        .test-preview ul { list-style: none; padding: 0; margin-top: 0.75rem; }
        .test-preview li { padding: 0.5rem 0.75rem; margin-bottom: 0.4rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.85rem; line-height: 1.4; }
        .test-preview h2, .test-preview h3 { font-size: 1rem; font-weight: 700; color: #334155; }
        @media (min-width: 640px) {
           .test-preview h1 { font-size: 1.5rem; }
           .test-preview li { font-size: 0.95rem; }
        }
      `}</style>
    </div>
  );
};

export default TestAI;

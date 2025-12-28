
import React, { useState } from 'react';
import { convertDocumentContent } from '../services/gemini';
import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';

const FileConverter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [targetExt, setTargetExt] = useState('pdf');

  const targetFormats = [
    { id: 'pdf', label: 'PDF', icon: '📄', mime: 'application/pdf', color: 'bg-rose-500' },
    { id: 'doc', label: 'Word (.doc)', icon: '📝', mime: 'application/msword', color: 'bg-blue-600' },
    { id: 'xls', label: 'Excel (.xls)', icon: '📊', mime: 'application/vnd.ms-excel', color: 'bg-emerald-600' },
    { id: 'txt', label: 'Text (.txt)', icon: '📋', mime: 'text/plain', color: 'bg-slate-700' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f) {
      setFile(f);
      setConvertedUrl(null);
      setStatus('');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setLoading(true);
    setConvertedUrl(null);
    setStatus('Hujjat tahlil qilinmoqda...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const sourceExt = file.name.split('.').pop()?.toLowerCase();
        let textContext = "";

        // Extracting text for better AI performance
        if (sourceExt === 'docx') {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          textContext = result.value;
        } else if (sourceExt === 'txt') {
          textContext = atob(base64);
        }

        setStatus('AI Turbo konvertatsiya boshlandi...');
        const targetFormatData = targetFormats.find(f => f.id === targetExt)!;
        
        const aiOutput = await convertDocumentContent(
          base64, 
          file.type || 'application/octet-stream', 
          targetFormatData.label, 
          textContext || undefined
        );

        if (!aiOutput) throw new Error("AI javob bera olmadi.");

        setStatus('Fayl shakllantirilmoqda...');
        
        let blob: Blob;
        const cleanedOutput = aiOutput.replace(/```html|```|```doc|```xls/g, '').trim();

        if (targetExt === 'pdf') {
          const doc = new jsPDF();
          const margin = 15;
          const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
          const splitText = doc.splitTextToSize(cleanedOutput, pageWidth);
          doc.text(splitText, margin, 20);
          blob = doc.output('blob');
        } else if (targetExt === 'doc' || targetExt === 'xls') {
          const header = targetExt === 'xls' ? 'excel' : 'word';
          const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:${header}' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'></head>
            <body style="font-family: Arial, sans-serif;">${cleanedOutput}</body>
            </html>
          `;
          blob = new Blob([htmlContent], { type: targetFormatData.mime });
        } else {
          blob = new Blob([cleanedOutput], { type: targetFormatData.mime });
        }
        
        setConvertedUrl(URL.createObjectURL(blob));
        setStatus('Tayyor! Yuklab olishingiz mumkin.');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setStatus('Xatolik yuz berdi. Fayl formati mos emas yoki katta.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in pb-20 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">AI Konverter</h2>
          <p className="text-slate-500 font-bold text-sm sm:text-lg opacity-70">Turbo tezlikda istalgan formatga AI yordamida o'tkazish.</p>
        </div>

        {/* Upload Step */}
        <div className="bg-white p-8 sm:p-14 rounded-[30px] sm:rounded-[60px] border-4 border-dashed border-slate-100 text-center space-y-6 relative overflow-hidden group hover:border-indigo-200 transition-all shadow-sm">
          {!file ? (
            <div className="space-y-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto text-3xl sm:text-5xl group-hover:scale-110 transition-transform">📂</div>
              <div>
                <h4 className="text-lg sm:text-2xl font-black text-slate-800">Hujjat yuklang</h4>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">PDF, Word, Excel yoki TXT</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto text-3xl sm:text-5xl">📄</div>
              <div>
                <h4 className="text-lg sm:text-2xl font-black text-slate-800 break-all">{file.name}</h4>
                <p className="text-xs sm:text-sm text-indigo-600 font-black uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • Fayl Tayyor</p>
              </div>
              <button onClick={() => { setFile(null); setConvertedUrl(null); }} className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] hover:underline">O'chirish</button>
            </div>
          )}
          {!file && <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" />}
        </div>

        {file && !convertedUrl && (
          <div className="bg-white p-6 sm:p-10 rounded-[30px] sm:rounded-[50px] border border-slate-100 shadow-xl space-y-8 animate-fade-in">
            <div className="space-y-4 text-center">
               <h4 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Target Format Selection</h4>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 {targetFormats.map(f => (
                   <button
                     key={f.id}
                     onClick={() => setTargetExt(f.id)}
                     className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                       targetExt === f.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105' : 'bg-slate-50 border-slate-50 text-slate-600 hover:border-indigo-100'
                     }`}
                   >
                     <span className="text-2xl sm:text-4xl">{f.icon}</span>
                     <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{f.label}</span>
                   </button>
                 ))}
               </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 sm:py-6 rounded-2xl sm:rounded-[32px] font-black text-lg sm:text-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-4 transform active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 sm:w-7 sm:h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  Konvertatsiya qilinmoqda...
                </>
              ) : (
                <>✨ TURBO KONVERTATSIYA</>
              )}
            </button>
            {status && <p className="text-center text-xs sm:text-sm font-black text-indigo-500 animate-pulse">{status}</p>}
          </div>
        )}

        {convertedUrl && (
          <div className="bg-emerald-50 border-4 border-emerald-100 p-8 sm:p-14 rounded-[40px] sm:rounded-[70px] space-y-8 animate-fade-in text-center relative overflow-hidden">
            <div className="relative z-10 space-y-6">
               <div className="w-20 h-20 sm:w-28 sm:h-28 bg-emerald-500 text-white rounded-[30px] sm:rounded-[45px] flex items-center justify-center mx-auto text-4xl sm:text-6xl shadow-2xl shadow-emerald-200 animate-bounce">✅</div>
               <div className="space-y-2">
                 <h4 className="font-black text-emerald-900 text-2xl sm:text-4xl tracking-tight">Hujjat Tayyor!</h4>
                 <p className="text-sm sm:text-xl text-emerald-600 font-bold opacity-80">AI muvaffaqiyatli o'zgartirdi.</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
                 <button
                   onClick={() => {
                      const link = document.createElement('a');
                      link.href = convertedUrl;
                      link.download = `pdfuz_ai_${file?.name.split('.')[0]}_turbo.${targetExt}`;
                      link.click();
                   }}
                   className="bg-emerald-600 text-white py-4 sm:py-6 rounded-2xl sm:rounded-[30px] font-black text-lg sm:text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3"
                 >
                   📥 YUKLAB OLISH
                 </button>
                 <button
                   onClick={() => { setFile(null); setConvertedUrl(null); setStatus(''); }}
                   className="bg-white text-slate-500 py-4 sm:py-6 rounded-2xl sm:rounded-[30px] font-black text-lg sm:text-xl hover:bg-slate-50 border border-slate-200 transition-all"
                 >
                   🔄 YANGI FAYL
                 </button>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileConverter;


import React, { useState } from 'react';
import { processPhotoAI } from '../services/gemini';

const PhotoAI: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startProcessing = async () => {
    if (!image) return;
    setLoading(true);
    
    try {
      const base64 = image.split(',')[1];
      const res = await processPhotoAI(base64, "Remove background, professional 3x4 crop, studio lighting.");
      
      if (res.imageUrl) {
        setProcessedImage(res.imageUrl);
      } else {
        alert("AI rasm qaytara olmadi. Iltimos qaytadan urinib ko'ring.");
      }
    } catch (error) {
      alert("Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter">Photo AI</h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">Hujjatlar uchun 3x4 rasmlarni professional darajada tayyorlang.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
          <div className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[35px] p-8 text-center relative overflow-hidden bg-slate-50 dark:bg-slate-800">
            {image ? (
              <img src={image} className="aspect-square w-full max-h-80 object-cover rounded-2xl mx-auto" alt="orig" />
            ) : (
              <div className="py-20 space-y-4">
                <div className="text-5xl">📸</div>
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Rasm tanlang</p>
              </div>
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} accept="image/*" />
          </div>

          {image && (
            <button
              onClick={startProcessing}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4"
            >
              {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : "ISHLASH ✨"}
            </button>
          )}
        </div>

        <div className="bg-slate-950 p-10 rounded-[40px] shadow-2xl min-h-[500px] flex flex-col items-center justify-center relative border border-slate-800">
           {processedImage ? (
             <div className="text-center space-y-8 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-[3/4] w-24 sm:w-32 bg-white rounded-lg overflow-hidden border-2 border-white shadow-xl">
                      <img src={processedImage} className="w-full h-full object-cover" alt="res" />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = processedImage;
                    link.download = "PDFUZ_3x4.png";
                    link.click();
                  }}
                  className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black"
                >
                  YUKLAB OLISH 📥
                </button>
             </div>
           ) : (
             <p className="text-slate-600 font-black uppercase tracking-widest">Natija bu yerda bo'ladi</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default PhotoAI;

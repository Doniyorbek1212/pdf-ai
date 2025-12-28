
import React, { useState } from 'react';
import { AppView } from '../types';

interface HomeProps {
  onViewChange: (view: AppView) => void;
}

const Home: React.FC<HomeProps> = ({ onViewChange }) => {
  const [showSupport, setShowSupport] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardNumber = "8600 3129 7497 6660";

  const handleCopy = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const services = [
    {
      id: AppView.SmartChat,
      title: 'Smart Chat AI',
      desc: 'Hujjatlar bilan yozma va ovozli suhbatlashing. AI sizni eshitadi va javob beradi.',
      color: 'bg-indigo-500',
      icon: '🎙️',
      tag: 'Ovozli'
    },
    {
      id: AppView.PresentationAI,
      title: 'Presentation AI',
      desc: 'Istalgan mavzu va fayl asosida professional taqdimotlar tayyorlash.',
      color: 'bg-violet-600',
      icon: '📽️',
      tag: 'Vizual'
    },
    {
      id: AppView.ArticleAI,
      title: 'Maqola AI',
      desc: 'Professional blog yoki ilmiy maqolalarni o\'zbek tilida tayyorlash.',
      color: 'bg-blue-500',
      icon: '✍️',
      tag: 'Professional'
    },
    {
      id: AppView.TestAI,
      title: 'Test AI',
      desc: 'Istalgan mavzu yoki fayl asosida mukammal test savollari tuzish.',
      color: 'bg-rose-500',
      icon: '📝',
      tag: 'Ta\'lim'
    },
    {
      id: AppView.PhotoAI,
      title: 'Photo AI',
      desc: 'Hujjat uchun 3x4 rasm tayyorlash va fonni tozalash.',
      color: 'bg-emerald-500',
      icon: '📸',
      tag: 'Tezkor'
    },
    {
      id: AppView.FileConverter,
      title: 'Konverter',
      desc: 'Hujjatlarni istalgan formatga AI yordamida o\'tkazish.',
      color: 'bg-amber-500',
      icon: '🔄',
      tag: 'Universal'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-20 lg:space-y-32 animate-fade-in pb-12">
      
      {/* Hero Section */}
      <section className="relative">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-indigo-950 dark:via-slate-900 dark:to-indigo-950 rounded-[30px] sm:rounded-[50px] lg:rounded-[70px] p-8 sm:p-14 lg:p-24 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-4xl space-y-6 sm:space-y-10 text-center sm:text-left">
            
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[9px] lg:text-[12px] font-black tracking-widest uppercase mx-auto sm:mx-0">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_#818cf8]"></span>
              INTELLECTUAL ARCHITECTURE
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tighter">
              PDF.uz AI <br/>
              <span className="text-indigo-400 drop-shadow-xl">Aql Chegarasi</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-lg lg:text-2xl font-medium leading-relaxed max-w-2xl opacity-90 mx-auto sm:mx-0">
              Eng kuchli sun'iy intellekt endi o'zbek tilida. Hujjatlar bilan muloqot qilishning eng aqlli usuli.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 pt-4">
              <button 
                onClick={() => onViewChange(AppView.SmartChat)}
                className="bg-white text-slate-900 px-8 py-4 lg:px-12 lg:py-5 rounded-2xl lg:rounded-3xl font-black text-sm lg:text-lg hover:shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 group shadow-xl shadow-black/20"
              >
                Boshlash <span className="group-hover:translate-x-2 transition-transform">🚀</span>
              </button>
              <button 
                onClick={() => setShowSupport(true)}
                className="bg-white/10 border border-white/10 text-white px-8 py-4 lg:px-12 lg:py-5 rounded-2xl lg:rounded-3xl font-black text-sm lg:text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3"
              >
                Qo'llab-quvvatlash 💎
              </button>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 lg:w-[600px] lg:h-[600px] bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-[80px] lg:blur-[200px] pointer-events-none"></div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="space-y-10 lg:space-y-16">
        <div className="text-center sm:text-left space-y-3 px-2">
          <h3 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">AI Ekosistemasi</h3>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm lg:text-lg opacity-70">Sizning kundalik ishlaringiz uchun barcha aqlli yechimlar bir joyda.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {services.map((service) => (
            <div 
              key={service.id}
              onClick={() => onViewChange(service.id)}
              className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[32px] lg:rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-xl dark:hover:shadow-indigo-950/20 transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col min-h-[300px] sm:min-h-[350px] lg:min-h-[420px]"
            >
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-10">
                  <div className={`w-14 h-14 lg:w-20 lg:h-20 ${service.color} rounded-2xl lg:rounded-3xl flex items-center justify-center text-3xl lg:text-5xl group-hover:scale-110 transition-transform shadow-lg`}>
                    {service.icon}
                  </div>
                  <span className="text-[9px] lg:text-[11px] font-black uppercase tracking-widest px-4 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {service.tag}
                  </span>
                </div>
                <div className="space-y-3 lg:space-y-5">
                  <h3 className="font-black text-xl lg:text-3xl text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">{service.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-base font-medium leading-relaxed opacity-80">{service.desc}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center text-indigo-700 dark:text-indigo-400 font-black text-xs lg:text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                Foydalanish <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-lg p-8 sm:p-14 shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setShowSupport(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-3 rounded-full active:scale-90 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="text-center space-y-6 mb-10">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-[30px] flex items-center justify-center mx-auto text-4xl shadow-inner animate-pulse">💝</div>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Loyiha Rivoji</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg font-medium">Sizning yordamingiz loyihani yangi bosqichga olib chiqishda juda muhim.</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-[30px] p-8 border border-slate-100 dark:border-slate-700 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">UZCARD KARTA</p>
                  <p className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white tracking-tighter">{cardNumber}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">SOXIBI</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-200 text-right">Doniyorbek Abdujabborov</p>
              </div>
              <button 
                onClick={handleCopy}
                className={`w-full py-5 rounded-[22px] font-black text-base transition-all flex items-center justify-center gap-3 ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-indigo-900/20'
                } active:scale-95`}
              >
                {copied ? '✅ NUSXALANDI' : '📥 NUSXA OLISH'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

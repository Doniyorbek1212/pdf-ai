
import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import PhotoAI from './components/PhotoAI';
import FileConverter from './components/FileConverter';
import SmartChat from './components/SmartChat';
import ArticleAI from './components/ArticleAI';
import TestAI from './components/TestAI';
import PresentationAI from './components/PresentationAI';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Home);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCooperation, setShowCooperation] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // HAQIQIY STATISTIKA (ALDASHSIZ)
  const [stats, setStats] = useState({
    totalVisitors: 0,
    onlineUsers: 1, // Faqat siz turganingiz uchun 1
    lastUpdate: ''
  });

  useEffect(() => {
    // 1. Tashriflarni sanash (Har bir refresh +1)
    const stored = localStorage.getItem('pdf_uz_real_counter');
    let currentCount = stored ? parseInt(stored) : 0;
    
    // Sahifa har yangilanganda (refresh bo'lganda) sanaymiz
    currentCount += 1;
    localStorage.setItem('pdf_uz_real_counter', currentCount.toString());

    setStats({
      totalVisitors: currentCount,
      onlineUsers: 1, // Halol: bitta o'zingiz tursangiz 1 chiqadi
      lastUpdate: new Date().toLocaleTimeString('uz-UZ')
    });
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const renderView = () => {
    switch (currentView) {
      case AppView.Home: return <Home onViewChange={setCurrentView} />;
      case AppView.SmartChat: return <SmartChat />;
      case AppView.PhotoAI: return <PhotoAI />;
      case AppView.FileConverter: return <FileConverter />;
      case AppView.ArticleAI: return <ArticleAI />;
      case AppView.TestAI: return <TestAI />;
      case AppView.PresentationAI: return <PresentationAI />;
      default: return <Home onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} overflow-x-hidden`}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${
        isDark ? 'bg-slate-900/50 md:bg-slate-900/20' : 'bg-white md:bg-[#F8FAFC]'
      } md:rounded-l-[30px] lg:rounded-l-[50px] md:my-1 lg:my-2 relative overflow-x-hidden`}>
        
        <header className="sticky top-0 z-40 bg-transparent backdrop-blur-md px-4 py-4 md:px-12 md:py-8">
          <div className="flex items-center justify-between max-w-[1800px] mx-auto w-full">
            
            <div className="flex items-center gap-3 md:hidden">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <span className="font-black text-lg tracking-tight">PDF.uz AI</span>
            </div>
            
            <div className="hidden md:block">
              <h2 className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-black mb-1 opacity-60">Real-Time Monitor</h2>
              <div className="flex items-center gap-3">
                <span className="font-black text-2xl lg:text-3xl tracking-tighter capitalize">{currentView.replace('-', ' ')}</span>
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Verified Stats</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-10">
              {/* HAQIQIY STATISTIKA INTERFEYSI */}
              <div className="flex items-center gap-6 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Onlayn</p>
                    <div className="flex items-center justify-end gap-1.5">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                       <p className="text-sm font-black text-emerald-500">{stats.onlineUsers}</p>
                    </div>
                 </div>
                 <div className="w-px h-6 bg-slate-100 dark:bg-slate-700"></div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sizning kirishingiz</p>
                    <p className="text-sm font-black dark:text-white">{stats.totalVisitors}</p>
                 </div>
              </div>

              <button onClick={toggleTheme} className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-amber-400">
                {isDark ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 md:px-12 py-4">
          <div className="max-w-[1800px] mx-auto">
            {renderView()}
          </div>
        </div>

        <footer className="mt-auto py-10 px-12 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] dark:text-white">© 2026 PDF.uz AI • Halol Statistika</p>
              <p className="text-[10px] text-slate-400 font-bold opacity-60 uppercase tracking-widest mt-1">Namangan, Chust • Doniyorbek Abdujabborov</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;

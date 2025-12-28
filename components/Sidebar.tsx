
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onClose }) => {
  const menuItems = [
    { id: AppView.Home, label: 'Bosh sahifa', icon: '🏠' },
    { id: AppView.SmartChat, label: 'Smart Chat AI', icon: '💬' },
    { id: AppView.PresentationAI, label: 'Presentation AI', icon: '📽️' },
    { id: AppView.ArticleAI, label: 'Maqola AI', icon: '✍️' },
    { id: AppView.TestAI, label: 'Test AI', icon: '📝' },
    { id: AppView.PhotoAI, label: 'Photo AI', icon: '📸' },
    { id: AppView.FileConverter, label: 'Konverter', icon: '🔄' },
  ];

  const handleMenuClick = (id: AppView) => {
    onViewChange(id);
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-[280px] lg:w-[320px] xl:w-[360px] transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col
        md:relative md:translate-x-0 md:h-screen
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        bg-white dark:bg-slate-950 md:bg-transparent
      `}>
        {/* Branding Header */}
        <div className="p-8 lg:p-10 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-5">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-indigo-600 rounded-[18px] lg:rounded-[24px] flex items-center justify-center text-white font-black text-2xl lg:text-3xl shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 ring-2 ring-indigo-50 dark:ring-indigo-900/30">P</div>
            <div>
              <h1 className="font-black text-xl lg:text-2xl text-slate-900 dark:text-white tracking-tighter leading-none mb-1">PDF.uz AI</h1>
              <p className="text-[9px] lg:text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-60">Smart Ecosystem</p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="md:hidden p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 rounded-xl active:scale-90 transition-transform"
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/>
             </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-5 lg:p-8 space-y-3 lg:space-y-4 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 lg:px-8 lg:py-5 rounded-[22px] lg:rounded-[30px] transition-all duration-300 group relative ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-100 dark:shadow-none scale-[1.02]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold hover:translate-x-2'
              }`}
            >
              <span className={`text-xl lg:text-2xl transition-transform group-hover:scale-110 ${currentView === item.id ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm lg:text-base tracking-tight">{item.label}</span>
              
              {currentView === item.id && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

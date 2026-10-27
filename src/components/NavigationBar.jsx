import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  QrCode,
  Syringe,
  History,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NavigationBar() {
  const { activeTab, setActiveTab, setIsScannerOpen } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#07090e]/95 backdrop-blur-2xl border-t border-white/10 px-3 pt-2 pb-5 max-w-[440px] mx-auto shadow-2xl">
      <div className="flex items-center justify-between relative px-1">
        {/* Tab 1: Overview */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'dashboard' && (
            <span className="w-5 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] mb-1"></span>
          )}
          <LayoutDashboard className="w-5 h-5 stroke-[2.2px]" />
          <span className="text-[10px] tracking-tight mt-0.5">Overview</span>
        </button>

        {/* Tab 2: Stacks & Custom Drink */}
        <button
          onClick={() => setActiveTab('stacks')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'stacks'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'stacks' && (
            <span className="w-5 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] mb-1"></span>
          )}
          <Sparkles className="w-5 h-5 stroke-[2.2px]" />
          <span className="text-[10px] tracking-tight mt-0.5">Stacks</span>
        </button>

        {/* Center: Raised Green Quick Action Button (Scan & Manual Entry) */}
        <div className="flex flex-col items-center justify-center -mt-6">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-lime-300 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-110 active:scale-95 transition-all border-4 border-[#07090e] flex items-center justify-center group"
            title="Green Quick Scan & Manual Food/Ingredient Entry"
            aria-label="Scan or Enter Food"
          >
            <QrCode className="w-6 h-6 stroke-[2.5px] group-hover:rotate-6 transition-transform text-slate-950" />
          </button>
          <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-tighter mt-1">
            Quick Log
          </span>
        </div>

        {/* Tab 4: Peptides & Safety */}
        <button
          onClick={() => setActiveTab('peptides')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'peptides'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'peptides' && (
            <span className="w-5 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] mb-1"></span>
          )}
          <Syringe className="w-5 h-5 stroke-[2.2px]" />
          <span className="text-[10px] tracking-tight mt-0.5">Peptides</span>
        </button>

        {/* Tab 5: Audit & History (Completely Unblocked) */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'history'
              ? 'text-purple-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'history' && (
            <span className="w-5 h-1 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7] mb-1"></span>
          )}
          <History className="w-5 h-5 stroke-[2.2px]" />
          <span className="text-[10px] tracking-tight mt-0.5">Audit</span>
        </button>
      </div>
    </nav>
  );
}

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  HeartPulse,
  Plus,
  Check,
  Info,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MorningStacksWidget() {
  const {
    morningStacks,
    todayLog,
    logMorningStack
  } = useApp();

  const [selectedStackInfo, setSelectedStackInfo] = useState(null);

  const getStackIcon = (iconName) => {
    switch (iconName) {
      case 'ShieldCheck': return ShieldCheck;
      case 'Zap': return Zap;
      case 'HeartPulse': return HeartPulse;
      default: return Sparkles;
    }
  };

  return (
    <section className="space-y-3">
      {/* Widget Header (Customise button removed as requested - customisation happens in Stacks tab) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide">Morning Stacks Quick Picker</h3>
            <p className="text-[10px] text-slate-400 font-medium">One-tap protocol logging & active ledger entry</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-500">
          {morningStacks.length} Active Stacks
        </span>
      </div>

      {/* Horizontal Scrollable Cards Sized for Pixel 8 */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 snap-x">
        {morningStacks.map((stack) => {
          const IconComponent = getStackIcon(stack.icon);
          const isLogged = (todayLog.stacksLogged || []).includes(stack.id);

          return (
            <div
              key={stack.id}
              className={`min-w-[270px] max-w-[285px] rounded-2xl p-4 transition-all relative flex flex-col justify-between border snap-start ${
                isLogged
                  ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-xl ${isLogged ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-emerald-400'}`}>
                      <IconComponent className="w-4 h-4 stroke-[2.5px]" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        {stack.badge || 'Protocol'}
                      </span>
                      <h4 className="text-xs font-extrabold text-white leading-tight">
                        {stack.name}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStackInfo(stack)}
                    className="text-slate-400 hover:text-slate-200 p-1"
                    title="View stack ingredients"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 font-medium line-clamp-1">
                  {stack.subtitle || `${stack.items?.length || 0} synergistic items`}
                </p>

                {/* Macro Pills */}
                <div className="flex items-center space-x-2 mt-3 text-[10px] font-mono">
                  <span className="bg-slate-800/80 text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-500/20">
                    +{stack.protein}g Protein
                  </span>
                  <span className="bg-slate-800/80 text-cyan-300 px-2 py-0.5 rounded-md font-bold">
                    {stack.leucine}g Leu
                  </span>
                  <span className="text-slate-400">
                    {stack.calories} kcal
                  </span>
                </div>
              </div>

              {/* One-Tap Log Action Button */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {isLogged ? '✓ Logged in tally' : 'Ready to pulse'}
                </span>

                <button
                  onClick={() => logMorningStack(stack.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
                    isLogged
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isLogged ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>Logged</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>Log Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stack Details Info Modal */}
      {selectedStackInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl relative max-h-[85vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setSelectedStackInfo(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950">
                <Sparkles className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400">{selectedStackInfo.badge}</span>
                <h3 className="text-base font-bold text-white">{selectedStackInfo.name}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3">{selectedStackInfo.subtitle}</p>

            <div className="bg-slate-950/60 rounded-xl p-3 border border-white/5 mb-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Formula Ingredients ({selectedStackInfo.items?.length || 0}):
              </span>
              <ul className="text-xs text-slate-200 space-y-1">
                {(selectedStackInfo.items || []).map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                    <span>{typeof item === 'string' ? item : `${item.name} (${item.amount || ''})`}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-950/30 rounded-xl p-3 border border-emerald-500/20 text-xs text-emerald-200">
              <span className="font-bold text-emerald-400 block mb-0.5">mTOR & Cellular Impact:</span>
              {selectedStackInfo.mTorEffect || 'Balanced protein synthesis pulse.'}
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/10">
              <span className="text-xs font-mono text-slate-400">{selectedStackInfo.calories} kcal | {selectedStackInfo.protein}g PRO</span>
              <button
                onClick={() => {
                  logMorningStack(selectedStackInfo.id);
                  setSelectedStackInfo(null);
                }}
                className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold hover:bg-emerald-400 transition-all"
              >
                Log to Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

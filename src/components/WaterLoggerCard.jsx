import React from 'react';
import { Droplets, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DAILY_TARGETS } from '../data/initialData';

export default function WaterLoggerCard() {
  const { todayTotals, incrementWater } = useApp();

  const targetMl = DAILY_TARGETS.waterMl || 3400;
  const currentMl = todayTotals.waterMl || 0;
  const progressPct = Math.min(100, Math.round((currentMl / targetMl) * 100));
  const isTargetAchieved = currentMl >= targetMl;

  return (
    <div className="glass-panel rounded-3xl p-4.5 border border-white/10 relative overflow-hidden shadow-xl">
      {/* Background Subtle Fluid Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Droplets className="w-4 h-4 stroke-[2.5px]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-extrabold text-white tracking-wide">Daily Hydration Logger</h2>
              {isTargetAchieved && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center space-x-0.5 border border-emerald-500/30">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Target Hit</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Crucial for retatrutide cellular clearance & kidney buffering
            </p>
          </div>
        </div>

        {/* Live Numeric Readout */}
        <div className="text-right font-mono">
          <span className="text-base font-extrabold text-cyan-300">{currentMl}</span>
          <span className="text-xs text-slate-400"> / {targetMl} ml</span>
        </div>
      </div>

      {/* Interactive Progress Bar */}
      <div className="space-y-1.5 mb-3.5">
        <div className="w-full bg-slate-950/80 rounded-full h-3 p-0.5 border border-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isTargetAchieved
                ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 shadow-[0_0_12px_#06b6d4]'
                : 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_#06b6d4]'
            }`}
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-0.5">
          <span>{progressPct}% of daily calibre</span>
          <span>{Math.max(0, targetMl - currentMl)} ml remaining</span>
        </div>
      </div>

      {/* Quick-Add Buttons: 250 ml, 500 ml, 750 ml */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => incrementWater(250)}
          className="flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/50 transition-all active:scale-95 text-xs font-bold font-mono group"
          title="Add 250 millilitres (approx. 1 glass)"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform" />
          <span>+250 ml</span>
        </button>

        <button
          onClick={() => incrementWater(500)}
          className="flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/50 transition-all active:scale-95 text-xs font-bold font-mono group"
          title="Add 500 millilitres (standard shaker cup)"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform" />
          <span>+500 ml</span>
        </button>

        <button
          onClick={() => incrementWater(750)}
          className="flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/50 transition-all active:scale-95 text-xs font-bold font-mono group"
          title="Add 750 millilitres (large hydration canteen)"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform" />
          <span>+750 ml</span>
        </button>
      </div>
    </div>
  );
}

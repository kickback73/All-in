// src/components/Header.jsx
import React from 'react';
import { ShieldCheck, Droplets, Flame, User, RefreshCw, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Header({ onOpenProfile }) {
  const {
    userProfile,
    dailyHydration,
    setDailyHydration,
    dailyNutrition,
    mtorState,
    setMtorState,
    syncStatusBadge,
    executePersistentSync,
  } = useAppContext();

  const hydrationPct = Math.min(
    100,
    Math.round(((dailyHydration.currentMl || 0) / (dailyHydration.targetMl || 3250)) * 100)
  );

  const quickAddWater = (ml) => {
    setDailyHydration((prev) => ({
      ...prev,
      currentMl: (Number(prev.currentMl) || 0) + ml,
    }));
  };

  // Compute mTOR linear spectrum position (0 - 100%) from fasting hours, protein, leucine, and workout window
  const leucineG = Number(mtorState.leucineTriggerGrams || ((dailyNutrition.aminos?.leucine || 0) / 1000)).toFixed(1);
  const fastingHrs = Number(mtorState.fastingHours) || 14;
  let mtorScore = 50;
  if (mtorState.mode === 'Autophagy / AMPK') {
    mtorScore = Math.max(8, Math.min(30, 32 - (fastingHrs - 12) * 3));
  } else if (mtorState.mode === 'Balanced') {
    mtorScore = 50;
  } else {
    mtorScore = Math.min(94, 72 + Math.min(22, Number(leucineG) * 5));
  }

  const cycleMtorZone = () => {
    const order = ['Autophagy / AMPK', 'Balanced', 'Anabolic / mTORC1'];
    const nextIdx = (order.indexOf(mtorState.mode) + 1) % order.length;
    setMtorState((prev) => ({ ...prev, mode: order[nextIdx] }));
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/90 border-b border-white/10 px-3 py-2">
      <div className="max-w-md mx-auto space-y-2">
        {/* Top Row: Brand + Sync Status Badge + All-In Athlete Avatar Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
              <span className="text-white font-black text-xs tracking-tighter">AI</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black tracking-tight text-white uppercase leading-none">
                  ALL IN
                </h1>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  NHL Safe
                </span>
              </div>
              <button
                type="button"
                onClick={() => executePersistentSync('manual')}
                title="Click to force cloud/local persistent sync"
                className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-cyan-300 transition truncate mt-0.5"
              >
                <RefreshCw className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span className="truncate">{syncStatusBadge}</span>
              </button>
            </div>
          </div>

          {/* All-In Athlete Profile Button with Avatar */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-100 transition shrink-0"
          >
            {userProfile.customPhotoUrl ? (
              <img
                src={userProfile.customPhotoUrl}
                alt={userProfile.name}
                className="w-6 h-6 rounded-full object-cover border border-cyan-400"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="text-left leading-tight">
              <div className="text-[10px] font-black text-white flex items-center gap-1">
                <span>All-In Athlete</span>
              </div>
              <div className="text-[9px] text-cyan-300 font-semibold">
                {userProfile.name} • {userProfile.weightLbs} lbs
              </div>
            </div>
          </button>
        </div>

        {/* Row 2: Compact Header Hydration Tracker */}
        <div className="bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Droplets className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="font-bold text-slate-200 uppercase tracking-wider">Hydration</span>
                <span className="font-black text-sky-300 font-mono">
                  {dailyHydration.currentMl} / {dailyHydration.targetMl} ml ({hydrationPct}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full transition-all duration-300"
                  style={{ width: `${hydrationPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => quickAddWater(250)}
              className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-[10px] font-black transition"
            >
              +250ml
            </button>
            <button
              type="button"
              onClick={() => quickAddWater(500)}
              className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-[10px] font-black transition"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Row 3: Compact mTOR Linear Indicator Spectrum */}
        <div
          onClick={cycleMtorZone}
          title="Tap to toggle mTOR zone (Auto-calculates from fasting hours, protein/leucine & training)"
          className="bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1.5 cursor-pointer hover:border-white/20 transition"
        >
          <div className="flex items-center justify-between text-[9px] mb-1">
            <span className="font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              mTOR Spectrum:
              <strong
                className={
                  mtorState.mode === 'Autophagy / AMPK'
                    ? 'text-cyan-300'
                    : mtorState.mode === 'Balanced'
                    ? 'text-emerald-300'
                    : 'text-amber-300'
                }
              >
                {mtorState.mode}
              </strong>
            </span>
            <span className="text-slate-400 font-mono">
              Fast {fastingHrs}h • Leu {leucineG}g • PRO {dailyNutrition.protein}g
            </span>
          </div>

          {/* Horizontal Linear Gauge with 3 Zones */}
          <div className="relative h-2 w-full rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-500">
            <div className="absolute inset-y-0 left-1/3 w-px bg-slate-950/70" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-slate-950/70" />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-950 shadow-md transition-all duration-300"
              style={{ left: `${mtorScore}%` }}
            />
          </div>

          <div className="grid grid-cols-3 text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            <span className={mtorScore < 34 ? 'text-cyan-300 font-black' : ''}>
              Low / Autophagy
            </span>
            <span className={`text-center ${mtorScore >= 34 && mtorScore <= 66 ? 'text-emerald-300 font-black' : ''}`}>
              Balanced
            </span>
            <span className={`text-right ${mtorScore > 66 ? 'text-amber-300 font-black' : ''}`}>
              Elevated / Anabolic
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

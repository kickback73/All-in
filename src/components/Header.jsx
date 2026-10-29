// src/components/Header.jsx
import React, { useState } from 'react';
import { ShieldCheck, Droplets, Flame, User, RefreshCw, Edit2, Check, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Header({ onOpenProfile }) {
  const {
    userProfile,
    dailyHydration,
    setDailyHydration,
    dailyNutrition,
    dailyActivity,
    mtorState,
    syncStatusBadge,
    executePersistentSync,
  } = useAppContext();

  // Manual Hydration Edit / Override State
  const [isEditingHydration, setIsEditingHydration] = useState(false);
  const [hydrationUnit, setHydrationUnit] = useState('ml'); // 'ml' | 'oz'
  const [draftCurrent, setDraftCurrent] = useState('');
  const [draftTarget, setDraftTarget] = useState('');

  const hydrationPct = Math.min(
    100,
    Math.round(((dailyHydration.currentMl || 0) / Math.max(1, dailyHydration.targetMl || 3250)) * 100)
  );

  const quickAddWater = (ml) => {
    setDailyHydration((prev) => ({
      ...prev,
      currentMl: Math.max(0, (Number(prev.currentMl) || 0) + ml),
    }));
  };

  const openHydrationEditor = () => {
    const curMl = Number(dailyHydration.currentMl) || 0;
    const tgtMl = Number(dailyHydration.targetMl) || 3250;
    if (hydrationUnit === 'oz') {
      setDraftCurrent(String(Math.round((curMl / 29.5735) * 10) / 10));
      setDraftTarget(String(Math.round((tgtMl / 29.5735) * 10) / 10));
    } else {
      setDraftCurrent(String(curMl));
      setDraftTarget(String(tgtMl));
    }
    setIsEditingHydration(true);
  };

  const toggleHydrationUnit = (nextUnit) => {
    if (nextUnit === hydrationUnit) return;
    const curNum = Number(draftCurrent) || 0;
    const tgtNum = Number(draftTarget) || 0;
    if (nextUnit === 'oz') {
      setDraftCurrent(String(Math.round((curNum / 29.5735) * 10) / 10));
      setDraftTarget(String(Math.round((tgtNum / 29.5735) * 10) / 10));
    } else {
      setDraftCurrent(String(Math.round(curNum * 29.5735)));
      setDraftTarget(String(Math.round(tgtNum * 29.5735)));
    }
    setHydrationUnit(nextUnit);
  };

  const saveHydrationOverride = () => {
    const curVal = Math.max(0, Number(draftCurrent) || 0);
    const tgtVal = Math.max(250, Number(draftTarget) || 3250);
    const curMl = hydrationUnit === 'oz' ? Math.round(curVal * 29.5735) : Math.round(curVal);
    const tgtMl = hydrationUnit === 'oz' ? Math.round(tgtVal * 29.5735) : Math.round(tgtVal);

    setDailyHydration((prev) => ({
      ...prev,
      currentMl: curMl,
      targetMl: tgtMl,
    }));
    setIsEditingHydration(false);
  };

  // Automated Read-Only mTOR linear spectrum position (0 - 100%) derived strictly from daily charting
  const leucineG = Number(mtorState.leucineTriggerGrams ?? ((dailyNutrition.aminos?.leucine || 0) / 1000)).toFixed(1);
  const fastingHrs = Number(mtorState.fastingHours ?? 16);
  const mtorScore = Math.max(8, Math.min(96, Number(mtorState.score) || 20));
  const workoutsCount = (dailyActivity.trainingLogs || []).length;

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

        {/* Row 2: Compact Header Hydration Tracker (with Editable Manual Override in ml / oz) */}
        <div className="bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1.5">
          {!isEditingHydration ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <div
                  onClick={openHydrationEditor}
                  title="Tap to manually edit daily hydration or target (ml / oz)"
                  className="min-w-0 flex-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                      <span>Hydration</span>
                      <Edit2 className="w-2.5 h-2.5 text-sky-400 opacity-80 group-hover:opacity-100" />
                    </span>
                    <span className="font-black text-sky-300 font-mono group-hover:underline">
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
                <button
                  type="button"
                  onClick={openHydrationEditor}
                  title="Manual Override (ml / oz)"
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-1.5 py-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-extrabold text-sky-300 uppercase">Current:</span>
                <input
                  type="text"
                  value={draftCurrent}
                  onChange={(e) => setDraftCurrent(e.target.value)}
                  className="w-16 rounded-lg bg-slate-950 border border-sky-500/50 px-1.5 py-0.5 text-xs font-black text-white text-center"
                />
                <span className="text-[10px] font-extrabold text-slate-400">/ Target:</span>
                <input
                  type="text"
                  value={draftTarget}
                  onChange={(e) => setDraftTarget(e.target.value)}
                  className="w-16 rounded-lg bg-slate-950 border border-white/20 px-1.5 py-0.5 text-xs font-black text-white text-center"
                />
              </div>

              <div className="flex items-center gap-1">
                <div className="flex rounded-lg bg-slate-950 border border-white/15 overflow-hidden text-[10px] font-black">
                  <button
                    type="button"
                    onClick={() => toggleHydrationUnit('ml')}
                    className={`px-1.5 py-0.5 ${hydrationUnit === 'ml' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
                      }`}
                  >
                    ml
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleHydrationUnit('oz')}
                    className={`px-1.5 py-0.5 ${hydrationUnit === 'oz' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
                      }`}
                  >
                    oz
                  </button>
                </div>
                <button
                  type="button"
                  onClick={saveHydrationOverride}
                  className="p-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  title="Save Hydration"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingHydration(false)}
                  className="p-1 rounded-lg bg-white/10 text-slate-300 hover:text-white"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Automated Read-Only mTOR Linear Indicator Spectrum (No manual dragging/clicking) */}
        <div
          aria-readonly="true"
          className="bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1.5 select-none pointer-events-none"
        >
          <div className="flex items-center justify-between text-[9px] mb-1">
            <span className="font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              mTOR Auto:
              <strong
                className={
                  mtorState.mode === 'Autophagy / AMPK'
                    ? 'text-cyan-300'
                    : mtorState.mode === 'Balanced'
                      ? 'text-emerald-300'
                      : 'text-amber-300'
                }
              >
                {mtorState.mode} ({mtorScore}%)
              </strong>
            </span>
            <span className="text-slate-400 font-mono">
              Fast {fastingHrs}h • Leu {leucineG}g • PRO {dailyNutrition.protein}g • Wkt {workoutsCount}
            </span>
          </div>

          <div className="relative h-2 w-full rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-500">
            <div className="absolute inset-y-0 left-1/3 w-px bg-slate-950/70" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-slate-950/70" />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-950 shadow-md transition-all duration-500"
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

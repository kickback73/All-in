import React from 'react';
import { Flame, Dumbbell, Footprints, Plus, Activity, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DAILY_TARGETS } from '../data/initialData';

export default function MetricRings() {
  const {
    todayTotals,
    progressMetrics,
    updateSteps,
    syncGoogleHealthSteps,
    userProfile
  } = useApp();

  const calorieTarget = userProfile.dailyCaloricTarget || DAILY_TARGETS.calories;
  const proteinTarget = userProfile.dailyProteinTarget || DAILY_TARGETS.protein;

  // SVG circular geometry calculations
  const size = 190;
  const strokeWidth = 11;
  const centre = size / 2;

  // Ring 1 (Outer): Calories
  const r1 = centre - strokeWidth;
  const c1 = 2 * Math.PI * r1;
  const calPct = Math.min(100, Math.round((todayTotals.calories / calorieTarget) * 100));
  const offset1 = c1 - (calPct / 100) * c1;

  // Ring 2 (Middle): Protein
  const r2 = r1 - strokeWidth - 5;
  const c2 = 2 * Math.PI * r2;
  const proPct = Math.min(100, Math.round((todayTotals.protein / proteinTarget) * 100));
  const offset2 = c2 - (proPct / 100) * c2;

  // Ring 3 (Inner): Steps & Activity
  const r3 = r2 - strokeWidth - 5;
  const c3 = 2 * Math.PI * r3;
  const offset3 = c3 - (Math.min(100, progressMetrics.stepsPct) / 100) * c3;

  return (
    <div className="glass-panel rounded-3xl p-5 relative overflow-hidden shadow-xl border border-white/10">
      {/* Background Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Daily Calibre Telemetry
          </span>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Active Metrics</h2>
        </div>

        {/* Google Health API Step Integration Badge */}
        <button
          onClick={syncGoogleHealthSteps}
          className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 hover:bg-emerald-900/60 transition-all active:scale-95"
          title="Google Health API Connected - Tap to Sync Pedometer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Google Health Sync</span>
          <RefreshCw className="w-3 h-3 text-emerald-400" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        {/* Concentric Progress Rings */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Tracks */}
            <circle
              cx={centre}
              cy={centre}
              r={r1}
              stroke="rgba(16, 185, 129, 0.15)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={centre}
              cy={centre}
              r={r2}
              stroke="rgba(6, 182, 212, 0.15)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={centre}
              cy={centre}
              r={r3}
              stroke="rgba(245, 158, 11, 0.15)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Active Concentric Rings with Rounded Caps */}
            <circle
              cx={centre}
              cy={centre}
              r={r1}
              stroke="#10b981"
              strokeWidth={strokeWidth}
              strokeDasharray={c1}
              strokeDashoffset={offset1}
              strokeLinecap="round"
              fill="transparent"
              className="progress-ring-circle"
            />
            <circle
              cx={centre}
              cy={centre}
              r={r2}
              stroke="#06b6d4"
              strokeWidth={strokeWidth}
              strokeDasharray={c2}
              strokeDashoffset={offset2}
              strokeLinecap="round"
              fill="transparent"
              className="progress-ring-circle"
            />
            <circle
              cx={centre}
              cy={centre}
              r={r3}
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeDasharray={c3}
              strokeDashoffset={offset3}
              strokeLinecap="round"
              fill="transparent"
              className="progress-ring-circle"
            />
          </svg>

          {/* Centred Stat Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-black text-white tracking-tight">
              {todayTotals.calories}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 -mt-1">
              / {calorieTarget} kcal
            </span>
            <div className="flex items-center space-x-1 mt-1 text-[11px] font-extrabold text-cyan-400">
              <span>{todayTotals.protein}g</span>
              <span className="text-slate-500">PRO</span>
            </div>
          </div>
        </div>

        {/* Legend / Metrics List (Water input removed as requested) */}
        <div className="flex-1 ml-5 space-y-3.5">
          {/* Calories Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
              <span className="text-slate-300 font-medium">Calories</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-white font-mono">{todayTotals.calories}</span>
              <span className="text-[10px] text-slate-500 font-mono"> / {calorieTarget}</span>
            </div>
          </div>

          {/* Protein Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></span>
              <span className="text-slate-300 font-medium">Protein</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-cyan-300 font-mono">{todayTotals.protein}g</span>
              <span className="text-[10px] text-slate-500 font-mono"> / {proteinTarget}g</span>
            </div>
          </div>

          {/* Google Health Step Tracking Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
              <span className="text-slate-300 font-medium">Steps</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-amber-300 font-mono">{todayTotals.steps}</span>
              <button
                onClick={() => updateSteps(500)}
                className="p-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all active:scale-95"
                title="Add 500 Steps"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Active Minutes Stat */}
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium">Active Zone</span>
            </div>
            <span className="font-mono text-emerald-300 font-bold text-xs">{todayTotals.activeMinutes || 35} mins</span>
          </div>
        </div>
      </div>
    </div>
  );
}

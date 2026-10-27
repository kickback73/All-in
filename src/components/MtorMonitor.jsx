import React, { useState } from 'react';
import { Activity, ShieldAlert, Sparkles, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DAILY_TARGETS } from '../data/initialData';

export default function MtorMonitor() {
  const { todayTotals, progressMetrics } = useApp();
  const [isGuidanceExpanded, setIsGuidanceExpanded] = useState(false);

  const isAmberCaution = progressMetrics.isMethionineCaution;
  const isRedExceeded = progressMetrics.isMethionineExceeded;

  return (
    <div className={`rounded-3xl p-5 border transition-all ${
      isRedExceeded
        ? 'glass-panel border-rose-500/50 bg-rose-950/20'
        : isAmberCaution
        ? 'glass-panel-glow-amber border-amber-500/40'
        : 'glass-panel border-white/10'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl ${
            isRedExceeded
              ? 'bg-rose-500 text-white'
              : isAmberCaution
              ? 'bg-amber-500 text-slate-950'
              : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            <Activity className="w-4 h-4 stroke-[2.5px]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-white tracking-wide">mTOR Pathway Regulation</h3>
              {isAmberCaution && (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>Safety Threshold</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Muscle retention vs Indolent NHL remission balance
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsGuidanceExpanded(!isGuidanceExpanded)}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg bg-slate-900/60 border border-white/5"
          title="Toggle clinical scientific guidance"
        >
          {isGuidanceExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Amino Acid Trackers */}
      <div className="space-y-4 my-2">
        {/* 1. Leucine Pulse Gauge */}
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Leucine Anabolic Pulse</span>
            </span>
            <div className="font-mono text-xs">
              <span className="text-emerald-300 font-extrabold">{todayTotals.leucine}g</span>
              <span className="text-slate-500"> / {DAILY_TARGETS.leucineTarget}g target</span>
            </div>
          </div>

          <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden border border-white/5 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progressMetrics.leucinePct)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {todayTotals.leucine >= DAILY_TARGETS.leucineTarget
              ? '✓ Target achieved. Skeletal muscle protein synthesis triggered.'
              : `${(DAILY_TARGETS.leucineTarget - todayTotals.leucine).toFixed(2)}g remaining to stimulate muscle protein preservation.`}
          </p>
        </div>

        {/* 2. Methionine Safety Threshold Gauge */}
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isRedExceeded ? 'bg-rose-500' : isAmberCaution ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
              <span>Methionine Safety Ceiling</span>
            </span>
            <div className="font-mono text-xs">
              <span className={`font-extrabold ${isRedExceeded ? 'text-rose-400' : isAmberCaution ? 'text-amber-300' : 'text-cyan-300'}`}>
                {todayTotals.methionine}g
              </span>
              <span className="text-slate-500"> / {DAILY_TARGETS.methionineSafetyCeiling}g limit</span>
            </div>
          </div>

          <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden border border-white/5 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isRedExceeded
                  ? 'bg-rose-500'
                  : isAmberCaution
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-400'
              }`}
              style={{ width: `${Math.min(100, progressMetrics.methioninePct)}%` }}
            ></div>
          </div>
          <p className={`text-[10px] mt-1 ${isAmberCaution ? 'text-amber-300 font-semibold' : 'text-slate-400'}`}>
            {isRedExceeded
              ? '⚠️ Daily methionine ceiling exceeded. Favour marine collagen or plant proteins for remaining meals.'
              : isAmberCaution
              ? '⚡ Approaching safety threshold (>1.4g). Prioritise tofu, collagen, or egg white scrambles.'
              : 'Optimal cellular baseline. Autophagy and mTOR downregulation maintained.'}
          </p>
        </div>
      </div>

      {/* Collapsible Scientific & Clinical Guidance */}
      {isGuidanceExpanded && (
        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300 space-y-2.5 bg-slate-950/60 rounded-2xl p-3.5">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Retatrutide & Remission Synchronisation Rationale</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            During rapid weight loss on triple agonist <strong className="text-white">retatrutide</strong>, skeletal muscle protection requires acute <strong className="text-emerald-300">leucine pulses</strong> (2.5g–3.5g) to trigger muscle protein synthesis without constant excess caloric load.
          </p>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Concurrently, for <strong className="text-white">indolent NHL remission</strong>, excessive chronic mTORC1 hyperactivity is moderated by keeping daily <strong className="text-amber-300">methionine intake capped under 1.8g</strong>. High-density staples like marine collagen peptides, liquid egg whites, extra firm tofu, and Pacific cod deliver massive protein payloads while remaining gentle on methionine accumulation.
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Dumbbell,
  Sparkles,
  QrCode,
  Trash2,
  CheckCheck,
  Activity,
  ChevronDown,
  ChevronUp,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DAILY_TARGETS } from '../data/initialData';

export default function NotificationDrawer() {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markAllNotificationsAsRead,
    clearNotifications,
    todayTotals,
    progressMetrics
  } = useApp();

  const [isMtorExpanded, setIsMtorExpanded] = useState(true);

  if (!isNotificationDrawerOpen) return null;

  const isAmberCaution = progressMetrics.isMethionineCaution;
  const isRedExceeded = progressMetrics.isMethionineExceeded;

  const getEventBadge = (type) => {
    switch (type) {
      case 'stack':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
          dot: 'bg-emerald-400',
          icon: Sparkles
        };
      case 'nutrition':
        return {
          bg: 'bg-teal-950/40 border-teal-500/30 text-teal-300',
          dot: 'bg-teal-400',
          icon: CheckCircle2
        };
      case 'scan':
        return {
          bg: 'bg-blue-950/40 border-blue-500/30 text-blue-300',
          dot: 'bg-blue-400',
          icon: QrCode
        };
      case 'workout':
        return {
          bg: 'bg-violet-950/40 border-violet-500/30 text-violet-300',
          dot: 'bg-violet-400',
          icon: Dumbbell
        };
      case 'mtor':
        return {
          bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-400',
          icon: AlertTriangle
        };
      case 'sync':
      default:
        return {
          bg: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300',
          dot: 'bg-cyan-400',
          icon: RefreshCw
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to dismiss */}
      <div
        className="flex-1"
        onClick={() => setIsNotificationDrawerOpen(false)}
      ></div>

      {/* Slide-out Drawer Panel Sized for Pixel 8 */}
      <div className="w-full max-w-[370px] bg-[#090d16] border-l border-white/10 h-full flex flex-col shadow-2xl relative z-10 animate-slide-in-right">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Side Notification Panel</h3>
              <p className="text-[10px] text-slate-400 font-medium">Chronological feed & mTOR pathway radar</p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationDrawerOpen(false)}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container with mTOR Tucked Inside Top */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3.5">
          {/* TUCKED-IN mTOR PATHWAY TRACKING MODULE */}
          <div className={`rounded-2xl p-3.5 border transition-all ${
            isRedExceeded
              ? 'bg-rose-950/30 border-rose-500/50'
              : isAmberCaution
              ? 'bg-amber-950/30 border-amber-500/40'
              : 'bg-slate-950/70 border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${
                  isRedExceeded
                    ? 'bg-rose-500 text-white'
                    : isAmberCaution
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <Activity className="w-3.5 h-3.5 stroke-[2.5px]" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">mTOR Pathway Tracking</h4>
                  <span className="text-[9px] text-slate-400 font-medium block">
                    Leucine pulse vs Methionine threshold
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMtorExpanded(!isMtorExpanded)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                {isMtorExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Automated Warning Notification Banner */}
            {isAmberCaution && (
              <div className="mb-2.5 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[10px] flex items-start space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-amber-300">Automated Alert:</strong> Daily methionine approaching safety threshold (≥1.4g). Prioritise collagen or plant proteins for remaining meals.
                </p>
              </div>
            )}

            {isMtorExpanded && (
              <div className="space-y-3 pt-1 text-xs font-mono">
                {/* 1. Leucine Pulse Progress */}
                <div>
                  <div className="flex justify-between items-baseline text-[11px] mb-1">
                    <span className="font-sans font-semibold text-slate-300">Leucine Anabolic Pulse</span>
                    <span className="text-emerald-300 font-bold">{todayTotals.leucine}g / {DAILY_TARGETS.leucineTarget}g</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progressMetrics.leucinePct)}%` }}
                    ></div>
                  </div>
                </div>

                {/* 2. Methionine Safety Threshold */}
                <div>
                  <div className="flex justify-between items-baseline text-[11px] mb-1">
                    <span className="font-sans font-semibold text-slate-300">Methionine Safety Ceiling</span>
                    <span className={`font-bold ${isAmberCaution ? 'text-amber-300' : 'text-cyan-300'}`}>
                      {todayTotals.methionine}g / {DAILY_TARGETS.methionineSafetyCeiling}g
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isRedExceeded
                          ? 'bg-rose-500'
                          : isAmberCaution
                          ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                          : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, progressMetrics.methioninePct)}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-[10px] font-sans text-slate-400 leading-tight">
                  Protects indolent NHL remission by capping chronic methionine-driven mTORC1 hyperactivation.
                </p>
              </div>
            )}
          </div>

          {/* Action Controls for Event Feed */}
          <div className="flex items-center justify-between px-1 text-[11px]">
            <span className="text-slate-400 font-mono">
              System Events ({notifications.length})
            </span>

            <div className="flex items-center space-x-3">
              <button
                onClick={markAllNotificationsAsRead}
                className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
              <button
                onClick={clearNotifications}
                className="text-slate-400 hover:text-rose-400 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Chronological Event Feed */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-1.5">
              <Bell className="w-8 h-8 stroke-[1.2px] text-slate-600 mx-auto" />
              <p className="text-xs">Zero events in ledger.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const badge = getEventBadge(item.type);
              const IconComp = badge.icon;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all ${badge.bg} ${
                    item.unread ? 'ring-1 ring-white/10' : 'opacity-85'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-black/40">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
                      <span>{item.timestamp}</span>
                      {item.unread && (
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-1.5 pl-7 leading-relaxed font-normal">
                    {item.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer Status */}
        <div className="p-3 border-t border-white/10 bg-slate-950/90 text-[10px] text-slate-400 text-center font-mono">
          <span>Pixel 8 Event & mTOR Synchronisation Active</span>
        </div>
      </div>
    </div>
  );
}

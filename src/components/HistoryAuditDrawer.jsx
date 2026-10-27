import React, { useState } from 'react';
import {
  Calendar,
  History,
  CheckCircle2,
  Edit,
  Clock,
  Trash2,
  Plus,
  Flame,
  Droplets,
  Footprints,
  Activity,
  ArrowRight,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DAILY_TARGETS } from '../data/initialData';

export default function HistoryAuditDrawer() {
  const { historicalLogs, updateHistoricalDay, todayLog } = useApp();

  // Combine historical logs with today's live ledger
  const allDays = {
    [todayLog.date]: {
      ...todayLog,
      isToday: true
    },
    ...historicalLogs
  };

  const sortedDates = Object.keys(allDays).sort((a, b) => new Date(b) - new Date(a));
  const [selectedDate, setSelectedDate] = useState(sortedDates[0]);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  const activeRecord = allDays[selectedDate];

  const handleOpenEdit = () => {
    setEditFormData({
      calories: activeRecord.calories || (activeRecord.meals ? activeRecord.meals.reduce((a, c) => a + (c.calories || 0), 0) : 0),
      protein: activeRecord.protein || (activeRecord.meals ? activeRecord.meals.reduce((a, c) => a + (c.protein || 0), 0) : 0),
      waterMl: activeRecord.waterMl || 0,
      steps: activeRecord.steps || 0,
      activeMinutes: activeRecord.activeMinutes || 0
    });
    setIsEditingModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editFormData) return;

    updateHistoricalDay(selectedDate, {
      calories: Number(editFormData.calories),
      protein: Number(editFormData.protein),
      waterMl: Number(editFormData.waterMl),
      steps: Number(editFormData.steps),
      activeMinutes: Number(editFormData.activeMinutes)
    });

    setIsEditingModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-4 border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Audit Intelligence
            </span>
            <h2 className="text-base font-extrabold text-white">Historical Ledger & Audit</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Query and modify any past day's client-side JSON records.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-emerald-400">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Date Carousel Selector */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
          Historical Timeline:
        </span>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 snap-x">
          {sortedDates.map((dateStr) => {
            const dayRecord = allDays[dateStr];
            const isSelected = selectedDate === dateStr;
            const dateObj = new Date(dateStr + 'T12:00:00');
            const dayName = dateObj.toLocaleDateString('en-CA', { weekday: 'short' });
            const dayNum = dateObj.toLocaleDateString('en-CA', { day: 'numeric', month: 'short' });

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-w-[100px] p-2.5 rounded-2xl border text-center transition-all relative flex flex-col items-center justify-between snap-start ${
                  isSelected
                    ? 'glass-panel-glow-emerald border-emerald-500/50 bg-emerald-950/20'
                    : 'glass-panel border-white/5 hover:border-white/20'
                }`}
              >
                {/* Indicator Badges */}
                <div className="flex items-center space-x-1 absolute -top-1.5 right-2">
                  {dayRecord.isEdited && (
                    <span className="bg-purple-900 text-purple-200 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border border-purple-500/30">
                      Edited
                    </span>
                  )}
                  {dayRecord.syncStatus === 'synced' && (
                    <span className="bg-emerald-900 text-emerald-300 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                      Synced
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                  {dayRecord.isToday ? 'Today' : dayName}
                </span>
                <span className="text-xs font-black text-white font-mono my-0.5">
                  {dayNum}
                </span>

                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  {dayRecord.protein || (dayRecord.meals ? dayRecord.meals.reduce((a, c) => a + (c.protein || 0), 0) : 0)}g PRO
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Audit Card */}
      {activeRecord && (
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-white">Record for {selectedDate}</h3>
                {activeRecord.isEdited && (
                  <span className="bg-purple-950 text-purple-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                    Retroactively Modified
                  </span>
                )}
                {activeRecord.syncStatus === 'synced' && (
                  <span className="bg-emerald-950 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Synced to Cloud
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Last modified: {activeRecord.lastModified ? new Date(activeRecord.lastModified).toLocaleTimeString() : 'N/A'}
              </p>
            </div>

            <button
              onClick={handleOpenEdit}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              <Edit className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit Record</span>
            </button>
          </div>

          {/* Metric Tiles for Selected Day */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono py-2 bg-slate-950/60 rounded-2xl border border-white/5">
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Calories</span>
              <span className="font-extrabold text-white">
                {activeRecord.calories || (activeRecord.meals ? activeRecord.meals.reduce((a, c) => a + (c.calories || 0), 0) : 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Protein</span>
              <span className="font-extrabold text-emerald-400">
                {activeRecord.protein || (activeRecord.meals ? activeRecord.meals.reduce((a, c) => a + (c.protein || 0), 0) : 0)}g
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Hydration</span>
              <span className="font-extrabold text-violet-400">{activeRecord.waterMl || 0}ml</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Steps</span>
              <span className="font-extrabold text-amber-400">{activeRecord.steps || 0}</span>
            </div>
          </div>

          {/* Meals Itemized Breakdown */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Itemized Food & Stacks ({activeRecord.meals ? activeRecord.meals.length : 0}):
            </span>

            {activeRecord.meals && activeRecord.meals.length > 0 ? (
              <div className="space-y-1.5">
                {activeRecord.meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{meal.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {meal.timestamp || 'Recorded'} • {meal.calories} kcal
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-emerald-400 font-bold block">+{meal.protein}g PRO</span>
                      {meal.leucine && (
                        <span className="text-cyan-400 text-[10px]">{meal.leucine}g Leu</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-2">Zero meals recorded for this date.</p>
            )}
          </div>

          {/* Workouts Breakdown */}
          {activeRecord.workouts && activeRecord.workouts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recorded Exercise Sessions ({activeRecord.workouts.length}):
              </span>
              <div className="space-y-1.5">
                {activeRecord.workouts.map((w) => (
                  <div
                    key={w.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{w.name}</span>
                      <span className="text-[10px] text-slate-400">{w.details}</span>
                    </div>
                    <span className="text-emerald-400 font-mono text-[10px] font-bold">✓ Complete</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Retroactive Edit Modal */}
      {isEditingModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setIsEditingModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-extrabold text-white mb-1">Retroactive Record Audit</h3>
            <p className="text-[11px] text-slate-400 mb-4">Editing data for {selectedDate}. Changes will apply an audit badge.</p>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="block text-slate-400 text-[11px] font-sans font-semibold mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={editFormData.calories}
                    onChange={(e) => setEditFormData({ ...editFormData, calories: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] font-sans font-semibold mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={editFormData.protein}
                    onChange={(e) => setEditFormData({ ...editFormData, protein: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="block text-slate-400 text-[11px] font-sans font-semibold mb-1">Water (ml)</label>
                  <input
                    type="number"
                    value={editFormData.waterMl}
                    onChange={(e) => setEditFormData({ ...editFormData, waterMl: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] font-sans font-semibold mb-1">Steps</label>
                  <input
                    type="number"
                    value={editFormData.steps}
                    onChange={(e) => setEditFormData({ ...editFormData, steps: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-sans font-semibold mb-1">Active Minutes</label>
                <input
                  type="number"
                  value={editFormData.activeMinutes}
                  onChange={(e) => setEditFormData({ ...editFormData, activeMinutes: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold shadow-md"
                >
                  Apply Audit Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

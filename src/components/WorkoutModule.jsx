import React, { useState } from 'react';
import {
  Dumbbell,
  Clock,
  Bell,
  Play,
  CheckCircle2,
  Plus,
  Flame,
  Layers,
  ChevronRight,
  Shield,
  Trash2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { feedbackEngine } from '../utils/soundEffects';

export default function WorkoutModule() {
  const {
    workoutPresets,
    workoutReminders,
    toggleWorkoutReminder,
    addWorkoutReminder,
    logWorkout,
    addNotification
  } = useApp();

  const [activePreset, setActivePreset] = useState(workoutPresets[0]);
  const [selectedBand, setSelectedBand] = useState('Black Band (45 lbs)');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(15);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState('08:00');
  const [newReminderTitle, setNewReminderTitle] = useState('Morning Band Conditioning');
  const [newReminderFreq, setNewReminderFreq] = useState('Daily (Mon-Sun)');

  // Request Pixel 8 native notification permission
  const requestNativeNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Pixel 8 Health Suite Active', {
          body: 'Native workout reminders synchronised with your Pixel 8 device.',
          icon: '/images/man outline.jfif'
        });
        addNotification({
          type: 'workout',
          title: 'Native Notifications Permitted',
          message: 'Workout alarms will trigger on your Pixel 8 lock screen.'
        });
      }
    }
  };

  const handleLogActiveSession = () => {
    const details = activePreset.requiresWeight
      ? `${sets} sets of ${reps} reps with ${selectedBand}`
      : `${sets} sets of ${reps} reps (${activePreset.tempo})`;

    logWorkout({
      name: activePreset.name,
      type: activePreset.type,
      details,
      resistanceUsed: activePreset.requiresWeight ? selectedBand : 'Zero External Weight (Bodyweight Calibre)',
      sets,
      reps,
      durationMinutes: 25
    });
  };

  const handleCreateReminder = (e) => {
    e.preventDefault();
    addWorkoutReminder({
      title: newReminderTitle,
      time: newReminderTime,
      frequency: newReminderFreq,
      presetId: activePreset.id
    });
    setIsReminderModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-4 border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Training Intelligence
            </span>
            <h2 className="text-base font-extrabold text-white">Resistance & Core Calibre</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Equipment intelligence: Band tension vs bodyweight plyometrics.
            </p>
          </div>

          <button
            onClick={requestNativeNotificationPermission}
            className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/40 transition-all flex items-center space-x-1"
            title="Enable Pixel 8 Native Notifications"
          >
            <Bell className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold">Alerts</span>
          </button>
        </div>
      </div>

      {/* Repeating Exercise Preset Selector */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
          Select Saved Routine Preset:
        </span>
        <div className="grid grid-cols-2 gap-2">
          {workoutPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setActivePreset(preset);
                setSets(preset.defaultSets || 4);
                setReps(preset.defaultReps || 15);
                if (preset.defaultBand) setSelectedBand(preset.defaultBand);
              }}
              className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                activePreset.id === preset.id
                  ? 'glass-panel-glow-emerald border-emerald-500/50 bg-emerald-950/20'
                  : 'glass-panel border-white/5 hover:border-white/20'
              }`}
            >
              <div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                  preset.requiresWeight
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {preset.requiresWeight ? 'Band Tension' : 'Bodyweight Plyo'}
                </span>
                <h4 className="text-xs font-bold text-white line-clamp-1">{preset.name}</h4>
              </div>

              <span className="text-[10px] text-slate-400 mt-2 font-mono">
                {preset.targetReps.split(' ')[0]} {preset.targetReps.split(' ')[1]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Workout Console with Equipment Intelligence */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400">
              Active Session Console
            </span>
            <h3 className="text-base font-extrabold text-white mt-0.5">{activePreset.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{activePreset.focusArea}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Equipment Intelligence Banner */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Equipment Intelligence: {activePreset.equipmentType}</span>
          </div>
          <p className="text-[11px] text-slate-400">{activePreset.notes}</p>
        </div>

        {/* Dynamic Fields: Band Tension vs Bodyweight */}
        {activePreset.requiresWeight ? (
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Resistance Band Colour & Tension:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Red Loop', tension: '20 lbs', colour: 'border-rose-500/40 text-rose-300' },
                { name: 'Black Band', tension: '45 lbs', colour: 'border-slate-500/40 text-slate-200' },
                { name: 'Purple Power', tension: '75 lbs', colour: 'border-purple-500/40 text-purple-300' }
              ].map(band => {
                const label = `${band.name} (${band.tension})`;
                const isSelected = selectedBand === label;
                return (
                  <button
                    key={band.name}
                    onClick={() => setSelectedBand(label)}
                    className={`p-2 rounded-xl text-center border text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-extrabold border-emerald-400 shadow-sm'
                        : `bg-slate-900/80 ${band.colour} hover:bg-slate-800`
                    }`}
                  >
                    <span className="block text-[11px] font-sans font-bold">{band.name}</span>
                    <span className="text-[10px]">{band.tension}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
            <div>
              <span className="font-bold block">Bodyweight Calibre Activated</span>
              <span className="text-[11px] text-slate-400">External weight requirement omitted. Focus on tempo and anti-extension.</span>
            </div>
            <span className="font-mono text-emerald-400 text-xs font-bold">0 kg required</span>
          </div>
        )}

        {/* Sets & Reps Counters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Completed Sets</span>
              <span className="text-lg font-bold text-white">{sets}</span>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setSets(Math.max(1, sets - 1))}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center font-bold"
              >
                -
              </button>
              <button
                onClick={() => setSets(sets + 1)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Reps / Cadence</span>
              <span className="text-lg font-bold text-white">{reps}</span>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setReps(Math.max(1, reps - 1))}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center font-bold"
              >
                -
              </button>
              <button
                onClick={() => setReps(reps + 1)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Action Button: Log Workout Session */}
        <button
          onClick={handleLogActiveSession}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Log Completed Routine (+25 Active Mins)</span>
        </button>
      </div>

      {/* Schedulable Workout Reminders Section */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Schedulable Reminders ({workoutReminders.length})
            </h3>
          </div>

          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reminder</span>
          </button>
        </div>

        <div className="space-y-2">
          {workoutReminders.map(rem => (
            <div
              key={rem.id}
              className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-white">{rem.title}</h4>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                  <span className="text-emerald-400 font-bold">{rem.time}</span>
                  <span>•</span>
                  <span>{rem.frequency}</span>
                </div>
              </div>

              <button
                onClick={() => toggleWorkoutReminder(rem.id)}
                className={`w-10 h-6 rounded-full transition-all relative ${
                  rem.enabled ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  rem.enabled ? 'right-1' : 'left-1'
                }`}></span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setIsReminderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-extrabold text-white mb-1">Schedule Workout Reminder</h3>
            <p className="text-[11px] text-slate-400 mb-4">Integrates with Pixel 8 native alarms and slide panel alerts.</p>

            <form onSubmit={handleCreateReminder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Routine Label</label>
                <input
                  type="text"
                  required
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Trigger Time</label>
                <input
                  type="time"
                  required
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Frequency</label>
                <select
                  value={newReminderFreq}
                  onChange={(e) => setNewReminderFreq(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Daily (Mon-Sun)">Daily (Mon-Sun)</option>
                  <option value="Weekdays (Mon-Fri)">Weekdays (Mon-Fri)</option>
                  <option value="Mon, Wed, Fri">Mon, Wed, Fri (Hypertrophy Split)</option>
                  <option value="Tue, Thu, Sat">Tue, Thu, Sat (Core & Flush)</option>
                </select>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold shadow-md"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

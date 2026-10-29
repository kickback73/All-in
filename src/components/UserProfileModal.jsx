// src/components/UserProfileModal.jsx
import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Calendar,
  Archive,
  Trash2,
  ShieldCheck,
  Save,
  Upload,
  HeartPulse,
  CheckCircle2,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { TILE_BACKGROUNDS } from '../utils/backgroundEngine';

const ACTIVITY_MULTIPLIERS = [
  { value: 1.2, label: '1.20 — Sedentary / Recovery' },
  { value: 1.375, label: '1.375 — Light Training (2–3x/wk Spin + Bands)' },
  { value: 1.55, label: '1.55 — Moderate Athletic (4–5x/wk)' },
  { value: 1.725, label: '1.725 — High Volume Recomp (6x/wk)' },
  { value: 1.9, label: '1.90 — All-In Intensive Athlete' },
];

export default function UserProfileModal({ isOpen, onClose }) {
  const {
    userProfile,
    setUserProfile,
    dailyNutrition,
    setDailyNutrition,
    dailyHydration,
    setDailyHydration,
    historicalLogs,
    setHistoricalLogs,
    archiveDailyLog,
    executePersistentSync,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('profile');
  const [savedNotice, setSavedNotice] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFacePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUserProfile((prev) => ({
          ...prev,
          customPhotoUrl: reader.result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAgeChange = (newAge) => {
    const parsedAge = Number(newAge) || 53;
    setUserProfile((prev) => ({
      ...prev,
      age: parsedAge,
      maxHr: Math.max(120, 220 - parsedAge),
    }));
  };

  const handleSaveProfile = () => {
    executePersistentSync('manual');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 overflow-y-auto">
      <div className="relative bg-slate-950 rounded-3xl shadow-2xl border border-white/15 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden text-white">
        <img
          src={TILE_BACKGROUNDS.activity}
          alt="Athlete Profile Backdrop"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-20 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 to-slate-950/95 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 px-4 py-3.5 bg-slate-900/90 border-b border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {userProfile.customPhotoUrl ? (
              <img
                src={userProfile.customPhotoUrl}
                alt={userProfile.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-cyan-400 shadow-xs"
              />
            ) : (
              <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                <User className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-black text-white">
                All-In Athlete Profile &amp; Logs
              </h2>
              <p className="text-[11px] text-slate-400">
                {userProfile.name} • Age {userProfile.age || 53} • {userProfile.height} •{' '}
                {userProfile.weightLbs} lbs → {userProfile.goalWeightLbs} lbs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative z-10 grid grid-cols-2 bg-slate-900/90 p-1 m-3 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All-In Athlete Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Historical Logs ({historicalLogs.length})
          </button>
        </div>

        <div className="relative z-10 p-4 pt-1 overflow-y-auto space-y-3">
          {activeTab === 'profile' ? (
            <>
              <div className="rounded-2xl bg-emerald-500/15 border border-emerald-400/30 p-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-100">
                  <strong>Remission Safeguard Active:</strong> {userProfile.remissionStatus}. Active Protocol: {userProfile.activeProtocol}.
                </div>
              </div>

              {/* Athlete Face Avatar Upload Card */}
              <div className="rounded-2xl bg-slate-900/90 border border-white/15 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {userProfile.customPhotoUrl ? (
                    <img
                      src={userProfile.customPhotoUrl}
                      alt={userProfile.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-black text-white">
                      Athlete Face Avatar
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Displays in the upper navigation bar
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFacePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                  {userProfile.customPhotoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setUserProfile((prev) => ({ ...prev, customPhotoUrl: '' }))
                      }
                      className="p-1.5 rounded-xl bg-white/10 border border-white/15 text-rose-400 hover:bg-rose-500/20"
                      title="Remove Avatar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Core Athlete Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Athlete Name
                  </label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) =>
                      setUserProfile((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={userProfile.age || 53}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Height
                  </label>
                  <input
                    type="text"
                    value={userProfile.height}
                    onChange={(e) =>
                      setUserProfile((p) => ({ ...p, height: e.target.value }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={userProfile.weightLbs}
                    onChange={(e) =>
                      setUserProfile((p) => ({
                        ...p,
                        weightLbs: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Goal (lbs)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={userProfile.goalWeightLbs}
                    onChange={(e) =>
                      setUserProfile((p) => ({
                        ...p,
                        goalWeightLbs: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <HeartPulse className="w-3 h-3 text-rose-400" />
                    <span>Max HR</span>
                  </label>
                  <input
                    type="number"
                    value={userProfile.maxHr || 220 - (userProfile.age || 53)}
                    onChange={(e) =>
                      setUserProfile((p) => ({
                        ...p,
                        maxHr: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-rose-300"
                  />
                </div>
              </div>

              {/* Activity Multiplier & Dietary Focus */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Activity Multiplier
                  </label>
                  <select
                    value={userProfile.activityMultiplier || 1.375}
                    onChange={(e) =>
                      setUserProfile((p) => ({
                        ...p,
                        activityMultiplier: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                  >
                    {ACTIVITY_MULTIPLIERS.map((m) => (
                      <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Dietary Focus &amp; Clinical Protocol
                  </label>
                  <input
                    type="text"
                    value={userProfile.dietaryFocus || ''}
                    onChange={(e) =>
                      setUserProfile((p) => ({
                        ...p,
                        dietaryFocus: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
              </div>

              {/* Daily Targets */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Kcal Target
                  </label>
                  <input
                    type="number"
                    value={dailyNutrition.targetCalories}
                    onChange={(e) =>
                      setDailyNutrition((p) => ({
                        ...p,
                        targetCalories: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={dailyNutrition.targetProtein}
                    onChange={(e) =>
                      setDailyNutrition((p) => ({
                        ...p,
                        targetProtein: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Water (ml)
                  </label>
                  <input
                    type="number"
                    value={dailyHydration.targetMl}
                    onChange={(e) =>
                      setDailyHydration((p) => ({
                        ...p,
                        targetMl: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
              </div>

              {savedNotice && (
                <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-2 text-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Athlete profile saved &amp; synced!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Athlete Profile</span>
                </button>
                <button
                  type="button"
                  onClick={archiveDailyLog}
                  className="py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive Today</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2.5">
              {historicalLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No archived daily snapshots yet. Automatic sync runs on launch and every midnight (`00:00:00`).
                </div>
              ) : (
                historicalLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-white/15 p-3 bg-slate-900/90 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        {log.date}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-300">
                          {log.weightLbs} lbs
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setHistoricalLogs((prev) =>
                              prev.filter((item) => item.id !== log.id)
                            )
                          }
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                      <div className="bg-slate-950 rounded-lg p-1 border border-white/10">
                        <div className="text-slate-400 font-bold">Kcal</div>
                        <div className="font-black text-white">
                          {log.nutrition?.calories || 0}
                        </div>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-1 border border-white/10">
                        <div className="text-slate-400 font-bold">Protein</div>
                        <div className="font-black text-emerald-400">
                          {log.nutrition?.protein || 0}g
                        </div>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-1 border border-white/10">
                        <div className="text-slate-400 font-bold">Water</div>
                        <div className="font-black text-cyan-300">
                          {log.hydration?.currentMl || 0}ml
                        </div>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-1 border border-white/10">
                        <div className="text-slate-400 font-bold">Burned</div>
                        <div className="font-black text-indigo-300">
                          {log.activity?.caloriesBurned || 0} kcal
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

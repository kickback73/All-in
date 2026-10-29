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
  Bell,
  Sparkles,
  Mail,
  Sliders,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MICRONUTRIENT_FIELDS } from '../data/initialData';
import { TILE_BACKGROUNDS } from '../utils/backgroundEngine';
import {
  requestDeviceNotificationPermission,
  triggerDeviceNotification,
  getNotificationPermissionState,
} from '../utils/notificationService';

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

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'limits' | 'improvement' | 'history'
  const [savedNotice, setSavedNotice] = useState('');
  const [improvementNotes, setImprovementNotes] = useState('');
  const [generatedPromptPreview, setGeneratedPromptPreview] = useState('');
  const [notifStatus, setNotifStatus] = useState(() => getNotificationPermissionState());
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
    setSavedNotice('Athlete profile & daily limits saved and synced!');
    setTimeout(() => setSavedNotice(''), 2200);
  };

  const handleEnableAndTestPush = async () => {
    const perm = await requestDeviceNotificationPermission();
    setNotifStatus(perm);
    setUserProfile((prev) => ({ ...prev, notificationsEnabled: perm === 'granted' }));
    if (perm === 'granted') {
      await triggerDeviceNotification(
        'All In — Push Notifications Active',
        `Connected for ${userProfile.name}. Daily stack, hydration, and training alerts enabled.`
      );
      setSavedNotice('Device push notification dispatched!');
      setTimeout(() => setSavedNotice(''), 2200);
    } else {
      setSavedNotice('Notification permission not granted by browser.');
      setTimeout(() => setSavedNotice(''), 2500);
    }
  };

  const updateMicroTarget = (key, val) => {
    setDailyNutrition((prev) => ({
      ...prev,
      targets: {
        ...(prev.targets || {}),
        micros: {
          ...(prev.targets?.micros || {}),
          [key]: Number(val) || 0,
        },
      },
    }));
  };

  const updateAminoTarget = (key, val) => {
    setDailyNutrition((prev) => ({
      ...prev,
      targets: {
        ...(prev.targets || {}),
        aminos: {
          ...(prev.targets?.aminos || {}),
          [key]: Number(val) || 0,
        },
      },
    }));
  };

  // Formulate Antigravity Improvement Prompt & Trigger Email to thekernyas@gmal.com
  const handleTriggerImprovementEmail = () => {
    const userFeedback = improvementNotes.trim() ||
      'Enhance UI responsiveness, refine daily nutritional and peptide tracking workflows, and optimize mobile Pixel 8 ergonomics.';

    const formulatedAntigravityPrompt = [
      'Refactor and update the All-In web application strictly according to the following improvement specification:',
      '',
      '### User Feedback & Improvement Request:',
      userFeedback,
      '',
      '### Current Athlete Profile & Daily Allowance Context:',
      `- Athlete: ${userProfile.name} (${userProfile.sex}, Age ${userProfile.age || 53}, ${userProfile.height}, ${userProfile.weightLbs} lbs -> Goal ${userProfile.goalWeightLbs} lbs)`,
      `- Daily Allowances: ${dailyNutrition.targetCalories} kcal | ${dailyNutrition.targetProtein}g Protein | ${dailyNutrition.targetCarbs}g Carbs | ${dailyNutrition.targetFiber}g Fiber | ${dailyNutrition.targetFats}g Fats | ${dailyHydration.targetMl}ml Water`,
      `- Active Protocol: ${userProfile.activeProtocol} (${userProfile.remissionStatus})`,
      '',
      '### Execution Constraints:',
      '- Preserve all existing layouts, navigation structures, and NHL remission safety rules outside of the requested changes.',
      '- Run production build (`npm run build`) and push live to Vercel (`origin/main`).',
    ].join('\n');

    setGeneratedPromptPreview(formulatedAntigravityPrompt);

    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(formulatedAntigravityPrompt).catch(() => {});
      }
    } catch {
      // Ignore clipboard permission errors
    }

    const recipient = 'thekernyas@gmal.com';
    const ccRecipient = 'thekernyas@gmail.com';
    const exactSubject = 'All-In improvment Prompt';
    const mailtoUrl = `mailto:${recipient}?cc=${encodeURIComponent(
      ccRecipient
    )}&subject=${encodeURIComponent(exactSubject)}&body=${encodeURIComponent(
      formulatedAntigravityPrompt
    )}`;

    window.location.href = mailtoUrl;
    setSavedNotice('Antigravity Improvement Prompt formulated & email client triggered!');
    setTimeout(() => setSavedNotice(''), 3000);
  };

  const microTargets = dailyNutrition.targets?.micros || {};
  const aminoTargets = dailyNutrition.targets?.aminos || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="relative bg-slate-950/40 rounded-3xl shadow-2xl border border-white/25 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden text-white">
        {/* Persistent Visible Tile Background Image (No opaque color wash) */}
        <img
          src={TILE_BACKGROUNDS.activity}
          alt="Athlete Profile Backdrop"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/55 to-slate-950/75 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 px-4 py-3.5 bg-slate-950/65 backdrop-blur-md border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {userProfile.customPhotoUrl ? (
              <img
                src={userProfile.customPhotoUrl}
                alt={userProfile.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-cyan-400 shadow-xs"
              />
            ) : (
              <div className="p-2 rounded-2xl bg-cyan-500/25 border border-cyan-400/50 text-cyan-300">
                <User className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-black text-white drop-shadow">
                Profile Settings &amp; Daily Limits
              </h2>
              <p className="text-[11px] text-slate-200">
                {userProfile.name} • Age {userProfile.age || 53} • {userProfile.weightLbs} lbs → {userProfile.goalWeightLbs} lbs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Navigation Tabs */}
        <div className="relative z-10 grid grid-cols-4 gap-1 bg-slate-950/70 backdrop-blur-md p-1 m-3 mb-1 rounded-2xl border border-white/15">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'limits', label: 'Daily Limits' },
            { id: 'improvement', label: 'Improvement' },
            { id: 'history', label: `Logs (${historicalLogs.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`py-1.5 rounded-xl text-[10px] font-black transition truncate ${
                activeTab === t.id
                  ? 'bg-cyan-400 text-slate-950 shadow-xs'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative z-10 p-4 pt-2 overflow-y-auto space-y-3">
          {savedNotice && (
            <div className="rounded-xl bg-emerald-500/25 border border-emerald-400/50 p-2.5 text-emerald-100 text-xs font-black flex items-center gap-1.5 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{savedNotice}</span>
            </div>
          )}

          {/* TAB 1: ATHLETE PROFILE & PUSH NOTIFICATIONS */}
          {activeTab === 'profile' && (
            <>
              <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-emerald-400/40 p-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-100">
                  <strong>Remission Safeguard Active:</strong> {userProfile.remissionStatus}. Active Protocol: {userProfile.activeProtocol}.
                </div>
              </div>

              {/* Athlete Face Avatar Upload Card */}
              <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/20 p-3 flex items-center justify-between gap-3">
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
                    <div className="text-xs font-black text-white">Athlete Face Avatar</div>
                    <div className="text-[10px] text-slate-300">
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
                    className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[11px] font-black flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                  {userProfile.customPhotoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setUserProfile((prev) => ({ ...prev, customPhotoUrl: '' }))
                      }
                      className="p-1.5 rounded-xl bg-white/10 border border-white/15 text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Core Athlete Metrics Grid */}
              <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/20 p-3 space-y-2.5">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                      Athlete Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) =>
                        setUserProfile((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      value={userProfile.age || 53}
                      onChange={(e) => handleAgeChange(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                      Height
                    </label>
                    <input
                      type="text"
                      value={userProfile.height}
                      onChange={(e) =>
                        setUserProfile((p) => ({ ...p, height: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
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
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
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
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1 flex items-center gap-1">
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
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-rose-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
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
                    className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-white"
                  >
                    {ACTIVITY_MULTIPLIERS.map((m) => (
                      <option key={m.value} value={m.value} className="bg-slate-950 text-white">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Web Push Notifications Control Card */}
              <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-cyan-400/30 p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Web Push &amp; Device Notifications</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Permission: <strong className="uppercase text-white">{notifStatus}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleEnableAndTestPush}
                  className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[11px] font-black shrink-0"
                >
                  Enable &amp; Test Push
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('improvement')}
                  className="py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Improvement</span>
                </button>
                <button
                  type="button"
                  onClick={archiveDailyLog}
                  className="py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-black flex items-center justify-center gap-1"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              </div>
            </>
          )}

          {/* TAB 2: DAILY RECOMMENDED ALLOWANCE LIMITS (MACROS, MICROS & AMINO ACIDS) */}
          {activeTab === 'limits' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/20 p-3 space-y-2.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Daily Macro &amp; Hydration Limits (Drives All Tile Charts)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-200 uppercase mb-0.5">
                      Max Calories
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
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-200 uppercase mb-0.5">
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
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-200 uppercase mb-0.5">
                      Total Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={dailyNutrition.targetCarbs}
                      onChange={(e) =>
                        setDailyNutrition((p) => ({
                          ...p,
                          targetCarbs: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-200 uppercase mb-0.5">
                      Fiber (g)
                    </label>
                    <input
                      type="number"
                      value={dailyNutrition.targetFiber}
                      onChange={(e) =>
                        setDailyNutrition((p) => ({
                          ...p,
                          targetFiber: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-violet-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-200 uppercase mb-0.5">
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      value={dailyNutrition.targetFats}
                      onChange={(e) =>
                        setDailyNutrition((p) => ({
                          ...p,
                          targetFats: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-amber-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-200 uppercase mb-0.5">
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
                      className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-sky-300"
                    />
                  </div>
                </div>
              </div>

              {/* Expanded 15-Micronutrient Daily Targets (Drives Spider / Radar Chart) */}
              <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/20 p-3 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Daily Micronutrient Targets (15 Vitamins &amp; Minerals)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {MICRONUTRIENT_FIELDS.map((m) => (
                    <div key={m.key}>
                      <label className="block text-[9px] font-bold text-slate-300 mb-0.5 truncate">
                        {m.shortLabel || m.label} ({m.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={microTargets[m.key] ?? m.defaultTarget}
                        onChange={(e) => updateMicroTarget(m.key, e.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2 py-1 text-xs font-bold text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Essential Amino Acid Daily Targets */}
              <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/20 p-3 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                  Daily Amino Acid Targets (mg)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'leucine', label: 'Leucine (mg)', def: 3000 },
                    { key: 'isoleucine', label: 'Isoleucine (mg)', def: 1500 },
                    { key: 'valine', label: 'Valine (mg)', def: 1800 },
                    { key: 'lysine', label: 'Lysine (mg)', def: 2400 },
                    { key: 'methionine', label: 'Methionine (mg)', def: 1200 },
                    { key: 'phenylalanine', label: 'Phenylalanine', def: 1600 },
                    { key: 'threonine', label: 'Threonine (mg)', def: 1400 },
                    { key: 'tryptophan', label: 'Tryptophan (mg)', def: 400 },
                    { key: 'histidine', label: 'Histidine (mg)', def: 900 },
                  ].map((a) => (
                    <div key={a.key}>
                      <label className="block text-[9px] font-bold text-slate-300 mb-0.5 truncate">
                        {a.label}
                      </label>
                      <input
                        type="number"
                        value={aminoTargets[a.key] ?? a.def}
                        onChange={(e) => updateAminoTarget(a.key, e.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2 py-1 text-xs font-bold text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save All Daily Allowance Limits</span>
              </button>
            </div>
          )}

          {/* TAB 3: "IMPROVEMENT" BUTTON & AUTOMATED ANTIGRAVITY EMAIL PROMPT */}
          {activeTab === 'improvement' && (
            <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-amber-400/40 p-3.5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-white">
                    Antigravity Improvement Prompt Generator
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    Dispatches to <strong>thekernyas@gmal.com</strong> • Subject: <strong>All-In improvment Prompt</strong>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-amber-200 mb-1">
                  Enter Your App Improvement Ideas or Feature Adjustments
                </label>
                <textarea
                  rows={4}
                  value={improvementNotes}
                  onChange={(e) => setImprovementNotes(e.target.value)}
                  placeholder="Describe any UI tweaks, new calculators, stack adjustments, or features you want formulated into an Antigravity prompt..."
                  className="w-full rounded-xl border border-white/20 bg-slate-950/85 p-2.5 text-xs font-medium text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleTriggerImprovementEmail}
                className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-lg transition"
              >
                <Mail className="w-4 h-4" />
                <span>Improvement — Generate Prompt &amp; Email</span>
              </button>

              {generatedPromptPreview && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-emerald-300 block">
                    ✓ Formulated Antigravity Prompt (Copied to Clipboard &amp; Sent to Mail Client):
                  </span>
                  <pre className="text-[10px] font-mono text-slate-200 bg-black/70 border border-white/15 rounded-xl p-2.5 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {generatedPromptPreview}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTORICAL LOGS */}
          {activeTab === 'history' && (
            <div className="space-y-2.5">
              {historicalLogs.length === 0 ? (
                <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/15 text-center py-8 text-xs text-slate-300">
                  No archived daily snapshots yet. Automatic sync runs on launch and every midnight (`00:00:00`).
                </div>
              ) : (
                historicalLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-white/20 p-3 bg-slate-950/65 backdrop-blur-md space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        {log.date}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-200">
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
                      <div className="bg-black/60 rounded-lg p-1 border border-white/10">
                        <div className="text-slate-400 font-bold">Kcal</div>
                        <div className="font-black text-white">
                          {log.nutrition?.calories || 0}
                        </div>
                      </div>
                      <div className="bg-black/60 rounded-lg p-1 border border-white/10">
                        <div className="text-slate-400 font-bold">Protein</div>
                        <div className="font-black text-emerald-400">
                          {log.nutrition?.protein || 0}g
                        </div>
                      </div>
                      <div className="bg-black/60 rounded-lg p-1 border border-white/10">
                        <div className="text-slate-400 font-bold">Water</div>
                        <div className="font-black text-cyan-300">
                          {log.hydration?.currentMl || 0}ml
                        </div>
                      </div>
                      <div className="bg-black/60 rounded-lg p-1 border border-white/10">
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

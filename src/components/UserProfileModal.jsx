import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Upload,
  Camera,
  CheckCircle2,
  Shield,
  Download,
  Cloud,
  Sliders,
  Scale,
  Ruler,
  Calendar,
  HeartPulse
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVATAR_PROFILES } from '../data/assets';

export default function UserProfileModal() {
  const {
    isSyncModalOpen,
    setIsSyncModalOpen,
    userProfile,
    updateUserProfile,
    googleSheetsWebhookUrl,
    setGoogleSheetsWebhookUrl,
    exportBackup,
    lastSyncTime
  } = useApp();

  const [formData, setFormData] = useState({
    name: userProfile.name || 'Athlete DK',
    weightKg: userProfile.weightKg || 84,
    heightCm: userProfile.heightCm || 182,
    age: userProfile.age || 46,
    targetWeightKg: userProfile.targetWeightKg || 78,
    dailyCaloricTarget: userProfile.dailyCaloricTarget || 1950,
    dailyProteinTarget: userProfile.dailyProteinTarget || 165,
    customPhotoUrl: userProfile.customPhotoUrl || null,
    selectedAvatarId: userProfile.selectedAvatarId || 'hero-power'
  });

  const [tempWebhookUrl, setTempWebhookUrl] = useState(googleSheetsWebhookUrl || '');
  const [saveBanner, setSaveBanner] = useState(false);
  const fileInputRef = useRef(null);

  if (!isSyncModalOpen) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          customPhotoUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setGoogleSheetsWebhookUrl(tempWebhookUrl);
    setSaveBanner(true);
    setTimeout(() => {
      setSaveBanner(false);
      setIsSyncModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={() => setIsSyncModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-3">
          <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <User className="w-4 h-4 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Athlete Profile & Biometrics</h3>
            <p className="text-[10px] text-slate-400">Personal calibration across all app metrics</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          {/* Profile Picture Upload Section */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center space-x-3.5">
            <div className="relative group">
              <img
                src={formData.customPhotoUrl || AVATAR_PROFILES.find(a => a.id === formData.selectedAvatarId)?.path || '/images/hero_power.jpg'}
                alt="Profile Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400/80 shadow-md ring-2 ring-white/10"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                title="Upload Photo"
              >
                <Camera className="w-5 h-5 text-emerald-400" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <span className="font-extrabold text-white block text-xs">{formData.name}</span>
              <p className="text-[10px] text-slate-400">Upload your own photo to display in the header icon.</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1 hover:bg-emerald-500/30"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Picture</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Preset Visual Avatars Selection (Alternative) */}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-[11px] font-semibold block">Or choose an athlete preset:</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_PROFILES.slice(0, 4).map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, selectedAvatarId: av.id, customPhotoUrl: null })}
                  className={`relative p-1 rounded-xl border transition-all ${
                    !formData.customPhotoUrl && formData.selectedAvatarId === av.id
                      ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/50'
                      : 'border-white/10 bg-slate-900/60 hover:border-white/30'
                  }`}
                >
                  <img
                    src={av.path}
                    alt={av.name}
                    className="w-full aspect-square rounded-lg object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Biometrics Inputs: Weight, Height, Age */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Biometric Parameters</span>
            </span>

            <div className="grid grid-cols-3 gap-2 font-mono">
              <div>
                <label className="block text-slate-400 text-[10px] font-sans font-semibold mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-sans font-semibold mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-sans font-semibold mb-1">Age</label>
                <input
                  type="number"
                  step="1"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono pt-1">
              <div>
                <label className="block text-slate-400 text-[10px] font-sans font-semibold mb-1">Goal Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.targetWeightKg}
                  onChange={(e) => setFormData({ ...formData, targetWeightKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-sans font-semibold mb-1">Daily Protein (g)</label>
                <input
                  type="number"
                  step="5"
                  value={formData.dailyProteinTarget}
                  onChange={(e) => setFormData({ ...formData, dailyProteinTarget: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-emerald-300 font-bold text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Google Sheets Webhook Background Endpoint */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold text-xs flex items-center space-x-1">
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Sheets Webhook Sync</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Automated Background</span>
            </div>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={tempWebhookUrl}
              onChange={(e) => setTempWebhookUrl(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-[10px] focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-400 leading-tight">
              Synchronises active data automatically in the background without needing manual button clicks.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            {saveBanner ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile & Biometrics Saved!</span>
              </>
            ) : (
              <span>Save Profile Calibration</span>
            )}
          </button>

          {/* Offline JSON Backup Button */}
          <button
            type="button"
            onClick={exportBackup}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-2 transition-all border border-white/5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Complete Health JSON (.json)</span>
          </button>
        </form>
      </div>
    </div>
  );
}

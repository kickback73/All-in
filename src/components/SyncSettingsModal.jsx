import React, { useState } from 'react';
import {
  X,
  Cloud,
  Download,
  Upload,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVATAR_PROFILES } from '../data/assets';

export default function SyncSettingsModal() {
  const {
    isSyncModalOpen,
    setIsSyncModalOpen,
    googleSheetsWebhookUrl,
    setGoogleSheetsWebhookUrl,
    exportBackup,
    selectedAvatarId,
    setSelectedAvatarId,
    lastSyncTime
  } = useApp();

  const [tempUrl, setTempUrl] = useState(googleSheetsWebhookUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isSyncModalOpen) return null;

  const handleSaveEndpoint = (e) => {
    e.preventDefault();
    setGoogleSheetsWebhookUrl(tempUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
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

        <div className="flex items-center space-x-2.5 mb-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Cloud className="w-4 h-4 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">App Architecture & Sync</h3>
            <p className="text-[10px] text-slate-400">Vercel Free Tier & Pixel 8 Settings</p>
          </div>
        </div>

        {/* Vercel Free Tier Optimisation Notice */}
        <div className="my-3 p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Vercel Free Tier Zero-Overhead Guarantee</span>
          </span>
          <p className="text-[11px] leading-relaxed text-slate-300">
            This application runs entirely on client-side JSON caching. Data synchronisation with Google Sheets is strictly batched and fired only on your explicit <strong className="text-white">"Submit Log"</strong> tap or during midnight archive. Zero unnecessary serverless invocations.
          </p>
        </div>

        {/* Dynamic Local Asset Avatar Selector */}
        <div className="my-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Profile Athlete (Local Images):
            </span>
            <span className="text-[10px] text-slate-400 font-mono">/images folder</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {AVATAR_PROFILES.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id;
              return (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                  className={`relative p-1 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/50'
                      : 'border-white/10 bg-slate-900/60 hover:border-white/30'
                  }`}
                  title={`${avatar.name} - ${avatar.role}`}
                >
                  <img
                    src={avatar.path}
                    alt={avatar.name}
                    className="w-full aspect-square rounded-xl object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/man outline.jfif';
                    }}
                  />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 text-[8px] font-black">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Google Sheets Webhook Configuration Form */}
        <form onSubmit={handleSaveEndpoint} className="space-y-3 text-xs pt-2 border-t border-white/5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Google Sheets Webhook URL</label>
              <span className="text-[10px] text-slate-400">Google Apps Script</span>
            </div>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Leave blank to operate in 100% offline-verified JSON mode.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Webhook Endpoint Saved!</span>
              </>
            ) : (
              <span>Update Synchronisation Endpoint</span>
            )}
          </button>
        </form>

        {/* JSON Backup Export */}
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Offline JSON Database Backup:
          </span>

          <button
            onClick={exportBackup}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all border border-white/5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Complete Health JSON (.json)</span>
          </button>

          {lastSyncTime && (
            <p className="text-[10px] text-slate-400 text-center font-mono">
              Last batched submission: {lastSyncTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// src/components/Header.jsx
import React from 'react';
import { User, History, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVATAR_PROFILES } from '../data/assets';

export default function Header({ onOpenHistory }) {
  const { userProfile, universalLogs, activeCycleKey } = useApp();

  const currentAvatar = AVATAR_PROFILES.find((a) => a.id === userProfile?.selectedAvatarId) || AVATAR_PROFILES[0];
  const profileImageSrc = userProfile?.customPhotoUrl || currentAvatar?.path || '/images/hero_power.jpg';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Left: App Title & Status */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-xs">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">All-In</h1>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Google Health Telemetry • Daily Cycle {activeCycleKey} (12:01 AM Reset)
            </p>
          </div>
        </div>

        {/* Right: User Profile Settings Icon Button -> routes directly to Historical Log View */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#F4F8FB] hover:bg-sky-100/80 border border-slate-200 text-slate-800 text-xs font-extrabold transition shadow-2xs cursor-pointer group"
          title="Open Historical Log & Profile Settings (Full Retrospective CRUD)"
          aria-label="Open Historical Log & Profile Settings"
        >
          <div className="relative">
            <img
              src={profileImageSrc}
              alt={userProfile?.name || 'Athlete DK'}
              className="w-7 h-7 rounded-full object-cover bg-slate-200 border border-slate-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/hero_power.jpg';
              }}
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-slate-900 group-hover:text-sky-700 font-extrabold line-clamp-1">
              {userProfile?.name || 'Athlete DK'}
            </div>
            <div className="text-[10px] text-slate-500 font-bold">Historical Log & CRUD</div>
          </div>
          <History className="w-4 h-4 text-sky-700 ml-1 shrink-0" />
        </button>
      </div>
    </header>
  );
}

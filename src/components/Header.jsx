// src/components/Header.jsx
import React from 'react';
import { History, Shuffle, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVATAR_PROFILES } from '../data/assets';

export default function Header({ onOpenHistory, onShuffleBackgrounds }) {
  const { userProfile, universalLogs, activeCycleKey } = useApp();

  const currentAvatar =
    AVATAR_PROFILES.find((a) => a.id === userProfile?.selectedAvatarId) || AVATAR_PROFILES[0];
  const profileImageSrc =
    userProfile?.customPhotoUrl || currentAvatar?.path || '/images/hero_power.jpg';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 pt-2 pb-3 shadow-2xs">
      {/* Pixel 8 Status Bar Strip */}
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pb-1.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-3 h-3 text-sky-600" />
          <span>PIXEL 8 • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold">
            Cycle {activeCycleKey} • 12:01 AM Reset
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="flex items-center justify-between pt-2">
        {/* Left: All-In Branding */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0">
            AI
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                All-In
              </h1>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Google Health Protocol Suite
            </p>
          </div>
        </div>

        {/* Right: Shuffle Tile Images + User Profile Settings Icon -> Historical Log View */}
        <div className="flex items-center gap-1.5">
          {onShuffleBackgrounds && (
            <button
              type="button"
              onClick={onShuffleBackgrounds}
              className="p-2 rounded-full bg-[#F4F8FB] hover:bg-sky-100 border border-slate-200 text-slate-700 transition cursor-pointer"
              title="Randomize Non-Duplicating Tile Background Images"
              aria-label="Shuffle Tile Backgrounds"
            >
              <Shuffle className="w-4 h-4 text-sky-700" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-[#F4F8FB] hover:bg-sky-100/80 border border-slate-200 text-slate-900 text-xs font-extrabold transition shadow-2xs cursor-pointer"
            title="Open Historical Log View & Profile Settings (Retrospective CRUD)"
            aria-label="Open Historical Log & Profile Settings"
          >
            <img
              src={encodeURI(profileImageSrc)}
              alt={userProfile?.name || 'Profile'}
              className="w-6 h-6 rounded-full object-cover bg-slate-200 border border-slate-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/hero_power.jpg';
              }}
            />
            <span>History ({universalLogs.length})</span>
            <History className="w-3.5 h-3.5 text-sky-700 shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { Bell, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVATAR_PROFILES } from '../data/assets';

export default function Header() {
  const {
    unreadCount,
    setIsNotificationDrawerOpen,
    setIsSyncModalOpen,
    userProfile,
    activeTab,
    setActiveTab
  } = useApp();

  const currentAvatar = AVATAR_PROFILES.find(a => a.id === userProfile.selectedAvatarId) || AVATAR_PROFILES[0];
  const profileImageSrc = userProfile.customPhotoUrl || currentAvatar.path || '/images/hero_power.jpg';

  return (
    <header className="sticky top-0 z-30 bg-[#07090e]/92 backdrop-blur-xl border-b border-white/5 px-4 pt-3 pb-3">
      {/* Pixel 8 System Bar Emulation */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tracking-tight pb-1.5 px-1">
        <span className="font-semibold text-slate-300">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center space-x-2 text-[10px]">
          <span className="text-emerald-400">5G+</span>
          <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
            PIXEL 8
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="flex items-center justify-between mt-1">
        {/* Left: User Profile Picture & App Branding (Tap to edit biometrics/upload photo) */}
        <button
          onClick={() => setIsSyncModalOpen(true)}
          className="flex items-center space-x-2.5 text-left group focus:outline-none"
          title="Tap to update profile biometrics & photo"
        >
          <div className="relative p-0.5 rounded-full border border-emerald-500/40 group-hover:border-emerald-400 transition-all">
            <img
              src={profileImageSrc}
              alt={userProfile.name || 'User Profile'}
              className="w-10 h-10 rounded-full object-cover bg-slate-800 shadow-md ring-1 ring-white/10"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/hero_power.jpg';
              }}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#07090e]"></span>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-extrabold tracking-wider text-white">ALL IN</h1>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              {userProfile.weightKg ? `${userProfile.weightKg} kg • ` : ''}{userProfile.name || 'Athlete DK'}
            </p>
          </div>
        </button>

        {/* Right Actions: Clean, Unblocked Audit Button & Notification Bell (Confusing flashing icon removed) */}
        <div className="flex items-center space-x-2">
          {/* Unblocked Retroactive Audit Button */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              activeTab === 'history'
                ? 'bg-purple-900/60 text-purple-200 border-purple-500/50 shadow-md shadow-purple-900/30'
                : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-purple-500/40 hover:text-white'
            }`}
            title="Retroactive Audit & Past Day Ledger (Unblocked)"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>Audit</span>
          </button>

          {/* Persistent Notification Bell with Pulsing Unread Badge */}
          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative p-2 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-none"
            aria-label="System Notifications & mTOR Monitor"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-rose-500/40 animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

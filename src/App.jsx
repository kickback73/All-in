import React from 'react';
import { useApp } from './context/AppContext';
import Pixel8FrameWrapper from './components/Pixel8FrameWrapper';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import WaterLoggerCard from './components/WaterLoggerCard';
import MetricRings from './components/MetricRings';
import MorningStacksWidget from './components/MorningStacksWidget';
import CustomDrinkBuilder from './components/CustomDrinkBuilder';
import StackManager from './components/StackManager';
import PeptideCalculator from './components/PeptideCalculator';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import NotificationDrawer from './components/NotificationDrawer';
import HistoryAuditDrawer from './components/HistoryAuditDrawer';
import UserProfileModal from './components/UserProfileModal';
import { AVATAR_PROFILES } from './data/assets';
import {
  Activity,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const {
    activeTab,
    setIsNotificationDrawerOpen,
    userProfile,
    progressMetrics,
    todayTotals
  } = useApp();

  const currentAvatar = AVATAR_PROFILES.find(a => a.id === userProfile.selectedAvatarId) || AVATAR_PROFILES[0];
  const athleteVisual = userProfile.customPhotoUrl || currentAvatar.path || '/images/hero_power.jpg';

  return (
    <Pixel8FrameWrapper>
      {/* Pixel 8 App Header (Includes Uploaded User Picture & Unblocked Audit Button) */}
      <Header />

      {/* Main Screen Content */}
      <main className="flex-1 px-4 py-3 space-y-4">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-fade-in">
            {/* 1. Water Tracker: Positioned right at the top of the main dashboard */}
            <WaterLoggerCard />

            {/* 2. Morning Stacks Quick Picker */}
            <MorningStacksWidget />

            {/* 3. Google & Samsung Health Metric Rings (Cleaned: redundant water input removed) */}
            <MetricRings />

            {/* 4. mTOR Pathway Status Radar Pill (Tucked into Side Drawer) */}
            <div
              onClick={() => setIsNotificationDrawerOpen(true)}
              className={`rounded-2xl p-3.5 border cursor-pointer transition-all flex items-center justify-between ${
                progressMetrics.isMethionineCaution
                  ? 'bg-amber-950/30 border-amber-500/40 hover:bg-amber-950/50'
                  : 'glass-panel border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className={`p-1.5 rounded-lg ${
                  progressMetrics.isMethionineCaution ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <Activity className="w-4 h-4 stroke-[2.5px]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-extrabold text-white">mTOR Pathway Radar</span>
                    {progressMetrics.isMethionineCaution && (
                      <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-amber-500/30">
                        Safety Alert
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Leu: {todayTotals.leucine}g • Met: {todayTotals.methionine}g (ceiling 1.8g)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                <span className="text-[11px] text-emerald-400">View Drawer</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 5. Motivational Athlete Card with Transparent Background Silhouettes */}
            <div className="relative rounded-3xl p-5 overflow-hidden border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 shadow-xl">
              <img
                src={athleteVisual}
                alt={userProfile.name}
                className="absolute right-0 top-0 h-full w-48 object-cover opacity-25 pointer-events-none mix-blend-luminosity mask-radial"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/hero_power.jpg';
                }}
              />
              <div className="relative z-10 max-w-[240px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Pixel 8 Calibration</span>
                </span>
                <h4 className="text-sm font-black text-white mt-1">Metabolic & Calibre Focus</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  High-protein vegetarian density safeguards muscle mass during triple agonist therapy while moderating mTOR hyperactivity.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STACKS & CUSTOM DRINK BUILDER */}
        {activeTab === 'stacks' && (
          <div className="space-y-4 animate-fade-in">
            <CustomDrinkBuilder />
            <StackManager />
          </div>
        )}

        {/* TAB 3: DEDICATED PEPTIDE SECTION (RETATRUTIDE AUTO-CALCULATOR & NHL FILTERS) */}
        {activeTab === 'peptides' && (
          <div className="animate-fade-in">
            <PeptideCalculator />
          </div>
        )}

        {/* TAB 4: AUDIT & RETROACTIVE HISTORY (UNBLOCKED) */}
        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <HistoryAuditDrawer />
          </div>
        )}
      </main>

      {/* Slide-out Persistent Side Notification Drawer (with mTOR monitor tucked inside) */}
      <NotificationDrawer />

      {/* Unified Quick Scan & Auto-Populate Food Entry Modal */}
      <BarcodeScannerModal />

      {/* User Profile Biometrics & Custom Picture Upload Modal */}
      <UserProfileModal />

      {/* Fixed Bottom Navigation Bar with Centered Raised Green Button */}
      <NavigationBar />
    </Pixel8FrameWrapper>
  );
}

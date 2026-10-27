import React, { useState } from 'react';
import { Smartphone, Maximize2, Minimize2, Image as ImageIcon, Shuffle, Calendar } from 'lucide-react';
import { getRotatedBackground, BACKGROUND_ASSETS } from '../utils/backgroundEngine';

export default function Pixel8FrameWrapper({ children }) {
  const [isFrameEnabled, setIsFrameEnabled] = useState(false);
  const [rotationMode, setRotationMode] = useState('daily'); // 'daily' | 'weekly' | 'random'
  const [currentBg, setCurrentBg] = useState(() => getRotatedBackground('daily'));

  const handleCycleRotationMode = () => {
    const nextMode = rotationMode === 'daily' ? 'weekly' : rotationMode === 'weekly' ? 'random' : 'daily';
    setRotationMode(nextMode);
    setCurrentBg(getRotatedBackground(nextMode));
  };

  const handleShuffleBackground = () => {
    setCurrentBg(getRotatedBackground('random'));
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col items-center justify-start sm:py-6 selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Device Frame & Background Controls (Shown on desktop/tablet) */}
      <div className="hidden sm:flex items-center space-x-3 mb-4 bg-slate-900/90 border border-white/10 px-4 py-1.5 rounded-full text-xs text-slate-300 shadow-xl backdrop-blur-md z-30">
        <Smartphone className="w-4 h-4 text-emerald-400" />
        <span className="font-semibold">Pixel 8 Display (1080 × 2400)</span>

        <button
          onClick={handleCycleRotationMode}
          className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-white/10 transition-all"
          title="Toggle Background Rotation Mode"
        >
          <Calendar className="w-3 h-3 text-cyan-400" />
          <span>Rotation: {rotationMode.toUpperCase()}</span>
        </button>

        <button
          onClick={handleShuffleBackground}
          className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-white/10 transition-all"
          title="Shuffle Background Asset"
        >
          <Shuffle className="w-3 h-3 text-amber-400" />
          <span>Shuffle</span>
        </button>

        <button
          onClick={() => setIsFrameEnabled(!isFrameEnabled)}
          className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-500/40 transition-all"
        >
          {isFrameEnabled ? (
            <>
              <Minimize2 className="w-3 h-3" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3 h-3" />
              <span>Pixel 8 Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Pixel 8 Container */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isFrameEnabled
            ? 'max-w-[428px] my-auto rounded-[46px] border-[10px] border-[#1a1f2b] shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_20px_rgba(16,185,129,0.15)] overflow-hidden min-h-[915px] bg-[#07090e]'
            : 'max-w-[440px] min-h-screen bg-[#07090e] shadow-2xl'
        }`}
      >
        {/* DYNAMIC FULL-SCALE ROTATING BACKGROUND LAYER */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={currentBg.path}
            alt={currentBg.title}
            className="w-full h-full object-cover object-top opacity-22 mix-blend-luminosity scale-105 filter blur-[0.5px]"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/man outline.jfif';
            }}
          />
          {/* Tactical High-Contrast Scrim Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/92 via-[#07090e]/88 to-[#07090e]/96"></div>
        </div>

        {/* Pixel 8 Punch-Hole Camera Cutout (Centered Notch) */}
        {isFrameEnabled && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-slate-800 z-50 pointer-events-none flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
          </div>
        )}

        {/* Foreground Screen Content */}
        <div className="relative z-10 min-h-screen flex flex-col pb-24">
          {children}
        </div>

        {/* Android Gesture Navigation Pill Bar (Pixel 8) */}
        <div className="fixed sm:absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-600/70 rounded-full z-40 pointer-events-none"></div>
      </div>
    </div>
  );
}

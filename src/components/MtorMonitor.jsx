// src/components/MtorMonitor.jsx
import React, { useMemo } from 'react';
import { Activity, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ESSENTIAL_AMINO_ACIDS } from '../data/initialData';

/**
 * Models 24-hour mTORC1 signaling activation (0-100%) based on dietary leucine/BCAA
 * kinetics, protein load, meal timing, and exponential fasting decay into autophagy (<25%).
 */
export function calculate24HourMtorTimeline(meals = [], plannedStacks = [], currentHour = new Date().getHours()) {
  const points = [];

  for (let hour = 0; hour < 24; hour++) {
    let actualActivation = 14; // Basal fasting autophagy floor (~14%)
    let projectedActivation = 14;

    // Actual meals impact
    meals.forEach((meal) => {
      let mealHour = 8;
      if (meal.timestamp) {
        const d = new Date(meal.timestamp);
        if (!isNaN(d.getTime())) {
          mealHour = d.getHours() + d.getMinutes() / 60;
        }
      }
      const dt = hour - mealHour;
      if (dt >= 0 && dt <= 7) {
        const leucineG = (Number(meal.leucineMg) || Number(meal.protein) * 80 || 0) / 1000;
        const carbsG = Number(meal.carbs) || 0;
        const amplitude = Math.min(82, leucineG * 26 + carbsG * 0.35);
        // Absorption peak at ~1.25h, decaying over 5.5h
        const impulse = amplitude * (dt / 1.25) * Math.exp(1 - dt / 1.25);
        actualActivation += Math.max(0, impulse);
      }
    });

    projectedActivation = actualActivation;

    // Projected future planned stacks
    plannedStacks
      .filter((s) => s.isRecurringPlanned && s.scheduledHour)
      .forEach((stack) => {
        const [sh, sm] = stack.scheduledHour.split(':').map(Number);
        const stackHour = (sh || 8) + (sm || 0) / 60;
        const dt = hour - stackHour;
        if (dt >= 0 && dt <= 7) {
          const leucineG = (Number(stack.totals?.aminos?.leucine) || 0) / 1000;
          const carbsG = Number(stack.totals?.carbs) || 0;
          const amplitude = Math.min(82, leucineG * 26 + carbsG * 0.35);
          const impulse = amplitude * (dt / 1.25) * Math.exp(1 - dt / 1.25);
          projectedActivation += Math.max(0, impulse);
        }
      });

    points.push({
      hour,
      label: `${String(hour).padStart(2, '0')}:00`,
      actual: hour <= currentHour ? Math.min(100, Math.round(actualActivation)) : null,
      projected: Math.min(100, Math.round(projectedActivation)),
    });
  }

  return points;
}

export default function MtorMonitor({
  aminoTotals = {},
  todayMeals = [],
  plannedStacks = [],
}) {
  const currentHour = new Date().getHours();
  const timeline = useMemo(
    () => calculate24HourMtorTimeline(todayMeals, plannedStacks, currentHour),
    [todayMeals, plannedStacks, currentHour]
  );

  const currentLevel = timeline[currentHour]?.actual ?? 14;
  const isElevated = currentLevel > 55;
  const isAutophagyWindow = currentLevel <= 25;

  const leucineGrams = ((aminoTotals.leucine || 0) / 1000).toFixed(2);

  // SVG Radar Coordinates
  const radarCoords = useMemo(() => {
    const cx = 100;
    const cy = 100;
    const maxR = 75;

    const coords = ESSENTIAL_AMINO_ACIDS.map((aa, i) => {
      const angle = (Math.PI * 2 * i) / ESSENTIAL_AMINO_ACIDS.length - Math.PI / 2;
      const val = aminoTotals[aa.key] || 0;
      const norm = Math.min(1, Math.max(0.12, val / 3000));
      const r = norm * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      const lx = cx + (maxR + 15) * Math.cos(angle);
      const ly = cy + (maxR + 15) * Math.sin(angle);
      return { x, y, lx, ly, label: aa.label.slice(0, 3).toUpperCase(), angle };
    });

    const polygonPoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
    return { cx, cy, maxR, coords, polygonPoints };
  }, [aminoTotals]);

  return (
    <div className="space-y-4 text-slate-900">
      {/* Dynamic Status Notification Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase border flex items-center gap-1.5 ${
              isElevated
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : isAutophagyWindow
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-sky-100 text-sky-900 border-sky-300'
            }`}
          >
            {isElevated ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Elevated mTOR ({currentLevel}%)</span>
              </>
            ) : isAutophagyWindow ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Autophagy & Cleansing Window ({currentLevel}%)</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 text-sky-600" />
                <span>Normative Basal Tone ({currentLevel}%)</span>
              </>
            )}
          </span>
        </div>

        <div className="text-xs font-bold text-slate-600">
          Daily Leucine: <strong className="text-slate-900">{leucineGrams}g</strong> (NHL Remission Guidance: &lt; 2.0g/meal)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* 1. Multi-Spectrum Amino Acid Radar / Spider Chart */}
        <div className="md:col-span-5 rounded-2xl bg-white/95 border border-slate-200/90 p-3.5 flex flex-col items-center shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-slate-700 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>9 EAA Radar Spectrum</span>
          </div>
          <svg viewBox="0 0 200 200" className="w-44 h-44">
            {/* Concentric Reference Rings */}
            {[25, 50, 75].map((r) => (
              <circle
                key={r}
                cx={radarCoords.cx}
                cy={radarCoords.cy}
                r={r}
                fill="none"
                stroke="#e2e8f0"
                strokeDasharray="2 2"
              />
            ))}
            {/* 9 Axes */}
            {radarCoords.coords.map((c, idx) => (
              <g key={idx}>
                <line
                  x1={radarCoords.cx}
                  y1={radarCoords.cy}
                  x2={radarCoords.cx + radarCoords.maxR * Math.cos(c.angle)}
                  y2={radarCoords.cy + radarCoords.maxR * Math.sin(c.angle)}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={c.lx}
                  y={c.ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-600 text-[8px] font-extrabold"
                >
                  {c.label}
                </text>
              </g>
            ))}
            {/* Plotted EAA Area */}
            <polygon
              points={radarCoords.polygonPoints}
              fill="rgba(14, 165, 233, 0.28)"
              stroke="#0284c7"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* 2. 24-Hour Metabolic mTOR Signaling Graph */}
        <div className="md:col-span-7 rounded-2xl bg-white/95 border border-slate-200/90 p-3.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-extrabold uppercase text-slate-800">
              24-Hour mTOR Signaling & Autophagy Timeline
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-sky-700">
                <span className="w-2.5 h-1 bg-sky-600 inline-block rounded" /> Actual Logged
              </span>
              <span className="flex items-center gap-1 text-indigo-600">
                <span className="w-2.5 h-1 bg-indigo-400 inline-block rounded" /> Planned Future
              </span>
            </div>
          </div>

          <svg viewBox="0 0 360 145" className="w-full h-36 overflow-visible">
            {/* Elevated Anabolic Threshold (55%) */}
            <line
              x1="24"
              y1={120 - 0.55 * 100}
              x2="350"
              y2={120 - 0.55 * 100}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth="1"
            />
            <text x="28" y={116 - 0.55 * 100} className="fill-amber-700 text-[8px] font-bold">
              Elevated Anabolic Threshold (NHL Remission Ceiling 55%)
            </text>

            {/* Autophagy Trough Zone (<25%) */}
            <rect
              x="24"
              y={120 - 0.25 * 100}
              width="326"
              height={0.25 * 100}
              fill="rgba(16, 185, 129, 0.12)"
            />
            <text x="28" y="116" className="fill-emerald-800 text-[8px] font-bold">
              Favourable Autophagy Trough Zone (&lt;25%)
            </text>

            {/* Plot Lines & Area */}
            {(() => {
              const xStep = 326 / 23;
              const projPts = timeline.map((pt, i) => ({
                x: 24 + i * xStep,
                y: 120 - (pt.projected / 100) * 100,
              }));
              const actPts = timeline
                .filter((pt) => pt.actual !== null)
                .map((pt, i) => ({
                  x: 24 + i * xStep,
                  y: 120 - (pt.actual / 100) * 100,
                }));

              const projPath = projPts
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                .join(' ');
              const actPath = actPts
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                .join(' ');
              const actArea =
                actPts.length > 0
                  ? `${actPath} L ${actPts[actPts.length - 1].x} 120 L 24 120 Z`
                  : '';

              return (
                <>
                  {actArea && <path d={actArea} fill="rgba(2, 132, 199, 0.20)" />}
                  <path
                    d={projPath}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  {actPath && (
                    <path d={actPath} fill="none" stroke="#0284c7" strokeWidth="2.5" />
                  )}
                </>
              );
            })()}

            {/* X-Axis Hour Markers */}
            {[0, 6, 12, 18, 23].map((h) => (
              <text
                key={h}
                x={24 + (h * 326) / 23}
                y="136"
                textAnchor="middle"
                className="fill-slate-500 text-[8px] font-bold"
              >
                {String(h).padStart(2, '0')}:00
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

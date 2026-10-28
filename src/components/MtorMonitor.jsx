// src/components/MtorMonitor.jsx
import React, { useState, useMemo } from 'react';
import { Activity, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ESSENTIAL_AMINO_ACIDS } from '../data/initialData';

/**
 * Models 24-hour mTORC1 signaling activation (0-100%) based on dietary leucine/BCAA
 * kinetics, protein load, meal timing, and exponential fasting decay into autophagy (<25%).
 */
export function calculate24HourMtorTimeline(meals = [], plannedStacks = [], currentHour = new Date().getHours()) {
  const points = [];

  for (let hour = 0; hour < 24; hour++) {
    let actualActivation = 14;
    let projectedActivation = 14;

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
        const impulse = amplitude * (dt / 1.25) * Math.exp(1 - dt / 1.25);
        actualActivation += Math.max(0, impulse);
      }
    });

    projectedActivation = actualActivation;

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
  onLogAminoPulse,
}) {
  const [pulseName, setPulseName] = useState('EAA / Collagen Amino Entry');
  const [leucineMg, setLeucineMg] = useState(500);
  const [methionineMg, setMethionineMg] = useState(120);

  const currentHour = new Date().getHours();
  const timeline = useMemo(
    () => calculate24HourMtorTimeline(todayMeals, plannedStacks, currentHour),
    [todayMeals, plannedStacks, currentHour]
  );

  const currentLevel = timeline[currentHour]?.actual ?? 14;
  const isElevated = currentLevel > 55;
  const isAutophagyWindow = currentLevel <= 25;

  const leucineGrams = ((aminoTotals.leucine || 0) / 1000).toFixed(2);
  const methionineGrams = ((aminoTotals.methionine || 0) / 1000).toFixed(2);

  const radarCoords = useMemo(() => {
    const cx = 100;
    const cy = 100;
    const maxR = 72;

    const coords = ESSENTIAL_AMINO_ACIDS.map((aa, i) => {
      const angle = (Math.PI * 2 * i) / ESSENTIAL_AMINO_ACIDS.length - Math.PI / 2;
      const val = aminoTotals[aa.key] || 0;
      const norm = Math.min(1, Math.max(0.14, val / 3000));
      const r = norm * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      const lx = cx + (maxR + 16) * Math.cos(angle);
      const ly = cy + (maxR + 16) * Math.sin(angle);
      return { x, y, lx, ly, label: aa.label.slice(0, 3).toUpperCase(), angle, val };
    });

    const polygonPoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
    return { cx, cy, maxR, coords, polygonPoints };
  }, [aminoTotals]);

  return (
    <div className="space-y-3.5 text-slate-900">
      {/* Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border flex items-center gap-1.5 ${
            isElevated
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : isAutophagyWindow
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-sky-100 text-sky-900 border-sky-300'
          }`}
        >
          {isElevated ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Elevated mTOR ({currentLevel}%)</span>
            </>
          ) : isAutophagyWindow ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Autophagy Window ({currentLevel}%)</span>
            </>
          ) : (
            <>
              <Activity className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Basal Tone ({currentLevel}%)</span>
            </>
          )}
        </span>

        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
          Leu: <strong>{leucineGrams}g</strong> • Met: <strong>{methionineGrams}g / 1.8g</strong>
        </span>
      </div>

      {/* 1. 24-Hour Metabolic mTOR Signaling Graph */}
      <div className="rounded-2xl bg-[#F4F8FB] border border-slate-200 p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] font-extrabold uppercase text-slate-800">
            24h mTORC1 & Autophagy Curve
          </span>
          <div className="flex items-center gap-2.5 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-sky-700">
              <span className="w-2.5 h-1 bg-sky-600 inline-block rounded" /> Actual
            </span>
            <span className="flex items-center gap-1 text-indigo-600">
              <span className="w-2.5 h-1 bg-indigo-400 inline-block rounded" /> Planned
            </span>
          </div>
        </div>

        <svg viewBox="0 0 360 140" className="w-full h-36 overflow-visible">
          <line
            x1="20"
            y1={115 - 0.55 * 95}
            x2="352"
            y2={115 - 0.55 * 95}
            stroke="#f59e0b"
            strokeDasharray="4 3"
            strokeWidth="1.2"
          />
          <text x="24" y={111 - 0.55 * 95} className="fill-amber-800 text-[8.5px] font-extrabold">
            Elevated Anabolic Threshold (NHL Remission Ceiling 55%)
          </text>

          <rect
            x="20"
            y={115 - 0.25 * 95}
            width="332"
            height={0.25 * 95}
            fill="rgba(16, 185, 129, 0.14)"
          />
          <text x="24" y="111" className="fill-emerald-900 text-[8.5px] font-extrabold">
            Favourable Autophagy Trough Zone (&lt;25%)
          </text>

          {(() => {
            const xStep = 332 / 23;
            const projPts = timeline.map((pt, i) => ({
              x: 20 + i * xStep,
              y: 115 - (pt.projected / 100) * 95,
            }));
            const actPts = timeline
              .filter((pt) => pt.actual !== null)
              .map((pt, i) => ({
                x: 20 + i * xStep,
                y: 115 - (pt.actual / 100) * 95,
              }));

            const projPath = projPts
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ');
            const actPath = actPts
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ');
            const actArea =
              actPts.length > 0
                ? `${actPath} L ${actPts[actPts.length - 1].x} 115 L 20 115 Z`
                : '';

            return (
              <>
                {actArea && <path d={actArea} fill="rgba(2, 132, 199, 0.22)" />}
                <path
                  d={projPath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                {actPath && (
                  <path d={actPath} fill="none" stroke="#0284c7" strokeWidth="2.5" />
                )}
              </>
            );
          })()}

          {[0, 6, 12, 18, 23].map((h) => (
            <text
              key={h}
              x={20 + (h * 332) / 23}
              y="132"
              textAnchor="middle"
              className="fill-slate-600 text-[8.5px] font-extrabold"
            >
              {String(h).padStart(2, '0')}:00
            </text>
          ))}
        </svg>
      </div>

      {/* 2. 9-Axis Amino Acid Radar Chart */}
      <div className="rounded-2xl bg-[#F4F8FB] border border-slate-200 p-3.5 flex items-center justify-between gap-3">
        <div className="w-36 h-36 shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {[24, 48, 72].map((r) => (
              <circle
                key={r}
                cx={radarCoords.cx}
                cy={radarCoords.cy}
                r={r}
                fill="none"
                stroke="#cbd5e1"
                strokeDasharray="2 2"
              />
            ))}
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
                  className="fill-slate-800 text-[9px] font-black"
                >
                  {c.label}
                </text>
              </g>
            ))}
            <polygon
              points={radarCoords.polygonPoints}
              fill="rgba(14, 165, 233, 0.30)"
              stroke="#0284c7"
              strokeWidth="2.2"
            />
          </svg>
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>9 EAA Spectrum</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {ESSENTIAL_AMINO_ACIDS.slice(0, 6).map((aa) => (
              <div
                key={aa.key}
                className="rounded-lg bg-white border border-slate-200 px-2 py-1 flex items-center justify-between"
              >
                <span className="text-[10px] font-bold text-slate-600">
                  {aa.label.slice(0, 3).toUpperCase()}
                </span>
                <span className="text-[10px] font-black text-slate-900">
                  {aminoTotals[aa.key] || 0}mg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Direct Amino Acid / Leucine / Methionine Data Entry Form */}
      {onLogAminoPulse && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogAminoPulse({
              title: pulseName,
              leucineMg: Number(leucineMg) || 0,
              methionineMg: Number(methionineMg) || 0,
            });
          }}
          className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3 space-y-2.5"
        >
          <div className="text-[11px] font-black uppercase text-indigo-950">
            Log Direct Amino / Leucine / Methionine Entry
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[9px] font-bold text-slate-600">Label</label>
              <input
                type="text"
                value={pulseName}
                onChange={(e) => setPulseName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-600">Leucine (mg)</label>
              <input
                type="number"
                value={leucineMg}
                onChange={(e) => setLeucineMg(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-black"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-600">Methionine (mg)</label>
              <input
                type="number"
                value={methionineMg}
                onChange={(e) => setMethionineMg(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-black"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold cursor-pointer"
          >
            Record Amino Acid Entry
          </button>
        </form>
      )}
    </div>
  );
}

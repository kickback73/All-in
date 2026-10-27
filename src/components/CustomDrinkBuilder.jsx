import React, { useState } from 'react';
import {
  Coffee,
  Sparkles,
  Plus,
  CheckCircle2,
  Save,
  RotateCcw,
  Zap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { feedbackEngine } from '../utils/soundEffects';

export default function CustomDrinkBuilder() {
  const {
    customMorningDrink,
    updateCustomMorningDrink,
    logMeal,
    todayLog
  } = useApp();

  const [ingredientsText, setIngredientsText] = useState(
    customMorningDrink.rawIngredientsText ||
`15g Wild Marine Collagen Peptides
5g Creatine Monohydrate
1 scoop Electrolyte Salts (Sodium 400mg, Potassium 200mg, Magnesium 100mg)
500ml Filtered Water with 1/2 Organic Lemon
3g Pure L-Glutamine powder`
  );

  const [drinkTitle, setDrinkTitle] = useState(customMorningDrink.title || 'Electrolyte Collagen Elixir');
  const [autoLogDaily, setAutoLogDaily] = useState(customMorningDrink.autoLogDaily ?? true);
  const [saveBanner, setSaveBanner] = useState(false);

  // Intelligent text parser for aminos, macros, and micros
  const parsedNutrients = React.useMemo(() => {
    let calories = 0;
    let protein = 0;
    let leucine = 0;
    let methionine = 0;
    let sodiumMg = 0;
    let potassiumMg = 0;
    let magnesiumMg = 0;
    let waterMl = 0;

    const lines = ingredientsText.split('\n');

    lines.forEach(line => {
      const lower = line.toLowerCase();

      // Marine collagen detection
      if (lower.includes('collagen')) {
        const gramsMatch = lower.match(/(\d+)\s*g/);
        const g = gramsMatch ? parseInt(gramsMatch[1], 10) : 15;
        protein += Math.round(g * 0.9);
        calories += Math.round(g * 3.6);
        leucine += Number((g * 0.027).toFixed(2));
        methionine += Number((g * 0.012).toFixed(2));
      }

      // Creatine detection
      if (lower.includes('creatine')) {
        calories += 0;
      }

      // Glutamine detection
      if (lower.includes('glutamine')) {
        const gramsMatch = lower.match(/(\d+)\s*g/);
        const g = gramsMatch ? parseInt(gramsMatch[1], 10) : 5;
        protein += g;
        calories += g * 4;
      }

      // Electrolytes / Salt detection
      if (lower.includes('electrolyte') || lower.includes('salt') || lower.includes('sodium')) {
        sodiumMg += 450;
        potassiumMg += 200;
        magnesiumMg += 100;
      }

      // Water fluid volume
      if (lower.includes('water') || lower.includes('ml')) {
        const mlMatch = lower.match(/(\d+)\s*ml/);
        waterMl += mlMatch ? parseInt(mlMatch[1], 10) : 500;
      }

      // Lemon / Vitamin C
      if (lower.includes('lemon') || lower.includes('citrus')) {
        calories += 8;
      }
    });

    return {
      calories,
      protein,
      leucine: Number(leucine.toFixed(2)),
      methionine: Number(methionine.toFixed(2)),
      sodiumMg,
      potassiumMg,
      magnesiumMg,
      waterMl: waterMl || 500
    };
  }, [ingredientsText]);

  const handleSaveDrink = (e) => {
    e.preventDefault();
    updateCustomMorningDrink({
      title: drinkTitle,
      rawIngredientsText: ingredientsText,
      autoLogDaily,
      nutrients: parsedNutrients,
      lastSaved: new Date().toISOString()
    });
    setSaveBanner(true);
    feedbackEngine.playChime('sync');
    setTimeout(() => setSaveBanner(false), 2500);
  };

  const handleLogDrinkNow = () => {
    logMeal({
      name: drinkTitle,
      category: 'Custom Morning Drink',
      calories: parsedNutrients.calories,
      protein: parsedNutrients.protein,
      carbs: 2,
      fat: 0,
      leucine: parsedNutrients.leucine,
      methionine: parsedNutrients.methionine,
      source: 'custom_morning_drink'
    });
    feedbackEngine.playChime('stack');
    feedbackEngine.triggerConfetti();
  };

  const isAlreadyLoggedToday = todayLog.meals.some(m => m.name === drinkTitle);

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Coffee className="w-4 h-4 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide">Custom Morning Drink Builder</h3>
            <p className="text-[10px] text-slate-400 font-medium">Text-based formula • Persists daily into active tally</p>
          </div>
        </div>

        <button
          onClick={handleLogDrinkNow}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
            isAlreadyLoggedToday
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {isAlreadyLoggedToday ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Logged</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[3px]" />
              <span>Log Now</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSaveDrink} className="space-y-3 text-xs">
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Custom Drink Label</label>
          <input
            type="text"
            value={drinkTitle}
            onChange={(e) => setDrinkTitle(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-slate-400 font-semibold">Ingredients (one per line):</label>
            <span className="text-[10px] text-slate-500 font-mono">Auto-calculates aminos & micros</span>
          </div>
          <textarea
            rows={5}
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            placeholder="e.g. 15g marine collagen&#10;5g creatine&#10;1 scoop electrolyte mix&#10;500ml water"
            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-3 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-amber-500"
          ></textarea>
        </div>

        {/* Live Parsed Nutritional & Amino Tally Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Parsed Macro & Amino Payload:</span>
            </span>
            <span className="font-mono text-emerald-400 font-extrabold">
              +{parsedNutrients.protein}g Protein
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-1">
            <div className="p-1.5 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Calories</span>
              <span className="text-white font-bold">{parsedNutrients.calories} kcal</span>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Leucine</span>
              <span className="text-cyan-400 font-bold">{parsedNutrients.leucine}g</span>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Methionine</span>
              <span className="text-amber-400 font-bold">{parsedNutrients.methionine}g</span>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-[9px] text-slate-400 block font-sans">Fluids</span>
              <span className="text-blue-400 font-bold">{parsedNutrients.waterMl}ml</span>
            </div>
          </div>

          {/* Micro summary */}
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-white/5">
            <span>Electrolytes:</span>
            <span>{parsedNutrients.sodiumMg}mg Na+ • {parsedNutrients.potassiumMg}mg K+ • {parsedNutrients.magnesiumMg}mg Mg2+</span>
          </div>
        </div>

        {/* Persistence & Daily Automation Switch */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoLogDaily}
              onChange={(e) => setAutoLogDaily(e.target.checked)}
              className="rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-0"
            />
            <span className="text-[11px] font-medium">Persist daily & automatically log on midnight refresh</span>
          </label>

          <button
            type="submit"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Formula</span>
          </button>
        </div>

        {saveBanner && (
          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] text-center font-bold flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Custom drink persisted to local JSON state!</span>
          </div>
        )}
      </form>
    </div>
  );
}

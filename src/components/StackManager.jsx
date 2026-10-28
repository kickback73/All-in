// src/components/StackManager.jsx
import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';
import { ESSENTIAL_AMINO_ACIDS, MICRONUTRIENT_FIELDS } from '../data/initialData';

const createEmptyIngredient = () => ({
  id: `ing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  name: '',
  servingSize: '',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  micros: {
    vitaminD: '',
    vitaminC: '',
    magnesium: '',
    zinc: '',
    potassium: '',
    sodium: '',
  },
  aminos: {
    leucine: '',
    isoleucine: '',
    valine: '',
    lysine: '',
    methionine: '',
    phenylalanine: '',
    threonine: '',
    tryptophan: '',
    histidine: '',
  },
});

export function calculateStackTotals(ingredients = []) {
  return ingredients.reduce(
    (acc, ing) => {
      acc.calories += Number(ing.calories) || 0;
      acc.protein += Number(ing.protein) || 0;
      acc.carbs += Number(ing.carbs) || 0;
      acc.fats += Number(ing.fats) || 0;

      MICRONUTRIENT_FIELDS.forEach(({ key }) => {
        acc.micros[key] = (acc.micros[key] || 0) + (Number(ing.micros?.[key]) || 0);
      });

      ESSENTIAL_AMINO_ACIDS.forEach(({ key }) => {
        acc.aminos[key] = (acc.aminos[key] || 0) + (Number(ing.aminos?.[key]) || 0);
      });

      return acc;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      micros: { vitaminD: 0, vitaminC: 0, magnesium: 0, zinc: 0, potassium: 0, sodium: 0 },
      aminos: {
        leucine: 0,
        isoleucine: 0,
        valine: 0,
        lysine: 0,
        methionine: 0,
        phenylalanine: 0,
        threonine: 0,
        tryptophan: 0,
        histidine: 0,
      },
    }
  );
}

export default function StackManager({
  isOpen = true,
  stacks = [],
  onSaveStack,
  onDeleteStack,
  onLogStack,
  onClose,
}) {
  const [stackName, setStackName] = useState('');
  const [scheduledHour, setScheduledHour] = useState('08:00');
  const [isRecurringPlanned, setIsRecurringPlanned] = useState(true);
  const [ingredients, setIngredients] = useState([createEmptyIngredient()]);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);

  const liveTotals = useMemo(() => calculateStackTotals(ingredients), [ingredients]);
  const leucineGrams = (liveTotals.aminos.leucine / 1000).toFixed(2);
  const exceedsLeucineThreshold = liveTotals.aminos.leucine >= 2000; // 2.0g mTORC1 stimulation threshold

  if (!isOpen) return null;

  const handleIngredientChange = (id, field, value, nestedGroup = null) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        if (nestedGroup) {
          return {
            ...ing,
            [nestedGroup]: {
              ...ing[nestedGroup],
              [field]: value,
            },
          };
        }
        return {
          ...ing,
          [field]: value,
        };
      })
    );
  };

  const handleAddIngredient = () => {
    setIngredients((prev) => [...prev, createEmptyIngredient()]);
  };

  const handleRemoveIngredient = (id) => {
    setIngredients((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  };

  const handleCreateStack = (e) => {
    e.preventDefault();
    if (!stackName.trim()) return;

    const validIngredients = ingredients.filter((i) => i.name.trim() !== '');
    if (validIngredients.length === 0) return;

    const totals = calculateStackTotals(validIngredients);
    const newStack = {
      id: `stack_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: stackName.trim(),
      scheduledHour,
      isRecurringPlanned,
      ingredients: validIngredients,
      totals,
      createdAt: new Date().toISOString(),
    };

    if (onSaveStack) {
      onSaveStack(newStack);
    }

    setSaveSuccessBanner(true);
    setStackName('');
    setIngredients([createEmptyIngredient()]);
    setTimeout(() => setSaveSuccessBanner(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        {/* Top Header */}
        <div className="px-6 py-4.5 bg-[#F4F8FB] border-b border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Custom Morning Stack & Recipe Builder
              </h2>
              <p className="text-xs text-slate-500">
                Zero presets: Assemble multi-ingredient shakes with live macro, micro, and amino acid totals.
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
              aria-label="Close Stack Builder"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {saveSuccessBanner && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-3.5 flex items-center gap-2.5 text-emerald-900 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Custom stack successfully saved and integrated into your daily protocol library!</span>
            </div>
          )}

          {/* Real-time Combined Stack Metrics Display */}
          <div className="rounded-2xl bg-[#F4F8FB] border border-sky-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-800">
                  Live Aggregated Stack Profile
                </span>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  exceedsLeucineThreshold
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}
              >
                Leucine Load: {leucineGrams}g{' '}
                {exceedsLeucineThreshold
                  ? '(Stimulates mTORC1 ≥ 2.0g ceiling)'
                  : '(Favourable / Sub-threshold)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">Calories</div>
                <div className="text-xl font-black text-slate-900">{liveTotals.calories} kcal</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">Protein</div>
                <div className="text-xl font-black text-sky-700">{liveTotals.protein} g</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">Carbs</div>
                <div className="text-xl font-black text-teal-700">{liveTotals.carbs} g</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">Fats</div>
                <div className="text-xl font-black text-indigo-700">{liveTotals.fats} g</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">Total BCAAs</div>
                <div className="text-xl font-black text-rose-700">
                  {liveTotals.aminos.leucine +
                    liveTotals.aminos.isoleucine +
                    liveTotals.aminos.valine}{' '}
                  mg
                </div>
              </div>
            </div>
          </div>

          {/* Builder Form */}
          <form onSubmit={handleCreateStack} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Stack / Shake Title
                </label>
                <input
                  type="text"
                  required
                  value={stackName}
                  onChange={(e) => setStackName(e.target.value)}
                  placeholder="e.g., Low-Leucine Morning Greens"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Target Consumption Time
                </label>
                <input
                  type="time"
                  value={scheduledHour}
                  onChange={(e) => setScheduledHour(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                />
              </div>
              <div className="flex items-end pb-1.5">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurringPlanned}
                    onChange={(e) => setIsRecurringPlanned(e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                  <span>Include in 24h mTOR Planned Projection</span>
                </label>
              </div>
            </div>

            {/* Ingredients Rows */}
            <div className="space-y-4">
              {ingredients.map((ing, idx) => (
                <div
                  key={ing.id}
                  className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Ingredient #{idx + 1}
                    </span>
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ing.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Ingredient Name
                      </label>
                      <input
                        type="text"
                        required
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(ing.id, 'name', e.target.value)}
                        placeholder="e.g., Organic Plant Protein / Chia"
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">
                        Calories (kcal)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={ing.calories}
                        onChange={(e) => handleIngredientChange(ing.id, 'calories', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={ing.protein}
                        onChange={(e) => handleIngredientChange(ing.id, 'protein', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={ing.carbs}
                        onChange={(e) => handleIngredientChange(ing.id, 'carbs', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">
                        Fats (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={ing.fats}
                        onChange={(e) => handleIngredientChange(ing.id, 'fats', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  {/* Individual Essential Amino Acids Profile (mg) */}
                  <div className="pt-1">
                    <div className="text-[11px] font-extrabold uppercase text-slate-500 mb-1.5">
                      Amino Acid Spectrum (mg)
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                      {ESSENTIAL_AMINO_ACIDS.map((aa) => (
                        <div key={aa.key}>
                          <label className="block text-[10px] font-bold text-slate-600 truncate">
                            {aa.label.replace(' (BCAA)', '')}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={ing.aminos[aa.key]}
                            onChange={(e) =>
                              handleIngredientChange(ing.id, aa.key, e.target.value, 'aminos')
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Micronutrients Profile */}
                  <div className="pt-1">
                    <div className="text-[11px] font-extrabold uppercase text-slate-500 mb-1.5">
                      Micronutrients
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {MICRONUTRIENT_FIELDS.map((micro) => (
                        <div key={micro.key}>
                          <label className="block text-[10px] font-bold text-slate-600 truncate">
                            {micro.label} ({micro.unit})
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={ing.micros[micro.key]}
                            onChange={(e) =>
                              handleIngredientChange(ing.id, micro.key, e.target.value, 'micros')
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-4 py-2 rounded-full text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Ingredient</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Custom Stack</span>
              </button>
            </div>
          </form>

          {/* User's Saved Custom Stacks */}
          {stacks.length > 0 && (
            <div className="pt-5 border-t border-slate-100">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-3">
                Saved Protocol Stacks ({stacks.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stacks.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between bg-white shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {s.totals.calories} kcal • {s.totals.protein}g P • Leucine:{' '}
                        {s.totals.aminos?.leucine || 0}mg
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {onLogStack && (
                        <button
                          type="button"
                          onClick={() => onLogStack(s)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition"
                        >
                          Log
                        </button>
                      )}
                      {onDeleteStack && (
                        <button
                          type="button"
                          onClick={() => onDeleteStack(s.id)}
                          className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// src/components/StackManager.jsx
import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  X,
  Search,
  Edit2,
} from 'lucide-react';
import { ESSENTIAL_AMINO_ACIDS, MICRONUTRIENT_FIELDS } from '../data/initialData';
import {
  lookupVerifiedNutrients,
  scaleNutrients,
  VERIFIED_NUTRIENT_DATABASE,
} from '../utils/nutrientEngine';

const createEmptyIngredient = () => ({
  id: `ing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  name: '',
  servingGrams: 100,
  source: '',
  per100g: null,
  calories: 0,
  protein: 0,
  carbs: 0,
  fiber: 0,
  netCarbs: 0,
  fats: 0,
  waterMl: 0,
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
});

export function calculateStackTotals(ingredients = []) {
  return ingredients.reduce(
    (acc, ing) => {
      acc.calories += Number(ing.calories) || 0;
      acc.protein += Number(ing.protein) || 0;
      acc.carbs += Number(ing.carbs) || 0;
      acc.fiber += Number(ing.fiber) || 0;
      acc.fats += Number(ing.fats) || 0;
      acc.waterMl += Number(ing.waterMl) || 0;

      MICRONUTRIENT_FIELDS.forEach(({ key }) => {
        acc.micros[key] = Math.round(((acc.micros[key] || 0) + (Number(ing.micros?.[key]) || 0)) * 10) / 10;
      });

      ESSENTIAL_AMINO_ACIDS.forEach(({ key }) => {
        acc.aminos[key] = Math.round((acc.aminos[key] || 0) + (Number(ing.aminos?.[key]) || 0));
      });

      acc.calories = Math.round(acc.calories);
      acc.protein = Math.round(acc.protein * 10) / 10;
      acc.carbs = Math.round(acc.carbs * 10) / 10;
      acc.fiber = Math.round(acc.fiber * 10) / 10;
      acc.netCarbs = Math.max(0, Math.round((acc.carbs - acc.fiber) * 10) / 10);
      acc.fats = Math.round(acc.fats * 10) / 10;
      return acc;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fiber: 0,
      netCarbs: 0,
      fats: 0,
      waterMl: 0,
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
  const [editingStackId, setEditingStackId] = useState(null);
  const [stackName, setStackName] = useState('');
  const [scheduledHour, setScheduledHour] = useState('07:30');
  const [isRecurringPlanned, setIsRecurringPlanned] = useState(true);
  const [ingredients, setIngredients] = useState([createEmptyIngredient()]);
  const [loadingIngId, setLoadingIngId] = useState(null);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);

  const liveTotals = useMemo(() => calculateStackTotals(ingredients), [ingredients]);
  const leucineGrams = (liveTotals.aminos.leucine / 1000).toFixed(2);
  const methionineGrams = (liveTotals.aminos.methionine / 1000).toFixed(2);

  if (!isOpen) return null;

  const handleAutoPopulateIngredient = async (ing) => {
    if (!ing.name.trim()) return;
    setLoadingIngId(ing.id);
    const verified = await lookupVerifiedNutrients(ing.name, null);
    setLoadingIngId(null);

    if (verified) {
      setIngredients((prev) =>
        prev.map((item) => (item.id === ing.id ? { ...item, ...verified } : item))
      );
    }
  };

  const handleQuickPresetSelect = (id, dbIndex) => {
    if (dbIndex === '') return;
    const entry = VERIFIED_NUTRIENT_DATABASE[Number(dbIndex)];
    if (!entry) return;
    const scaled = scaleNutrients(entry.per100g, entry.defaultServingGrams);
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              name: entry.label.split(' (')[0],
              source: entry.label,
              servingGrams: entry.defaultServingGrams,
              per100g: entry.per100g,
              ...scaled,
            }
          : item
      )
    );
  };

  const handleServingGramsChange = (id, newGrams) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        if (ing.per100g) {
          return {
            ...ing,
            servingGrams: newGrams,
            ...scaleNutrients(ing.per100g, Number(newGrams) || 0),
          };
        }
        return { ...ing, servingGrams: newGrams };
      })
    );
  };

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
        const updated = {
          ...ing,
          [field]: value,
        };
        if (field === 'carbs' || field === 'fiber') {
          const c = Number(field === 'carbs' ? value : updated.carbs) || 0;
          const f = Number(field === 'fiber' ? value : updated.fiber) || 0;
          updated.netCarbs = Math.max(0, Math.round((c - f) * 10) / 10);
        }
        return updated;
      })
    );
  };

  const handleEditExistingStack = (stack) => {
    setEditingStackId(stack.id);
    setStackName(stack.name);
    setScheduledHour(stack.scheduledHour || '07:30');
    setIsRecurringPlanned(stack.isRecurringPlanned !== false);
    setIngredients(
      Array.isArray(stack.ingredients) && stack.ingredients.length > 0
        ? stack.ingredients.map((i) => ({ ...createEmptyIngredient(), ...i }))
        : [createEmptyIngredient()]
    );
  };

  const handleCreateOrSaveStack = (e) => {
    e.preventDefault();
    if (!stackName.trim()) return;

    const validIngredients = ingredients.filter((i) => i.name.trim() !== '');
    if (validIngredients.length === 0) return;

    const totals = calculateStackTotals(validIngredients);
    const savedStack = {
      id: editingStackId || `stack_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: stackName.trim(),
      scheduledHour,
      isRecurringPlanned,
      ingredients: validIngredients,
      totals,
      createdAt: new Date().toISOString(),
    };

    if (onSaveStack) {
      onSaveStack(savedStack);
    }

    setSaveSuccessBanner(true);
    setEditingStackId(null);
    setStackName('');
    setIngredients([createEmptyIngredient()]);
    setTimeout(() => setSaveSuccessBanner(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        {/* Top Header */}
        <div className="px-4 py-3.5 bg-[#F4F8FB] border-b border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-sky-600 text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                {editingStackId ? 'Edit Stack' : 'Morning Stack & Protocol Builder'}
              </h2>
              <p className="text-[11px] text-slate-500">
                USDA FoodData Central & Verified Baseline Dictionary
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          {saveSuccessBanner && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-2.5 flex items-center gap-2 text-emerald-900 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Stack saved with verified nutrient totals!</span>
            </div>
          )}

          {/* Saved Stacks List */}
          {stacks.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                Active Stacks ({stacks.length}) — Tap to Log or Edit
              </div>
              <div className="space-y-2">
                {stacks.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-slate-200 p-3 bg-[#F4F8FB] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-slate-900 text-xs truncate">{s.name}</div>
                      <div className="text-[11px] font-semibold text-slate-600">
                        {s.totals?.calories || 0} kcal • {s.totals?.protein || 0}g P •{' '}
                        {s.totals?.netCarbs ?? s.totals?.carbs ?? 0}g Net C •{' '}
                        {s.totals?.waterMl || 0}ml H2O
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onLogStack && (
                        <button
                          type="button"
                          onClick={() => onLogStack(s)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-sky-600 text-white hover:bg-sky-700"
                        >
                          Log
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditExistingStack(s)}
                        className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-sky-700"
                        title="Edit Stack"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteStack && (
                        <button
                          type="button"
                          onClick={() => onDeleteStack(s.id)}
                          className="p-1.5 rounded-full bg-white border border-slate-200 text-rose-600 hover:bg-rose-50"
                          title="Delete Stack"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Combined Stack Totals */}
          <div className="rounded-2xl bg-[#F4F8FB] border border-sky-200 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-sky-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Live Auto-Calculated Stack Totals
              </span>
              <span className="text-[10px] font-bold text-slate-600">
                Leu: {leucineGrams}g • Met: {methionineGrams}g
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1 text-center">
              <div className="bg-white rounded-xl p-1.5 border border-slate-200/80">
                <div className="text-[8px] text-slate-500 font-bold">Kcal</div>
                <div className="text-xs font-black text-slate-900">{liveTotals.calories}</div>
              </div>
              <div className="bg-white rounded-xl p-1.5 border border-slate-200/80">
                <div className="text-[8px] text-slate-500 font-bold">Protein</div>
                <div className="text-xs font-black text-sky-700">{liveTotals.protein}g</div>
              </div>
              <div className="bg-white rounded-xl p-1.5 border border-slate-200/80">
                <div className="text-[8px] text-slate-500 font-bold">Carbs</div>
                <div className="text-xs font-black text-teal-700">{liveTotals.carbs}g</div>
              </div>
              <div className="bg-white rounded-xl p-1.5 border border-slate-200/80">
                <div className="text-[8px] text-slate-500 font-bold">Net Carb</div>
                <div className="text-xs font-black text-emerald-700">{liveTotals.netCarbs}g</div>
              </div>
              <div className="bg-white rounded-xl p-1.5 border border-slate-200/80">
                <div className="text-[8px] text-slate-500 font-bold">Fats</div>
                <div className="text-xs font-black text-indigo-700">{liveTotals.fats}g</div>
              </div>
              <div className="bg-white rounded-xl p-1.5 border border-slate-200/80">
                <div className="text-[8px] text-slate-500 font-bold">Water</div>
                <div className="text-xs font-black text-cyan-700">{liveTotals.waterMl}ml</div>
              </div>
            </div>
          </div>

          {/* Stack Builder Form */}
          <form onSubmit={handleCreateOrSaveStack} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  Stack Name
                </label>
                <input
                  type="text"
                  required
                  value={stackName}
                  onChange={(e) => setStackName(e.target.value)}
                  placeholder="e.g., Dan's Morning Stack"
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledHour}
                  onChange={(e) => setScheduledHour(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Ingredients List */}
            <div className="space-y-3">
              {ingredients.map((ing, idx) => (
                <div
                  key={ing.id}
                  className="rounded-2xl border border-slate-200 p-3 bg-slate-50/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase text-slate-700">
                      Item #{idx + 1}
                    </span>
                    <select
                      defaultValue=""
                      onChange={(e) => handleQuickPresetSelect(ing.id, e.target.value)}
                      className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800"
                    >
                      <option value="">⚡ Quick Select Verified Staple...</option>
                      {VERIFIED_NUTRIENT_DATABASE.map((dbItem, dbIdx) => (
                        <option key={dbIdx} value={dbIdx}>
                          {dbItem.label.split(' (')[0]} ({dbItem.defaultServingGrams}g/ml)
                        </option>
                      ))}
                    </select>
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setIngredients((prev) => prev.filter((item) => item.id !== ing.id))
                        }
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Ingredient Search / Enter / Lookup Row */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(ing.id, 'name', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAutoPopulateIngredient(ing);
                        }
                      }}
                      onBlur={() => {
                        if (!ing.source && ing.name.trim()) {
                          handleAutoPopulateIngredient(ing);
                        }
                      }}
                      placeholder="Type food (e.g. Banana, Oats, White Fish, Eggs) & press Enter..."
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleAutoPopulateIngredient(ing)}
                      disabled={loadingIngId === ing.id}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Lookup and auto-populate verified USDA / OpenFoodFacts nutrients"
                    >
                      <Search className="w-3 h-3" />
                      <span>{loadingIngId === ing.id ? '...' : 'Enter / Lookup'}</span>
                    </button>
                  </div>

                  {ing.source && (
                    <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      ✓ {ing.source}
                    </div>
                  )}

                  {/* Editable Grams/ml + Macros (including Total Carbs, Fiber, Net Carbs, Fats) */}
                  <div className="grid grid-cols-6 gap-1.5">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Amt (g/ml)</label>
                      <input
                        type="number"
                        value={ing.servingGrams}
                        onChange={(e) => handleServingGramsChange(ing.id, e.target.value)}
                        className="w-full rounded-lg border border-sky-300 bg-white px-1.5 py-1 text-xs font-black text-sky-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Kcal</label>
                      <input
                        type="number"
                        value={ing.calories}
                        onChange={(e) => handleIngredientChange(ing.id, 'calories', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Prot (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ing.protein}
                        onChange={(e) => handleIngredientChange(ing.id, 'protein', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Carb (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ing.carbs}
                        onChange={(e) => handleIngredientChange(ing.id, 'carbs', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Net C (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ing.netCarbs ?? Math.max(0, (Number(ing.carbs) || 0) - (Number(ing.fiber) || 0))}
                        readOnly
                        className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-1.5 py-1 text-xs font-black text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Fat (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ing.fats}
                        onChange={(e) => handleIngredientChange(ing.id, 'fats', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIngredients((prev) => [...prev, createEmptyIngredient()])}
                className="px-3.5 py-2 rounded-full text-xs font-extrabold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingStackId ? 'Update Stack' : 'Save Stack'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

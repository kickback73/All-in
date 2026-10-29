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
  parseQuantityGrams,
  scaleNutrients,
} from '../utils/nutrientEngine';
import { TILE_BACKGROUNDS } from '../utils/backgroundEngine';
import PersistentAllowanceChart from './PersistentAllowanceChart';

export const STACK_CATEGORIES = [
  'Morning Stacks',
  'Afternoon Stacks',
  'Evening Stacks',
];

let ingredientSeq = 1;
const generateUniqueIngId = () =>
  `ing_${Date.now()}_${ingredientSeq++}_${Math.random().toString(36).slice(2, 7)}`;

const createEmptyMicros = () =>
  MICRONUTRIENT_FIELDS.reduce((acc, m) => {
    acc[m.key] = 0;
    return acc;
  }, {});

const createEmptyIngredient = () => ({
  id: generateUniqueIngId(),
  name: '',
  servingGrams: '100g',
  source: '',
  per100g: null,
  calories: 0,
  protein: 0,
  carbs: 0,
  fiber: 0,
  netCarbs: 0,
  fats: 0,
  waterMl: 0,
  micros: createEmptyMicros(),
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
      micros: createEmptyMicros(),
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
  const [selectedCategory, setSelectedCategory] = useState('Morning Stacks');
  const [editingStackId, setEditingStackId] = useState(null);
  const [stackName, setStackName] = useState('');
  const [stackCategory, setStackCategory] = useState('Morning Stacks');
  const [scheduledHour, setScheduledHour] = useState('07:30');
  const [isRecurringPlanned, setIsRecurringPlanned] = useState(true);
  const [ingredients, setIngredients] = useState(() => [createEmptyIngredient()]);
  const [loadingIngId, setLoadingIngId] = useState(null);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);

  const liveTotals = useMemo(() => calculateStackTotals(ingredients), [ingredients]);
  const leucineGrams = (liveTotals.aminos.leucine / 1000).toFixed(2);
  const methionineGrams = (liveTotals.aminos.methionine / 1000).toFixed(2);

  const categorizedStacks = useMemo(() => {
    const groups = {
      'Morning Stacks': [],
      'Afternoon Stacks': [],
      'Evening Stacks': [],
    };
    stacks.forEach((s) => {
      const cat = STACK_CATEGORIES.includes(s.category) ? s.category : 'Morning Stacks';
      groups[cat].push(s);
    });
    return groups;
  }, [stacks]);

  if (!isOpen) return null;

  const handleAutoPopulateIngredient = async (ing) => {
    if (!ing.name.trim()) return;
    setLoadingIngId(ing.id);
    const verified = await lookupVerifiedNutrients(ing.name, ing.servingGrams);
    setLoadingIngId(null);

    if (verified) {
      setIngredients((prev) =>
        prev.map((item) =>
          item.id === ing.id
            ? {
                ...item,
                ...verified,
                id: ing.id, // Strictly preserve unique ID
                servingGrams: verified.servingInputText || `${verified.servingGrams}g`,
              }
            : item
        )
      );
    }
  };

  const handleServingTextChange = (targetId, newServingText) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== targetId) return ing;
        if (ing.per100g) {
          const parsedGrams = parseQuantityGrams(`${newServingText} ${ing.name}`, 100);
          return {
            ...ing,
            servingGrams: newServingText,
            ...scaleNutrients(ing.per100g, parsedGrams),
            id: ing.id,
          };
        }
        return { ...ing, servingGrams: newServingText };
      })
    );
  };

  // Strictly remove ONLY the targeted item by unique ID (fixes the last-two-items deletion bug)
  const handleRemoveIngredient = (targetId) => {
    setIngredients((prev) => {
      const filtered = prev.filter((item) => item.id !== targetId);
      return filtered.length > 0 ? filtered : [createEmptyIngredient()];
    });
  };

  const handleIngredientChange = (targetId, field, value, nestedGroup = null) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== targetId) return ing;
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
    const cat = STACK_CATEGORIES.includes(stack.category) ? stack.category : 'Morning Stacks';
    setEditingStackId(stack.id);
    setStackName(stack.name);
    setStackCategory(cat);
    setSelectedCategory(cat);
    setScheduledHour(stack.scheduledHour || '07:30');
    setIsRecurringPlanned(stack.isRecurringPlanned !== false);
    // Assign guaranteed unique IDs per ingredient row so deleting any row only deletes that exact row
    setIngredients(
      Array.isArray(stack.ingredients) && stack.ingredients.length > 0
        ? stack.ingredients.map((i) => ({
            ...createEmptyIngredient(),
            ...i,
            id: generateUniqueIngId(),
            servingGrams: String(i.servingGrams ?? '100g'),
          }))
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
      category: stackCategory,
      scheduledHour,
      isRecurringPlanned,
      ingredients: validIngredients,
      totals,
      createdAt: new Date().toISOString(),
    };

    if (onSaveStack) {
      onSaveStack(savedStack);
    }

    setSelectedCategory(stackCategory);
    setSaveSuccessBanner(true);
    setEditingStackId(null);
    setStackName('');
    setIngredients([createEmptyIngredient()]);
    setTimeout(() => setSaveSuccessBanner(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="relative rounded-3xl shadow-2xl border border-white/25 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-white bg-slate-950/40">
        {/* Persistent Visible Tile Background Image (No opaque color wash) */}
        <img
          src={TILE_BACKGROUNDS.stacks}
          alt="Get Stacked Backdrop"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/55 to-slate-950/75 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 px-4 py-3.5 bg-slate-950/65 backdrop-blur-md border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-2xl bg-amber-500/25 border border-amber-400/50 text-amber-300 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white drop-shadow truncate">
                {editingStackId ? 'Edit Stack — Get Stacked' : 'Get Stacked — Multi-Stack Builder'}
              </h2>
              <p className="text-[11px] text-slate-200 truncate">
                Morning, Afternoon &amp; Evening Stacks • Auto-Verified Nutrients
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="relative z-10 p-4 overflow-y-auto space-y-4">
          {/* Persistent Daily Recommended vs. Logged Intake Chart */}
          <PersistentAllowanceChart />
          {saveSuccessBanner && (
            <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-2.5 flex items-center gap-2 text-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Stack saved to {selectedCategory}!</span>
            </div>
          )}

          {/* Category Filter Tabs (Morning Stacks / Afternoon Stacks / Evening Stacks) */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-white/10">
              {STACK_CATEGORIES.map((cat) => {
                const count = categorizedStacks[cat]?.length || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (!editingStackId) setStackCategory(cat);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-black transition truncate ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.replace(' Stacks', '')} ({count})
                  </button>
                );
              })}
            </div>

            {/* Active Category Stacks List */}
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                {selectedCategory} ({categorizedStacks[selectedCategory]?.length || 0})
              </div>

              {(categorizedStacks[selectedCategory] || []).length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-center text-xs text-slate-400">
                  No stacks saved in {selectedCategory} yet. Build one below!
                </div>
              ) : (
                (categorizedStacks[selectedCategory] || []).map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-white/15 p-3 bg-slate-900/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-white text-xs truncate">{s.name}</div>
                      <div className="text-[11px] font-semibold text-slate-300">
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
                          className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400"
                        >
                          Log
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditExistingStack(s)}
                        className="p-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200 hover:text-amber-300"
                        title="Edit Stack"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteStack && (
                        <button
                          type="button"
                          onClick={() => onDeleteStack(s.id)}
                          className="p-1.5 rounded-full bg-white/10 border border-white/15 text-rose-400 hover:bg-rose-500/20"
                          title="Delete Stack"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Combined Stack Totals */}
          <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Live Stack Totals
              </span>
              <span className="text-[10px] font-bold text-slate-300">
                Leu: {leucineGrams}g • Met: {methionineGrams}g
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1 text-center">
              <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                <div className="text-[8px] text-slate-400 font-bold">Kcal</div>
                <div className="text-xs font-black text-white">{liveTotals.calories}</div>
              </div>
              <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                <div className="text-[8px] text-slate-400 font-bold">Protein</div>
                <div className="text-xs font-black text-emerald-400">{liveTotals.protein}g</div>
              </div>
              <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                <div className="text-[8px] text-slate-400 font-bold">Carbs</div>
                <div className="text-xs font-black text-cyan-300">{liveTotals.carbs}g</div>
              </div>
              <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                <div className="text-[8px] text-slate-400 font-bold">Net Carb</div>
                <div className="text-xs font-black text-teal-300">{liveTotals.netCarbs}g</div>
              </div>
              <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                <div className="text-[8px] text-slate-400 font-bold">Fats</div>
                <div className="text-xs font-black text-amber-300">{liveTotals.fats}g</div>
              </div>
              <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                <div className="text-[8px] text-slate-400 font-bold">Water</div>
                <div className="text-xs font-black text-sky-300">{liveTotals.waterMl}ml</div>
              </div>
            </div>
          </div>

          {/* Stack Builder Form */}
          <form onSubmit={handleCreateOrSaveStack} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-300 uppercase mb-1">
                  Stack Category
                </label>
                <select
                  value={stackCategory}
                  onChange={(e) => setStackCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                >
                  {STACK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-300 uppercase mb-1">
                  Stack Name
                </label>
                <input
                  type="text"
                  required
                  value={stackName}
                  onChange={(e) => setStackName(e.target.value)}
                  placeholder="e.g., Afternoon Recovery Stack"
                  className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-300 uppercase mb-1">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  value={scheduledHour}
                  onChange={(e) => setScheduledHour(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white"
                />
              </div>
            </div>

            {/* Ingredients List */}
            <div className="space-y-3">
              {ingredients.map((ing, idx) => (
                <div
                  key={ing.id}
                  className="rounded-2xl border border-white/15 p-3 bg-slate-900/85 space-y-2.5 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase text-amber-300">
                      Ingredient #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ing.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-[10px] font-bold transition"
                      title="Delete strictly this ingredient"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Contained Ingredient Search + Flexible Serving Input + Enter / Lookup Button */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full">
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
                      placeholder="Food/supplement (e.g. Black Coffee, Collagen, Oats)..."
                      className="min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white"
                    />
                    <input
                      type="text"
                      value={ing.servingGrams}
                      onChange={(e) => handleServingTextChange(ing.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAutoPopulateIngredient(ing);
                        }
                      }}
                      placeholder="e.g. 3/4 cup, 2 tbsp"
                      className="w-28 shrink-0 rounded-xl border border-amber-400/40 bg-slate-950 px-2 py-1.5 text-xs font-bold text-amber-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleAutoPopulateIngredient(ing)}
                      disabled={loadingIngId === ing.id}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black flex items-center justify-center gap-1 shrink-0 cursor-pointer max-w-full"
                      title="Lookup and auto-populate verified USDA nutrients"
                    >
                      <Search className="w-3 h-3 shrink-0" />
                      <span className=" whitespace-nowrap">
                        {loadingIngId === ing.id ? '...' : 'Enter / Lookup'}
                      </span>
                    </button>
                  </div>

                  {ing.source && (
                    <div className="flex items-center justify-between gap-2 bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded-lg">
                      <span className="text-[10px] font-bold text-emerald-300 truncate">
                        ✓ {ing.source}
                      </span>
                      {onLogStack && (
                        <button
                          type="button"
                          onClick={() => {
                            onLogStack({
                              name: `${ing.name} (${ing.servingGrams})`,
                              totals: ing,
                            });
                            setIngredients((prev) =>
                              prev.map((item) =>
                                item.id === ing.id
                                  ? { ...createEmptyIngredient(), id: ing.id }
                                  : item
                              )
                            );
                          }}
                          className="px-2 py-0.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-black shrink-0 flex items-center gap-0.5"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Add to Daily Totals</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Editable Macros Grid */}
                  <div className="grid grid-cols-5 gap-1.5">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400">Kcal</label>
                      <input
                        type="number"
                        value={ing.calories}
                        onChange={(e) => handleIngredientChange(ing.id, 'calories', e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-1.5 py-1 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400">Prot (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ing.protein}
                        onChange={(e) => handleIngredientChange(ing.id, 'protein', e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-1.5 py-1 text-xs font-bold text-emerald-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400">Carb (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ing.carbs}
                        onChange={(e) => handleIngredientChange(ing.id, 'carbs', e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-1.5 py-1 text-xs font-bold text-cyan-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400">Net C (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ing.netCarbs ?? Math.max(0, (Number(ing.carbs) || 0) - (Number(ing.fiber) || 0))}
                        readOnly
                        className="w-full rounded-lg border border-teal-500/30 bg-teal-950/40 px-1.5 py-1 text-xs font-black text-teal-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400">Fat (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ing.fats}
                        onChange={(e) => handleIngredientChange(ing.id, 'fats', e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-1.5 py-1 text-xs font-bold text-amber-300"
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
                className="px-3.5 py-2 rounded-full text-xs font-extrabold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full text-xs font-extrabold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-sm transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingStackId ? 'Update Stack' : `Save to ${stackCategory}`}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

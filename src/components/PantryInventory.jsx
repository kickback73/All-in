import React, { useState } from 'react';
import {
  PackageCheck,
  ChefHat,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  ScanLine,
  Sliders,
  UtensilsCrossed,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RETATRUTIDE_RECIPES, matchRecipesWithPantry } from '../data/retatrutideRecipes';

export default function PantryInventory() {
  const {
    pantryStock,
    updatePantryStockItem,
    logMeal,
    setIsScannerOpen
  } = useApp();

  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'ready' | 'stock'
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Compute matched recipes against live pantry stock
  const matchedRecipes = matchRecipesWithPantry(RETATRUTIDE_RECIPES, pantryStock);
  const readyToMakeCount = matchedRecipes.filter(r => r.canMakeNow).length;

  const handleQuickLogRecipe = (recipe) => {
    logMeal({
      name: recipe.name,
      category: 'Retatrutide Recipe',
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      leucine: recipe.leucine,
      methionine: recipe.methionine,
      source: 'pantry_recipe_matcher'
    });
    setSelectedRecipe(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-4 border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Kitchen Intelligence
            </span>
            <h2 className="text-base font-extrabold text-white">Fridge & Pantry Matcher</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cross-referencing active stock to suggest zero-run recipes.
            </p>
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center space-x-1.5"
            title="Scan Barcode to Add Stock"
          >
            <ScanLine className="w-4 h-4" />
            <span className="text-xs font-bold">Scan In</span>
          </button>
        </div>

        {/* Ready to Make Stat Ribbon */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">
              <strong className="text-emerald-300 font-mono">{readyToMakeCount}</strong> recipes 100% ready right now
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-1">
            <button
              onClick={() => setFilterMode('ready')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                filterMode === 'ready'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Ready Now
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All Recipes
            </button>
            <button
              onClick={() => setFilterMode('stock')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                filterMode === 'stock'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Stock List
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1 & 2: Recipes Section */}
      {filterMode !== 'stock' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
            {filterMode === 'ready' ? 'Ready-To-Make Recipes (100% In Stock)' : 'Retatrutide-Optimized Recipes'}
          </h3>

          <div className="space-y-3">
            {matchedRecipes
              .filter(r => (filterMode === 'ready' ? r.canMakeNow : true))
              .map(recipe => (
                <div
                  key={recipe.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    recipe.canMakeNow
                      ? 'glass-panel-glow-emerald border-emerald-500/40'
                      : 'glass-panel border-white/5 opacity-85'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {recipe.category}
                        </span>
                        {recipe.canMakeNow ? (
                          <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>In Stock (0 Grocery Run)</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-[10px] font-semibold text-amber-400">
                            <AlertCircle className="w-3 h-3" />
                            <span>Missing {recipe.missingCount} item</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-extrabold text-white mt-1">
                        {recipe.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {recipe.flavourProfile}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedRecipe(recipe)}
                      className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                      title="Inspect recipe instructions"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Nutrients & Amino Bar */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="text-emerald-400 font-extrabold">+{recipe.protein}g PRO</span>
                      <span className="text-slate-400">{recipe.calories} kcal</span>
                      <span className="text-cyan-400 font-semibold">{recipe.leucine}g Leu</span>
                      <span className="text-amber-400 font-semibold">{recipe.methionine}g Met</span>
                    </div>

                    <button
                      onClick={() => handleQuickLogRecipe(recipe)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all active:scale-95 ${
                        recipe.canMakeNow
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Log Meal
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Mode 3: Fridge & Pantry Stock Ledger */}
      {filterMode === 'stock' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Kitchen Stock Ledger ({pantryStock.length} items)
            </h3>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add via Barcode</span>
            </button>
          </div>

          <div className="space-y-2">
            {pantryStock.map(item => (
              <div
                key={item.id}
                className="glass-panel rounded-2xl p-3 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updatePantryStockItem(item.id, { inStock: !item.inStock })}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        item.inStock
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600 bg-slate-900'
                      }`}
                    >
                      {item.inStock && <CheckCircle2 className="w-3 h-3 stroke-[3px]" />}
                    </button>
                    <span className={`text-xs font-bold ${item.inStock ? 'text-white' : 'text-slate-500 line-through'}`}>
                      {item.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 ml-6">
                    {item.brand} • {item.quantity} {item.unit} • {item.daysRemaining} days freshness
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 font-mono text-xs">
                  <button
                    onClick={() => updatePantryStockItem(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                    className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updatePantryStockItem(item.id, { quantity: item.quantity + 1, inStock: true })}
                    className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Recipe Detail View Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl relative max-h-[88vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] font-bold uppercase text-emerald-400">{selectedRecipe.category}</span>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <h3 className="text-base font-extrabold text-white mt-2">{selectedRecipe.name}</h3>
            <p className="text-xs text-slate-300 mt-1">{selectedRecipe.flavourProfile}</p>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono my-3 p-2.5 bg-slate-950/60 rounded-xl border border-white/5">
              <div>
                <span className="text-[9px] text-slate-400 block">Kcal</span>
                <span className="font-extrabold text-white">{selectedRecipe.calories}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Protein</span>
                <span className="font-extrabold text-emerald-400">{selectedRecipe.protein}g</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Leucine</span>
                <span className="font-extrabold text-cyan-400">{selectedRecipe.leucine}g</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Methionine</span>
                <span className="font-extrabold text-amber-400">{selectedRecipe.methionine}g</span>
              </div>
            </div>

            {/* Digestible Volume */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 mb-3">
              <span className="font-bold text-white block mb-0.5">Digestible Volume:</span>
              <p className="text-[11px] text-slate-400">{selectedRecipe.digestibleVolume}</p>
            </div>

            {/* Ingredients */}
            <div className="mb-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ingredients:</span>
              <ul className="text-xs text-slate-200 space-y-1">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center justify-between py-0.5 border-b border-white/5">
                    <span>{ing.name}</span>
                    <span className="font-mono text-slate-400">{ing.amount}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step by Step Instructions */}
            <div className="mb-4 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preparation:</span>
              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-4">
                {selectedRecipe.instructions.map((step, idx) => (
                  <li key={idx} className="leading-snug">{step}</li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => handleQuickLogRecipe(selectedRecipe)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all"
            >
              Log Recipe to Active Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

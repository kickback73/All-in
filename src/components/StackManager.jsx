import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  Edit2,
  ShieldCheck,
  Zap,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { feedbackEngine } from '../utils/soundEffects';

export default function StackManager() {
  const { morningStacks, updateMorningStacks } = useApp();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingStackId, setEditingStackId] = useState(null);

  // New Stack Form State with Multiple Items
  const [stackName, setStackName] = useState('');
  const [stackSubtitle, setStackSubtitle] = useState('');
  const [stackBadge, setStackBadge] = useState('Daily Core');
  const [stackIcon, setStackIcon] = useState('Sparkles');

  // Multi-item array
  const [itemsList, setItemsList] = useState([
    { id: 1, name: '15g Wild Marine Collagen Peptides', protein: 14, calories: 55, leucine: 0.35, methionine: 0.15 },
    { id: 2, name: '500mg Liposomal Vitamin C', protein: 0, calories: 5, leucine: 0, methionine: 0 },
    { id: 3, name: '3g Pure L-Glycine powder', protein: 3, calories: 12, leucine: 0, methionine: 0 }
  ]);

  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);

  // Auto-calculated aggregated stack totals
  const aggregateTotals = React.useMemo(() => {
    return itemsList.reduce((acc, item) => {
      acc.protein += Number(item.protein || 0);
      acc.calories += Number(item.calories || 0);
      acc.leucine += Number(item.leucine || 0);
      acc.methionine += Number(item.methionine || 0);
      return acc;
    }, { protein: 0, calories: 0, leucine: 0, methionine: 0 });
  }, [itemsList]);

  const handleAddItemRow = () => {
    setItemsList(prev => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        protein: 0,
        calories: 0,
        leucine: 0,
        methionine: 0
      }
    ]);
  };

  const handleUpdateItemRow = (id, field, value) => {
    setItemsList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemoveItemRow = (id) => {
    if (itemsList.length <= 1) return;
    setItemsList(prev => prev.filter(item => item.id !== id));
  };

  const handleStartEdit = (stack) => {
    setEditingStackId(stack.id);
    setIsCreatingNew(true);
    setStackName(stack.name);
    setStackSubtitle(stack.subtitle || '');
    setStackBadge(stack.badge || 'Protocol');
    setStackIcon(stack.icon || 'Sparkles');

    // Parse items into editable rows
    const parsed = (stack.items || []).map((it, idx) => {
      if (typeof it === 'string') {
        return {
          id: idx + 1,
          name: it,
          protein: Math.round((stack.protein || 10) / (stack.items.length || 1)),
          calories: Math.round((stack.calories || 50) / (stack.items.length || 1)),
          leucine: Number(((stack.leucine || 0.5) / (stack.items.length || 1)).toFixed(2)),
          methionine: Number(((stack.methionine || 0.2) / (stack.items.length || 1)).toFixed(2))
        };
      }
      return { id: idx + 1, ...it };
    });

    setItemsList(parsed.length > 0 ? parsed : [{ id: 1, name: '', protein: 0, calories: 0, leucine: 0, methionine: 0 }]);
  };

  const handleSaveMultiItemStack = (e) => {
    e.preventDefault();
    if (!stackName.trim()) return;

    const formattedItems = itemsList
      .filter(it => it.name.trim() !== '')
      .map(it => it.name.trim());

    const newStackObject = {
      id: editingStackId || `stack-${Date.now()}`,
      name: stackName.trim(),
      subtitle: stackSubtitle.trim() || `${formattedItems.length} synergistic items`,
      badge: stackBadge || 'Custom',
      icon: stackIcon || 'Sparkles',
      calories: aggregateTotals.calories,
      protein: aggregateTotals.protein,
      carbs: 1,
      fat: 0,
      leucine: Number(aggregateTotals.leucine.toFixed(2)),
      methionine: Number(aggregateTotals.methionine.toFixed(2)),
      items: formattedItems,
      mTorEffect: 'Synergistic multi-item protocol formulated into daily dashboard ledger.'
    };

    let updatedStacks = [];
    if (editingStackId) {
      updatedStacks = morningStacks.map(s => s.id === editingStackId ? newStackObject : s);
    } else {
      updatedStacks = [newStackObject, ...morningStacks];
    }

    updateMorningStacks(updatedStacks);
    feedbackEngine.playChime('sync');
    feedbackEngine.triggerConfetti();

    setSaveSuccessBanner(true);
    setTimeout(() => {
      setSaveSuccessBanner(false);
      setIsCreatingNew(false);
      setEditingStackId(null);
      setStackName('');
      setStackSubtitle('');
    }, 1200);
  };

  const handleDeleteStack = (id) => {
    updateMorningStacks(morningStacks.filter(s => s.id !== id));
    feedbackEngine.vibrate(20);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Protocol Architecture
            </span>
            <h2 className="text-base font-extrabold text-white">Multi-Item Stack Creator</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Formulate multi-ingredient stacks that auto-display on your main dashboard quick picker.
            </p>
          </div>

          <button
            onClick={() => {
              setIsCreatingNew(!isCreatingNew);
              setEditingStackId(null);
              setStackName('');
              setStackSubtitle('');
              setItemsList([
                { id: 1, name: '15g Marine Collagen Peptides', protein: 14, calories: 55, leucine: 0.35, methionine: 0.15 },
                { id: 2, name: '5g Creatine Monohydrate', protein: 0, calories: 0, leucine: 0, methionine: 0 },
                { id: 3, name: '1 scoop Electrolyte Mineral Complex', protein: 0, calories: 5, leucine: 0, methionine: 0 }
              ]);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>{isCreatingNew ? 'Close Editor' : 'New Stack'}</span>
          </button>
        </div>
      </div>

      {/* MULTI-ITEM STACK CREATOR & EDITOR CONSOLE */}
      {isCreatingNew && (
        <form onSubmit={handleSaveMultiItemStack} className="glass-panel rounded-3xl p-5 border border-emerald-500/40 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-white">
                {editingStackId ? 'Edit Stack Formula' : 'Formulate New Multi-Item Stack'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Dashboard Live Sync
            </span>
          </div>

          {/* Stack Name & Purpose */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stack Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Cellular Longevity & Joint Defense"
                value={stackName}
                onChange={(e) => setStackName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Goal / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Gut Barrier & Anabolic Pulse"
                  value={stackSubtitle}
                  onChange={(e) => setStackSubtitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Badge Tag</label>
                <select
                  value={stackBadge}
                  onChange={(e) => setStackBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs font-sans"
                >
                  <option value="Daily Core">Daily Core</option>
                  <option value="Anabolic Shield">Anabolic Shield</option>
                  <option value="Joint & Gut">Joint & Gut</option>
                  <option value="Mitochondrial">Mitochondrial</option>
                  <option value="Fast-Twitch">Fast-Twitch</option>
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC MULTI-ITEM ARRAY SECTION */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stack Ingredients ({itemsList.length} Items):</span>
              </span>

              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Row</span>
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
              {itemsList.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">Item #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(item.id)}
                      disabled={itemsList.length <= 1}
                      className="text-slate-500 hover:text-rose-400 p-0.5 disabled:opacity-30"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="e.g. 15g Wild Marine Collagen Peptides"
                    value={item.name}
                    onChange={(e) => handleUpdateItemRow(item.id, 'name', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />

                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Protein (g)</span>
                      <input
                        type="number"
                        value={item.protein}
                        onChange={(e) => handleUpdateItemRow(item.id, 'protein', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-emerald-300 font-bold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Calories</span>
                      <input
                        type="number"
                        value={item.calories}
                        onChange={(e) => handleUpdateItemRow(item.id, 'calories', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-white text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Leucine (g)</span>
                      <input
                        type="number"
                        step="0.05"
                        value={item.leucine}
                        onChange={(e) => handleUpdateItemRow(item.id, 'leucine', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-cyan-300 text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Methionine</span>
                      <input
                        type="number"
                        step="0.05"
                        value={item.methionine}
                        onChange={(e) => handleUpdateItemRow(item.id, 'methionine', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-amber-300 text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItemRow}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 border border-dashed border-white/10"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Add Another Ingredient to This Stack</span>
            </button>
          </div>

          {/* Auto-Aggregated Live Totals Ribbon */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[9px] text-slate-400 block font-sans">Aggregated Stack Payload:</span>
              <span className="font-black text-emerald-300 text-sm">+{aggregateTotals.protein}g Protein</span>
            </div>
            <div className="text-right text-[11px] text-slate-300 space-x-2">
              <span>{aggregateTotals.calories} kcal</span>
              <span className="text-cyan-400 font-bold">{aggregateTotals.leucine.toFixed(2)}g Leu</span>
              <span className="text-amber-400 font-bold">{aggregateTotals.methionine.toFixed(2)}g Met</span>
            </div>
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setEditingStackId(null);
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Publish to Dashboard</span>
            </button>
          </div>

          {saveSuccessBanner && (
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Stack Saved! Live on your Dashboard Quick Picker.</span>
            </div>
          )}
        </form>
      )}

      {/* CURRENT ACTIVE MORNING STACKS LIST */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1 block">
          Configured Morning Stacks ({morningStacks.length}):
        </span>

        <div className="space-y-2.5">
          {morningStacks.map((stack) => (
            <div
              key={stack.id}
              className="glass-panel rounded-2xl p-4 border border-white/5 hover:border-white/20 transition-all space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-emerald-500/20">
                      {stack.badge || 'Protocol'}
                    </span>
                    <h4 className="text-xs font-extrabold text-white">{stack.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{stack.subtitle}</p>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleStartEdit(stack)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                    title="Edit Multi-Item Stack"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStack(stack.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                    title="Delete Stack"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Included Items ({stack.items?.length || 0}):
                </span>
                <ul className="text-xs text-slate-200 space-y-0.5">
                  {(stack.items || []).map((it, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5 text-[11px]">
                      <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                      <span>{typeof it === 'string' ? it : it.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Macro & Amino Readout */}
              <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-400">
                <span className="text-emerald-400 font-bold">+{stack.protein}g Protein</span>
                <span>{stack.calories} kcal</span>
                <span className="text-cyan-400 font-semibold">{stack.leucine}g Leu</span>
                <span className="text-amber-400 font-semibold">{stack.methionine}g Met</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

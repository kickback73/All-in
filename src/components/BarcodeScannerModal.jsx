import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Sparkles,
  RefreshCw,
  Layers,
  Plus,
  BookmarkPlus,
  Utensils,
  Flame,
  Activity,
  Droplet,
  Dna,
  Zap,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useApp } from '../context/AppContext';
import { lookupBarcode } from '../data/pantryDatabase';
import { feedbackEngine } from '../utils/soundEffects';

// Extended database of high-protein, vegetarian & metabolic staples with complete Caloric, Macro, Micro & Amino telemetry
const AUTO_POPULATE_DATABASE = [
  {
    name: 'Oikos 0% Plain Greek Yogurt',
    brand: 'Danone Oikos',
    servingSize: '175g (3/4 cup)',
    category: 'Vegetarian Dairy',
    calories: 100,
    protein: 19,
    carbs: 6,
    fat: 0,
    fibre: 0,
    // Amino acid telemetry (g)
    leucine: 1.82,
    methionine: 0.49,
    glycine: 0.38,
    // Micro / Electrolyte telemetry (mg)
    sodiumMg: 65,
    potassiumMg: 240,
    calciumMg: 200,
    magnesiumMg: 18,
    ironMg: 0.1,
    vitaminCMg: 0
  },
  {
    name: 'Kirkland 100% Liquid Egg Whites',
    brand: 'Kirkland Signature',
    servingSize: '100g (approx. 3 egg whites)',
    category: 'Vegetarian Albumin',
    calories: 50,
    protein: 11,
    carbs: 1,
    fat: 0,
    fibre: 0,
    leucine: 0.95,
    methionine: 0.38,
    glycine: 0.39,
    sodiumMg: 160,
    potassiumMg: 155,
    calciumMg: 7,
    magnesiumMg: 11,
    ironMg: 0.1,
    vitaminCMg: 0
  },
  {
    name: 'Sunrise Organic Extra Firm Tofu',
    brand: 'Sunrise Soya',
    servingSize: '100g block',
    category: 'Organic Soy Protein',
    calories: 90,
    protein: 10,
    carbs: 2,
    fat: 5,
    fibre: 1.5,
    leucine: 0.78,
    methionine: 0.13, // Naturally low methionine (oncology friendly)
    glycine: 0.42,
    sodiumMg: 15,
    potassiumMg: 120,
    calciumMg: 350, // Calcium sulphate set
    magnesiumMg: 58,
    ironMg: 2.7,
    vitaminCMg: 0
  },
  {
    name: 'Wild Marine Collagen Peptides',
    brand: 'Vital Proteins / Pure Marine',
    servingSize: '15g scoop',
    category: 'Marine Bioactive Peptides',
    calories: 55,
    protein: 14,
    carbs: 0,
    fat: 0,
    fibre: 0,
    leucine: 0.35, // Very low leucine!
    methionine: 0.15, // Extremely low methionine (preserves mTOR balance)
    glycine: 3.20, // Abundant therapeutic glycine
    sodiumMg: 12,
    potassiumMg: 5,
    calciumMg: 15,
    magnesiumMg: 4,
    ironMg: 0.2,
    vitaminCMg: 0
  },
  {
    name: 'Traditional Wheat Seitan Strips',
    brand: 'Upton’s Naturals',
    servingSize: '100g',
    category: 'High-Density Plant Protein',
    calories: 120,
    protein: 24,
    carbs: 4,
    fat: 1.5,
    fibre: 2.0,
    leucine: 1.68,
    methionine: 0.35,
    glycine: 0.72,
    sodiumMg: 380,
    potassiumMg: 85,
    calciumMg: 30,
    magnesiumMg: 25,
    ironMg: 2.1,
    vitaminCMg: 0
  },
  {
    name: 'Wild Pacific Cod Fillet',
    brand: 'High Liner Wild Caught',
    servingSize: '140g fillet',
    category: 'Pescatarian White Fish',
    calories: 110,
    protein: 24,
    carbs: 0,
    fat: 1,
    fibre: 0,
    leucine: 1.95,
    methionine: 0.68,
    glycine: 1.15,
    sodiumMg: 90,
    potassiumMg: 420,
    calciumMg: 20,
    magnesiumMg: 38,
    ironMg: 0.4,
    vitaminCMg: 1.5
  },
  {
    name: 'Lightlife Organic Tempeh',
    brand: 'Lightlife',
    servingSize: '100g',
    category: 'Fermented Cultured Soy',
    calories: 160,
    protein: 18,
    carbs: 9,
    fat: 5,
    fibre: 6.0,
    leucine: 1.35,
    methionine: 0.22,
    glycine: 0.75,
    sodiumMg: 10,
    potassiumMg: 412,
    calciumMg: 111,
    magnesiumMg: 81,
    ironMg: 2.7,
    vitaminCMg: 0
  },
  {
    name: 'Manitoba Harvest Shelled Hemp Hearts',
    brand: 'Manitoba Harvest',
    servingSize: '30g (3 tbsp)',
    category: 'Superfood Seeds',
    calories: 180,
    protein: 10,
    carbs: 1,
    fat: 15,
    fibre: 1.2,
    leucine: 0.68,
    methionine: 0.23,
    glycine: 0.45,
    sodiumMg: 0,
    potassiumMg: 360,
    calciumMg: 20,
    magnesiumMg: 210, // Outstanding magnesium
    ironMg: 2.4,
    vitaminCMg: 0.5
  },
  {
    name: 'Fairlife Core Power Elite 42g',
    brand: 'Fairlife',
    servingSize: '414ml bottle',
    category: 'Lactose-Free Ultrafiltered Dairy',
    calories: 230,
    protein: 42,
    carbs: 8,
    fat: 3.5,
    fibre: 0,
    leucine: 4.10, // Anabolic trigger
    methionine: 1.05,
    glycine: 0.85,
    sodiumMg: 260,
    potassiumMg: 700,
    calciumMg: 900,
    magnesiumMg: 45,
    ironMg: 0.5,
    vitaminCMg: 0
  },
  {
    name: 'Nutritional Yeast Fortified Flakes',
    brand: 'Bob’s Red Mill',
    servingSize: '15g (2 tbsp)',
    category: 'Fortified Savoury Flakes',
    calories: 60,
    protein: 8,
    carbs: 5,
    fat: 0.5,
    fibre: 3.0,
    leucine: 0.61,
    methionine: 0.15,
    glycine: 0.38,
    sodiumMg: 25,
    potassiumMg: 320,
    calciumMg: 10,
    magnesiumMg: 28,
    ironMg: 1.2,
    vitaminCMg: 0
  },
  {
    name: 'Fermented Plant BCAA / EAA Clean Mix',
    brand: 'All-In Clean Nutrition',
    servingSize: '1 scoop (12g)',
    category: 'Fermented Amino Complex',
    calories: 40,
    protein: 10,
    carbs: 0,
    fat: 0,
    fibre: 0,
    leucine: 3.00, // Direct mTOR triggering threshold
    methionine: 0.35,
    glycine: 0.50,
    sodiumMg: 280,
    potassiumMg: 190,
    calciumMg: 40,
    magnesiumMg: 60,
    ironMg: 0,
    vitaminCMg: 100
  },
  {
    name: 'Electrolyte Mineral Replenisher',
    brand: 'LMNT / All-In Salts',
    servingSize: '1 packet (6g)',
    category: 'Cellular Hydration Salts',
    calories: 5,
    protein: 0,
    carbs: 1,
    fat: 0,
    fibre: 0,
    leucine: 0,
    methionine: 0,
    glycine: 0,
    sodiumMg: 1000, // High electrolyte buffering
    potassiumMg: 200,
    calciumMg: 0,
    magnesiumMg: 60,
    ironMg: 0,
    vitaminCMg: 0
  }
];

export default function BarcodeScannerModal() {
  const {
    isScannerOpen,
    setIsScannerOpen,
    logMeal,
    morningStacks,
    updateMorningStacks
  } = useApp();

  const [foodQuery, setFoodQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Editable item telemetry fields
  const [editItem, setEditItem] = useState(null);

  // Stack Action Choice Prompt State
  const [stackPromptItem, setStackPromptItem] = useState(null);
  const [newStackName, setNewStackName] = useState('');
  const [targetStackId, setTargetStackId] = useState(morningStacks[0]?.id || '');

  // Toggle detail telemetry cards
  const [showMicroDetails, setShowMicroDetails] = useState(false);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'pixel8-inline-camera-window';

  // Autocomplete suggestions based on user typing
  const suggestions = useMemo(() => {
    const q = foodQuery.toLowerCase().trim();
    if (!q || q.length < 2) return [];
    return AUTO_POPULATE_DATABASE.filter(f => f.name.toLowerCase().includes(q));
  }, [foodQuery]);

  // Setup inline camera scanner (no manual UPC entry field)
  useEffect(() => {
    if (!isScannerOpen) {
      stopCameraScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setScannerError(null);
        await new Promise(r => setTimeout(r, 200));
        const el = document.getElementById(scannerContainerId);
        if (!el || !isMounted) return;

        const html5QrCode = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 240, height: 160 },
          aspectRatio: 1.333333
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleBarcodeSuccess(decodedText);
          },
          () => {}
        );

        if (isMounted) setIsScanning(true);
      } catch (err) {
        console.warn('Camera notice:', err);
        if (isMounted) {
          setScannerError('Camera preview unavailable in this browser view. Type any food name below to auto-populate.');
          setIsScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopCameraScanner();
    };
  }, [isScannerOpen]);

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const populateAndStageItem = (item) => {
    const robustItem = {
      name: item.name,
      brand: item.brand || 'Nutrition Asset',
      category: item.category || 'Nutritional Entry',
      calories: Number(item.calories || 0),
      protein: Number(item.protein || 0),
      carbs: Number(item.carbs || 0),
      fat: Number(item.fat || 0),
      fibre: Number(item.fibre || 0),
      leucine: Number(item.leucine || (item.protein ? item.protein * 0.08 : 0).toFixed(2)),
      methionine: Number(item.methionine || (item.protein ? item.protein * 0.02 : 0).toFixed(2)),
      glycine: Number(item.glycine || (item.protein ? item.protein * 0.04 : 0).toFixed(2)),
      sodiumMg: Number(item.sodiumMg || 0),
      potassiumMg: Number(item.potassiumMg || 0),
      calciumMg: Number(item.calciumMg || 0),
      magnesiumMg: Number(item.magnesiumMg || 0),
      ironMg: Number(item.ironMg || 0),
      vitaminCMg: Number(item.vitaminCMg || 0)
    };

    setEditItem(robustItem);
    setStackPromptItem(robustItem);
    setNewStackName(`${item.name.split(' ')[0]} Stack`);
  };

  const handleBarcodeSuccess = async (barcode) => {
    feedbackEngine.playChime('scan');
    setIsLookingUp(true);
    const lookup = await lookupBarcode(barcode);
    setIsLookingUp(false);

    if (lookup.found) {
      const item = lookup.item;
      setFoodQuery(item.name);
      setSelectedItem(item);
      stopCameraScanner();
      populateAndStageItem(item);
    } else {
      setScannerError(`Barcode not in database. Enter food name below.`);
    }
  };

  const handleSelectSuggestion = (item) => {
    setFoodQuery(item.name);
    setSelectedItem(item);
    populateAndStageItem(item);
  };

  const updateEditField = (field, val) => {
    setEditItem(prev => ({
      ...prev,
      [field]: val
    }));
    setStackPromptItem(prev => ({
      ...prev,
      [field]: val
    }));
  };

  // Stack Prompt Actions:
  // 1. Log as single item with full caloric, macro, micro and amino payload
  const handleLogSingleItem = () => {
    const payload = editItem || stackPromptItem;
    if (!payload) return;

    logMeal({
      name: payload.name,
      category: payload.category || 'Nutritional Entry',
      calories: Number(payload.calories || 0),
      protein: Number(payload.protein || 0),
      carbs: Number(payload.carbs || 0),
      fat: Number(payload.fat || 0),
      fibre: Number(payload.fibre || 0),
      leucine: Number(payload.leucine || 0),
      methionine: Number(payload.methionine || 0),
      glycine: Number(payload.glycine || 0),
      sodiumMg: Number(payload.sodiumMg || 0),
      potassiumMg: Number(payload.potassiumMg || 0),
      calciumMg: Number(payload.calciumMg || 0),
      magnesiumMg: Number(payload.magnesiumMg || 0),
      source: 'quick_log'
    });
    feedbackEngine.playChime('sync');
    feedbackEngine.triggerConfetti();
    closeModal();
  };

  // 2. Start a new stack with this item
  const handleStartNewStack = () => {
    const payload = editItem || stackPromptItem;
    if (!payload) return;

    const newStack = {
      id: `stack-${Date.now()}`,
      name: newStackName || `${payload.name} Stack`,
      subtitle: `Formulated around ${payload.name}`,
      icon: 'Sparkles',
      badge: 'Custom',
      calories: Number(payload.calories || 0),
      protein: Number(payload.protein || 0),
      carbs: Number(payload.carbs || 0),
      fat: Number(payload.fat || 0),
      fibre: Number(payload.fibre || 0),
      leucine: Number(payload.leucine || 0),
      methionine: Number(payload.methionine || 0),
      items: [`1 serving ${payload.name}`],
      mTorEffect: `Formulated with ${payload.leucine || 0}g Leucine and ${payload.methionine || 0}g Methionine balance.`
    };

    updateMorningStacks([newStack, ...morningStacks]);
    
    // Also record it into today's log
    logMeal({
      name: newStack.name,
      category: 'Morning Stack',
      calories: newStack.calories,
      protein: newStack.protein,
      carbs: newStack.carbs,
      fat: newStack.fat,
      leucine: newStack.leucine,
      methionine: newStack.methionine,
      source: 'morning_stack'
    });

    feedbackEngine.playChime('stack');
    feedbackEngine.triggerConfetti();
    closeModal();
  };

  // 3. Add to an existing morning stack
  const handleAddToExistingStack = () => {
    const payload = editItem || stackPromptItem;
    if (!payload || !targetStackId) return;

    const updated = morningStacks.map(s => {
      if (s.id === targetStackId) {
        return {
          ...s,
          calories: s.calories + Number(payload.calories || 0),
          protein: s.protein + Number(payload.protein || 0),
          carbs: (s.carbs || 0) + Number(payload.carbs || 0),
          fat: (s.fat || 0) + Number(payload.fat || 0),
          leucine: Number(((s.leucine || 0) + Number(payload.leucine || 0)).toFixed(2)),
          methionine: Number(((s.methionine || 0) + Number(payload.methionine || 0)).toFixed(2)),
          items: [...(s.items || []), `+ ${payload.name}`]
        };
      }
      return s;
    });

    updateMorningStacks(updated);
    handleLogSingleItem();
  };

  const closeModal = () => {
    stopCameraScanner();
    setIsScannerOpen(false);
    setStackPromptItem(null);
    setEditItem(null);
    setSelectedItem(null);
    setFoodQuery('');
  };

  if (!isScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Robust Quick Log & Scanner</h3>
              <p className="text-[10px] text-slate-400 font-medium">Caloric, macro, micro & amino acid precision</p>
            </div>
          </div>

          <button onClick={closeModal} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto no-scrollbar flex-1 space-y-4">
          {/* 1. Camera Scanner Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 min-h-[160px] flex items-center justify-center">
            <div id={scannerContainerId} className="w-full h-full"></div>

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-52 h-28 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400/50 shadow-[0_0_8px_#10b981] animate-pulse"></div>
              </div>
            </div>

            {isLookingUp && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-2 z-10">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-xs font-bold text-white">Looking up barcode...</span>
              </div>
            )}
          </div>

          {scannerError && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-[11px]">{scannerError}</p>
            </div>
          )}

          {/* 2. Manual Food Item Entry Field with Auto-Population Dropdown */}
          <div className="space-y-1.5 relative">
            <label className="block text-xs font-bold text-slate-300">
              Food Item Entry (Auto-Populates Nutrition):
            </label>
            <div className="relative">
              <input
                type="text"
                value={foodQuery}
                onChange={(e) => {
                  setFoodQuery(e.target.value);
                  setSelectedItem(null);
                }}
                placeholder="Type e.g. Oikos, Tofu, Egg Whites, Cod, Collagen..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
              />
            </div>

            {/* Auto-populate Suggestions Dropdown */}
            {suggestions.length > 0 && !selectedItem && (
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-xl space-y-1 z-20 max-h-48 overflow-y-auto no-scrollbar">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                  Tap to Auto-Populate:
                </span>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full p-2.5 rounded-xl text-left hover:bg-slate-800 transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.calories} kcal • {item.protein}g PRO • {item.leucine}g Leu • {item.sodiumMg}mg Na
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. ROBUST TELEMETRY & STACK CONFIGURATION PANEL */}
          {editItem && (
            <div className="glass-panel-glow-emerald rounded-3xl p-4 border border-emerald-500/40 space-y-3.5 animate-fade-in shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                      Telemetry Configured
                    </span>
                    <h4 className="text-xs font-black text-white">{editItem.name}</h4>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-emerald-500/20 font-bold">
                  {editItem.calories} kcal
                </span>
              </div>

              {/* CALORIC & PRIMARY MACROS GRID */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Caloric & Macro Breakdown:
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/30">
                    <span className="text-[9px] text-slate-400 block font-sans">Protein</span>
                    <input
                      type="number"
                      value={editItem.protein}
                      onChange={(e) => updateEditField('protein', Number(e.target.value))}
                      className="w-full bg-transparent text-emerald-300 font-extrabold text-xs text-center focus:outline-none"
                    />
                    <span className="text-[8px] text-slate-500">grams</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5">
                    <span className="text-[9px] text-slate-400 block font-sans">Calories</span>
                    <input
                      type="number"
                      value={editItem.calories}
                      onChange={(e) => updateEditField('calories', Number(e.target.value))}
                      className="w-full bg-transparent text-white font-extrabold text-xs text-center focus:outline-none"
                    />
                    <span className="text-[8px] text-slate-500">kcal</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5">
                    <span className="text-[9px] text-slate-400 block font-sans">Carbs</span>
                    <input
                      type="number"
                      value={editItem.carbs}
                      onChange={(e) => updateEditField('carbs', Number(e.target.value))}
                      className="w-full bg-transparent text-cyan-300 font-extrabold text-xs text-center focus:outline-none"
                    />
                    <span className="text-[8px] text-slate-500">grams</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5">
                    <span className="text-[9px] text-slate-400 block font-sans">Fibre / Fat</span>
                    <div className="flex items-center justify-center space-x-1 text-xs font-bold text-amber-300">
                      <span>{editItem.fibre}g</span>
                      <span className="text-slate-500">/</span>
                      <span>{editItem.fat}g</span>
                    </div>
                    <span className="text-[8px] text-slate-500">fib/fat</span>
                  </div>
                </div>
              </div>

              {/* AMINO ACID TELEMETRY (MTOR & ONCOLOGY RADAR) */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-cyan-300 flex items-center space-x-1">
                    <Dna className="w-3.5 h-3.5" />
                    <span>Amino Acid Telemetry:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">mTOR Target: ≥3.0g Leu</span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-white/5">
                    <span className="text-[9px] text-slate-400 block font-sans">Leucine (Leu)</span>
                    <input
                      type="number"
                      step="0.05"
                      value={editItem.leucine}
                      onChange={(e) => updateEditField('leucine', Number(e.target.value))}
                      className="w-full bg-transparent text-cyan-300 font-black text-xs text-center focus:outline-none"
                    />
                    <span className="text-[8px] text-slate-500 font-sans">Anabolic trigger</span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-900 border border-white/5">
                    <span className="text-[9px] text-slate-400 block font-sans">Methionine (Met)</span>
                    <input
                      type="number"
                      step="0.05"
                      value={editItem.methionine}
                      onChange={(e) => updateEditField('methionine', Number(e.target.value))}
                      className="w-full bg-transparent text-amber-300 font-black text-xs text-center focus:outline-none"
                    />
                    <span className="text-[8px] text-slate-500 font-sans">Oncology ceiling</span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-900 border border-white/5">
                    <span className="text-[9px] text-slate-400 block font-sans">Glycine (Gly)</span>
                    <input
                      type="number"
                      step="0.05"
                      value={editItem.glycine}
                      onChange={(e) => updateEditField('glycine', Number(e.target.value))}
                      className="w-full bg-transparent text-emerald-300 font-black text-xs text-center focus:outline-none"
                    />
                    <span className="text-[8px] text-slate-500 font-sans">Buffer amino</span>
                  </div>
                </div>
              </div>

              {/* MICRO-NUTRIENT & ELECTROLYTE TELEMETRY COLLAPSIBLE */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowMicroDetails(!showMicroDetails)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white"
                >
                  <span className="flex items-center space-x-1.5 text-emerald-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Micro-Nutrients & Electrolytes</span>
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                    <span>{showMicroDetails ? 'Hide' : 'Show (Na, K, Mg, Ca)'}</span>
                    {showMicroDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {showMicroDetails && (
                  <div className="grid grid-cols-4 gap-1.5 text-center font-mono pt-1 text-[10px]">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-white/5">
                      <span className="text-[8px] text-slate-400 block font-sans">Sodium (Na+)</span>
                      <span className="text-white font-bold">{editItem.sodiumMg} mg</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-white/5">
                      <span className="text-[8px] text-slate-400 block font-sans">Potassium (K+)</span>
                      <span className="text-emerald-300 font-bold">{editItem.potassiumMg} mg</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-white/5">
                      <span className="text-[8px] text-slate-400 block font-sans">Calcium (Ca2+)</span>
                      <span className="text-cyan-300 font-bold">{editItem.calciumMg} mg</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-white/5">
                      <span className="text-[8px] text-slate-400 block font-sans">Magnesium</span>
                      <span className="text-purple-300 font-bold">{editItem.magnesiumMg} mg</span>
                    </div>
                  </div>
                )}
              </div>

              {/* STACK DESTINATION & LOG ACTIONS */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs text-slate-200 font-extrabold block">
                  Select Action for this Item:
                </span>

                {/* Option 1: Log as Single Item */}
                <button
                  type="button"
                  onClick={handleLogSingleItem}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-left flex items-center justify-between transition-all"
                >
                  <span className="flex items-center space-x-2">
                    <Utensils className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Log as Single Meal / Snack</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">+ {editItem.protein}g PRO</span>
                </button>

                {/* Option 2: Start New Stack */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Start a New Morning Stack</span>
                  </div>
                  <input
                    type="text"
                    value={newStackName}
                    onChange={(e) => setNewStackName(e.target.value)}
                    placeholder="Enter stack title (e.g. High Protein Parfait Stack)"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleStartNewStack}
                    className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save New Stack & Publish to Dashboard</span>
                  </button>
                </div>

                {/* Option 3: Add to Existing Stack */}
                {morningStacks.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Add to Existing Morning Stack</span>
                    </div>
                    <select
                      value={targetStackId}
                      onChange={(e) => setTargetStackId(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    >
                      {morningStacks.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} (+{s.protein}g PRO)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddToExistingStack}
                      className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Item into Stack & Log Today</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

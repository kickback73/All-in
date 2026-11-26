// Vercel serverless route: proxies USDA FoodData Central (FDC) & Open Food Facts v2
// with built-in Verified USDA FDC Whole-Food & Branded UPC Reference Catalog.
// Usage:
//   /api/food?q=120g%20cooked%20salmon
//   /api/food?upc=030000010204

const FDC_BASE = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product';

const FN = { p: 1003, f: 1004, c: 1005, fi: 1079, sg: 2000 };
const FM = {
  A: 1106, C: 1162, D: 1114, E: 1109, K: 1185,
  B1: 1165, B2: 1166, B3: 1167, B6: 1175, B12: 1178,
  Fol: 1190, Ca: 1087, Fe: 1089, Mg: 1090, Ka: 1092,
  Zn: 1095, Se: 1103, Na: 1093,
};
const FA = {
  his: 1221, ile: 1212, leu: 1213, lys: 1214,
  thr: 1211, trp: 1210, val: 1219,
};

const r1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

const USDA_DB = [
  { kw: ['salmon', 'sockeye', 'atlantic salmon', 'coho'], n: 'Cooked Atlantic/Sockeye Salmon', defG: 120, k: 182, p: 25.4, c: 0, f: 8.1, fi: 0, w: 0, mi: { A: 58, D: 11, E: 1.1, K: 0.5, B1: 0.23, B2: 0.16, B3: 8, B6: 0.82, B12: 3.05, Fol: 26, Ca: 15, Fe: 0.8, Mg: 37, Ka: 628, Zn: 0.6, Se: 41.4, Na: 56 }, am: { his: 0.75, ile: 1.17, leu: 2.06, lys: 2.33, met: 0.95, phe: 1.68, thr: 1.11, trp: 0.29, val: 1.31 } },
  { kw: ['chicken breast', 'grilled chicken', 'roasted chicken', 'chicken'], n: 'Grilled Chicken Breast', defG: 150, k: 165, p: 31, c: 0, f: 3.6, fi: 0, w: 0, mi: { A: 6, D: 0.1, E: 0.27, K: 0.3, B1: 0.07, B2: 0.11, B3: 13.7, B6: 0.6, B12: 0.34, Fol: 4, Ca: 15, Fe: 1.04, Mg: 29, Ka: 256, Zn: 1, Se: 27.6, Na: 74 }, am: { his: 0.96, ile: 1.64, leu: 2.33, lys: 2.64, met: 1.16, phe: 2.28, thr: 1.31, trp: 0.36, val: 1.54 } },
  { kw: ['turkey breast', 'turkey'], n: 'Roasted Turkey Breast', defG: 150, k: 147, p: 30.1, c: 0, f: 2.1, fi: 0, w: 0, mi: { A: 3, D: 0.2, E: 0.09, B1: 0.05, B2: 0.18, B3: 11.8, B6: 0.8, B12: 0.7, Fol: 7, Ca: 14, Fe: 0.7, Mg: 32, Ka: 249, Zn: 1.7, Se: 30.2, Na: 68 }, am: { his: 0.91, ile: 1.52, leu: 2.34, lys: 2.73, met: 1.15, phe: 2.15, thr: 1.27, trp: 0.35, val: 1.51 } },
  { kw: ['white fish', 'cod', 'halibut', 'tilapia', 'haddock', 'sole'], n: 'Cooked Pacific Cod / White Fish', defG: 170, k: 105, p: 22.8, c: 0, f: 0.9, fi: 0, w: 0, mi: { A: 14, C: 1, D: 1.4, E: 0.8, K: 0.1, B1: 0.09, B2: 0.08, B3: 2.5, B6: 0.28, B12: 1.05, Fol: 8, Ca: 14, Fe: 0.49, Mg: 42, Ka: 516, Zn: 0.58, Se: 37.6, Na: 78 }, am: { his: 0.67, ile: 1.05, leu: 1.86, lys: 2.1, met: 0.92, phe: 1.66, thr: 1, trp: 0.26, val: 1.18 } },
  { kw: ['tuna', 'canned tuna', 'albacore'], n: 'Albacore Tuna in Water', defG: 140, k: 128, p: 23.6, c: 0, f: 2.9, fi: 0, w: 0, mi: { A: 6, D: 2, E: 0.8, B1: 0.03, B2: 0.07, B3: 5.8, B6: 0.22, B12: 1.2, Fol: 4, Ca: 14, Fe: 0.97, Mg: 33, Ka: 237, Zn: 0.48, Se: 65.7, Na: 377 }, am: { his: 0.7, ile: 1.09, leu: 1.92, lys: 2.17, met: 0.95, phe: 1.72, thr: 1.04, trp: 0.26, val: 1.22 } },
  { kw: ['shrimp', 'prawns'], n: 'Cooked Shrimp', defG: 140, k: 99, p: 24, c: 0.2, f: 0.3, fi: 0, w: 0, mi: { A: 54, D: 0.1, E: 2.2, B1: 0.03, B2: 0.03, B3: 2.6, B6: 0.16, B12: 1.66, Fol: 24, Ca: 70, Fe: 0.51, Mg: 39, Ka: 259, Zn: 1.64, Se: 49.5, Na: 119 }, am: { his: 0.49, ile: 1.17, leu: 1.9, lys: 2.07, met: 0.92, phe: 1.82, thr: 0.97, trp: 0.26, val: 1.13 } },
  { kw: ['beef', 'steak', 'sirloin', 'ground beef', 'ribeye', 'flank steak'], n: 'Lean Sirloin Steak, Cooked', defG: 150, k: 206, p: 29.5, c: 0, f: 9.1, fi: 0, w: 0, mi: { E: 0.3, K: 1.5, B1: 0.09, B2: 0.23, B3: 6.9, B6: 0.65, B12: 2.6, Fol: 9, Ca: 18, Fe: 2.6, Mg: 26, Ka: 370, Zn: 5.8, Se: 33, Na: 58 }, am: { his: 0.98, ile: 1.35, leu: 2.35, lys: 2.5, met: 1.08, phe: 2.12, thr: 1.18, trp: 0.32, val: 1.45 } },
  { kw: ['egg white', 'egg whites'], n: 'Liquid Egg Whites', defG: 150, k: 52, p: 10.9, c: 0.7, f: 0.2, fi: 0, w: 0, mi: { B1: 0.01, B2: 0.44, B3: 0.1, B6: 0.01, B12: 0.09, Fol: 4, Ca: 7, Fe: 0.08, Mg: 11, Ka: 163, Zn: 0.03, Se: 20, Na: 166 }, am: { his: 0.29, ile: 0.66, leu: 1.02, lys: 0.81, met: 0.65, phe: 1.14, thr: 0.45, trp: 0.13, val: 0.81 } },
  { kw: ['egg', 'eggs', 'whole egg', 'scrambled eggs', 'boiled egg'], n: 'Whole Egg, Large', defG: 100, unitG: 50, k: 143, p: 12.6, c: 0.7, f: 9.5, fi: 0, w: 0, mi: { A: 160, D: 2, E: 1.05, K: 0.3, B1: 0.04, B2: 0.46, B3: 0.08, B6: 0.17, B12: 0.89, Fol: 47, Ca: 56, Fe: 1.75, Mg: 12, Ka: 138, Zn: 1.3, Se: 30.7, Na: 142 }, am: { his: 0.31, ile: 0.67, leu: 1.09, lys: 0.91, met: 0.65, phe: 1.18, thr: 0.56, trp: 0.17, val: 0.86 } },
  { kw: ['greek yogurt', 'oikos', 'skyr', 'yogurt'], n: '0% Plain Greek Yogurt', defG: 175, k: 59, p: 10.3, c: 3.6, f: 0.4, fi: 0, sg: 3.2, w: 0, mi: { A: 4, C: 0.8, D: 1.2, E: 0.01, K: 0.2, B1: 0.02, B2: 0.28, B3: 0.21, B6: 0.06, B12: 0.75, Fol: 7, Ca: 110, Fe: 0.07, Mg: 11, Ka: 141, Zn: 0.5, Se: 9.7, Na: 36 }, am: { his: 0.29, ile: 0.56, leu: 1.04, lys: 0.89, met: 0.38, phe: 1.02, thr: 0.44, trp: 0.14, val: 0.68 } },
  { kw: ['cottage cheese'], n: 'Low-Fat Cottage Cheese (1%)', defG: 150, k: 72, p: 12.4, c: 2.7, f: 1, fi: 0, sg: 2.7, w: 0, mi: { A: 14, D: 0.1, B1: 0.02, B2: 0.17, B3: 0.13, B6: 0.07, B12: 0.63, Fol: 12, Ca: 61, Fe: 0.14, Mg: 5, Ka: 86, Zn: 0.38, Se: 9, Na: 406 }, am: { his: 0.41, ile: 0.73, leu: 1.27, lys: 1, met: 0.49, phe: 1.34, thr: 0.55, trp: 0.14, val: 0.77 } },
  { kw: ['whey isolate', 'whey protein', 'whey', 'protein powder', 'protein shake'], n: 'Whey Protein Isolate', defG: 30, k: 370, p: 88, c: 2, f: 1, fi: 0, sg: 1, w: 0, mi: { A: 15, B2: 0.4, B6: 0.4, B12: 2.1, Fol: 12, Ca: 450, Fe: 0.9, Mg: 60, Ka: 500, Zn: 1.2, Se: 18, Na: 180 }, am: { his: 1.6, ile: 5.8, leu: 10.5, lys: 8.8, met: 4.1, phe: 5.4, thr: 6.2, trp: 1.7, val: 5.4 } },
  { kw: ['bovine collagen', 'collagen peptides', 'collagen'], n: 'Bovine Collagen Peptides', defG: 14, k: 357, p: 90, c: 0, f: 0, fi: 0, w: 0, mi: { Ca: 30, Fe: 0.4, Se: 2, Ka: 10, Na: 70 }, am: { his: 1, ile: 1.4, leu: 2.7, lys: 3.6, met: 0.9, phe: 2.1, thr: 1.8, trp: 0, val: 2.4 } },
  { kw: ['organika electrolyte', 'organika', 'electrolyte packet', 'electrolytes'], n: 'Organika Electrolytes Packet', defG: 6, k: 0, p: 0, c: 0, f: 0, fi: 0, w: 0, mi: { C: 1000, B6: 3.5, B12: 8, Ca: 750, Mg: 1000, Zn: 5, Ka: 3333, Na: 7333 }, am: {} },
  { kw: ['creatine monohydrate', 'creatine'], n: 'Creatine Monohydrate', defG: 5, k: 0, p: 0, c: 0, f: 0, fi: 0, w: 0, mi: {}, am: {} },
  { kw: ['oats', 'oatmeal', 'rolled oats', 'steel cut oats'], n: 'Whole Grain Rolled Oats (Dry)', defG: 80, k: 389, p: 16.9, c: 66.3, f: 6.9, fi: 10.6, w: 0, mi: { E: 0.42, K: 2, B1: 0.76, B2: 0.14, B3: 0.96, B6: 0.12, Fol: 56, Ca: 54, Fe: 4.7, Mg: 177, Ka: 429, Zn: 4, Se: 28.9, Na: 2 }, am: { his: 0.41, ile: 0.69, leu: 1.28, lys: 0.7, met: 0.72, phe: 1.47, thr: 0.58, trp: 0.23, val: 0.94 } },
  { kw: ['rice', 'jasmine rice', 'brown rice', 'white rice', 'basmati'], n: 'Cooked Jasmine / Brown Rice', defG: 150, k: 130, p: 2.7, c: 28.2, f: 0.3, fi: 1.8, w: 0, mi: { E: 0.1, K: 0.6, B1: 0.16, B2: 0.01, B3: 1.5, B6: 0.15, Fol: 9, Ca: 10, Fe: 0.5, Mg: 39, Ka: 86, Zn: 0.6, Se: 9.8, Na: 4 }, am: { his: 0.07, ile: 0.12, leu: 0.22, lys: 0.1, met: 0.11, phe: 0.24, thr: 0.1, trp: 0.03, val: 0.16 } },
  { kw: ['quinoa'], n: 'Cooked Quinoa', defG: 150, k: 120, p: 4.4, c: 21.3, f: 1.9, fi: 2.8, w: 0, mi: { E: 0.63, B1: 0.11, B2: 0.11, B3: 0.41, B6: 0.12, Fol: 42, Ca: 17, Fe: 1.49, Mg: 64, Ka: 172, Zn: 1.09, Se: 2.8, Na: 7 }, am: { his: 0.13, ile: 0.16, leu: 0.26, lys: 0.24, met: 0.16, phe: 0.27, thr: 0.13, trp: 0.05, val: 0.19 } },
  { kw: ['sweet potato', 'yam'], n: 'Baked Sweet Potato', defG: 150, k: 90, p: 2, c: 20.7, f: 0.15, fi: 3.3, sg: 4.2, w: 0, mi: { A: 961, C: 19.6, E: 0.71, K: 2.3, B1: 0.11, B2: 0.11, B3: 1.49, B6: 0.29, Fol: 6, Ca: 38, Fe: 0.69, Mg: 27, Ka: 475, Zn: 0.32, Se: 0.2, Na: 36 }, am: { his: 0.04, ile: 0.07, leu: 0.12, lys: 0.08, met: 0.06, phe: 0.16, thr: 0.11, trp: 0.04, val: 0.11 } },
  { kw: ['potato', 'baked potato', 'potatoes'], n: 'Baked Russet Potato', defG: 170, k: 93, p: 2.5, c: 21.2, f: 0.13, fi: 2.2, sg: 0.8, w: 0, mi: { C: 9.6, E: 0.04, K: 2, B1: 0.06, B2: 0.05, B3: 1.4, B6: 0.31, Fol: 28, Ca: 15, Fe: 1.08, Mg: 28, Ka: 535, Zn: 0.36, Se: 0.4, Na: 10 }, am: { his: 0.05, ile: 0.1, leu: 0.15, lys: 0.15, met: 0.07, phe: 0.2, thr: 0.09, trp: 0.04, val: 0.14 } },
  { kw: ['broccoli', 'steamed broccoli'], n: 'Steamed Broccoli', defG: 150, k: 35, p: 2.4, c: 7.2, f: 0.4, fi: 3.3, sg: 1.7, w: 0, mi: { A: 77, C: 64.9, E: 1.45, K: 141, B1: 0.06, B2: 0.12, B3: 0.55, B6: 0.2, Fol: 108, Ca: 40, Fe: 0.67, Mg: 21, Ka: 293, Zn: 0.45, Se: 1.6, Na: 41 }, am: { his: 0.06, ile: 0.08, leu: 0.13, lys: 0.14, met: 0.07, phe: 0.18, thr: 0.09, trp: 0.03, val: 0.13 } },
  { kw: ['spinach', 'kale', 'leafy greens', 'greens', 'asparagus', 'salad'], n: 'Leafy Spinach & Greens', defG: 100, k: 23, p: 2.9, c: 3.6, f: 0.4, fi: 2.2, sg: 0.4, w: 0, mi: { A: 469, C: 28.1, E: 2.03, K: 483, B1: 0.08, B2: 0.19, B3: 0.72, B6: 0.2, Fol: 194, Ca: 99, Fe: 2.71, Mg: 79, Ka: 558, Zn: 0.53, Se: 1, Na: 79 }, am: { his: 0.06, ile: 0.15, leu: 0.22, lys: 0.17, met: 0.09, phe: 0.24, thr: 0.12, trp: 0.04, val: 0.16 } },
  { kw: ['avocado', 'guacamole'], n: 'Fresh Avocado', defG: 100, k: 160, p: 2, c: 8.5, f: 14.7, fi: 6.7, sg: 0.7, w: 0, mi: { A: 7, C: 10, E: 2.07, K: 21, B1: 0.07, B2: 0.13, B3: 1.74, B6: 0.26, Fol: 81, Ca: 12, Fe: 0.55, Mg: 29, Ka: 485, Zn: 0.64, Se: 0.4, Na: 7 }, am: { his: 0.05, ile: 0.08, leu: 0.14, lys: 0.13, met: 0.07, phe: 0.15, thr: 0.07, trp: 0.03, val: 0.11 } },
  { kw: ['banana', 'bananas'], n: 'Fresh Banana', defG: 118, unitG: 118, k: 89, p: 1.1, c: 22.8, f: 0.3, fi: 2.6, sg: 12.2, w: 0, mi: { A: 3, C: 8.7, E: 0.1, K: 0.5, B1: 0.03, B2: 0.07, B3: 0.67, B6: 0.37, Fol: 20, Ca: 5, Fe: 0.26, Mg: 27, Ka: 358, Zn: 0.15, Se: 1, Na: 1 }, am: { his: 0.08, ile: 0.03, leu: 0.07, lys: 0.05, met: 0.02, phe: 0.06, thr: 0.03, trp: 0.01, val: 0.05 } },
  { kw: ['blueberries', 'berries', 'strawberries', 'raspberries', 'blackberries'], n: 'Fresh Wild Blueberries', defG: 100, k: 57, p: 0.7, c: 14.5, f: 0.3, fi: 2.4, sg: 10, w: 0, mi: { A: 3, C: 9.7, E: 0.57, K: 19.3, B1: 0.04, B2: 0.04, B3: 0.42, B6: 0.05, Fol: 6, Ca: 6, Fe: 0.28, Mg: 6, Ka: 77, Zn: 0.16, Se: 0.1, Na: 1 }, am: { his: 0.01, ile: 0.02, leu: 0.04, lys: 0.01, met: 0.02, phe: 0.04, thr: 0.02, trp: 0, val: 0.03 } },
  { kw: ['apple', 'apples'], n: 'Fresh Apple', defG: 182, unitG: 182, k: 52, p: 0.3, c: 13.8, f: 0.2, fi: 2.4, sg: 10.4, w: 0, mi: { A: 3, C: 4.6, E: 0.18, K: 2.2, B1: 0.02, B2: 0.03, B3: 0.09, B6: 0.04, Fol: 3, Ca: 6, Fe: 0.12, Mg: 5, Ka: 107, Zn: 0.04, Se: 0, Na: 1 }, am: {} },
  { kw: ['almonds', 'walnuts', 'nuts', 'cashews', 'pecans'], n: 'Raw Whole Almonds', defG: 30, k: 579, p: 21.2, c: 21.6, f: 49.9, fi: 12.5, sg: 4.4, w: 0, mi: { E: 25.63, B1: 0.21, B2: 1.14, B3: 3.62, B6: 0.14, Fol: 44, Ca: 269, Fe: 3.71, Mg: 270, Ka: 733, Zn: 3.1, Se: 4.1, Na: 1 }, am: { his: 0.54, ile: 0.75, leu: 1.47, lys: 0.57, met: 0.37, phe: 1.58, thr: 0.6, trp: 0.21, val: 0.86 } },
  { kw: ['peanut butter', 'almond butter'], n: 'Natural Peanut Butter', defG: 32, k: 588, p: 25.1, c: 20, f: 50, fi: 6, sg: 9.2, w: 0, mi: { E: 9.1, B1: 0.15, B2: 0.19, B3: 13.1, B6: 0.44, Fol: 87, Ca: 49, Fe: 1.7, Mg: 168, Ka: 558, Zn: 2.5, Se: 4.1, Na: 17 }, am: { his: 0.63, ile: 0.88, leu: 1.62, lys: 0.9, met: 0.64, phe: 2.28, thr: 0.86, trp: 0.24, val: 1.05 } },
  { kw: ['olive oil', 'extra virgin olive oil', 'evoo', 'avocado oil', 'mct oil'], n: 'Extra Virgin Olive Oil', defG: 14, k: 884, p: 0, c: 0, f: 100, fi: 0, w: 0, mi: { E: 14.35, K: 60.2, Ca: 1, Fe: 0.56, Ka: 1, Na: 2 }, am: {} },
  { kw: ['black coffee', 'brewed coffee', 'coffee', 'americano', 'espresso'], n: 'Brewed Black Coffee', defG: 240, k: 1, p: 0.12, c: 0, f: 0, fi: 0, w: 99, mi: { E: 0.01, K: 0.1, B2: 0.08, B3: 0.19, B6: 0.01, Fol: 2, Ca: 2, Fe: 0.01, Mg: 3, Ka: 49, Zn: 0.02, Na: 2 }, am: {} },
  { kw: ['green tea', 'black tea', 'tea', 'matcha'], n: 'Brewed Green / Black Tea', defG: 240, k: 1, p: 0.1, c: 0, f: 0, fi: 0, w: 99, mi: { C: 0.3, B6: 0.01, Fol: 5, Fe: 0.02, Mg: 2, Ka: 18, Zn: 0.01, Na: 1 }, am: {} },
  { kw: ['water', 'filtered water', 'sparkling water'], n: 'Filtered Water', defG: 500, k: 0, p: 0, c: 0, f: 0, fi: 0, w: 100, mi: { Ca: 3, Mg: 1, Na: 2 }, am: {} },
];

function scaleUsdaEntry(entry, grams) {
  const f = grams / 100;
  const mi = {};
  const am = {};
  for (const k in entry.mi) mi[k] = r1(entry.mi[k] * f);
  for (const k in entry.am) am[k] = r1(entry.am[k] * f);
  return {
    n: `${entry.n} (${grams}${entry.w >= 90 ? 'ml' : 'g'})`,
    servingGrams: grams,
    source: 'USDA FoodData Central Verified',
    k: r1(entry.k * f),
    p: r1(entry.p * f),
    c: r1(entry.c * f),
    f: r1(entry.f * f),
    fi: r1(entry.fi * f),
    sg: r1((entry.sg || 0) * f),
    w: entry.w >= 90 ? Math.round(grams * (entry.w / 100)) : 0,
    mi,
    am,
  };
}

function parsePortionGrams(text = '', defaultGrams = 100) {
  const s = String(text || '').toLowerCase();
  const m = s.match(/(\d+(?:\.\d+)?)\s*(grams?|g|oz|ounces?|kg|lb|ml|l|cups?|tbsp|tablespoons?|tsp|teaspoons?|scoops?|packets?)\b/i);
  if (!m) return defaultGrams;
  const val = parseFloat(m[1]) || 1;
  const u = m[2].toLowerCase();
  if (u.startsWith('o')) return Math.round(val * 28.35);
  if (u === 'kg' || u === 'l') return Math.round(val * 1000);
  if (u === 'lb') return Math.round(val * 453.6);
  if (u.startsWith('cup')) return Math.round(val * 240);
  if (u.startsWith('tbsp') || u.startsWith('tablespoon')) return Math.round(val * 14);
  if (u.startsWith('tsp') || u.startsWith('teaspoon')) return Math.round(val * 5);
  if (u.startsWith('scoop')) return Math.round(val * 30);
  if (u.startsWith('packet')) return Math.round(val * 6);
  return Math.round(val);
}

function estimateAminosFromProtein(pGrams) {
  const p = Number(pGrams) || 0;
  if (p <= 0) return {};
  return {
    his: r1(p * 0.027),
    ile: r1(p * 0.048),
    leu: r1(p * 0.082),
    lys: r1(p * 0.076),
    met: r1(p * 0.028),
    phe: r1(p * 0.068),
    thr: r1(p * 0.043),
    trp: r1(p * 0.012),
    val: r1(p * 0.054),
  };
}

const VERIFIED_UPCS = {
  '056800432110': () => ({ ...scaleUsdaEntry(USDA_DB.find((x) => x.kw[0] === 'organika electrolyte'), 6), n: 'Organika Electrolytes + Enhanced Salts (1 packet, 6g)' }),
  '068100084245': () => ({ ...scaleUsdaEntry(USDA_DB.find((x) => x.kw[0] === 'greek yogurt'), 175), n: 'Oikos 0% Plain Greek Yogurt (175g)' }),
  '096619321001': () => ({ ...scaleUsdaEntry(USDA_DB.find((x) => x.kw[0] === 'egg white'), 150), n: 'Kirkland 100% Liquid Egg Whites (150g)' }),
  '850004607024': () => ({ ...scaleUsdaEntry(USDA_DB.find((x) => x.kw[0] === 'bovine collagen'), 14), n: 'Vital Proteins Bovine Collagen Peptides (14g)' }),
  '811620020258': () => ({ n: 'Fairlife Core Power Elite 42g Protein Shake (414ml)', servingGrams: 414, source: 'Verified Manufacturer Label', k: 230, p: 42, c: 8, f: 3.5, fi: 1, sg: 7, w: 360, mi: { A: 225, C: 2, D: 5, Ca: 900, Fe: 0.6, Mg: 50, Ka: 700, Zn: 1.8, Se: 22, Na: 260, B12: 2.4, B6: 0.4 }, am: estimateAminosFromProtein(42) }),
  '030000010204': () => ({ ...scaleUsdaEntry(USDA_DB.find((x) => x.kw[0] === 'oats'), 40), n: 'Quaker Old Fashioned Rolled Oats (40g)', k: 150, p: 5, c: 27, f: 2.5, fi: 4, sg: 1 }),
  '041383090709': () => ({ ...scaleUsdaEntry(USDA_DB.find((x) => x.kw[0] === 'olive oil'), 14), n: 'Bertolli Extra Virgin Olive Oil (1 tbsp, 14g)' }),
  '3017620422003': () => ({ n: 'Ferrero Nutella Hazelnut Spread (37g)', servingGrams: 37, source: 'Verified Manufacturer Label', k: 200, p: 2, c: 21, f: 11, fi: 1, sg: 21, w: 0, mi: { E: 1.8, Ca: 40, Fe: 0.7, Mg: 24, Ka: 150, Na: 15 }, am: estimateAminosFromProtein(2) }),
  '4011': () => ({ ...scaleUsdaEntry(USDA_DB.find((x) => x.kw[0] === 'banana'), 118), n: 'Fresh Cavendish Banana (118g)' }),
};

function convertOffMicro(nutriments, offKey, targetUnit, scaleFactor) {
  const raw100 = nutriments[`${offKey}_100g`];
  const rawSrv = nutriments[`${offKey}_serving`];
  const unit = (nutriments[`${offKey}_unit`] || 'g').toLowerCase();
  let valInGrams;
  if (raw100 !== undefined && raw100 !== null && raw100 !== '') {
    valInGrams = Number(raw100) * scaleFactor;
  } else if (rawSrv !== undefined && rawSrv !== null && rawSrv !== '') {
    valInGrams = Number(rawSrv);
  } else {
    return 0;
  }
  if (!Number.isFinite(valInGrams) || valInGrams <= 0) return 0;

  if (targetUnit === 'mg') {
    if (unit === 'g' || valInGrams < 10) return r1(valInGrams * 1000);
    return r1(valInGrams);
  }
  if (targetUnit === 'mcg') {
    if (unit === 'g' || valInGrams < 0.1) return r1(valInGrams * 1e6);
    if (unit === 'mg' || valInGrams < 10) return r1(valInGrams * 1000);
    return r1(valInGrams);
  }
  return r1(valInGrams);
}

function mapFdcFood(f, grams = 100) {
  const n = {};
  (f.foodNutrients || []).forEach((x) => {
    const id = x.nutrientId || (x.nutrient && x.nutrient.id);
    const val = x.value ?? x.amount;
    if (id && val !== undefined) n[id] = Number(val);
  });
  const v = (id) => ((n[id] || 0) * grams) / 100;
  const p = r1(v(FN.p));
  const fFat = r1(v(FN.f));
  const c = r1(v(FN.c));
  const fi = r1(v(FN.fi));
  const sg = r1(v(FN.sg));
  const kcal = r1(v(1008) || v(2047) || v(2048) || (p * 4 + c * 4 + fFat * 9));
  const mi = {};
  for (const k in FM) {
    const val = r1(v(FM[k]));
    if (val > 0) mi[k] = val;
  }
  const am = {};
  for (const k in FA) {
    const val = r1(v(FA[k]) / 1000);
    if (val > 0) am[k] = val;
  }
  const metVal = r1((v(1215) + v(1216)) / 1000);
  const pheVal = r1((v(1217) + v(1218)) / 1000);
  if (metVal > 0) am.met = metVal;
  if (pheVal > 0) am.phe = pheVal;
  if (!Object.keys(am).length && p > 0) {
    Object.assign(am, estimateAminosFromProtein(p));
  }
  return {
    n: `${f.description} (${grams}g)`,
    servingGrams: grams,
    source: `USDA FDC #${f.fdcId}`,
    k: kcal,
    p,
    c,
    f: fFat,
    fi,
    sg,
    w: r1(v(1051)),
    mi,
    am,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q, upc, key } = req.query || {};
  const apiKey = key || process.env.USDA_API_KEY || 'DEMO_KEY';

  try {
    if (upc) {
      const cleanUpc = String(upc).trim();
      const codesToTry = [cleanUpc];
      if (cleanUpc.length === 12) codesToTry.push('0' + cleanUpc);
      if (cleanUpc.length === 13 && cleanUpc.startsWith('0')) codesToTry.push(cleanUpc.slice(1));

      for (const code of codesToTry) {
        if (VERIFIED_UPCS[code]) {
          res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
          return res.status(200).json({ upc: cleanUpc, ...VERIFIED_UPCS[code]() });
        }
      }

      for (const code of codesToTry) {
        const offRes = await fetch(`${OFF_BASE}/${encodeURIComponent(code)}.json`, {
          headers: { 'User-Agent': 'AllInHealthSuite/4.0 (https://all-in.vercel.app)' },
        });
        if (offRes.ok) {
          const data = await offRes.json();
          if (data && data.status === 1 && data.product) {
            const prod = data.product;
            const nut = prod.nutriments || {};
            const srvText = prod.serving_size || '';
            const parenMatch = srvText.match(/\((\d+(?:\.\d+)?)\s*(?:g|ml)\)/i);
            const srvGrams = parenMatch
              ? parseFloat(parenMatch[1])
              : parsePortionGrams(srvText, Number(prod.serving_quantity) || 100);
            const factor = srvGrams / 100;
            const useSrv =
              nut.proteins_serving !== undefined &&
              nut.carbohydrates_serving !== undefined &&
              nut.fat_serving !== undefined;

            const p = r1(useSrv ? nut.proteins_serving : (Number(nut.proteins_100g) || 0) * factor);
            const c = r1(useSrv ? nut.carbohydrates_serving : (Number(nut.carbohydrates_100g) || 0) * factor);
            const f = r1(useSrv ? nut.fat_serving : (Number(nut.fat_100g) || 0) * factor);
            const fi = r1(
              useSrv && nut.fiber_serving !== undefined
                ? nut.fiber_serving
                : (Number(nut.fiber_100g) || 0) * factor
            );
            const sg = r1(
              useSrv && nut.sugars_serving !== undefined
                ? nut.sugars_serving
                : (Number(nut.sugars_100g) || 0) * factor
            );
            const k = Math.round(
              (useSrv && nut['energy-kcal_serving'] !== undefined
                ? Number(nut['energy-kcal_serving'])
                : (Number(nut['energy-kcal_100g']) || 0) * factor) ||
                p * 4 + c * 4 + f * 9
            );

            const mi = {
              A: convertOffMicro(nut, 'vitamin-a', 'mcg', factor),
              C: convertOffMicro(nut, 'vitamin-c', 'mg', factor),
              D: convertOffMicro(nut, 'vitamin-d', 'mcg', factor),
              E: convertOffMicro(nut, 'vitamin-e', 'mg', factor),
              K: convertOffMicro(nut, 'vitamin-k', 'mcg', factor),
              B1: convertOffMicro(nut, 'vitamin-b1', 'mg', factor),
              B2: convertOffMicro(nut, 'vitamin-b2', 'mg', factor),
              B3: convertOffMicro(nut, 'vitamin-pp', 'mg', factor),
              B6: convertOffMicro(nut, 'vitamin-b6', 'mg', factor),
              B12: convertOffMicro(nut, 'vitamin-b12', 'mcg', factor),
              Fol: convertOffMicro(nut, 'folates', 'mcg', factor),
              Ca: convertOffMicro(nut, 'calcium', 'mg', factor),
              Fe: convertOffMicro(nut, 'iron', 'mg', factor),
              Mg: convertOffMicro(nut, 'magnesium', 'mg', factor),
              Ka: convertOffMicro(nut, 'potassium', 'mg', factor),
              Zn: convertOffMicro(nut, 'zinc', 'mg', factor),
              Se: convertOffMicro(nut, 'selenium', 'mcg', factor),
              Na:
                convertOffMicro(nut, 'sodium', 'mg', factor) ||
                r1(convertOffMicro(nut, 'salt', 'mg', factor) / 2.5),
            };
            Object.keys(mi).forEach((key) => {
              if (!mi[key]) delete mi[key];
            });

            const brand = (prod.brands || '').split(',')[0].trim();
            const baseName = prod.product_name || prod.product_name_en || `UPC ${cleanUpc}`;
            const fullTitle =
              brand && !baseName.toLowerCase().includes(brand.toLowerCase())
                ? `${brand} ${baseName}`
                : baseName;
            const match = USDA_DB.find((e) => e.kw.some((w) => fullTitle.toLowerCase().includes(w)));
            if (match) {
              const sc = scaleUsdaEntry(match, srvGrams);
              for (const mk in sc.mi) if (!mi[mk]) mi[mk] = sc.mi[mk];
            }
            const labelPortion = srvText || `${srvGrams}g`;

            res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
            return res.status(200).json({
              upc: cleanUpc,
              n: `${fullTitle} (${labelPortion})`,
              servingGrams: srvGrams,
              source: 'Open Food Facts Verified Label',
              k,
              p,
              c,
              f,
              fi,
              sg,
              w: 0,
              mi,
              am: estimateAminosFromProtein(p),
            });
          }
        }
      }

      const fdcRes = await fetch(
        `${FDC_BASE}?query=${encodeURIComponent(cleanUpc)}&dataType=Branded&pageSize=3&api_key=${encodeURIComponent(apiKey)}`
      );
      if (fdcRes.ok) {
        const fdcData = await fdcRes.json();
        const f = (fdcData.foods || [])[0];
        if (f) {
          const grams = Number(f.servingSize) || 100;
          res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
          return res.status(200).json({
            upc: cleanUpc,
            ...mapFdcFood(f, grams),
          });
        }
      }
      return res.status(404).json({ error: 'Barcode not found' });
    }

    if (!q) return res.status(400).json({ error: 'Missing q or upc parameter' });
    const lowerQ = String(q).toLowerCase().trim();
    const match = USDA_DB.find((e) => e.kw.some((w) => lowerQ.includes(w)));
    if (match) {
      const grams = parsePortionGrams(lowerQ, match.defG);
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
      return res.status(200).json(scaleUsdaEntry(match, grams));
    }

    const grams = parsePortionGrams(q, 100);
    const cleanQuery = String(q)
      .replace(/(\d+(?:\.\d+)?)\s*(grams?|g|oz|ounces?|kg|lb|ml|l|cups?|tbsp|tablespoons?|tsp|teaspoons?|scoops?|packets?)\b/gi, '')
      .trim() || q;

    const r = await fetch(
      `${FDC_BASE}?query=${encodeURIComponent(cleanQuery)}&dataType=Foundation,SR%20Legacy&pageSize=8&api_key=${encodeURIComponent(apiKey)}`
    );
    if (!r.ok) return res.status(502).json({ error: 'USDA FDC search ' + r.status });
    const data = await r.json();
    const foods = data.foods || [];
    const wantOil = /\boil\b/i.test(cleanQuery);
    const best =
      foods.find((f) => {
        const desc = (f.description || '').toLowerCase();
        if (!wantOil && desc.startsWith('fish oil')) return false;
        if (desc.includes('babyfood')) return false;
        return true;
      }) || foods[0];

    if (!best) return res.status(404).json({ error: 'No matching food found' });
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json(mapFdcFood(best, grams));
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}

// Local JSON barcode database for instant offline UPC barcode lookups
// Optimized for Canadian high-protein vegetarian and retatrutide-tailored nutritional staples

export const LOCAL_BARCODE_DATABASE = {
  // Kirkland Signature 100% Liquid Egg Whites
  '096619172403': {
    name: 'Kirkland Liquid Egg Whites',
    brand: 'Kirkland Signature',
    servingSize: '100g (approx. 3 egg whites)',
    calories: 50,
    protein: 11,
    carbs: 1,
    fat: 0,
    leucine: 0.95, // in grams
    methionine: 0.38,
    category: 'Vegetarian Protein',
    proteinDensity: 88, // % calories from protein
    flavour: 'Unflavoured Nature',
    isVegetarian: true,
    isPescatarian: true,
    barcode: '096619172403'
  },

  // Oikos 0% M.F. Plain Greek Yogurt (High Protein)
  '056800742132': {
    name: 'Oikos 0% Plain Greek Yogurt',
    brand: 'Danone Oikos',
    servingSize: '175g',
    calories: 100,
    protein: 19,
    carbs: 6,
    fat: 0,
    leucine: 1.82,
    methionine: 0.49,
    category: 'Vegetarian Dairy',
    proteinDensity: 76,
    flavour: 'Natural Tart Plain',
    isVegetarian: true,
    isPescatarian: true,
    barcode: '056800742132'
  },

  // Sunrise Soya Foods Organic Extra Firm Tofu
  '068307000109': {
    name: 'Organic Extra Firm Tofu',
    brand: 'Sunrise Soya',
    servingSize: '100g',
    calories: 90,
    protein: 10,
    carbs: 2,
    fat: 5,
    leucine: 0.78,
    methionine: 0.13, // Naturally modest in methionine!
    category: 'Plant Protein',
    proteinDensity: 44,
    flavour: 'Subtle Soy Earthy',
    isVegetarian: true,
    isPescatarian: true,
    barcode: '068307000109'
  },

  // Lightlife Organic Original Tempeh
  '074982000547': {
    name: 'Organic Original Tempeh',
    brand: 'Lightlife',
    servingSize: '100g',
    calories: 160,
    protein: 18,
    carbs: 9,
    fat: 5,
    leucine: 1.35,
    methionine: 0.22,
    category: 'Cultured Plant Protein',
    proteinDensity: 45,
    flavour: 'Nutty Fermented Savoury',
    isVegetarian: true,
    isPescatarian: true,
    barcode: '074982000547'
  },

  // Fairlife Core Power Elite High Protein Shake 42g
  '811620021670': {
    name: 'Core Power Elite 42g Protein Shake',
    brand: 'Fairlife',
    servingSize: '414ml bottle',
    calories: 230,
    protein: 42,
    carbs: 8,
    fat: 3.5,
    leucine: 4.1,
    methionine: 1.05,
    category: 'Lactose-Free Dairy',
    proteinDensity: 73,
    flavour: 'Smooth Vanilla Cream',
    isVegetarian: true,
    isPescatarian: true,
    barcode: '811620021670'
  },

  // Vital Proteins Wild Marine Collagen Peptides
  '850232005469': {
    name: 'Wild Marine Collagen Peptides',
    brand: 'Vital Proteins',
    servingSize: '12g scoop',
    calories: 45,
    protein: 11,
    carbs: 0,
    fat: 0,
    leucine: 0.32, // Very low leucine!
    methionine: 0.14, // Extremely low methionine - ideal for balanced mTOR
    category: 'Marine Peptides',
    proteinDensity: 98,
    flavour: 'Neutral Pure',
    isVegetarian: false,
    isPescatarian: true,
    barcode: '850232005469'
  },

  // Upton's Naturals Traditional Seitan Strips
  '025583007123': {
    name: 'Traditional Wheat Seitan Strips',
    brand: 'Upton’s Naturals',
    servingSize: '100g',
    calories: 120,
    protein: 24,
    carbs: 4,
    fat: 1.5,
    leucine: 1.68,
    methionine: 0.35,
    category: 'High-Density Plant Protein',
    proteinDensity: 80,
    flavour: 'Umami Herb & Soy',
    isVegetarian: true,
    isPescatarian: true,
    barcode: '025583007123'
  },

  // High Liner Wild Pacific Cod Fillets
  '071757053128': {
    name: 'Wild Pacific Cod Skinless Fillets',
    brand: 'High Liner',
    servingSize: '140g fillet',
    calories: 110,
    protein: 24,
    carbs: 0,
    fat: 1,
    leucine: 1.95,
    methionine: 0.68,
    category: 'Pescatarian White Fish',
    proteinDensity: 87,
    flavour: 'Clean Mild Flaky',
    isVegetarian: false,
    isPescatarian: true,
    barcode: '071757053128'
  },

  // Manitoba Harvest Organic Hemp Hearts
  '697658201018': {
    name: 'Organic Shelled Hemp Hearts',
    brand: 'Manitoba Harvest',
    servingSize: '30g (3 tbsp)',
    calories: 180,
    protein: 10,
    carbs: 1,
    fat: 15,
    leucine: 0.68,
    methionine: 0.23,
    category: 'Superfood Seeds',
    proteinDensity: 22,
    flavour: 'Rich Nutty Raw',
    isVegetarian: true,
    isPescatarian: true,
    barcode: '697658201018'
  },

  // Silk Unsweetened Organic Soy Milk
  '025293000987': {
    name: 'Organic Unsweetened Soy Beverage',
    brand: 'Silk Canada',
    servingSize: '250ml cup',
    calories: 80,
    protein: 8,
    carbs: 3,
    fat: 4,
    leucine: 0.62,
    methionine: 0.11,
    category: 'Plant Milk',
    proteinDensity: 40,
    flavour: 'Smooth Velvet',
    isVegetarian: true,
    isPescatarian: true,
    barcode: '025293000987'
  },

  // Bob's Red Mill Large Flake Nutritional Yeast
  '039978001856': {
    name: 'Nutritional Yeast Fortified Flakes',
    brand: 'Bob’s Red Mill',
    servingSize: '15g (2 tbsp)',
    calories: 60,
    protein: 8,
    carbs: 5,
    fat: 0.5,
    leucine: 0.61,
    methionine: 0.15,
    category: 'Fortified Savoury Flakes',
    proteinDensity: 53,
    flavour: 'Sharp Cheesy Umami',
    isVegetarian: true,
    isPescatarian: true,
    barcode: '039978001856'
  }
};

// Initial Fridge & Pantry Stock inventory for instant matching
export const INITIAL_PANTRY_STOCK = [
  {
    id: 'stock-1',
    barcode: '056800742132',
    name: 'Oikos 0% Plain Greek Yogurt',
    brand: 'Danone Oikos',
    quantity: 2,
    unit: 'tubs (750g ea)',
    inStock: true,
    category: 'Dairy',
    daysRemaining: 6
  },
  {
    id: 'stock-2',
    barcode: '096619172403',
    name: 'Kirkland Liquid Egg Whites',
    brand: 'Kirkland Signature',
    quantity: 3,
    unit: 'cartons (500g ea)',
    inStock: true,
    category: 'Eggs & Whites',
    daysRemaining: 12
  },
  {
    id: 'stock-3',
    barcode: '068307000109',
    name: 'Organic Extra Firm Tofu',
    brand: 'Sunrise Soya',
    quantity: 2,
    unit: 'blocks (454g ea)',
    inStock: true,
    category: 'Soy & Legumes',
    daysRemaining: 8
  },
  {
    id: 'stock-4',
    barcode: '850232005469',
    name: 'Wild Marine Collagen Peptides',
    brand: 'Vital Proteins',
    quantity: 1,
    unit: 'canister (390g)',
    inStock: true,
    category: 'Supplements',
    daysRemaining: 24
  },
  {
    id: 'stock-5',
    barcode: '025583007123',
    name: 'Traditional Wheat Seitan Strips',
    brand: 'Upton’s Naturals',
    quantity: 1,
    unit: 'package (227g)',
    inStock: true,
    category: 'Plant Protein',
    daysRemaining: 5
  },
  {
    id: 'stock-6',
    barcode: '071757053128',
    name: 'Wild Pacific Cod Skinless Fillets',
    brand: 'High Liner',
    quantity: 4,
    unit: 'frozen fillets',
    inStock: true,
    category: 'Pescatarian',
    daysRemaining: 45
  },
  {
    id: 'stock-7',
    barcode: '697658201018',
    name: 'Organic Shelled Hemp Hearts',
    brand: 'Manitoba Harvest',
    quantity: 1,
    unit: 'bag (454g)',
    inStock: true,
    category: 'Seeds & Superfoods',
    daysRemaining: 30
  },
  {
    id: 'stock-8',
    barcode: '039978001856',
    name: 'Nutritional Yeast Fortified Flakes',
    brand: 'Bob’s Red Mill',
    quantity: 1,
    unit: 'bag (226g)',
    inStock: true,
    category: 'Seasoning',
    daysRemaining: 60
  }
];

// Barcode Lookup Service with OpenFoodFacts Fallback
export async function lookupBarcode(barcode) {
  const cleanCode = barcode.trim();
  
  // 1. Direct local lookup
  if (LOCAL_BARCODE_DATABASE[cleanCode]) {
    return {
      found: true,
      source: 'local_database',
      item: LOCAL_BARCODE_DATABASE[cleanCode]
    };
  }

  // 2. Fallback to OpenFoodFacts Canadian/Global API
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${cleanCode}.json`);
    if (!response.ok) throw new Error('Network error querying OpenFoodFacts');
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const nutriments = p.nutriments || {};
      const calories = Math.round(nutriments['energy-kcal_100g'] || (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0));
      const protein = Math.round(nutriments['proteins_100g'] || 0);
      const carbs = Math.round(nutriments['carbohydrates_100g'] || 0);
      const fat = Math.round(nutriments['fat_100g'] || 0);
      
      // Heuristic amino acid estimates based on protein type
      const isDairy = (p.categories_tags || []).some(c => c.includes('dairy') || c.includes('milk') || c.includes('cheese'));
      const isSoy = (p.categories_tags || []).some(c => c.includes('soy') || c.includes('tofu'));
      
      const leucineEst = Number((protein * (isDairy ? 0.095 : isSoy ? 0.078 : 0.08)).toFixed(2));
      const methionineEst = Number((protein * (isDairy ? 0.026 : isSoy ? 0.013 : 0.02)).toFixed(2));
      const proteinCal = protein * 4;
      const proteinDensity = calories > 0 ? Math.min(100, Math.round((proteinCal / calories) * 100)) : 0;

      return {
        found: true,
        source: 'open_food_facts',
        item: {
          name: p.product_name_en || p.product_name || 'Scanned Food Item',
          brand: p.brands || 'Commercial Brand',
          servingSize: p.serving_size || '100g',
          calories,
          protein,
          carbs,
          fat,
          leucine: leucineEst,
          methionine: methionineEst,
          category: 'Grocery Scanned',
          proteinDensity,
          flavour: 'Natural/Standard',
          isVegetarian: !(p.ingredients_analysis_tags || []).includes('en:non-vegetarian'),
          isPescatarian: true,
          barcode: cleanCode
        }
      };
    }
  } catch (err) {
    console.warn('OpenFoodFacts API query failed or timed out:', err);
  }

  return { found: false, barcode: cleanCode };
}

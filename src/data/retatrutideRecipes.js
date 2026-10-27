// Retatrutide-Optimized Recipes with mTOR Pathway Amino Acid Calculations
// Tailored for high-protein vegetarian, pescatarian, and collagen nutrition.
// Balances leucine pulses for lean muscle retention with methionine moderation for indolent NHL remission.

export const RETATRUTIDE_RECIPES = [
  {
    id: 'recipe-1',
    name: 'Whipped Greek Yogurt & Marine Collagen Parfait',
    category: 'Breakfast / Quick Digest',
    prepTimeMinutes: 5,
    calories: 275,
    protein: 42,
    carbs: 14,
    fat: 3,
    leucine: 2.95, // High leucine spike to trigger Muscle Protein Synthesis (MPS)
    methionine: 0.65, // Low methionine burden
    proteinDensity: 61, // 61% of total calories are pure protein!
    digestibleVolume: 'High (Gentle on retatrutide-induced delayed gastric emptying)',
    flavourProfile: 'Velvety vanilla cream with delicate berry tartness',
    requiredStockBarcodes: ['056800742132', '850232005469'],
    ingredients: [
      { name: 'Oikos 0% Plain Greek Yogurt', amount: '220g', barcode: '056800742132' },
      { name: 'Wild Marine Collagen Peptides', amount: '15g', barcode: '850232005469' },
      { name: 'Pure Ceylon Cinnamon & Vanilla Extract', amount: '1 tsp', barcode: null },
      { name: 'Wild Frozen Blueberries (low GI)', amount: '40g', barcode: null },
      { name: 'Shelled Hemp Hearts', amount: '8g', barcode: '697658201018' }
    ],
    instructions: [
      'Whisk Greek yogurt vigorously in a chilled glass bowl until light and aerated.',
      'Gently fold in marine collagen peptides until completely dissolved without graininess.',
      'Dust with Ceylon cinnamon and fold in wild berries and hemp hearts for texture.'
    ],
    mTorGuidance: 'High-leucine morning pulse triggering skeletal muscle protection without overwhelming daily methionine thresholds.'
  },

  {
    id: 'recipe-2',
    name: 'Golden Herb Liquid Egg White & Nutritional Yeast Omelette',
    category: 'Lunch / High Density',
    prepTimeMinutes: 8,
    calories: 290,
    protein: 40,
    carbs: 6,
    fat: 4,
    leucine: 3.10,
    methionine: 0.82,
    proteinDensity: 55,
    digestibleVolume: 'Very High (Feather-light texture, zero heavy oils)',
    flavourProfile: 'Savoury French herbs with rich umami cheddar-like finish',
    requiredStockBarcodes: ['096619172403', '039978001856'],
    ingredients: [
      { name: 'Kirkland Liquid Egg Whites', amount: '300ml', barcode: '096619172403' },
      { name: 'Fortified Nutritional Yeast Flakes', amount: '15g', barcode: '039978001856' },
      { name: 'Baby Spinach (chiffonade)', amount: '30g', barcode: null },
      { name: 'Fresh Chives & Tarragon', amount: '1 tbsp', barcode: null },
      { name: 'Cold-Pressed Avocado Oil Spray', amount: '1 light mist', barcode: null }
    ],
    instructions: [
      'Whisk egg whites with nutritional yeast, chopped fresh tarragon, sea salt, and black pepper.',
      'Heat ceramic non-stick pan over medium-low heat with a minimal spray of avocado oil.',
      'Pour whites, scatter baby spinach, and gently drag cooked ribbons toward the centre.',
      'Fold into a French cylinder while still tender and moist.'
    ],
    mTorGuidance: 'Nutritional yeast provides rich B-complex methylation support while keeping methionine moderate.'
  },

  {
    id: 'recipe-3',
    name: 'Crispy Extra-Firm Tofu & Tempeh Amino Scramble',
    category: 'Dinner / Plant Power',
    prepTimeMinutes: 12,
    calories: 360,
    protein: 38,
    carbs: 12,
    fat: 14,
    leucine: 2.75,
    methionine: 0.48, // Notably low methionine — superior for NHL remission protocols!
    proteinDensity: 42,
    digestibleVolume: 'Moderate (Fermented tempeh enhances GI tolerance)',
    flavourProfile: 'Smoky maple tamari glaze with golden turmeric crust',
    requiredStockBarcodes: ['068307000109', '074982000547'],
    ingredients: [
      { name: 'Sunrise Organic Extra Firm Tofu', amount: '150g', barcode: '068307000109' },
      { name: 'Lightlife Organic Tempeh', amount: '80g', barcode: '074982000547' },
      { name: 'Ground Turmeric & Smoked Paprika', amount: '1 tsp', barcode: null },
      { name: 'Gluten-Free Tamari / Coconut Aminos', amount: '1 tbsp', barcode: null },
      { name: 'Zucchini ribbons', amount: '60g', barcode: null }
    ],
    instructions: [
      'Press and cube extra firm tofu; crumble tempeh into bite-sized morsels.',
      'Dry-toast in skillet for 4 minutes until golden crust develops.',
      'Deglaze skillet with tamari, turmeric, and zucchini ribbons, tossing until glazed.'
    ],
    mTorGuidance: 'Soy and tempeh provide exceptionally low methionine-to-protein ratios, keeping cellular mTOR in a calm, controlled zone.'
  },

  {
    id: 'recipe-4',
    name: 'Steamed Pacific Cod Medallions with Garlic Seitan & Asparagus',
    category: 'Dinner / Pescatarian Calibre',
    prepTimeMinutes: 15,
    calories: 395,
    protein: 52,
    carbs: 11,
    fat: 5,
    leucine: 3.85,
    methionine: 1.12, // Approaching cautionary amber threshold; best on heavy resistance training days
    proteinDensity: 53,
    digestibleVolume: 'High (Tender flaky white fish digests rapidly)',
    flavourProfile: 'Zesty lemon, fresh dill, and savoury seitan garlic crunch',
    requiredStockBarcodes: ['071757053128', '025583007123'],
    ingredients: [
      { name: 'Wild Pacific Cod Fillet', amount: '160g', barcode: '071757053128' },
      { name: 'Upton’s Traditional Seitan Strips', amount: '70g', barcode: '025583007123' },
      { name: 'Fresh Asparagus spears', amount: '80g', barcode: null },
      { name: 'Fresh Lemon Juice & Capers', amount: '1 tbsp', barcode: null },
      { name: 'Chopped Fresh Dill', amount: '1 tbsp', barcode: null }
    ],
    instructions: [
      'Season cod fillet with lemon juice, capers, sea salt, and fresh dill.',
      'Steam over simmering water for 7-8 minutes until opaque and flaky.',
      'Lightly sear seitan strips in a dry pan for 2 minutes to caramelize edges.',
      'Plate together with steamed tender asparagus spears.'
    ],
    mTorGuidance: 'Highest single-meal protein payload. Ideal immediately following intense resistance band workouts.'
  },

  {
    id: 'recipe-5',
    name: 'Glacier Core Power Vanilla & Collagen Recovery Shake',
    category: 'Post-Workout / Liquid',
    prepTimeMinutes: 2,
    calories: 310,
    protein: 53,
    carbs: 8,
    fat: 4,
    leucine: 4.45,
    methionine: 1.18,
    proteinDensity: 68,
    digestibleVolume: 'Effortless (Zero chewing required, avoids retatrutide early fullness)',
    flavourProfile: 'Rich melted Madagascar vanilla milkshake',
    requiredStockBarcodes: ['811620021670', '850232005469'],
    ingredients: [
      { name: 'Fairlife Core Power Elite 42g Shake', amount: '350ml', barcode: '811620021670' },
      { name: 'Wild Marine Collagen Peptides', amount: '12g', barcode: '850232005469' },
      { name: 'Crushed Glacier Ice', amount: '1/2 cup', barcode: null },
      { name: 'Himalayan Pink Salt', amount: '1 pinch', barcode: null }
    ],
    instructions: [
      'Pour chilled Core Power into a shaker cup or bullet blender.',
      'Add marine collagen peptides and pinch of Himalayan pink salt.',
      'Blend with crushed ice on high for 20 seconds until frothy.'
    ],
    mTorGuidance: 'Potent anabolic leucine spike. Count towards daily methionine budget (1.18g / 1.8g daily max).'
  }
];

// Helper to check what recipes can be made from active pantry stock
export function matchRecipesWithPantry(recipes, stockItems) {
  const inStockBarcodes = new Set(
    stockItems.filter(item => item.inStock && item.quantity > 0).map(item => item.barcode)
  );

  return recipes.map(recipe => {
    const required = recipe.requiredStockBarcodes || [];
    const matchedCount = required.filter(code => inStockBarcodes.has(code)).length;
    const isFullyAvailable = required.length > 0 && matchedCount === required.length;
    const missingCount = required.length - matchedCount;

    return {
      ...recipe,
      isFullyAvailable,
      matchedCount,
      missingCount,
      canMakeNow: isFullyAvailable || (required.length === 0)
    };
  }).sort((a, b) => (b.canMakeNow ? 1 : 0) - (a.canMakeNow ? 1 : 0));
}

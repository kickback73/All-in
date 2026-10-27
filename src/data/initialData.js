// Initial data and default state configuration for dk-all-in
// Uses Canadian English spelling and incorporates retatrutide-informed nutritional targets

export const DEFAULT_MORNING_STACKS = [
  {
    id: 'stack-collagen',
    name: 'Marine Collagen & Vit C Matrix',
    subtitle: 'Gut Barrier & Joint Protection',
    icon: 'ShieldCheck',
    badge: 'Core Daily',
    calories: 60,
    protein: 14,
    carbs: 1,
    fat: 0,
    leucine: 0.35,
    methionine: 0.15,
    items: [
      '15g Wild Marine Collagen Peptides (Vital Proteins)',
      '500mg Liposomal Vitamin C',
      '3g Pure L-Glycine',
      '350ml Filtered Water with Lemon'
    ],
    mTorEffect: 'Low mTOR impact; stimulates type I/III collagen synthesis without hyperactivating cellular pathways.'
  },
  {
    id: 'stack-eaa',
    name: 'Fermented EAA & Electrolytes',
    subtitle: 'Muscle Retention & Hydration Pulse',
    icon: 'Zap',
    badge: 'Anabolic Shield',
    calories: 45,
    protein: 10,
    carbs: 0,
    fat: 0,
    leucine: 3.0, // Strategic leucine pulse
    methionine: 0.35,
    items: [
      '10g Fermented Plant EAAs (2:1:1 BCAA base)',
      '600mg Himalayan Pink Salt (Sodium)',
      '300mg Potassium Citrate',
      '150mg Magnesium Bisglycinate Chelate'
    ],
    mTorEffect: 'Sharp leucine trigger to stimulate skeletal muscle protein synthesis while keeping fasting glucose stable.'
  },
  {
    id: 'stack-gut',
    name: 'GLP-1 Gut Soothe & Omega-3',
    subtitle: 'Gastric Comfort & Epithelial Repair',
    icon: 'HeartPulse',
    badge: 'GI Defence',
    calories: 35,
    protein: 5,
    carbs: 1,
    fat: 2,
    leucine: 0.1,
    methionine: 0.05,
    items: [
      '5g Fermented L-Glutamine powder',
      '1200mg Ultra-Pure Wild Fish Oil (EPA/DHA)',
      'Organic Ginger Root extract (100mg)',
      'Full-Spectrum Digestive Plant Enzyme blend'
    ],
    mTorEffect: 'Calms retatrutide-related GI sensitivity and mucosal irritation with neutral cellular growth signals.'
  },
  {
    id: 'stack-mitochondrial',
    name: 'Cellular Longevity & Remission Matrix',
    subtitle: 'Glutathione Synthesis & Autophagy Support',
    icon: 'Sparkles',
    badge: 'NHL Guard',
    calories: 10,
    protein: 2,
    carbs: 0,
    fat: 0,
    leucine: 0.05,
    methionine: 0.02,
    items: [
      '600mg N-Acetyl Cysteine (NAC)',
      '200mg Ubiquinol CoQ10 (Kaneka)',
      '5000 IU Vitamin D3 + 100mcg K2 (MK-7)',
      '500mg Trans-Resveratrol'
    ],
    mTorEffect: 'Enhances intracellular glutathione pools; supports mitochondrial integrity and indolent NHL remission vigilance.'
  }
];

export const DEFAULT_WORKOUT_PRESETS = [
  {
    id: 'preset-core-abwheel',
    name: 'Ab Wheel Core Tension & Midsection Calibre',
    type: 'bodyweight_plyometric',
    focusArea: 'Core, Serratus, Anti-Extension',
    targetReps: '4 sets of 12-15 rollouts',
    tempo: '3 sec eccentric, 1 sec isometric hold',
    requiresWeight: false,
    equipmentType: 'Ab Wheel Rollout Roller',
    notes: 'Maintain neutral spine; squeeze glutes at peak lockout. Zero external weights required.',
    defaultReps: 12,
    defaultSets: 4
  },
  {
    id: 'preset-band-hypertrophy',
    name: 'Heavy Resistance Band Upper Hypertrophy',
    type: 'resistance_band',
    focusArea: 'Chest, Upper Back, Deltoids',
    targetReps: '4 sets of 15-20 reps with progressive loop tension',
    tempo: '2-1-2 smooth cadence',
    requiresWeight: true,
    equipmentType: 'Loop Resistance Bands (Colour-Coded)',
    bandColours: [
      { name: 'Red Loop', tensionLbs: 20 },
      { name: 'Black Band', tensionLbs: 45 },
      { name: 'Purple Power', tensionLbs: 75 }
    ],
    notes: 'Constant peak tension at contraction; ideal for preserving muscle density while on retatrutide.',
    defaultReps: 15,
    defaultSets: 4,
    defaultBand: 'Black Band (45 lbs)'
  },
  {
    id: 'preset-band-legs',
    name: 'Glute & Hamstring Resistance Band Circuit',
    type: 'resistance_band',
    focusArea: 'Gluteus Medius, Biceps Femoris, Quads',
    targetReps: '3 sets of 20 banded monster walks & Romanian deadlifts',
    tempo: 'Controlled 2-0-2',
    requiresWeight: true,
    equipmentType: 'Heavy Fabric Booty Band & 41" Latex Loop',
    bandColours: [
      { name: 'Grey Fabric Band', tensionLbs: 35 },
      { name: 'Black Band', tensionLbs: 50 },
      { name: 'Green Super Band', tensionLbs: 80 }
    ],
    notes: 'Joint-friendly stimulus with high metabolic burn.',
    defaultReps: 20,
    defaultSets: 3,
    defaultBand: 'Grey Fabric Band (35 lbs)'
  },
  {
    id: 'preset-plyo-pushups',
    name: 'Plyometric Clapping & Pike Push-Ups',
    type: 'bodyweight_plyometric',
    focusArea: 'Pectorals, Anterior Deltoids, Triceps',
    targetReps: '4 sets of 8-10 explosive reps',
    tempo: 'Explosive ascent, soft 2-second catch',
    requiresWeight: false,
    equipmentType: 'Bodyweight Floor / Elevated Box',
    notes: 'Pure fast-twitch neuromuscular recruitment without joint impact.',
    defaultReps: 10,
    defaultSets: 4
  }
];

export const DEFAULT_WORKOUT_REMINDERS = [
  {
    id: 'rem-morning',
    title: 'Morning Band Activation & Mobility',
    time: '07:30',
    frequency: 'Daily (Mon-Sun)',
    enabled: true,
    presetId: 'preset-band-hypertrophy'
  },
  {
    id: 'rem-core',
    title: 'Midday Ab Wheel & Trunk Precision',
    time: '12:45',
    frequency: 'Mon, Wed, Fri',
    enabled: true,
    presetId: 'preset-core-abwheel'
  },
  {
    id: 'rem-evening',
    title: 'Evening Glute & Hamstring Band Flush',
    time: '18:15',
    frequency: 'Tue, Thu, Sat',
    enabled: false,
    presetId: 'preset-band-legs'
  }
];

export const DAILY_TARGETS = {
  calories: 1950,
  protein: 165, // grams
  carbs: 140,
  fat: 55,
  waterMl: 3400, // Important for retatrutide hydration & kidney clearance
  steps: 10000,
  activeMinutes: 45,
  leucineTarget: 3.5, // grams minimum for muscle protein synthesis pulse
  methionineSafetyCeiling: 1.8 // grams maximum for cellular mTOR moderation
};

// Seed historical logs for the past 3 days so the history & audit drawer has instant data to display
export function getInitialHistoricalLogs() {
  const now = new Date();
  const formatDay = (daysAgo) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const day1 = formatDay(1); // Yesterday
  const day2 = formatDay(2); // 2 days ago
  const day3 = formatDay(3); // 3 days ago

  return {
    [day1]: {
      date: day1,
      calories: 1890,
      protein: 162,
      carbs: 135,
      fat: 52,
      leucine: 3.6,
      methionine: 1.45,
      waterMl: 3200,
      steps: 10420,
      activeMinutes: 48,
      syncStatus: 'synced',
      isEdited: false,
      lastModified: new Date(Date.now() - 86400000).toISOString(),
      meals: [
        {
          id: 'hist-m1',
          name: 'Morning Marine Collagen Matrix',
          calories: 60,
          protein: 14,
          leucine: 0.35,
          methionine: 0.15,
          timestamp: '08:15 AM'
        },
        {
          id: 'hist-m2',
          name: 'Whipped Greek Yogurt & Marine Collagen Parfait',
          calories: 275,
          protein: 42,
          leucine: 2.95,
          methionine: 0.65,
          timestamp: '11:30 AM'
        },
        {
          id: 'hist-m3',
          name: 'Golden Herb Liquid Egg White Omelette',
          calories: 290,
          protein: 40,
          leucine: 3.10,
          methionine: 0.82,
          timestamp: '03:45 PM'
        },
        {
          id: 'hist-m4',
          name: 'Crispy Extra-Firm Tofu & Tempeh Scramble',
          calories: 360,
          protein: 38,
          leucine: 2.75,
          methionine: 0.48,
          timestamp: '07:30 PM'
        }
      ],
      workouts: [
        {
          id: 'hist-w1',
          name: 'Heavy Resistance Band Upper Hypertrophy',
          type: 'resistance_band',
          details: '4 sets of 15 reps with Black Band (45 lbs tension)',
          timestamp: '09:00 AM'
        }
      ]
    },

    [day2]: {
      date: day2,
      calories: 1780,
      protein: 154,
      carbs: 120,
      fat: 48,
      leucine: 3.2,
      methionine: 1.38,
      waterMl: 3500,
      steps: 11150,
      activeMinutes: 52,
      syncStatus: 'synced',
      isEdited: true, // Demonstrates retroactive editing badge!
      lastModified: new Date(Date.now() - 172800000).toISOString(),
      meals: [
        {
          id: 'hist-m5',
          name: 'Fermented EAA & Marine Collagen',
          calories: 105,
          protein: 24,
          leucine: 3.35,
          methionine: 0.50,
          timestamp: '08:00 AM'
        },
        {
          id: 'hist-m6',
          name: 'Steamed Pacific Cod Medallions with Garlic Seitan',
          calories: 395,
          protein: 52,
          leucine: 3.85,
          methionine: 1.12,
          timestamp: '01:15 PM'
        },
        {
          id: 'hist-m7',
          name: 'Glacier Core Power Vanilla Shake',
          calories: 310,
          protein: 53,
          leucine: 4.45,
          methionine: 1.18,
          timestamp: '05:00 PM'
        }
      ],
      workouts: [
        {
          id: 'hist-w2',
          name: 'Ab Wheel Core Tension & Midsection Calibre',
          type: 'bodyweight_plyometric',
          details: '4 sets of 15 bodyweight rollouts, zero external weight',
          timestamp: '01:00 PM'
        }
      ]
    },

    [day3]: {
      date: day3,
      calories: 1910,
      protein: 168,
      carbs: 145,
      fat: 54,
      leucine: 3.8,
      methionine: 1.62,
      waterMl: 3300,
      steps: 9800,
      activeMinutes: 40,
      syncStatus: 'synced',
      isEdited: false,
      lastModified: new Date(Date.now() - 259200000).toISOString(),
      meals: [
        {
          id: 'hist-m8',
          name: 'Oikos Greek Yogurt with Hemp Hearts & Berries',
          calories: 320,
          protein: 36,
          leucine: 2.8,
          methionine: 0.72,
          timestamp: '10:00 AM'
        },
        {
          id: 'hist-m9',
          name: 'Crispy Extra-Firm Tofu with Seitan Power Strips',
          calories: 420,
          protein: 48,
          leucine: 3.4,
          methionine: 0.65,
          timestamp: '06:30 PM'
        }
      ],
      workouts: [
        {
          id: 'hist-w3',
          name: 'Glute & Hamstring Resistance Band Circuit',
          type: 'resistance_band',
          details: '3 sets of 20 reps with Grey Fabric Band (35 lbs)',
          timestamp: '06:00 PM'
        }
      ]
    }
  };
}

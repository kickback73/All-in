// src/data/initialData.js
// Calibrated to "Dans Health Journey.md" operational constraints

import { DANS_MORNING_STACK } from '../utils/nutrientEngine';

export const DEFAULT_MORNING_STACKS = [DANS_MORNING_STACK];

export const DEFAULT_WORKOUT_PRESETS = [
  { id: 'w_bands', name: 'Resistance Bands (Back/V-Taper, Chest, Biceps)', durationMin: 40, steps: 1200, caloriesBurned: 240 },
  { id: 'w_abwheel', name: 'Ab Wheel Core Tension', durationMin: 15, steps: 300, caloriesBurned: 95 },
  { id: 'w_spin', name: 'Stationary Spin Bike (Zone 2/3)', durationMin: 35, steps: 4200, caloriesBurned: 320 },
];

export const DEFAULT_WORKOUT_REMINDERS = [];

export const INITIAL_PEPTIDE_HISTORY = [
  {
    id: 'pep_reta_weekly',
    category: 'PEPTIDE',
    title: 'Retatrutide',
    name: 'Retatrutide',
    doseMg: 3.0,
    doseMcg: 3000,
    vialMg: 10,
    bacWaterMl: 2,
    units: 60,
    site: 'SubQ Periumbilical (Weekly)',
    summary: '3 mg (3000 mcg) • 60 IU (10mg vial + 2mL BAC) • Weekly Protocol',
    timestamp: new Date().toISOString(),
  },
];

export const DAILY_TARGETS = {
  calories: 1900, // 1,850-1,950 kcal/day (preserve facial fat pads & lean tissue)
  protein: 180, // 170-190 g/day
  carbs: 145, // g
  fat: 65, // g
  waterMl: 2500, // ml
  steps: 10000,
  activeMinutes: 45,
  leucineTarget: 2.5, // g
  methionineSafetyCeiling: 1.8, // g (NHL remission safeguard)
};

export const ESSENTIAL_AMINO_ACIDS = [
  { key: 'leucine', label: 'Leucine (BCAA)', unit: 'mg', isBCAA: true },
  { key: 'isoleucine', label: 'Isoleucine (BCAA)', unit: 'mg', isBCAA: true },
  { key: 'valine', label: 'Valine (BCAA)', unit: 'mg', isBCAA: true },
  { key: 'lysine', label: 'Lysine', unit: 'mg', isBCAA: false },
  { key: 'methionine', label: 'Methionine', unit: 'mg', isBCAA: false },
  { key: 'phenylalanine', label: 'Phenylalanine', unit: 'mg', isBCAA: false },
  { key: 'threonine', label: 'Threonine', unit: 'mg', isBCAA: false },
  { key: 'tryptophan', label: 'Tryptophan', unit: 'mg', isBCAA: false },
  { key: 'histidine', label: 'Histidine', unit: 'mg', isBCAA: false },
];

export const MICRONUTRIENT_FIELDS = [
  { key: 'vitaminD', label: 'Vitamin D3', unit: 'mcg' },
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
  { key: 'zinc', label: 'Zinc', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
];

export function getInitialHistoricalLogs() {
  return {};
}

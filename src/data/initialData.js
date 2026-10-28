// src/data/initialData.js
// Zero Factory Presets: All user collections initialize as empty arrays ([])

export const DEFAULT_MORNING_STACKS = [];

export const DEFAULT_WORKOUT_PRESETS = [];

export const DEFAULT_WORKOUT_REMINDERS = [];

export const INITIAL_PEPTIDE_HISTORY = [];

export const DAILY_TARGETS = {
  calories: 2200,
  protein: 140, // g
  carbs: 200, // g
  fat: 75, // g
  waterMl: 2500, // ml (default target with inline editable pencil icon)
  steps: 10000,
  activeMinutes: 45,
  leucineTarget: 2.0, // g (ceiling/threshold for mTORC1 stimulation)
  methionineSafetyCeiling: 1.8, // g (safety ceiling for NHL remission)
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

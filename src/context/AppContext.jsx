// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { VISUAL_ASSET_LIBRARY } from '../utils/backgroundEngine';
import { DANS_MORNING_STACK } from '../utils/nutrientEngine';
import { MICRONUTRIENT_FIELDS, ESSENTIAL_AMINO_ACIDS } from '../data/initialData';
import {
  registerAllInServiceWorker,
  triggerDeviceNotification,
} from '../utils/notificationService';

const AppContext = createContext();

export function toIsoDateKey(d = new Date()) {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
}

function buildInitialCalendarSchedule() {
  const today = new Date();
  const scheduled = {};
  const completed = {};

  for (let offset = -6; offset <= 7; offset++) {
    const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const key = toIsoDateKey(dt);
    const dow = dt.getDay(); // Mon(1), Wed(3), Fri(5), Sat(6) scheduled
    if (dow === 1 || dow === 3 || dow === 5 || dow === 6) {
      scheduled[key] = true;
      if (offset === 0 || offset === -1 || offset === -3 || offset === -5) {
        completed[key] = true;
      }
    }
  }
  const twoDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);
  const twoDaysAgoKey = toIsoDateKey(twoDaysAgo);
  scheduled[twoDaysAgoKey] = true;
  delete completed[twoDaysAgoKey];

  const todayKey = toIsoDateKey(today);
  scheduled[todayKey] = true;
  completed[todayKey] = true;

  return { scheduled, completed };
}

export const createBlankMicros = () =>
  MICRONUTRIENT_FIELDS.reduce((acc, m) => {
    acc[m.key] = 0;
    return acc;
  }, {});

export const createBlankAminos = () =>
  ESSENTIAL_AMINO_ACIDS.reduce((acc, a) => {
    acc[a.key] = 0;
    return acc;
  }, {});

const DEFAULT_MICROS_TARGETS = MICRONUTRIENT_FIELDS.reduce((acc, m) => {
  acc[m.key] = m.defaultTarget;
  return acc;
}, {});

const INITIAL_NUTRITION = {
  dateKey: toIsoDateKey(new Date()),
  calories: 0,
  targetCalories: 1900, // 1,850–1,950 kcal/day
  protein: 0,
  targetProtein: 180, // 170–190 g/day
  carbs: 0,
  targetCarbs: 140,
  fiber: 0,
  targetFiber: 32,
  netCarbs: 0,
  fats: 0,
  targetFats: 65,
  meals: [],
  micros: createBlankMicros(),
  aminos: createBlankAminos(),
  targets: {
    micros: { ...DEFAULT_MICROS_TARGETS },
    aminos: {
      leucine: 3000,
      isoleucine: 1500,
      valine: 1800,
      lysine: 2400,
      methionine: 1200,
      phenylalanine: 1600,
      threonine: 1400,
      tryptophan: 400,
      histidine: 900,
    },
  },
};

const INITIAL_HYDRATION = {
  currentMl: 0,
  targetMl: 3250,
  electrolytePackets: 0,
  creatineGrams: 0,
};

const initialCal = buildInitialCalendarSchedule();

const INITIAL_RECOVERY_TELEMETRY = {
  lastRpe: 7,
  avgRpe: 7.0,
  readinessPct: 92,
  recoveryHours: 14,
  status: 'Primed for Explosive Output',
  coachNote:
    'Coach Assessment: Readiness is 92%. CNS is fresh—drive full hip extension on 8 kg Medicine Ball work and keep Zone 2 Spin heart rate locked between 100–117 BPM.',
};

const INITIAL_ACTIVITY = {
  steps: 4200,
  targetSteps: 8500,
  activeMinutes: 35,
  targetActiveMinutes: 45,
  caloriesBurned: 245,
  workoutType: 'Spin Bike (Zone 2) + Resistance Bands + 8kg Med Ball',
  scheduledDates: initialCal.scheduled,
  completedDates: initialCal.completed,
  recoveryTelemetry: INITIAL_RECOVERY_TELEMETRY,
  trainingLogs: [
    {
      id: 'init_spin_1',
      type: 'Spin Bike',
      summary: '25 min • 114 BPM (Zone 2 Fat Burn)',
      calories: 185,
      rpe: 6,
      dateKey: toIsoDateKey(new Date()),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'init_bands_1',
      type: 'Resistance Bands',
      summary: 'Back/V-Taper • 60 lbs × 12 reps × 3 sets',
      calories: 42,
      rpe: 7,
      dateKey: toIsoDateKey(new Date()),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'init_ab_1',
      type: 'Ab Wheel Rollouts',
      summary: 'Kneeling • 229 lbs • 12 reps × 3 sets',
      calories: 18,
      rpe: 7,
      dateKey: toIsoDateKey(new Date()),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
};

const INITIAL_PEPTIDE_HISTORY = [
  {
    id: 'pep_dan_retatrutide_1',
    peptideName: 'Retatrutide (GLP-1/GIP/GCGR)',
    vialMg: 10,
    bacWaterMl: 2,
    desiredDoseValue: 3,
    desiredDoseUnit: 'mg',
    volumeMl: '0.600',
    syringeUnits: '60.0',
    syringeCapacityMl: 1.0,
    site: 'Belly button area - lower left',
    dateTime: new Date().toISOString().slice(0, 16),
    timestamp: new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  },
];

/**
 * Computes Recovery Telemetry & Coach Feedback from logged workouts and RPE
 */
function computeRecoveryTelemetry(trainingLogs = []) {
  if (!Array.isArray(trainingLogs) || trainingLogs.length === 0) {
    return {
      lastRpe: null,
      avgRpe: 0,
      readinessPct: 100,
      recoveryHours: 0,
      status: '100% Recovered — Ready to Train',
      coachNote:
        "Coach's Corner: Zero CNS fatigue accumulated today. Hit your 8 kg medicine ball slams or V-taper band work with crisp technique!",
    };
  }

  const rpeLogs = trainingLogs.map((t) => Number(t.rpe) || 7);
  const lastRpe = rpeLogs[0];
  const avgRpe = Math.round((rpeLogs.reduce((a, b) => a + b, 0) / rpeLogs.length) * 10) / 10;
  const totalSessions = trainingLogs.length;

  const fatiguePenalty = Math.min(45, Math.round(avgRpe * 3.2 + totalSessions * 4));
  const readinessPct = Math.max(52, 100 - fatiguePenalty);
  const recoveryHours = Math.min(48, Math.max(8, Math.round(avgRpe * 2.4 + totalSessions * 2)));

  let status = 'Primed & Balanced';
  let coachNote =
    'Coach Feedback: Solid work rate today. Keep hydration above 3,000 ml and hit your 180g protein target to lock in lean tissue.';

  if (lastRpe >= 9 || avgRpe >= 8.5) {
    status = 'High CNS Load — Active Recovery Advised';
    coachNote = `Coach Feedback: High-intensity output (RPE ${lastRpe}/10)! Your nervous system needs ~${recoveryHours}h recovery. Prioritize 40g protein + leucine now and extra electrolytes.`;
  } else if (lastRpe >= 7.5) {
    status = 'Optimal Recomp Stimulus';
    coachNote = `Coach Feedback: Sweet-spot intensity (RPE ${lastRpe}/10). Great power transfer on the 8 kg medicine ball & resistance work without spiking cortisol.`;
  } else {
    status = 'Aerobic / Recovery Pace';
    coachNote = `Coach Feedback: Controlled RPE ${lastRpe}/10 session. Joints and facial tissue stay protected while burning pure fat in Zone 2.`;
  }

  return {
    lastRpe,
    avgRpe,
    readinessPct,
    recoveryHours,
    status,
    coachNote,
  };
}

/**
 * Recomputes dailyNutrition totals strictly from its `meals` array so edits/deletions stay 100% accurate.
 */
function recomputeNutritionFromMeals(prevNutrition, mealsList) {
  const nextMicros = createBlankMicros();
  const nextAminos = createBlankAminos();
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fiber = 0;
  let fats = 0;

  mealsList.forEach((m) => {
    calories += Number(m.calories) || 0;
    protein += Number(m.protein) || 0;
    carbs += Number(m.carbs) || 0;
    fiber += Number(m.fiber) || 0;
    fats += Number(m.fats) || 0;

    MICRONUTRIENT_FIELDS.forEach(({ key }) => {
      nextMicros[key] =
        Math.round(((nextMicros[key] || 0) + (Number(m.micros?.[key]) || 0)) * 10) / 10;
    });

    ESSENTIAL_AMINO_ACIDS.forEach(({ key }) => {
      nextAminos[key] = Math.round((nextAminos[key] || 0) + (Number(m.aminos?.[key]) || 0));
    });
  });

  const roundedCarbs = Math.round(carbs * 10) / 10;
  const roundedFiber = Math.round(fiber * 10) / 10;

  return {
    ...prevNutrition,
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: roundedCarbs,
    fiber: roundedFiber,
    netCarbs: Math.max(0, Math.round((roundedCarbs - roundedFiber) * 10) / 10),
    fats: Math.round(fats * 10) / 10,
    micros: nextMicros,
    aminos: nextAminos,
    meals: mealsList,
  };
}

/**
 * Automated, Read-Only mTOR Spectrum Computation Engine
 */
function computeAutomatedMtorState(dailyNutrition, dailyActivity) {
  const proteinG = Number(dailyNutrition.protein) || 0;
  const targetProteinG = Math.max(100, Number(dailyNutrition.targetProtein) || 180);
  const leucineG = Number(((Number(dailyNutrition.aminos?.leucine) || 0) / 1000).toFixed(2));
  const calories = Number(dailyNutrition.calories) || 0;
  const meals = Array.isArray(dailyNutrition.meals) ? dailyNutrition.meals : [];
  const trainingLogs = Array.isArray(dailyActivity.trainingLogs) ? dailyActivity.trainingLogs : [];

  const caloricMeals = meals.filter(
    (m) => (Number(m.calories) || 0) > 15 || (Number(m.protein) || 0) > 3
  );
  let fastingHours = 16;

  if (caloricMeals.length === 0 && calories <= 15 && proteinG <= 3) {
    const nowHour = new Date().getHours();
    fastingHours = Math.max(12, Math.min(20, nowHour + 4));
  } else {
    const latestMeal = caloricMeals[0];
    if (latestMeal?.loggedAtMs) {
      const elapsedHrs = Math.max(0, (Date.now() - Number(latestMeal.loggedAtMs)) / 3600000);
      fastingHours = Number(elapsedHrs.toFixed(1));
    } else {
      fastingHours = 0.5;
    }
  }

  const hasResistanceWorkout = trainingLogs.some((t) =>
    /band|weight|ab wheel|med ball|medicine ball|slam|twist|wall ball|woodchopper|squat|press|row|curl|pull|push|core|calisthenic/i.test(
      t.type || ''
    )
  );
  const hasCardioWorkout = trainingLogs.some((t) => /spin|bike|cardio|zone/i.test(t.type || ''));

  let rawScore = 20;

  if (fastingHours >= 12) {
    rawScore -= Math.min(12, (fastingHours - 12) * 2);
  } else {
    rawScore += Math.max(0, 14 - fastingHours * 2);
  }

  rawScore += Math.min(38, leucineG * 13.5);
  rawScore += Math.min(24, (proteinG / targetProteinG) * 24);

  if (hasResistanceWorkout && (proteinG >= 15 || leucineG >= 0.8)) {
    rawScore += 12;
  } else if (hasResistanceWorkout) {
    rawScore += 5;
  }

  if (hasCardioWorkout && proteinG < 15 && calories < 100) {
    rawScore -= 6;
  }

  const mtorScore = Math.max(8, Math.min(96, Math.round(rawScore)));

  let mode = 'Balanced';
  if (mtorScore < 34) {
    mode = 'Autophagy / AMPK';
  } else if (mtorScore > 66) {
    mode = 'Anabolic / mTORC1';
  }

  return {
    mode,
    score: mtorScore,
    fastingHours,
    postWorkoutWindow: hasResistanceWorkout,
    leucineTriggerGrams: leucineG,
  };
}

export const AppProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('allIn_userProfile_v6');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Dan',
          sex: 'Male',
          age: 53,
          height: '5\'11"',
          weightLbs: 229,
          goalWeightLbs: 200,
          maxHr: 167,
          activityMultiplier: 1.375,
          dietaryFocus: 'High-Protein Recomp • Facial Fat Pad Preservation • NHL Remission Safe',
          remissionStatus: 'NHL Remission (Strict Anti-Angiogenic Guardrail)',
          activeProtocol: 'Retatrutide 3 mg once weekly',
          notificationsEnabled: true,
          selectedPhotoId: VISUAL_ASSET_LIBRARY[0].id,
          customPhotoUrl: '',
        };
  });

  const [dailyNutrition, setDailyNutrition] = useState(() => {
    const todayKey = toIsoDateKey(new Date());
    const savedDateKey = localStorage.getItem('allIn_lastActiveDate_v6');
    const saved = localStorage.getItem('allIn_dailyNutrition_v6');

    if (saved) {
      const parsed = JSON.parse(saved);
      // Strict Midnight Rollover Check: if saved date is from a prior day, reset all daily supplements, Vitamin C, micros, aminos, and macros to blank/0
      if (savedDateKey && savedDateKey !== todayKey) {
        return {
          ...INITIAL_NUTRITION,
          dateKey: todayKey,
          targetCalories: parsed.targetCalories ?? INITIAL_NUTRITION.targetCalories,
          targetProtein: parsed.targetProtein ?? INITIAL_NUTRITION.targetProtein,
          targetCarbs: parsed.targetCarbs ?? INITIAL_NUTRITION.targetCarbs,
          targetFiber: parsed.targetFiber ?? INITIAL_NUTRITION.targetFiber,
          targetFats: parsed.targetFats ?? INITIAL_NUTRITION.targetFats,
          targets: {
            micros: {
              ...INITIAL_NUTRITION.targets.micros,
              ...(parsed?.targets?.micros || {}),
            },
            aminos: {
              ...INITIAL_NUTRITION.targets.aminos,
              ...(parsed?.targets?.aminos || {}),
            },
          },
        };
      }

      return {
        ...INITIAL_NUTRITION,
        ...parsed,
        dateKey: todayKey,
        micros: {
          ...createBlankMicros(),
          ...(parsed?.micros || {}),
        },
        aminos: {
          ...createBlankAminos(),
          ...(parsed?.aminos || {}),
        },
        targets: {
          micros: {
            ...INITIAL_NUTRITION.targets.micros,
            ...(parsed?.targets?.micros || {}),
          },
          aminos: {
            ...INITIAL_NUTRITION.targets.aminos,
            ...(parsed?.targets?.aminos || {}),
          },
        },
      };
    }
    return INITIAL_NUTRITION;
  });

  const [dailyHydration, setDailyHydration] = useState(() => {
    const todayKey = toIsoDateKey(new Date());
    const savedDateKey = localStorage.getItem('allIn_lastActiveDate_v6');
    const saved = localStorage.getItem('allIn_dailyHydration_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (savedDateKey && savedDateKey !== todayKey) {
        return {
          ...INITIAL_HYDRATION,
          targetMl: parsed.targetMl ?? INITIAL_HYDRATION.targetMl,
        };
      }
      return parsed;
    }
    return INITIAL_HYDRATION;
  });

  const [dailyActivity, setDailyActivity] = useState(() => {
    const saved = localStorage.getItem('allIn_dailyActivity_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      const logs = parsed.trainingLogs || INITIAL_ACTIVITY.trainingLogs;
      return {
        ...INITIAL_ACTIVITY,
        ...parsed,
        scheduledDates: parsed.scheduledDates || INITIAL_ACTIVITY.scheduledDates,
        completedDates: parsed.completedDates || INITIAL_ACTIVITY.completedDates,
        recoveryTelemetry: parsed.recoveryTelemetry || computeRecoveryTelemetry(logs),
      };
    }
    return INITIAL_ACTIVITY;
  });

  const [savedStacks, setSavedStacks] = useState(() => {
    const saved = localStorage.getItem('allIn_savedStacks_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return [DANS_MORNING_STACK];
  });

  const [peptideHistory, setPeptideHistory] = useState(() => {
    const saved = localStorage.getItem('allIn_peptideHistory_v6');
    return saved ? JSON.parse(saved) : INITIAL_PEPTIDE_HISTORY;
  });

  const [activePeptideName, setActivePeptideName] = useState(() => {
    const saved = localStorage.getItem('allIn_activePeptideName_v6');
    return saved || 'Retatrutide (GLP-1/GIP/GCGR)';
  });

  const [historicalLogs, setHistoricalLogs] = useState(() => {
    const saved = localStorage.getItem('allIn_historicalLogs_v6');
    return saved ? JSON.parse(saved) : [];
  });

  const [mtorState, setMtorState] = useState(() =>
    computeAutomatedMtorState(INITIAL_NUTRITION, INITIAL_ACTIVITY)
  );

  // UPC Scanner state: supports scanning into Daily Nutrition OR directly into Stack Builder
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTargetMode, setScannerTargetMode] = useState('daily'); // 'daily' | 'stack'
  const stackScanCallbackRef = useRef(null);

  const openScannerForStack = useCallback((onProductScanned) => {
    stackScanCallbackRef.current = onProductScanned;
    setScannerTargetMode('stack');
    setIsScannerOpen(true);
  }, []);

  const openScannerForDaily = useCallback(() => {
    stackScanCallbackRef.current = null;
    setScannerTargetMode('daily');
    setIsScannerOpen(true);
  }, []);

  const [syncStatusBadge, setSyncStatusBadge] = useState('Syncing...');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Persist all state slices + current active date key
  useEffect(() => {
    localStorage.setItem('allIn_lastActiveDate_v6', toIsoDateKey(new Date()));
  }, [dailyNutrition, dailyHydration]);

  useEffect(() => {
    localStorage.setItem('allIn_userProfile_v6', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('allIn_dailyNutrition_v6', JSON.stringify(dailyNutrition));
  }, [dailyNutrition]);

  useEffect(() => {
    localStorage.setItem('allIn_dailyHydration_v6', JSON.stringify(dailyHydration));
  }, [dailyHydration]);

  useEffect(() => {
    localStorage.setItem('allIn_dailyActivity_v6', JSON.stringify(dailyActivity));
  }, [dailyActivity]);

  useEffect(() => {
    localStorage.setItem('allIn_savedStacks_v6', JSON.stringify(savedStacks));
  }, [savedStacks]);

  useEffect(() => {
    localStorage.setItem('allIn_peptideHistory_v6', JSON.stringify(peptideHistory));
    if (peptideHistory[0]?.peptideName) {
      setActivePeptideName(peptideHistory[0].peptideName);
    }
  }, [peptideHistory]);

  useEffect(() => {
    localStorage.setItem('allIn_activePeptideName_v6', activePeptideName);
  }, [activePeptideName]);

  useEffect(() => {
    localStorage.setItem('allIn_historicalLogs_v6', JSON.stringify(historicalLogs));
  }, [historicalLogs]);

  useEffect(() => {
    localStorage.setItem('allIn_mtorState_v6', JSON.stringify(mtorState));
  }, [mtorState]);

  useEffect(() => {
    registerAllInServiceWorker();
  }, []);

  // Automatically recalculate read-only mTOR state strictly from daily charting
  useEffect(() => {
    const nextMtor = computeAutomatedMtorState(dailyNutrition, dailyActivity);
    setMtorState(nextMtor);
  }, [
    dailyNutrition.calories,
    dailyNutrition.protein,
    dailyNutrition.aminos?.leucine,
    dailyNutrition.meals,
    dailyNutrition.targetProtein,
    dailyActivity.trainingLogs,
    dailyActivity.caloriesBurned,
  ]);

  /**
   * Strict Midnight Reset: clears all daily supplements, Vitamin C (e.g. 60mg), micronutrients,
   * logged amino acids, meals, and hydration back to 0/blank at 00:00 rollover.
   */
  const resetDailySupplementsAndAminosAtMidnight = useCallback(() => {
    const newDateKey = toIsoDateKey(new Date());
    localStorage.setItem('allIn_lastActiveDate_v6', newDateKey);

    setDailyNutrition((prev) => ({
      ...INITIAL_NUTRITION,
      dateKey: newDateKey,
      calories: 0,
      protein: 0,
      carbs: 0,
      fiber: 0,
      netCarbs: 0,
      fats: 0,
      meals: [],
      micros: createBlankMicros(), // Clears Vitamin C (60mg) and all 15 vitamins/minerals to 0
      aminos: createBlankAminos(), // Clears all 9 essential amino acids to 0
      targetCalories: prev.targetCalories,
      targetProtein: prev.targetProtein,
      targetCarbs: prev.targetCarbs,
      targetFiber: prev.targetFiber,
      targetFats: prev.targetFats,
      targets: prev.targets,
    }));

    setDailyHydration((prev) => ({
      ...INITIAL_HYDRATION,
      currentMl: 0,
      electrolytePackets: 0,
      creatineGrams: 0,
      targetMl: prev.targetMl,
    }));

    setDailyActivity((prev) => ({
      ...INITIAL_ACTIVITY,
      steps: 0,
      activeMinutes: 0,
      caloriesBurned: 0,
      trainingLogs: [],
      recoveryTelemetry: computeRecoveryTelemetry([]),
      scheduledDates: prev.scheduledDates,
      completedDates: prev.completedDates,
    }));
  }, []);

  const executePersistentSync = useCallback(
    (reason = 'launch') => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const syncPayload = {
        syncedAt: now.toISOString(),
        reason,
        userProfile,
        dailyNutrition,
        dailyHydration,
        dailyActivity,
        peptideHistory,
        mtorState,
      };
      localStorage.setItem('allIn_cloudSyncSnapshot_v6', JSON.stringify(syncPayload));
      setLastSyncedAt(now.toISOString());

      if (reason === 'midnight') {
        const snapshotEntry = {
          id: `log_${Date.now()}`,
          date: now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          timestamp: now.toISOString(),
          weightLbs: userProfile.weightLbs,
          nutrition: { ...dailyNutrition },
          hydration: { ...dailyHydration },
          activity: { ...dailyActivity },
          mtorMode: mtorState.mode,
          peptidesLogged: peptideHistory.slice(0, 5),
        };
        setHistoricalLogs((prev) => [snapshotEntry, ...prev]);

        // Strictly clear daily supplements, Vitamin C (60mg), micros, and logged amino acids at 00:00
        resetDailySupplementsAndAminosAtMidnight();

        setSyncStatusBadge(`Midnight reset & sync complete (${timeLabel}) • 00:00`);
        if (userProfile.notificationsEnabled) {
          triggerDeviceNotification(
            'All In — Midnight Reset Complete',
            'Daily supplements, Vitamin C, and amino acids have been archived and reset to blank for the new day.'
          );
        }
      } else if (reason === 'manual') {
        setSyncStatusBadge(`Synced ${timeLabel} • Midnight reset scheduled`);
      } else {
        setSyncStatusBadge('Synced on launch • 00:00 reset scheduled');
      }
    },
    [
      userProfile,
      dailyNutrition,
      dailyHydration,
      dailyActivity,
      peptideHistory,
      mtorState,
      resetDailySupplementsAndAminosAtMidnight,
    ]
  );

  // Automatic Sync on App Mount + Daily Local Midnight (00:00:00) Scheduler + Visibility Rollover Guard
  useEffect(() => {
    executePersistentSync('launch');

    let midnightTimeoutId = null;

    const scheduleNextMidnightSync = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0
      );
      const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());

      midnightTimeoutId = setTimeout(() => {
        executePersistentSync('midnight');
        scheduleNextMidnightSync();
      }, msUntilMidnight);
    };

    scheduleNextMidnightSync();

    // Also check on tab focus / visibilitychange if the date rolled past 00:00 while phone was asleep
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentKey = toIsoDateKey(new Date());
        const storedKey = localStorage.getItem('allIn_lastActiveDate_v6');
        if (storedKey && storedKey !== currentKey) {
          executePersistentSync('midnight');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (midnightTimeoutId) clearTimeout(midnightTimeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log a stack or food item into daily nutrition + hydration
  const logStackToDaily = (stackTotals, itemName = null) => {
    const addedCarbs = Number(stackTotals.carbs) || 0;
    const addedFiber = Number(stackTotals.fiber ?? stackTotals.fibre) || 0;
    const addedNetCarbs =
      stackTotals.netCarbs !== undefined
        ? Number(stackTotals.netCarbs)
        : Math.max(0, Math.round((addedCarbs - addedFiber) * 10) / 10);

    setDailyNutrition((prev) => {
      const nextCarbs = Math.round((prev.carbs + addedCarbs) * 10) / 10;
      const nextFiber = Math.round(((prev.fiber || 0) + addedFiber) * 10) / 10;
      const nextNetCarbs = Math.max(0, Math.round((nextCarbs - nextFiber) * 10) / 10);

      const nextMicros = { ...(prev.micros || {}) };
      MICRONUTRIENT_FIELDS.forEach(({ key }) => {
        nextMicros[key] =
          Math.round(
            ((Number(prev.micros?.[key]) || 0) + (Number(stackTotals.micros?.[key]) || 0)) * 10
          ) / 10;
      });

      const nextAminos = { ...(prev.aminos || {}) };
      ESSENTIAL_AMINO_ACIDS.forEach(({ key }) => {
        nextAminos[key] = Math.round(
          (Number(prev.aminos?.[key]) || 0) + (Number(stackTotals.aminos?.[key]) || 0)
        );
      });

      const newMeal = itemName
        ? [
            {
              id: `meal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: itemName,
              calories: Math.round(Number(stackTotals.calories) || 0),
              protein: Math.round((Number(stackTotals.protein) || 0) * 10) / 10,
              carbs: addedCarbs,
              fiber: addedFiber,
              netCarbs: addedNetCarbs,
              fats: Math.round((Number(stackTotals.fats ?? stackTotals.fat) || 0) * 10) / 10,
              micros: stackTotals.micros || {},
              aminos: stackTotals.aminos || {},
              loggedAtMs: Date.now(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...(prev.meals || []),
          ]
        : prev.meals || [];

      return {
        ...prev,
        calories: Math.round(prev.calories + (Number(stackTotals.calories) || 0)),
        protein: Math.round((prev.protein + (Number(stackTotals.protein) || 0)) * 10) / 10,
        carbs: nextCarbs,
        fiber: nextFiber,
        netCarbs: nextNetCarbs,
        fats: Math.round((prev.fats + (Number(stackTotals.fats ?? stackTotals.fat) || 0)) * 10) / 10,
        meals: newMeal,
        micros: nextMicros,
        aminos: nextAminos,
      };
    });

    if (stackTotals.waterMl) {
      setDailyHydration((prev) => ({
        ...prev,
        currentMl: prev.currentMl + Number(stackTotals.waterMl),
      }));
    }

    if (userProfile.notificationsEnabled && itemName) {
      triggerDeviceNotification(
        'All In — Nutrition Logged',
        `${itemName}: +${Math.round(Number(stackTotals.calories) || 0)} kcal, +${
          Number(stackTotals.protein) || 0
        }g Protein`
      );
    }
  };

  // Inline Edit handler for Today's Logged Nutrition Meals
  const updateMealInDaily = (mealId, updatedFields) => {
    setDailyNutrition((prev) => {
      const updatedMeals = (prev.meals || []).map((m) => {
        if (m.id !== mealId) return m;
        const c = Number(updatedFields.carbs ?? m.carbs) || 0;
        const f = Number(updatedFields.fiber ?? m.fiber) || 0;
        return {
          ...m,
          ...updatedFields,
          calories: Math.round(Number(updatedFields.calories ?? m.calories) || 0),
          protein: Math.round((Number(updatedFields.protein ?? m.protein) || 0) * 10) / 10,
          carbs: Math.round(c * 10) / 10,
          fiber: Math.round(f * 10) / 10,
          netCarbs: Math.max(0, Math.round((c - f) * 10) / 10),
          fats: Math.round((Number(updatedFields.fats ?? m.fats) || 0) * 10) / 10,
        };
      });
      return recomputeNutritionFromMeals(prev, updatedMeals);
    });
  };

  // Inline Edit handler for Historical Logs in Profile -> Logs Tab
  const updateHistoricalLog = (logId, updatedFields) => {
    setHistoricalLogs((prev) =>
      prev.map((item) => {
        if (item.id !== logId) return item;
        return {
          ...item,
          date: updatedFields.date ?? item.date,
          weightLbs: Number(updatedFields.weightLbs ?? item.weightLbs) || item.weightLbs,
          nutrition: {
            ...(item.nutrition || {}),
            calories: Number(updatedFields.calories ?? item.nutrition?.calories) || 0,
            protein: Number(updatedFields.protein ?? item.nutrition?.protein) || 0,
          },
          hydration: {
            ...(item.hydration || {}),
            currentMl: Number(updatedFields.currentMl ?? item.hydration?.currentMl) || 0,
          },
          activity: {
            ...(item.activity || {}),
            caloriesBurned:
              Number(updatedFields.caloriesBurned ?? item.activity?.caloriesBurned) || 0,
          },
        };
      })
    );
  };

  // Peptide CRUD handlers
  const addPeptideEntry = (entry) => {
    setPeptideHistory((prev) => [entry, ...prev]);
    if (entry.peptideName) {
      setActivePeptideName(entry.peptideName);
    }
    if (userProfile.notificationsEnabled) {
      triggerDeviceNotification(
        'All In — Dose Logged',
        `${entry.peptideName}: ${entry.desiredDoseValue}${entry.desiredDoseUnit} at ${entry.site}`
      );
    }
  };

  const updatePeptideEntry = (id, updatedFields) => {
    setPeptideHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deletePeptideEntry = (id) => {
    setPeptideHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Athletic Training Session Logger & Schedule Calendar Toggles + RPE Recovery Telemetry
  const addTrainingSession = ({
    type,
    summary,
    calories,
    durationMinutes = 0,
    rpe = 7,
    dateKey,
  }) => {
    const kcal = Math.max(1, Math.round(Number(calories) || 0));
    const mins = Math.max(0, Math.round(Number(durationMinutes) || 0));
    const numericRpe = Math.max(1, Math.min(10, Number(rpe) || 7));
    const targetDateKey = dateKey || toIsoDateKey(new Date());
    const newSession = {
      id: `train_${Date.now()}`,
      type,
      summary,
      calories: kcal,
      rpe: numericRpe,
      dateKey: targetDateKey,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDailyActivity((prev) => {
      const nextLogs = [newSession, ...(prev.trainingLogs || [])];
      return {
        ...prev,
        caloriesBurned: (Number(prev.caloriesBurned) || 0) + kcal,
        activeMinutes: (Number(prev.activeMinutes) || 0) + mins,
        completedDates: {
          ...(prev.completedDates || {}),
          [targetDateKey]: true,
        },
        trainingLogs: nextLogs,
        recoveryTelemetry: computeRecoveryTelemetry(nextLogs),
      };
    });

    if (userProfile.notificationsEnabled) {
      triggerDeviceNotification(
        'All In Coach — Session Logged!',
        `${type}: ${kcal} kcal burned (RPE ${numericRpe}/10 • ${summary})`
      );
    }
  };

  const updateTrainingSession = (id, updatedFields) => {
    setDailyActivity((prev) => {
      const nextLogs = (prev.trainingLogs || []).map((t) =>
        t.id === id
          ? {
              ...t,
              ...updatedFields,
              calories: Math.max(1, Math.round(Number(updatedFields.calories ?? t.calories) || 0)),
              rpe: Math.max(1, Math.min(10, Number(updatedFields.rpe ?? t.rpe) || 7)),
            }
          : t
      );
      const totalBurned = nextLogs.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
      return {
        ...prev,
        caloriesBurned: totalBurned,
        trainingLogs: nextLogs,
        recoveryTelemetry: computeRecoveryTelemetry(nextLogs),
      };
    });
  };

  const toggleCalendarDateStatus = (dateKey) => {
    setDailyActivity((prev) => {
      const isSched = Boolean(prev.scheduledDates?.[dateKey]);
      const isComp = Boolean(prev.completedDates?.[dateKey]);
      const nextScheduled = { ...(prev.scheduledDates || {}) };
      const nextCompleted = { ...(prev.completedDates || {}) };

      if (!isSched && !isComp) {
        nextScheduled[dateKey] = true;
      } else if (isSched && !isComp) {
        nextCompleted[dateKey] = true;
      } else {
        delete nextScheduled[dateKey];
        delete nextCompleted[dateKey];
      }

      return {
        ...prev,
        scheduledDates: nextScheduled,
        completedDates: nextCompleted,
      };
    });
  };

  const deleteTrainingSession = (id) => {
    setDailyActivity((prev) => {
      const target = (prev.trainingLogs || []).find((t) => t.id === id);
      const deduct = target ? Number(target.calories) || 0 : 0;
      const nextLogs = (prev.trainingLogs || []).filter((t) => t.id !== id);
      return {
        ...prev,
        caloriesBurned: Math.max(0, (Number(prev.caloriesBurned) || 0) - deduct),
        trainingLogs: nextLogs,
        recoveryTelemetry: computeRecoveryTelemetry(nextLogs),
      };
    });
  };

  const archiveDailyLog = () => {
    const snapshot = {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      timestamp: new Date().toISOString(),
      weightLbs: userProfile.weightLbs,
      nutrition: { ...dailyNutrition },
      hydration: { ...dailyHydration },
      activity: { ...dailyActivity },
      mtorMode: mtorState.mode,
      peptidesLogged: peptideHistory.slice(0, 5),
    };
    setHistoricalLogs((prev) => [snapshot, ...prev]);
    resetDailySupplementsAndAminosAtMidnight();
    executePersistentSync('manual');
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        dailyNutrition,
        setDailyNutrition,
        updateMealInDaily,
        dailyHydration,
        setDailyHydration,
        dailyActivity,
        setDailyActivity,
        savedStacks,
        setSavedStacks,
        peptideHistory,
        setPeptideHistory,
        activePeptideName,
        setActivePeptideName,
        addPeptideEntry,
        updatePeptideEntry,
        deletePeptideEntry,
        addTrainingSession,
        updateTrainingSession,
        deleteTrainingSession,
        toggleCalendarDateStatus,
        historicalLogs,
        setHistoricalLogs,
        updateHistoricalLog,
        mtorState,
        logStackToDaily,
        archiveDailyLog,
        resetDailySupplementsAndAminosAtMidnight,
        isScannerOpen,
        setIsScannerOpen,
        scannerTargetMode,
        setScannerTargetMode,
        stackScanCallbackRef,
        openScannerForStack,
        openScannerForDaily,
        syncStatusBadge,
        lastSyncedAt,
        executePersistentSync,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export const useApp = () => useContext(AppContext);

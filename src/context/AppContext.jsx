// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VISUAL_ASSET_LIBRARY } from '../utils/backgroundEngine';
import { DANS_MORNING_STACK } from '../utils/nutrientEngine';
import { MICRONUTRIENT_FIELDS, ESSENTIAL_AMINO_ACIDS } from '../data/initialData';
import {
  registerAllInServiceWorker,
  triggerDeviceNotification,
} from '../utils/notificationService';

const AppContext = createContext();

function toIsoDateKey(d = new Date()) {
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

const DEFAULT_MICROS_LOGGED = MICRONUTRIENT_FIELDS.reduce((acc, m) => {
  acc[m.key] = 0;
  return acc;
}, {});

const DEFAULT_MICROS_TARGETS = MICRONUTRIENT_FIELDS.reduce((acc, m) => {
  acc[m.key] = m.defaultTarget;
  return acc;
}, {});

const INITIAL_NUTRITION = {
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
  micros: { ...DEFAULT_MICROS_LOGGED },
  aminos: {
    leucine: 0,
    isoleucine: 0,
    valine: 0,
    lysine: 0,
    methionine: 0,
    phenylalanine: 0,
    threonine: 0,
    tryptophan: 0,
    histidine: 0,
  },
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

const INITIAL_ACTIVITY = {
  steps: 4200,
  targetSteps: 8500,
  activeMinutes: 35,
  targetActiveMinutes: 45,
  caloriesBurned: 245,
  workoutType: 'Spin Bike (Zone 2) + Resistance Bands + Ab Wheel',
  scheduledDates: initialCal.scheduled,
  completedDates: initialCal.completed,
  trainingLogs: [
    {
      id: 'init_spin_1',
      type: 'Spin Bike',
      summary: '25 min • 114 BPM (Zone 2 Fat Burn)',
      calories: 185,
      dateKey: toIsoDateKey(new Date()),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'init_bands_1',
      type: 'Resistance Bands',
      summary: 'Back/V-Taper • 60 lbs × 12 reps × 3 sets',
      calories: 42,
      dateKey: toIsoDateKey(new Date()),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'init_ab_1',
      type: 'Ab Wheel Rollouts',
      summary: 'Kneeling • 229 lbs • 12 reps × 3 sets',
      calories: 18,
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
 * Automated, Read-Only mTOR Spectrum Computation Engine
 * Strictly derives mTORC1 vs. AMPK/Autophagy signaling from daily charting:
 * 1) Fasting window & meal timing (`meals`)
 * 2) Protein & Leucine threshold (`protein`, `aminos.leucine`)
 * 3) Logged workouts (`trainingLogs` resistance tension vs. fasted cardio)
 */
function computeAutomatedMtorState(dailyNutrition, dailyActivity) {
  const proteinG = Number(dailyNutrition.protein) || 0;
  const targetProteinG = Math.max(100, Number(dailyNutrition.targetProtein) || 180);
  const leucineG = Number(((Number(dailyNutrition.aminos?.leucine) || 0) / 1000).toFixed(2));
  const calories = Number(dailyNutrition.calories) || 0;
  const meals = Array.isArray(dailyNutrition.meals) ? dailyNutrition.meals : [];
  const trainingLogs = Array.isArray(dailyActivity.trainingLogs) ? dailyActivity.trainingLogs : [];

  // Determine caloric meals (> 15 kcal) to compute fasting hours
  const caloricMeals = meals.filter((m) => (Number(m.calories) || 0) > 15 || (Number(m.protein) || 0) > 3);
  let fastingHours = 16;

  if (caloricMeals.length === 0 && calories <= 15 && proteinG <= 3) {
    // Fasted state: derive hours since 20:00 prior evening (typical 14-18h window)
    const nowHour = new Date().getHours();
    fastingHours = Math.max(12, Math.min(20, nowHour + 4));
  } else {
    // Fed state: calculate elapsed hours since most recent meal (or feeding state)
    const latestMeal = caloricMeals[0];
    if (latestMeal?.loggedAtMs) {
      const elapsedHrs = Math.max(0, (Date.now() - Number(latestMeal.loggedAtMs)) / 3600000);
      fastingHours = Number(elapsedHrs.toFixed(1));
    } else {
      fastingHours = 0.5;
    }
  }

  // Workout signaling: Resistance bands / weights / core vs. Spin cardio
  const hasResistanceWorkout = trainingLogs.some((t) =>
    /band|weight|ab wheel|squat|press|row|curl|pull|push|core|calisthenic/i.test(t.type || '')
  );
  const hasCardioWorkout = trainingLogs.some((t) => /spin|bike|cardio|zone/i.test(t.type || ''));

  // Continuous mTOR Score (8 to 96)
  // Base fasted score starts low in Autophagy/AMPK (18), rises with Leucine, Protein, and Resistance mechanical tension
  let rawScore = 20;

  // Fasting suppression (longer fast > 12h drives AMPK deeper toward 10-25%)
  if (fastingHours >= 12) {
    rawScore -= Math.min(12, (fastingHours - 12) * 2);
  } else {
    // Recently fed window
    rawScore += Math.max(0, 14 - fastingHours * 2);
  }

  // Leucine ribosomal mTORC1 trigger (2.5g - 3.0g threshold is primary driver)
  rawScore += Math.min(38, leucineG * 13.5);

  // Total daily protein contribution
  rawScore += Math.min(24, (proteinG / targetProteinG) * 24);

  // Workout modulation
  if (hasResistanceWorkout && (proteinG >= 15 || leucineG >= 0.8)) {
    // Post-resistance + amino availability amplifies mTORC1 muscle protein synthesis
    rawScore += 12;
  } else if (hasResistanceWorkout) {
    rawScore += 5;
  }

  if (hasCardioWorkout && proteinG < 15 && calories < 100) {
    // Fasted Zone 2 Spin Bike deepens AMPK / Autophagy
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
    const saved = localStorage.getItem('allIn_dailyNutrition_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_NUTRITION,
        ...parsed,
        micros: {
          ...INITIAL_NUTRITION.micros,
          ...(parsed?.micros || {}),
        },
        aminos: {
          ...INITIAL_NUTRITION.aminos,
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
    const saved = localStorage.getItem('allIn_dailyHydration_v6');
    return saved ? JSON.parse(saved) : INITIAL_HYDRATION;
  });

  const [dailyActivity, setDailyActivity] = useState(() => {
    const saved = localStorage.getItem('allIn_dailyActivity_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_ACTIVITY,
        ...parsed,
        scheduledDates: parsed.scheduledDates || INITIAL_ACTIVITY.scheduledDates,
        completedDates: parsed.completedDates || INITIAL_ACTIVITY.completedDates,
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

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [syncStatusBadge, setSyncStatusBadge] = useState('Syncing...');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Persist all state slices
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

  // Register Service Worker on mount for native PWA WebAPK & Web Push Notifications
  useEffect(() => {
    registerAllInServiceWorker();
  }, []);

  // Automatically recalculate read-only mTOR state strictly from daily charting (fasting, protein/leucine, workouts)
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
        setSyncStatusBadge(`Midnight sync complete (${timeLabel}) • Scheduled 00:00`);
        if (userProfile.notificationsEnabled) {
          triggerDeviceNotification(
            'All In — Midnight Sync Complete',
            'Your daily nutrition, hydration, and training logs have been archived.'
          );
        }
      } else if (reason === 'manual') {
        setSyncStatusBadge(`Synced ${timeLabel} • Midnight sync scheduled`);
      } else {
        setSyncStatusBadge('Synced on launch • Midnight sync scheduled');
      }
    },
    [userProfile, dailyNutrition, dailyHydration, dailyActivity, peptideHistory, mtorState]
  );

  // Automatic Sync on App Mount + Daily Local Midnight (00:00:00) Scheduler
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

    return () => {
      if (midnightTimeoutId) clearTimeout(midnightTimeoutId);
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
          Math.round(((Number(prev.micros?.[key]) || 0) + (Number(stackTotals.micros?.[key]) || 0)) * 10) / 10;
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

  // Athletic Training Session Logger & Schedule Calendar Toggles
  const addTrainingSession = ({ type, summary, calories, durationMinutes = 0, dateKey }) => {
    const kcal = Math.max(1, Math.round(Number(calories) || 0));
    const mins = Math.max(0, Math.round(Number(durationMinutes) || 0));
    const targetDateKey = dateKey || toIsoDateKey(new Date());
    const newSession = {
      id: `train_${Date.now()}`,
      type,
      summary,
      calories: kcal,
      dateKey: targetDateKey,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDailyActivity((prev) => ({
      ...prev,
      caloriesBurned: (Number(prev.caloriesBurned) || 0) + kcal,
      activeMinutes: (Number(prev.activeMinutes) || 0) + mins,
      completedDates: {
        ...(prev.completedDates || {}),
        [targetDateKey]: true,
      },
      trainingLogs: [newSession, ...(prev.trainingLogs || [])],
    }));

    if (userProfile.notificationsEnabled) {
      triggerDeviceNotification(
        'All In — Workout Completed',
        `${type}: ${kcal} kcal burned (${summary})`
      );
    }
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
      return {
        ...prev,
        caloriesBurned: Math.max(0, (Number(prev.caloriesBurned) || 0) - deduct),
        trainingLogs: (prev.trainingLogs || []).filter((t) => t.id !== id),
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
    setDailyNutrition((prev) => ({
      ...INITIAL_NUTRITION,
      targetCalories: prev.targetCalories,
      targetProtein: prev.targetProtein,
      targetCarbs: prev.targetCarbs,
      targetFiber: prev.targetFiber,
      targetFats: prev.targetFats,
      targets: prev.targets,
    }));
    setDailyHydration((prev) => ({
      ...INITIAL_HYDRATION,
      targetMl: prev.targetMl,
    }));
    setDailyActivity((prev) => ({
      ...INITIAL_ACTIVITY,
      scheduledDates: prev.scheduledDates,
      completedDates: prev.completedDates,
    }));
    executePersistentSync('manual');
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        dailyNutrition,
        setDailyNutrition,
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
        deleteTrainingSession,
        toggleCalendarDateStatus,
        historicalLogs,
        setHistoricalLogs,
        mtorState,
        logStackToDaily,
        archiveDailyLog,
        isScannerOpen,
        setIsScannerOpen,
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

// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  DEFAULT_MORNING_STACKS,
  INITIAL_PEPTIDE_HISTORY,
  DAILY_TARGETS,
  ESSENTIAL_AMINO_ACIDS,
  MICRONUTRIENT_FIELDS,
} from '../data/initialData';
import { DANS_MORNING_STACK } from '../utils/nutrientEngine';
import {
  loadStoredState,
  saveStoredState,
} from '../utils/syncService';
import { feedbackEngine } from '../utils/soundEffects';
import { getActiveCycleDateKey } from '../utils/backgroundEngine';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Calibrated to Dans Health Journey.md: Male, 5'11", 229 lbs -> 200 lbs, 1850-1950 kcal, 170-190g Protein
  const [userProfile, setUserProfile] = useState({
    name: 'Dan',
    sex: 'Male',
    heightDisplay: "5'11\"",
    weightLbs: 229,
    targetWeightLbs: 200,
    dailyCaloricTarget: 1900,
    dailyProteinTarget: 180,
    dailyCarbTarget: 145,
    dailyFatTarget: 65,
    dailyStepsTarget: 10000,
    dailyActiveMinutesTarget: 45,
    dailyActiveCaloriesTarget: 500,
    activeProtocol: 'Retatrutide 3 mg Weekly',
    customPhotoUrl: null,
    selectedAvatarId: 'hero-power',
  });

  const [hydrationGoalMl, setHydrationGoalMl] = useState(DAILY_TARGETS.waterMl || 2500);
  const [morningStacks, setMorningStacks] = useState(DEFAULT_MORNING_STACKS);
  const [peptideHistory, setPeptideHistory] = useState(INITIAL_PEPTIDE_HISTORY);
  const [universalLogs, setUniversalLogs] = useState([]);
  const [activeCycleKey, setActiveCycleKey] = useState(() => getActiveCycleDateKey());

  const [todayLog, setTodayLog] = useState({
    date: getActiveCycleDateKey(),
    meals: [],
    stacksLogged: [],
    workouts: [],
    waterMl: 0,
    steps: 0,
    activeMinutes: 0,
    activeCalories: 0,
    lastModified: new Date().toISOString(),
  });

  // Load from LocalStorage on mount
  useEffect(() => {
    const cached = loadStoredState();
    if (cached) {
      if (cached.todayLog) setTodayLog(cached.todayLog);
      if (Array.isArray(cached.morningStacks) && cached.morningStacks.length > 0) {
        setMorningStacks(cached.morningStacks);
      } else {
        setMorningStacks([DANS_MORNING_STACK]);
      }
      if (Array.isArray(cached.peptideHistory) && cached.peptideHistory.length > 0) {
        setPeptideHistory(cached.peptideHistory);
      }
      if (cached.userProfile) {
        setUserProfile((prev) => ({ ...prev, ...cached.userProfile }));
      }
      if (cached.hydrationGoalMl) setHydrationGoalMl(Number(cached.hydrationGoalMl) || 2500);
      if (Array.isArray(cached.universalLogs)) setUniversalLogs(cached.universalLogs);
    }
    setIsLoaded(true);
  }, []);

  // Persist to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    saveStoredState({
      todayLog,
      morningStacks,
      peptideHistory,
      userProfile,
      hydrationGoalMl,
      universalLogs,
    });
  }, [
    isLoaded,
    todayLog,
    morningStacks,
    peptideHistory,
    userProfile,
    hydrationGoalMl,
    universalLogs,
  ]);

  // 12:01 AM Local Time Automatic Daily Reset
  useEffect(() => {
    const checkMidnightCycle = () => {
      const currentCycle = getActiveCycleDateKey(new Date());
      if (currentCycle !== activeCycleKey) {
        setActiveCycleKey(currentCycle);
        setTodayLog({
          date: currentCycle,
          meals: [],
          stacksLogged: [],
          workouts: [],
          waterMl: 0,
          steps: 0,
          activeMinutes: 0,
          activeCalories: 0,
          lastModified: new Date().toISOString(),
        });
      }
    };
    checkMidnightCycle();
    const interval = setInterval(checkMidnightCycle, 15000);
    return () => clearInterval(interval);
  }, [activeCycleKey]);

  const addLogRecord = useCallback((entry) => {
    const record = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    setUniversalLogs((prev) => [record, ...prev]);

    if (entry.category === 'WATER') {
      setTodayLog((prev) => ({
        ...prev,
        waterMl: Math.max(0, prev.waterMl + (Number(entry.amountMl) || 0)),
        lastModified: new Date().toISOString(),
      }));
    } else if (entry.category === 'NUTRITION') {
      setTodayLog((prev) => ({
        ...prev,
        meals: [...prev.meals, record],
        waterMl: prev.waterMl + (Number(entry.waterMl) || 0),
        lastModified: new Date().toISOString(),
      }));
    } else if (entry.category === 'PEPTIDE') {
      setPeptideHistory((prev) => [record, ...prev]);
    } else if (entry.category === 'ACTIVITY') {
      setTodayLog((prev) => ({
        ...prev,
        steps: prev.steps + (Number(entry.steps) || 0),
        activeMinutes: prev.activeMinutes + (Number(entry.durationMin) || 0),
        activeCalories: prev.activeCalories + (Number(entry.caloriesBurned) || 0),
        lastModified: new Date().toISOString(),
      }));
    }

    feedbackEngine.vibrate(15);
    return record;
  }, []);

  const updateLogRecord = useCallback((id, updated) => {
    setUniversalLogs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated, lastModified: new Date().toISOString() } : item))
    );
    setTodayLog((prev) => ({
      ...prev,
      meals: prev.meals.map((m) => (m.id === id ? { ...m, ...updated } : m)),
      lastModified: new Date().toISOString(),
    }));
    setPeptideHistory((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  }, []);

  const deleteLogRecord = useCallback((id) => {
    setUniversalLogs((prev) => prev.filter((item) => item.id !== id));
    setTodayLog((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== id),
      lastModified: new Date().toISOString(),
    }));
    setPeptideHistory((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Direct inline override of today's summary metrics
  const updateTodayDirectMetrics = useCallback((patch) => {
    setTodayLog((prev) => ({
      ...prev,
      ...patch,
      lastModified: new Date().toISOString(),
    }));
  }, []);

  const todayTotals = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      micros: { vitaminD: 0, vitaminC: 0, magnesium: 0, zinc: 0, potassium: 0, sodium: 0 },
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
      waterMl: todayLog.waterMl || 0,
      steps: todayLog.steps || 0,
      activeMinutes: todayLog.activeMinutes || 0,
      activeCalories: todayLog.activeCalories || 0,
    };

    todayLog.meals.forEach((meal) => {
      totals.calories += Number(meal.calories || 0);
      totals.protein += Number(meal.protein || 0);
      totals.carbs += Number(meal.carbs || 0);
      totals.fat += Number(meal.fats || meal.fat || 0);
      totals.aminos.leucine += Number(
        meal.leucineMg || meal.aminos?.leucine || (meal.leucine ? meal.leucine * 1000 : 0) || 0
      );

      ESSENTIAL_AMINO_ACIDS.forEach(({ key }) => {
        if (key !== 'leucine') {
          totals.aminos[key] += Number(
            meal.aminos?.[key] || (meal[key] ? meal[key] * 1000 : 0) || 0
          );
        }
      });

      MICRONUTRIENT_FIELDS.forEach(({ key }) => {
        totals.micros[key] += Number(meal.micros?.[key] || 0);
      });
    });

    totals.calories = Math.round(totals.calories);
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;
    totals.fat = Math.round(totals.fat * 10) / 10;

    return totals;
  }, [todayLog]);

  const incrementWater = useCallback(
    (amountMl = 250) => {
      addLogRecord({
        category: 'WATER',
        title: `Hydration (+${amountMl} ml)`,
        amountMl,
        summary: `${amountMl} ml water intake`,
      });
    },
    [addLogRecord]
  );

  const logMorningStack = useCallback(
    (stack) => {
      if (!stack) return;
      addLogRecord({
        category: 'NUTRITION',
        title: stack.name,
        calories: stack.totals?.calories || 0,
        protein: stack.totals?.protein || 0,
        carbs: stack.totals?.carbs || 0,
        fats: stack.totals?.fats || 0,
        waterMl: stack.totals?.waterMl || 0,
        leucineMg: stack.totals?.aminos?.leucine || 0,
        aminos: stack.totals?.aminos || {},
        micros: stack.totals?.micros || {},
        summary: `${stack.totals?.calories || 0} kcal • ${stack.totals?.protein || 0}g P • +${
          stack.totals?.waterMl || 0
        }ml H2O • Leu: ${stack.totals?.aminos?.leucine || 0}mg`,
      });
      feedbackEngine.playChime('stack');
    },
    [addLogRecord]
  );

  const updateUserProfile = useCallback((newProfile) => {
    setUserProfile((prev) => ({ ...prev, ...newProfile }));
  }, []);

  const saveOrUpdateStack = useCallback((stackObj) => {
    setMorningStacks((prev) => {
      const exists = prev.some((s) => s.id === stackObj.id);
      if (exists) {
        return prev.map((s) => (s.id === stackObj.id ? stackObj : s));
      }
      return [stackObj, ...prev];
    });
  }, []);

  const value = {
    userProfile,
    updateUserProfile,
    hydrationGoalMl,
    setHydrationGoalMl,
    morningStacks,
    setMorningStacks,
    saveOrUpdateStack,
    peptideHistory,
    setPeptideHistory,
    universalLogs,
    addLogRecord,
    updateLogRecord,
    deleteLogRecord,
    todayLog,
    todayTotals,
    updateTodayDirectMetrics,
    incrementWater,
    logMorningStack,
    activeCycleKey,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

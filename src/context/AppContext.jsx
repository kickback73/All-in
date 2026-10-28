// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  DEFAULT_MORNING_STACKS,
  DEFAULT_WORKOUT_PRESETS,
  DEFAULT_WORKOUT_REMINDERS,
  DAILY_TARGETS,
  ESSENTIAL_AMINO_ACIDS,
  MICRONUTRIENT_FIELDS,
  getInitialHistoricalLogs,
} from '../data/initialData';
import { INITIAL_PANTRY_STOCK } from '../data/pantryDatabase';
import {
  loadStoredState,
  saveStoredState,
  syncBatchToGoogleSheets,
  exportHealthBackupJSON,
} from '../utils/syncService';
import { feedbackEngine } from '../utils/soundEffects';
import { getActiveCycleDateKey, filterTodayEntries } from '../utils/backgroundEngine';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTabState] = useState('dashboard');

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
  }, []);

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [googleSheetsWebhookUrl, setGoogleSheetsWebhookUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isGoogleHealthConnected, setIsGoogleHealthConnected] = useState(true);

  // User Profile & Biometrics
  const [userProfile, setUserProfile] = useState({
    name: 'Athlete DK',
    weightKg: 84,
    heightCm: 182,
    age: 46,
    targetWeightKg: 78,
    dailyCaloricTarget: 2200,
    dailyProteinTarget: 140,
    customPhotoUrl: null,
    selectedAvatarId: 'hero-power',
  });

  // Dynamic Daily Hydration Target (defaults to 2500 ml)
  const [hydrationGoalMl, setHydrationGoalMl] = useState(DAILY_TARGETS.waterMl || 2500);

  // Zero Factory Presets: Collections initialize as empty arrays ([])
  const [morningStacks, setMorningStacks] = useState([]);
  const [peptideHistory, setPeptideHistory] = useState([]);
  const [workoutPresets, setWorkoutPresets] = useState([]);
  const [workoutReminders, setWorkoutReminders] = useState([]);
  const [pantryStock, setPantryStock] = useState([]);

  // Universal Unified Historical Log Array for retrospective CRUD
  const [universalLogs, setUniversalLogs] = useState([]);

  // Active Ledger for Today (resets at 12:01 AM local time)
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
    syncStatus: 'pending',
    isEdited: false,
    lastModified: new Date().toISOString(),
    mtorAlertPushed: false,
  });

  const [notifications, setNotifications] = useState([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const cached = loadStoredState();
    if (cached) {
      if (cached.todayLog) setTodayLog(cached.todayLog);
      if (Array.isArray(cached.morningStacks)) setMorningStacks(cached.morningStacks);
      if (Array.isArray(cached.peptideHistory)) setPeptideHistory(cached.peptideHistory);
      if (cached.userProfile) setUserProfile(cached.userProfile);
      if (cached.hydrationGoalMl) setHydrationGoalMl(Number(cached.hydrationGoalMl) || 2500);
      if (Array.isArray(cached.universalLogs)) setUniversalLogs(cached.universalLogs);
      if (cached.googleSheetsWebhookUrl) setGoogleSheetsWebhookUrl(cached.googleSheetsWebhookUrl);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on modifications
  useEffect(() => {
    if (!isLoaded) return;
    saveStoredState({
      todayLog,
      morningStacks,
      peptideHistory,
      userProfile,
      hydrationGoalMl,
      universalLogs,
      googleSheetsWebhookUrl,
      lastSyncTime,
    });
  }, [
    isLoaded,
    todayLog,
    morningStacks,
    peptideHistory,
    userProfile,
    hydrationGoalMl,
    universalLogs,
    googleSheetsWebhookUrl,
    lastSyncTime,
  ]);

  // 12:01 AM Local Time Automatic Daily Reset Watcher
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
          syncStatus: 'pending',
          isEdited: false,
          lastModified: new Date().toISOString(),
          mtorAlertPushed: false,
        });

        addNotification({
          type: 'sync',
          title: '12:01 AM Cycle Reset',
          message: `Active cycle shifted to ${currentCycle}. Summary counters reset to zero.`,
        });
      }
    };

    checkMidnightCycle();
    const interval = setInterval(checkMidnightCycle, 15000);
    return () => clearInterval(interval);
  }, [activeCycleKey]);

  // Notification Appender
  const addNotification = useCallback(({ type, title, message }) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
  }, []);

  // Universal Log Operations
  const addLogRecord = useCallback((entry) => {
    const record = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    setUniversalLogs((prev) => [record, ...prev]);

    // Also update today's live ledger
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

    // Sync updates back to today's ledger if the entry is from today
    setTodayLog((prev) => ({
      ...prev,
      meals: prev.meals.map((m) => (m.id === id ? { ...m, ...updated } : m)),
      lastModified: new Date().toISOString(),
    }));
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

  // Today's Computed Totals
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
      waterMl: todayLog.waterMl,
      steps: todayLog.steps,
      activeMinutes: todayLog.activeMinutes,
      activeCalories: todayLog.activeCalories,
    };

    todayLog.meals.forEach((meal) => {
      totals.calories += Number(meal.calories || 0);
      totals.protein += Number(meal.protein || 0);
      totals.carbs += Number(meal.carbs || 0);
      totals.fat += Number(meal.fats || meal.fat || 0);
      totals.aminos.leucine += Number(meal.leucineMg || meal.aminos?.leucine || (meal.leucine ? meal.leucine * 1000 : 0) || 0);

      ESSENTIAL_AMINO_ACIDS.forEach(({ key }) => {
        if (key !== 'leucine') {
          totals.aminos[key] += Number(meal.aminos?.[key] || (meal[key] ? meal[key] * 1000 : 0) || 0);
        }
      });

      MICRONUTRIENT_FIELDS.forEach(({ key }) => {
        totals.micros[key] += Number(meal.micros?.[key] || 0);
      });
    });

    return totals;
  }, [todayLog]);

  // Actions
  const incrementWater = useCallback((amountMl = 250) => {
    addLogRecord({
      category: 'WATER',
      title: `Hydration (+${amountMl} ml)`,
      amountMl,
      summary: `${amountMl} ml water intake`,
    });
  }, [addLogRecord]);

  const logMorningStack = useCallback((stack) => {
    if (!stack) return;
    addLogRecord({
      category: 'NUTRITION',
      title: `Stack: ${stack.name}`,
      calories: stack.totals?.calories || 0,
      protein: stack.totals?.protein || 0,
      carbs: stack.totals?.carbs || 0,
      fats: stack.totals?.fats || 0,
      leucineMg: stack.totals?.aminos?.leucine || 0,
      aminos: stack.totals?.aminos || {},
      micros: stack.totals?.micros || {},
      summary: `${stack.totals?.calories || 0} kcal • ${stack.totals?.protein || 0}g P • Leucine: ${stack.totals?.aminos?.leucine || 0}mg`,
    });
    feedbackEngine.playChime('stack');
  }, [addLogRecord]);

  const updateUserProfile = useCallback((newProfile) => {
    setUserProfile((prev) => ({ ...prev, ...newProfile }));
    addNotification({
      type: 'sync',
      title: 'Profile Updated',
      message: 'Biometric parameters and calibration saved.',
    });
  }, [addNotification]);

  const value = {
    activeTab,
    setActiveTab,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    isScannerOpen,
    setIsScannerOpen,
    isSyncModalOpen,
    setIsSyncModalOpen,
    googleSheetsWebhookUrl,
    setGoogleSheetsWebhookUrl,
    isSyncing,
    lastSyncTime,
    isGoogleHealthConnected,
    setIsGoogleHealthConnected,
    userProfile,
    updateUserProfile,
    hydrationGoalMl,
    setHydrationGoalMl,
    morningStacks,
    setMorningStacks,
    peptideHistory,
    setPeptideHistory,
    universalLogs,
    addLogRecord,
    updateLogRecord,
    deleteLogRecord,
    todayLog,
    todayTotals,
    incrementWater,
    logMorningStack,
    activeCycleKey,
    notifications,
    addNotification,
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

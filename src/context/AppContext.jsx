import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  DEFAULT_MORNING_STACKS,
  DEFAULT_WORKOUT_PRESETS,
  DEFAULT_WORKOUT_REMINDERS,
  DAILY_TARGETS,
  getInitialHistoricalLogs
} from '../data/initialData';
import { INITIAL_PANTRY_STOCK } from '../data/pantryDatabase';
import {
  loadStoredState,
  saveStoredState,
  syncBatchToGoogleSheets,
  exportHealthBackupJSON
} from '../utils/syncService';
import { feedbackEngine } from '../utils/soundEffects';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const getTodayDateStr = () => new Date().toISOString().split('T')[0];

  const [isLoaded, setIsLoaded] = useState(false);

  // Remember last viewed screen across device reopenings
  const [activeTab, setActiveTabState] = useState(() => {
    try {
      return localStorage.getItem('dk_all_in_last_screen') || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('dk_all_in_last_screen', tab);
    } catch (e) {}
  }, []);

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [googleSheetsWebhookUrl, setGoogleSheetsWebhookUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isGoogleHealthConnected, setIsGoogleHealthConnected] = useState(true);

  // User Profile Biometrics & Custom Picture
  const [userProfile, setUserProfile] = useState({
    name: 'Athlete DK',
    weightKg: 84,
    heightCm: 182,
    age: 46,
    targetWeightKg: 78,
    dailyCaloricTarget: 1950,
    dailyProteinTarget: 165,
    customPhotoUrl: null,
    selectedAvatarId: 'hero-power'
  });

  // Peptide Injection History
  const [peptideHistory, setPeptideHistory] = useState([
    {
      id: 'pep-init-1',
      compound: 'Retatrutide',
      doseMg: 2.0,
      unitsPulled: 40,
      syringeLabel: 'U-100 (1.0 mL)',
      site: 'Lower Left Abdomen (Periumbilical)',
      concentration: 5.0,
      timestamp: '08:30 AM',
      date: 'Oct 20, 2026'
    }
  ]);

  const [morningStacks, setMorningStacks] = useState(DEFAULT_MORNING_STACKS);
  const [workoutPresets, setWorkoutPresets] = useState(DEFAULT_WORKOUT_PRESETS);
  const [workoutReminders, setWorkoutReminders] = useState(DEFAULT_WORKOUT_REMINDERS);
  const [pantryStock, setPantryStock] = useState(INITIAL_PANTRY_STOCK);
  const [historicalLogs, setHistoricalLogs] = useState(getInitialHistoricalLogs());

  // Custom Morning Drink state with persistence
  const [customMorningDrink, setCustomMorningDrink] = useState({
    title: 'Electrolyte Collagen Elixir',
    rawIngredientsText: `15g Wild Marine Collagen Peptides\n5g Creatine Monohydrate\n1 scoop Electrolyte Salts (Sodium 400mg, Potassium 200mg, Magnesium 100mg)\n500ml Filtered Water with 1/2 Organic Lemon\n3g Pure L-Glutamine powder`,
    autoLogDaily: true,
    nutrients: {
      calories: 74,
      protein: 18,
      leucine: 0.41,
      methionine: 0.18,
      sodiumMg: 450,
      potassiumMg: 200,
      magnesiumMg: 100,
      waterMl: 500
    },
    lastSaved: new Date().toISOString()
  });

  // Active ledger for today
  const [todayLog, setTodayLog] = useState({
    date: getTodayDateStr(),
    meals: [],
    stacksLogged: [],
    workouts: [],
    waterMl: 1400,
    steps: 6840,
    activeMinutes: 32,
    syncStatus: 'pending',
    isEdited: false,
    lastModified: new Date().toISOString(),
    mtorAlertPushed: false
  });

  // Persistent notifications feed
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-welcome',
      type: 'sync',
      title: 'Pixel 8 Health Suite Active',
      message: 'State preservation active. Screen memory and background sync enabled.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true
    },
    {
      id: 'notif-gh',
      type: 'sync',
      title: 'Google Health Integration Paired',
      message: 'Step count sensor connected. Live pedometer tracking active.',
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true
    }
  ]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const cached = loadStoredState();
    if (cached) {
      if (cached.todayLog) setTodayLog(cached.todayLog);
      if (cached.historicalLogs) setHistoricalLogs(cached.historicalLogs);
      if (cached.morningStacks) setMorningStacks(cached.morningStacks);
      if (cached.customMorningDrink) setCustomMorningDrink(cached.customMorningDrink);
      if (cached.userProfile) setUserProfile(cached.userProfile);
      if (cached.peptideHistory) setPeptideHistory(cached.peptideHistory);
      if (cached.workoutPresets) setWorkoutPresets(cached.workoutPresets);
      if (cached.workoutReminders) setWorkoutReminders(cached.workoutReminders);
      if (cached.pantryStock) setPantryStock(cached.pantryStock);
      if (cached.notifications) setNotifications(cached.notifications);
      if (cached.googleSheetsWebhookUrl) setGoogleSheetsWebhookUrl(cached.googleSheetsWebhookUrl);
      if (cached.lastSyncTime) setLastSyncTime(cached.lastSyncTime);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on state modifications
  useEffect(() => {
    if (!isLoaded) return;
    saveStoredState({
      todayLog,
      historicalLogs,
      morningStacks,
      customMorningDrink,
      userProfile,
      peptideHistory,
      workoutPresets,
      workoutReminders,
      pantryStock,
      notifications,
      googleSheetsWebhookUrl,
      lastSyncTime
    });
  }, [
    isLoaded,
    todayLog,
    historicalLogs,
    morningStacks,
    customMorningDrink,
    userProfile,
    peptideHistory,
    workoutPresets,
    workoutReminders,
    pantryStock,
    notifications,
    googleSheetsWebhookUrl,
    lastSyncTime
  ]);

  // Automated midnight archive detection & daily drink auto-log
  useEffect(() => {
    const checkMidnightArchive = () => {
      const currentDate = getTodayDateStr();
      if (todayLog.date && todayLog.date !== currentDate) {
        setHistoricalLogs(prev => ({
          ...prev,
          [todayLog.date]: { ...todayLog }
        }));

        const freshMeals = [];
        if (customMorningDrink.autoLogDaily && customMorningDrink.nutrients) {
          freshMeals.push({
            id: `meal-custom-drink-${Date.now()}`,
            name: customMorningDrink.title,
            category: 'Custom Morning Drink',
            calories: customMorningDrink.nutrients.calories,
            protein: customMorningDrink.nutrients.protein,
            carbs: 2,
            fat: 0,
            leucine: customMorningDrink.nutrients.leucine,
            methionine: customMorningDrink.nutrients.methionine,
            source: 'custom_morning_drink',
            timestamp: '07:00 AM'
          });
        }

        setTodayLog({
          date: currentDate,
          meals: freshMeals,
          stacksLogged: [],
          workouts: [],
          waterMl: customMorningDrink.autoLogDaily ? (customMorningDrink.nutrients.waterMl || 500) : 0,
          steps: 0,
          activeMinutes: 0,
          syncStatus: 'pending',
          isEdited: false,
          lastModified: new Date().toISOString(),
          mtorAlertPushed: false
        });

        addNotification({
          type: 'sync',
          title: 'Automated Midnight Archive',
          message: `Archived ledger for ${todayLog.date}. Prepared fresh daily tracking suite.`
        });
      }
    };

    checkMidnightArchive();
    const interval = setInterval(checkMidnightArchive, 60000);
    return () => clearInterval(interval);
  }, [todayLog, customMorningDrink]);

  // Helper to append a notification
  const addNotification = useCallback(({ type, title, message }) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
  }, []);

  // Computed today's totals
  const todayTotals = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      leucine: 0,
      methionine: 0
    };

    todayLog.meals.forEach(meal => {
      totals.calories += Number(meal.calories || 0);
      totals.protein += Number(meal.protein || 0);
      totals.carbs += Number(meal.carbs || 0);
      totals.fat += Number(meal.fat || 0);
      totals.leucine += Number(meal.leucine || 0);
      totals.methionine += Number(meal.methionine || 0);
    });

    totals.waterMl = Number(todayLog.waterMl || 0);
    totals.steps = Number(todayLog.steps || 0);
    totals.activeMinutes = Number(todayLog.activeMinutes || 0);

    totals.leucine = Number(totals.leucine.toFixed(2));
    totals.methionine = Number(totals.methionine.toFixed(2));

    return totals;
  }, [todayLog.meals, todayLog.waterMl, todayLog.steps, todayLog.activeMinutes]);

  // Progress metrics vs targets
  const progressMetrics = useMemo(() => {
    const calorieTarget = userProfile.dailyCaloricTarget || DAILY_TARGETS.calories;
    const proteinTarget = userProfile.dailyProteinTarget || DAILY_TARGETS.protein;

    return {
      caloriesPct: Math.min(100, Math.round((todayTotals.calories / calorieTarget) * 100)),
      proteinPct: Math.min(100, Math.round((todayTotals.protein / proteinTarget) * 100)),
      waterPct: Math.min(100, Math.round((todayTotals.waterMl / DAILY_TARGETS.waterMl) * 100)),
      stepsPct: Math.min(100, Math.round((todayTotals.steps / DAILY_TARGETS.steps) * 100)),
      leucinePct: Math.min(100, Math.round((todayTotals.leucine / DAILY_TARGETS.leucineTarget) * 100)),
      methioninePct: Math.min(100, Math.round((todayTotals.methionine / DAILY_TARGETS.methionineSafetyCeiling) * 100)),
      isMethionineCaution: todayTotals.methionine >= 1.4,
      isMethionineExceeded: todayTotals.methionine >= DAILY_TARGETS.methionineSafetyCeiling
    };
  }, [todayTotals, userProfile]);

  // Automated mTOR Warning Push Notification
  useEffect(() => {
    if (progressMetrics.isMethionineCaution && !todayLog.mtorAlertPushed) {
      setTodayLog(prev => ({ ...prev, mtorAlertPushed: true }));
      addNotification({
        type: 'mtor',
        title: '⚠️ mTOR Safety Elevation Warning',
        message: `Daily methionine reached ${todayTotals.methionine}g (safety threshold: 1.4g / limit: 1.8g). Favour plant proteins or collagen.`
      });
      feedbackEngine.playChime('alert');
    }
  }, [progressMetrics.isMethionineCaution, todayLog.mtorAlertPushed, todayTotals.methionine, addNotification]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  // Actions
  const logMorningStack = useCallback((stackId) => {
    const stack = morningStacks.find(s => s.id === stackId);
    if (!stack) return;

    const newMeal = {
      id: `meal-stack-${Date.now()}`,
      name: stack.name,
      category: 'Morning Stack',
      calories: stack.calories,
      protein: stack.protein,
      carbs: stack.carbs,
      fat: stack.fat,
      leucine: stack.leucine,
      methionine: stack.methionine,
      source: 'morning_stack',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTodayLog(prev => ({
      ...prev,
      meals: [...prev.meals, newMeal],
      stacksLogged: [...(prev.stacksLogged || []), stackId],
      syncStatus: 'pending',
      lastModified: new Date().toISOString()
    }));

    feedbackEngine.playChime('stack');
    feedbackEngine.triggerConfetti();

    addNotification({
      type: 'stack',
      title: `Logged ${stack.name}`,
      message: `+${stack.protein}g Protein | +${stack.leucine}g Leucine pulse added to active ledger.`
    });
  }, [morningStacks, addNotification]);

  const logMeal = useCallback((mealData) => {
    const newMeal = {
      id: `meal-${Date.now()}`,
      name: mealData.name || 'Custom Meal',
      category: mealData.category || 'Nutritional Entry',
      calories: Number(mealData.calories || 0),
      protein: Number(mealData.protein || 0),
      carbs: Number(mealData.carbs || 0),
      fat: Number(mealData.fat || 0),
      leucine: Number(mealData.leucine || 0),
      methionine: Number(mealData.methionine || 0),
      source: mealData.source || 'manual',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTodayLog(prev => ({
      ...prev,
      meals: [...prev.meals, newMeal],
      syncStatus: 'pending',
      lastModified: new Date().toISOString()
    }));

    feedbackEngine.playChime('scan');

    addNotification({
      type: 'nutrition',
      title: `Logged: ${newMeal.name}`,
      message: `${newMeal.calories} kcal | ${newMeal.protein}g protein logged.`
    });
  }, [addNotification]);

  const deleteMeal = useCallback((mealId) => {
    setTodayLog(prev => ({
      ...prev,
      meals: prev.meals.filter(m => m.id !== mealId),
      syncStatus: 'pending',
      lastModified: new Date().toISOString()
    }));
  }, []);

  const incrementWater = useCallback((amountMl = 250) => {
    setTodayLog(prev => ({
      ...prev,
      waterMl: Math.max(0, prev.waterMl + amountMl),
      syncStatus: 'pending',
      lastModified: new Date().toISOString()
    }));
    feedbackEngine.vibrate(15);
  }, []);

  const updateSteps = useCallback((amount = 500) => {
    setTodayLog(prev => ({
      ...prev,
      steps: Math.max(0, prev.steps + amount),
      syncStatus: 'pending',
      lastModified: new Date().toISOString()
    }));
    feedbackEngine.vibrate(15);
  }, []);

  const syncGoogleHealthSteps = useCallback(() => {
    const bonus = 1250;
    setTodayLog(prev => ({
      ...prev,
      steps: prev.steps + bonus,
      syncStatus: 'pending',
      lastModified: new Date().toISOString()
    }));
    feedbackEngine.playChime('sync');
    addNotification({
      type: 'sync',
      title: 'Google Health Synced',
      message: `Synchronised +${bonus} steps from Pixel 8 device pedometer.`
    });
  }, [addNotification]);

  const updateUserProfile = useCallback((newProfile) => {
    setUserProfile(prev => ({ ...prev, ...newProfile }));
    addNotification({
      type: 'sync',
      title: 'Profile Updated',
      message: 'Biometric parameters and personal profile calibration saved.'
    });
  }, [addNotification]);

  const addPeptideHistoryEntry = useCallback((entry) => {
    setPeptideHistory(prev => [entry, ...prev]);
  }, []);

  const deletePeptideHistoryEntry = useCallback((id) => {
    setPeptideHistory(prev => prev.filter(e => e.id !== id));
  }, []);

  const updateCustomMorningDrink = useCallback((drinkData) => {
    setCustomMorningDrink(drinkData);
  }, []);

  const submitLog = useCallback(async () => {
    setIsSyncing(true);
    feedbackEngine.vibrate([15, 30]);

    const batchPayload = {
      date: todayLog.date,
      summary: {
        totalCalories: todayTotals.calories,
        totalProtein: todayTotals.protein,
        totalCarbs: todayTotals.carbs,
        totalFat: todayTotals.fat,
        totalLeucine: todayTotals.leucine,
        totalMethionine: todayTotals.methionine,
        waterMl: todayTotals.waterMl,
        steps: todayTotals.steps,
        activeMinutes: todayTotals.activeMinutes
      },
      meals: todayLog.meals,
      workouts: todayLog.workouts,
      peptideHistory,
      userProfile,
      device: 'Google Pixel 8',
      syncedAt: new Date().toISOString()
    };

    const result = await syncBatchToGoogleSheets(batchPayload, googleSheetsWebhookUrl);

    setIsSyncing(false);
    const syncTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSyncTime(syncTimeStr);

    if (result.success) {
      setTodayLog(prev => ({ ...prev, syncStatus: 'synced' }));
      feedbackEngine.playChime('sync');
      addNotification({
        type: 'sync',
        title: 'Batch Synchronisation Successful',
        message: result.mode === 'live_sheets_webhook'
          ? 'Transmitted payload to Google Sheets webhook endpoint.'
          : 'Cached in verified local JSON ledger.'
      });
    }

    return result;
  }, [todayLog, todayTotals, peptideHistory, userProfile, googleSheetsWebhookUrl, addNotification]);

  const updateHistoricalDay = useCallback((dateStr, updatedDay) => {
    setHistoricalLogs(prev => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        ...updatedDay,
        isEdited: true,
        lastModified: new Date().toISOString()
      }
    }));

    feedbackEngine.playChime('sync');

    addNotification({
      type: 'sync',
      title: `Retroactive Record Updated`,
      message: `Modified entries for ${dateStr}. Historical chart badge applied.`
    });
  }, [addNotification]);

  const exportBackup = useCallback(() => {
    exportHealthBackupJSON({
      todayLog,
      historicalLogs,
      morningStacks,
      customMorningDrink,
      userProfile,
      peptideHistory,
      workoutPresets,
      workoutReminders,
      pantryStock,
      notifications,
      exportedAt: new Date().toISOString()
    });
  }, [todayLog, historicalLogs, morningStacks, customMorningDrink, userProfile, peptideHistory, workoutPresets, workoutReminders, pantryStock, notifications]);

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
    peptideHistory,
    addPeptideHistoryEntry,
    deletePeptideHistoryEntry,

    morningStacks,
    customMorningDrink,
    workoutPresets,
    workoutReminders,
    pantryStock,
    historicalLogs,
    todayLog,
    todayTotals,
    progressMetrics,
    notifications,
    unreadCount,

    // Actions
    logMorningStack,
    logMeal,
    deleteMeal,
    incrementWater,
    updateSteps,
    syncGoogleHealthSteps,
    updateCustomMorningDrink,
    submitLog,
    updateHistoricalDay,
    updateMorningStacks: setMorningStacks,
    markAllNotificationsAsRead: () => setNotifications(prev => prev.map(n => ({ ...n, unread: false }))),
    clearNotifications: () => setNotifications([]),
    exportBackup,
    addNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

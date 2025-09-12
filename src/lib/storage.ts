import { UserProfile, FoodEntry, DailyTarget, DailyProgress, AppSettings, QuickLogItem } from '@/types';

const STORAGE_KEYS = {
  USER_PROFILE: 'calorie_tracker_user_profile',
  DAILY_TARGETS: 'calorie_tracker_daily_targets',
  FOOD_ENTRIES: 'calorie_tracker_food_entries',
  APP_SETTINGS: 'calorie_tracker_app_settings',
  QUICK_LOG_ITEMS: 'calorie_tracker_quick_log_items',
  LAST_RESET: 'calorie_tracker_last_reset',
} as const;

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }
}

export function loadUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
}

export function saveDailyTargets(targets: DailyTarget): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.DAILY_TARGETS, JSON.stringify(targets));
  }
}

export function loadDailyTargets(): DailyTarget | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_TARGETS);
  return data ? JSON.parse(data) : null;
}

export function saveAppSettings(settings: AppSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  }
}

export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return {
      quickCapture: true,
      autoSubmit: true,
      darkMode: true,
      notifications: false,
    };
  }
  const data = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
  return data ? JSON.parse(data) : {
    quickCapture: true,
    autoSubmit: true,
    darkMode: true,
    notifications: false,
  };
}

export function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function saveFoodEntry(entry: FoodEntry): void {
  if (typeof window === 'undefined') return;
  
  const todayKey = getTodayKey();
  const entriesKey = `${STORAGE_KEYS.FOOD_ENTRIES}_${todayKey}`;
  
  const existingEntries = loadFoodEntries(todayKey);
  existingEntries.push(entry);
  
  localStorage.setItem(entriesKey, JSON.stringify(existingEntries));
  
  updateQuickLogItems(entry);
}

export function loadFoodEntries(date?: string): FoodEntry[] {
  if (typeof window === 'undefined') return [];
  const dateKey = date || getTodayKey();
  const entriesKey = `${STORAGE_KEYS.FOOD_ENTRIES}_${dateKey}`;
  const data = localStorage.getItem(entriesKey);
  return data ? JSON.parse(data) : [];
}

export function updateFoodEntry(entryId: string, updates: Partial<FoodEntry>): void {
  if (typeof window === 'undefined') return;
  const todayKey = getTodayKey();
  const entries = loadFoodEntries(todayKey);
  const index = entries.findIndex(e => e.id === entryId);
  
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    const entriesKey = `${STORAGE_KEYS.FOOD_ENTRIES}_${todayKey}`;
    localStorage.setItem(entriesKey, JSON.stringify(entries));
  }
}

export function deleteFoodEntry(entryId: string): void {
  if (typeof window === 'undefined') return;
  const todayKey = getTodayKey();
  const entries = loadFoodEntries(todayKey);
  const filtered = entries.filter(e => e.id !== entryId);
  
  const entriesKey = `${STORAGE_KEYS.FOOD_ENTRIES}_${todayKey}`;
  localStorage.setItem(entriesKey, JSON.stringify(filtered));
}

export function getDailyProgress(date?: string): DailyProgress {
  const dateKey = date || getTodayKey();
  const entries = loadFoodEntries(dateKey);
  
  const totals = entries.reduce((acc, entry) => ({
    calories: acc.calories + entry.calories,
    protein: acc.protein + entry.protein,
    carbs: acc.carbs + entry.carbs,
    fat: acc.fat + entry.fat,
    sugar: acc.sugar + entry.sugar,
  }), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
  });
  
  return {
    date: dateKey,
    entries,
    totals,
  };
}

export function getHistoricalData(days: number): DailyProgress[] {
  const results: DailyProgress[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    results.push(getDailyProgress(dateKey));
  }
  
  return results.reverse();
}

export function checkAndResetDaily(): void {
  if (typeof window === 'undefined') return;
  const lastReset = localStorage.getItem(STORAGE_KEYS.LAST_RESET);
  const today = getTodayKey();
  
  if (lastReset !== today) {
    localStorage.setItem(STORAGE_KEYS.LAST_RESET, today);
  }
}

export function saveQuickLogItems(items: QuickLogItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.QUICK_LOG_ITEMS, JSON.stringify(items));
  }
}

export function loadQuickLogItems(): QuickLogItem[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.QUICK_LOG_ITEMS);
  return data ? JSON.parse(data) : [];
}

function updateQuickLogItems(entry: FoodEntry): void {
  const items = loadQuickLogItems();
  const existingIndex = items.findIndex(item => 
    item.name.toLowerCase() === entry.name.toLowerCase()
  );
  
  if (existingIndex !== -1) {
    items[existingIndex].frequency = (items[existingIndex].frequency || 0) + 1;
    items[existingIndex].lastUsed = new Date().toISOString();
  } else {
    items.push({
      id: `quick_${Date.now()}`,
      name: entry.name,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      sugar: entry.sugar,
      imageUrl: entry.imageUrl,
      lastUsed: new Date().toISOString(),
      frequency: 1,
    });
  }
  
  items.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
  
  saveQuickLogItems(items.slice(0, 20));
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    localStorage.removeItem(`${STORAGE_KEYS.FOOD_ENTRIES}_${dateKey}`);
  }
}

export function exportData(): string {
  const data = {
    profile: loadUserProfile(),
    targets: loadDailyTargets(),
    settings: loadAppSettings(),
    quickLogItems: loadQuickLogItems(),
    history: getHistoricalData(90),
  };
  
  return JSON.stringify(data, null, 2);
}

export function importData(jsonData: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data = JSON.parse(jsonData);
    
    if (data.profile) saveUserProfile(data.profile);
    if (data.targets) saveDailyTargets(data.targets);
    if (data.settings) saveAppSettings(data.settings);
    if (data.quickLogItems) saveQuickLogItems(data.quickLogItems);
    
    if (data.history) {
      data.history.forEach((day: DailyProgress) => {
        const entriesKey = `${STORAGE_KEYS.FOOD_ENTRIES}_${day.date}`;
        localStorage.setItem(entriesKey, JSON.stringify(day.entries));
      });
    }
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format');
  }
}
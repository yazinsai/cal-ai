export interface UserProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal?: 'lose_weight' | 'maintain' | 'gain_muscle';
  currentWeight?: number;
  height?: number;
  units?: 'metric' | 'imperial';
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  timestamp: string;
  imageUrl?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  portion?: string;
  confidence?: number;
}

export interface DailyTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
}

export interface DailyProgress {
  date: string;
  entries: FoodEntry[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
  };
}

export interface MacroPercentages {
  protein: number;
  carbs: number;
  fat: number;
}

export interface AppSettings {
  apiKey?: string;
  quickCapture: boolean;
  autoSubmit: boolean;
  darkMode: boolean;
  notifications: boolean;
  reminderTimes?: string[];
}

export interface QuickLogItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  imageUrl?: string;
  lastUsed?: string;
  frequency?: number;
  starred?: boolean;
}
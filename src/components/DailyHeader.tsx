'use client';

import { DailyProgress, DailyTarget } from '@/types';

interface DailyHeaderProps {
  progress: DailyProgress;
  targets: DailyTarget | null;
}

export function DailyHeader({ progress, targets }: DailyHeaderProps) {
  if (!targets) return null;

  const remaining = {
    calories: targets.calories - progress.totals.calories,
    protein: targets.protein - progress.totals.protein,
    carbs: targets.carbs - progress.totals.carbs,
    fat: targets.fat - progress.totals.fat,
    sugar: targets.sugar - progress.totals.sugar,
  };

  const getChipColor = (value: number, isCalories: boolean = false) => {
    if (isCalories) {
      if (value < -100) return 'bg-red-500 text-white';
      if (value < 0) return 'bg-amber-500 text-white';
      if (value < 200) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    
    if (value < -5) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (value < 0) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sticky top-16 z-30">
      <div className="space-y-3">
        {/* Main calories display */}
        <div className="text-center">
          <div className={`mb-2 ${remaining.calories >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span className="text-3xl font-bold">{(remaining.calories >= 0 ? remaining.calories : Math.abs(remaining.calories)).toLocaleString()}</span>
            <span className="text-xl ml-2">{remaining.calories >= 0 ? 'left' : 'over'}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {progress.totals.calories.toLocaleString()} of {targets.calories.toLocaleString()} calories consumed
          </div>
        </div>

        {/* Macro chips */}
        <div className="grid grid-cols-4 gap-2">
          <div className={`px-2 py-1.5 rounded-lg text-center ${getChipColor(remaining.protein)}`}>
            <div className="text-xs font-medium">Protein</div>
            <div className="text-sm font-bold">
              {remaining.protein >= 0 ? `${remaining.protein}g` : `+${Math.abs(remaining.protein)}g`}
            </div>
          </div>
          
          <div className={`px-2 py-1.5 rounded-lg text-center ${getChipColor(remaining.carbs)}`}>
            <div className="text-xs font-medium">Carbs</div>
            <div className="text-sm font-bold">
              {remaining.carbs >= 0 ? `${remaining.carbs}g` : `+${Math.abs(remaining.carbs)}g`}
            </div>
          </div>
          
          <div className={`px-2 py-1.5 rounded-lg text-center ${getChipColor(remaining.fat)}`}>
            <div className="text-xs font-medium">Fat</div>
            <div className="text-sm font-bold">
              {remaining.fat >= 0 ? `${remaining.fat}g` : `+${Math.abs(remaining.fat)}g`}
            </div>
          </div>
          
          <div className={`px-2 py-1.5 rounded-lg text-center ${getChipColor(remaining.sugar, false)}`}>
            <div className="text-xs font-medium">Sugar</div>
            <div className="text-sm font-bold">
              {remaining.sugar >= 0 ? `${remaining.sugar}g` : `+${Math.abs(remaining.sugar)}g`}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
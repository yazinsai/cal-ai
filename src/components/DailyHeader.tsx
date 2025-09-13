'use client';

import { DailyProgress, DailyTarget } from '@/types';
import { AlertTriangle } from 'lucide-react';

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

  const macroPercentage = (consumed: number, target: number) => {
    return Math.min(100, Math.round((consumed / target) * 100));
  };

  const warnings = [];
  if (remaining.sugar < 0) warnings.push(`Sugar ${Math.abs(remaining.sugar)}g over`);
  if (remaining.calories < -200) warnings.push(`${Math.abs(remaining.calories)} cal over limit`);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sticky top-16 z-30">
      <div className="space-y-3">
        {/* Main calories display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {progress.totals.calories} / {targets.calories}
          </div>
          <div className={`text-lg font-semibold mt-1 ${remaining.calories >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {remaining.calories >= 0 ? `${remaining.calories} remaining` : `${Math.abs(remaining.calories)} over`}
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

        {/* Stacked horizontal bar for macros */}
        <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="absolute inset-0 flex">
            <div 
              className="bg-blue-500 transition-all duration-300"
              style={{ width: `${macroPercentage(progress.totals.protein, targets.protein + targets.carbs + targets.fat) * 100}%` }}
              title={`Protein: ${progress.totals.protein}g`}
            />
            <div 
              className="bg-amber-500 transition-all duration-300"
              style={{ width: `${macroPercentage(progress.totals.carbs, targets.protein + targets.carbs + targets.fat) * 100}%` }}
              title={`Carbs: ${progress.totals.carbs}g`}
            />
            <div 
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${macroPercentage(progress.totals.fat, targets.protein + targets.carbs + targets.fat) * 100}%` }}
              title={`Fat: ${progress.totals.fat}g`}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white drop-shadow">
              P: {Math.round((progress.totals.protein * 4 / (progress.totals.calories || 1)) * 100)}% |
              C: {Math.round((progress.totals.carbs * 4 / (progress.totals.calories || 1)) * 100)}% |
              F: {Math.round((progress.totals.fat * 9 / (progress.totals.calories || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-800 dark:text-amber-400">
              {warnings.join(' • ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
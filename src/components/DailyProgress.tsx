'use client';

import { useMemo } from 'react';
import { DailyTarget, DailyProgress as DailyProgressType } from '@/types';
import { Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface DailyProgressProps {
  progress: DailyProgressType;
  targets: DailyTarget | null;
}

export function DailyProgress({ progress, targets }: DailyProgressProps) {
  const percentages = useMemo(() => {
    if (!targets) return null;
    
    return {
      calories: Math.round((progress.totals.calories / targets.calories) * 100),
      protein: Math.round((progress.totals.protein / targets.protein) * 100),
      carbs: Math.round((progress.totals.carbs / targets.carbs) * 100),
      fat: Math.round((progress.totals.fat / targets.fat) * 100),
      sugar: Math.round((progress.totals.sugar / targets.sugar) * 100),
    };
  }, [progress, targets]);

  const getProgressColor = (percentage: number, isLimit = false) => {
    if (isLimit) {
      if (percentage >= 100) return 'bg-red-500';
      if (percentage >= 80) return 'bg-yellow-500';
      return 'bg-green-500';
    }
    
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getTextColor = (percentage: number, isLimit = false) => {
    if (isLimit) {
      if (percentage >= 100) return 'text-red-600';
      if (percentage >= 80) return 'text-yellow-600';
      return 'text-green-600';
    }
    
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Progress</h2>
        </div>
        
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Calendar className="w-5 h-5 mr-2" />
          <span>{format(new Date(progress.date), 'EEEE, MMMM d')}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calories</h3>
            <div className="text-right">
              <span className={`text-2xl font-bold ${targets ? getTextColor(percentages?.calories || 0) : 'text-gray-900 dark:text-white'}`}>
                {Math.round(progress.totals.calories)}
              </span>
              {targets && (
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  / {targets.calories}
                </span>
              )}
            </div>
          </div>
          
          {targets && percentages && (
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${getProgressColor(percentages.calories)} transition-all duration-300`}
                style={{ width: `${Math.min(percentages.calories, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-white dark:text-gray-200">
                  {percentages.calories}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(['protein', 'carbs', 'fat', 'sugar'] as const).map((macro) => (
            <div key={macro}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {macro}
                </span>
                <span className="text-sm">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {progress.totals[macro].toFixed(1)}g
                  </span>
                  {targets && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      / {targets[macro]}g
                    </span>
                  )}
                </span>
              </div>
              
              {targets && percentages && (
                <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full ${getProgressColor(percentages[macro], macro === 'sugar')} transition-all duration-300`}
                    style={{ width: `${Math.min(percentages[macro], 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {targets && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Calories Remaining</span>
              <span className={`text-2xl font-bold ${
                targets.calories - progress.totals.calories >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {Math.abs(targets.calories - progress.totals.calories)}
                {targets.calories - progress.totals.calories < 0 && ' over'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
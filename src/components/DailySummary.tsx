'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, TrendingUp, Target, Zap } from 'lucide-react';
import { DailyTarget, FoodEntry } from '@/types';

interface DailySummaryProps {
  entries: FoodEntry[];
  targets: DailyTarget;
}

// Move CustomTooltip outside to prevent recreation on every render
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { grams: number } }> }) => {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-sm">{payload[0].payload.grams}g</p>
        <p className="text-sm">{payload[0].value} cal</p>
      </div>
    );
  }
  return null;
};

export default function DailySummary({ entries, targets }: DailySummaryProps) {
  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
      sugar: acc.sugar + entry.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
  );
  
  // Round all totals to avoid floating point issues
  totals.calories = Math.round(totals.calories);
  totals.protein = Math.round(totals.protein);
  totals.carbs = Math.round(totals.carbs);
  totals.fat = Math.round(totals.fat);
  totals.sugar = Math.round(totals.sugar);

  const caloriesRemaining = targets.calories - totals.calories;
  const isOverCalories = caloriesRemaining < 0;

  // Memoize macroData to prevent recreation on every render
  const macroData = useMemo(() => [
    { name: 'Protein', value: Math.round(totals.protein * 4), grams: Math.round(totals.protein) },
    { name: 'Carbs', value: Math.round(totals.carbs * 4), grams: Math.round(totals.carbs) },
    { name: 'Fat', value: Math.round(totals.fat * 9), grams: Math.round(totals.fat) },
  ], [totals.protein, totals.carbs, totals.fat]);

  const COLORS = {
    Protein: '#10b981',
    Carbs: '#3b82f6',
    Fat: '#f59e0b',
  };

  const getMealSuggestions = () => {
    const suggestions = [];
    const remainingProtein = targets.protein - totals.protein;
    const remainingCarbs = targets.carbs - totals.carbs;
    const remainingFat = targets.fat - totals.fat;

    if (caloriesRemaining > 300) {
      if (remainingProtein > 20) {
        suggestions.push('Consider a protein-rich meal (chicken, fish, tofu)');
      }
      if (remainingCarbs > 30) {
        suggestions.push('You have room for healthy carbs (quinoa, sweet potato)');
      }
      if (remainingFat > 10) {
        suggestions.push('Add healthy fats (avocado, nuts, olive oil)');
      }
    } else if (caloriesRemaining > 100) {
      suggestions.push('Perfect for a light snack (fruit, yogurt, or nuts)');
    }

    return suggestions;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${isOverCalories ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className={`w-5 h-5 ${isOverCalories ? 'text-red-600' : 'text-green-600'}`} />
                <h3 className="font-semibold text-gray-900 dark:text-white">Calories</h3>
              </div>
              <span className={`text-2xl font-bold ${isOverCalories ? 'text-red-600' : 'text-green-600'}`}>
                {Math.abs(caloriesRemaining)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isOverCalories ? 'Over target' : 'Remaining'}
            </p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {totals.calories} / {targets.calories} cal
            </div>
          </div>

          {totals.sugar > targets.sugar && (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Sugar Warning</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Sugar intake ({Math.round(totals.sugar)}g) exceeds limit ({targets.sugar}g)
              </p>
            </div>
          )}

          {!isOverCalories && caloriesRemaining > 100 && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Meal Suggestions</h3>
              </div>
              <ul className="space-y-1">
                {getMealSuggestions().map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Macro Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-4">
            {macroData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.name}: {entry.grams}g
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
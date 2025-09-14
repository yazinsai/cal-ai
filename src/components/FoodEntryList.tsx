'use client';

import { FoodEntry } from '@/types';
import { updateFoodEntry, deleteFoodEntry } from '@/lib/storage';
import { format } from 'date-fns';
import { Plus, Minus, Trash2, Clock, Coffee, Sun, Moon, Cookie } from 'lucide-react';

interface FoodEntryListProps {
  entries: FoodEntry[];
  onUpdate?: () => void;
}

export function FoodEntryList({ entries, onUpdate }: FoodEntryListProps) {

  const getMealIcon = (mealType?: FoodEntry['mealType']) => {
    switch (mealType) {
      case 'breakfast':
        return <Coffee className="w-4 h-4" />;
      case 'lunch':
        return <Sun className="w-4 h-4" />;
      case 'dinner':
        return <Moon className="w-4 h-4" />;
      case 'snack':
        return <Cookie className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const adjustCalories = (id: string, amount: number) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      const newCalories = Math.max(0, entry.calories + amount);
      const ratio = newCalories / entry.calories;
      updateFoodEntry(id, {
        calories: Math.round(newCalories),
        protein: Math.round(entry.protein * ratio),
        carbs: Math.round(entry.carbs * ratio),
        fat: Math.round(entry.fat * ratio),
        sugar: Math.round(entry.sugar * ratio),
      });
      if (onUpdate) onUpdate();
    }
  };

  const handleDelete = (id: string) => {
    deleteFoodEntry(id);
    if (onUpdate) onUpdate();
  };

  const groupedEntries = entries.reduce((acc, entry) => {
    const mealType = entry.mealType || 'other';
    if (!acc[mealType]) acc[mealType] = [];
    acc[mealType].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Today&apos;s Entries</h2>

      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No food entries yet. Start by adding your first meal!
        </p>
      ) : (
        <div className="space-y-6">
          {mealOrder.map((mealType) => {
            const mealEntries = groupedEntries[mealType];
            if (!mealEntries || mealEntries.length === 0) return null;

            const mealTotal = mealEntries.reduce((sum, entry) => sum + entry.calories, 0);

            return (
              <div key={mealType}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getMealIcon(mealType as FoodEntry['mealType'])}
                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {mealType}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {mealTotal} cal
                  </span>
                </div>

                <div className="space-y-2">
                  {mealEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {entry.name}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>{Math.round(entry.calories)} cal</span>
                            <span>P: {entry.protein.toFixed(1)}g</span>
                            <span>C: {entry.carbs.toFixed(1)}g</span>
                            <span>F: {entry.fat.toFixed(1)}g</span>
                            <span className="text-xs">
                              {format(new Date(entry.timestamp), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => adjustCalories(entry.id, 50)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Add 50 calories"
                          >
                            <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </button>
                          <button
                            onClick={() => adjustCalories(entry.id, -50)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Remove 50 calories"
                          >
                            <Minus className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900 dark:text-white">Total</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-500">
                  {entries.reduce((sum, entry) => sum + entry.calories, 0)} calories
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  P: {entries.reduce((sum, entry) => sum + entry.protein, 0)}g |
                  C: {entries.reduce((sum, entry) => sum + entry.carbs, 0)}g |
                  F: {entries.reduce((sum, entry) => sum + entry.fat, 0)}g
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
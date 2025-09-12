'use client';

import { useState } from 'react';
import { FoodEntry } from '@/types';
import { updateFoodEntry, deleteFoodEntry } from '@/lib/storage';
import { format } from 'date-fns';
import { Edit2, Trash2, Check, X, Clock, Coffee, Sun, Moon, Cookie } from 'lucide-react';

interface FoodEntryListProps {
  entries: FoodEntry[];
  onUpdate?: () => void;
}

export function FoodEntryList({ entries, onUpdate }: FoodEntryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<FoodEntry>>({});

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

  const startEdit = (entry: FoodEntry) => {
    setEditingId(entry.id);
    setEditValues({
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      sugar: entry.sugar,
    });
  };

  const saveEdit = () => {
    if (editingId) {
      updateFoodEntry(editingId, editValues);
      setEditingId(null);
      setEditValues({});
      if (onUpdate) onUpdate();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteFoodEntry(id);
      if (onUpdate) onUpdate();
    }
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
                      {editingId === entry.id ? (
                        <div className="space-y-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {entry.name}
                          </div>
                          
                          <div className="grid grid-cols-5 gap-2">
                            {(['calories', 'protein', 'carbs', 'fat', 'sugar'] as const).map((field) => (
                              <div key={field}>
                                <label className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                  {field === 'calories' ? 'Cal' : field}
                                </label>
                                <input
                                  type="number"
                                  value={editValues[field] || 0}
                                  onChange={(e) => setEditValues({
                                    ...editValues,
                                    [field]: parseInt(e.target.value) || 0,
                                  })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                />
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="flex-1 py-1 px-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors"
                            >
                              <Check className="w-4 h-4 mx-auto" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex-1 py-1 px-3 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
                            >
                              <X className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {entry.name}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <span>{entry.calories} cal</span>
                              <span>P: {entry.protein}g</span>
                              <span>C: {entry.carbs}g</span>
                              <span>F: {entry.fat}g</span>
                              <span className="text-xs">
                                {format(new Date(entry.timestamp), 'h:mm a')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEdit(entry)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      )}
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
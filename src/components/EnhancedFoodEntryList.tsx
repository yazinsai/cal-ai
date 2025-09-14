'use client';

import { useState } from 'react';
import { FoodEntry } from '@/types';
import { updateFoodEntry, deleteFoodEntry, saveFoodEntry } from '@/lib/storage';
import { Plus, Minus, Trash2, Coffee, Sun, Moon, Cookie, CheckCircle } from 'lucide-react';

interface EnhancedFoodEntryListProps {
  entries: FoodEntry[];
  onUpdate?: () => void;
}

export function EnhancedFoodEntryList({ entries, onUpdate }: EnhancedFoodEntryListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [undoEntry, setUndoEntry] = useState<{ entry: FoodEntry; action: string } | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const getMealIcon = (mealType?: FoodEntry['mealType']) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="w-4 h-4" />;
      case 'lunch': return <Sun className="w-4 h-4" />;
      case 'dinner': return <Moon className="w-4 h-4" />;
      case 'snack': return <Cookie className="w-4 h-4" />;
      default: return null;
    }
  };


  const handleDelete = (entry: FoodEntry) => {
    setUndoEntry({ entry, action: 'delete' });
    deleteFoodEntry(entry.id);
    if (onUpdate) onUpdate();
    
    setTimeout(() => setUndoEntry(null), 5000);
  };

  const handleUndo = () => {
    if (undoEntry) {
      if (undoEntry.action === 'delete') {
        saveFoodEntry(undoEntry.entry);
        if (onUpdate) onUpdate();
      }
      setUndoEntry(null);
    }
  };

  const handleBulkDelete = () => {
    const entriesToDelete = entries.filter(e => selectedIds.has(e.id));
    entriesToDelete.forEach(entry => deleteFoodEntry(entry.id));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    if (onUpdate) onUpdate();
  };

  const handleBulkDuplicate = () => {
    const entriesToDuplicate = entries.filter(e => selectedIds.has(e.id));
    entriesToDuplicate.forEach(entry => {
      const newEntry: FoodEntry = {
        ...entry,
        id: `food_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
      };
      saveFoodEntry(newEntry);
    });
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    if (onUpdate) onUpdate();
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const adjustValue = (entry: FoodEntry, field: keyof FoodEntry, delta: number) => {
    if (field === 'calories') {
      // When adjusting calories, scale all macros proportionally
      const newCalories = Math.max(0, entry.calories + delta);
      const ratio = entry.calories > 0 ? newCalories / entry.calories : 1;
      
      updateFoodEntry(entry.id, {
        calories: newCalories,
        protein: Math.round(entry.protein * ratio * 10) / 10,
        carbs: Math.round(entry.carbs * ratio * 10) / 10,
        fat: Math.round(entry.fat * ratio * 10) / 10,
        sugar: Math.round(entry.sugar * ratio * 10) / 10,
      });
    } else {
      // For direct macro adjustments (if needed elsewhere)
      updateFoodEntry(entry.id, {
        [field]: Math.max(0, (entry[field] as number) + delta),
      });
    }
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today&apos;s Entries</h2>
          {entries.length > 0 && (
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds(new Set());
              }}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              {isSelectionMode ? 'Cancel' : 'Select'}
            </button>
          )}
        </div>
        
        {isSelectionMode && selectedIds.size > 0 && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleBulkDelete}
              className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              Delete ({selectedIds.size})
            </button>
            <button
              onClick={handleBulkDuplicate}
              className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
            >
              Duplicate ({selectedIds.size})
            </button>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No entries yet. Tap + to add your first meal!
        </p>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mealOrder.map((mealType) => {
            const mealEntries = groupedEntries[mealType];
            if (!mealEntries || mealEntries.length === 0) return null;

            const mealTotal = mealEntries.reduce((sum, entry) => sum + entry.calories, 0);

            return (
              <div key={mealType}>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMealIcon(mealType as FoodEntry['mealType'])}
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {mealType}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {mealTotal} cal
                    </span>
                  </div>
                </div>

                {mealEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`relative overflow-hidden ${
                      swipedId === entry.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div
                      className="px-4 py-3 flex items-center gap-3 touch-pan-y"
                      onTouchStart={(e) => {
                        const touch = e.touches[0];
                        const startX = touch.clientX;
                        
                        const handleTouchMove = (e: TouchEvent) => {
                          const touch = e.touches[0];
                          const diff = touch.clientX - startX;
                          
                          if (Math.abs(diff) > 50) {
                            setSwipedId(entry.id);
                          }
                        };
                        
                        const handleTouchEnd = () => {
                          document.removeEventListener('touchmove', handleTouchMove);
                          document.removeEventListener('touchend', handleTouchEnd);
                        };
                        
                        document.addEventListener('touchmove', handleTouchMove);
                        document.addEventListener('touchend', handleTouchEnd);
                      }}
                    >
                      {isSelectionMode && (
                        <button
                          onClick={() => toggleSelection(entry.id)}
                          className="mr-2"
                        >
                          <CheckCircle 
                            className={`w-5 h-5 ${
                              selectedIds.has(entry.id) 
                                ? 'text-blue-500 fill-current' 
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {entry.name}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                            {entry.calories} cal
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span>P: {entry.protein.toFixed(1)}g</span>
                          <span>C: {entry.carbs.toFixed(1)}g</span>
                          <span>F: {entry.fat.toFixed(1)}g</span>
                          <span>S: {entry.sugar.toFixed(1)}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustValue(entry, 'calories', -10)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => adjustValue(entry, 'calories', 10)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {!isSelectionMode && (
                        <button
                          onClick={() => handleDelete(entry)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded ml-2"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {undoEntry && (
        <div className="fixed bottom-20 left-4 right-4 bg-gray-900 text-white p-3 rounded-lg shadow-lg flex items-center justify-between z-40">
          <span>Entry deleted</span>
          <button
            onClick={handleUndo}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
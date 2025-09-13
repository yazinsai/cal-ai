'use client';

import { useState, useEffect } from 'react';
import { FoodEntry, QuickLogItem } from '@/types';
import { saveFoodEntry, loadQuickLogItems, saveQuickLogItems } from '@/lib/storage';
import { Star, Clock, Plus, Minus, X } from 'lucide-react';

interface SmartRecentsProps {
  onEntryAdded: (entry: FoodEntry) => void;
}

export function SmartRecents({ onEntryAdded }: SmartRecentsProps) {
  const [recents, setRecents] = useState<QuickLogItem[]>([]);
  const [starred, setStarred] = useState<QuickLogItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(1);

  useEffect(() => {
    loadRecents();
  }, []);

  const loadRecents = () => {
    const items = loadQuickLogItems();
    const starredItems = items.filter(item => item.starred);
    const recentItems = items
      .filter(item => !item.starred)
      .sort((a, b) => {
        // Sort by frequency and recency
        const scoreA = (a.frequency || 0) * 2 + (a.lastUsed ? new Date(a.lastUsed).getTime() / 1000000000 : 0);
        const scoreB = (b.frequency || 0) * 2 + (b.lastUsed ? new Date(b.lastUsed).getTime() / 1000000000 : 0);
        return scoreB - scoreA;
      })
      .slice(0, 20);
    
    setStarred(starredItems);
    setRecents(recentItems);
  };

  const getMealType = (): FoodEntry['mealType'] => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  const handleQuickAdd = (item: QuickLogItem, multiplier: number = 1) => {
    const entry: FoodEntry = {
      id: `food_${Date.now()}`,
      name: item.name,
      calories: item.calories * multiplier,
      protein: item.protein * multiplier,
      carbs: item.carbs * multiplier,
      fat: item.fat * multiplier,
      sugar: item.sugar * multiplier,
      timestamp: new Date().toISOString(),
      imageUrl: item.imageUrl,
      mealType: getMealType(),
    };
    
    saveFoodEntry(entry);
    onEntryAdded(entry);
    
    // Update frequency
    const items = loadQuickLogItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      items[index].frequency = (items[index].frequency || 0) + 1;
      items[index].lastUsed = new Date().toISOString();
      saveQuickLogItems(items);
      loadRecents();
    }
  };

  const handleEditQty = (item: QuickLogItem) => {
    handleQuickAdd(item, editQty);
    setEditingId(null);
    setEditQty(1);
  };

  const toggleStar = (item: QuickLogItem) => {
    const items = loadQuickLogItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      items[index].starred = !items[index].starred;
      saveQuickLogItems(items);
      loadRecents();
    }
  };

  return (
    <div className="space-y-3">
      {starred.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Favorites</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {starred.map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => handleQuickAdd(item)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setEditingId(item.id);
                  }}
                  className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {item.calories} cal
                  </div>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(item);
                  }}
                  className="absolute -top-1 -right-1 p-0.5 bg-white dark:bg-gray-800 rounded-full shadow"
                >
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                </button>

                <div className="absolute top-0 right-8 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAdd(item, 2);
                    }}
                    className="px-1.5 py-0.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                  >
                    x2
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAdd(item, 3);
                    }}
                    className="px-1.5 py-0.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                  >
                    x3
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recents.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 mr-1 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recents</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recents.map((item) => (
              <div key={item.id} className="relative group">
                {editingId === item.id ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setEditQty(Math.max(1, editQty - 1))}
                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={editQty}
                      onChange={(e) => setEditQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 text-center text-sm bg-transparent"
                    />
                    <button
                      onClick={() => setEditQty(editQty + 1)}
                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditQty(item)}
                      className="ml-1 px-2 py-0.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditQty(1);
                      }}
                      className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleQuickAdd(item)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setEditingId(item.id);
                      }}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {item.calories} cal
                      </div>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(item);
                      }}
                      className="absolute -top-1 -right-1 p-0.5 bg-white dark:bg-gray-800 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star className="w-3 h-3 text-gray-400" />
                    </button>

                    <div className="absolute top-0 right-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdd(item, 2);
                        }}
                        className="px-1.5 py-0.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                      >
                        x2
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdd(item, 3);
                        }}
                        className="px-1.5 py-0.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                      >
                        x3
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { FoodEntry as FoodEntryType, QuickLogItem } from '@/types';
import { saveFoodEntry, loadQuickLogItems } from '@/lib/storage';
import { useAI } from '@/hooks/useAI';
import { Camera } from './Camera';
import { Plus, Minus, Check, Loader2, Zap, Edit2, X, Save } from 'lucide-react';

interface FoodEntryProps {
  onEntryAdded?: (entry: FoodEntryType) => void;
}

export function FoodEntry({ onEntryAdded }: FoodEntryProps) {
  const [description, setDescription] = useState('');
  const [currentEntry, setCurrentEntry] = useState<Partial<FoodEntryType> | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [reanalyzing, setReanalyzing] = useState(false);
  const [quickLogItems, setQuickLogItems] = useState<QuickLogItem[]>([]);
  const showQuickLog = true;
  const { loading, analyzeImage, analyzeText } = useAI();

  useEffect(() => {
    setQuickLogItems(loadQuickLogItems());
  }, []);

  const getMealType = (): FoodEntryType['mealType'] => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  const handleImageCapture = async (imageBase64: string) => {
    const result = await analyzeImage(imageBase64);
    if (result) {
      const entry: FoodEntryType = {
        id: `food_${Date.now()}`,
        name: result.name || 'Unknown food',
        calories: result.calories || 0,
        protein: result.protein || 0,
        carbs: result.carbs || 0,
        fat: result.fat || 0,
        sugar: result.sugar || 0,
        timestamp: new Date().toISOString(),
        imageUrl: imageBase64,
        mealType: getMealType(),
        confidence: result.confidence,
      };
      
      // Show the entry for review/confirmation
      setCurrentEntry(entry);
    }
  };

  const handleTextSubmit = async () => {
    if (!description.trim()) return;
    
    const result = await analyzeText(description);
    if (result) {
      const entry: FoodEntryType = {
        id: `food_${Date.now()}`,
        name: result.name || description,
        calories: result.calories || 0,
        protein: result.protein || 0,
        carbs: result.carbs || 0,
        fat: result.fat || 0,
        sugar: result.sugar || 0,
        timestamp: new Date().toISOString(),
        mealType: getMealType(),
        confidence: result.confidence,
      };
      
      // Auto-save the entry for quick logging
      saveFoodEntry(entry);
      
      if (onEntryAdded) {
        onEntryAdded(entry);
      }
      
      // Clear the input for next entry
      setDescription('');
      
      // Optionally show the entry for review (but it's already saved)
      setCurrentEntry(entry);
    }
  };

  const handleQuickLog = (item: QuickLogItem) => {
    const entry: FoodEntryType = {
      id: `food_${Date.now()}`,
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      sugar: item.sugar,
      timestamp: new Date().toISOString(),
      imageUrl: item.imageUrl,
      mealType: getMealType(),
    };
    
    setCurrentEntry(entry);
  };

  const confirmEntry = () => {
    if (currentEntry) {
      const fullEntry = currentEntry as FoodEntryType;
      saveFoodEntry(fullEntry);
      
      if (onEntryAdded) {
        onEntryAdded(fullEntry);
      }
      
      setCurrentEntry(null);
      setDescription('');
      setQuickLogItems(loadQuickLogItems());
    }
  };

  const adjustValue = (field: keyof FoodEntryType, delta: number) => {
    if (currentEntry) {
      setCurrentEntry({
        ...currentEntry,
        [field]: Math.max(0, ((currentEntry[field] as number) || 0) + delta),
      });
    }
  };

  const startEditingName = () => {
    if (currentEntry) {
      setTempName(currentEntry.name || '');
      setEditingName(true);
    }
  };

  const cancelEditingName = () => {
    setEditingName(false);
    setTempName('');
  };

  const saveEditedName = async () => {
    if (!tempName.trim() || !currentEntry) return;
    
    setReanalyzing(true);
    setEditingName(false);
    
    // Re-analyze with the new description
    const result = await analyzeText(tempName);
    if (result) {
      setCurrentEntry({
        ...currentEntry,
        name: result.name || tempName,
        calories: result.calories || currentEntry.calories || 0,
        protein: result.protein || currentEntry.protein || 0,
        carbs: result.carbs || currentEntry.carbs || 0,
        fat: result.fat || currentEntry.fat || 0,
        sugar: result.sugar || currentEntry.sugar || 0,
        confidence: result.confidence,
      });
    }
    
    setReanalyzing(false);
    setTempName('');
  };


  return (
    <div className="space-y-4">
      <Camera onCapture={handleImageCapture} autoSubmit={true} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
            placeholder="Type what you ate..."
            className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          
          <button
            onClick={handleTextSubmit}
            disabled={!description.trim() || loading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Add'}
          </button>
        </div>
      </div>

      {showQuickLog && quickLogItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex items-center mb-3">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Quick Log</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {quickLogItems.slice(0, 8).map((item) => (
              <button
                key={item.id}
                onClick={() => handleQuickLog(item)}
                className="p-3 text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.calories} cal
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center justify-center">
          <Loader2 className="w-6 h-6 mr-2 animate-spin text-blue-500" />
          <span className="text-blue-700 dark:text-blue-300">Analyzing food...</span>
        </div>
      )}

      {currentEntry && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-4">
            {editingName ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && saveEditedName()}
                  className="flex-1 px-3 py-2 text-xl font-bold border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={saveEditedName}
                  disabled={reanalyzing}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={cancelEditingName}
                  className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentEntry.name}
                </h3>
                <button
                  onClick={startEditingName}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit name to recalculate nutrition"
                >
                  <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            )}
            
            <div className="text-3xl font-bold text-blue-500 mb-4">
              {currentEntry.calories} calories
            </div>
            
            {reanalyzing && (
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mb-2">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recalculating nutrition...
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {(['protein', 'carbs', 'fat', 'sugar'] as const).map((macro) => (
              <div key={macro} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-1">
                  {macro}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => adjustValue(macro, -1)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {currentEntry[macro]}g
                  </span>
                  <button
                    onClick={() => adjustValue(macro, 1)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {currentEntry.confidence && (
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Confidence: {Math.round(currentEntry.confidence * 100)}%
            </div>
          )}

          <button
            onClick={confirmEntry}
            className="w-full flex items-center justify-center py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            <Check className="w-5 h-5 mr-2" />
            Confirm & Save
          </button>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { FoodEntry as FoodEntryType, QuickLogItem } from '@/types';
import { saveFoodEntry, loadQuickLogItems } from '@/lib/storage';
import { useAI } from '@/hooks/useAI';
import { Camera } from './Camera';
import { Mic, MicOff, Plus, Minus, Check, Loader2, Zap } from 'lucide-react';

interface FoodEntryProps {
  onEntryAdded?: (entry: FoodEntryType) => void;
}

export function FoodEntry({ onEntryAdded }: FoodEntryProps) {
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<FoodEntryType> | null>(null);
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
      
      // Auto-save the entry for quick logging
      saveFoodEntry(entry);
      
      if (onEntryAdded) {
        onEntryAdded(entry);
      }
      
      // Optionally show the entry for review (but it's already saved)
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

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
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
            placeholder="Type or speak what you ate..."
            className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          
          <button
            onClick={isListening ? undefined : startListening}
            className={`p-3 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {currentEntry.name}
            </h3>
            
            <div className="text-3xl font-bold text-blue-500 mb-4">
              {currentEntry.calories} calories
            </div>
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
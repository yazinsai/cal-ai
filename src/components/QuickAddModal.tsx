'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Check, Camera, Loader2, Plus, Minus } from 'lucide-react';
import { FoodEntry } from '@/types';
import { saveFoodEntry } from '@/lib/storage';
import { useAI } from '@/hooks/useAI';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryAdded: (entry: FoodEntry) => void;
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export function QuickAddModal({ isOpen, onClose, onEntryAdded }: QuickAddModalProps) {
  const [input, setInput] = useState('');
  const [confirmData, setConfirmData] = useState<Partial<FoodEntry> | null>(null);
  const [quantity, setQuantity] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { loading, analyzeText, analyzeImage } = useAI();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const getMealType = (): FoodEntry['mealType'] => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    const result = await analyzeText(input);
    if (result) {
      if ((result.confidence || 0) >= 0.9) {
        // High confidence - auto-add immediately
        const entry: FoodEntry = {
          id: `food_${Date.now()}`,
          name: result.name || input,
          calories: result.calories || 0,
          protein: result.protein || 0,
          carbs: result.carbs || 0,
          fat: result.fat || 0,
          sugar: result.sugar || 0,
          timestamp: new Date().toISOString(),
          mealType: getMealType(),
          confidence: result.confidence,
        };
        
        saveFoodEntry(entry);
        onEntryAdded(entry);
        setInput('');
        onClose();
      } else {
        // Low confidence - show confirmation
        setConfirmData({
          id: `food_${Date.now()}`,
          name: result.name || input,
          calories: result.calories || 0,
          protein: result.protein || 0,
          carbs: result.carbs || 0,
          fat: result.fat || 0,
          sugar: result.sugar || 0,
          mealType: getMealType(),
          confidence: result.confidence,
        });
      }
    }
  };

  const confirmEntry = () => {
    if (confirmData) {
      const entry = {
        ...confirmData,
        calories: (confirmData.calories || 0) * quantity,
        protein: (confirmData.protein || 0) * quantity,
        carbs: (confirmData.carbs || 0) * quantity,
        fat: (confirmData.fat || 0) * quantity,
        sugar: (confirmData.sugar || 0) * quantity,
        timestamp: new Date().toISOString(),
      } as FoodEntry;
      
      saveFoodEntry(entry);
      onEntryAdded(entry);
      setConfirmData(null);
      setInput('');
      setQuantity(1);
      onClose();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      setInput(text);
      setTimeout(() => handleSubmit(), 100);
    }
  };


  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const result = await analyzeImage(base64);
          if (result) {
            const entry: FoodEntry = {
              id: `food_${Date.now()}`,
              name: result.name || 'Unknown food',
              calories: result.calories || 0,
              protein: result.protein || 0,
              carbs: result.carbs || 0,
              fat: result.fat || 0,
              sugar: result.sugar || 0,
              timestamp: new Date().toISOString(),
              imageUrl: base64,
              mealType: getMealType(),
              confidence: result.confidence,
            };
            
            if ((result.confidence || 0) >= 0.9) {
              saveFoodEntry(entry);
              onEntryAdded(entry);
              onClose();
            } else {
              setConfirmData(entry);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {!confirmData ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                  if (e.key === 'Escape') {
                    onClose();
                  }
                }}
                placeholder="What did you eat?"
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              <button
                onClick={handleCameraCapture}
                className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Analyzing...</span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirm Entry
            </h3>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-500">
                {confirmData.name}
              </div>
              <div className="text-xl text-gray-700 dark:text-gray-300">
                {(confirmData.calories || 0) * quantity} calories
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              {mealTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setConfirmData({ ...confirmData, mealType: type })}
                  className={`flex-1 py-2 px-3 rounded-lg capitalize text-sm font-medium transition-colors ${
                    confirmData.mealType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <div className="text-gray-500 dark:text-gray-400">Protein</div>
                <div className="font-semibold">{(confirmData.protein || 0) * quantity}g</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <div className="text-gray-500 dark:text-gray-400">Carbs</div>
                <div className="font-semibold">{(confirmData.carbs || 0) * quantity}g</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <div className="text-gray-500 dark:text-gray-400">Fat</div>
                <div className="font-semibold">{(confirmData.fat || 0) * quantity}g</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <div className="text-gray-500 dark:text-gray-400">Sugar</div>
                <div className="font-semibold">{(confirmData.sugar || 0) * quantity}g</div>
              </div>
            </div>

            {confirmData.confidence && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Confidence: {Math.round(confirmData.confidence * 100)}%
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={confirmEntry}
                className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                <Check className="w-5 h-5 mr-2" />
                Add Entry
              </button>
              <button
                onClick={() => {
                  setConfirmData(null);
                  setQuantity(1);
                }}
                className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
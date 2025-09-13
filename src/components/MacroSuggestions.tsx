'use client';

import { useState } from 'react';
import { DailyProgress, DailyTarget, FoodEntry } from '@/types';
import { saveFoodEntry } from '@/lib/storage';
import { Sparkles, Info, Plus } from 'lucide-react';

interface MacroSuggestionsProps {
  progress: DailyProgress;
  targets: DailyTarget | null;
  onEntryAdded: (entry: FoodEntry) => void;
}

const suggestions = [
  // High protein, low sugar
  { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0 },
  { name: 'Greek Yogurt (Plain)', calories: 100, protein: 17, carbs: 6, fat: 0.7, sugar: 4 },
  { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, sugar: 2.7 },
  { name: 'Hard Boiled Eggs (2)', calories: 155, protein: 13, carbs: 1.1, fat: 11, sugar: 1.1 },
  { name: 'Tuna (in water)', calories: 116, protein: 26, carbs: 0, fat: 1, sugar: 0 },
  
  // Balanced options
  { name: 'Apple with Peanut Butter', calories: 267, protein: 8, carbs: 35, fat: 13, sugar: 20 },
  { name: 'Protein Shake', calories: 200, protein: 20, carbs: 20, fat: 5, sugar: 5 },
  { name: 'Turkey Sandwich', calories: 350, protein: 24, carbs: 35, fat: 12, sugar: 5 },
  { name: 'Mixed Nuts (30g)', calories: 180, protein: 5, carbs: 8, fat: 16, sugar: 1 },
  { name: 'Avocado Toast', calories: 250, protein: 6, carbs: 30, fat: 14, sugar: 3 },
  
  // Lower calorie options
  { name: 'Baby Carrots with Hummus', calories: 150, protein: 5, carbs: 20, fat: 7, sugar: 6 },
  { name: 'Rice Cakes (2)', calories: 70, protein: 1, carbs: 15, fat: 0.5, sugar: 0 },
  { name: 'String Cheese', calories: 80, protein: 6, carbs: 1, fat: 6, sugar: 0 },
  { name: 'Edamame', calories: 95, protein: 8, carbs: 7, fat: 4, sugar: 2 },
  { name: 'Cucumber Slices', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, sugar: 1.7 },
  
  // Higher calorie options
  { name: 'Protein Bar', calories: 250, protein: 20, carbs: 25, fat: 9, sugar: 8 },
  { name: 'Trail Mix', calories: 350, protein: 10, carbs: 35, fat: 22, sugar: 15 },
  { name: 'Banana with Almond Butter', calories: 300, protein: 8, carbs: 35, fat: 16, sugar: 18 },
  { name: 'Quinoa Bowl', calories: 400, protein: 15, carbs: 55, fat: 12, sugar: 5 },
  { name: 'Salmon Filet', calories: 280, protein: 35, carbs: 0, fat: 15, sugar: 0 },
];

export function MacroSuggestions({ progress, targets, onEntryAdded }: MacroSuggestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  if (!targets) return null;

  const remaining = {
    calories: targets.calories - progress.totals.calories,
    protein: targets.protein - progress.totals.protein,
    carbs: targets.carbs - progress.totals.carbs,
    fat: targets.fat - progress.totals.fat,
    sugar: targets.sugar - progress.totals.sugar,
  };

  // Filter and score suggestions based on remaining macros
  const scoredSuggestions = suggestions
    .filter(s => s.calories >= 150 && s.calories <= Math.min(400, remaining.calories + 50))
    .map(s => {
      let score = 0;
      
      // Prioritize protein if needed
      if (remaining.protein > 10) {
        score += (s.protein / remaining.protein) * 100;
      }
      
      // Penalize if over sugar limit
      if (remaining.sugar < 5 && s.sugar > 5) {
        score -= 50;
      }
      
      // Balance macros
      const proteinRatio = s.protein * 4 / s.calories;
      const carbRatio = s.carbs * 4 / s.calories;
      const fatRatio = s.fat * 9 / s.calories;
      
      // Prefer balanced or protein-heavy options
      if (proteinRatio > 0.25) score += 30;
      if (carbRatio < 0.5) score += 20;
      if (fatRatio < 0.4) score += 10;
      
      // Bonus for fitting within remaining calories
      const calorieFit = 1 - Math.abs(s.calories - (remaining.calories * 0.3)) / remaining.calories;
      score += calorieFit * 50;
      
      return { ...s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const getMealType = (): FoodEntry['mealType'] => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  const handleAddSuggestion = (suggestion: typeof suggestions[0]) => {
    const entry: FoodEntry = {
      id: `food_${Date.now()}`,
      name: suggestion.name,
      calories: suggestion.calories,
      protein: suggestion.protein,
      carbs: suggestion.carbs,
      fat: suggestion.fat,
      sugar: suggestion.sugar,
      timestamp: new Date().toISOString(),
      mealType: getMealType(),
    };
    
    saveFoodEntry(entry);
    onEntryAdded(entry);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <button
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">What fits now?</span>
        </div>
        <span className="text-sm opacity-90">
          {remaining.protein > 0 ? `+${Math.round(remaining.protein)}g protein` : ''} 
          {remaining.sugar < 10 ? `, ≤${Math.round(remaining.sugar)}g sugar` : ''}
        </span>
      </button>

      {showSuggestions && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {scoredSuggestions.map((item) => (
            <div
              key={item.name}
              className="relative group"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={() => handleAddSuggestion(item)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {item.calories} cal • P: {item.protein}g
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                </div>
              </button>

              {hoveredItem === item.name && (
                <div className="absolute z-10 left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                  <div className="grid grid-cols-2 gap-1">
                    <div>Protein: {item.protein}g</div>
                    <div>Carbs: {item.carbs}g</div>
                    <div>Fat: {item.fat}g</div>
                    <div>Sugar: {item.sugar}g</div>
                  </div>
                  <div className="mt-1 pt-1 border-t border-gray-700">
                    Impact: {remaining.calories - item.calories} cal remaining
                    {remaining.protein - item.protein > 0 && `, ${Math.round(remaining.protein - item.protein)}g protein left`}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
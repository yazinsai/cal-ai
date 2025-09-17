'use client';

import { useState, useEffect, useRef } from 'react';
import { FoodEntry as FoodEntryType, QuickLogItem } from '@/types';
import { saveFoodEntry, loadQuickLogItems, getUniqueFoodNames } from '@/lib/storage';
import { useAI } from '@/hooks/useAI';
import { Plus, Minus, Check, Loader2, Zap, Edit2, X, Save, Camera as CameraIcon, Upload } from 'lucide-react';
import Webcam from 'react-webcam';
import { compressImage } from '@/lib/imageCompression';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isCapturingImage, setIsCapturingImage] = useState(false);
  const [isFromCamera, setIsFromCamera] = useState(false);
  const [showQuantityMultiplier, setShowQuantityMultiplier] = useState(false);
  const [quantityMultiplier, setQuantityMultiplier] = useState(1);
  const { loading, analyzeImage, analyzeText } = useAI();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuickLogItems(loadQuickLogItems());
  }, []);

  useEffect(() => {
    if (description.trim().length > 0) {
      const allFoodNames = getUniqueFoodNames(30);
      const filtered = allFoodNames.filter(name => 
        name.toLowerCase().includes(description.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [description]);

  const getMealType = (): FoodEntryType['mealType'] => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  const handleImageCapture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsCapturingImage(false);

      // Compress and analyze the image
      try {
        const compressedImage = await compressImage(imageSrc, 800, 800, 0.7);
        const result = await analyzeImage(compressedImage);
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
            imageUrl: compressedImage,
            mealType: getMealType(),
            confidence: result.confidence,
          };

          // Show the entry for review/confirmation
          setCurrentEntry(entry);
          setIsFromCamera(true);
          setShowQuantityMultiplier(true);
          setQuantityMultiplier(1);
        }
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const compressedImage = await compressImage(base64, 800, 800, 0.7);
          const result = await analyzeImage(compressedImage);
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
              imageUrl: compressedImage,
              mealType: getMealType(),
              confidence: result.confidence,
            };
            setCurrentEntry(entry);
            setIsFromCamera(true);
            setShowQuantityMultiplier(true);
            setQuantityMultiplier(1);
          }
        } catch (error) {
          console.error('Failed to process image:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextSubmit = async () => {
    if (!description.trim()) return;

    setShowSuggestions(false);
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
      setIsFromCamera(false);
      setShowQuantityMultiplier(true);
      setQuantityMultiplier(1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && showSuggestions) {
        e.preventDefault();
        setDescription(suggestions[selectedSuggestionIndex]);
        setShowSuggestions(false);
      } else {
        handleTextSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = async (suggestion: string) => {
    setDescription(suggestion);
    setShowSuggestions(false);

    // Auto-submit the suggestion
    const result = await analyzeText(suggestion);
    if (result) {
      const entry: FoodEntryType = {
        id: `food_${Date.now()}`,
        name: result.name || suggestion,
        calories: result.calories || 0,
        protein: result.protein || 0,
        carbs: result.carbs || 0,
        fat: result.fat || 0,
        sugar: result.sugar || 0,
        timestamp: new Date().toISOString(),
        mealType: getMealType(),
        confidence: result.confidence,
      };

      // Show the entry for review
      setCurrentEntry(entry);
      setIsFromCamera(false);
      setShowQuantityMultiplier(true);
      setQuantityMultiplier(1);
      setDescription('');
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
    setIsFromCamera(false);
    setShowQuantityMultiplier(true);
    setQuantityMultiplier(1);
  };

  const confirmEntry = () => {
    if (!currentEntry) return;

    // Ensure we have all required fields for FoodEntryType
    const fullEntry: FoodEntryType = {
      id: currentEntry.id || `food_${Date.now()}`,
      name: currentEntry.name || 'Unknown food',
      calories: Math.round((currentEntry.calories || 0) * quantityMultiplier),
      protein: Math.round((currentEntry.protein || 0) * quantityMultiplier),
      carbs: Math.round((currentEntry.carbs || 0) * quantityMultiplier),
      fat: Math.round((currentEntry.fat || 0) * quantityMultiplier),
      sugar: Math.round((currentEntry.sugar || 0) * quantityMultiplier),
      timestamp: currentEntry.timestamp || new Date().toISOString(),
      mealType: currentEntry.mealType || getMealType(),
      imageUrl: currentEntry.imageUrl,
      confidence: currentEntry.confidence,
    };

    // Save the entry
    saveFoodEntry(fullEntry);

    // Call the callback IMMEDIATELY to close dialog
    if (onEntryAdded) {
      onEntryAdded(fullEntry);
    }

    // Clear state after callback
    setCurrentEntry(null);
    setDescription('');
    setQuickLogItems(loadQuickLogItems());
    setIsFromCamera(false);
    setShowQuantityMultiplier(false);
    setQuantityMultiplier(1);
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
      {/* Camera capture modal */}
      {isCapturingImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-2xl w-full">
            <div className="mb-4">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: 'environment',
                  width: 1280,
                  height: 720,
                }}
                className="w-full rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleImageCapture}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Capture Photo
              </button>
              <button
                onClick={() => setIsCapturingImage(false)}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => description.trim() && setShowSuggestions(true)}
            placeholder="What did you eat?"
            className="w-full pl-4 pr-20 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          
          {/* Upload and Camera buttons inside input */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              title="Upload an image"
            >
              <Upload className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setIsCapturingImage(true)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Take a photo"
            >
              <CameraIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Hidden file input for upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedSuggestionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } ${index === 0 ? 'rounded-t-lg' : ''} ${
                    index === suggestions.length - 1 ? 'rounded-b-lg' : ''
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {description.trim() && (
          <button
            onClick={handleTextSubmit}
            disabled={loading}
            className="mt-2 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Add Food Entry'
            )}
          </button>
        )}
      </div>

      {!currentEntry && !isFromCamera && quickLogItems.length > 0 && (
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
              {Math.round((currentEntry.calories || 0) * quantityMultiplier)} calories
            </div>

            {reanalyzing && (
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mb-2">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recalculating nutrition...
              </div>
            )}
          </div>

          {/* Quantity multiplier buttons - show for all entries */}
          {showQuantityMultiplier && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quantity</div>
              <div className="flex gap-2">
                {[0.5, 0.75, 1, 1.5].map((multiplier) => (
                  <button
                    key={multiplier}
                    onClick={() => setQuantityMultiplier(multiplier)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                      quantityMultiplier === multiplier
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {multiplier}x
                  </button>
                ))}
              </div>
            </div>
          )}

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
                    {Math.round(((currentEntry[macro] as number) || 0) * quantityMultiplier)}g
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
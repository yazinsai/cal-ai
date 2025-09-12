import { useState, useCallback } from 'react';
import { analyzeFoodImage, analyzeFoodText, calculateDailyTargets, suggestMeal } from '@/lib/ai';
import { FoodEntry, DailyTarget, UserProfile } from '@/types';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (
    imageBase64: string,
    additionalContext?: string
  ): Promise<Partial<FoodEntry> | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeFoodImage(imageBase64, additionalContext);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeText = useCallback(async (
    description: string
  ): Promise<Partial<FoodEntry> | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeFoodText(description);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateTargets = useCallback(async (
    profile: UserProfile
  ): Promise<DailyTarget | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await calculateDailyTargets(profile);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate targets');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMealSuggestions = useCallback(async (
    remainingTargets: DailyTarget,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    preferences?: string[]
  ): Promise<string[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await suggestMeal(remainingTargets, mealType, preferences);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    analyzeImage,
    analyzeText,
    calculateTargets,
    getMealSuggestions,
  };
}
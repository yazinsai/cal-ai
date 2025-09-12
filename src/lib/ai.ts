import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { FoodEntry, DailyTarget, UserProfile } from '@/types';

let apiKey: string | null = null;

export function setApiKey(key: string) {
  apiKey = key;
  if (typeof window !== 'undefined') {
    localStorage.setItem('openai_api_key', key);
  }
}

export function getApiKey(): string | null {
  if (!apiKey && typeof window !== 'undefined') {
    apiKey = localStorage.getItem('openai_api_key');
  }
  return apiKey;
}

export function clearApiKey() {
  apiKey = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('openai_api_key');
  }
}

export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const client = createOpenAI({
      apiKey: key,
    });
    
    const { text } = await generateText({
      model: client('gpt-3.5-turbo'),
      prompt: 'Say "valid"',
      maxOutputTokens: 100,
    });
    
    return text.toLowerCase().includes('valid');
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
}

export async function analyzeFoodImage(imageBase64: string, additionalContext?: string): Promise<Partial<FoodEntry>> {
  const key = getApiKey();
  if (!key) {
    throw new Error('API key not set');
  }

  const client = createOpenAI({
    apiKey: key,
  });
  const model = client('gpt-4o');

  const prompt = `Analyze this food image and provide nutritional information. ${additionalContext || ''}
  
  Respond with a JSON object containing:
  - name: string (descriptive name of the food)
  - calories: number (estimated calories)
  - protein: number (grams)
  - carbs: number (grams)
  - fat: number (grams)
  - sugar: number (grams)
  - portion: string (e.g., "1 cup", "100g", "1 medium")
  - confidence: number (0-1, your confidence in the estimate)
  
  Be accurate but conservative in your estimates. If unsure, estimate on the higher side for calories.`;

  try {
    const { text } = await generateText({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image', image: imageBase64 },
          ],
        },
      ],
      maxOutputTokens: 500,
    });

    const result = JSON.parse(text);
    return result;
  } catch (error) {
    console.error('Food image analysis failed:', error);
    throw new Error('Failed to analyze food image');
  }
}

export async function analyzeFoodText(description: string): Promise<Partial<FoodEntry>> {
  const key = getApiKey();
  if (!key) {
    throw new Error('API key not set');
  }

  const client = createOpenAI({
    apiKey: key,
  });
  const model = client('gpt-4o-mini');

  const prompt = `Analyze this food description and provide nutritional information: "${description}"
  
  Respond with a JSON object containing:
  - name: string (cleaned up name of the food)
  - calories: number (estimated calories)
  - protein: number (grams)
  - carbs: number (grams)
  - fat: number (grams)
  - sugar: number (grams)
  - portion: string (e.g., "1 cup", "100g", "1 medium")
  - confidence: number (0-1, your confidence in the estimate)
  
  Consider typical portion sizes. Be accurate but conservative in your estimates.`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 500,
    });

    const result = JSON.parse(text);
    return result;
  } catch (error) {
    console.error('Food text analysis failed:', error);
    throw new Error('Failed to analyze food description');
  }
}

export async function calculateDailyTargets(profile: UserProfile): Promise<DailyTarget> {
  const key = getApiKey();
  if (!key) {
    throw new Error('API key not set');
  }

  const client = createOpenAI({
    apiKey: key,
  });
  const model = client('gpt-4o-mini');

  const prompt = `Calculate daily nutritional targets for a person with the following profile:
  - Age: ${profile.age || 'not specified'}
  - Gender: ${profile.gender || 'not specified'}
  - Activity Level: ${profile.activityLevel || 'moderate'}
  - Goal: ${profile.goal || 'maintain'}
  - Current Weight: ${profile.currentWeight ? `${profile.currentWeight}${profile.units === 'metric' ? 'kg' : 'lbs'}` : 'not specified'}
  - Height: ${profile.height ? `${profile.height}${profile.units === 'metric' ? 'cm' : 'inches'}` : 'not specified'}
  
  Provide realistic, healthy targets. Respond with a JSON object containing:
  - calories: number (daily calorie target)
  - protein: number (grams per day)
  - carbs: number (grams per day)
  - fat: number (grams per day)
  - sugar: number (maximum grams per day)
  
  Use standard nutritional guidelines and ensure macros add up correctly.`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 500,
    });

    const result = JSON.parse(text);
    return result;
  } catch (error) {
    console.error('Target calculation failed:', error);
    
    return {
      calories: 2000,
      protein: 50,
      carbs: 250,
      fat: 65,
      sugar: 50,
    };
  }
}

export async function suggestMeal(
  remainingTargets: DailyTarget,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  preferences?: string[]
): Promise<string[]> {
  const key = getApiKey();
  if (!key) {
    throw new Error('API key not set');
  }

  const client = createOpenAI({
    apiKey: key,
  });
  const model = client('gpt-4o-mini');

  const prompt = `Suggest 3 ${mealType} options that would help meet these remaining nutritional targets:
  - Calories: ${remainingTargets.calories}
  - Protein: ${remainingTargets.protein}g
  - Carbs: ${remainingTargets.carbs}g
  - Fat: ${remainingTargets.fat}g
  
  ${preferences?.length ? `Preferences: ${preferences.join(', ')}` : ''}
  
  Respond with a JSON array of 3 strings, each being a meal suggestion with portion size.`;

  try {
    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 300,
    });

    const result = JSON.parse(text);
    return result;
  } catch (error) {
    console.error('Meal suggestion failed:', error);
    return [];
  }
}
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { FoodEntry, DailyTarget, UserProfile } from '@/types';

let apiKey: string | null = null;

/**
 * Extracts JSON from AI responses that may contain markdown formatting or explanatory text.
 * Prioritizes the last JSON block found in the response for better accuracy.
 */
function extractJsonFromMarkdown<T = unknown>(text: string): T {
  console.log("Raw AI response:", text);
  
  try {
    // Method 1: Try to extract all JSON blocks from markdown code blocks
    const codeBlockMatches = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/g);
    if (codeBlockMatches && codeBlockMatches.length > 0) {
      // Get the last code block (most likely to be the final result)
      const lastBlock = codeBlockMatches[codeBlockMatches.length - 1];
      const jsonStr = lastBlock.replace(/```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
      const result = JSON.parse(jsonStr);
      console.log("Parsed from code block:", result);
      return result;
    }
    
    // Method 2: Find all JSON objects/arrays in the text
    const jsonMatches = text.match(/[\[{][\s\S]*?[}\]]/g);
    if (jsonMatches && jsonMatches.length > 0) {
      // Try parsing from the last match (most complete/final JSON)
      for (let i = jsonMatches.length - 1; i >= 0; i--) {
        try {
          const result = JSON.parse(jsonMatches[i]);
          console.log("Parsed from JSON match:", result);
          return result;
        } catch {
          // Continue to next match if this one fails
          continue;
        }
      }
    }
    
    // Method 3: Try parsing the entire text as JSON (last resort)
    const trimmed = text.trim();
    const result = JSON.parse(trimmed);
    console.log("Parsed entire text as JSON:", result);
    return result;
    
  } catch (error) {
    console.error('JSON extraction failed:', error);
    console.error('Attempted to parse:', text);
    throw new Error('Failed to extract valid JSON from AI response');
  }
}

export function setApiKey(key: string) {
  apiKey = key;
  if (typeof window !== 'undefined') {
    localStorage.setItem('openrouter_api_key', key);
  }
}

export function getApiKey(): string | null {
  if (!apiKey && typeof window !== 'undefined') {
    apiKey = localStorage.getItem('openrouter_api_key');
  }
  return apiKey;
}

export function clearApiKey() {
  apiKey = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('openrouter_api_key');
  }
}

export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const client = createOpenRouter({
      apiKey: key,
    });
    
    const { text } = await generateText({
      model: client('google/gemini-2.5-flash'),
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

  const client = createOpenRouter({
    apiKey: key,
  });
  const model = client('google/gemini-2.5-flash');

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
    });

    return extractJsonFromMarkdown<Partial<FoodEntry>>(text);
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

  const client = createOpenRouter({
    apiKey: key,
  });
  const model = client('google/gemini-2.5-flash');

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
    });

    return extractJsonFromMarkdown<Partial<FoodEntry>>(text);
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

  const client = createOpenRouter({
    apiKey: key,
  });
  const model = client('google/gemini-2.5-flash');

  const prompt = `Calculate daily nutritional targets for a person with the following profile:
  - Age: ${profile.age || 'not specified'}
  - Gender: ${profile.gender || 'not specified'}
  - Activity Level: ${profile.activityLevel || 'moderate'}
  - Goal: ${profile.goal || 'maintain'}
  - Current Weight: ${profile.currentWeight ? `${profile.currentWeight}${profile.units === 'metric' ? 'kg' : 'lbs'}` : 'not specified'}
  - Height: ${profile.height ? `${profile.height}${profile.units === 'metric' ? 'cm' : 'inches'}` : 'not specified'}
  
  Calculate using this methodology:
  1. Calculate BMR using Mifflin-St Jeor equation:
     - Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
     - Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
  
  2. Calculate TDEE based on activity level:
     - Sedentary: BMR × 1.2
     - Light: BMR × 1.375
     - Moderate: BMR × 1.55
     - Active: BMR × 1.725
     - Very Active: BMR × 1.9
  
  3. Adjust calories based on goal:
     - Lose weight: TDEE - 500 calories (for ~0.5kg/1lb loss per week)
     - Maintain: TDEE
     - Gain muscle: TDEE + 300-500 calories
  
  4. Calculate macros:
     - Protein: 0.8-1.2g per kg body weight (higher for muscle gain)
     - Fat: 25-30% of total calories
     - Carbs: Remaining calories after protein and fat
     - Sugar: Maximum 25-30g per day (limit added sugars to <10% of calories)
  
  IMPORTANT: Return ONLY a JSON object with these exact fields (no explanation text):
  {
    "calories": number (daily calorie target, rounded to nearest 50),
    "protein": number (grams per day, rounded to nearest 5),
    "carbs": number (grams per day, rounded to nearest 5),
    "fat": number (grams per day, rounded to nearest 5),
    "sugar": number (maximum grams per day, typically 25-30)
  }
  
  Ensure the macros add up correctly: (protein × 4) + (carbs × 4) + (fat × 9) ≈ calories`;

  try {
    const { text } = await generateText({
      model,
      prompt,
    });

    const result = extractJsonFromMarkdown<DailyTarget>(text);
    
    // Validate the result has required fields
    if (!result.calories || !result.protein || !result.carbs || !result.fat || result.sugar === undefined) {
      throw new Error('Invalid response format from AI');
    }
    
    // Round values as specified
    result.calories = Math.round(result.calories / 50) * 50;
    result.protein = Math.round(result.protein / 5) * 5;
    result.carbs = Math.round(result.carbs / 5) * 5;
    result.fat = Math.round(result.fat / 5) * 5;
    result.sugar = Math.min(30, Math.max(25, Math.round(result.sugar)));
    
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

  const client = createOpenRouter({
    apiKey: key,
  });
  const model = client('google/gemini-2.5-flash');

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
    });

    return extractJsonFromMarkdown<string[]>(text);
  } catch (error) {
    console.error('Meal suggestion failed:', error);
    return [];
  }
}
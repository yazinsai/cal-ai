'use client';

import { useState, useEffect } from 'react';
import { UserProfile as UserProfileType, DailyTarget } from '@/types';
import { saveUserProfile, loadUserProfile, saveDailyTargets } from '@/lib/storage';
import { useAI } from '@/hooks/useAI';
import { User, Activity, Target, Save, Loader2 } from 'lucide-react';

interface UserProfileProps {
  onProfileSaved?: (profile: UserProfileType, targets: DailyTarget) => void;
}

export function UserProfile({ onProfileSaved }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfileType>({
    units: 'metric',
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const { calculateTargets } = useAI();

  useEffect(() => {
    const savedProfile = loadUserProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, []);

  const handleSave = async () => {
    saveUserProfile(profile);
    
    if (profile.age && profile.gender && profile.goal && profile.activityLevel) {
      setIsCalculating(true);
      const targets = await calculateTargets(profile);
      
      if (targets) {
        saveDailyTargets(targets);
        if (onProfileSaved) {
          onProfileSaved(profile, targets);
        }
      }
      setIsCalculating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <User className="w-6 h-6 mr-2 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Age
            </label>
            <input
              type="number"
              value={profile.age || ''}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender
            </label>
            <select
              value={profile.gender || ''}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value as UserProfileType['gender'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Activity className="inline w-4 h-4 mr-1" />
            Activity Level
          </label>
          <select
            value={profile.activityLevel || ''}
            onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as UserProfileType['activityLevel'] })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select...</option>
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Light (exercise 1-3 days/week)</option>
            <option value="moderate">Moderate (exercise 3-5 days/week)</option>
            <option value="active">Active (exercise 6-7 days/week)</option>
            <option value="very_active">Very Active (hard exercise daily)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Target className="inline w-4 h-4 mr-1" />
            Goal
          </label>
          <select
            value={profile.goal || ''}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value as UserProfileType['goal'] })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select...</option>
            <option value="lose_weight">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
            <option value="gain_muscle">Gain Muscle</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Weight ({profile.units === 'metric' ? 'kg' : 'lbs'})
            </label>
            <input
              type="number"
              value={profile.currentWeight || ''}
              onChange={(e) => setProfile({ ...profile, currentWeight: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={profile.units === 'metric' ? '70' : '154'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Height ({profile.units === 'metric' ? 'cm' : 'inches'})
            </label>
            <input
              type="number"
              value={profile.height || ''}
              onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={profile.units === 'metric' ? '175' : '69'}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Units
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="metric"
                checked={profile.units === 'metric'}
                onChange={() => setProfile({ ...profile, units: 'metric' })}
                className="mr-2"
              />
              Metric
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="imperial"
                checked={profile.units === 'imperial'}
                onChange={() => setProfile({ ...profile, units: 'imperial' })}
                className="mr-2"
              />
              Imperial
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isCalculating}
          className="w-full flex items-center justify-center py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Calculating Targets...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Profile & Calculate Targets
            </>
          )}
        </button>
      </div>
    </div>
  );
}
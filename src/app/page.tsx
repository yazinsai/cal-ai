'use client';

import { useState, useEffect } from 'react';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { UserProfile } from '@/components/UserProfile';
import { FoodEntry } from '@/components/FoodEntry';
import { DailyProgress } from '@/components/DailyProgress';
import { FoodEntryList } from '@/components/FoodEntryList';
import { useDailyReset } from '@/hooks/useDailyReset';
import { 
  getDailyProgress, 
  loadDailyTargets, 
  loadUserProfile,
  loadAppSettings,
  saveAppSettings
} from '@/lib/storage';
import { getApiKey } from '@/lib/ai';
import { DailyTarget, UserProfile as UserProfileType } from '@/types';
import { Utensils, Settings, User, ChevronLeft, ChevronRight } from 'lucide-react';

type View = 'entry' | 'progress' | 'profile';

export default function Home() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [dailyProgress, setDailyProgress] = useState(getDailyProgress());
  const [dailyTargets, setDailyTargets] = useState<DailyTarget | null>(null);
  const [currentView, setCurrentView] = useState<View>('entry');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useDailyReset(() => {
    setDailyProgress(getDailyProgress());
  });

  useEffect(() => {
    const apiKey = getApiKey();
    setHasApiKey(!!apiKey);
    
    const profile = loadUserProfile();
    setHasProfile(!!profile);
    
    const targets = loadDailyTargets();
    setDailyTargets(targets);
    
    const settings = loadAppSettings();
    setIsDarkMode(settings.darkMode);
    
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const refreshProgress = () => {
    setDailyProgress(getDailyProgress());
  };

  const handleProfileSaved = (profile: UserProfileType, targets: DailyTarget) => {
    setHasProfile(true);
    setDailyTargets(targets);
    setCurrentView('entry');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    const settings = loadAppSettings();
    saveAppSettings({ ...settings, darkMode: newDarkMode });
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const swipeLeft = () => {
    const views: View[] = ['entry', 'progress', 'profile'];
    const currentIndex = views.indexOf(currentView);
    if (currentIndex > 0) {
      setCurrentView(views[currentIndex - 1]);
    }
  };

  const swipeRight = () => {
    const views: View[] = ['entry', 'progress', 'profile'];
    const currentIndex = views.indexOf(currentView);
    if (currentIndex < views.length - 1) {
      setCurrentView(views[currentIndex + 1]);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Utensils className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Calorie Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Lightning-fast food logging in seconds
            </p>
          </div>
          
          <ApiKeyInput onKeyValidated={(valid) => setHasApiKey(valid)} />
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <User className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome! Let&apos;s set up your profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We&apos;ll calculate your daily targets based on your goals
            </p>
          </div>
          
          <UserProfile onProfileSaved={handleProfileSaved} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Utensils className="w-8 h-8 text-blue-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Calorie Tracker
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>
              
              <button
                onClick={() => setCurrentView('profile')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            {(['entry', 'progress', 'profile'] as View[]).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  currentView === view
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {view === 'entry' ? '📝 Log' : view === 'progress' ? '📊 Progress' : '👤 Profile'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative">
          {currentView === 'entry' && (
            <div className="space-y-6">
              <FoodEntry onEntryAdded={refreshProgress} />
              
              <div className="grid lg:grid-cols-2 gap-6">
                <DailyProgress progress={dailyProgress} targets={dailyTargets} />
                <FoodEntryList entries={dailyProgress.entries} onUpdate={refreshProgress} />
              </div>
            </div>
          )}
          
          {currentView === 'progress' && (
            <div className="space-y-6">
              <DailyProgress progress={dailyProgress} targets={dailyTargets} />
              <FoodEntryList entries={dailyProgress.entries} onUpdate={refreshProgress} />
            </div>
          )}
          
          {currentView === 'profile' && (
            <div className="space-y-6">
              <UserProfile onProfileSaved={handleProfileSaved} />
              <ApiKeyInput onKeyValidated={setHasApiKey} />
            </div>
          )}
          
          <div className="fixed bottom-8 left-4 right-4 flex justify-between pointer-events-none md:hidden">
            <button
              onClick={swipeLeft}
              disabled={currentView === 'entry'}
              className={`p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg pointer-events-auto transition-opacity ${
                currentView === 'entry' ? 'opacity-50' : ''
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={swipeRight}
              disabled={currentView === 'profile'}
              className={`p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg pointer-events-auto transition-opacity ${
                currentView === 'profile' ? 'opacity-50' : ''
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { UserProfile } from '@/components/UserProfile';
import { DailyProgress } from '@/components/DailyProgress';
import { EnhancedFoodEntryList } from '@/components/EnhancedFoodEntryList';
import { DailyHeader } from '@/components/DailyHeader';
import { MacroSuggestions } from '@/components/MacroSuggestions';
import { FoodEntry } from '@/components/FoodEntry';
import DailySummary from '@/components/DailySummary';
import HistoryChart from '@/components/HistoryChart';
import Statistics from '@/components/Statistics';
import DataExport from '@/components/DataExport';
import { useDailyReset } from '@/hooks/useDailyReset';
import { 
  getDailyProgress, 
  loadDailyTargets, 
  loadUserProfile,
  loadAppSettings,
  saveAppSettings,
  getHistoricalData,
  saveDailyProgress,
  saveUserProfile,
  saveDailyTargets
} from '@/lib/storage';
import { getApiKey } from '@/lib/ai';
import { DailyTarget, UserProfile as UserProfileType, DailyProgress as DailyProgressType } from '@/types';
import { Utensils, Settings, User, Camera, BarChart3, Award, Plus } from 'lucide-react';

type View = 'entry' | 'progress' | 'stats' | 'profile';

export default function Home() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [dailyProgress, setDailyProgress] = useState(getDailyProgress());
  const [dailyTargets, setDailyTargets] = useState<DailyTarget | null>(null);
  const [historicalData, setHistoricalData] = useState<DailyProgressType[]>([]);
  const [currentView, setCurrentView] = useState<View>('entry');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Use useCallback to prevent infinite loop
  const handleDailyReset = useCallback(() => {
    setDailyProgress(getDailyProgress());
  }, []);

  useDailyReset(handleDailyReset);

  useEffect(() => {
    const apiKey = getApiKey();
    setHasApiKey(!!apiKey);
    
    const profile = loadUserProfile();
    setHasProfile(!!profile);
    
    const targets = loadDailyTargets();
    setDailyTargets(targets);
    
    const history = getHistoricalData(90);
    setHistoricalData(history);
    
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
    setHistoricalData(getHistoricalData(90));
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

  const handleDataImport = (data: {
    history: DailyProgressType[];
    profile: UserProfileType | null;
    targets: DailyTarget | null;
  }) => {
    if (data.profile) {
      saveUserProfile(data.profile);
      setHasProfile(true);
    }
    if (data.targets) {
      saveDailyTargets(data.targets);
      setDailyTargets(data.targets);
    }
    if (data.history && data.history.length > 0) {
      data.history.forEach(day => saveDailyProgress(day));
      setHistoricalData(getHistoricalData(90));
      setDailyProgress(getDailyProgress());
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
            {[
              { id: 'entry', label: 'Log', icon: <Camera className="w-4 h-4" /> },
              { id: 'progress', label: 'Progress', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'stats', label: 'Stats', icon: <Award className="w-4 h-4" /> },
              { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id as View)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                  currentView === view.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {view.icon}
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="relative">
          {currentView === 'entry' && (
            <div className="space-y-4">
              <DailyHeader progress={dailyProgress} targets={dailyTargets} />
              
              {dailyTargets && (
                <MacroSuggestions 
                  progress={dailyProgress} 
                  targets={dailyTargets} 
                  onEntryAdded={refreshProgress}
                />
              )}
              
              <EnhancedFoodEntryList entries={dailyProgress.entries} onUpdate={refreshProgress} />
            </div>
          )}
          
          {currentView === 'progress' && (
            <div className="space-y-6">
              <DailyHeader progress={dailyProgress} targets={dailyTargets} />
              <DailyProgress progress={dailyProgress} targets={dailyTargets} />
              {dailyTargets && (
                <DailySummary entries={dailyProgress.entries} targets={dailyTargets} />
              )}
              <EnhancedFoodEntryList entries={dailyProgress.entries} onUpdate={refreshProgress} />
              {dailyTargets && historicalData.length > 0 && (
                <HistoryChart history={historicalData} targets={dailyTargets} />
              )}
            </div>
          )}
          
          {currentView === 'stats' && (
            <div className="space-y-6">
              {dailyTargets && historicalData.length > 0 && (
                <>
                  <Statistics history={historicalData} targets={dailyTargets} />
                  <HistoryChart history={historicalData} targets={dailyTargets} />
                </>
              )}
              {dailyTargets && (
                <DataExport 
                  history={historicalData}
                  profile={loadUserProfile()}
                  targets={dailyTargets}
                  onImport={handleDataImport}
                />
              )}
            </div>
          )}
          
          {currentView === 'profile' && (
            <div className="space-y-6">
              <UserProfile onProfileSaved={handleProfileSaved} />
              <ApiKeyInput onKeyValidated={setHasApiKey} />
              {dailyTargets && (
                <DataExport 
                  history={historicalData}
                  profile={loadUserProfile()}
                  targets={dailyTargets}
                  onImport={handleDataImport}
                />
              )}
            </div>
          )}
          
        </div>
      </main>
      
      {/* Global FAB for quick add */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
        aria-label="Quick add food"
      >
        <Plus className="w-6 h-6" />
      </button>
      
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowQuickAdd(false)}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <FoodEntry onEntryAdded={(entry) => {
              refreshProgress();
              setShowQuickAdd(false);
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

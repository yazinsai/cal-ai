'use client';

import React, { useState } from 'react';
import { Download, Upload, FileJson, FileText, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { DailyProgress, UserProfile, DailyTarget } from '@/types';

interface DataExportProps {
  history: DailyProgress[];
  profile: UserProfile | null;
  targets: DailyTarget | null;
  onImport: (data: { history: DailyProgress[]; profile: UserProfile | null; targets: DailyTarget | null }) => void;
}

export default function DataExport({ history, profile, targets, onImport }: DataExportProps) {
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const exportToCSV = () => {
    try {
      const headers = ['Date', 'Meal', 'Food', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Sugar (g)'];
      const rows = [];

      for (const day of history) {
        for (const entry of day.entries) {
          rows.push([
            format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm'),
            entry.mealType || 'Other',
            entry.name,
            entry.calories,
            entry.protein,
            entry.carbs,
            entry.fat,
            entry.sugar,
          ]);
        }
      }

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calorie-tracker-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const exportToJSON = () => {
    try {
      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        profile,
        targets,
        history,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calorie-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.version || !data.history) {
          throw new Error('Invalid backup file format');
        }

        onImport({
          history: data.history || [],
          profile: data.profile || null,
          targets: data.targets || null,
        });

        setImportStatus('success');
        setImportMessage(`Imported ${data.history?.length || 0} days of data`);
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 3000);
      } catch (error) {
        console.error('Import failed:', error);
        setImportStatus('error');
        setImportMessage('Failed to import data. Please check the file format.');
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 3000);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const generateSummaryReport = () => {
    if (history.length === 0) {
      alert('No data to generate report');
      return;
    }

    const totalDays = history.length;
    const totalEntries = history.reduce((sum, day) => sum + day.entries.length, 0);
    const avgCalories = Math.round(
      history.reduce((sum, day) => sum + day.totals.calories, 0) / totalDays
    );
    const avgProtein = Math.round(
      history.reduce((sum, day) => sum + day.totals.protein, 0) / totalDays
    );
    const avgCarbs = Math.round(
      history.reduce((sum, day) => sum + day.totals.carbs, 0) / totalDays
    );
    const avgFat = Math.round(
      history.reduce((sum, day) => sum + day.totals.fat, 0) / totalDays
    );

    const reportContent = `
CALORIE TRACKER SUMMARY REPORT
Generated: ${format(new Date(), 'PPP')}
================================

OVERVIEW
--------
Total Days Tracked: ${totalDays}
Total Food Entries: ${totalEntries}
Average Entries per Day: ${(totalEntries / totalDays).toFixed(1)}

DAILY AVERAGES
--------------
Calories: ${avgCalories} kcal
Protein: ${avgProtein}g
Carbohydrates: ${avgCarbs}g
Fat: ${avgFat}g

USER PROFILE
------------
${profile ? `
Age: ${profile.age}
Gender: ${profile.gender}
Activity Level: ${profile.activityLevel}
Goal: ${profile.goal}
${profile.currentWeight ? `Weight: ${profile.currentWeight} ${profile.units === 'metric' ? 'kg' : 'lbs'}` : ''}
${profile.height ? `Height: ${profile.height} ${profile.units === 'metric' ? 'cm' : 'inches'}` : ''}
` : 'No profile data available'}

DAILY TARGETS
-------------
${targets ? `
Calories: ${targets.calories} kcal
Protein: ${targets.protein}g
Carbohydrates: ${targets.carbs}g
Fat: ${targets.fat}g
Sugar Limit: ${targets.sugar}g
` : 'No targets set'}

RECENT HISTORY (Last 7 Days)
-----------------------------
${history.slice(-7).map(day => `
${format(new Date(day.date), 'PP')}:
  Calories: ${day.totals.calories} kcal
  Entries: ${day.entries.length}
`).join('')}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calorie-tracker-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportStatus('success');
    setTimeout(() => setExportStatus('idle'), 3000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Data Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h3>
          
          <button
            onClick={exportToCSV}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Export to CSV
          </button>

          <button
            onClick={exportToJSON}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileJson className="w-5 h-5" />
            Export Backup (JSON)
          </button>

          <button
            onClick={generateSummaryReport}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Generate Summary Report
          </button>

          {exportStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              Export successful!
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              Export failed. Please try again.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Data</h3>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-1">Important:</p>
                <p>Importing data will merge with existing data. Make sure to export a backup first!</p>
              </div>
            </div>
          </div>

          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Import Backup (JSON)
            </label>
          </label>

          {importStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              {importMessage}
            </div>
          )}

          {importStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {importMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
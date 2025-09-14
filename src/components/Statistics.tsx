'use client';

import React, { useMemo } from 'react';
import { TrendingUp, Award, Target, Zap, Calendar, AlertCircle } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { DailyProgress, DailyTarget } from '@/types';

interface StatisticsProps {
  history: DailyProgress[];
  targets: DailyTarget;
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
}

export default function Statistics({ history, targets }: StatisticsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const last7Days = history.filter(
      day => differenceInDays(now, parseISO(day.date)) <= 7
    );
    const last30Days = history.filter(
      day => differenceInDays(now, parseISO(day.date)) <= 30
    );

    const calculateAverage = (days: DailyProgress[], key: keyof DailyProgress['totals'], decimals: number = 0) => {
      if (days.length === 0) return 0;
      const avg = days.reduce((sum, day) => sum + day.totals[key], 0) / days.length;
      return decimals > 0 ? Math.round(avg * Math.pow(10, decimals)) / Math.pow(10, decimals) : Math.round(avg);
    };

    const weekAvgCalories = calculateAverage(last7Days, 'calories');
    const monthAvgCalories = calculateAverage(last30Days, 'calories');

    const weekAvgProtein = calculateAverage(last7Days, 'protein', 1);
    const weekAvgCarbs = calculateAverage(last7Days, 'carbs', 1);
    const weekAvgFat = calculateAverage(last7Days, 'fat', 1);

    const calculateAdherence = (days: DailyProgress[]) => {
      if (days.length === 0) return 0;
      const daysWithinTarget = days.filter(day => {
        const caloriesDiff = Math.abs(day.totals.calories - targets.calories);
        return caloriesDiff <= targets.calories * 0.1;
      }).length;
      return Math.round((daysWithinTarget / days.length) * 100);
    };

    const weekAdherence = calculateAdherence(last7Days);
    const monthAdherence = calculateAdherence(last30Days);

    const calculateStreak = () => {
      let streak = 0;
      const sortedDays = [...history].sort((a, b) => b.date.localeCompare(a.date));
      
      for (const day of sortedDays) {
        if (day.entries.length > 0) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    };

    const currentStreak = calculateStreak();

    const findBestWorstDays = (days: DailyProgress[]) => {
      if (days.length === 0) return { best: null, worst: null };
      
      const daysWithDiff = days.map(day => ({
        date: day.date,
        diff: Math.abs(day.totals.calories - targets.calories),
        calories: day.totals.calories,
      }));

      daysWithDiff.sort((a, b) => a.diff - b.diff);
      
      return {
        best: daysWithDiff[0],
        worst: daysWithDiff[daysWithDiff.length - 1],
      };
    };

    const { best, worst } = findBestWorstDays(last30Days);

    return {
      weekAvgCalories,
      monthAvgCalories,
      weekAvgProtein,
      weekAvgCarbs,
      weekAvgFat,
      weekAdherence,
      monthAdherence,
      currentStreak,
      bestDay: best,
      worstDay: worst,
    };
  }, [history, targets]);

  const statCards: StatCard[] = [
    {
      title: 'Weekly Average',
      value: stats.weekAvgCalories,
      subtitle: `${stats.weekAvgCalories > targets.calories ? '+' : ''}${stats.weekAvgCalories - targets.calories} vs target`,
      icon: <TrendingUp className="w-5 h-5" />,
      trend: Math.abs(stats.weekAvgCalories - targets.calories) <= 100 ? 'neutral' : 
             stats.weekAvgCalories > targets.calories ? 'up' : 'down',
      color: 'blue',
    },
    {
      title: 'Goal Adherence',
      value: `${stats.weekAdherence}%`,
      subtitle: 'Last 7 days',
      icon: <Target className="w-5 h-5" />,
      trend: stats.weekAdherence >= 80 ? 'up' : stats.weekAdherence >= 50 ? 'neutral' : 'down',
      color: 'green',
    },
    {
      title: 'Current Streak',
      value: stats.currentStreak,
      subtitle: `${stats.currentStreak === 1 ? 'day' : 'days'} of logging`,
      icon: <Zap className="w-5 h-5" />,
      trend: stats.currentStreak >= 3 ? 'up' : 'neutral',
      color: 'purple',
    },
    {
      title: 'Monthly Average',
      value: stats.monthAvgCalories,
      subtitle: `${stats.monthAdherence}% adherence`,
      icon: <Calendar className="w-5 h-5" />,
      trend: stats.monthAdherence >= 70 ? 'up' : stats.monthAdherence >= 40 ? 'neutral' : 'down',
      color: 'indigo',
    },
  ];

  const getColorClasses = (color: string, trend?: 'up' | 'down' | 'neutral') => {
    const baseColors = {
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
      green: 'bg-green-100 dark:bg-green-900/20 text-green-600',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600',
    };

    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-600 dark:text-gray-400',
    };

    return {
      base: baseColors[color as keyof typeof baseColors],
      trend: trend ? trendColors[trend] : '',
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Award className="w-6 h-6" />
          Statistics & Insights
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => {
            const colors = getColorClasses(card.color, card.trend);
            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${colors.base}`}>
                    {card.icon}
                  </div>
                  {card.trend && (
                    <span className={`text-sm font-medium ${colors.trend}`}>
                      {card.trend === 'up' ? '↑' : card.trend === 'down' ? '↓' : '→'}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {card.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Macro Averages
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Protein</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.weekAvgProtein}g
                </span>
                <span className="text-sm text-gray-500">
                  / {targets.protein}g
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((stats.weekAvgProtein / targets.protein) * 100, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Carbs</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.weekAvgCarbs}g
                </span>
                <span className="text-sm text-gray-500">
                  / {targets.carbs}g
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((stats.weekAvgCarbs / targets.carbs) * 100, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Fat</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.weekAvgFat}g
                </span>
                <span className="text-sm text-gray-500">
                  / {targets.fat}g
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((stats.weekAvgFat / targets.fat) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Best & Worst Days
          </h3>
          <div className="space-y-4">
            {stats.bestDay && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">
                    Best Day
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(parseISO(stats.bestDay.date), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.bestDay.calories} calories
                  <span className="text-gray-500 ml-1">
                    ({stats.bestDay.diff} from target)
                  </span>
                </p>
              </div>
            )}

            {stats.worstDay && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900 dark:text-red-100">
                    Needs Improvement
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(parseISO(stats.worstDay.date), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.worstDay.calories} calories
                  <span className="text-gray-500 ml-1">
                    ({stats.worstDay.diff} from target)
                  </span>
                </p>
              </div>
            )}

            {!stats.bestDay && !stats.worstDay && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Start tracking to see your best and worst days!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
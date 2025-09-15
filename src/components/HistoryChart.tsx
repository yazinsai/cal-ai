'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { DailyProgress, DailyTarget } from '@/types';

interface HistoryChartProps {
  history: DailyProgress[];
  targets: DailyTarget;
}

type DateRange = '7' | '30' | '90';
type ChartType = 'calories' | 'macros';

export default function HistoryChart({ history, targets }: HistoryChartProps) {
  const [dateRange, setDateRange] = useState<DateRange>('7');
  const [chartType, setChartType] = useState<ChartType>('calories');

  const filteredData = useMemo(() => {
    const days = parseInt(dateRange);
    const cutoffDate = subDays(new Date(), days);
    
    return history
      .filter(day => parseISO(day.date) >= cutoffDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(day => ({
        date: format(parseISO(day.date), 'MMM dd'),
        calories: day.totals.calories,
        protein: Math.round(day.totals.protein),
        carbs: Math.round(day.totals.carbs),
        fat: Math.round(day.totals.fat),
        sugar: Math.round(day.totals.sugar),
        target: targets.calories,
      }));
  }, [history, dateRange, targets]);

  const averageCalories = useMemo(() => {
    if (filteredData.length === 0) return 0;
    return Math.round(
      filteredData.reduce((sum, day) => sum + day.calories, 0) / filteredData.length
    );
  }, [filteredData]);

  interface TooltipPayload {
    value: number;
    name: string;
  }
  
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {chartType === 'calories' ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Calories: <span className="font-semibold">{payload[0].value}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Target: <span className="font-semibold">{targets.calories}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {payload[0].value > targets.calories ? (
                  <span className="text-red-600">
                    +{payload[0].value - targets.calories} over
                  </span>
                ) : (
                  <span className="text-green-600">
                    -{targets.calories - payload[0].value} under
                  </span>
                )}
              </p>
            </>
          ) : (
            payload.map((entry, index: number) => (
              entry.name !== 'target' && (
                <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.name}: <span className="font-semibold">{entry.value}g</span>
                </p>
              )
            ))
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          History & Trends
        </h2>
        
        <div className="flex gap-2">
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            {(['7', '30', '90'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {range}d
              </button>
            ))}
          </div>
          
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setChartType('calories')}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                chartType === 'calories'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Calories
            </button>
            <button
              onClick={() => setChartType('macros')}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                chartType === 'macros'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Macros
            </button>
          </div>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <Calendar className="w-12 h-12 mb-4" />
          <p>No data available for this period</p>
          <p className="text-sm mt-2">Start tracking your meals to see trends!</p>
        </div>
      ) : (
        <>
          {chartType === 'calories' && (
            <div className="mb-4 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Average:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {averageCalories} cal/day
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Target:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {targets.calories} cal/day
                </span>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'calories' ? (
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine 
                  y={targets.calories} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: "Target", position: "insideTopRight" }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Calories"
                />
              </LineChart>
            ) : (
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="protein" stackId="a" fill="#10b981" name="Protein" />
                <Bar dataKey="carbs" stackId="a" fill="#3b82f6" name="Carbs" />
                <Bar dataKey="fat" stackId="a" fill="#f59e0b" name="Fat" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
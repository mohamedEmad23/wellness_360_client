'use client';

import { useEffect, useState } from 'react';
import { Activity, Moon, Utensils } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LegendProps } from 'recharts';

interface CompletionRate {
  workouts: number;
  sleepLogs: number;
  foodLogs: number;
}

interface UserStats {
  totalWorkouts: number;
  totalSleepLogs: number;
  totalFoodLogs: number;
  weeklyWorkouts: number;
  weeklySleepLogs: number;
  weeklyFoodLogs: number;
  completionRate: CompletionRate;
}

interface ActivitySummary {
  period: string;
  periodLabel: string;
  stats: {
    workoutTime: { total: number; unit: string; change: number };
    caloriesBurned: { total: number; unit: string; change: number };
    activityCount: { total: number; change: number };
  };
  topActivities: any[];
}

interface SleepSummary {
  period: string;
  periodLabel: string;
  stats: {
    avgDuration: { value: number; unit: string; change: number };
    avgRating: { value: number; scale: string; change: number };
    consistency: { value: number; unit: string };
  };
  qualityDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    veryPoor: number;
  };
}

interface NutritionSummary {
  period: string;
  periodLabel: string;
  stats: {
    calories: { total: number; average: number; unit: string; change: number };
    protein: { total: number; average: number; unit: string; change: number; percentage: number };
    carbs: { total: number; average: number; unit: string; change: number; percentage: number };
    fats: { total: number; average: number; unit: string; change: number; percentage: number };
  };
  macroDistribution: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

type Period = 'daily' | 'weekly' | 'monthly';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B']; // Blue for protein, Green for carbs, Orange for fats

export default function UserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [sleepSummary, setSleepSummary] = useState<SleepSummary | null>(null);
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('daily');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard?type=user-stats', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch user stats: ${response.status}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        // Fetch all summaries in parallel
        const [activityRes, sleepRes, nutritionRes] = await Promise.all([
          fetch(`/api/dashboard?type=activity-summary&period=${period}`, { credentials: 'include' }),
          fetch(`/api/dashboard?type=sleep-summary&period=${period}`, { credentials: 'include' }),
          fetch(`/api/dashboard?type=nutrition-summary&period=${period}`, { credentials: 'include' })
        ]);

        // Handle activity summary
        if (!activityRes.ok) {
          throw new Error(`Failed to fetch activity summary: ${activityRes.status}`);
        }
        const activityData = await activityRes.json();
        setActivitySummary(activityData);

        // Handle sleep summary
        if (!sleepRes.ok) {
          throw new Error(`Failed to fetch sleep summary: ${sleepRes.status}`);
        }
        const sleepData = await sleepRes.json();
        setSleepSummary(sleepData);

        // Handle nutrition summary
        if (!nutritionRes.ok) {
          throw new Error(`Failed to fetch nutrition summary: ${nutritionRes.status}`);
        }
        const nutritionData = await nutritionRes.json();
        setNutritionSummary(nutritionData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchSummaries();
  }, [period]);

  const renderMacroPieChart = (nutritionSummary: NutritionSummary) => {
    const data = [
      { name: 'Protein', value: nutritionSummary.stats.protein.percentage },
      { name: 'Carbs', value: nutritionSummary.stats.carbs.percentage },
      { name: 'Fats', value: nutritionSummary.stats.fats.percentage }
    ];

    return (
      <div className="h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string, entry: any) => `${value} ${entry.payload?.value}%`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <div className="space-y-4">
        {/* Total Stats - Full Width */}
        <div className="bg-black/30 border border-white/5 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Total Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 text-gray-300">
              <p>Workouts: {stats.totalWorkouts}</p>
              <p>Sleep Logs: {stats.totalSleepLogs}</p>
              <p>Food Logs: {stats.totalFoodLogs}</p>
            </div>
          </div>
        </div>

        {/* Weekly Stats and Completion Rate - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekly Stats */}
          <div className="bg-black/30 border border-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">This Week</h3>
            <div className="space-y-2 text-gray-300">
              <p>Workouts: {stats.weeklyWorkouts}</p>
              <p>Sleep Logs: {stats.weeklySleepLogs}</p>
              <p>Food Logs: {stats.weeklyFoodLogs}</p>
            </div>
          </div>

          {/* Completion Rates */}
          <div className="bg-black/30 border border-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
            <div className="space-y-4">
              {/* Workouts Progress */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300">Workouts</span>
                  <span className="text-sm text-gray-300">{stats.completionRate.workouts}%</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate.workouts}%` }}
                  />
                </div>
              </div>

              {/* Sleep Logs Progress */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300">Sleep Logs</span>
                  <span className="text-sm text-gray-300">{stats.completionRate.sleepLogs}%</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate.sleepLogs}%` }}
                  />
                </div>
              </div>

              {/* Food Logs Progress */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300">Food Logs</span>
                  <span className="text-sm text-gray-300">{stats.completionRate.foodLogs}%</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate.foodLogs}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex justify-center mt-6">
        <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-1">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              period === 'daily' 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              period === 'weekly' 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              period === 'monthly' 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Summary Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Workout Summary */}
        <div className="bg-black/30 border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Workout</h3>
          </div>
          {activitySummary ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Workout Time</p>
                <p className="text-xl font-semibold text-white">
                  {activitySummary.stats.workoutTime.total} {activitySummary.stats.workoutTime.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Calories Burned</p>
                <p className="text-xl font-semibold text-white">
                  {activitySummary.stats.caloriesBurned.total} {activitySummary.stats.caloriesBurned.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Activities</p>
                <p className="text-xl font-semibold text-white">{activitySummary.stats.activityCount.total}</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">Loading workout data...</div>
          )}
        </div>

        {/* Nutrition Summary */}
        <div className="bg-black/30 border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Nutrition</h3>
          </div>
          {nutritionSummary ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Calories</p>
                <p className="text-xl font-semibold text-white">
                  {nutritionSummary.stats.calories.total} {nutritionSummary.stats.calories.unit}
                </p>
              </div>
              {renderMacroPieChart(nutritionSummary)}
            </div>
          ) : (
            <div className="text-gray-400">Loading nutrition data...</div>
          )}
        </div>

        {/* Sleep Summary */}
        <div className="bg-black/30 border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Sleep</h3>
          </div>
          {sleepSummary ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Average Duration</p>
                <p className="text-xl font-semibold text-white">
                  {sleepSummary.stats.avgDuration.value} {sleepSummary.stats.avgDuration.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Average Rating</p>
                <p className="text-xl font-semibold text-white">
                  {sleepSummary.stats.avgRating.value} / {sleepSummary.stats.avgRating.scale}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">Loading sleep data...</div>
          )}
        </div>
      </div>
    </div>
  );
} 
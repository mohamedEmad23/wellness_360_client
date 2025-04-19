'use client'

import { useState } from 'react'
import { Activity, Utensils, Moon } from 'lucide-react'
import WorkoutTracker from '@/components/dashboard/WorkoutTracker'
import NutritionTracker from '@/components/dashboard/NutritionTracker'
import SleepTracker from '@/components/dashboard/SleepTracker'

export default function ActivityTabs() {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'sleep'>('workout')

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex bg-black/30 p-1 rounded-xl mb-8 w-full md:w-auto">
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'workout'
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Workout</span>
        </button>
        
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'nutrition'
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Nutrition</span>
        </button>
        
        <button
          onClick={() => setActiveTab('sleep')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'sleep'
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>Sleep</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-6">
        {activeTab === 'workout' && (
          <div className="animate-in fade-in duration-300">
            <WorkoutTracker />
          </div>
        )}
        
        {activeTab === 'nutrition' && (
          <div className="animate-in fade-in duration-300">
            <NutritionTracker />
          </div>
        )}
        
        {activeTab === 'sleep' && (
          <div className="animate-in fade-in duration-300">
            <SleepTracker />
          </div>
        )}
      </div>
    </div>
  )
} 
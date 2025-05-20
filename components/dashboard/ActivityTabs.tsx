'use client'

import { useState, Dispatch, SetStateAction } from 'react'
import { Activity, Utensils, Moon, Plus } from 'lucide-react'
import WorkoutTracker from '@/components/dashboard/WorkoutTracker'
import NutritionTracker from '@/components/dashboard/NutritionTracker'
import SleepTracker from '@/components/dashboard/SleepTracker'

interface ActivityTabsProps {
  showAddEntry?: boolean;
  setShowAddEntry?: Dispatch<SetStateAction<boolean>>;
}

export default function ActivityTabs({ showAddEntry, setShowAddEntry }: ActivityTabsProps = {}) {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'sleep'>('workout')
  const [localShowAddEntry, setLocalShowAddEntry] = useState(false)

  // Use provided state or local state
  const formVisible = showAddEntry !== undefined ? showAddEntry : localShowAddEntry;
  const setFormVisible = setShowAddEntry || setLocalShowAddEntry;

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

      {/* Content Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
        
        {/* Show Add Entry button only for Workout tab */}
        {activeTab === 'workout' && (
          <button 
            onClick={() => setFormVisible(!formVisible)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-6">
        {activeTab === 'workout' && (
          <div className="animate-in fade-in duration-300">
            <WorkoutTracker showForm={formVisible} setShowForm={setFormVisible} />
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
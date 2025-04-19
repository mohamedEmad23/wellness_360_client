'use client'

import ActivityTabs from '@/components/dashboard/ActivityTabs'

export default function ActivityPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Activity Tracking</h1>
        <p className="text-gray-400 mt-1">Monitor and manage your fitness activities, nutrition, and sleep</p>
      </div>
      
      <ActivityTabs />
    </div>
  )
} 
'use client'

import UserStats from '@/components/dashboard/UserStats'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <UserStats />
    </div>
  )
} 
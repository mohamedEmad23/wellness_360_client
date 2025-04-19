'use client'

import { Menu, Plus, Calendar, Search } from 'lucide-react'

interface DashboardHeaderProps {
  title: string
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

export default function DashboardHeader({ 
  title, 
  toggleSidebar,
  isSidebarOpen 
}: DashboardHeaderProps) {
  return (
    <header className="bg-black border-b border-white/10 h-16 flex items-center px-4 lg:px-6">
      <div className="flex items-center gap-4 w-full">
        {/* Menu toggle button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Title */}
        <h1 className="text-xl font-semibold">{title}</h1>
        
        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {title === 'Todo List' && (
            <button 
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Todo</span>
            </button>
          )}
          
          {title === 'Calendar' && (
            <button 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar View</span>
            </button>
          )}
          
          {/* Search button - can be expanded later */}
          <button 
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
} 
'use client'

import { useState, Dispatch, SetStateAction, useEffect, useRef } from 'react'
import { 
  ChevronDown, 
  Activity, 
  Loader2,
  Wind,
  Bike,
  Dumbbell,
  Droplet,
  Globe,
  CircleDashed,
  Heart,
  Flower2,
  Footprints,
  Mountain,
  Waves,
  Snowflake,
  Sword,
  Music,
  Ship,
  Flag,
  Flame,
  Trophy,
  HandIcon,
  Table2,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react'
import { 
  FaRunning, 
  FaWalking, 
  FaBiking, 
  FaSwimmer, 
  FaDumbbell, 
  FaFire, 
  FaFutbol, 
  FaBasketballBall, 
  FaVolleyballBall, 
  FaHockeyPuck, 
  FaTableTennis, 
  FaHandRock, 
  FaMountain, 
  FaSnowflake, 
  FaSkating, 
  FaGolfBall, 
  FaMusic, 
  FaPray, 
  FaTrophy,
  FaShip,
  FaWater,
  FaFlag,
  FaHeart,
  FaTable
} from 'react-icons/fa'

interface Activity {
  id: string;
  name: string;
  met: number;
}

interface ActivityLog {
  _id: string;
  activity: string;
  duration: number;
  title: string;
  caloriesBurned: number;
  date: string;
}

interface WorkoutTrackerProps {
  showForm: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
}

export default function WorkoutTracker({ showForm, setShowForm }: WorkoutTrackerProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [userActivityLogs, setUserActivityLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    activityId: '',
    title: '',
    duration: ''
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{visible: boolean, activityId: string, title: string}>({
    visible: false,
    activityId: '',
    title: ''
  })

  // Add useEffect to fetch activities and user logs on mount
  useEffect(() => {
    fetchActivities()
    fetchUserActivityLogs()
  }, [])

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchActivities = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Fetching activities...')
      const response = await fetch('/api/activity?type=activities')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Activities fetched:', data)
      setActivities(data)
    } catch (error) {
      console.error('Error fetching activities:', error)
      setError('Could not load activities. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserActivityLogs = async () => {
    setIsLoadingLogs(true)
    
    try {
      console.log('Fetching user activity logs...')
      const response = await fetch('/api/activity')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user logs: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('User activity logs fetched:', data)
      setUserActivityLogs(data)
    } catch (error) {
      console.error('Error fetching user activity logs:', error)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('Submitting activity:', formData)
      
      const response = await fetch('/api/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: formData.activityId,
          duration: Number(formData.duration),
          title: formData.title
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', response.status, errorText)
        throw new Error('Failed to save activity')
      }
      
      // Reset form and close
      setFormData({
        activityId: '',
        title: '',
        duration: ''
      })
      
      setShowForm(false)
      
      // Refresh user activity logs after successful submission
      fetchUserActivityLogs()
      
    } catch (error) {
      console.error('Error submitting activity:', error)
      setError('Failed to save activity. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Custom dropdown handlers
  const handleDropdownClick = () => {
    if (!isLoading && !isSubmitting) {
      setIsDropdownOpen(!isDropdownOpen)
    }
  }

  const handleActivitySelect = (activityId: string, activityName: string) => {
    setFormData(prev => ({
      ...prev,
      activityId
    }))
    setIsDropdownOpen(false)
  }

  // New function to handle activity deletion
  const deleteActivity = async (id: string) => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/activity?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Delete error:', response.status, errorText)
        throw new Error('Failed to delete activity')
      }
      
      // After successful deletion, refresh the logs
      fetchUserActivityLogs()
      
      // Show success message or notification here if needed
    } catch (error) {
      console.error('Error deleting activity:', error)
      setError('Failed to delete activity. Please try again.')
    } finally {
      setIsDeleting(false)
      // Close confirmation modal
      setDeleteConfirmation({visible: false, activityId: '', title: ''})
    }
  }
  
  // Function to open delete confirmation
  const confirmDelete = (activityId: string, title: string) => {
    setDeleteConfirmation({
      visible: true,
      activityId,
      title
    })
  }
  
  // Function to cancel delete
  const cancelDelete = () => {
    setDeleteConfirmation({
      visible: false,
      activityId: '',
      title: ''
    })
  }

  // Function to get the appropriate icon for an activity
  const getActivityIcon = (activityName: string) => {
    const name = activityName.toLowerCase();
    
    // Running & Cardio
    if (name.includes('run') || name.includes('jog')) {
      return <FaRunning size={20} className="text-blue-400" />;
    } else if (name.includes('walk')) {
      return <FaWalking size={20} className="text-teal-400" />;
    } else if (name.includes('jump') || name.includes('rope')) {
      return <FaRunning size={20} className="text-blue-200" />;
      
    // Cycling  
    } else if (name.includes('bike') || name.includes('cycl')) {
      return <FaBiking size={20} className="text-green-400" />;
      
    // Water sports  
    } else if (name.includes('swim')) {
      return <FaSwimmer size={20} className="text-cyan-400" />;
    } else if (name.includes('surf') || name.includes('paddle')) {
      return <FaWater size={20} className="text-sky-400" />;
    } else if (name.includes('row') || name.includes('canoe') || name.includes('kayak')) {
      return <FaShip size={20} className="text-blue-500" />;
      
    // Gym & Strength  
    } else if (name.includes('weight') || name.includes('lift') || name.includes('gym')) {
      return <FaDumbbell size={20} className="text-yellow-400" />;
    } else if (name.includes('crossfit')) {
      return <FaFire size={20} className="text-red-500" />;
      
    // Team Sports  
    } else if (name.includes('soccer') || name.includes('football')) {
      return <FaFutbol size={20} className="text-emerald-400" />;
    } else if (name.includes('basketball')) {
      return <FaBasketballBall size={20} className="text-orange-400" />;
    } else if (name.includes('volleyball')) {
      return <FaVolleyballBall size={20} className="text-yellow-300" />;
    } else if (name.includes('hockey')) {
      return <FaHockeyPuck size={20} className="text-blue-300" />;
      
    // Racquet Sports
    } else if (name.includes('tennis') || name.includes('badminton')) {
      return <FaTableTennis size={20} className="text-green-300" />;
    } else if (name.includes('table tennis') || name.includes('ping pong')) {
      return <FaTableTennis size={20} className="text-blue-200" />;
      
    // Combat Sports  
    } else if (name.includes('box') || name.includes('fight')) {
      return <FaHandRock size={20} className="text-red-500" />;
    } else if (name.includes('martial') || name.includes('karate') || name.includes('judo')) {
      return <FaHandRock size={20} className="text-gray-300" />;
      
    // Outdoor Activities  
    } else if (name.includes('hike') || name.includes('climb')) {
      return <FaMountain size={20} className="text-amber-400" />;
    } else if (name.includes('ski') || name.includes('snowboard')) {
      return <FaSnowflake size={20} className="text-indigo-400" />;
    } else if (name.includes('skate')) {
      return <FaSkating size={20} className="text-purple-300" />;
    } else if (name.includes('golf')) {
      return <FaGolfBall size={20} className="text-green-500" />;
      
    // Dance & Rhythmic  
    } else if (name.includes('danc')) {
      return <FaMusic size={20} className="text-pink-400" />;
    } else if (name.includes('aerobic')) {
      return <FaHeart size={20} className="text-orange-300" />;
      
    // Mind-Body Exercises  
    } else if (name.includes('yoga') || name.includes('stretch')) {
      return <FaPray size={20} className="text-purple-400" />;
    } else if (name.includes('pilates')) {
      return <FaPray size={20} className="text-purple-300" />;
    } else if (name.includes('gymnastics')) {
      return <FaTrophy size={20} className="text-yellow-500" />;
    }
    
    // Default icon for other activities
    return <Activity size={20} className="text-primary" />;
  };

  return (
    <div>
      {/* Activity Form */}
      {showForm && (
        <div className="bg-black/20 border border-white/10 rounded-xl p-6 mb-6 animate-in fade-in duration-300">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Add New Entry</h3>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="activityType" className="block text-sm font-medium mb-2 text-gray-200">
                  Activity Type
                </label>
                <div className="relative" ref={dropdownRef}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                    {formData.activityId ? (
                      getActivityIcon(activities.find(a => a.id === formData.activityId)?.name || '')
                    ) : (
                      <Activity size={18} />
                    )}
                  </div>
                  
                  {/* Custom dropdown trigger */}
                  <div 
                    onClick={handleDropdownClick}
                    className={`w-full bg-black/20 border ${isDropdownOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/10'} rounded-xl pl-11 pr-10 py-3 text-white cursor-pointer transition-colors flex items-center`}
                  >
                    {formData.activityId ? (
                      activities.find(a => a.id === formData.activityId)?.name || 'Select an activity'
                    ) : (
                      <span className="text-gray-400">Select an activity</span>
                    )}
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ChevronDown size={18} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />}
                  </div>
                  
                  {/* Custom dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 py-2 bg-black/90 border border-white/10 rounded-xl shadow-lg backdrop-blur-sm max-h-60 overflow-y-auto custom-scrollbar">
                      {isLoading ? (
                        <div className="px-4 py-2 text-gray-400 flex items-center">
                          <Loader2 size={16} className="animate-spin mr-2" />
                          <span>Loading activities...</span>
                        </div>
                      ) : activities.length === 0 ? (
                        <div className="px-4 py-2 text-gray-400">No activities available</div>
                      ) : (
                        activities.map(activity => (
                          <div 
                            key={activity.id} 
                            onClick={() => handleActivitySelect(activity.id, activity.name)}
                            className={`px-4 py-2 cursor-pointer hover:bg-white/5 transition-colors ${activity.id === formData.activityId ? 'bg-primary/20 text-primary' : 'text-white'}`}
                          >
                            {activity.name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  
                  {/* Hidden actual select for form submission */}
                  <select
                    id="activityId"
                    name="activityId"
                    value={formData.activityId}
                    onChange={handleChange}
                    required
                    className="hidden"
                  >
                    <option value="">Select an activity</option>
                    {activities.map(activity => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {error && activities.length === 0 && !isLoading && (
                  <p className="mt-2 text-xs text-red-400">
                    {error}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-200">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
                  placeholder="Enter a title for your activity"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium mb-2 text-gray-200">
                  Duration (minutes)
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
                  placeholder="Enter duration in minutes"
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl transition-colors w-full disabled:opacity-50 flex justify-center items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Entry'
                )}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowForm(false)}
                className="border border-white/10 hover:bg-white/5 py-2.5 rounded-xl transition-colors w-full disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.visible && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center mb-4 text-red-400">
              <AlertTriangle className="mr-2" size={24} />
              <h3 className="text-lg font-semibold">Delete Activity</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirmation.title}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteActivity(deleteConfirmation.activityId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors flex items-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Activity Logs */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Your Activity History</h3>
        
        {isLoadingLogs ? (
          <p className="text-gray-300">Loading your activities...</p>
        ) : userActivityLogs.length > 0 ? (
          <div className="space-y-4">
            {userActivityLogs.map((log) => (
              <div 
                key={log._id} 
                className="p-4 border border-white/10 rounded-lg hover:border-white/20 transition-colors relative group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="mr-3 p-2 bg-black/30 rounded-lg">
                      {getActivityIcon(log.activity)}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{log.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{log.activity}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(log.date)}</span>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-primary">{log.caloriesBurned} calories burned</span>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => confirmDelete(log._id, log.title)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md"
                      title="Delete activity"
                      aria-label="Delete activity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="text-sm text-gray-400">{log.duration} minutes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300">You haven't logged any activities yet.</p>
        )}
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { Plus, Moon, ChevronDown, Pencil, Trash2, AlertTriangle, X, Clock, Calendar, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SleepEntry {
  _id: string
  userID: string
  startTime: string
  endTime: string
  duration: number
  rating: number
  notes: string
  createdAt: string
  updatedAt: string
  __v: number
}

const SLEEP_QUALITY_OPTIONS = [
  { label: 'Excellent', value: 5, description: 'Woke up feeling fully refreshed' },
  { label: 'Great', value: 4, description: 'Slept well with minor interruptions' },
  { label: 'Good', value: 3, description: 'Decent sleep, but could be better' },
  { label: 'Fair', value: 2, description: 'Had trouble sleeping' },
  { label: 'Poor', value: 1, description: 'Barely slept or very restless' }
]

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const Tooltip = ({ children, content, position = 'top' }: TooltipProps) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div className="relative group">
      {children}
      <div className={`absolute ${positionClasses[position]} pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50`}>
        <div className="flex items-center">
          <div className="bg-[#0A0A0A] text-white text-sm py-2 px-3 rounded-lg shadow-lg border border-white/10 whitespace-nowrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SleepTracker() {
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [isQualityOpen, setIsQualityOpen] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<{ label: string; value: number } | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<SleepEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchSleepEntries = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/sleep', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your sleep records')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch sleep records')
      }

      const data = await response.json()
      setSleepEntries(data)
      setEditingEntry(null)
      setIsAddingEntry(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sleep records')
      console.error('Error fetching sleep records:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSleepEntries()
  }, [])

  useEffect(() => {
    if (isAddingEntry) {
      if (!editingEntry) {
        const today = new Date()
        setSelectedDate(today.toISOString().split('T')[0])
        setSelectedTime('')
        setSelectedQuality(null)
      } else {
        const date = new Date(editingEntry.startTime)
        setSelectedDate(date.toISOString().split('T')[0])
        setSelectedTime(date.toTimeString().split(':').slice(0, 2).join(':'))
        const quality = SLEEP_QUALITY_OPTIONS.find(q => q.value === editingEntry.rating)
        setSelectedQuality(quality || null)
      }
    }
  }, [isAddingEntry, editingEntry])

  const handleQualitySelect = (option: { label: string; value: number }) => {
    setSelectedQuality(option)
    setIsQualityOpen(false)
  }

  const calculateEndTime = (date: string, time: string, durationHours: number): string => {
    const startDateTime = new Date(`${date}T${time}`)
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000)
    return endDateTime.toISOString()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      
      const formData = new FormData(event.currentTarget)
      const date = formData.get('date') as string
      const time = formData.get('time') as string
      const duration = parseFloat(formData.get('duration') as string)
      
      const startTime = `${date}T${time}`
      const endTime = calculateEndTime(date, time, duration)
      
      const sleepData = {
        startTime,
        endTime,
        duration,
        rating: selectedQuality?.value || 5,
        notes: formData.get('notes') as string || ''
      }

      let response;
      if (editingEntry) {
        // Update existing entry using the [id] route
        response = await fetch(`/api/sleep/${editingEntry._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(sleepData),
        });
      } else {
        // Create new entry
        response = await fetch('/api/sleep', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(sleepData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${editingEntry ? 'update' : 'create'} sleep record`)
      }

      await fetchSleepEntries()
      handleCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingEntry ? 'update' : 'create'} sleep record`)
      console.error('Error saving sleep record:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (entry: SleepEntry) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Use the [id] route for deletion
      const response = await fetch(`/api/sleep/${entry._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete sleep record')
      }

      await fetchSleepEntries()
      setDeletingEntry(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sleep record')
      console.error('Error deleting sleep record:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  }

  const handleEdit = (entry: SleepEntry) => {
    setEditingEntry(entry)
    setIsAddingEntry(true)
    setSelectedQuality(SLEEP_QUALITY_OPTIONS.find(q => q.value === entry.rating) || null)
  }

  const handleCancel = () => {
    setIsAddingEntry(false)
    setEditingEntry(null)
    setSelectedQuality(null)
    setSelectedDate('')
    setSelectedTime('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Moon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Sleep Tracker</h2>
        </div>
        <button
          onClick={() => setIsAddingEntry(true)}
          disabled={isAddingEntry}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading sleep records...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {isAddingEntry ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-black/20 border border-white/10 rounded-xl p-6"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 
                        hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/50 
                        transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Sleep Time
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 
                        hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/50 
                        transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    placeholder="7.5"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 
                      hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/50 
                      transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="rating" className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    Sleep Quality
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsQualityOpen(!isQualityOpen)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-left flex items-center justify-between hover:border-primary/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                    >
                      <span className={selectedQuality ? 'text-white' : 'text-gray-500'}>
                        {selectedQuality ? selectedQuality.label : 'Select sleep quality'}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isQualityOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isQualityOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-2 bg-black/90 border border-white/10 rounded-lg shadow-lg backdrop-blur-sm"
                        >
                          <div className="py-1">
                            {SLEEP_QUALITY_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleQualitySelect(option)}
                                className={`w-full px-4 py-2.5 text-left hover:bg-primary/20 transition-colors ${
                                  selectedQuality?.value === option.value
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-white'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option.label}</span>
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: option.value }).map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

    <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 
                      hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/50 
                      transition-all duration-200"
                    placeholder="How did you sleep? Any disturbances?"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg 
                      transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{editingEntry ? 'Updating...' : 'Saving...'}</span>
                      </div>
                    ) : (
                      editingEntry ? 'Update Entry' : 'Save Entry'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 bg-black/50 border border-white/10 text-white py-2.5 px-4 rounded-lg 
                      hover:border-primary/50 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {sleepEntries.map((entry: SleepEntry) => (
                <motion.div
                  key={entry._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`bg-black/20 border rounded-xl p-6 flex items-start gap-4 
                    transition-all duration-200 hover:border-primary/50 hover:bg-black/30`}
                >
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Moon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-400">
                          {formatDateTime(entry.startTime)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Duration: {calculateDuration(entry.startTime, entry.endTime).toFixed(1)} hours
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: entry.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-primary fill-current" />
                          ))}
                          {Array.from({ length: 5 - entry.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gray-600" />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Edit sleep entry" position="left">
                            <button
                              onClick={() => handleEdit(entry)}
                              disabled={isSubmitting}
                              className="p-2 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Pencil className="w-4 h-4 text-primary" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete sleep entry" position="left">
                            <button
                              onClick={() => setDeletingEntry(entry)}
                              disabled={isSubmitting}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-gray-300">{entry.notes}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {sleepEntries.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 text-gray-400"
                >
                  <Moon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No sleep entries yet. Start tracking your sleep by adding an entry.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingEntry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => !isSubmitting && setDeletingEntry(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="bg-black/90 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl pointer-events-auto">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Delete Sleep Entry</h3>
                    <p className="text-gray-400 mb-4">
                      Are you sure you want to delete this sleep entry? This action cannot be undone.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDelete(deletingEntry)}
                        disabled={isSubmitting}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg 
                          transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Deleting...</span>
                          </div>
                        ) : (
                          'Delete Entry'
                        )}
                      </button>
                      <button
                        onClick={() => setDeletingEntry(null)}
                        disabled={isSubmitting}
                        className="flex-1 bg-black/50 border border-white/10 text-white py-2.5 px-4 rounded-lg 
                          hover:border-white/20 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeletingEntry(null)}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 
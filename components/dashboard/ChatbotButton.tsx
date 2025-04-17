'use client'

import { useState } from 'react'
import { MessageSquareText } from 'lucide-react'
import ChatbotOverlay from './ChatbotOverlay'

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* Floating button with professional tooltip */}
      <div className="fixed right-6 bottom-6 flex items-center gap-3 z-40">
        {/* Tooltip */}
        <div 
          className={`
            bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm
            transition-all duration-300 shadow-lg
            ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
          `}
        >
          Chat with wellness assistant
        </div>
        
        {/* Button */}
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="p-4 bg-primary rounded-full shadow-xl hover:bg-primary-dark transition-all duration-300 active:scale-95 relative"
          aria-label="Open AI assistant"
        >
          <MessageSquareText className="w-6 h-6 text-white" />
          
          {/* Subtle pulse effect instead of the larger animation */}
          <span className="absolute inset-0 rounded-full bg-primary-dark/50 animate-pulse"></span>
        </button>
      </div>

      {/* Chatbot overlay */}
      <ChatbotOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
} 
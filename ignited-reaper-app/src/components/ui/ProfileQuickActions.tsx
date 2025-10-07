'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Heart, 
  Share2, 
  Bookmark, 
  MessageCircle, 
  UserPlus, 
  Bell,
  MoreHorizontal 
} from 'lucide-react'

interface ProfileQuickActionsProps {
  profileId: string
  isVisible: boolean
  onClose: () => void
}

export function ProfileQuickActions({ profileId, isVisible, onClose }: ProfileQuickActionsProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isNotifying, setIsNotifying] = useState(false)

  const handleAction = (action: string, callback: () => void) => {
    callback()
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Check out this profile',
        text: 'Found this interesting profile on IgNited Reaper',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (!isVisible) return null

  const actions = [
    {
      icon: Heart,
      label: 'Like',
      active: isLiked,
      action: () => handleAction('like', () => setIsLiked(!isLiked)),
      color: 'text-red-400',
      activeColor: 'bg-red-500/20 text-red-400'
    },
    {
      icon: Bookmark,
      label: 'Save',
      active: isBookmarked,
      action: () => handleAction('bookmark', () => setIsBookmarked(!isBookmarked)),
      color: 'text-yellow-400',
      activeColor: 'bg-yellow-500/20 text-yellow-400'
    },
    {
      icon: UserPlus,
      label: isFollowing ? 'Following' : 'Follow',
      active: isFollowing,
      action: () => handleAction('follow', () => setIsFollowing(!isFollowing)),
      color: 'text-blue-400',
      activeColor: 'bg-blue-500/20 text-blue-400'
    },
    {
      icon: Bell,
      label: 'Notify',
      active: isNotifying,
      action: () => handleAction('notify', () => setIsNotifying(!isNotifying)),
      color: 'text-purple-400',
      activeColor: 'bg-purple-500/20 text-purple-400'
    },
    {
      icon: Share2,
      label: 'Share',
      active: false,
      action: handleShare,
      color: 'text-green-400',
      activeColor: 'bg-green-500/20 text-green-400'
    },
    {
      icon: MessageCircle,
      label: 'Message',
      active: false,
      action: () => handleAction('message', () => {}),
      color: 'text-indigo-400',
      activeColor: 'bg-indigo-500/20 text-indigo-400'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
        <div className="grid grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <motion.button
              key={action.label}
              onClick={action.action}
              className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 ${
                action.active 
                  ? action.activeColor 
                  : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <action.icon size={18} />
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
        
        <motion.button
          onClick={onClose}
          className="w-full mt-3 p-2 text-xs text-slate-400 hover:text-white transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MoreHorizontal className="mx-auto" size={16} />
        </motion.button>
      </div>
    </motion.div>
  )
}
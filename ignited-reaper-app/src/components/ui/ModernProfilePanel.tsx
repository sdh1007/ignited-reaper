'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { 
  X, 
  ExternalLink, 
  Calendar, 
  Users, 
  CheckCircle, 
  Star, 
  MessageCircle, 
  TrendingUp,
  MapPin,
  Clock,
  Share2,
  Heart,
  Bookmark,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useCemeteryStore } from '@/store/cemetery'
import Image from 'next/image'
import { ProfileNavigation } from './ProfileNavigation'

interface ProfileStats {
  followers: number
  following: number
  posts: number
  engagement: number
}

interface ProfileActivity {
  id: string
  type: 'post' | 'video' | 'stream' | 'collab'
  title: string
  timestamp: string
  engagement: number
  thumbnail?: string
}

export function ModernProfilePanel() {
  const { selectedProfile, setSelectedProfile } = useCemeteryStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'stats' | 'activity'>('overview')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Mock data for enhanced features
  const mockStats: ProfileStats = selectedProfile ? {
    followers: selectedProfile.followers,
    following: Math.floor(selectedProfile.followers * 0.1),
    posts: Math.floor(Math.random() * 500 + 100),
    engagement: Math.floor(Math.random() * 15 + 5)
  } : { followers: 0, following: 0, posts: 0, engagement: 0 }

  const mockActivity: ProfileActivity[] = selectedProfile ? [
    {
      id: '1',
      type: 'post',
      title: 'New ethereal artwork collection',
      timestamp: '2 hours ago',
      engagement: 1250,
      thumbnail: selectedProfile.avatar
    },
    {
      id: '2',
      type: 'video',
      title: 'Behind the scenes: Digital necromancy',
      timestamp: '1 day ago',
      engagement: 890,
      thumbnail: selectedProfile.avatar
    },
    {
      id: '3',
      type: 'stream',
      title: 'Live from the void',
      timestamp: '3 days ago',
      engagement: 2100,
      thumbnail: selectedProfile.avatar
    }
  ] : []

  useEffect(() => {
    if (selectedProfile && panelRef.current) {
      const focusable = panelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusable?.focus()
    }
  }, [selectedProfile])

  if (!selectedProfile) return null

  const formatNumber = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const getPlatformIcon = () => {
    const icons = {
      twitter: '🐦',
      instagram: '📸',
      tiktok: '🎵',
      youtube: '📺',
      twitch: '🎮',
      linkedin: '💼',
      github: '💻',
      discord: '💬'
    }
    return icons[selectedProfile.platform] || '🌐'
  }

  const getPlatformColor = () => {
    const colors = {
      twitter: '#1DA1F2',
      instagram: '#E4405F',
      tiktok: '#FF0050',
      youtube: '#FF0000',
      twitch: '#9146FF',
      linkedin: '#0077B5',
      github: '#333',
      discord: '#5865F2'
    }
    return colors[selectedProfile.platform] || selectedProfile.color
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Star },
    { id: 'content', label: 'Content', icon: Play },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'activity', label: 'Activity', icon: Clock }
  ]

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: selectedProfile.displayName,
        text: selectedProfile.bio,
        url: selectedProfile.profileUrl
      })
    } else {
      navigator.clipboard.writeText(selectedProfile.profileUrl)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedProfile(null)
          }
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modern Profile Panel */}
        <motion.div
          ref={panelRef}
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-2xl h-screen bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 flex flex-col"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProfile.displayName} profile`}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
              style={{ background: `radial-gradient(circle, ${selectedProfile.color}, transparent)` }}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle, ${getPlatformColor()}, transparent)` }}
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Header - Fixed at top */}
          <div className="relative flex-shrink-0">
            {/* Cover Image */}
            <motion.div 
              className="h-48 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 relative overflow-hidden"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-br opacity-80"
                style={{ 
                  background: `linear-gradient(135deg, ${selectedProfile.color}40, ${getPlatformColor()}20)` 
                }}
              />
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
                animate={{ x: [0, 60], y: [0, 60] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Top Controls */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <motion.button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/50 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 size={18} />
                </motion.button>
                <motion.button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                    isBookmarked 
                      ? 'bg-yellow-500/30 text-yellow-400' 
                      : 'bg-black/30 text-white/80 hover:text-white hover:bg-black/50'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bookmark size={18} />
                </motion.button>
                <motion.button
                  onClick={() => setSelectedProfile(null)}
                  className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/50 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
            </motion.div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              {/* Avatar */}
              <motion.div
                className="absolute -top-16 left-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-2xl border-4 border-white/20 overflow-hidden shadow-2xl"
                    style={{ 
                      boxShadow: `0 20px 40px ${selectedProfile.color}40` 
                    }}
                  >
                    <Image
                      src={selectedProfile.avatar}
                      alt={selectedProfile.displayName}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Platform badge */}
                  <motion.div
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
                    style={{ backgroundColor: getPlatformColor() }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    {getPlatformIcon()}
                  </motion.div>

                  {selectedProfile.verified && (
                    <motion.div
                      className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring" }}
                    >
                      <CheckCircle size={16} className="text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Quick Stats */}
              <div className="flex justify-end pt-4 gap-6">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-xl font-bold text-white">{formatNumber(mockStats.followers)}</div>
                  <div className="text-sm text-slate-400">Followers</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-xl font-bold text-white">{formatNumber(mockStats.following)}</div>
                  <div className="text-sm text-slate-400">Following</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-xl font-bold text-white">{formatNumber(mockStats.posts)}</div>
                  <div className="text-sm text-slate-400">Posts</div>
                </motion.div>
              </div>

              {/* Name and Bio */}
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {selectedProfile.displayName}
                  </h1>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: getPlatformColor() }}
                  >
                    {selectedProfile.platform}
                  </span>
                </div>
                
                <p 
                  className="text-lg font-medium mb-3"
                  style={{ color: selectedProfile.color }}
                >
                  {selectedProfile.handle}
                </p>

                <p className="text-slate-300 leading-relaxed mb-4">
                  {selectedProfile.bio}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProfile.tags.map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="px-3 py-1 text-xs rounded-full bg-slate-800/50 border border-slate-700/30 text-slate-300 hover:bg-slate-700/50 transition-colors"
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => window.open(selectedProfile.profileUrl, '_blank')}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${selectedProfile.color}, ${getPlatformColor()})`
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ExternalLink size={18} />
                      <span>Visit Profile</span>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      isLiked 
                        ? 'bg-red-500 text-white' 
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart size={18} />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Tab Navigation - Fixed below header */}
          <div className="px-6 mb-4 flex-shrink-0">
            <nav className="flex bg-slate-800/30 rounded-xl p-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div 
            className="flex-1 overflow-y-scroll px-6 pb-6"
            style={{ 
              height: '0',
              minHeight: '300px'
            }}
          >
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 pb-4"
                >
                  {/* Joined Info */}
                  <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl">
                    <Calendar className="text-slate-400" size={20} />
                    <div>
                      <div className="text-sm text-slate-400">Member since</div>
                      <div className="text-white font-medium">{selectedProfile.yearJoined}</div>
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Engagement Rate</span>
                      <TrendingUp className="text-green-400" size={16} />
                    </div>
                    <div className="text-2xl font-bold text-green-400">{mockStats.engagement}%</div>
                    <div className="text-xs text-slate-500">Above average</div>
                  </div>

                  {/* Recent Achievement */}
                  <div className="p-4 bg-slate-800/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="text-yellow-400" size={20} />
                      <span className="font-medium text-white">Recent Achievement</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Reached {formatNumber(selectedProfile.followers)} followers milestone!
                    </p>
                  </div>

                  {/* Additional Profile Info */}
                  <div className="p-4 bg-slate-800/30 rounded-xl">
                    <h4 className="text-white font-medium mb-3">Profile Highlights</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Most Popular Content</span>
                        <span className="text-white">{selectedProfile.tags[0]} related posts</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Posting Frequency</span>
                        <span className="text-white">Daily</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Best Performing Day</span>
                        <span className="text-white">Wednesday</span>
                      </div>
                    </div>
                  </div>

                  {/* Collaboration History */}
                  <div className="p-4 bg-slate-800/30 rounded-xl">
                    <h4 className="text-white font-medium mb-3">Recent Collaborations</h4>
                    <div className="space-y-2">
                      <div className="text-slate-300 text-sm">Featured in 3 community projects</div>
                      <div className="text-slate-300 text-sm">Cross-platform content sharing</div>
                      <div className="text-slate-300 text-sm">Guest appearances on 2 podcasts</div>
                    </div>
                  </div>

                  {/* Growth Metrics */}
                  <div className="p-4 bg-slate-800/30 rounded-xl">
                    <h4 className="text-white font-medium mb-3">Growth Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">+15%</div>
                        <div className="text-xs text-slate-400">This Month</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">+8.2K</div>
                        <div className="text-xs text-slate-400">New Followers</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'content' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 pb-4"
                >
                  {mockActivity.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700">
                          <Image
                            src={item.thumbnail || selectedProfile.avatar}
                            alt={item.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{item.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span>{item.timestamp}</span>
                            <span>•</span>
                            <span>{formatNumber(item.engagement)} engagements</span>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-400" size={16} />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 pb-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/30 rounded-xl">
                      <div className="text-2xl font-bold text-white">{formatNumber(mockStats.posts)}</div>
                      <div className="text-sm text-slate-400">Total Posts</div>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-xl">
                      <div className="text-2xl font-bold text-white">{mockStats.engagement}%</div>
                      <div className="text-sm text-slate-400">Engagement</div>
                    </div>
                  </div>
                  
                  {/* Growth Chart Placeholder */}
                  <div className="p-6 bg-slate-800/30 rounded-xl">
                    <h4 className="text-white font-medium mb-4">Growth Trend</h4>
                    <div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-end justify-center">
                      <div className="text-slate-400 text-sm">Chart visualization would go here</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 pb-4"
                >
                  <div className="text-center py-8">
                    <Clock className="mx-auto text-slate-400 mb-4" size={48} />
                    <h3 className="text-white font-medium mb-2">Activity Timeline</h3>
                    <p className="text-slate-400 text-sm">
                      Recent activity and interactions would appear here
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
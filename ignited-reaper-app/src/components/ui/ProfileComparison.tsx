'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, ArrowRight, Users, Calendar, TrendingUp, Star } from 'lucide-react'
import Image from 'next/image'

interface Profile {
  id: string
  platform: string
  handle: string
  displayName: string
  bio: string
  avatar: string
  yearJoined: number
  followers: number
  verified: boolean
  tags: string[]
  color: string
}

interface ProfileComparisonProps {
  profiles: Profile[]
  isVisible: boolean
  onClose: () => void
}

export function ProfileComparison({ profiles, isVisible, onClose }: ProfileComparisonProps) {
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([])

  if (!isVisible) return null

  const formatNumber = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const addProfileToComparison = (profile: Profile) => {
    if (selectedProfiles.length < 3 && !selectedProfiles.find(p => p.id === profile.id)) {
      setSelectedProfiles([...selectedProfiles, profile])
    }
  }

  const removeProfileFromComparison = (profileId: string) => {
    setSelectedProfiles(selectedProfiles.filter(p => p.id !== profileId))
  }

  const getComparisonMetrics = () => {
    if (selectedProfiles.length < 2) return []
    
    return [
      {
        label: 'Followers',
        icon: Users,
        values: selectedProfiles.map(p => ({ value: p.followers, formatted: formatNumber(p.followers) }))
      },
      {
        label: 'Experience',
        icon: Calendar,
        values: selectedProfiles.map(p => ({ 
          value: new Date().getFullYear() - p.yearJoined, 
          formatted: `${new Date().getFullYear() - p.yearJoined} years` 
        }))
      },
      {
        label: 'Verification',
        icon: Star,
        values: selectedProfiles.map(p => ({ 
          value: p.verified ? 1 : 0, 
          formatted: p.verified ? 'Verified' : 'Unverified' 
        }))
      }
    ]
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-6xl h-[80vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Profile Comparison</h2>
                <p className="text-slate-400">Compare up to 3 profiles side by side</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(100%-5rem)]">
            {/* Profile Selection Sidebar */}
            <div className="w-80 border-r border-slate-700/50 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Available Profiles</h3>
              <div className="space-y-2">
                {profiles.slice(0, 12).map((profile) => (
                  <motion.button
                    key={profile.id}
                    onClick={() => addProfileToComparison(profile)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedProfiles.find(p => p.id === profile.id)
                        ? 'bg-blue-500/20 border-blue-400/50'
                        : 'bg-slate-800/30 hover:bg-slate-700/50'
                    } ${selectedProfiles.length >= 3 && !selectedProfiles.find(p => p.id === profile.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={selectedProfiles.length >= 3 && !selectedProfiles.find(p => p.id === profile.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={profile.avatar}
                        alt={profile.displayName}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{profile.displayName}</div>
                        <div className="text-slate-400 text-sm truncate">{profile.handle}</div>
                      </div>
                      {profile.verified && (
                        <Star className="text-blue-400" size={16} />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Comparison View */}
            <div className="flex-1 p-6">
              {selectedProfiles.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Users className="mx-auto text-slate-400 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-white mb-2">Select profiles to compare</h3>
                    <p className="text-slate-400">Choose up to 3 profiles from the sidebar to start comparing</p>
                  </div>
                </div>
              )}

              {selectedProfiles.length === 1 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <ArrowRight className="mx-auto text-slate-400 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-white mb-2">Select one more profile</h3>
                    <p className="text-slate-400">Add at least one more profile to begin comparison</p>
                  </div>
                </div>
              )}

              {selectedProfiles.length >= 2 && (
                <div className="h-full overflow-y-auto">
                  {/* Profile Headers */}
                  <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${selectedProfiles.length}, 1fr)` }}>
                    {selectedProfiles.map((profile, index) => (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800/30 rounded-xl p-4 relative"
                      >
                        <button
                          onClick={() => removeProfileFromComparison(profile.id)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-colors"
                        >
                          <X size={14} />
                        </button>
                        
                        <div className="text-center">
                          <div className="relative inline-block mb-3">
                            <Image
                              src={profile.avatar}
                              alt={profile.displayName}
                              width={64}
                              height={64}
                              className="rounded-xl"
                            />
                            {profile.verified && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <Star size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-white font-semibold">{profile.displayName}</h3>
                          <p className="text-slate-400 text-sm">{profile.handle}</p>
                          <div 
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white mt-2"
                            style={{ backgroundColor: profile.color }}
                          >
                            {profile.platform}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Comparison Metrics */}
                  <div className="space-y-4">
                    {getComparisonMetrics().map((metric, index) => (
                      <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-slate-800/30 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <metric.icon className="text-slate-400" size={18} />
                          <h4 className="text-white font-medium">{metric.label}</h4>
                        </div>
                        
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProfiles.length}, 1fr)` }}>
                          {metric.values.map((value, profileIndex) => {
                            const isHighest = metric.values.every(v => value.value >= v.value)
                            return (
                              <div
                                key={profileIndex}
                                className={`text-center p-3 rounded-lg ${
                                  isHighest && metric.values.length > 1
                                    ? 'bg-green-500/20 border border-green-400/30'
                                    : 'bg-slate-700/30'
                                }`}
                              >
                                <div className="text-lg font-bold text-white">{value.formatted}</div>
                                {isHighest && metric.values.length > 1 && (
                                  <div className="text-xs text-green-400 mt-1">Highest</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    ))}

                    {/* Tags Comparison */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-slate-800/30 rounded-xl p-4"
                    >
                      <h4 className="text-white font-medium mb-3">Tags & Interests</h4>
                      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProfiles.length}, 1fr)` }}>
                        {selectedProfiles.map((profile, index) => (
                          <div key={profile.id} className="space-y-2">
                            {profile.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-block px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-full mr-1 mb-1"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Calendar, Users, CheckCircle } from 'lucide-react'
import { useCemeteryStore } from '@/store/cemetery'
import { SocialProfile } from '@/lib/types'
import Image from 'next/image'

interface ProfileCardProps {
  profile: SocialProfile
  index: number
}

function ProfileCard({ profile, index }: ProfileCardProps) {
  const { setSelectedProfile } = useCemeteryStore()

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <div className="bg-cemetery-900/80 backdrop-blur-lg border border-cemetery-700/50 rounded-xl overflow-hidden hover:border-cemetery-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-cemetery-700/20 hover:transform hover:scale-[1.02]">
        {/* Header with platform color */}
        <div 
          className="h-24 bg-gradient-to-br from-cemetery-800 to-cemetery-900 relative"
          style={{
            background: `linear-gradient(135deg, ${profile.color}20, ${profile.color}10)`
          }}
        >
          <div 
            className="absolute top-0 left-0 w-full h-1"
            style={{ backgroundColor: profile.color }}
          />
          
          {/* Avatar */}
          <div className="absolute -bottom-6 left-4">
            <div className="relative">
              <Image
                src={profile.avatar}
                alt={profile.displayName}
                width={60}
                height={60}
                className="rounded-full border-3 border-cemetery-900 shadow-lg"
              />
              {profile.verified && (
                <CheckCircle 
                  className="absolute -bottom-1 -right-1 text-blue-500 bg-cemetery-900 rounded-full"
                  size={16}
                />
              )}
            </div>
          </div>

          {/* Platform indicator */}
          <div className="absolute top-3 right-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: profile.color }}
            >
              {profile.platform.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-8">
          {/* Name and handle */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
              {profile.displayName}
            </h3>
            <p 
              className="text-sm font-medium line-clamp-1"
              style={{ color: profile.color }}
            >
              {profile.handle}
            </p>
          </div>

          {/* Bio */}
          <p className="text-cemetery-400 text-sm mb-4 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>

          {/* Stats */}
          <div className="flex justify-between items-center mb-4 text-cemetery-500">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span className="text-xs">
                {formatFollowers(profile.followers)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span className="text-xs">
                {profile.yearJoined}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {profile.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-cemetery-800/50 border border-cemetery-700/30 rounded text-cemetery-400"
                >
                  #{tag}
                </span>
              ))}
              {profile.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-cemetery-500">
                  +{profile.tags.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedProfile(profile)}
              className="flex-1 py-2 px-3 bg-cemetery-800/60 hover:bg-cemetery-700/60 border border-cemetery-700/30 rounded-lg text-cemetery-300 hover:text-white text-sm font-medium transition-all"
            >
              View Details
            </button>
            <button
              onClick={() => window.open(profile.profileUrl, '_blank')}
              className="p-2 bg-ember-600/20 hover:bg-ember-600/30 border border-ember-600/30 rounded-lg text-ember-400 hover:text-ember-300 transition-all"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* Hover glow effect */}
        <div 
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${profile.color}40, transparent 70%)`
          }}
        />
      </div>
    </motion.div>
  )
}

export function MobileGrid() {
  const { filteredProfiles, isDayMode } = useCemeteryStore()
  const profiles = filteredProfiles()

  return (
    <div className={`w-full h-full overflow-auto ${isDayMode ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gradient-to-br from-cemetery-950 to-cemetery-900'}`}>
      <div className="p-6 pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Results count */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <p className={`text-sm ${isDayMode ? 'text-slate-600' : 'text-cemetery-400'}`}>
              Found {profiles.length} spirit{profiles.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          {/* Grid */}
          {profiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile, index) => (
                <ProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  index={index} 
                />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">👻</div>
              <h3 className={`text-xl font-bold mb-2 ${isDayMode ? 'text-slate-700' : 'text-white'}`}>
                No spirits found
              </h3>
              <p className={`${isDayMode ? 'text-slate-500' : 'text-cemetery-400'}`}>
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Calendar, Users, CheckCircle, Star } from 'lucide-react'
import { useCemeteryStore } from '@/store/cemetery'
import { SocialProfile } from '@/lib/types'
import Image from 'next/image'

interface EnhancedProfileCardProps {
  profile: SocialProfile
  index: number
}

function EnhancedProfileCard({ profile, index }: EnhancedProfileCardProps) {
  const { setSelectedProfile, isDayMode } = useCemeteryStore()

  const formatFollowers = (count: number) => {
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
    return icons[profile.platform] || '🌐'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      {/* Enhanced glassy card */}
      <div
        className="relative overflow-hidden rounded-2xl backdrop-blur-xl border transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl"
        style={{
          background: isDayMode
            ? 'linear-gradient(135deg, rgba(68, 87, 160, 0.28), rgba(32, 43, 84, 0.78))'
            : 'linear-gradient(135deg, rgba(18, 26, 42, 0.9), rgba(12, 18, 32, 0.94))',
          borderColor: isDayMode ? 'rgba(210, 220, 248, 0.28)' : 'rgba(128, 138, 182, 0.24)',
          boxShadow: `0 8px 32px ${profile.color}15`
        }}
      >
        {/* Platform color accent line */}
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{ backgroundColor: profile.color }}
        />
        
        {/* Hover glow effect */}
        <motion.div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${profile.color}10, transparent 60%)`
          }}
        />

        {/* Header section */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Enhanced avatar */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className="w-14 h-14 rounded-full p-0.5"
                  style={{ background: `linear-gradient(135deg, ${profile.color}, ${profile.color}80)` }}
                >
                  <Image
                    src={profile.avatar}
                    alt={profile.displayName}
                    width={56}
                    height={56}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                
                {profile.verified && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                  >
                    <CheckCircle size={12} className="text-white" />
                  </motion.div>
                )}
              </motion.div>

              <div className="flex-1">
                <h3 className="font-bold mb-1 line-clamp-1 text-primary">
                  {profile.displayName}
                </h3>
                <p 
                  className="text-sm font-medium line-clamp-1"
                  style={{ color: profile.color }}
                >
                  {profile.handle}
                </p>
              </div>
            </div>

            {/* Platform indicator */}
            <motion.div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg"
              style={{ 
                backgroundColor: profile.color,
                boxShadow: `0 4px 12px ${profile.color}30`
              }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {getPlatformIcon()}
            </motion.div>
          </div>

          {/* Bio */}
          <p className="text-sm mb-4 line-clamp-2 leading-relaxed text-secondary">
            {profile.bio}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <motion.div 
              className="rounded-lg p-3 bg-[var(--surface-translucent)] border border-[var(--surface-border)] backdrop-blur-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-1 text-secondary">
                <Users size={12} />
                <span className="text-xs">Followers</span>
              </div>
              <div className="text-lg font-bold text-primary">
                {formatFollowers(profile.followers)}
              </div>
            </motion.div>
            
            <motion.div 
              className="rounded-lg p-3 bg-[var(--surface-translucent)] border border-[var(--surface-border)] backdrop-blur-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-1 text-secondary">
                <Calendar size={12} />
                <span className="text-xs">Joined</span>
              </div>
              <div className="text-lg font-bold text-primary">
                {profile.yearJoined}
              </div>
            </motion.div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {profile.tags.slice(0, 3).map((tag, tagIndex) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + tagIndex * 0.05 }}
                  className="px-3 py-1 text-xs rounded-full border bg-[var(--surface-translucent)] border-[var(--surface-border)] text-secondary"
                >
                  #{tag}
                </motion.span>
              ))}
              {profile.tags.length > 3 && (
                <span className="px-3 py-1 text-xs text-muted">
                  +{profile.tags.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={() => setSelectedProfile(profile)}
              className="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 border border-[var(--surface-border)] bg-[var(--surface-translucent)] text-secondary hover:text-primary hover:border-ember-400/40 hover:bg-[rgba(34,45,78,0.85)] spectral-ring focus-visible:outline-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Star size={16} />
                <span>View Spirit</span>
              </div>
            </motion.button>
            
            <motion.button
              onClick={() => window.open(profile.profileUrl, '_blank')}
              className="p-3 rounded-xl font-medium text-abyss-950 transition-all duration-300 spectral-ring focus-visible:outline-none"
              style={{
                background: `linear-gradient(135deg, ${profile.color}, ${profile.color}cc)`,
                boxShadow: `0 4px 12px ${profile.color}30`
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Open ${profile.displayName} profile in a new tab`}
            >
              <ExternalLink size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Floating particles for non-day mode */}
      {!isDayMode && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-ember-400 opacity-40"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export function EnhancedMobileGrid() {
  const { filteredProfiles, isDayMode } = useCemeteryStore()
  const profiles = filteredProfiles()

  return (
    <div className={`w-full h-full overflow-auto relative ${
      isDayMode 
        ? 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100' 
        : 'bg-gradient-to-br from-[#030712] via-[#0b1026] to-[#1e1b4b]'
    }`}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating embers for night mode */}
        {!isDayMode && Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`ember-${i}`}
            className="absolute w-2 h-2 rounded-full bg-ember-400 opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [-20, -40, -20],
              x: [0, 10, 0],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
        
        {/* Fireflies for night mode */}
        {!isDayMode && Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`firefly-${i}`}
            className="absolute w-1 h-1 rounded-full bg-yellow-300 opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      <div className="relative p-6 pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Results count */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <p className={`text-sm ${isDayMode ? 'text-slate-600' : 'text-secondary'}`}>
              Found {profiles.length} spirit{profiles.length !== 1 ? 's' : ''} in the digital realm
            </p>
          </motion.div>

          {/* Enhanced Grid */}
          {profiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile, index) => (
                <EnhancedProfileCard 
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
              <motion.div 
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                👻
              </motion.div>
              <h3 className={`text-xl font-bold mb-2 ${isDayMode ? 'text-slate-700' : 'text-white'}`}>
                No spirits found
              </h3>
              <p className={`${isDayMode ? 'text-slate-500' : 'text-secondary'}`}>
                Try adjusting your search or summoning different spirits
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

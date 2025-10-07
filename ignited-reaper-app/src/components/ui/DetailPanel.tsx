'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { X, ExternalLink, Calendar, Users, CheckCircle, Star, MessageCircle, Sparkles, Zap } from 'lucide-react'
import { useCemeteryStore } from '@/store/cemetery'
import Image from 'next/image'
import { ProfileNavigation } from './ProfileNavigation'

export function DetailPanel() {
  const { selectedProfile, setSelectedProfile } = useCemeteryStore()
  const panelRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const controls = useAnimation()

  // Focus management
  useEffect(() => {
    if (selectedProfile && panelRef.current) {
      const focusable = panelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusable?.focus()
    }
  }, [selectedProfile])

  // Enhanced entrance animation
  useEffect(() => {
    if (selectedProfile) {
      setIsVisible(true)
      controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: "easeOut" }
      })
    } else {
      setIsVisible(false)
    }
  }, [selectedProfile, controls])

  if (!selectedProfile) return null

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
    return icons[selectedProfile.platform] || '🌐'
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex justify-end"
        onClick={() => setSelectedProfile(null)}
      >
        {/* Enhanced Backdrop */}
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/50"
        />

        {/* Detail Panel with Enhanced Animations */}
        <motion.div
          ref={panelRef}
          initial={{ 
            x: 500, 
            opacity: 0, 
            scale: 0.95,
            rotateY: 15
          }}
          animate={{ 
            x: 0, 
            opacity: 1, 
            scale: 1,
            rotateY: 0
          }}
          exit={{ 
            x: 500, 
            opacity: 0, 
            scale: 0.95,
            rotateY: -15
          }}
          transition={{ 
            type: "spring", 
            damping: 30, 
            stiffness: 300,
            duration: 0.4
          }}
          className="relative w-full max-w-md h-full overflow-hidden panel-surface border-l border-[var(--surface-border)]"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProfile.displayName} profile details`}
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(127,180,255,0.12),transparent_70%)]" />
          <div className="absolute -left-24 top-1/2 h-56 w-56 rounded-full bg-ember-500/15 blur-3xl" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(232, 238, 251, 0.08), transparent 55%)' }} />
          
          {/* Platform color accent */}
          <div 
            className="absolute top-0 left-0 w-full h-1"
            style={{ 
              background: `linear-gradient(90deg, ${selectedProfile.color}, ${selectedProfile.color}80)` 
            }}
          />
          
          {/* Glow effect */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${selectedProfile.color}40, transparent 60%)`
            }}
          />

          <div className="relative h-full flex flex-col">
            {/* Enhanced Header */}
            <motion.div 
              className="p-6 border-b border-[var(--surface-border)]/70"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <motion.div 
                className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.3em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.span 
                  className="text-secondary"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Detail Stub
                </motion.span>
                <motion.span 
                  className="text-secondary/70"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  Preview
                </motion.span>
              </motion.div>
              
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="text-2xl relative"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {getPlatformIcon()}
                    {/* Floating sparkles */}
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ 
                        rotate: 360,
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles size={12} className="text-yellow-400" />
                    </motion.div>
                  </motion.div>
                  <div>
                    <motion.h2 
                      className="text-xl font-bold text-primary"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Spirit Details
                    </motion.h2>
                    <motion.p 
                      className="text-secondary text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      From the digital realm
                    </motion.p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <ProfileNavigation />
                  <motion.button
                    onClick={() => setSelectedProfile(null)}
                    className="p-2 rounded-full bg-[var(--surface-translucent)] hover:bg-[rgba(36,46,78,0.85)] text-secondary hover:text-primary transition-all duration-200 spectral-ring focus-visible:outline-none relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -5, 5, 0]
                    }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close profile panel"
                  >
                    {/* Ripple effect */}
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <X size={20} className="relative z-10" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Enhanced Profile Header */}
              <motion.div 
                className="flex items-center gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 rounded-full overflow-hidden border-2 relative"
                    style={{ borderColor: selectedProfile.color }}
                    whileHover={{ 
                      scale: 1.05,
                      rotate: [0, 2, -2, 0]
                    }}
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  >
                    <Image
                      src={selectedProfile.avatar}
                      alt={selectedProfile.displayName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                    {/* Animated border glow */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ 
                        background: `radial-gradient(circle, ${selectedProfile.color}20, transparent 70%)`
                      }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  {selectedProfile.verified && (
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.2, rotate: 360 }}
                    >
                      <CheckCircle size={14} className="text-white" />
                    </motion.div>
                  )}
                  
                  {/* Floating particles around avatar */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                      style={{
                        left: `${20 + i * 15}px`,
                        top: `${10 + i * 8}px`,
                      }}
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.3, 1, 0.3],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    />
                  ))}
                </div>

                <motion.div 
                  className="flex-1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.h3 
                    className="text-lg font-bold text-primary mb-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    {selectedProfile.displayName}
                  </motion.h3>
                  <motion.p 
                    className="text-sm font-medium mb-2 text-secondary"
                    style={{ color: selectedProfile.color }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      textShadow: [
                        `0 0 0px ${selectedProfile.color}`,
                        `0 0 8px ${selectedProfile.color}40`,
                        `0 0 0px ${selectedProfile.color}`
                      ]
                    }}
                    transition={{ delay: 1.0, duration: 3, repeat: Infinity }}
                  >
                    {selectedProfile.handle}
                  </motion.p>
                  <motion.div 
                    className="flex items-center gap-2 text-xs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    <motion.span 
                      className="px-2 py-1 rounded-full text-abyss-950 font-semibold relative overflow-hidden"
                      style={{ 
                        backgroundColor: selectedProfile.color, 
                        boxShadow: `0 6px 16px ${selectedProfile.color}40` 
                      }}
                      whileHover={{ scale: 1.05 }}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      />
                      <span className="relative z-10">{selectedProfile.platform}</span>
                    </motion.span>
                    <motion.span 
                      className="text-secondary"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      Active Spirit
                    </motion.span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced Content */}
            <motion.div 
              className="flex-1 overflow-y-auto p-6 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              {/* Enhanced Bio */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <motion.h4 
                  className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MessageCircle size={14} />
                  </motion.div>
                  Spirit Message
                </motion.h4>
                <motion.p 
                  className="text-secondary leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                >
                  {selectedProfile.bio}
                </motion.p>
              </motion.div>

              {/* Enhanced Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.7 }}
              >
                <motion.h4 
                  className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star size={14} />
                  </motion.div>
                  Ethereal Statistics
                </motion.h4>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="rounded-lg p-3 bg-[var(--surface-translucent)] border border-[var(--surface-border)] backdrop-blur-lg relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.02,
                      y: -2
                    }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.9 }}
                  >
                    {/* Animated background gradient */}
                    <motion.div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(45deg, ${selectedProfile.color}20, transparent)`
                      }}
                      animate={{ 
                        opacity: [0.1, 0.3, 0.1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="flex items-center gap-2 text-secondary mb-1 relative z-10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Users size={14} />
                      </motion.div>
                      <span className="text-xs uppercase tracking-wide">Followers</span>
                    </div>
                    <motion.div 
                      className="text-xl font-bold text-primary relative z-10"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2.0, type: "spring" }}
                    >
                      {formatFollowers(selectedProfile.followers)}
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    className="rounded-lg p-3 bg-[var(--surface-translucent)] border border-[var(--surface-border)] backdrop-blur-lg relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.02,
                      y: -2
                    }}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2.0 }}
                  >
                    {/* Animated background gradient */}
                    <motion.div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(45deg, ${selectedProfile.color}20, transparent)`
                      }}
                      animate={{ 
                        opacity: [0.1, 0.3, 0.1]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    />
                    <div className="flex items-center gap-2 text-secondary mb-1 relative z-10">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Calendar size={14} />
                      </motion.div>
                      <span className="text-xs uppercase tracking-wide">Summoned</span>
                    </div>
                    <motion.div 
                      className="text-xl font-bold text-primary relative z-10"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2.1, type: "spring" }}
                    >
                      {selectedProfile.yearJoined}
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Enhanced Tags */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.2 }}
              >
                <motion.h4 
                  className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.3 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap size={14} />
                  </motion.div>
                  Spirit Essence
                </motion.h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.tags.map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        delay: 2.4 + index * 0.1,
                        type: "spring",
                        stiffness: 200
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -2,
                        boxShadow: `0 4px 12px ${selectedProfile.color}30`
                      }}
                      className="px-3 py-1 text-xs rounded-full bg-[var(--surface-translucent)] border border-[var(--surface-border)] text-secondary hover:text-primary hover:border-ember-400/40 transition-all duration-200 relative overflow-hidden"
                    >
                      {/* Tag shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          repeatDelay: 4,
                          delay: index * 0.5
                        }}
                      />
                      <span className="relative z-10">#{tag}</span>
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Screenshot placeholder */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                <motion.h4 
                  className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.6 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles size={14} />
                  </motion.div>
                  Recent Manifestations
                </motion.h4>
                <motion.div 
                  className="relative overflow-hidden bg-[var(--surface-translucent)] border border-[var(--surface-border)] rounded-lg p-8 text-center backdrop-blur-lg"
                  whileHover={{ 
                    scale: 1.02,
                    y: -2
                  }}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2.7, type: "spring" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[rgba(232,238,251,0.08)] via-transparent to-ember-500/12" />
                  
                  {/* Animated background particles */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + i * 10}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.4
                      }}
                    />
                  ))}
                  
                  <motion.div 
                    className="text-3xl mb-2 relative z-10"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    👻
                  </motion.div>
                  <motion.p 
                    className="text-secondary text-sm relative z-10"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Spirit echoes loading...
                  </motion.p>
                  <motion.p 
                    className="mt-2 text-xs text-secondary/70 uppercase tracking-[0.3em] relative z-10"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    Full panel arriving soon
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced Footer Action */}
            <motion.div 
              className="p-6 border-t border-[var(--surface-border)]/70"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.8 }}
            >
              <motion.button
                onClick={() => window.open(selectedProfile.profileUrl, '_blank')}
                className="w-full relative overflow-hidden rounded-lg py-4 font-semibold text-abyss-950 transition-all duration-300 group spectral-ring focus-visible:outline-none"
                style={{
                  background: `linear-gradient(135deg, ${selectedProfile.color}, ${selectedProfile.color}cc)`
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -2,
                  boxShadow: `0 10px 30px ${selectedProfile.color}50`
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2.9, type: "spring" }}
                aria-label={`Open ${selectedProfile.displayName}'s profile in a new tab`}
              >
                {/* Enhanced glow effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle, ${selectedProfile.color}40 0%, transparent 70%)`
                  }}
                  animate={{ 
                    opacity: [0, 0.3, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Animated background particles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/30 rounded-full"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: '50%',
                    }}
                    animate={{
                      y: ['-10px', '10px', '-10px'],
                      opacity: [0.3, 1, 0.3],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
                
                <motion.div 
                  className="relative flex items-center justify-center gap-3 z-10"
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 3.0 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ExternalLink size={18} />
                  </motion.div>
                  <motion.span
                    animate={{ opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Visit Spirit Realm
                  </motion.span>
                </motion.div>
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 3 
                  }}
                />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

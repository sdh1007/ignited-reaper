'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronUp, Sun, Moon } from 'lucide-react'
import Image from 'next/image'
import { useCemeteryStore } from '@/store/cemetery'
import type { Platform } from '@/lib/types'
import { SearchAutocomplete } from './SearchAutocomplete'

const platformOptions: { value: Platform; label: string; color: string; tooltip: string }[] = [
  { value: 'twitter', label: 'Twitter', color: '#1DA1F2', tooltip: 'Micro-blogging and real-time updates' },
  { value: 'instagram', label: 'Instagram', color: '#E4405F', tooltip: 'Visual storytelling and photo sharing' },
  { value: 'tiktok', label: 'TikTok', color: '#FF0050', tooltip: 'Short-form video content and trends' },
  { value: 'youtube', label: 'YouTube', color: '#FF0000', tooltip: 'Long-form video content and tutorials' },
  { value: 'twitch', label: 'Twitch', color: '#9146FF', tooltip: 'Live streaming and gaming content' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0077B5', tooltip: 'Professional networking and career content' },
  { value: 'github', label: 'GitHub', color: '#171515', tooltip: 'Code repositories and development projects' },
  { value: 'discord', label: 'Discord', color: '#5865F2', tooltip: 'Community chat and voice channels' },
]

export function EnhancedHeader() {
  const {
    isDayMode,
    toggleDayMode,
    searchQuery,
    setSearchQuery,
    selectedPlatforms,
    setSelectedPlatforms,
    setSelectedProfile,
    profiles,
  } = useCemeteryStore()
  
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform))
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform])
    }
  }

  const clearFilters = () => {
    setSelectedPlatforms([])
    setSearchQuery('')
  }

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-40"
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isCollapsed ? -250 : 0,
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 32,
          opacity: { duration: 0.3 }
        }}
      >
        {/* Logo Section - Top Left */}
        <motion.div
          className="absolute top-[20px] left-[50px] pointer-events-auto z-50"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-5">
            {/* Custom Reaper Logo */}
            <motion.div 
              className="w-[60px] h-[60px] flex items-center justify-center rounded-xl overflow-hidden"
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(238, 90, 111, 0.4))',
              }}
              animate={{
                transform: ['translateY(0px) rotate(0deg)', 'translateY(-3px) rotate(1deg)', 'translateY(-1px) rotate(-0.5deg)', 'translateY(0px) rotate(0deg)']
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.1, rotate: 2 }}
            >
              <Image 
                src="/reaper-logo.svg" 
                alt="IgNited Reaper Logo" 
                width={48}
                height={48}
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(238, 90, 111, 0.3))',
                }}
              />
            </motion.div>

            {/* Title Group */}
            <div className="flex flex-col">
              <h1 
                className="text-[2.5rem] font-bold leading-none mb-1"
                style={{
                  background: 'linear-gradient(135deg, #ee5a6f, #c93a52)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 4px 20px rgba(238, 90, 111, 0.3)',
                }}
              >
                IgNited Reaper
              </h1>
              <p 
                className="text-[0.9rem] font-light tracking-[2px]"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Digital Necromancy
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Section - Top Right (same level) */}
        <motion.nav
          className="absolute top-[30px] right-[50px] flex items-center gap-[10px] pointer-events-auto flex-wrap justify-end max-w-[800px]"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        >
          {/* Platform Filter Pills */}
          {platformOptions.map((option) => {
            const isSelected = selectedPlatforms.includes(option.value)
            return (
              <motion.button
                key={option.value}
                onClick={() => togglePlatform(option.value)}
                className="px-6 py-3 rounded-full font-medium text-sm transition-all"
                style={{
                  background: isSelected ? option.color : (isDayMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)'),
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: isSelected ? option.color : (isDayMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)'),
                  boxShadow: isSelected ? `0 10px 30px ${option.color}50` : 'none',
                  color: isSelected ? '#ffffff' : (isDayMode ? '#1a1a1a' : '#ffffff'),
                }}
                whileHover={{
                  background: isSelected ? option.color : 'rgba(238, 90, 111, 0.8)',
                  borderColor: isSelected ? option.color : '#ee5a6f',
                  color: '#ffffff',
                  y: -2,
                  boxShadow: isSelected 
                    ? `0 10px 30px ${option.color}60` 
                    : '0 10px 30px rgba(238, 90, 111, 0.3)',
                }}
                whileTap={{ scale: 0.96 }}
                aria-pressed={isSelected}
              >
                {option.label}
              </motion.button>
            )
          })}

          {/* Search Button */}
          <motion.button
            className="px-6 py-3 rounded-full font-medium text-sm transition-all flex items-center gap-2"
            style={{
              background: isDayMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: isDayMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
              color: isDayMode ? '#1a1a1a' : '#ffffff',
            }}
            whileHover={{
              background: 'rgba(238, 90, 111, 0.8)',
              borderColor: '#ee5a6f',
              color: '#ffffff',
              y: -2,
              boxShadow: '0 10px 30px rgba(238, 90, 111, 0.3)',
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              const input = document.querySelector('input[type="text"]') as HTMLInputElement
              input?.focus()
            }}
          >
            <Search size={16} />
            <span>Search</span>
          </motion.button>

          {/* Day/Night Toggle */}
          <motion.button
            onClick={toggleDayMode}
            className="px-6 py-3 rounded-full font-medium text-sm transition-all"
            style={{
              background: isDayMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: isDayMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
              color: isDayMode ? '#1a1a1a' : '#ffffff',
            }}
            whileHover={{
              background: 'rgba(238, 90, 111, 0.8)',
              borderColor: '#ee5a6f',
              color: '#ffffff',
              y: -2,
              boxShadow: '0 10px 30px rgba(238, 90, 111, 0.3)',
            }}
            whileTap={{ scale: 0.96 }}
            aria-label={isDayMode ? 'Switch to night mode' : 'Switch to day mode'}
          >
            {isDayMode ? '☀️ Day' : '🌙 Night'}
          </motion.button>

          {/* Collapse Button */}
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-4 py-3 rounded-full font-medium text-sm transition-all"
            style={{
              background: isDayMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: isDayMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
              color: isDayMode ? '#1a1a1a' : '#ffffff',
            }}
            whileHover={{
              background: 'rgba(238, 90, 111, 0.8)',
              borderColor: '#ee5a6f',
              color: '#ffffff',
              y: -2,
              boxShadow: '0 10px 30px rgba(238, 90, 111, 0.3)',
            }}
            whileTap={{ scale: 0.96 }}
            aria-label="Toggle navbar"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ↑
            </motion.div>
          </motion.button>
        </motion.nav>

        {/* Search Bar - Bottom Left (positioned lower to not overlap) */}
        <motion.div
          className="absolute bottom-[50px] left-[50px] w-[400px] max-h-[40vh] overflow-y-auto pointer-events-auto"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
        >
          <div 
            className="rounded-[20px] p-[30px]"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{
                color: '#ee5a6f',
              }}
            >
              Search Spirits
            </h2>
            <div className="relative">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" 
                size={18}
              />
              <input
                type="text"
                placeholder="Search spirits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                className="w-full bg-transparent border border-white/20 rounded-lg py-3 pl-12 pr-4 text-white/90 placeholder:text-white/50 focus:outline-none focus:border-[#ee5a6f] transition-colors"
                aria-label="Search spirits"
                aria-autocomplete="list"
                aria-controls="search-autocomplete"
              />
              
              {/* Autocomplete dropdown */}
              {showAutocomplete && searchQuery.length >= 2 && (
                <SearchAutocomplete
                  query={searchQuery}
                  onSelect={(profileId) => {
                    const profile = profiles.find(p => p.id === profileId)
                    if (profile) {
                      setSelectedProfile(profile)
                      setShowAutocomplete(false)
                    }
                  }}
                  onClose={() => setShowAutocomplete(false)}
                />
              )}
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Minimalist peek indicator when collapsed - FIXED POSITION */}
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
        >
          <motion.button
            onClick={() => setIsCollapsed(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full shadow-lg"
            style={{
              background: isDayMode 
                ? 'rgba(255, 255, 255, 0.95)' 
                : 'rgba(10, 15, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '2px solid',
              borderColor: isDayMode 
                ? 'rgba(0, 0, 0, 0.12)' 
                : 'rgba(255, 255, 255, 0.15)',
              boxShadow: isDayMode
                ? '0 4px 20px rgba(0, 0, 0, 0.12)'
                : '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
            whileHover={{ 
              scale: 1.15,
              boxShadow: isDayMode
                ? '0 8px 32px rgba(0, 0, 0, 0.18)'
                : '0 8px 32px rgba(0, 0, 0, 0.7)',
            }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              y: [0, -4, 0],
            }}
            transition={{
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            aria-label="Show navbar"
          >
            <motion.div
              initial={{ rotate: 180 }}
              style={{
                color: isDayMode ? '#1a1a1a' : '#ffffff',
              }}
            >
              <ChevronUp size={20} strokeWidth={2.5} />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </>
  )
}

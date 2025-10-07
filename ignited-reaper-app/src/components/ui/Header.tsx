'use client'

import { motion } from 'framer-motion'
import { Sun, Moon, Search, Filter } from 'lucide-react'
import { useCemeteryStore } from '@/store/cemetery'
import { Platform } from '@/lib/types'

const platformOptions: { value: Platform; label: string; color: string }[] = [
  { value: 'twitter', label: 'Twitter', color: '#1DA1F2' },
  { value: 'instagram', label: 'Instagram', color: '#E4405F' },
  { value: 'tiktok', label: 'TikTok', color: '#FF0050' },
  { value: 'youtube', label: 'YouTube', color: '#FF0000' },
  { value: 'twitch', label: 'Twitch', color: '#9146FF' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0077B5' },
  { value: 'github', label: 'GitHub', color: '#171515' },
  { value: 'discord', label: 'Discord', color: '#5865F2' },
]

export function Header() {
  const { 
    isDayMode, 
    toggleDayMode, 
    searchQuery, 
    setSearchQuery, 
    selectedPlatforms, 
    setSelectedPlatforms 
  } = useCemeteryStore()

  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform))
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform])
    }
  }

  const clearFilters = () => {
    setSelectedPlatforms([])
    setSearchQuery('')
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-40 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main header */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-ember-600 to-ember-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">☠</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-gothic">
                IgNited Reaper
              </h1>
              <p className="text-cemetery-400 text-sm">
                Digital Necromancy
              </p>
            </div>
          </motion.div>

          {/* Day/Night toggle */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={toggleDayMode}
            className="flex items-center gap-2 px-4 py-2 bg-cemetery-800/80 backdrop-blur-sm border border-cemetery-700/50 rounded-lg hover:bg-cemetery-700/80 transition-all text-cemetery-300 hover:text-white"
          >
            {isDayMode ? (
              <>
                <Moon size={18} />
                <span className="hidden sm:inline">Night Mode</span>
              </>
            ) : (
              <>
                <Sun size={18} />
                <span className="hidden sm:inline">Day Mode</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Search and filters */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cemetery-400" size={18} />
            <input
              type="text"
              placeholder="Search spirits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-cemetery-900/80 backdrop-blur-sm border border-cemetery-700/50 rounded-lg text-white placeholder-cemetery-400 focus:outline-none focus:border-ember-500/50 focus:ring-2 focus:ring-ember-500/20 transition-all"
            />
          </div>

          {/* Filter button for mobile */}
          <button className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 bg-cemetery-800/80 backdrop-blur-sm border border-cemetery-700/50 rounded-lg text-cemetery-300">
            <Filter size={18} />
            Filters
          </button>
        </motion.div>

        {/* Platform filters */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden sm:flex flex-wrap gap-2 mt-4"
        >
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-xs bg-cemetery-800/60 backdrop-blur-sm border border-cemetery-700/30 rounded-full text-cemetery-300 hover:text-white hover:bg-cemetery-700/60 transition-all"
          >
            All Platforms
          </button>
          
          {platformOptions.map((platform) => (
            <button
              key={platform.value}
              onClick={() => togglePlatform(platform.value)}
              className={`px-3 py-2 text-xs rounded-full border transition-all ${
                selectedPlatforms.includes(platform.value)
                  ? 'border-transparent text-white shadow-lg'
                  : 'border-cemetery-700/30 text-cemetery-300 hover:text-white bg-cemetery-800/60 backdrop-blur-sm hover:bg-cemetery-700/60'
              }`}
              style={{
                backgroundColor: selectedPlatforms.includes(platform.value) 
                  ? platform.color 
                  : undefined
              }}
            >
              {platform.label}
            </button>
          ))}
        </motion.div>
      </div>
    </header>
  )
}
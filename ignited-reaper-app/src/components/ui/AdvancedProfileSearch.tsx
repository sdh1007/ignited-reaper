'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Users, 
  Calendar,
  Star,
  TrendingUp,
  Tag,
  MapPin,
  Clock
} from 'lucide-react'
import { useCemeteryStore } from '@/store/cemetery'
import Image from 'next/image'

interface SearchFilters {
  platform: string[]
  yearRange: [number, number]
  followerRange: [number, number]
  verified: 'all' | 'verified' | 'unverified'
  tags: string[]
  sortBy: 'followers' | 'name' | 'joined' | 'relevance'
  sortOrder: 'asc' | 'desc'
}

interface AdvancedProfileSearchProps {
  isVisible: boolean
  onClose: () => void
}

export function AdvancedProfileSearch({ isVisible, onClose }: AdvancedProfileSearchProps) {
  const { profiles, searchQuery, setSearchQuery } = useCemeteryStore()
  const [filters, setFilters] = useState<SearchFilters>({
    platform: [],
    yearRange: [2015, new Date().getFullYear()],
    followerRange: [0, 1000000],
    verified: 'all',
    tags: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(searchQuery)

  // Get unique platforms and tags from profiles
  const availablePlatforms = useMemo(() => {
    return Array.from(new Set(profiles.map(p => p.platform)))
  }, [profiles])

  const availableTags = useMemo(() => {
    return Array.from(new Set(profiles.flatMap(p => p.tags))).sort()
  }, [profiles])

  // Apply filters and search
  const filteredProfiles = useMemo(() => {
    let filtered = profiles.filter(profile => {
      // Text search
      if (searchInput) {
        const searchLower = searchInput.toLowerCase()
        if (!profile.displayName.toLowerCase().includes(searchLower) &&
            !profile.handle.toLowerCase().includes(searchLower) &&
            !profile.bio.toLowerCase().includes(searchLower) &&
            !profile.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
          return false
        }
      }

      // Platform filter
      if (filters.platform.length > 0 && !filters.platform.includes(profile.platform)) {
        return false
      }

      // Year range filter
      if (profile.yearJoined < filters.yearRange[0] || profile.yearJoined > filters.yearRange[1]) {
        return false
      }

      // Follower range filter
      if (profile.followers < filters.followerRange[0] || profile.followers > filters.followerRange[1]) {
        return false
      }

      // Verified filter
      if (filters.verified === 'verified' && !profile.verified) return false
      if (filters.verified === 'unverified' && profile.verified) return false

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => profile.tags.includes(tag))) {
        return false
      }

      return true
    })

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'followers':
          comparison = a.followers - b.followers
          break
        case 'name':
          comparison = a.displayName.localeCompare(b.displayName)
          break
        case 'joined':
          comparison = a.yearJoined - b.yearJoined
          break
        case 'relevance':
        default:
          // Simple relevance based on follower count and verification
          const aScore = a.followers + (a.verified ? 10000 : 0)
          const bScore = b.followers + (b.verified ? 10000 : 0)
          comparison = aScore - bScore
          break
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [profiles, searchInput, filters])

  const handlePlatformToggle = (platform: string) => {
    setFilters(prev => ({
      ...prev,
      platform: prev.platform.includes(platform)
        ? prev.platform.filter(p => p !== platform)
        : [...prev.platform, platform]
    }))
  }

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const clearFilters = () => {
    setFilters({
      platform: [],
      yearRange: [2015, new Date().getFullYear()],
      followerRange: [0, 1000000],
      verified: 'all',
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'desc'
    })
    setSearchInput('')
    setSearchQuery('')
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  useEffect(() => {
    setSearchQuery(searchInput)
  }, [searchInput, setSearchQuery])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className="relative w-full max-w-4xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Advanced Search</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search profiles, handles, bios, or tags..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <Filter size={16} />
                <span>Filters</span>
                <ChevronDown 
                  className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} 
                  size={16} 
                />
              </button>

              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{filteredProfiles.length} results</span>
                <button
                  onClick={clearFilters}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-slate-700/50 overflow-hidden"
              >
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Platform Filter */}
                    <div>
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <MapPin size={16} />
                        Platform
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {availablePlatforms.map(platform => (
                          <button
                            key={platform}
                            onClick={() => handlePlatformToggle(platform)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              filters.platform.includes(platform)
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                            }`}
                          >
                            {platform}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Verification Filter */}
                    <div>
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Star size={16} />
                        Verification
                      </h3>
                      <select
                        value={filters.verified}
                        onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value as any }))}
                        className="w-full p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white"
                      >
                        <option value="all">All</option>
                        <option value="verified">Verified only</option>
                        <option value="unverified">Unverified only</option>
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Sort by
                      </h3>
                      <div className="space-y-2">
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                          className="w-full p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white"
                        >
                          <option value="relevance">Relevance</option>
                          <option value="followers">Followers</option>
                          <option value="name">Name</option>
                          <option value="joined">Joined date</option>
                        </select>
                        <select
                          value={filters.sortOrder}
                          onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                          className="w-full p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white"
                        >
                          <option value="desc">Descending</option>
                          <option value="asc">Ascending</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Year Range */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Calendar size={16} />
                      Joined year: {filters.yearRange[0]} - {filters.yearRange[1]}
                    </h3>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="2015"
                        max={new Date().getFullYear()}
                        value={filters.yearRange[0]}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          yearRange: [parseInt(e.target.value), prev.yearRange[1]] 
                        }))}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="2015"
                        max={new Date().getFullYear()}
                        value={filters.yearRange[1]}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          yearRange: [prev.yearRange[0], parseInt(e.target.value)] 
                        }))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Follower Range */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Users size={16} />
                      Followers: {formatNumber(filters.followerRange[0])} - {formatNumber(filters.followerRange[1])}
                    </h3>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="1000"
                        value={filters.followerRange[0]}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          followerRange: [parseInt(e.target.value), prev.followerRange[1]] 
                        }))}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="1000"
                        value={filters.followerRange[1]}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          followerRange: [prev.followerRange[0], parseInt(e.target.value)] 
                        }))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Tag size={16} />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            filters.tags.includes(tag)
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-8">
                <Search className="mx-auto text-slate-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">No profiles found</h3>
                <p className="text-slate-400">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProfiles.slice(0, 12).map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => {
                      onClose()
                      // This would typically set the selected profile
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src={profile.avatar}
                        alt={profile.displayName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{profile.displayName}</div>
                        <div className="text-slate-400 text-sm truncate">{profile.handle}</div>
                      </div>
                      {profile.verified && (
                        <Star className="text-blue-400" size={16} />
                      )}
                    </div>
                    <p className="text-slate-300 text-sm line-clamp-2 mb-2">{profile.bio}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{formatNumber(profile.followers)} followers</span>
                      <span className="capitalize">{profile.platform}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
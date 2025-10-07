'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCemeteryStore } from '@/store/cemetery'
import { X, ExternalLink, Calendar, Users, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export function ProfilePanel() {
  const { selectedProfile, setSelectedProfile } = useCemeteryStore()

  if (!selectedProfile) return null

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedProfile(null)}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative w-full max-w-lg bg-cemetery-900/95 backdrop-blur-lg rounded-2xl border border-cemetery-700/50 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedProfile(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-cemetery-800/80 hover:bg-cemetery-700/80 transition-colors text-cemetery-300 hover:text-white"
          >
            <X size={20} />
          </button>

          {/* Header with gradient */}
          <div 
            className="relative h-32 bg-gradient-to-br from-cemetery-800 to-cemetery-900"
            style={{
              background: `linear-gradient(135deg, ${selectedProfile.color}20, ${selectedProfile.color}10)`
            }}
          >
            {/* Platform color accent */}
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: selectedProfile.color }}
            />
            
            {/* Avatar */}
            <div className="absolute -bottom-8 left-6">
              <div className="relative">
                <Image
                  src={selectedProfile.avatar}
                  alt={selectedProfile.displayName}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-cemetery-900 shadow-lg"
                />
                {selectedProfile.verified && (
                  <CheckCircle 
                    className="absolute -bottom-1 -right-1 text-blue-500 bg-cemetery-900 rounded-full"
                    size={20}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pt-12">
            {/* Name and handle */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-1">
                {selectedProfile.displayName}
              </h2>
              <p 
                className="text-lg font-medium"
                style={{ color: selectedProfile.color }}
              >
                {selectedProfile.handle}
              </p>
            </div>

            {/* Bio */}
            <p className="text-cemetery-300 mb-6 leading-relaxed">
              {selectedProfile.bio}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-cemetery-400">
                <Users size={16} />
                <span className="text-sm">
                  {formatFollowers(selectedProfile.followers)} followers
                </span>
              </div>
              <div className="flex items-center gap-2 text-cemetery-400">
                <Calendar size={16} />
                <span className="text-sm">
                  Joined {selectedProfile.yearJoined}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {selectedProfile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs bg-cemetery-800/50 border border-cemetery-700/30 rounded-full text-cemetery-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => window.open(selectedProfile.profileUrl, '_blank')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-ember-600 to-ember-500 hover:from-ember-500 hover:to-ember-400 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-ember-500/25"
            >
              <ExternalLink size={18} />
              Visit Profile
            </button>
          </div>

          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${selectedProfile.color}40, transparent 70%)`
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
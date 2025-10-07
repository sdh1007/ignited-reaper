'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { useCemeteryStore } from '@/store/cemetery'
import { EnhancedHeader } from '@/components/ui/EnhancedHeader'
import { DetailPanel } from '@/components/ui/DetailPanel'
import { ScrollableProfilePanel } from '@/components/ui/ScrollableProfilePanel'
import { EnhancedMobileGrid } from '@/components/ui/EnhancedMobileGrid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ExperienceFallbackNote } from '@/components/ui/ExperienceFallbackNote'
import { Announcer } from '@/components/ui/Announcer'
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useGestures } from '@/hooks/useGestures'

// Dynamically import Cemetery component to avoid SSR issues
const Cemetery = dynamic(() => import('@/components/3d/SafeCemetery').then((mod) => ({ default: mod.SafeCemetery })), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full">
      <LoadingSpinner message="Conjuring the cemetery grounds..." />
    </div>
  ),
})

export default function Home() {
  const {
    isMobile,
    setIsMobile,
    isDayMode,
    toggleDayMode,
    setHasWebGLSupport,
    hasWebGLSupport,
    prefersReducedMotion,
    setPrefersReducedMotion,
    selectedProfile,
    setSelectedProfile,
    searchQuery,
    setSearchQuery,
    isTransitioning,
    loadProfiles,
    isLoadingProfiles,
    loadError,
    profiles,
  } = useCemeteryStore()
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'Escape': () => setSelectedProfile(null),
    'n': () => toggleDayMode(),
    'g': () => setIsMobile(!isMobile),
    '/': () => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
      searchInput?.focus()
    },
  })

  // Mobile gestures
  useGestures({
    onSwipeDown: () => setSelectedProfile(null),
    onSwipeLeft: () => {
      // Navigate to next profile in filtered list
      if (selectedProfile) {
        const profiles = useCemeteryStore.getState().filteredProfiles()
        const currentIndex = profiles.findIndex(p => p.id === selectedProfile.id)
        if (currentIndex < profiles.length - 1) {
          setSelectedProfile(profiles[currentIndex + 1])
        }
      }
    },
    onSwipeRight: () => {
      // Navigate to previous profile in filtered list
      if (selectedProfile) {
        const profiles = useCemeteryStore.getState().filteredProfiles()
        const currentIndex = profiles.findIndex(p => p.id === selectedProfile.id)
        if (currentIndex > 0) {
          setSelectedProfile(profiles[currentIndex - 1])
        }
      }
    },
  })

  useEffect(() => {
    loadProfiles({ includeModeration: true })
    // We intentionally request moderation data here to keep admin tools ready.
  }, [loadProfiles])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches)
    }

    updateMotion(mediaQuery)
    mediaQuery.addEventListener('change', updateMotion)

    const detectWebGL = () => {
      try {
        const canvas = document.createElement('canvas')
        const context =
          canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        const isSupported = Boolean(context)
        setHasWebGLSupport(isSupported)
      } catch (error) {
        setHasWebGLSupport(false)
      }
    }

    detectWebGL()

    return () => {
      mediaQuery.removeEventListener('change', updateMotion)
    }
  }, [setHasWebGLSupport, setPrefersReducedMotion])

  const handleTilt = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - (rect.left + rect.width / 2)
    const offsetY = event.clientY - (rect.top + rect.height / 2)
    const maxTilt = 2

    const nextTiltX = Math.max(Math.min((-offsetY / (rect.height / 2)) * maxTilt, maxTilt), -maxTilt)
    const nextTiltY = Math.max(Math.min((offsetX / (rect.width / 2)) * maxTilt, maxTilt), -maxTilt)

    setTilt({ x: nextTiltX, y: nextTiltY })
  }, [])

  const resetTilt = useCallback(() => setTilt({ x: 0, y: 0 }), [])

  const shouldRender3D = useMemo(() => {
    if (!hasWebGLSupport) return false
    if (prefersReducedMotion) return false
    if (isMobile) return false
    return true
  }, [hasWebGLSupport, prefersReducedMotion, isMobile])

  const fallbackReason = useMemo(() => {
    if (shouldRender3D) return null
    if (!hasWebGLSupport) return 'webgl' as const
    if (prefersReducedMotion) return 'motion' as const
    return null
  }, [shouldRender3D, hasWebGLSupport, prefersReducedMotion])

  const motionHandlers = prefersReducedMotion
    ? {}
    : {
        onMouseMove: (event: MouseEvent<HTMLDivElement>) =>
          !isMobile && handleTilt(event),
        onMouseLeave: () => !isMobile && resetTilt(),
      }

  const showInitialLoader = isLoadingProfiles && profiles.length === 0
  const retryLoadProfiles = useCallback(() => {
    loadProfiles({ includeModeration: true })
  }, [loadProfiles])

  return (
    <main
      className="w-screen h-screen overflow-hidden relative"
      style={{
        background: isDayMode
          ? 'linear-gradient(to bottom right, #87CEEB 0%, #B0D4E3 50%, #87CEEB 100%)'
          : 'linear-gradient(to bottom right, #111824 0%, #161f2f 50%, #1c2738 100%)',
      }}
      aria-label="IgNited Reaper cemetery experience"
    >
      {/* Enhanced Header */}
      <EnhancedHeader />

      {showInitialLoader && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-[rgba(10,12,22,0.85)]">
          <LoadingSpinner message="Summoning memorial profiles..." />
        </div>
      )}

      {!showInitialLoader && loadError && (
        <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-[rgba(9,10,22,0.9)] px-6 text-center text-white">
          <p className="max-w-sm text-sm sm:text-base">
            {loadError}
          </p>
          <button
            type="button"
            onClick={retryLoadProfiles}
            className="inline-flex items-center justify-center rounded-full border border-[rgba(238,90,111,0.5)] bg-[rgba(238,90,111,0.15)] px-6 py-2 text-sm font-medium text-white transition hover:bg-[rgba(238,90,111,0.3)]"
          >
            Retry loading memorials
          </button>
        </div>
      )}

      {/* Main content */}
      <div
        className="w-full h-full transition-transform duration-500 ease-out"
        {...motionHandlers}
        style={
          !isMobile && !prefersReducedMotion
            ? { transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }
            : undefined
        }
      >
        {shouldRender3D ? <Cemetery /> : <EnhancedMobileGrid />}
      </div>

      {/* Profile panels overlay */}
      <ScrollableProfilePanel />
      {/* Fallback to old detail panel if needed */}
      {/* <DetailPanel /> */}

      {/* Screen reader announcements */}
      <Announcer />

      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp />

      {fallbackReason && <ExperienceFallbackNote reason={fallbackReason} />}

      {/* Background effects for desktop */}
      {!isMobile && shouldRender3D && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Atmospheric gradient overlay - removed for day mode to show cemetery */}
          {!isDayMode && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e1421]/45 via-transparent to-transparent" />
          )}

          {/* Vignette effect - subtle for day mode */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isDayMode
                ? 'radial-gradient(circle at center, transparent 65%, rgba(61,88,130,0.08) 100%)'
                : 'radial-gradient(circle at center, transparent 52%, rgba(8,12,20,0.35) 100%)',
            }}
          />
        </div>
      )}
    </main>
  )
}

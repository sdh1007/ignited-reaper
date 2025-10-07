import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  CemeteryState,
  Platform,
  ProfileRecord,
  ProfileStatus,
  SocialProfile,
} from '@/lib/types'
import {
  fetchProfiles,
  submitProfile as submitProfileService,
  updateProfileStatus as updateProfileStatusService,
} from '@/services/profileService'

function sortProfilesByPosition(profiles: SocialProfile[]) {
  return [...profiles].sort((a, b) => a.position.z - b.position.z)
}

function removeProfileById<T extends { id: string }>(collection: T[], id: string) {
  return collection.filter((item) => item.id !== id)
}

export const useCemeteryStore = create<CemeteryState>()(
  devtools(
    (set, get) => ({
      profiles: [],
      moderationQueue: [],
      archivedProfiles: [],
      isLoadingProfiles: false,
      loadError: null,
      lastSyncedAt: null,
      selectedProfile: null,
      searchQuery: '',
      selectedPlatforms: [],
      isDayMode: false,
      isMobile: false,
      hasWebGLSupport: true,
      prefersReducedMotion: false,
      isTransitioning: false,

      async loadProfiles(options = { includeModeration: true }) {
        const includeModeration = options.includeModeration ?? true
        set({ isLoadingProfiles: true, loadError: null })

        try {
          const result = await fetchProfiles({
            status: 'published',
            includeModeration,
          })

          set((state) => {
            const sortedProfiles = sortProfilesByPosition(result.data)
            const selectedProfile = state.selectedProfile
              ? sortedProfiles.find((profile) => profile.id === state.selectedProfile?.id) ?? null
              : null

            return {
              profiles: sortedProfiles,
              moderationQueue:
                includeModeration && result.pending ? result.pending : state.moderationQueue,
              archivedProfiles:
                includeModeration && result.archived ? result.archived : state.archivedProfiles,
              lastSyncedAt: result.meta?.lastUpdated ?? new Date().toISOString(),
              selectedProfile,
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to load profiles'
          set({ loadError: message })
        } finally {
          set({ isLoadingProfiles: false })
        }
      },

      async submitProfile(profile: Omit<SocialProfile, 'id'> & {
        id?: string
        submittedBy?: string
        moderatorNotes?: string
      }) {
        const { record } = await submitProfileService(profile)
        set((state) => ({
          moderationQueue: [record, ...state.moderationQueue],
          lastSyncedAt: record.updatedAt ?? state.lastSyncedAt,
        }))
      },

      async updateProfileStatus({
        id,
        status,
        moderatorNotes,
      }: {
        id: string
        status: ProfileStatus
        moderatorNotes?: string
      }) {
        const { record } = await updateProfileStatusService({ id, status, moderatorNotes })

        set((state) => {
          const nextState: Partial<CemeteryState> = {}
          const baseTimestamp = (
            (record as ProfileRecord).updatedAt ?? new Date().toISOString()
          )

          nextState.lastSyncedAt = baseTimestamp
          nextState.moderationQueue = removeProfileById(state.moderationQueue, id)
          nextState.archivedProfiles = removeProfileById(state.archivedProfiles, id)

          if (status === 'published') {
            const publishedRecord = record as SocialProfile
            nextState.profiles = sortProfilesByPosition([
              ...removeProfileById(state.profiles, id),
              publishedRecord,
            ])

            if (state.selectedProfile && state.selectedProfile.id === id) {
              nextState.selectedProfile = publishedRecord
            }
          } else if (status === 'pending') {
            const pendingRecord = record as ProfileRecord
            nextState.moderationQueue = [pendingRecord, ...(nextState.moderationQueue ?? [])]

            if (state.selectedProfile && state.selectedProfile.id === id) {
              nextState.selectedProfile = null
            }
          } else if (status === 'archived') {
            const archivedRecord = record as ProfileRecord
            nextState.archivedProfiles = [
              archivedRecord,
              ...(nextState.archivedProfiles ?? []),
            ]

            if (state.selectedProfile && state.selectedProfile.id === id) {
              nextState.selectedProfile = null
            }
          }

          return nextState
        })
      },

      setSelectedProfile: (profile) => set({ selectedProfile: profile }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSelectedPlatforms: (platforms: Platform[]) => set({ selectedPlatforms: platforms }),

      toggleDayMode: () => {
        set((state) => ({ isDayMode: !state.isDayMode }))
      },

      setIsMobile: (isMobile) => set({ isMobile }),

      setHasWebGLSupport: (isSupported) => set({ hasWebGLSupport: isSupported }),

      setPrefersReducedMotion: (prefers) => set({ prefersReducedMotion: prefers }),

      filteredProfiles: () => {
        const { profiles, searchQuery, selectedPlatforms } = get()

        return profiles.filter((profile) => {
          const normalizedQuery = searchQuery.trim().toLowerCase()
          const matchesSearch =
            normalizedQuery === '' ||
            profile.displayName.toLowerCase().includes(normalizedQuery) ||
            profile.handle.toLowerCase().includes(normalizedQuery) ||
            profile.bio.toLowerCase().includes(normalizedQuery) ||
            profile.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))

          const matchesPlatform =
            selectedPlatforms.length === 0 ||
            selectedPlatforms.includes(profile.platform)

          return matchesSearch && matchesPlatform
        })
      },
    }),
    {
      name: 'cemetery-store',
    }
  )
)

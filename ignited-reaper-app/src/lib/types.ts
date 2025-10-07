import { z } from 'zod'

export const PlatformSchema = z.enum([
  'twitter',
  'instagram',
  'tiktok',
  'youtube',
  'twitch',
  'linkedin',
  'github',
  'discord'
])

export const SocialProfileSchema = z.object({
  id: z.string(),
  platform: PlatformSchema,
  handle: z.string(),
  displayName: z.string(),
  bio: z.string(),
  avatar: z.string(),
  coverImage: z.string().optional(),
  yearJoined: z.number(),
  followers: z.number(),
  verified: z.boolean().default(false),
  tags: z.array(z.string()),
  profileUrl: z.string(),
  screenshot: z.string().optional(),
  color: z.string(), // Platform brand color
  plotStyle: z.enum([
    'tablet',
    'rounded',
    'cross',
    'obelisk',
    'stepped',
    'gothic',
    'curved',
    'angular',
    'footstone',
    'wide',
    'modern',
  ]),
  position: z.object({
    x: z.number(),
    z: z.number()
  })
})

export type Platform = z.infer<typeof PlatformSchema>
export type SocialProfile = z.infer<typeof SocialProfileSchema>
export type PlotStyle = SocialProfile['plotStyle']

export const ProfileStatusSchema = z.enum(['published', 'pending', 'archived'])
export type ProfileStatus = z.infer<typeof ProfileStatusSchema>

export const ProfileRecordSchema = SocialProfileSchema.extend({
  status: ProfileStatusSchema.default('pending'),
  submittedBy: z.string().optional(),
  submittedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  moderatorNotes: z.string().optional(),
  flagged: z.boolean().optional(),
})

export type ProfileRecord = z.infer<typeof ProfileRecordSchema>

export interface AppState {
  profiles: SocialProfile[]
  selectedProfile: SocialProfile | null
  searchQuery: string
  selectedPlatforms: Platform[]
  isDayMode: boolean
  isMobile: boolean
  hasWebGLSupport: boolean
  prefersReducedMotion: boolean
  isTransitioning: boolean
}

export interface CemeteryState extends AppState {
  moderationQueue: ProfileRecord[]
  archivedProfiles: ProfileRecord[]
  isLoadingProfiles: boolean
  loadError: string | null
  lastSyncedAt: string | null
  setSelectedProfile: (profile: SocialProfile | null) => void
  setSearchQuery: (query: string) => void
  setSelectedPlatforms: (platforms: Platform[]) => void
  toggleDayMode: () => void
  setIsMobile: (isMobile: boolean) => void
  setHasWebGLSupport: (isSupported: boolean) => void
  setPrefersReducedMotion: (prefers: boolean) => void
  filteredProfiles: () => SocialProfile[]
  loadProfiles: (options?: { includeModeration?: boolean }) => Promise<void>
  submitProfile: (profile: Omit<SocialProfile, 'id'> & { id?: string; submittedBy?: string; moderatorNotes?: string }) => Promise<void>
  updateProfileStatus: (input: { id: string; status: ProfileStatus; moderatorNotes?: string }) => Promise<void>
}

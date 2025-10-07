import {
  ProfileRecord,
  ProfileRecordSchema,
  ProfileStatus,
  ProfileStatusSchema,
  SocialProfile,
  SocialProfileSchema,
} from '@/lib/types'

const API_ENDPOINT = '/api/profiles'

interface FetchProfilesOptions {
  status?: ProfileStatus
  includeModeration?: boolean
  signal?: AbortSignal
}

interface FetchProfilesResponse {
  data: SocialProfile[]
  pending?: ProfileRecord[]
  archived?: ProfileRecord[]
  meta?: {
    counts?: Record<'published' | 'pending' | 'archived', number>
    lastUpdated?: string | null
  }
}

function buildQueryString(options: FetchProfilesOptions = {}) {
  const params = new URLSearchParams()
  params.set('status', (options.status ?? 'published') as string)
  if (options.includeModeration) {
    params.set('includeModeration', 'true')
  }
  return params.toString()
}

export async function fetchProfiles(
  options: FetchProfilesOptions = {}
): Promise<FetchProfilesResponse> {
  const query = buildQueryString(options)
  const response = await fetch(`${API_ENDPOINT}?${query}`, {
    method: 'GET',
    cache: 'no-store',
    signal: options.signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to load profiles (${response.status})`)
  }

  const payload = await response.json()
  const data = SocialProfileSchema.array().parse(payload.data ?? [])

  const pending = payload.pending
    ? ProfileRecordSchema.array().parse(payload.pending)
    : undefined

  const archived = payload.archived
    ? ProfileRecordSchema.array().parse(payload.archived)
    : undefined

  return {
    data,
    pending,
    archived,
    meta: payload.meta,
  }
}

interface SubmitProfileInput extends Omit<SocialProfile, 'id'> {
  id?: string
  submittedBy?: string
  moderatorNotes?: string
}

export async function submitProfile(
  profile: SubmitProfileInput
): Promise<{ record: ProfileRecord }> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    throw new Error(`Failed to submit profile (${response.status})`)
  }

  const payload = await response.json()
  return {
    record: ProfileRecordSchema.parse(payload.record),
  }
}

interface UpdateProfileStatusInput {
  id: string
  status: ProfileStatus
  moderatorNotes?: string
}

export async function updateProfileStatus(
  input: UpdateProfileStatusInput
): Promise<{ record: ProfileRecord | SocialProfile }> {
  const response = await fetch(API_ENDPOINT, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Failed to update profile (${response.status})`)
  }

  const payload = await response.json()

  if (input.status === 'published') {
    return {
      record: SocialProfileSchema.parse(payload.record),
    }
  }

  return {
    record: ProfileRecordSchema.parse(payload.record),
  }
}

export function isProfileStatus(value: string): value is ProfileStatus {
  return ProfileStatusSchema.safeParse(value).success
}

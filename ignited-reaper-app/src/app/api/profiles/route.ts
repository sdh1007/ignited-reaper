import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import {
  ProfileRecord,
  ProfileRecordSchema,
  ProfileStatus,
  ProfileStatusSchema,
  SocialProfile,
  SocialProfileSchema,
} from '@/lib/types'
import { getDb, getLastUpdated, updateLastUpdated } from '@/lib/db'

const submitSchema = SocialProfileSchema.omit({ id: true }).extend({
  id: z.string().optional(),
  submittedBy: z.string().optional(),
  moderatorNotes: z.string().optional(),
})

const patchSchema = z.object({
  id: z.string(),
  status: ProfileStatusSchema,
  moderatorNotes: z.string().optional(),
})

interface DbRow {
  id: string
  status: string
  platform: string
  handle: string
  displayName: string
  bio: string
  avatar: string
  coverImage: string | null
  yearJoined: number
  followers: number
  verified: number
  tags: string
  profileUrl: string
  screenshot: string | null
  color: string
  plotStyle: string
  positionX: number
  positionZ: number
  submittedBy: string | null
  submittedAt: string | null
  updatedAt: string | null
  moderatorNotes: string | null
  flagged: number
}

function rowToRecord(row: DbRow): ProfileRecord {
  return ProfileRecordSchema.parse({
    id: row.id,
    status: row.status,
    platform: row.platform,
    handle: row.handle,
    displayName: row.displayName,
    bio: row.bio,
    avatar: row.avatar,
    coverImage: row.coverImage ?? undefined,
    yearJoined: row.yearJoined,
    followers: row.followers,
    verified: Boolean(row.verified),
    tags: JSON.parse(row.tags),
    profileUrl: row.profileUrl,
    screenshot: row.screenshot ?? undefined,
    color: row.color,
    plotStyle: row.plotStyle,
    position: {
      x: row.positionX,
      z: row.positionZ,
    },
    submittedBy: row.submittedBy ?? undefined,
    submittedAt: row.submittedAt ?? undefined,
    updatedAt: row.updatedAt ?? undefined,
    moderatorNotes: row.moderatorNotes ?? undefined,
    flagged: Boolean(row.flagged),
  })
}

function sanitizeForClient(record: ProfileRecord): SocialProfile {
  const {
    status: _status,
    submittedBy: _submittedBy,
    submittedAt: _submittedAt,
    updatedAt: _updatedAt,
    moderatorNotes: _notes,
    flagged: _flagged,
    ...rest
  } = record
  return rest
}

function getCounts(db = getDb()) {
  const rows = db
    .prepare('SELECT status, COUNT(*) as count FROM profiles GROUP BY status')
    .all() as Array<{ status: ProfileStatus; count: number }>

  return rows.reduce(
    (acc, row) => {
      acc[row.status] = row.count
      return acc
    },
    { published: 0, pending: 0, archived: 0 } as Record<ProfileStatus, number>
  )
}

function orderedSelect(status: ProfileStatus, db = getDb()) {
  return db
    .prepare('SELECT * FROM profiles WHERE status = ? ORDER BY positionZ ASC, displayName ASC')
    .all(status) as DbRow[]
}

export async function GET(request: Request) {
  try {
    const db = getDb()
    const { searchParams } = new URL(request.url)
    const status = (searchParams.get('status') ?? 'published') as ProfileStatus
    const includeModeration = searchParams.get('includeModeration') === 'true'

    if (!ProfileStatusSchema.safeParse(status).success) {
      return NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 })
    }

    const counts = getCounts(db)
    const lastUpdated = getLastUpdated(db)

    const payload: Record<string, unknown> = {
      meta: {
        counts,
        lastUpdated,
      },
    }

    const selectedRows = orderedSelect(status, db).map(rowToRecord)

    if (status === 'published') {
      payload.data = selectedRows.map(sanitizeForClient)
    } else {
      payload.data = selectedRows
    }

    if (includeModeration) {
      payload.pending = status === 'pending' ? payload.data : orderedSelect('pending', db).map(rowToRecord)
      payload.archived = status === 'archived' ? payload.data : orderedSelect('archived', db).map(rowToRecord)
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const db = getDb()
  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const parsed = submitSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const now = new Date().toISOString()
  const record = ProfileRecordSchema.parse({
    ...parsed.data,
    id: parsed.data.id ?? randomUUID(),
    status: 'pending' as ProfileStatus,
    submittedAt: now,
    updatedAt: now,
  })

  db.prepare(`
    INSERT INTO profiles (
      id, status, platform, handle, displayName, bio, avatar, coverImage,
      yearJoined, followers, verified, tags, profileUrl, screenshot, color,
      plotStyle, positionX, positionZ, submittedBy, submittedAt, updatedAt,
      moderatorNotes, flagged
    ) VALUES (
      @id, @status, @platform, @handle, @displayName, @bio, @avatar, @coverImage,
      @yearJoined, @followers, @verified, @tags, @profileUrl, @screenshot, @color,
      @plotStyle, @positionX, @positionZ, @submittedBy, @submittedAt, @updatedAt,
      @moderatorNotes, @flagged
    )
  `).run({
    id: record.id,
    status: record.status,
    platform: record.platform,
    handle: record.handle,
    displayName: record.displayName,
    bio: record.bio,
    avatar: record.avatar,
    coverImage: record.coverImage ?? null,
    yearJoined: record.yearJoined,
    followers: record.followers,
    verified: record.verified ? 1 : 0,
    tags: JSON.stringify(record.tags),
    profileUrl: record.profileUrl,
    screenshot: record.screenshot ?? null,
    color: record.color,
    plotStyle: record.plotStyle,
    positionX: record.position.x,
    positionZ: record.position.z,
    submittedBy: record.submittedBy ?? null,
    submittedAt: record.submittedAt ?? now,
    updatedAt: record.updatedAt ?? now,
    moderatorNotes: record.moderatorNotes ?? null,
    flagged: record.flagged ? 1 : 0,
  })

  const lastUpdated = updateLastUpdated(db)

  return NextResponse.json({
    record,
    meta: {
      counts: getCounts(db),
      lastUpdated,
    },
  })
}

export async function PATCH(request: Request) {
  const db = getDb()
  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = db.prepare('SELECT * FROM profiles WHERE id = ?').get(parsed.data.id) as DbRow | undefined
  if (!existing) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const updatedRecord = ProfileRecordSchema.parse({
    ...rowToRecord(existing),
    status: parsed.data.status,
    moderatorNotes: parsed.data.moderatorNotes ?? existing.moderatorNotes ?? undefined,
    updatedAt: new Date().toISOString(),
  })

  db.prepare(`
    UPDATE profiles SET
      status=@status,
      moderatorNotes=@moderatorNotes,
      updatedAt=@updatedAt
    WHERE id=@id
  `).run({
    id: updatedRecord.id,
    status: updatedRecord.status,
    moderatorNotes: updatedRecord.moderatorNotes ?? null,
    updatedAt: updatedRecord.updatedAt,
  })

  const lastUpdated = updateLastUpdated(db)
  const responseRecord =
    parsed.data.status === 'published' ? sanitizeForClient(updatedRecord) : updatedRecord

  return NextResponse.json({
    record: responseRecord,
    meta: {
      counts: getCounts(db),
      lastUpdated,
    },
  })
}

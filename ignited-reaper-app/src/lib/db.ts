// Mock database for static export
import { ProfileRecordSchema, ProfileStatus } from '@/lib/types'

// Mock database that returns empty results for static builds
const mockDatabase = {
  prepare: (sql: string) => ({
    all: (...params: any[]) => [],
    get: (...params: any[]) => undefined,
    run: (...params: any[]) => ({ lastInsertRowid: 1 })
  }),
  close: () => {}
}

let database: typeof mockDatabase | null = null

function ensureDirectories() {
  // No-op for static builds
}

function createTables(db: typeof mockDatabase) {
  // No-op for static builds
}

function seedFromLegacyJson(db: typeof mockDatabase) {
  // No-op for static builds
}

export function getDatabase() {
  if (!database) {
    database = mockDatabase
    ensureDirectories()
    createTables(database)
    seedFromLegacyJson(database)
  }
  return database
}

export function closeDatabase() {
  if (database) {
    database.close()
    database = null
  }
}

export async function getAllProfiles() {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM profiles WHERE status = ?')
  const rows = stmt.all('approved')
  return rows.map(row => ProfileRecordSchema.parse(row))
}

export async function getProfileById(id: string) {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM profiles WHERE id = ?')
  const row = stmt.get(id)
  return row ? ProfileRecordSchema.parse(row) : null
}

export async function createProfile(profile: any) {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO profiles (
      id, status, platform, handle, displayName, bio, avatar, coverImage,
      yearJoined, followers, verified, tags, profileUrl, screenshot, color,
      plotStyle, position, submittedBy, moderatorNotes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  const result = stmt.run(
    profile.id, profile.status, profile.platform, profile.handle,
    profile.displayName, profile.bio, profile.avatar, profile.coverImage,
    profile.yearJoined, profile.followers, profile.verified, 
    JSON.stringify(profile.tags), profile.profileUrl, profile.screenshot,
    profile.color, profile.plotStyle, JSON.stringify(profile.position),
    profile.submittedBy, profile.moderatorNotes, profile.createdAt, profile.updatedAt
  )
  
  return result.lastInsertRowid
}

export async function updateProfileStatus(id: string, status: ProfileStatus, moderatorNotes?: string) {
  const db = getDatabase()
  const stmt = db.prepare('UPDATE profiles SET status = ?, moderatorNotes = ?, updatedAt = ? WHERE id = ?')
  stmt.run(status, moderatorNotes, new Date().toISOString(), id)
}

export async function getModerationQueue() {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM profiles WHERE status = ? ORDER BY createdAt ASC')
  const rows = stmt.all('pending')
  return rows.map(row => ProfileRecordSchema.parse(row))
}

export async function getArchivedProfiles() {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM profiles WHERE status = ? ORDER BY updatedAt DESC')
  const rows = stmt.all('archived')
  return rows.map(row => ProfileRecordSchema.parse(row))
}

// Additional exports needed by API routes
export function getDb() {
  return getDatabase()
}

export function getLastUpdated(db?: any) {
  return new Date().toISOString()
}

export function updateLastUpdated(db?: any) {
  // No-op for static builds
  return new Date().toISOString()
}

// Additional functions needed by API routes
export function getCounts(db?: any) {
  return {
    published: 0,
    pending: 0,
    archived: 0
  }
}

export function orderedSelect(status: ProfileStatus, db?: any) {
  return []
}
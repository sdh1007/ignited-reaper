import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { ProfileRecordSchema, ProfileStatus } from '@/lib/types'

const DB_PATH = path.join(process.cwd(), 'data', 'profiles.db')
const LEGACY_JSON_PATH = path.join(process.cwd(), 'data', 'profiles-db.json')

let database: Database.Database | null = null

function ensureDirectories() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function createTables(db: Database.Database) {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      platform TEXT NOT NULL,
      handle TEXT NOT NULL,
      displayName TEXT NOT NULL,
      bio TEXT NOT NULL,
      avatar TEXT NOT NULL,
      coverImage TEXT,
      yearJoined INTEGER NOT NULL,
      followers INTEGER NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT 0,
      tags TEXT NOT NULL,
      profileUrl TEXT NOT NULL,
      screenshot TEXT,
      color TEXT NOT NULL,
      plotStyle TEXT NOT NULL,
      position TEXT NOT NULL,
      submittedBy TEXT,
      moderatorNotes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `).run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `).run()
}

function seedFromLegacyJson(db: Database.Database) {
  if (!fs.existsSync(LEGACY_JSON_PATH)) return

  try {
    const legacyData = JSON.parse(fs.readFileSync(LEGACY_JSON_PATH, 'utf-8'))
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO profiles (
        id, status, platform, handle, displayName, bio, avatar, coverImage,
        yearJoined, followers, verified, tags, profileUrl, screenshot, color,
        plotStyle, position, submittedBy, moderatorNotes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const profile of legacyData) {
      stmt.run(
        profile.id,
        profile.status || 'published',
        profile.platform,
        profile.handle,
        profile.displayName,
        profile.bio,
        profile.avatar,
        profile.coverImage || null,
        profile.yearJoined,
        profile.followers,
        profile.verified ? 1 : 0,
        JSON.stringify(profile.tags),
        profile.profileUrl,
        profile.screenshot || null,
        profile.color,
        profile.plotStyle,
        JSON.stringify(profile.position),
        profile.submittedBy || null,
        profile.moderatorNotes || null,
        profile.createdAt || new Date().toISOString(),
        profile.updatedAt || new Date().toISOString()
      )
    }
  } catch (error) {
    console.warn('Failed to seed from legacy JSON:', error)
  }
}

export function getDatabase() {
  if (!database) {
    database = new Database(DB_PATH)
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
  const rows = stmt.all('published')
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
    profile.yearJoined, profile.followers, profile.verified ? 1 : 0, 
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

// Additional functions needed by API routes
export function getDb() {
  return getDatabase()
}

export function getLastUpdated(db?: any) {
  const database = db || getDatabase()
  const stmt = database.prepare('SELECT value FROM metadata WHERE key = ?')
  const result = stmt.get('lastUpdated')
  return result ? result.value : new Date().toISOString()
}

export function updateLastUpdated(db?: any) {
  const database = db || getDatabase()
  const stmt = database.prepare('INSERT OR REPLACE INTO metadata (key, value, updatedAt) VALUES (?, ?, ?)')
  const now = new Date().toISOString()
  stmt.run('lastUpdated', now, now)
  return now
}

// Additional functions needed by API routes
export function getCounts(db?: any) {
  const database = db || getDatabase()
  const stmt = database.prepare('SELECT status, COUNT(*) as count FROM profiles GROUP BY status')
  const rows = stmt.all()
  
  const counts = {
    published: 0,
    pending: 0,
    archived: 0
  }
  
  rows.forEach((row: any) => {
    if (row.status in counts) {
      counts[row.status as keyof typeof counts] = row.count
    }
  })
  
  return counts
}

export function orderedSelect(status: ProfileStatus, db?: any) {
  const database = db || getDatabase()
  const stmt = database.prepare('SELECT * FROM profiles WHERE status = ? ORDER BY CAST(JSON_EXTRACT(position, "$.z") AS REAL) ASC, displayName ASC')
  return stmt.all(status)
}
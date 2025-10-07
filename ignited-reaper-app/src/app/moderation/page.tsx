'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useCemeteryStore } from '@/store/cemetery'
import { ProfileRecord, ProfileStatus } from '@/lib/types'

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function StatusPill({ status }: { status: ProfileStatus }) {
  const colors: Record<ProfileStatus, string> = {
    published: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40',
    pending: 'bg-amber-500/20 text-amber-200 border border-amber-400/40',
    archived: 'bg-slate-500/20 text-slate-200 border border-slate-400/40',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${colors[status]}`}>
      {status}
    </span>
  )
}

function ProfileCard({
  profile,
  actionLabel,
  onPrimaryAction,
  onSecondaryAction,
  secondaryLabel,
  busy,
}: {
  profile: ProfileRecord
  actionLabel?: string
  onPrimaryAction?: () => Promise<void> | void
  onSecondaryAction?: () => Promise<void> | void
  secondaryLabel?: string
  busy?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(12,15,26,0.75)] p-5 shadow-lg shadow-black/20 backdrop-blur">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">{profile.displayName}</h3>
              <StatusPill status={profile.status} />
            </div>
            <p className="text-sm text-white/60">{profile.handle}</p>
          </div>
          <span className="text-xs uppercase tracking-wider text-white/40">
            {profile.platform}
          </span>
        </div>
        <p className="text-sm text-white/80 line-clamp-3">{profile.bio}</p>
        <div className="flex flex-wrap gap-2">
          {profile.tags.slice(0, 6).map((tag) => (
            <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1 text-xs text-white/50">
          <span>Submitted: {formatDate(profile.submittedAt ?? profile.updatedAt ?? null)}</span>
          {profile.moderatorNotes && <span>Moderator notes: {profile.moderatorNotes}</span>}
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {actionLabel && (
            <button
              type="button"
              disabled={busy}
              onClick={onPrimaryAction}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Working…' : actionLabel}
            </button>
          )}
          {secondaryLabel && (
            <button
              type="button"
              disabled={busy}
              onClick={onSecondaryAction}
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {secondaryLabel}
            </button>
          )}
          <Link
            href={profile.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-[#4A90A4] px-4 py-2 text-sm font-medium text-[#A6E3F5] transition hover:bg-[#4A90A4]/20"
          >
            View profile
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ModerationDashboard() {
  const {
    moderationQueue,
    archivedProfiles,
    profiles,
    loadProfiles,
    updateProfileStatus,
    isLoadingProfiles,
    loadError,
    lastSyncedAt,
  } = useCemeteryStore((state) => ({
    moderationQueue: state.moderationQueue,
    archivedProfiles: state.archivedProfiles,
    profiles: state.profiles,
    loadProfiles: state.loadProfiles,
    updateProfileStatus: state.updateProfileStatus,
    isLoadingProfiles: state.isLoadingProfiles,
    loadError: state.loadError,
    lastSyncedAt: state.lastSyncedAt,
  }))

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    loadProfiles({ includeModeration: true }).catch((error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'Failed to load profiles')
    })
  }, [loadProfiles])

  const counts = useMemo(
    () => ({
      published: profiles.length,
      pending: moderationQueue.length,
      archived: archivedProfiles.length,
    }),
    [profiles.length, moderationQueue.length, archivedProfiles.length]
  )

  const handleAction = async (id: string, status: ProfileStatus, moderatorNotes?: string) => {
    const key = `${id}:${status}`
    setBusyId(key)
    setActionError(null)

    try {
      await updateProfileStatus({ id, status, moderatorNotes })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const refresh = async () => {
    try {
      await loadProfiles({ includeModeration: true })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to refresh')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f1c] via-[#101727] to-[#141c2c] text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Moderation Dashboard</h1>
            <p className="text-sm text-white/60">
              Review community submissions, approve featured memorials, and maintain the cemetery experience.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refresh}
              disabled={isLoadingProfiles}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingProfiles ? 'Refreshing…' : 'Refresh data'}
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[#ee5a6f]/20 px-4 py-2 text-sm font-medium text-[#ffb3c0] transition hover:bg-[#ee5a6f]/30"
            >
              Back to experience
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-widest text-white/50">Pending</p>
            <p className="mt-2 text-3xl font-semibold text-white">{counts.pending}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-widest text-white/50">Published</p>
            <p className="mt-2 text-3xl font-semibold text-white">{counts.published}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-widest text-white/50">Archived</p>
            <p className="mt-2 text-3xl font-semibold text-white">{counts.archived}</p>
          </div>
        </section>

        {(loadError || actionError) && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-100">
            {loadError ?? actionError}
          </div>
        )}

        <section className="flex flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Pending submissions</h2>
              <p className="text-sm text-white/60">
                Approve to promote into the live cemetery or archive for future review.
              </p>
            </div>
            <span className="text-xs text-white/40">Last synced: {lastSyncedAt ? formatDate(lastSyncedAt) : '—'}</span>
          </header>
          {moderationQueue.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
              No pending submissions right now.
            </p>
          ) : (
            <div className="grid gap-4">
              {moderationQueue.map((profile) => {
                const busy = busyId === `${profile.id}:published` || busyId === `${profile.id}:archived`
                return (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    actionLabel="Approve & Publish"
                    onPrimaryAction={() => handleAction(profile.id, 'published')}
                    secondaryLabel="Archive"
                    onSecondaryAction={() => handleAction(profile.id, 'archived')}
                    busy={busy}
                  />
                )
              })}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Published memorials</h2>
              <p className="text-sm text-white/60">
                Spot-check live entries and archive anything that needs updates.
              </p>
            </div>
          </header>
          {profiles.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
              No published memorials found.
            </p>
          ) : (
            <div className="grid gap-4">
              {profiles.map((profile) => {
                const busy = busyId === `${profile.id}:archived`
                const card: ProfileRecord = {
                  ...profile,
                  status: 'published',
                  submittedBy: undefined,
                  submittedAt: undefined,
                  updatedAt: undefined,
                  moderatorNotes: undefined,
                  flagged: false,
                }

                return (
                  <ProfileCard
                    key={profile.id}
                    profile={card}
                    secondaryLabel="Archive"
                    onSecondaryAction={() => handleAction(profile.id, 'archived')}
                    busy={busy}
                  />
                )
              })}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 pb-10">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Archived submissions</h2>
              <p className="text-sm text-white/60">
                Restore entries back into review or keep them on hold.
              </p>
            </div>
          </header>
          {archivedProfiles.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
              Nothing in the archive yet.
            </p>
          ) : (
            <div className="grid gap-4">
              {archivedProfiles.map((profile) => {
                const busy = busyId === `${profile.id}:pending` || busyId === `${profile.id}:published`
                return (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    actionLabel="Restore to review"
                    onPrimaryAction={() => handleAction(profile.id, 'pending')}
                    secondaryLabel="Publish"
                    onSecondaryAction={() => handleAction(profile.id, 'published')}
                    busy={busy}
                  />
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

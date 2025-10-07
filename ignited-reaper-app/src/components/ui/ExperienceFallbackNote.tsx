'use client'

import { motion } from 'framer-motion'

const messages: Record<'webgl' | 'motion', { title: string; body: string }> = {
  webgl: {
    title: 'Veil in Liminal Mode',
    body: "Your device can't conjure the 3D graveyard, so we're guiding you through the 2D memorial path instead.",
  },
  motion: {
    title: 'Calm Winds Engaged',
    body: 'Reduced-motion is enabled, so the spirits stay still while you explore the memorials.',
  },
}

type ExperienceFallbackNoteProps = {
  reason: 'webgl' | 'motion'
}

export function ExperienceFallbackNote({ reason }: ExperienceFallbackNoteProps) {
  const { title, body } = messages[reason]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="pointer-events-none fixed left-1/2 bottom-10 z-50 w-[min(90vw,420px)] -translate-x-1/2"
    >
      <div className="relative rounded-2xl border border-[var(--surface-border)]/80 bg-[rgba(15,22,36,0.86)] px-5 py-4 shadow-moon-mist">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-ember-500/55 bg-[rgba(30,21,33,0.75)] text-ember-300 shadow-ember-glow">
          ✨
        </div>
        <h2 className="mt-2 text-sm font-semibold uppercase tracking-[0.35em] text-ember-200 text-center">
          {title}
        </h2>
        <p className="mt-3 text-sm text-muted text-center">
          {body}
        </p>
      </div>
    </motion.div>
  )
}

'use client'

import { motion, useReducedMotion } from 'framer-motion'

type LoadingSpinnerProps = {
  message?: string
  className?: string
}

export function LoadingSpinner({ message = 'Spirits stirring...', className }: LoadingSpinnerProps = {}) {
  const shouldReduceMotion = useReducedMotion()
  const positioning = className ?? 'absolute inset-0'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${positioning} flex items-center justify-center bg-[rgba(9,11,22,0.82)] backdrop-blur-2xl text-primary`}
    >
      <div className="relative w-full max-w-md px-6 py-10">
        <div className="absolute inset-0 rounded-3xl border border-[var(--surface-border)]/80 bg-[rgba(12,17,30,0.85)] shadow-moon-mist" />
        <motion.div
          className="absolute -inset-12 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,_rgba(238,90,111,0.16),_transparent_60%)]"
          animate={shouldReduceMotion ? undefined : { opacity: [0.15, 0.4, 0.15] }}
          transition={shouldReduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative flex flex-col items-center gap-6 text-center">
          {/* Orbiting indicators */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {[0, 120, 240].map((deg, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#ee5a6f', '#4A90A4', '#7c7ec6'][i],
                  left: '50%',
                  top: '50%',
                  marginLeft: '-4px',
                  marginTop: '-4px',
                }}
                animate={shouldReduceMotion ? undefined : {
                  x: [0, Math.cos((deg * Math.PI) / 180) * 30, 0],
                  y: [0, Math.sin((deg * Math.PI) / 180) * 30, 0],
                }}
                transition={shouldReduceMotion ? undefined : {
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.2,
                }}
              />
            ))}
            <motion.span
              className="relative text-2xl z-10"
              animate={shouldReduceMotion ? undefined : { 
                scale: [1, 1.05, 1],
                opacity: [0.85, 1, 0.85]
              }}
              transition={shouldReduceMotion ? undefined : { 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              aria-hidden="true"
            >
              🔮
            </motion.span>
          </div>

          <motion.div
            animate={shouldReduceMotion ? undefined : { 
              scale: [1, 1.02, 1],
            }}
            transition={shouldReduceMotion ? undefined : { 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <p className="text-lg font-semibold uppercase tracking-[0.4em] text-primary">
              {message}
            </p>
            <p className="mt-2 text-sm text-muted">
              Binding memories to the veil. Please hold on a moment.
            </p>
          </motion.div>

          <div className="w-full space-y-3" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="relative h-16 rounded-2xl border border-[var(--surface-border)]/70 bg-[rgba(15,20,34,0.75)] overflow-hidden"
              >
                {!shouldReduceMotion && (
                  <motion.div
                    className="absolute inset-0 bg-[linear-gradient(120deg,rgba(238,90,111,0.08),rgba(238,90,111,0.35),rgba(238,90,111,0.08))]"
                    style={{ backgroundSize: '200% 100%' }}
                    animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay: index * 0.2 }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          <p className="text-xs uppercase tracking-[0.35em] text-muted" aria-hidden="true">
            Secure channel with the afterlife steady
          </p>
        </div>
      </div>
      <span className="sr-only">{message}</span>
    </div>
  )
}

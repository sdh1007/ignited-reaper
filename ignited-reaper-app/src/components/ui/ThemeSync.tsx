'use client'

import { useEffect } from 'react'
import { useCemeteryStore } from '@/store/cemetery'

export function ThemeSync() {
  const { isDayMode } = useCemeteryStore()

  useEffect(() => {
    const theme = isDayMode ? 'day' : 'night'
    document.body.dataset.theme = theme
    return () => {
      document.body.dataset.theme = ''
    }
  }, [isDayMode])

  return null
}

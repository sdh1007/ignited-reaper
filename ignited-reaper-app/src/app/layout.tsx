import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeSync } from '@/components/ui/ThemeSync'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IgNited Reaper - Digital Necromancy',
  description: 'Explore social profiles in an immersive 3D cemetery environment',
  keywords: 'social media, 3D, cemetery, profiles, digital art, interactive',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body data-theme="night" className={inter.className}>
        <ThemeSync />
        {children}
      </body>
    </html>
  )
}

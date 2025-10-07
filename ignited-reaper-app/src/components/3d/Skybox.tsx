'use client'

import { useMemo } from 'react'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface SkyboxProps {
  qualityTier: 'high' | 'medium' | 'low'
}

function createSkyboxTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null

  const size = 2048 // Increased resolution for better quality
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null

  // Create realistic daytime sky gradient
  const gradient = context.createLinearGradient(0, 0, 0, size)
  gradient.addColorStop(0, '#4a90e2') // Deeper blue at zenith
  gradient.addColorStop(0.25, '#6ba3e8') // Mid-sky blue
  gradient.addColorStop(0.5, '#87ceeb') // Classic sky blue
  gradient.addColorStop(0.7, '#b8d4f1') // Light blue near horizon
  gradient.addColorStop(0.85, '#dce8f5') // Very light blue
  gradient.addColorStop(1, '#f0f4f8') // Almost white at horizon (atmospheric haze)

  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  // Add realistic scattered clouds with varied opacity
  const cloudCount = 15
  for (let i = 0; i < cloudCount; i++) {
    const x = Math.random() * size
    const y = Math.random() * size * 0.7 // Keep clouds in upper 70%
    const baseRadius = 80 + Math.random() * 180
    const opacity = 0.08 + Math.random() * 0.12
    
    // Multi-layer clouds for depth
    context.globalAlpha = opacity
    context.fillStyle = '#ffffff'
    
    // Main cloud body
    context.beginPath()
    context.arc(x, y, baseRadius, 0, Math.PI * 2)
    context.fill()
    
    // Cloud variations for natural look
    context.beginPath()
    context.arc(x + baseRadius * 0.6, y - baseRadius * 0.3, baseRadius * 0.7, 0, Math.PI * 2)
    context.fill()
    
    context.beginPath()
    context.arc(x - baseRadius * 0.5, y + baseRadius * 0.2, baseRadius * 0.6, 0, Math.PI * 2)
    context.fill()
  }
  
  // Add subtle wispy cirrus clouds higher up
  context.globalAlpha = 0.06
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * size
    const y = Math.random() * size * 0.4 // Upper atmosphere
    const length = 100 + Math.random() * 200
    const width = 15 + Math.random() * 25
    
    context.fillStyle = '#ffffff'
    context.beginPath()
    context.ellipse(x, y, length, width, Math.random() * Math.PI, 0, Math.PI * 2)
    context.fill()
  }
  
  context.globalAlpha = 1

  // Add atmospheric perspective (subtle gradient overlay at horizon)
  const horizonGradient = context.createLinearGradient(0, size * 0.7, 0, size)
  horizonGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
  horizonGradient.addColorStop(1, 'rgba(240, 244, 248, 0.3)')
  context.fillStyle = horizonGradient
  context.fillRect(0, size * 0.7, size, size * 0.3)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function Skybox({ qualityTier }: SkyboxProps) {
  const { isDayMode } = useCemeteryStore()
  const skyboxTexture = useMemo(() => createSkyboxTexture(), [])

  if (!isDayMode) return null

  return (
    <group>
      {/* Skybox sphere */}
      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial
          map={skyboxTexture}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}



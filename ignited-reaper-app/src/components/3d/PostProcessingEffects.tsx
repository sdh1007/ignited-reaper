'use client'

import { useMemo } from 'react'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface PostProcessingEffectsProps {
  qualityTier: 'high' | 'medium' | 'low'
}

function createVignetteTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null

  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null

  // Create vignette gradient
  const gradient = context.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)')

  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function PostProcessingEffects({ qualityTier }: PostProcessingEffectsProps) {
  const { isDayMode } = useCemeteryStore()
  const vignetteTexture = useMemo(() => createVignetteTexture(), [])

  if (!isDayMode) return null

  return (
    <group>
      {/* Vignette effect */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          map={vignetteTexture}
          transparent
          opacity={0.4}
          blending={THREE.MultiplyBlending}
        />
      </mesh>

      {/* Ambient occlusion around gravestones and trees */}
      {Array.from({ length: qualityTier === 'low' ? 10 : qualityTier === 'medium' ? 20 : 30 }).map((_, i) => (
        <mesh
          key={`ao-${i}`}
          position={[
            (Math.random() - 0.5) * 80,
            0.01,
            (Math.random() - 0.5) * 80
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.5 + Math.random() * 1}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.1}
            blending={THREE.MultiplyBlending}
          />
        </mesh>
      ))}

      {/* Subtle color grading overlay */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          color="#fff8dc"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}










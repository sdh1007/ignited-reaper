'use client'

import { useEffect, useMemo } from 'react'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

function useRadialTexture(innerAlpha: number, outerAlpha: number) {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const context = canvas.getContext('2d')
    if (!context) return null

    const gradient = context.createRadialGradient(size / 2, size / 2, size * 0.05, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, `rgba(255, 255, 255, ${innerAlpha})`)
    gradient.addColorStop(1, `rgba(255, 255, 255, ${outerAlpha})`)

    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)

    const canvasTexture = new THREE.CanvasTexture(canvas)
    canvasTexture.needsUpdate = true
    canvasTexture.colorSpace = THREE.SRGBColorSpace
    return canvasTexture
  }, [innerAlpha, outerAlpha])

  useEffect(() => {
    return () => {
      texture?.dispose()
    }
  }, [texture])

  return texture
}

interface GroundProps {
  qualityTier?: 'high' | 'medium' | 'low'
  stones: Array<{ position: [number, number]; color: string }>
}

export function Ground({ qualityTier = 'high', stones }: GroundProps) {
  const isDayMode = useCemeteryStore((state) => state.isDayMode)

  const glowTexture = useRadialTexture(isDayMode ? 0.35 : 0.55, 0.02)

  const glowAnchors = useMemo(() => {
    const limit = qualityTier === 'medium' ? 18 : qualityTier === 'low' ? 12 : 28
    return stones.slice(0, limit).map((stone, index) => ({
      position: stone.position,
      color: stone.color,
      radius: 1.6 + ((index % 5) * 0.25) + Math.abs(Math.sin(stone.position[0] * 0.2)) * 0.6,
    }))
  }, [stones, qualityTier])

  const groundColor = isDayMode ? '#27354a' : '#1a2332'
  const groundSpecular = isDayMode ? '#314563' : '#2a3441'

  const mistCounts = useMemo(() => ({
    day: qualityTier === 'medium' ? 7 : qualityTier === 'low' ? 5 : 10,
    night: qualityTier === 'medium' ? 12 : qualityTier === 'low' ? 8 : 18,
  }), [qualityTier])

  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color={groundColor}
          roughness={0.95}
          metalness={0.08}
          emissive={isDayMode ? '#162032' : '#1a2332'}
          emissiveIntensity={isDayMode ? 0.12 : 0.35}
        />
      </mesh>

      {/* Soft circular light falloff */}
      {glowTexture &&
        glowAnchors.map((anchor, index) => (
          <mesh
            key={`ground-glow-${index}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[anchor.position[0], 0.02, anchor.position[1]]}
            scale={anchor.radius}
          >
            <circleGeometry args={[1, 48]} />
            <meshBasicMaterial
              map={glowTexture}
              color={anchor.color}
              transparent
              opacity={isDayMode ? 0.18 : 0.45}
              depthWrite={false}
            />
          </mesh>
        ))}

      {/* Raised turf mounds beneath stones */}
      {glowAnchors.map((anchor, index) => (
        <mesh
          key={`mound-${index}`}
          rotation={[-Math.PI / 2, 0, (index % 2 === 0 ? 0.08 : -0.06)]}
          position={[anchor.position[0], 0.015, anchor.position[1]]}
        >
          <planeGeometry args={[anchor.radius * 1.6, anchor.radius * 0.9]} />
          <meshStandardMaterial
            color={isDayMode ? '#1c2433' : '#1a2332'}
            roughness={0.96}
            metalness={0.03}
          />
        </mesh>
      ))}

      {/* Central paths */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[2.2, 56]} />
        <meshStandardMaterial
          color={groundSpecular}
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.75}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[2.2, 32]} />
        <meshStandardMaterial
          color={groundSpecular}
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Wisps of ground mist */}
      {Array.from({ length: isDayMode ? mistCounts.day : mistCounts.night }).map((_, index) => (
        <mesh
          key={`ground-mist-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            -20 + (index % 6) * 8 + (index % 2 === 0 ? 2 : -2),
            0.015,
            -18 + Math.floor(index / 6) * 9,
          ]}
          scale={2.5 + (index % 5)}
        >
          <circleGeometry args={[1, 24]} />
          <meshBasicMaterial
            color={isDayMode ? 'rgba(223, 231, 242, 0.5)' : 'rgba(129, 140, 248, 0.3)'}
            transparent
            opacity={isDayMode ? 0.1 : 0.12}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

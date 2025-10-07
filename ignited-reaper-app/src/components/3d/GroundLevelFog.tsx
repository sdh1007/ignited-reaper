'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
// Removed Sphere import to avoid troika-three-text warnings
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface GroundLevelFogProps {
  qualityTier: 'high' | 'medium' | 'low'
}

interface FogPatch {
  position: [number, number, number]
  scale: number
  opacity: number
  speed: number
  phase: number
  height: number
}

export function GroundLevelFog({ qualityTier }: GroundLevelFogProps) {
  const { isDayMode } = useCemeteryStore()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const fogGroupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    handleChange()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  // Ground-level fog patches with depth responsiveness
  const fogPatches = useMemo<FogPatch[]>(() => {
    const patchCount = qualityTier === 'low' ? 12 : qualityTier === 'medium' ? 18 : 24
    const patches: FogPatch[] = []
    
    for (let i = 0; i < patchCount; i++) {
      const height = Math.random() * 2 + 0.5 // Ground level to 2.5 units high
      const density = Math.max(0.1, 1 - (height / 3)) // Denser at ground level
      
      patches.push({
        position: [
          (Math.random() - 0.5) * 80,
          height,
          (Math.random() - 0.5) * 80
        ],
        scale: 8 + Math.random() * 12,
        opacity: (0.015 + Math.random() * 0.025) * density, // Subtle opacity
        speed: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        height
      })
    }
    
    return patches
  }, [qualityTier])

  useFrame((state) => {
    if (fogGroupRef.current && !prefersReducedMotion) {
      fogGroupRef.current.children.forEach((mesh, i) => {
        const patch = fogPatches[i]
        const time = state.clock.elapsedTime * patch.speed + patch.phase

        // Gentle ground-level drift
        mesh.position.x = patch.position[0] + Math.sin(time * 0.7) * 2
        mesh.position.z = patch.position[2] + Math.cos(time * 0.5) * 1.5

        // Subtle opacity variation
        const material = (mesh as THREE.Mesh).material as THREE.MeshBasicMaterial
        material.opacity = patch.opacity + Math.sin(time * 1.2 + patch.phase) * 0.005
      })
    }
  })

  if (isDayMode) {
    // Lighter fog for day mode
    return (
      <group>
        {fogPatches.map((patch, index) => (
          <mesh
            key={`day-fog-${index}`}
            position={patch.position}
            scale={patch.scale}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
              color="#e2e8f0"
              transparent
              opacity={patch.opacity * 0.3}
              side={THREE.DoubleSide}
              blending={THREE.NormalBlending}
            />
          </mesh>
        ))}
      </group>
    )
  }

  return (
    <group>
      {/* Ground-level fog patches */}
      <group ref={fogGroupRef}>
        {fogPatches.map((patch, index) => (
          <mesh
            key={`fog-patch-${index}`}
            position={patch.position}
            scale={patch.scale}
          >
            <sphereGeometry args={[1, 20, 20]} />
            <meshBasicMaterial
              color="#94a3b8" // Blue-gray color
              transparent
              opacity={patch.opacity}
              side={THREE.DoubleSide}
              blending={THREE.NormalBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

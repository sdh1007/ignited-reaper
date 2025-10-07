'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface AtmosphericFogProps {
  qualityTier: 'high' | 'medium' | 'low'
}

export function AtmosphericFog({ qualityTier }: AtmosphericFogProps) {
  const { isDayMode } = useCemeteryStore()
  const fogGroupRef = useRef<THREE.Group>(null)

  // Fog density based on quality
  const fogDensity = useMemo(() => {
    if (isDayMode) return qualityTier === 'high' ? 6 : qualityTier === 'medium' ? 4 : 3
    return qualityTier === 'high' ? 12 : qualityTier === 'medium' ? 8 : 6
  }, [isDayMode, qualityTier])

  // Generate subtle fog patches
  const fogPatches = useMemo(() => {
    const patches = []
    for (let i = 0; i < fogDensity; i++) {
      patches.push({
        position: [
          (Math.random() - 0.5) * 60,
          Math.random() * 4 + 0.5,
          (Math.random() - 0.5) * 60
        ] as [number, number, number],
        scale: Math.random() * 6 + 4,
        opacity: Math.random() * 0.08 + 0.02, // Much reduced opacity
        speed: Math.random() * 0.2 + 0.05,
        phase: Math.random() * Math.PI * 2
      })
    }
    return patches
  }, [fogDensity])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Animate fog patches
    if (fogGroupRef.current) {
      fogGroupRef.current.children.forEach((fog, index) => {
        const patch = fogPatches[index]
        if (patch) {
          const mesh = fog as THREE.Mesh
          const material = mesh.material as THREE.MeshBasicMaterial
          
          // Gentle floating motion
          mesh.position.y = patch.position[1] + Math.sin(time * patch.speed + patch.phase) * 0.3
          mesh.position.x = patch.position[0] + Math.cos(time * patch.speed * 0.7 + patch.phase) * 0.2
          mesh.position.z = patch.position[2] + Math.sin(time * patch.speed * 0.5 + patch.phase) * 0.2
          
          // Subtle opacity pulsing
          material.opacity = patch.opacity + Math.sin(time * 1.5 + patch.phase) * 0.02
          
          // Slow rotation
          mesh.rotation.y = time * 0.05 + patch.phase
        }
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
            rotation={[0, 0, 0]}
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
      {/* Subtle blue-gray fog patches */}
      <group ref={fogGroupRef}>
        {fogPatches.map((patch, index) => (
          <mesh
            key={`fog-${index}`}
            position={patch.position}
            rotation={[0, 0, 0]}
            scale={patch.scale}
          >
            <sphereGeometry args={[1, 20, 20]} />
            <meshBasicMaterial
              color="#a0b0c8" // Lighter blue-gray for better visibility
              transparent
              opacity={patch.opacity}
              side={THREE.DoubleSide}
              blending={THREE.NormalBlending}
            />
          </mesh>
        ))}
      </group>

      {/* Subtle atmospheric haze */}
      <mesh position={[0, 8, 0]} scale={[80, 15, 80]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#64748b"
          transparent
          opacity={0.015}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface VolumetricFogProps {
  qualityTier: 'high' | 'medium' | 'low'
}

export function VolumetricFog({ qualityTier }: VolumetricFogProps) {
  const { isDayMode } = useCemeteryStore()
  const fogGroupRef = useRef<THREE.Group>(null)
  const mistGroupRef = useRef<THREE.Group>(null)

  // Fog density based on quality
  const fogDensity = useMemo(() => {
    if (isDayMode) return qualityTier === 'high' ? 8 : qualityTier === 'medium' ? 6 : 4
    return qualityTier === 'high' ? 15 : qualityTier === 'medium' ? 12 : 8
  }, [isDayMode, qualityTier])

  // Ground mist density
  const mistDensity = useMemo(() => {
    if (isDayMode) return qualityTier === 'high' ? 12 : qualityTier === 'medium' ? 8 : 6
    return qualityTier === 'high' ? 20 : qualityTier === 'medium' ? 15 : 10
  }, [isDayMode, qualityTier])

  // Generate fog patches
  const fogPatches = useMemo(() => {
    const patches = []
    for (let i = 0; i < fogDensity; i++) {
      patches.push({
        position: [
          (Math.random() - 0.5) * 80,
          Math.random() * 8 + 2,
          (Math.random() - 0.5) * 80
        ] as [number, number, number],
        scale: Math.random() * 12 + 8,
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2
      })
    }
    return patches
  }, [fogDensity])

  // Generate ground mist
  const mistPatches = useMemo(() => {
    const patches = []
    for (let i = 0; i < mistDensity; i++) {
      patches.push({
        position: [
          (Math.random() - 0.5) * 100,
          0.1 + Math.random() * 0.5,
          (Math.random() - 0.5) * 100
        ] as [number, number, number],
        scale: Math.random() * 15 + 10,
        opacity: Math.random() * 0.2 + 0.05,
        speed: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2
      })
    }
    return patches
  }, [mistDensity])

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
          mesh.position.y = patch.position[1] + Math.sin(time * patch.speed + patch.phase) * 0.5
          mesh.position.x = patch.position[0] + Math.cos(time * patch.speed * 0.7 + patch.phase) * 0.3
          mesh.position.z = patch.position[2] + Math.sin(time * patch.speed * 0.5 + patch.phase) * 0.3
          
          // Opacity pulsing
          material.opacity = patch.opacity + Math.sin(time * 2 + patch.phase) * 0.05
          
          // Rotation
          mesh.rotation.y = time * 0.1 + patch.phase
        }
      })
    }

    // Animate ground mist
    if (mistGroupRef.current) {
      mistGroupRef.current.children.forEach((mist, index) => {
        const patch = mistPatches[index]
        if (patch) {
          const mesh = mist as THREE.Mesh
          const material = mesh.material as THREE.MeshBasicMaterial
          
          // Slow drifting motion
          mesh.position.x = patch.position[0] + Math.sin(time * patch.speed + patch.phase) * 2
          mesh.position.z = patch.position[2] + Math.cos(time * patch.speed * 0.8 + patch.phase) * 1.5
          
          // Opacity variation
          material.opacity = patch.opacity + Math.sin(time * 1.5 + patch.phase) * 0.03
          
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
              opacity={patch.opacity * 0.5}
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
      {/* Volumetric fog patches */}
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
              color="#a0aec0"
              transparent
              opacity={patch.opacity}
              side={THREE.DoubleSide}
              blending={THREE.NormalBlending}
            />
          </mesh>
        ))}
      </group>

      {/* Ground mist */}
      <group ref={mistGroupRef}>
        {mistPatches.map((patch, index) => (
          <mesh
            key={`mist-${index}`}
            position={patch.position}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={patch.scale}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color="#94a3b8"
              transparent
              opacity={patch.opacity}
              side={THREE.DoubleSide}
              blending={THREE.NormalBlending}
            />
          </mesh>
        ))}
      </group>

      {/* Atmospheric haze */}
      <mesh position={[0, 5, 0]} scale={[100, 20, 100]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#64748b"
          transparent
          opacity={0.02}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}










'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import type { SocialProfile } from '@/lib/types'
import * as THREE from 'three'

interface RealisticGravestonesProps {
  profile: SocialProfile
  position: [number, number, number]
  qualityTier?: 'high' | 'medium' | 'low'
}

interface GravestoneConfig {
  type: 'tablet' | 'cross' | 'obelisk' | 'slab' | 'celtic_cross' | 'rounded' | 'gothic' | 'modern'
  width: number
  height: number
  depth: number
  tilt: number
  weathering: number
  material: {
    color: string
    roughness: number
    metalness: number
    emissive: string
    emissiveIntensity: number
  }
  hasMoss: boolean
  hasCracks: boolean
  hasStains: boolean
}

export function RealisticGravestones({ profile, position, qualityTier = 'high' }: RealisticGravestonesProps) {
  const { isDayMode, setSelectedProfile } = useCemeteryStore()
  const [hovered, setHovered] = useState(false)
  const gravestoneRef = useRef<THREE.Group>(null)

  // Enhanced realistic configuration based on profile ID
  const config = useMemo<GravestoneConfig>(() => {
    // Safety check for profile
    if (!profile) {
      console.warn('RealisticGravestones: profile is undefined')
      return {
        type: 'tablet',
        height: 1.2,
        width: 0.8,
        depth: 0.15,
        tilt: 0,
        weathering: 0.3,
        material: {
          color: '#6b7280',
          roughness: 0.8,
          metalness: 0.1,
          emissive: '#000000',
          emissiveIntensity: 0
        },
        hasMoss: false,
        hasCracks: false,
        hasStains: false
      }
    }

    // Safety check for profile.color
    if (!profile.color) {
      console.warn('RealisticGravestones: profile.color is undefined for profile:', profile.id)
    }
    const seed = profile.id.charCodeAt(0) + profile.id.charCodeAt(1)
    const rng = (index: number) => {
      const x = Math.sin(seed + index) * 10000
      return x - Math.floor(x)
    }

    const types: GravestoneConfig['type'][] = [
      'tablet', 'cross', 'obelisk', 'slab', 'celtic_cross', 'rounded', 'gothic', 'modern'
    ]
    const type = types[Math.floor(rng(0) * types.length)] || types[0]

    // Realistic stone materials with more variation
    const stoneTypes = [
      { color: '#9a9a9a', roughness: 0.92, metalness: 0.03 }, // Dark granite
      { color: '#b8b8b8', roughness: 0.85, metalness: 0.05 }, // Light granite
      { color: '#d5d5d5', roughness: 0.78, metalness: 0.08 }, // Polished marble
      { color: '#c8c8b8', roughness: 0.88, metalness: 0.04 }, // Weathered marble
      { color: '#bab0a0', roughness: 0.96, metalness: 0.01 }, // Limestone
      { color: '#a8a090', roughness: 0.94, metalness: 0.02 }, // Sandstone
      { color: '#888888', roughness: 0.90, metalness: 0.04 }, // Slate
    ]
    const stoneIndex = Math.floor(rng(1) * stoneTypes.length)
    const stone = stoneTypes[stoneIndex] || stoneTypes[0]
    
    return {
      type,
      width: 0.9 + rng(2) * 0.6,
      height: 1.6 + rng(3) * 1.2,
      depth: 0.18 + rng(4) * 0.12,
      tilt: (rng(5) - 0.5) * 0.18, // Increased tilt variation
      weathering: rng(6),
      material: {
        color: stone?.color || '#a8a8a8',
        roughness: stone?.roughness || 0.9,
        metalness: stone?.metalness || 0.02,
        emissive: '#000000',
        emissiveIntensity: 0
      },
      hasMoss: rng(7) > 0.6, // Increased probability
      hasCracks: rng(8) > 0.5, // Increased probability
      hasStains: rng(9) > 0.4 // Increased probability
    }
  }, [profile])

  // Create realistic gravestone geometry
  const createGravestoneGeometry = () => {
    const { type, width, height, depth } = config

    switch (type) {
      case 'cross':
        return (
          <group>
            <mesh position={[0, height * 0.5, 0]}>
              <boxGeometry args={[width * 0.2, height, depth]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
            <mesh position={[0, height * 0.7, 0]}>
              <boxGeometry args={[width, height * 0.3, depth]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
          </group>
        )
      
      case 'celtic_cross':
        return (
          <group>
            <mesh position={[0, height * 0.5, 0]}>
              <boxGeometry args={[width * 0.2, height, depth]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
            <mesh position={[0, height * 0.7, 0]}>
              <boxGeometry args={[width, height * 0.3, depth]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
            <mesh position={[0, height * 0.7, 0]}>
              <cylinderGeometry args={[width * 0.15, width * 0.15, depth * 0.5, 16]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
          </group>
        )
      
      case 'obelisk':
        return (
          <group>
            <mesh position={[0, height * 0.2, 0]}>
              <boxGeometry args={[width * 0.9, height * 0.4, depth * 0.9]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
            <mesh position={[0, height * 0.6, 0]}>
              <boxGeometry args={[width * 0.6, height * 0.4, depth * 0.6]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
            <mesh position={[0, height * 0.9, 0]}>
              <coneGeometry args={[width * 0.3, height * 0.2, 4]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
          </group>
        )
      
      case 'rounded':
        return (
          <mesh position={[0, height * 0.5, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial {...config.material} />
          </mesh>
        )
      
      case 'gothic':
        return (
          <group>
            <mesh position={[0, height * 0.4, 0]}>
              <boxGeometry args={[width, height * 0.8, depth]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
            <mesh position={[0, height * 0.9, 0]}>
              <coneGeometry args={[width * 0.6, height * 0.2, 4]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
          </group>
        )
      
      case 'modern':
        return (
          <mesh position={[0, height * 0.5, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial {...config.material} />
          </mesh>
        )
      
      default: // tablet
        return (
          <mesh position={[0, height * 0.5, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial {...config.material} />
          </mesh>
        )
    }
  }

  // Enhanced weathering effects with more detail
  const addWeatheringEffects = () => {
    const { width, height, depth } = config
    const effects = []
    const seed = profile.id.charCodeAt(0)
    const effectRng = (index: number) => {
      const x = Math.sin(seed + index) * 10000
      return x - Math.floor(x)
    }

    // Multiple moss patches with varied colors and positions
    if (config.hasMoss) {
      const mossCount = 2 + Math.floor(effectRng(1) * 3)
      for (let i = 0; i < mossCount; i++) {
        const mossColors = ['#3d4f1a', '#4a5d23', '#556b2c', '#4d5f28']
        effects.push(
          <mesh 
            key={`moss-${i}`}
            position={[
              (effectRng(i * 2) - 0.5) * width * 0.85,
              height * (0.15 + effectRng(i * 2 + 1) * 0.5),
              depth / 2 + 0.01
            ]}
            rotation={[0, 0, effectRng(i * 3) * Math.PI * 2]}
            scale={0.25 + effectRng(i * 4) * 0.5}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial 
              color={mossColors[Math.floor(effectRng(i * 5) * mossColors.length)]}
              transparent 
              opacity={0.6 + effectRng(i * 6) * 0.25} 
              side={THREE.DoubleSide}
              roughness={0.95}
            />
          </mesh>
        )
      }
    }

    // Multiple realistic cracks with varied sizes
    if (config.hasCracks) {
      const crackCount = 1 + Math.floor(effectRng(10) * 3)
      for (let i = 0; i < crackCount; i++) {
        effects.push(
          <mesh 
            key={`crack-${i}`}
            position={[
              (effectRng(i * 7) - 0.5) * width * 0.7,
              height * (0.3 + effectRng(i * 8) * 0.4),
              depth / 2 + 0.001
            ]}
            rotation={[0, 0, (effectRng(i * 9) - 0.5) * 0.6]}
          >
            <boxGeometry args={[
              width * (0.4 + effectRng(i * 10) * 0.5),
              0.015 + effectRng(i * 11) * 0.015,
              0.008
            ]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              roughness={1} 
              metalness={0}
              emissive="#000000"
            />
          </mesh>
        )
      }
    }

    // Multiple weather stains with varied colors
    if (config.hasStains) {
      const stainCount = 2 + Math.floor(effectRng(20) * 4)
      const stainColors = ['#8b7355', '#6b5d45', '#9a8b7a', '#7a6d55']
      for (let i = 0; i < stainCount; i++) {
        effects.push(
          <mesh 
            key={`stain-${i}`}
            position={[
              (effectRng(i * 12) - 0.5) * width * 0.8,
              height * (0.2 + effectRng(i * 13) * 0.6),
              depth / 2 + 0.001
            ]}
            rotation={[0, 0, effectRng(i * 14) * Math.PI * 2]}
            scale={0.15 + effectRng(i * 15) * 0.35}
          >
            <planeGeometry args={[1, 1.2]} />
            <meshStandardMaterial 
              color={stainColors[Math.floor(effectRng(i * 16) * stainColors.length)]}
              transparent 
              opacity={0.25 + effectRng(i * 17) * 0.25} 
              side={THREE.DoubleSide}
              roughness={0.9}
            />
          </mesh>
        )
      }
    }

    // Add subtle engravings/inscriptions effect
    effects.push(
      <mesh 
        key="inscription-area"
        position={[0, height * 0.6, depth / 2 + 0.005]}
        rotation={[0, 0, 0]}
        scale={0.8}
      >
        <planeGeometry args={[width * 0.7, height * 0.3]} />
        <meshStandardMaterial 
          color="#3a3a3a"
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide}
          roughness={0.6}
        />
      </mesh>
    )

    return effects
  }

  const handleClick = () => {
    setSelectedProfile(profile)
  }

  // Safety check for profile
  if (!profile) {
    return null
  }

  return (
    <group
      ref={gravestoneRef}
      position={[position[0], position[1] + 0.05, position[2]]}
      rotation={[0, 0, config.tilt]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Base plinth */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[config.width + 0.2, 0.2, config.depth + 0.2]} />
        <meshStandardMaterial
          color="#8b7355"
          roughness={0.95}
          metalness={0.01}
        />
      </mesh>

      {/* Gravestone */}
      {createGravestoneGeometry()}

      {/* Weathering effects */}
      {addWeatheringEffects()}

      {/* Subtle glow effect */}
      <mesh position={[0, config.height * 0.5, 0]}>
        <sphereGeometry args={[config.width * 0.8]} />
        <meshBasicMaterial
          color={profile.color || '#8b7355'}
          transparent
          opacity={hovered ? 0.1 : 0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

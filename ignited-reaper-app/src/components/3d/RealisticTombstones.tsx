'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import type { SocialProfile } from '@/lib/types'
import * as THREE from 'three'

interface RealisticTombstonesProps {
  profile: SocialProfile
  position: [number, number, number]
  qualityTier?: 'high' | 'medium' | 'low'
}

type TombstoneType = 'tablet' | 'cross' | 'obelisk' | 'slab' | 'angel' | 'broken' | 'weathered' | 'tilted' | 'partially_buried' | 'cracked' | 'mossy' | 'gothic_arch'

interface TombstoneVariation {
  type: TombstoneType
  width: number
  height: number
  depth: number
  tilt: number
  weathering: number
  cracks: number
}

export function RealisticTombstones({ profile, position, qualityTier = 'high' }: RealisticTombstonesProps) {
  const { isDayMode, setSelectedProfile } = useCemeteryStore()
  const [hovered, setHovered] = useState(false)
  const tombstoneRef = useRef<THREE.Group>(null)
  const candleRef = useRef<THREE.PointLight>(null)

  // Generate tombstone variation based on profile
  const variation = useMemo<TombstoneVariation>(() => {
    const seed = profile.id.charCodeAt(0) + profile.id.charCodeAt(1)
    const rng = (index: number) => {
      const x = Math.sin(seed + index) * 10000
      return x - Math.floor(x)
    }

    const types: TombstoneType[] = ['tablet', 'cross', 'obelisk', 'slab', 'angel', 'broken', 'weathered', 'tilted', 'partially_buried', 'cracked', 'mossy', 'gothic_arch']
    const type = types[Math.floor(rng(0) * types.length)]

    return {
      type,
      width: 0.8 + rng(1) * 0.4,
      height: 1.5 + rng(2) * 1.0,
      depth: 0.15 + rng(3) * 0.1,
      tilt: (rng(4) - 0.5) * 0.25, // Increased tilt range for more variety
      weathering: rng(5),
      cracks: Math.floor(rng(6) * 5) // More cracks for weathering variety
    }
  }, [profile.id])

  // Create tombstone geometry based on type
  const createTombstoneGeometry = () => {
    const { type, width, height, depth } = variation

    switch (type) {
      case 'cross':
        return (
          <group>
            {/* Vertical post */}
            <mesh position={[0, height * 0.3, 0]}>
              <boxGeometry args={[width * 0.2, height * 0.6, depth]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            {/* Horizontal beam */}
            <mesh position={[0, height * 0.6, 0]}>
              <boxGeometry args={[width * 0.6, height * 0.2, depth]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
          </group>
        )

      case 'obelisk':
        return (
          <group>
            {/* Base */}
            <mesh position={[0, height * 0.1, 0]}>
              <boxGeometry args={[width * 0.8, height * 0.2, depth * 0.8]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            {/* Middle */}
            <mesh position={[0, height * 0.4, 0]}>
              <boxGeometry args={[width * 0.6, height * 0.4, depth * 0.6]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            {/* Top */}
            <mesh position={[0, height * 0.8, 0]}>
              <coneGeometry args={[width * 0.3, height * 0.4, 8]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
          </group>
        )

      case 'slab':
        return (
          <mesh position={[0, height * 0.5, 0]}>
            <boxGeometry args={[width, height, depth * 0.5]} />
            <meshStandardMaterial
              color={isDayMode ? '#a0a0a0' : '#4a5568'}
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>
        )

      case 'angel':
        return (
          <group>
            {/* Base */}
            <mesh position={[0, height * 0.1, 0]}>
              <boxGeometry args={[width * 0.8, height * 0.2, depth * 0.8]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            {/* Body */}
            <mesh position={[0, height * 0.4, 0]}>
              <boxGeometry args={[width * 0.4, height * 0.6, depth * 0.4]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            {/* Wings */}
            <mesh position={[-width * 0.3, height * 0.6, 0]} rotation={[0, 0, Math.PI / 6]}>
              <boxGeometry args={[width * 0.3, height * 0.4, depth * 0.1]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            <mesh position={[width * 0.3, height * 0.6, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <boxGeometry args={[width * 0.3, height * 0.4, depth * 0.1]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
          </group>
        )

      case 'broken':
        return (
          <group>
            {/* Broken base */}
            <mesh position={[0, height * 0.2, 0]}>
              <boxGeometry args={[width * 0.8, height * 0.4, depth]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            {/* Broken top piece */}
            <mesh position={[width * 0.1, height * 0.6, -depth * 0.2]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[width * 0.6, height * 0.3, depth * 0.8]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
          </group>
        )

      case 'weathered':
        return (
          <mesh position={[0, height * 0.5, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={isDayMode ? '#9ca3af' : '#374151'}
              roughness={0.95}
              metalness={0.02}
            />
          </mesh>
        )
      case 'tilted':
        return (
          <mesh position={[0, height * 0.5, 0]} rotation={[0, 0, variation.tilt * 2]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={isDayMode ? '#a0a0a0' : '#4a5568'}
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>
        )
      case 'partially_buried':
        return (
          <mesh position={[0, height * 0.3, 0]}>
            <boxGeometry args={[width, height * 0.7, depth]} />
            <meshStandardMaterial
              color={isDayMode ? '#a0a0a0' : '#4a5568'}
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>
        )
      case 'cracked':
        return (
          <group>
            <mesh position={[0, height * 0.5, 0]}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            {/* Crack lines */}
            {Array.from({ length: variation.cracks }).map((_, i) => (
              <mesh key={`crack-${i}`} position={[0, height * 0.5, depth / 2 + 0.001]}>
                <boxGeometry args={[width * 0.8, 0.02, 0.01]} />
                <meshStandardMaterial color="#1f2937" roughness={1} metalness={0} />
              </mesh>
            ))}
          </group>
        )
      case 'mossy':
        return (
          <group>
            <mesh position={[0, height * 0.5, 0]}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            {/* Moss patches */}
            {Array.from({ length: 3 }).map((_, i) => (
              <mesh 
                key={`moss-${i}`} 
                position={[
                  (Math.random() - 0.5) * width * 0.8,
                  height * 0.3 + Math.random() * height * 0.4,
                  depth / 2 + 0.01
                ]}
                rotation={[0, 0, Math.random() * Math.PI * 2]}
                scale={0.3 + Math.random() * 0.4}
              >
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial 
                  color={isDayMode ? '#4a5d23' : '#2d3a14'} 
                  transparent 
                  opacity={0.7} 
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
          </group>
        )
      case 'gothic_arch':
        return (
          <group>
            <mesh position={[0, height * 0.4, 0]}>
              <boxGeometry args={[width, height * 0.8, depth]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            <mesh position={[0, height * 0.9, 0]}>
              <coneGeometry args={[width * 0.6, height * 0.2, 4]} />
              <meshStandardMaterial
                color={isDayMode ? '#a0a0a0' : '#4a5568'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
          </group>
        )
      default: // tablet
        return (
          <mesh position={[0, height * 0.5, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={isDayMode ? '#a0a0a0' : '#4a5568'}
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>
        )
    }
  }

  // Add weathering effects
  const addWeathering = () => {
    if (variation.weathering < 0.3) return null

    return (
      <group>
        {/* Moss patches */}
        {Array.from({ length: Math.floor(variation.weathering * 3) }).map((_, i) => (
          <mesh
            key={`moss-${i}`}
            position={[
              (Math.random() - 0.5) * variation.width * 0.8,
              Math.random() * variation.height * 0.6 + variation.height * 0.2,
              variation.depth / 2 + 0.01
            ]}
            rotation={[0, 0, Math.random() * Math.PI * 2]}
            scale={Math.random() * 0.3 + 0.2}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={isDayMode ? '#4a5d23' : '#2d3a14'}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Cracks */}
        {Array.from({ length: variation.cracks }).map((_, i) => (
          <mesh
            key={`crack-${i}`}
            position={[
              (Math.random() - 0.5) * variation.width * 0.6,
              Math.random() * variation.height * 0.8 + variation.height * 0.1,
              variation.depth / 2 + 0.005
            ]}
            rotation={[0, 0, Math.random() * Math.PI * 0.5]}
          >
            <planeGeometry args={[0.02, Math.random() * 0.3 + 0.1]} />
            <meshStandardMaterial
              color={isDayMode ? '#374151' : '#1f2937'}
              roughness={1}
              metalness={0}
            />
          </mesh>
        ))}
      </group>
    )
  }

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Subtle floating animation
    if (tombstoneRef.current) {
      const float = Math.sin(time * 0.3 + position[0]) * 0.02
      tombstoneRef.current.position.y = position[1] + float + (hovered ? 0.05 : 0)
      tombstoneRef.current.rotation.z = variation.tilt + Math.sin(time * 0.1 + position[0]) * 0.01
    }

    // Candle flickering
    if (candleRef.current && !isDayMode) {
      const flicker = 1 + Math.sin(time * 8 + position[0]) * 0.2
      candleRef.current.intensity = 0.6 * flicker
    }
  })

  const handleClick = () => {
    setSelectedProfile(profile)
  }

  return (
    <group
      ref={tombstoneRef}
      position={[position[0], position[1] + 0.05, position[2]]} // Ensure proper grounding
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Tombstone */}
      {createTombstoneGeometry()}

      {/* Weathering effects */}
      {addWeathering()}

      {/* Candle for accent lighting */}
      {!isDayMode && (
        <group position={[0, 0.1, variation.depth / 2 + 0.3]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
            <meshStandardMaterial
              color={isDayMode ? '#d8dde8' : '#6a7480'}
              roughness={0.9}
              metalness={0.02}
            />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <coneGeometry args={[0.06, 0.15, 8]} />
            <meshBasicMaterial
              color="#ff6b35"
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <pointLight
            ref={candleRef}
            position={[0, 0.4, 0]}
            color="#ff6b35"
            intensity={0.8}
            distance={8}
            decay={2}
          />
        </group>
      )}

      {/* Glow effect */}
      <mesh position={[0, variation.height * 0.5, 0]}>
        <sphereGeometry args={[variation.width * 0.8]} />
        <meshBasicMaterial
          color={profile.color}
          transparent
          opacity={hovered ? 0.2 : 0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

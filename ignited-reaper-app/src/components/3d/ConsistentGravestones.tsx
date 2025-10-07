'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import type { SocialProfile } from '@/lib/types'
import * as THREE from 'three'

interface ConsistentGravestonesProps {
  profile: SocialProfile
  position: [number, number, number]
  qualityTier?: 'high' | 'medium' | 'low'
}

interface GravestoneConfig {
  type: 'tablet' | 'cross' | 'obelisk' | 'slab' | 'angel' | 'broken' | 'weathered' | 'tilted' | 'partially_buried' | 'cracked' | 'mossy' | 'gothic_arch'
  width: number
  height: number
  depth: number
  tilt: number
  weathering: number
  cracks: number
  baseHeight: number
  material: {
    color: string
    roughness: number
    metalness: number
    emissive: string
    emissiveIntensity: number
  }
}

export function ConsistentGravestones({ profile, position, qualityTier = 'high' }: ConsistentGravestonesProps) {
  const { isDayMode, setSelectedProfile } = useCemeteryStore()
  const [hovered, setHovered] = useState(false)
  const gravestoneRef = useRef<THREE.Group>(null)
  const candleRef = useRef<THREE.PointLight>(null)

  // Consistent configuration based on profile ID
  const config = useMemo<GravestoneConfig>(() => {
    const seed = profile.id.charCodeAt(0) + profile.id.charCodeAt(1)
    const rng = (index: number) => {
      const x = Math.sin(seed + index) * 10000
      return x - Math.floor(x)
    }

    const types: GravestoneConfig['type'][] = [
      'tablet', 'cross', 'obelisk', 'slab', 'angel', 'broken', 
      'weathered', 'tilted', 'partially_buried', 'cracked', 'mossy', 'gothic_arch'
    ]
    const type = types[Math.floor(rng(0) * types.length)]

    // Consistent material properties
    const baseColor = isDayMode ? '#a8b2c1' : '#3a4558'
    const emissiveColor = isDayMode ? '#0f1419' : '#05080c'
    
    return {
      type,
      width: 0.8 + rng(1) * 0.4,
      height: 1.5 + rng(2) * 1.0,
      depth: 0.15 + rng(3) * 0.1,
      tilt: (rng(4) - 0.5) * 0.25,
      weathering: rng(5),
      cracks: Math.floor(rng(6) * 5),
      baseHeight: 0.2 + rng(7) * 0.1,
      material: {
        color: baseColor,
        roughness: 0.9,
        metalness: 0.05,
        emissive: emissiveColor,
        emissiveIntensity: hovered ? 0.12 : 0.06
      }
    }
  }, [profile.id, isDayMode, hovered])

  // Consistent geometry creation
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
      
      case 'angel':
        return (
          <group>
            <mesh position={[0, height * 0.3, 0]}>
              <boxGeometry args={[width, height * 0.6, depth]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
            <mesh position={[0, height * 0.8, 0]}>
              <sphereGeometry args={[width * 0.3, 16, 16]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
          </group>
        )
      
      case 'broken':
        return (
          <group>
            <mesh position={[0, height * 0.2, 0]}>
              <boxGeometry args={[width * 0.8, height * 0.4, depth]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
            <mesh position={[width * 0.1, height * 0.6, -depth * 0.2]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[width * 0.6, height * 0.3, depth * 0.8]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
          </group>
        )
      
      case 'weathered':
        return (
          <mesh position={[0, height * 0.5, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial 
              {...config.material}
              color={isDayMode ? '#9ca3af' : '#374151'}
              roughness={0.95}
              metalness={0.02}
            />
          </mesh>
        )
      
      case 'tilted':
        return (
          <mesh position={[0, height * 0.5, 0]} rotation={[0, 0, config.tilt * 2]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial {...config.material} />
          </mesh>
        )
      
      case 'partially_buried':
        return (
          <mesh position={[0, height * 0.3, 0]}>
            <boxGeometry args={[width, height * 0.7, depth]} />
            <meshStandardMaterial {...config.material} />
          </mesh>
        )
      
      case 'cracked':
        return (
          <group>
            <mesh position={[0, height * 0.5, 0]}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
            {Array.from({ length: config.cracks }).map((_, i) => (
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
              <meshStandardMaterial {...config.material} />
            </mesh>
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
              <meshStandardMaterial {...config.material} />
            </mesh>
            <mesh position={[0, height * 0.9, 0]}>
              <coneGeometry args={[width * 0.6, height * 0.2, 4]} />
              <meshStandardMaterial {...config.material} />
            </mesh>
          </group>
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

  // Consistent candle animation
  useFrame((state) => {
    if (candleRef.current && !isDayMode) {
      const time = state.clock.elapsedTime
      const flicker = 1 + Math.sin(time * 8 + position[0]) * 0.2
      candleRef.current.intensity = 0.8 * flicker
    }
  })

  const handleClick = () => {
    setSelectedProfile(profile)
  }

  return (
    <group
      ref={gravestoneRef}
      position={[position[0], position[1] + 0.05, position[2]]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Base plinth */}
      <mesh position={[0, config.baseHeight / 2, 0]}>
        <boxGeometry args={[config.width + 0.2, config.baseHeight, config.depth + 0.2]} />
        <meshStandardMaterial
          color={isDayMode ? '#5a6878' : '#0f1419'}
          roughness={0.98}
          metalness={0.01}
        />
      </mesh>

      {/* Gravestone */}
      {createGravestoneGeometry()}

      {/* Consistent candle lighting */}
      {!isDayMode && (
        <group position={[0, config.baseHeight, config.depth / 2 + 0.3]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
            <meshStandardMaterial
              color={isDayMode ? '#c8d0e0' : '#6a7480'}
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
            distance={6}
            decay={2}
          />
        </group>
      )}

      {/* Consistent glow effect */}
      <mesh position={[0, config.height * 0.5, 0]}>
        <sphereGeometry args={[config.width * 0.8]} />
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










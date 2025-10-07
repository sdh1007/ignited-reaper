'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface CinematicLightingProps {
  qualityTier: 'high' | 'medium' | 'low'
}

export function CinematicLighting({ qualityTier }: CinematicLightingProps) {
  const { isDayMode } = useCemeteryStore()
  const moonRef = useRef<THREE.Mesh>(null)
  const moonLightRef = useRef<THREE.DirectionalLight>(null)
  const candleLightsRef = useRef<THREE.PointLight[]>([])

  const isLow = qualityTier === 'low'
  const isMedium = qualityTier === 'medium'

  // Moon configuration
  const moonConfig = useMemo(() => ({
    position: [25, 35, -30] as [number, number, number],
    size: isLow ? 3.5 : isMedium ? 4 : 4.5,
    lightIntensity: isDayMode ? 0 : 1.4,
    lightColor: '#b8c5d1', // Cool blue-white moonlight
    shadowMapSize: isLow ? 1024 : isMedium ? 1536 : 2048
  }), [isDayMode, isLow, isMedium])

  // Strategic candle positions for warm lighting
  const candlePositions = useMemo(() => [
    [-8, 0.5, -6], [4, 0.5, -8], [0, 0.5, -10], [8, 0.5, -6],
    [-6, 0.5, -2], [-2, 0.5, -4], [2, 0.5, -4], [6, 0.5, -2],
    [-8, 0.5, 2], [-4, 0.5, 4], [0, 0.5, 6], [4, 0.5, 4], [8, 0.5, 2],
    [-12, 0.5, -12], [12, 0.5, -12], [-10, 0.5, 10], [10, 0.5, 10],
    [-14, 0.5, 6], [14, 0.5, 6], [-6, 0.5, 18], [6, 0.5, 18],
    [-16, 0.5, -2], [16, 0.5, -2]
  ], [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Subtle moon movement
    if (moonRef.current && !isDayMode) {
      const sway = Math.sin(time * 0.05) * 0.3
      moonRef.current.position.x = moonConfig.position[0] + sway
      moonRef.current.position.z = moonConfig.position[2] + sway * 0.5
    }

    // Moonlight intensity variation
    if (moonLightRef.current && !isDayMode) {
      const intensityVariation = 1 + Math.sin(time * 0.1) * 0.05
      moonLightRef.current.intensity = moonConfig.lightIntensity * intensityVariation
    }

    // Candle flickering
    candleLightsRef.current.forEach((light, index) => {
      if (light && !isDayMode) {
        const flicker = 1 + Math.sin(time * 8 + index * 0.5) * 0.3
        light.intensity = 0.8 * flicker
      }
    })
  })

  return (
    <group>
      {/* Large Moon in Sky */}
      {!isDayMode && (
        <mesh ref={moonRef} position={moonConfig.position}>
          <sphereGeometry args={[moonConfig.size, 32, 32]} />
          <meshStandardMaterial
            color="#e2e8f0"
            emissive="#f1f5f9"
            emissiveIntensity={0.4}
          />
        </mesh>
      )}

      {/* Primary Moonlight */}
      <directionalLight
        ref={moonLightRef}
        position={[moonConfig.position[0], moonConfig.position[1], moonConfig.position[2]]}
        intensity={moonConfig.lightIntensity}
        color={moonConfig.lightColor}
        castShadow
        shadow-mapSize-width={moonConfig.shadowMapSize}
        shadow-mapSize-height={moonConfig.shadowMapSize}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      {/* Ambient fill light for visibility */}
      <ambientLight 
        intensity={isDayMode ? 0.4 : 0.2} 
        color={isDayMode ? '#f8fafc' : '#3a4451'} 
      />

      {/* Hemisphere light for natural outdoor lighting */}
      <hemisphereLight
        args={[
          isDayMode ? '#87ceeb' : '#4a5568', // Sky color
          isDayMode ? '#8fbc8f' : '#1a202c', // Ground color
          isDayMode ? 0.6 : 0.35
        ]}
      />

      {/* Strategic candle lights for warm contrast */}
      {candlePositions.map((position, index) => (
        <pointLight
          key={`candle-${index}`}
          ref={(light) => {
            if (light) candleLightsRef.current[index] = light
          }}
          position={position as [number, number, number]}
          color="#ff6b35"
          intensity={isDayMode ? 0.1 : 0.8}
          distance={6}
          decay={2}
        />
      ))}

      {/* Additional atmospheric lighting */}
      <pointLight position={[0, 8, 0]} intensity={0.4} color="#f0f4f8" distance={30} decay={2} />
      <pointLight position={[-20, 6, -20]} intensity={0.3} color="#e2e8f0" distance={25} decay={2.5} />
      <pointLight position={[20, 6, 20]} intensity={0.3} color="#e2e8f0" distance={25} decay={2.5} />
    </group>
  )
}










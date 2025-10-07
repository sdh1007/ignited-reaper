'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface MoonLightingProps {
  qualityTier: 'high' | 'medium' | 'low'
}

export function MoonLighting({ qualityTier }: MoonLightingProps) {
  const { isDayMode } = useCemeteryStore()
  const moonRef = useRef<THREE.Mesh>(null)
  const moonLightRef = useRef<THREE.DirectionalLight>(null)

  // Moon configuration
  const moonConfig = useMemo(() => ({
    position: [25, 35, -30] as [number, number, number],
    size: qualityTier === 'high' ? 3.5 : qualityTier === 'medium' ? 3 : 2.5,
    lightIntensity: isDayMode ? 0 : 1.2,
    lightColor: '#b8c5d1', // Cool blue-white moonlight
    shadowMapSize: qualityTier === 'high' ? 2048 : qualityTier === 'medium' ? 1536 : 1024
  }), [isDayMode, qualityTier])

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
  })

  return (
    <group>
      {/* Large Moon in Sky */}
      {!isDayMode && (
        <mesh ref={moonRef} position={moonConfig.position}>
          <sphereGeometry args={[moonConfig.size, 32, 32]} />
          <meshBasicMaterial
            color="#e2e8f0"
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
        intensity={isDayMode ? 0.4 : 0.18} 
        color={isDayMode ? '#f8fafc' : '#3a4451'} 
      />

      {/* Hemisphere light for natural outdoor lighting */}
      <hemisphereLight
        args={[
          isDayMode ? '#87ceeb' : '#4a5568', // Sky color
          isDayMode ? '#8fbc8f' : '#1a202c', // Ground color
          isDayMode ? 0.6 : 0.3
        ]}
      />
    </group>
  )
}

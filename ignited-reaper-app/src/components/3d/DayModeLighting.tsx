'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface DayModeLightingProps {
  qualityTier: 'high' | 'medium' | 'low'
}

export function DayModeLighting({ qualityTier }: DayModeLightingProps) {
  const { isDayMode } = useCemeteryStore()
  const sunRef = useRef<THREE.Mesh>(null)
  const sunLightRef = useRef<THREE.DirectionalLight>(null)
  const sunGlowRef = useRef<THREE.Mesh>(null)

  const isLow = qualityTier === 'low'
  const isMedium = qualityTier === 'medium'

  // Enhanced sun configuration for realistic daylight
  const sunConfig = useMemo(() => ({
    position: [22, 35, -18] as [number, number, number], // Higher position for natural overhead light
    size: isLow ? 2.5 : isMedium ? 3 : 3.5,
    lightIntensity: isDayMode ? 1.8 : 0, // Increased for brighter daytime
    lightColor: '#fffaf0', // Warm natural sunlight (floral white)
    shadowMapSize: isLow ? 1024 : isMedium ? 2048 : 3072, // Higher quality shadows
    ambientIntensity: 0.55, // Increased ambient fill
    fillLightIntensity: 0.35 // Cool-tinted fill to prevent dark shadows
  }), [isDayMode, isLow, isMedium])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Very subtle sun movement simulating earth rotation
    if (sunRef.current && isDayMode) {
      const sway = Math.sin(time * 0.015) * 0.3
      sunRef.current.position.x = sunConfig.position[0] + sway
      sunRef.current.position.z = sunConfig.position[2] + sway * 0.2
    }

    // Subtle sunlight intensity variation (cloud passing)
    if (sunLightRef.current && isDayMode) {
      const intensityVariation = 1 + Math.sin(time * 0.08) * 0.04
      sunLightRef.current.intensity = sunConfig.lightIntensity * intensityVariation
    }

    // Pulsing sun glow effect
    if (sunGlowRef.current && isDayMode) {
      const glowPulse = 0.9 + Math.sin(time * 0.5) * 0.1
      sunGlowRef.current.scale.setScalar(glowPulse)
    }
  })

  if (!isDayMode) return null

  return (
    <group>
      {/* Enhanced sun with glow */}
      <mesh ref={sunRef} position={sunConfig.position}>
        <sphereGeometry args={[sunConfig.size, 32, 32]} />
        <meshStandardMaterial
          color="#fffaf0"
          emissive="#fff8e7"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Sun atmospheric glow */}
      <mesh 
        ref={sunGlowRef}
        position={sunConfig.position}
      >
        <sphereGeometry args={[sunConfig.size * 2.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffd700"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Primary Sunlight - warm directional with soft shadows */}
      <directionalLight
        ref={sunLightRef}
        position={[sunConfig.position[0], sunConfig.position[1], sunConfig.position[2]]}
        intensity={sunConfig.lightIntensity}
        color={sunConfig.lightColor}
        castShadow
        shadow-mapSize-width={sunConfig.shadowMapSize}
        shadow-mapSize-height={sunConfig.shadowMapSize}
        shadow-camera-near={0.1}
        shadow-camera-far={120}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.00015}
        shadow-normalBias={0.03}
        shadow-radius={2}
      />

      {/* Secondary fill light - cool tinted to prevent harsh shadows */}
      <directionalLight
        position={[-15, 20, 10]}
        intensity={sunConfig.fillLightIntensity}
        color="#cce7ff" // Cool blue fill light
        castShadow={false}
      />

      {/* Ambient light with warm neutral tint */}
      <ambientLight 
        intensity={sunConfig.ambientIntensity} 
        color="#f5f5f0" 
      />

      {/* Hemisphere light for natural outdoor lighting - sky and ground bounce */}
      <hemisphereLight
        args={[
          '#87ceeb', // Sky blue
          '#7a8a5f', // Grassy ground color
          0.75 // Increased for more natural fill
        ]}
      />

      {/* Atmospheric scattered light for depth and realism */}
      <pointLight 
        position={[0, 12, 0]} 
        intensity={0.25} 
        color="#f8f9fa" 
        distance={50} 
        decay={2} 
      />
      <pointLight 
        position={[-28, 10, -28]} 
        intensity={0.18} 
        color="#dfe7f2" 
        distance={45} 
        decay={2.2} 
      />
      <pointLight 
        position={[28, 10, 28]} 
        intensity={0.18} 
        color="#dfe7f2" 
        distance={45} 
        decay={2.2} 
      />

      {/* Subtle rim lights for edge definition on gravestones */}
      <spotLight
        position={[-20, 15, 20]}
        angle={0.6}
        penumbra={0.8}
        intensity={0.15}
        color="#b8d4f1"
        distance={40}
        decay={2}
        castShadow={false}
      />
      <spotLight
        position={[20, 15, -20]}
        angle={0.6}
        penumbra={0.8}
        intensity={0.15}
        color="#b8d4f1"
        distance={40}
        decay={2}
        castShadow={false}
      />
    </group>
  )
}



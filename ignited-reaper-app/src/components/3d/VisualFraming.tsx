'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface VisualFramingProps {
  qualityTier: 'high' | 'medium' | 'low'
}

interface Star {
  position: [number, number, number]
  brightness: number
  twinkle: number
  phase: number
}

function Star({ position, brightness, twinkle, phase }: Star) {
  const starRef = useRef<THREE.Mesh>(null)
  const { isDayMode } = useCemeteryStore()

  useFrame((state) => {
    if (starRef.current && !isDayMode) {
      const time = state.clock.elapsedTime
      const material = starRef.current.material as THREE.MeshBasicMaterial
      material.opacity = brightness + Math.sin(time * twinkle + phase) * 0.3
    }
  })

  if (isDayMode) return null

  return (
    <mesh ref={starRef} position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={brightness}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

export function VisualFraming({ qualityTier }: VisualFramingProps) {
  const { isDayMode } = useCemeteryStore()

  // Starfield configuration
  const stars = useMemo<Star[]>(() => {
    const starCount = qualityTier === 'low' ? 50 : qualityTier === 'medium' ? 80 : 120
    const starField: Star[] = []
    
    for (let i = 0; i < starCount; i++) {
      starField.push({
        position: [
          (Math.random() - 0.5) * 200,
          40 + Math.random() * 60,
          (Math.random() - 0.5) * 200
        ],
        brightness: 0.3 + Math.random() * 0.7,
        twinkle: 0.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      })
    }
    
    return starField
  }, [qualityTier])

  return (
    <group>
      {/* Starry night sky background */}
      {stars.map((star, index) => (
        <Star
          key={`star-${index}`}
          position={star.position}
          brightness={star.brightness}
          twinkle={star.twinkle}
          phase={star.phase}
        />
      ))}

      {/* Subtle vignette effect */}
      {!isDayMode && (
        <mesh position={[0, 0, -50]} rotation={[0, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
            blending={THREE.MultiplyBlending}
          />
        </mesh>
      )}
    </group>
  )
}










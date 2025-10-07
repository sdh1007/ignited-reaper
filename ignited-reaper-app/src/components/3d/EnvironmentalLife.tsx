'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface EnvironmentalLifeProps {
  qualityTier: 'high' | 'medium' | 'low'
}

interface Butterfly {
  position: [number, number, number]
  scale: number
  speed: number
  phase: number
  color: string
}

interface Bird {
  position: [number, number, number]
  scale: number
  speed: number
  phase: number
  color: string
}

function Butterfly({ position, scale, speed, phase, color }: Butterfly) {
  const butterflyRef = useRef<THREE.Mesh>(null)
  const { isDayMode } = useCemeteryStore()

  useFrame((state) => {
    if (butterflyRef.current && isDayMode) {
      const time = state.clock.elapsedTime * speed + phase
      
      // Fluttering motion
      butterflyRef.current.position.y = position[1] + Math.sin(time * 8) * 0.2
      butterflyRef.current.position.x = position[0] + Math.sin(time * 2) * 2
      butterflyRef.current.position.z = position[2] + Math.cos(time * 1.5) * 1.5
      
      // Wing flapping
      butterflyRef.current.rotation.z = Math.sin(time * 16) * 0.3
    }
  })

  if (!isDayMode) return null

  return (
    <mesh ref={butterflyRef} position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function Bird({ position, scale, speed, phase, color }: Bird) {
  const birdRef = useRef<THREE.Mesh>(null)
  const { isDayMode } = useCemeteryStore()

  useFrame((state) => {
    if (birdRef.current && isDayMode) {
      const time = state.clock.elapsedTime * speed + phase
      
      // Flying motion
      birdRef.current.position.x = position[0] + Math.sin(time * 0.5) * 10
      birdRef.current.position.y = position[1] + Math.sin(time * 0.3) * 2
      birdRef.current.position.z = position[2] + Math.cos(time * 0.4) * 8
      
      // Wing flapping
      birdRef.current.rotation.z = Math.sin(time * 12) * 0.2
    }
  })

  if (!isDayMode) return null

  return (
    <mesh ref={birdRef} position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function EnvironmentalLife({ qualityTier }: EnvironmentalLifeProps) {
  const { isDayMode } = useCemeteryStore()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

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

  // Butterflies configuration
  const butterflies = useMemo<Butterfly[]>(() => {
    const butterflyCount = qualityTier === 'low' ? 3 : qualityTier === 'medium' ? 5 : 8
    const butterflies: Butterfly[] = []
    
    for (let i = 0; i < butterflyCount; i++) {
      butterflies.push({
        position: [
          (Math.random() - 0.5) * 60,
          1 + Math.random() * 3,
          (Math.random() - 0.5) * 60
        ],
        scale: 0.1 + Math.random() * 0.1,
        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        color: ['#ff69b4', '#ffd700', '#ff6347', '#98fb98'][Math.floor(Math.random() * 4)]
      })
    }
    
    return butterflies
  }, [qualityTier])

  // Birds configuration
  const birds = useMemo<Bird[]>(() => {
    const birdCount = qualityTier === 'low' ? 2 : qualityTier === 'medium' ? 4 : 6
    const birds: Bird[] = []
    
    for (let i = 0; i < birdCount; i++) {
      birds.push({
        position: [
          (Math.random() - 0.5) * 80,
          8 + Math.random() * 12,
          (Math.random() - 0.5) * 80
        ],
        scale: 0.2 + Math.random() * 0.2,
        speed: 0.3 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        color: ['#2d1b0e', '#8b7355', '#654321'][Math.floor(Math.random() * 3)]
      })
    }
    
    return birds
  }, [qualityTier])

  if (!isDayMode) return null

  return (
    <group>
      {/* Butterflies */}
      {butterflies.map((butterfly, index) => (
        <Butterfly
          key={`butterfly-${index}`}
          position={butterfly.position}
          scale={butterfly.scale}
          speed={prefersReducedMotion ? butterfly.speed * 0.5 : butterfly.speed}
          phase={butterfly.phase}
          color={butterfly.color}
        />
      ))}

      {/* Birds */}
      {birds.map((bird, index) => (
        <Bird
          key={`bird-${index}`}
          position={bird.position}
          scale={bird.scale}
          speed={prefersReducedMotion ? bird.speed * 0.5 : bird.speed}
          phase={bird.phase}
          color={bird.color}
        />
      ))}
    </group>
  )
}










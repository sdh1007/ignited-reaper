'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface InteractiveElementsProps {
  qualityTier: 'high' | 'medium' | 'low'
}

interface InteractiveOrb {
  position: [number, number, number]
  scale: number
  speed: number
  phase: number
  color: string
  intensity: number
  hoverRadius: number
}

interface FloatingEmber {
  position: [number, number, number]
  scale: number
  speed: number
  phase: number
  drift: [number, number, number]
}

function InteractiveOrb({ position, scale, speed, phase, color, intensity, hoverRadius }: InteractiveOrb) {
  const orbRef = useRef<THREE.Mesh>(null)
  const { isDayMode } = useCemeteryStore()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (orbRef.current && !isDayMode) {
      const time = state.clock.elapsedTime * speed + phase
      
      // Gentle floating motion
      orbRef.current.position.y = position[1] + Math.sin(time * 0.8) * 0.3
      orbRef.current.position.x = position[0] + Math.sin(time * 0.5) * 0.2
      orbRef.current.position.z = position[2] + Math.cos(time * 0.6) * 0.2
      
      // Subtle rotation
      orbRef.current.rotation.y = time * 0.3
      
      // Pulsing glow
      const material = orbRef.current.material as THREE.MeshBasicMaterial
      material.opacity = intensity + Math.sin(time * 2) * 0.1
    }
  })

  if (isDayMode) return null

  return (
    <mesh 
      ref={orbRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[scale, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={hovered ? intensity * 1.5 : intensity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function FloatingEmber({ position, scale, speed, phase, drift }: FloatingEmber) {
  const emberRef = useRef<THREE.Mesh>(null)
  const { isDayMode } = useCemeteryStore()

  useFrame((state) => {
    if (emberRef.current && !isDayMode) {
      const time = state.clock.elapsedTime * speed + phase
      
      // Drift movement
      emberRef.current.position.x = position[0] + Math.sin(time * drift[0]) * 0.5
      emberRef.current.position.y = position[1] + Math.sin(time * drift[1]) * 0.3
      emberRef.current.position.z = position[2] + Math.cos(time * drift[2]) * 0.4
      
      // Flickering
      const material = emberRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.6 + Math.sin(time * 8) * 0.2
    }
  })

  if (isDayMode) return null

  return (
    <mesh ref={emberRef} position={position}>
      <sphereGeometry args={[scale, 8, 8]} />
      <meshBasicMaterial
        color="#ff6b35"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

export function InteractiveElements({ qualityTier }: InteractiveElementsProps) {
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

  // Interactive orbs configuration
  const interactiveOrbs = useMemo<InteractiveOrb[]>(() => {
    const orbCount = qualityTier === 'low' ? 6 : qualityTier === 'medium' ? 10 : 14
    const orbs: InteractiveOrb[] = []
    
    for (let i = 0; i < orbCount; i++) {
      orbs.push({
        position: [
          (Math.random() - 0.5) * 60,
          1 + Math.random() * 3,
          (Math.random() - 0.5) * 60
        ],
        scale: 0.1 + Math.random() * 0.2,
        speed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.7 ? '#ff6b35' : '#e2e8f0',
        intensity: 0.3 + Math.random() * 0.4,
        hoverRadius: 2
      })
    }
    
    return orbs
  }, [qualityTier])

  // Floating embers configuration
  const floatingEmbers = useMemo<FloatingEmber[]>(() => {
    const emberCount = qualityTier === 'low' ? 12 : qualityTier === 'medium' ? 20 : 28
    const embers: FloatingEmber[] = []
    
    for (let i = 0; i < emberCount; i++) {
      embers.push({
        position: [
          (Math.random() - 0.5) * 50,
          0.5 + Math.random() * 2,
          (Math.random() - 0.5) * 50
        ],
        scale: 0.02 + Math.random() * 0.05,
        speed: 0.5 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        drift: [
          0.3 + Math.random() * 0.4,
          0.2 + Math.random() * 0.3,
          0.4 + Math.random() * 0.5
        ]
      })
    }
    
    return embers
  }, [qualityTier])

  if (isDayMode) return null

  return (
    <group>
      {/* Interactive orbs */}
      {interactiveOrbs.map((orb, index) => (
        <InteractiveOrb
          key={`interactive-orb-${index}`}
          position={orb.position}
          scale={orb.scale}
          speed={prefersReducedMotion ? orb.speed * 0.5 : orb.speed}
          phase={orb.phase}
          color={orb.color}
          intensity={orb.intensity}
          hoverRadius={orb.hoverRadius}
        />
      ))}

      {/* Floating embers */}
      {floatingEmbers.map((ember, index) => (
        <FloatingEmber
          key={`floating-ember-${index}`}
          position={ember.position}
          scale={ember.scale}
          speed={prefersReducedMotion ? ember.speed * 0.5 : ember.speed}
          phase={ember.phase}
          drift={ember.drift}
        />
      ))}
    </group>
  )
}










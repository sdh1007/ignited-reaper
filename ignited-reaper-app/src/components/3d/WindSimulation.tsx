'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface WindSimulationProps {
  qualityTier: 'high' | 'medium' | 'low'
}

interface WindAffectedElement {
  ref: React.RefObject<THREE.Mesh>
  basePosition: [number, number, number]
  baseRotation: [number, number, number]
  windStrength: number
  phase: number
}

interface FloatingParticlesProps {
  count: number
  prefersReducedMotion: boolean
}

// Floating particles component for atmospheric dust and pollen
function FloatingParticles({ count, prefersReducedMotion }: FloatingParticlesProps) {
  const particlesRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  // Particle data
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      startPos: [
        (Math.random() - 0.5) * 70,
        0.8 + Math.random() * 8,
        (Math.random() - 0.5) * 70
      ] as [number, number, number],
      speed: 0.2 + Math.random() * 0.4,
      radius: 15 + Math.random() * 25,
      phase: Math.random() * Math.PI * 2,
      scale: 0.015 + Math.random() * 0.025,
      type: Math.random() > 0.7 ? 'pollen' : 'dust' // 30% pollen, 70% dust
    }))
  }, [count])

  useFrame((state) => {
    if (!particlesRef.current || prefersReducedMotion) return

    const time = state.clock.elapsedTime
    const motionScale = prefersReducedMotion ? 0.3 : 1

    particles.forEach((particle, i) => {
      const t = time * particle.speed + particle.phase
      
      // Gentle floating motion with circular drift
      const x = particle.startPos[0] + Math.sin(t * 0.4) * particle.radius * 0.4 * motionScale
      const y = particle.startPos[1] + Math.sin(t * 0.6) * 1.5 * motionScale
      const z = particle.startPos[2] + Math.cos(t * 0.3) * particle.radius * 0.4 * motionScale
      
      dummy.position.set(x, y, z)
      
      // Gentle rotation
      dummy.rotation.set(
        t * 0.3,
        t * 0.4,
        t * 0.2
      )
      
      // Subtle scale pulsing for "sparkle" effect
      const scale = particle.scale * (1 + Math.sin(t * 2) * 0.15)
      dummy.scale.setScalar(scale)
      
      dummy.updateMatrix()
      particlesRef.current?.setMatrixAt(i, dummy.matrix)
    })
    
    if (particlesRef.current) {
      particlesRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={particlesRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color="#fff8dc"
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  )
}

export function WindSimulation({ qualityTier }: WindSimulationProps) {
  const { isDayMode } = useCemeteryStore()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [windStrength, setWindStrength] = useState(0.5)

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

  // Create wind-affected elements
  const windElements = useMemo<WindAffectedElement[]>(() => {
    const elementCount = qualityTier === 'low' ? 15 : qualityTier === 'medium' ? 25 : 35
    const elements: WindAffectedElement[] = []
    
    for (let i = 0; i < elementCount; i++) {
      elements.push({
        ref: { current: null },
        basePosition: [
          (Math.random() - 0.5) * 100,
          0.05,
          (Math.random() - 0.5) * 100
        ],
        baseRotation: [0, Math.random() * Math.PI * 2, 0],
        windStrength: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2
      })
    }
    
    return elements
  }, [qualityTier])

  useFrame((state) => {
    if (!isDayMode || prefersReducedMotion) return

    const time = state.clock.elapsedTime
    const currentWindStrength = windStrength * (0.8 + Math.sin(time * 0.1) * 0.2)

    windElements.forEach((element) => {
      if (element.ref.current) {
        const windTime = time * 0.5 + element.phase
        const swayX = Math.sin(windTime) * currentWindStrength * element.windStrength * 0.1
        const swayZ = Math.cos(windTime * 0.7) * currentWindStrength * element.windStrength * 0.05
        const rotationY = Math.sin(windTime * 0.3) * currentWindStrength * element.windStrength * 0.2

        element.ref.current.position.x = element.basePosition[0] + swayX
        element.ref.current.position.z = element.basePosition[2] + swayZ
        element.ref.current.rotation.y = element.baseRotation[1] + rotationY
      }
    })
  })

  if (!isDayMode) return null

  return (
    <group>
      {/* Wind-affected vegetation */}
      {windElements.map((element, index) => (
        <mesh
          key={`wind-element-${index}`}
          ref={element.ref}
          position={element.basePosition}
          rotation={element.baseRotation}
          scale={0.2 + Math.random() * 0.4}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={Math.random() > 0.5 ? '#4a5d23' : '#6a7d43'}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Enhanced floating particles (pollen, dust motes) in sunlight */}
      <FloatingParticles 
        count={qualityTier === 'low' ? 30 : qualityTier === 'medium' ? 60 : 100}
        prefersReducedMotion={prefersReducedMotion}
      />
    </group>
  )
}



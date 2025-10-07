'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface LayeredFogProps {
  qualityTier: 'high' | 'medium' | 'low'
}

interface FogLayer {
  position: [number, number, number]
  scale: number
  opacity: number
  speed: number
  phase: number
  height: number
}

export function LayeredFog({ qualityTier }: LayeredFogProps) {
  const { isDayMode } = useCemeteryStore()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const fogGroupRef = useRef<THREE.Group>(null)

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

  // Create layered fog with varying density
  const fogLayers = useMemo<FogLayer[]>(() => {
    const layers: FogLayer[] = []
    const layerCount = qualityTier === 'low' ? 8 : qualityTier === 'medium' ? 12 : 16
    
    for (let i = 0; i < layerCount; i++) {
      const height = Math.random() * 3 + 0.5 // Ground level to 3.5 units high
      const density = Math.max(0.1, 1 - (height / 4)) // Denser at ground level
      
      layers.push({
        position: [
          (Math.random() - 0.5) * 80,
          height,
          (Math.random() - 0.5) * 80
        ],
        scale: 8 + Math.random() * 12,
        opacity: (0.02 + Math.random() * 0.08) * density, // Varying opacity based on height
        speed: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        height
      })
    }
    
    return layers
  }, [qualityTier])

  useFrame((state) => {
    if (fogGroupRef.current && !prefersReducedMotion) {
      fogGroupRef.current.children.forEach((mesh, i) => {
        const layer = fogLayers[i]
        const time = state.clock.elapsedTime * layer.speed + layer.phase

        // Gentle drift movement
        mesh.position.x = layer.position[0] + Math.sin(time * 0.7) * 2
        mesh.position.z = layer.position[2] + Math.cos(time * 0.5) * 1.5

        // Subtle opacity variation
        const material = (mesh as THREE.Mesh).material as THREE.MeshBasicMaterial
        material.opacity = layer.opacity + Math.sin(time * 1.2 + layer.phase) * 0.01
      })
    }
  })

  if (isDayMode) {
    // Lighter fog for day mode
    return (
      <group>
        {fogLayers.map((layer, index) => (
          <mesh
            key={`day-fog-${index}`}
            position={layer.position}
            scale={layer.scale}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
              color="#e2e8f0"
              transparent
              opacity={layer.opacity * 0.3}
              side={THREE.DoubleSide}
              blending={THREE.NormalBlending}
            />
          </mesh>
        ))}
      </group>
    )
  }

  return (
    <group>
      {/* Layered bluish fog with varying density */}
      <group ref={fogGroupRef}>
        {fogLayers.map((layer, index) => (
          <Sphere
            key={`fog-layer-${index}`}
            args={[1, 20, 20]}
            position={layer.position}
            scale={layer.scale}
          >
            <meshBasicMaterial
              color="#94a3b8" // Blue-gray color
              transparent
              opacity={layer.opacity}
              side={THREE.DoubleSide}
              blending={THREE.NormalBlending}
              depthWrite={false}
            />
          </Sphere>
        ))}
      </group>
    </group>
  )
}










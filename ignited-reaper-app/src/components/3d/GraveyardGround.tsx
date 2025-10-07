'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface GraveyardGroundProps {
  qualityTier: 'high' | 'medium' | 'low'
  stones: Array<{ position: [number, number]; color: string }>
}

function createDirtGrassTexture() {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')
  if (!context) return null

  // Base dirt color
  context.fillStyle = '#1a2332'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Add grass texture
  context.fillStyle = '#2d3748'
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 1.5 + 0.5
    context.fillRect(x, y, size, size)
  }

  // Add darker dirt patches
  context.fillStyle = '#0f1419'
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 6 + 3
    context.beginPath()
    context.arc(x, y, size, 0, Math.PI * 2)
    context.fill()
  }

  // Add lighter highlights
  context.fillStyle = '#374151'
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 2 + 0.5
    context.fillRect(x, y, size, size)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 6)
  texture.needsUpdate = true
  return texture
}

export function GraveyardGround({ qualityTier, stones }: GraveyardGroundProps) {
  const { isDayMode } = useCemeteryStore()
  const groundRef = useRef<THREE.Mesh>(null)

  const groundTexture = useMemo(() => createDirtGrassTexture(), [])

  // Ground material properties
  const groundMaterial = useMemo(() => ({
    color: isDayMode ? '#2d3748' : '#1a2332',
    map: groundTexture,
    roughness: 0.95,
    metalness: 0.02,
    emissive: isDayMode ? '#0f1419' : '#0a0f1a',
    emissiveIntensity: isDayMode ? 0.02 : 0.08
  }), [isDayMode, groundTexture])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Subtle ground movement for realism
    if (groundRef.current) {
      groundRef.current.rotation.z = Math.sin(time * 0.05) * 0.0005
    }
  })

  // Generate ground glow around stones
  const glowAnchors = useMemo(() => {
    const limit = qualityTier === 'high' ? 15 : qualityTier === 'medium' ? 10 : 8
    return stones.slice(0, limit).map((stone, index) => ({
      position: stone.position,
      color: stone.color,
      radius: 1.2 + ((index % 3) * 0.2) + Math.abs(Math.sin(stone.position[0] * 0.1)) * 0.4,
    }))
  }, [stones, qualityTier])

  return (
    <group>
      {/* Main ground plane */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[100, 100, 32, 32]} />
        <meshStandardMaterial {...groundMaterial} />
      </mesh>

      {/* Ground glow around stones */}
      {glowAnchors.map((anchor, index) => (
        <mesh
          key={`ground-glow-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[anchor.position[0], 0.01, anchor.position[1]]}
          scale={anchor.radius}
        >
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial
            color={anchor.color}
            transparent
            opacity={isDayMode ? 0.08 : 0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Dirt patches for variety */}
      {Array.from({ length: qualityTier === 'high' ? 12 : qualityTier === 'medium' ? 8 : 6 }).map((_, index) => (
        <mesh
          key={`dirt-patch-${index}`}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 0.5]}
          position={[
            (Math.random() - 0.5) * 80,
            0.005,
            (Math.random() - 0.5) * 80
          ]}
          scale={Math.random() * 6 + 4}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={isDayMode ? '#374151' : '#1f2937'}
            roughness={0.98}
            metalness={0.01}
          />
        </mesh>
      ))}
    </group>
  )
}










'use client'

import { useMemo } from 'react'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface EnvironmentalDepthProps {
  qualityTier: 'high' | 'medium' | 'low'
  stones: Array<{ position: [number, number]; color: string }>
}

function createGroundTexture(isDayMode: boolean, qualityTier: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null

  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null

  // Base dirt color
  context.fillStyle = isDayMode ? '#4a3d2e' : '#2a241e'
  context.fillRect(0, 0, size, size)

  // Add grass patches
  const grassColor = isDayMode ? '#5c7a4a' : '#3a4a30'
  context.fillStyle = grassColor
  const grassPatches = qualityTier === 'low' ? 100 : qualityTier === 'medium' ? 200 : 400
  for (let i = 0; i < grassPatches; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = 20 + Math.random() * 40
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  // Add subtle variations and stones
  const detailColor = isDayMode ? '#3a3025' : '#1f1a16'
  context.fillStyle = detailColor
  const details = qualityTier === 'low' ? 50 : qualityTier === 'medium' ? 100 : 200
  for (let i = 0; i < details; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = 5 + Math.random() * 15
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(8, 8)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function EnvironmentalDepth({ qualityTier, stones }: EnvironmentalDepthProps) {
  const { isDayMode } = useCemeteryStore()
  const groundTexture = useMemo(() => createGroundTexture(isDayMode, qualityTier), [isDayMode, qualityTier])

  const pathColor = isDayMode ? '#6b5e50' : '#4a4036'

  return (
    <group>
      {/* Main ground plane with texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          map={groundTexture}
          color={isDayMode ? '#8a7a6a' : '#5a4a3a'}
          roughness={0.9}
          metalness={0.05}
          emissive={isDayMode ? '#1a1a1a' : '#0a0a0a'}
          emissiveIntensity={isDayMode ? 0.05 : 0.1}
        />
      </mesh>

      {/* Graveyard paths */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[3, 60]} />
        <meshStandardMaterial color={pathColor} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[3, 60]} />
        <meshStandardMaterial color={pathColor} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Moss patches near stones */}
      {stones.map((stone, index) => (
        <mesh
          key={`moss-${index}`}
          position={[stone.position[0] + (Math.random() - 0.5) * 0.5, 0.02, stone.position[1] + (Math.random() - 0.5) * 0.5]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]}
        >
          <planeGeometry args={[1 + Math.random() * 0.5, 1 + Math.random() * 0.5]} />
          <meshStandardMaterial
            color={isDayMode ? '#4a6a3a' : '#2a3a2a'}
            roughness={0.95}
            metalness={0.01}
            transparent
            opacity={0.7 + Math.random() * 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Perimeter fence posts */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 35
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh key={`fence-post-${i}`} position={[x, 0.6, z]}>
            <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
            <meshStandardMaterial 
              color={isDayMode ? '#3a2e24' : '#1a140f'} 
              roughness={0.8} 
              metalness={0.1} 
            />
          </mesh>
        )
      })}

      {/* Fallen leaves and debris */}
      {Array.from({ length: qualityTier === 'low' ? 20 : qualityTier === 'medium' ? 40 : 60 }).map((_, i) => (
        <mesh
          key={`leaf-${i}`}
          position={[
            (Math.random() - 0.5) * 100,
            0.05,
            (Math.random() - 0.5) * 100
          ]}
          rotation={[0, Math.random() * Math.PI * 2, 0]}
          scale={0.1 + Math.random() * 0.2}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={isDayMode ? '#8b4513' : '#654321'}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Ground cracks */}
      {Array.from({ length: qualityTier === 'low' ? 8 : qualityTier === 'medium' ? 12 : 16 }).map((_, i) => (
        <mesh
          key={`crack-${i}`}
          position={[
            (Math.random() - 0.5) * 80,
            0.01,
            (Math.random() - 0.5) * 80
          ]}
          rotation={[0, Math.random() * Math.PI, 0]}
        >
          <planeGeometry args={[2 + Math.random() * 3, 0.1]} />
          <meshStandardMaterial
            color={isDayMode ? '#2d2d2d' : '#1a1a1a'}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}










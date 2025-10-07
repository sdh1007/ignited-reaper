'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface RealisticGroundProps {
  qualityTier: 'high' | 'medium' | 'low'
  stones: Array<{ position: [number, number]; color: string }>
}

function createGrassTexture() {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')
  if (!context) return null

  // Base grass color
  context.fillStyle = '#1a2332'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Add grass texture
  context.fillStyle = '#2d3748'
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 2 + 1
    context.fillRect(x, y, size, size)
  }

  // Add darker patches
  context.fillStyle = '#0f1419'
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 8 + 4
    context.beginPath()
    context.arc(x, y, size, 0, Math.PI * 2)
    context.fill()
  }

  // Add lighter highlights
  context.fillStyle = '#374151'
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 3 + 1
    context.fillRect(x, y, size, size)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(8, 8)
  texture.needsUpdate = true
  return texture
}

function createDirtTexture() {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return null

  // Base dirt color
  context.fillStyle = '#1f2937'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Add dirt particles
  context.fillStyle = '#374151'
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 3 + 1
    context.fillRect(x, y, size, size)
  }

  // Add darker spots
  context.fillStyle = '#111827'
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 6 + 2
    context.beginPath()
    context.arc(x, y, size, 0, Math.PI * 2)
    context.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  texture.needsUpdate = true
  return texture
}

function createStoneTexture() {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return null

  // Base stone color
  context.fillStyle = '#374151'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Add stone grain
  context.fillStyle = '#4b5563'
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 2 + 0.5
    context.fillRect(x, y, size, size)
  }

  // Add cracks
  context.strokeStyle = '#1f2937'
  context.lineWidth = 1
  for (let i = 0; i < 20; i++) {
    context.beginPath()
    context.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    context.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    context.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  texture.needsUpdate = true
  return texture
}

export function RealisticGround({ qualityTier, stones }: RealisticGroundProps) {
  const { isDayMode } = useCemeteryStore()
  const groundRef = useRef<THREE.Mesh>(null)
  const pathRef = useRef<THREE.Mesh>(null)

  const grassTexture = useMemo(() => createGrassTexture(), [])
  const dirtTexture = useMemo(() => createDirtTexture(), [])
  const stoneTexture = useMemo(() => createStoneTexture(), [])

  // Ground material properties
  const groundMaterial = useMemo(() => ({
    color: isDayMode ? '#2d3748' : '#1a2332',
    map: grassTexture,
    normalMap: grassTexture,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughness: 0.9,
    metalness: 0.05,
    emissive: isDayMode ? '#0f1419' : '#0a0f1a',
    emissiveIntensity: isDayMode ? 0.05 : 0.15
  }), [isDayMode, grassTexture])

  // Path material properties
  const pathMaterial = useMemo(() => ({
    color: isDayMode ? '#4b5563' : '#374151',
    map: stoneTexture,
    roughness: 0.8,
    metalness: 0.1,
    emissive: isDayMode ? '#1f2937' : '#111827',
    emissiveIntensity: isDayMode ? 0.02 : 0.08
  }), [isDayMode, stoneTexture])

  // Dirt patches material
  const dirtMaterial = useMemo(() => ({
    color: isDayMode ? '#374151' : '#1f2937',
    map: dirtTexture,
    roughness: 0.95,
    metalness: 0.02,
    emissive: isDayMode ? '#111827' : '#0a0f1a',
    emissiveIntensity: isDayMode ? 0.01 : 0.05
  }), [isDayMode, dirtTexture])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Subtle ground movement for realism
    if (groundRef.current) {
      groundRef.current.rotation.z = Math.sin(time * 0.1) * 0.001
    }

    // Animate path texture
    if (pathRef.current && pathRef.current.material) {
      const material = pathRef.current.material as THREE.MeshStandardMaterial
      if (material.map) {
        material.map.offset.x = time * 0.001
        material.map.offset.y = time * 0.0005
      }
    }
  })

  // Generate random dirt patches
  const dirtPatches = useMemo(() => {
    const patches = []
    for (let i = 0; i < 15; i++) {
      patches.push({
        position: [
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ] as [number, number],
        scale: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2
      })
    }
    return patches
  }, [])

  // Generate fallen leaves
  const leaves = useMemo(() => {
    const leafPositions = []
    for (let i = 0; i < 50; i++) {
      leafPositions.push({
        position: [
          (Math.random() - 0.5) * 80,
          0.01,
          (Math.random() - 0.5) * 80
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI
        ] as [number, number, number],
        scale: Math.random() * 0.5 + 0.3
      })
    }
    return leafPositions
  }, [])

  return (
    <group>
      {/* Main ground plane */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[120, 120, 32, 32]} />
        <meshStandardMaterial {...groundMaterial} />
      </mesh>

      {/* Stone paths */}
      <mesh
        ref={pathRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[3, 60]} />
        <meshStandardMaterial {...pathMaterial} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[3, 40]} />
        <meshStandardMaterial {...pathMaterial} />
      </mesh>

      {/* Dirt patches */}
      {dirtPatches.map((patch, index) => (
        <mesh
          key={`dirt-${index}`}
          rotation={[-Math.PI / 2, 0, patch.rotation]}
          position={[patch.position[0], 0.005, patch.position[1]]}
          receiveShadow
        >
          <planeGeometry args={[patch.scale, patch.scale * 0.8]} />
          <meshStandardMaterial {...dirtMaterial} />
        </mesh>
      ))}

      {/* Fallen leaves */}
      {leaves.map((leaf, index) => (
        <mesh
          key={`leaf-${index}`}
          position={leaf.position}
          rotation={leaf.rotation}
          scale={leaf.scale}
        >
          <planeGeometry args={[0.8, 0.6]} />
          <meshStandardMaterial
            color={isDayMode ? '#8b5a2b' : '#6b4423'}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Moss patches on stones */}
      {stones.slice(0, 8).map((stone, index) => (
        <mesh
          key={`moss-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[stone.position[0], 0.02, stone.position[1]]}
        >
          <planeGeometry args={[2, 2]} />
          <meshStandardMaterial
            color={isDayMode ? '#4a5d23' : '#2d3a14'}
            transparent
            opacity={0.6}
            roughness={0.95}
            metalness={0.02}
          />
        </mesh>
      ))}

      {/* Ground glow around stones */}
      {stones.slice(0, qualityTier === 'high' ? 12 : qualityTier === 'medium' ? 8 : 6).map((stone, index) => (
        <mesh
          key={`glow-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[stone.position[0], 0.01, stone.position[1]]}
        >
          <circleGeometry args={[1.5, 32]} />
          <meshBasicMaterial
            color={stone.color}
            transparent
            opacity={isDayMode ? 0.1 : 0.2}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}










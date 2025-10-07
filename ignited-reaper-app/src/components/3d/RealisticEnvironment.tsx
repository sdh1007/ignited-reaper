'use client'

import { useMemo } from 'react'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface RealisticEnvironmentProps {
  qualityTier: 'high' | 'medium' | 'low'
  stones: Array<{ position: [number, number]; color: string }>
}

function createGrassTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null

  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null

  // Enhanced base grass color - more natural green
  const gradient = context.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#4d5e26')
  gradient.addColorStop(0.5, '#5a6d33')
  gradient.addColorStop(1, '#4a5d23')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  // Add varied grass blade clusters
  const grassColors = ['#5a6d33', '#4a5d23', '#3d4f1e', '#6a7d43', '#556b2c', '#4d5f28']
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = 8 + Math.random() * 25
    const opacity = 0.3 + Math.random() * 0.4
    context.globalAlpha = opacity
    context.fillStyle = grassColors[Math.floor(Math.random() * grassColors.length)]
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
  context.globalAlpha = 1

  // Add realistic dirt patches
  const dirtColors = ['#8b7355', '#7a6449', '#9a8470', '#6b5d45']
  for (let i = 0; i < 75; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = 15 + Math.random() * 50
    context.fillStyle = dirtColors[Math.floor(Math.random() * dirtColors.length)]
    context.globalAlpha = 0.6 + Math.random() * 0.3
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
  context.globalAlpha = 1

  // Add subtle grass blade texture
  context.strokeStyle = '#3a4d13'
  context.lineWidth = 1
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const length = 5 + Math.random() * 12
    context.globalAlpha = 0.3
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + (Math.random() - 0.5) * 3, y + length)
    context.stroke()
  }
  context.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 10)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createPathTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null

  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null

  // Base gravel path color with gradient
  const gradient = context.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#8b7355')
  gradient.addColorStop(0.5, '#9a8470')
  gradient.addColorStop(1, '#7a6449')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  // Add varied gravel stones
  const stoneColors = ['#6b5d45', '#7a6449', '#5a4d38', '#8b7355', '#6d6050']
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = 3 + Math.random() * 12
    context.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)]
    context.globalAlpha = 0.7 + Math.random() * 0.3
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
  context.globalAlpha = 1

  // Add cobblestone edges
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = 8 + Math.random() * 15
    context.strokeStyle = '#5a4d38'
    context.lineWidth = 1.5
    context.globalAlpha = 0.4
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.stroke()
  }
  context.globalAlpha = 1

  // Add worn path texture (darker center)
  const centerGradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  centerGradient.addColorStop(0, 'rgba(90, 77, 56, 0.3)')
  centerGradient.addColorStop(0.6, 'rgba(90, 77, 56, 0.1)')
  centerGradient.addColorStop(1, 'rgba(90, 77, 56, 0)')
  context.fillStyle = centerGradient
  context.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 5)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function RealisticEnvironment({ qualityTier, stones }: RealisticEnvironmentProps) {
  const { isDayMode } = useCemeteryStore()
  const grassTexture = useMemo(() => createGrassTexture(), [])
  const pathTexture = useMemo(() => createPathTexture(), [])

  if (!isDayMode) return null

  return (
    <group>
      {/* Main ground plane with enhanced grass texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial
          map={grassTexture}
          color="#556b2c"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* Enhanced graveyard paths with worn gravel texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[4.5, 65]} />
        <meshStandardMaterial
          map={pathTexture}
          color="#9a8470"
          roughness={0.85}
          metalness={0.08}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[4.5, 65]} />
        <meshStandardMaterial
          map={pathTexture}
          color="#9a8470"
          roughness={0.85}
          metalness={0.08}
        />
      </mesh>

      {/* Burial mounds near graves */}
      {stones.map((stone, index) => (
        <mesh
          key={`mound-${index}`}
          position={[stone.position[0], 0.06, stone.position[1]]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
          receiveShadow
          castShadow
        >
          <circleGeometry args={[1.8 + Math.random() * 0.8, 32]} />
          <meshStandardMaterial
            color="#4a5d23"
            roughness={0.95}
            metalness={0.01}
          />
        </mesh>
      ))}

      {/* Grass tufts scattered naturally */}
      {Array.from({ length: qualityTier === 'low' ? 25 : qualityTier === 'medium' ? 40 : 60 }).map((_, i) => {
        const posX = (Math.random() - 0.5) * 110
        const posZ = (Math.random() - 0.5) * 110
        // Avoid placing on paths
        const onPath = (Math.abs(posX) < 2.5 || Math.abs(posZ) < 2.5)
        if (onPath) return null
        
        return (
          <mesh
            key={`grass-tuft-${i}`}
            position={[posX, 0.08, posZ]}
            rotation={[0, Math.random() * Math.PI * 2, 0]}
            scale={0.4 + Math.random() * 0.8}
            castShadow
          >
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial
              color={['#4a5d23', '#556b2c', '#6a7d43', '#4d5f28'][Math.floor(Math.random() * 4)]}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              roughness={0.9}
            />
          </mesh>
        )
      })}

      {/* Wildflowers near graves - multiple per grave */}
      {stones.flatMap((stone, index) => 
        Array.from({ length: 2 + Math.floor(Math.random() * 3) }).map((_, i) => (
          <mesh
            key={`wildflower-${index}-${i}`}
            position={[
              stone.position[0] + (Math.random() - 0.5) * 2.5,
              0.08,
              stone.position[1] + (Math.random() - 0.5) * 2.5
            ]}
            rotation={[0, Math.random() * Math.PI * 2, 0]}
            scale={0.12 + Math.random() * 0.18}
          >
            <planeGeometry args={[0.8, 0.8]} />
            <meshStandardMaterial
              color={['#ff6b9d', '#ffd700', '#ff8c69', '#98fb98', '#87ceeb', '#dda0dd'][Math.floor(Math.random() * 6)]}
              transparent
              opacity={0.75}
              side={THREE.DoubleSide}
              emissive={['#ff6b9d', '#ffd700', '#ff8c69', '#98fb98', '#87ceeb', '#dda0dd'][Math.floor(Math.random() * 6)]}
              emissiveIntensity={0.15}
            />
          </mesh>
        ))
      )}

      {/* Fallen branches */}
      {Array.from({ length: qualityTier === 'low' ? 12 : qualityTier === 'medium' ? 22 : 35 }).map((_, i) => (
        <mesh
          key={`branch-${i}`}
          position={[
            (Math.random() - 0.5) * 100,
            0.04,
            (Math.random() - 0.5) * 100
          ]}
          rotation={[0, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.2]}
          scale={0.3 + Math.random() * 0.6}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.08, 0.06, 2, 8]} />
          <meshStandardMaterial
            color="#3d2817"
            roughness={0.95}
            metalness={0.01}
          />
        </mesh>
      ))}

      {/* Scattered rocks */}
      {Array.from({ length: qualityTier === 'low' ? 15 : qualityTier === 'medium' ? 28 : 45 }).map((_, i) => (
        <mesh
          key={`rock-${i}`}
          position={[
            (Math.random() - 0.5) * 110,
            0.08,
            (Math.random() - 0.5) * 110
          ]}
          rotation={[
            Math.random() * 0.3,
            Math.random() * Math.PI * 2,
            Math.random() * 0.3
          ]}
          scale={0.15 + Math.random() * 0.25}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#6b5d45"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Flower bouquets at select graves */}
      {stones.slice(0, Math.floor(stones.length / 4)).map((stone, index) => (
        <group key={`bouquet-${index}`} position={[
          stone.position[0] + (Math.random() - 0.5) * 1.2,
          0.15,
          stone.position[1] + (Math.random() - 0.5) * 1.2
        ]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.06, 0.3, 8]} />
            <meshStandardMaterial color="#8b7355" roughness={0.8} />
          </mesh>
          {Array.from({ length: 3 + Math.floor(Math.random() * 4) }).map((_, i) => (
            <mesh
              key={`flower-${i}`}
              position={[
                (Math.random() - 0.5) * 0.15,
                0.2 + Math.random() * 0.15,
                (Math.random() - 0.5) * 0.15
              ]}
              scale={0.06 + Math.random() * 0.04}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial
                color={['#ff69b4', '#ffd700', '#ff6347', '#da70d6'][Math.floor(Math.random() * 4)]}
                emissive={['#ff69b4', '#ffd700', '#ff6347', '#da70d6'][Math.floor(Math.random() * 4)]}
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Candles at some graves */}
      {stones.slice(0, Math.floor(stones.length / 5)).map((stone, index) => (
        <group key={`candle-${index}`} position={[
          stone.position[0] + (Math.random() - 0.5) * 1.5,
          0.15,
          stone.position[1] + 0.8 + (Math.random() - 0.5) * 0.5
        ]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 12]} />
            <meshStandardMaterial 
              color="#f5f5dc" 
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          <pointLight
            position={[0, 0.2, 0]}
            color="#ff8c00"
            intensity={0.3}
            distance={2}
            decay={2}
          />
        </group>
      ))}
    </group>
  )
}



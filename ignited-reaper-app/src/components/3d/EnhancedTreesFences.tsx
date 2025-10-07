'use client'

import { useMemo } from 'react'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface EnhancedTreesFencesProps {
  qualityTier: 'high' | 'medium' | 'low'
}

function createBarkTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null

  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null

  // Base bark color
  context.fillStyle = '#2d1b0e'
  context.fillRect(0, 0, size, size)

  // Add bark texture
  context.strokeStyle = '#1a0f08'
  context.lineWidth = 2
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const length = 20 + Math.random() * 40
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x, y + length)
    context.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 4)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createWoodTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null

  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null

  // Base wood color
  context.fillStyle = '#8b7355'
  context.fillRect(0, 0, size, size)

  // Add wood grain
  context.strokeStyle = '#6b5d45'
  context.lineWidth = 1
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const length = 30 + Math.random() * 50
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + length, y)
    context.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 2)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function EnhancedTreesFences({ qualityTier }: EnhancedTreesFencesProps) {
  const { isDayMode } = useCemeteryStore()
  const barkTexture = useMemo(() => createBarkTexture(), [])
  const woodTexture = useMemo(() => createWoodTexture(), [])

  // Tree positions for natural placement
  const treePositions = useMemo(() => [
    { pos: [-22, 0, -18] as [number, number, number], scale: 1.2 },
    { pos: [24, 0, -16] as [number, number, number], scale: 1.1 },
    { pos: [-20, 0, 20] as [number, number, number], scale: 1.3 },
    { pos: [18, 0, 22] as [number, number, number], scale: 1.15 },
  ], [])

  if (!isDayMode) return null

  return (
    <group>
      {/* Mature trees with foliage - Oak/Maple style */}
      {treePositions.map((tree, treeIndex) => (
        <group key={`tree-${treeIndex}`} position={tree.pos} scale={tree.scale}>
          {/* Tree trunk */}
          <mesh position={[0, 3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.7, 6, 12]} />
            <meshStandardMaterial
              map={barkTexture}
              color="#3d2817"
              roughness={0.96}
              metalness={0.02}
            />
          </mesh>
          
          {/* Main branches */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const branchLength = 1.8 + Math.random() * 1.2
            return (
              <mesh
                key={`branch-${i}`}
                position={[
                  Math.cos(angle) * 0.3,
                  4.5 + (Math.random() - 0.5) * 1.5,
                  Math.sin(angle) * 0.3
                ]}
                rotation={[
                  Math.PI / 2.5 + Math.random() * 0.4,
                  angle,
                  0
                ]}
                castShadow
              >
                <cylinderGeometry args={[0.08, 0.15, branchLength, 6]} />
                <meshStandardMaterial
                  map={barkTexture}
                  color="#3d2817"
                  roughness={0.94}
                  metalness={0.02}
                />
              </mesh>
            )
          })}
          
          {/* Tree canopy - leafy foliage */}
          <mesh position={[0, 6.5, 0]} castShadow>
            <sphereGeometry args={[3.5, 16, 16]} />
            <meshStandardMaterial
              color="#4a5d23"
              roughness={0.95}
              metalness={0.01}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[0.8, 6.8, 0.5]} castShadow>
            <sphereGeometry args={[2.8, 12, 12]} />
            <meshStandardMaterial
              color="#556b2c"
              roughness={0.94}
              metalness={0.01}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh position={[-0.7, 6.3, -0.6]} castShadow>
            <sphereGeometry args={[2.5, 12, 12]} />
            <meshStandardMaterial
              color="#4d5f28"
              roughness={0.95}
              metalness={0.01}
              transparent
              opacity={0.88}
            />
          </mesh>
        </group>
      ))}

      {/* Wrought-iron style fence perimeter */}
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i / 40) * Math.PI * 2
        const radius = 38
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <group key={`fence-post-${i}`}>
            {/* Iron fence post */}
            <mesh position={[x, 1.2, z]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 2.4, 8]} />
              <meshStandardMaterial
                color="#2a2a2a"
                roughness={0.75}
                metalness={0.4}
              />
            </mesh>
            {/* Decorative top spike */}
            <mesh position={[x, 2.5, z]} castShadow>
              <coneGeometry args={[0.08, 0.3, 8]} />
              <meshStandardMaterial
                color="#1a1a1a"
                roughness={0.7}
                metalness={0.5}
              />
            </mesh>
            {/* Horizontal rails */}
            {i < 39 && (
              <>
                <mesh
                  position={[
                    (x + Math.cos((i + 1) / 40 * Math.PI * 2) * radius) / 2,
                    1.6,
                    (z + Math.sin((i + 1) / 40 * Math.PI * 2) * radius) / 2
                  ]}
                  rotation={[0, angle, 0]}
                  castShadow
                >
                  <cylinderGeometry args={[0.04, 0.04, 6, 8]} />
                  <meshStandardMaterial
                    color="#2a2a2a"
                    roughness={0.8}
                    metalness={0.3}
                  />
                </mesh>
                <mesh
                  position={[
                    (x + Math.cos((i + 1) / 40 * Math.PI * 2) * radius) / 2,
                    0.8,
                    (z + Math.sin((i + 1) / 40 * Math.PI * 2) * radius) / 2
                  ]}
                  rotation={[0, angle, 0]}
                  castShadow
                >
                  <cylinderGeometry args={[0.04, 0.04, 6, 8]} />
                  <meshStandardMaterial
                    color="#2a2a2a"
                    roughness={0.8}
                    metalness={0.3}
                  />
                </mesh>
              </>
            )}
          </group>
        )
      })}

      {/* Entrance gate - simple open gate structure */}
      <group position={[0, 0, 38]}>
        {/* Gate posts */}
        <mesh position={[-2.5, 1.5, 0]} castShadow>
          <boxGeometry args={[0.4, 3, 0.4]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.7}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[2.5, 1.5, 0]} castShadow>
          <boxGeometry args={[0.4, 3, 0.4]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.7}
            metalness={0.4}
          />
        </mesh>
        {/* Gate arch */}
        <mesh position={[0, 3.2, 0]} castShadow>
          <torusGeometry args={[2.5, 0.08, 8, 32, Math.PI]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.75}
            metalness={0.4}
          />
        </mesh>
      </group>

      {/* Morgue/Mausoleum building in background */}
      <group position={[-28, 0, -25]}>
        {/* Main building structure */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 5, 6]} />
          <meshStandardMaterial
            color="#9a9a9a"
            roughness={0.88}
            metalness={0.05}
          />
        </mesh>

        {/* Roof - sloped */}
        <mesh position={[0, 5.3, 0]} castShadow>
          <boxGeometry args={[8.5, 0.8, 6.5]} />
          <meshStandardMaterial
            color="#6b6b6b"
            roughness={0.85}
            metalness={0.08}
          />
        </mesh>

        {/* Front entrance portico */}
        <group position={[0, 0, 3.5]}>
          {/* Portico columns */}
          <mesh position={[-2, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.3, 3.6, 12]} />
            <meshStandardMaterial
              color="#b8b8b8"
              roughness={0.9}
              metalness={0.03}
            />
          </mesh>
          <mesh position={[2, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.3, 3.6, 12]} />
            <meshStandardMaterial
              color="#b8b8b8"
              roughness={0.9}
              metalness={0.03}
            />
          </mesh>

          {/* Portico roof */}
          <mesh position={[0, 3.8, -0.3]} castShadow>
            <boxGeometry args={[5, 0.4, 1.5]} />
            <meshStandardMaterial
              color="#7a7a7a"
              roughness={0.87}
              metalness={0.06}
            />
          </mesh>

          {/* Pediment (triangular top) */}
          <mesh position={[0, 4.5, -0.3]} castShadow>
            <coneGeometry args={[2.8, 1.2, 3]} />
            <meshStandardMaterial
              color="#8a8a8a"
              roughness={0.88}
              metalness={0.05}
            />
          </mesh>
        </group>

        {/* Main entrance door - dark wood */}
        <mesh position={[0, 1.2, 3.05]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 2.4, 0.15]} />
          <meshStandardMaterial
            map={woodTexture}
            color="#3d2817"
            roughness={0.92}
            metalness={0.02}
          />
        </mesh>

        {/* Door frame */}
        <mesh position={[0, 1.2, 3.12]} castShadow>
          <boxGeometry args={[1.7, 2.6, 0.08]} />
          <meshStandardMaterial
            color="#b8b8b8"
            roughness={0.9}
            metalness={0.03}
          />
        </mesh>

        {/* Windows on sides */}
        <mesh position={[-3.2, 2.5, 0]} castShadow>
          <boxGeometry args={[0.1, 1.2, 0.8]} />
          <meshStandardMaterial
            color="#2a3f5f"
            roughness={0.3}
            metalness={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh position={[3.2, 2.5, 0]} castShadow>
          <boxGeometry args={[0.1, 1.2, 0.8]} />
          <meshStandardMaterial
            color="#2a3f5f"
            roughness={0.3}
            metalness={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Stone foundation */}
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <boxGeometry args={[8.2, 0.6, 6.2]} />
          <meshStandardMaterial
            color="#6b5d45"
            roughness={0.95}
            metalness={0.01}
          />
        </mesh>

        {/* Cross on top of building */}
        <group position={[0, 6.5, 0]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[0.15, 1.2, 0.15]} />
            <meshStandardMaterial
              color="#4a4a4a"
              roughness={0.8}
              metalness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[0.6, 0.15, 0.15]} />
            <meshStandardMaterial
              color="#4a4a4a"
              roughness={0.8}
              metalness={0.3}
            />
          </mesh>
        </group>

        {/* Steps leading to entrance */}
        <mesh position={[0, 0.15, 4.2]} receiveShadow>
          <boxGeometry args={[3, 0.3, 1]} />
          <meshStandardMaterial
            color="#8b7355"
            roughness={0.9}
            metalness={0.02}
          />
        </mesh>
        <mesh position={[0, 0.35, 4.6]} receiveShadow>
          <boxGeometry args={[2.5, 0.2, 0.6]} />
          <meshStandardMaterial
            color="#8b7355"
            roughness={0.9}
            metalness={0.02}
          />
        </mesh>

        {/* Weathering stains on walls */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={`morgue-stain-${i}`}
            position={[
              (Math.random() - 0.5) * 7,
              1 + Math.random() * 3,
              3.01
            ]}
            rotation={[0, 0, Math.random() * Math.PI * 2]}
            scale={0.3 + Math.random() * 0.4}
          >
            <planeGeometry args={[1, 1.5]} />
            <meshStandardMaterial
              color="#6b5d45"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
              roughness={0.95}
            />
          </mesh>
        ))}

        {/* Moss on lower walls */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={`morgue-moss-${i}`}
            position={[
              (Math.random() - 0.5) * 7,
              0.5 + Math.random() * 1,
              3.01
            ]}
            rotation={[0, 0, Math.random() * Math.PI * 2]}
            scale={0.25 + Math.random() * 0.35}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
              color="#3d4f1a"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
              roughness={0.95}
            />
          </mesh>
        ))}
      </group>

      {/* Shrubs scattered along fence line */}
      {Array.from({ length: qualityTier === 'low' ? 15 : qualityTier === 'medium' ? 28 : 45 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2
        const radius = 35 + Math.random() * 4
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh
            key={`shrub-${i}`}
            position={[x, 0.25, z]}
            scale={0.4 + Math.random() * 0.5}
            castShadow
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color={['#3d4f1a', '#4a5d23', '#4d5f28'][Math.floor(Math.random() * 3)]}
              roughness={0.95}
              metalness={0.01}
            />
          </mesh>
        )
      })}

      {/* Climbing ivy on fence sections */}
      {Array.from({ length: qualityTier === 'low' ? 12 : qualityTier === 'medium' ? 22 : 35 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2
        const radius = 37.8
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh
            key={`ivy-${i}`}
            position={[x, 0.6 + Math.random() * 1.2, z]}
            rotation={[0, angle + Math.PI / 2, 0]}
            scale={0.2 + Math.random() * 0.3}
          >
            <planeGeometry args={[1.2, 2]} />
            <meshStandardMaterial
              color="#3d4f1a"
              transparent
              opacity={0.75}
              side={THREE.DoubleSide}
              roughness={0.9}
            />
          </mesh>
        )
      })}
    </group>
  )
}



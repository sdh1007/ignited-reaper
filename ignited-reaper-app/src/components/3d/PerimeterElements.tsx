'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface PerimeterElementsProps {
  qualityTier: 'high' | 'medium' | 'low'
}

export function PerimeterElements({ qualityTier }: PerimeterElementsProps) {
  const { isDayMode } = useCemeteryStore()
  const treesRef = useRef<THREE.Group>(null)
  const fenceRef = useRef<THREE.Group>(null)

  // Generate barren trees
  const trees = useMemo(() => {
    const count = qualityTier === 'high' ? 6 : qualityTier === 'medium' ? 4 : 3
    const treePositions = []
    
    for (let i = 0; i < count; i++) {
      treePositions.push({
        position: [
          (Math.random() - 0.5) * 80,
          0,
          (Math.random() - 0.5) * 80
        ] as [number, number, number],
        scale: Math.random() * 0.8 + 0.6,
        rotation: Math.random() * Math.PI * 2,
        height: Math.random() * 3 + 2,
        branches: Math.floor(Math.random() * 4) + 3
      })
    }
    return treePositions
  }, [qualityTier])

  // Generate broken fence pieces
  const fencePieces = useMemo(() => {
    const count = qualityTier === 'high' ? 12 : qualityTier === 'medium' ? 8 : 6
    const fenceItems = []
    
    for (let i = 0; i < count; i++) {
      fenceItems.push({
        position: [
          (Math.random() - 0.5) * 90,
          0,
          (Math.random() - 0.5) * 90
        ] as [number, number, number],
        rotation: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.8 + 0.6,
        broken: Math.random() > 0.5,
        height: Math.random() * 0.5 + 0.8
      })
    }
    return fenceItems
  }, [qualityTier])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Animate trees
    if (treesRef.current) {
      treesRef.current.children.forEach((tree, index) => {
        const treeData = trees[index]
        if (treeData) {
          const group = tree as THREE.Group
          group.rotation.y = treeData.rotation + Math.sin(time * 0.1 + index) * 0.05
        }
      })
    }

    // Animate fence pieces
    if (fenceRef.current) {
      fenceRef.current.children.forEach((fence, index) => {
        const fenceData = fencePieces[index]
        if (fenceData) {
          const group = fence as THREE.Group
          group.rotation.z = Math.sin(time * 0.2 + index) * 0.02
        }
      })
    }
  })

  return (
    <group>
      {/* Barren trees for silhouette framing */}
      <group ref={treesRef}>
        {trees.map((tree, index) => (
          <group
            key={`tree-${index}`}
            position={tree.position}
            scale={tree.scale}
            rotation={[0, tree.rotation, 0]}
          >
            {/* Trunk */}
            <mesh position={[0, tree.height * 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.25, tree.height, 8]} />
              <meshStandardMaterial
                color={isDayMode ? '#8b7355' : '#5d4e37'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>

            {/* Branches */}
            {Array.from({ length: tree.branches }).map((_, branchIndex) => {
              const angle = (branchIndex / tree.branches) * Math.PI * 2
              const branchHeight = tree.height * (0.6 + Math.random() * 0.3)
              const branchLength = 0.8 + Math.random() * 0.4
              
              return (
                <mesh
                  key={`branch-${branchIndex}`}
                  position={[
                    Math.cos(angle) * 0.2,
                    branchHeight,
                    Math.sin(angle) * 0.2
                  ]}
                  rotation={[
                    Math.PI / 2 + (Math.random() - 0.5) * 0.3,
                    angle,
                    (Math.random() - 0.5) * 0.2
                  ]}
                  castShadow
                >
                  <cylinderGeometry args={[0.03, 0.05, branchLength, 6]} />
                  <meshStandardMaterial
                    color={isDayMode ? '#8b7355' : '#5d4e37'}
                    roughness={0.9}
                    metalness={0.05}
                  />
                </mesh>
              )
            })}
          </group>
        ))}
      </group>

      {/* Broken wooden fence pieces */}
      <group ref={fenceRef}>
        {fencePieces.map((fence, index) => (
          <group
            key={`fence-${index}`}
            position={fence.position}
            rotation={[0, fence.rotation, 0]}
            scale={fence.scale}
          >
            {/* Fence post */}
            <mesh position={[0, fence.height * 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, fence.height, 6]} />
              <meshStandardMaterial
                color={isDayMode ? '#8b5a2b' : '#6b4423'}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>

            {/* Fence rails */}
            {!fence.broken && (
              <>
                <mesh position={[0, fence.height * 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
                  <meshStandardMaterial
                    color={isDayMode ? '#8b5a2b' : '#6b4423'}
                    roughness={0.9}
                    metalness={0.05}
                  />
                </mesh>
                <mesh position={[0, fence.height * 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
                  <meshStandardMaterial
                    color={isDayMode ? '#8b5a2b' : '#6b4423'}
                    roughness={0.9}
                    metalness={0.05}
                  />
                </mesh>
              </>
            )}

            {/* Broken pieces on ground */}
            {fence.broken && (
              <mesh position={[0.3, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
                <meshStandardMaterial
                  color={isDayMode ? '#8b5a2b' : '#6b4423'}
                  roughness={0.9}
                  metalness={0.05}
                />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* Additional perimeter details */}
      {Array.from({ length: qualityTier === 'high' ? 8 : qualityTier === 'medium' ? 6 : 4 }).map((_, index) => (
        <mesh
          key={`detail-${index}`}
          position={[
            (Math.random() - 0.5) * 85,
            0.05,
            (Math.random() - 0.5) * 85
          ]}
          rotation={[0, Math.random() * Math.PI * 2, 0]}
          scale={Math.random() * 0.5 + 0.3}
        >
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshStandardMaterial
            color={isDayMode ? '#6b7280' : '#4b5563'}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Morgue/Mausoleum building in background */}
      <group position={[-28, 0, -25]}>
        {/* Main building structure */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 5, 6]} />
          <meshStandardMaterial
            color={isDayMode ? '#9a9a9a' : '#6a6a6a'}
            roughness={0.88}
            metalness={0.05}
            emissive={isDayMode ? '#000000' : '#1a1a2e'}
            emissiveIntensity={isDayMode ? 0 : 0.05}
          />
        </mesh>

        {/* Roof - sloped */}
        <mesh position={[0, 5.3, 0]} castShadow>
          <boxGeometry args={[8.5, 0.8, 6.5]} />
          <meshStandardMaterial
            color={isDayMode ? '#6b6b6b' : '#4a4a4a'}
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
              color={isDayMode ? '#b8b8b8' : '#8a8a8a'}
              roughness={0.9}
              metalness={0.03}
            />
          </mesh>
          <mesh position={[2, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.3, 3.6, 12]} />
            <meshStandardMaterial
              color={isDayMode ? '#b8b8b8' : '#8a8a8a'}
              roughness={0.9}
              metalness={0.03}
            />
          </mesh>

          {/* Portico roof */}
          <mesh position={[0, 3.8, -0.3]} castShadow>
            <boxGeometry args={[5, 0.4, 1.5]} />
            <meshStandardMaterial
              color={isDayMode ? '#7a7a7a' : '#5a5a5a'}
              roughness={0.87}
              metalness={0.06}
            />
          </mesh>

          {/* Pediment (triangular top) */}
          <mesh position={[0, 4.5, -0.3]} castShadow>
            <coneGeometry args={[2.8, 1.2, 3]} />
            <meshStandardMaterial
              color={isDayMode ? '#8a8a8a' : '#6a6a6a'}
              roughness={0.88}
              metalness={0.05}
            />
          </mesh>
        </group>

        {/* Main entrance door - dark wood */}
        <mesh position={[0, 1.2, 3.05]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 2.4, 0.15]} />
          <meshStandardMaterial
            color="#3d2817"
            roughness={0.92}
            metalness={0.02}
            emissive={isDayMode ? '#000000' : '#2a1810'}
            emissiveIntensity={isDayMode ? 0 : 0.08}
          />
        </mesh>

        {/* Door frame */}
        <mesh position={[0, 1.2, 3.12]} castShadow>
          <boxGeometry args={[1.7, 2.6, 0.08]} />
          <meshStandardMaterial
            color={isDayMode ? '#b8b8b8' : '#8a8a8a'}
            roughness={0.9}
            metalness={0.03}
          />
        </mesh>

        {/* Windows on sides - glowing in night mode */}
        <mesh position={[-3.2, 2.5, 0]} castShadow>
          <boxGeometry args={[0.1, 1.2, 0.8]} />
          <meshStandardMaterial
            color={isDayMode ? '#2a3f5f' : '#4a5f8f'}
            roughness={0.3}
            metalness={0.6}
            transparent
            opacity={0.7}
            emissive={isDayMode ? '#000000' : '#ff8c00'}
            emissiveIntensity={isDayMode ? 0 : 0.3}
          />
        </mesh>
        <mesh position={[3.2, 2.5, 0]} castShadow>
          <boxGeometry args={[0.1, 1.2, 0.8]} />
          <meshStandardMaterial
            color={isDayMode ? '#2a3f5f' : '#4a5f8f'}
            roughness={0.3}
            metalness={0.6}
            transparent
            opacity={0.7}
            emissive={isDayMode ? '#000000' : '#ff8c00'}
            emissiveIntensity={isDayMode ? 0 : 0.3}
          />
        </mesh>

        {/* Window lights for night mode */}
        {!isDayMode && (
          <>
            <pointLight
              position={[-3.2, 2.5, 0.5]}
              color="#ff8c00"
              intensity={0.4}
              distance={5}
              decay={2}
            />
            <pointLight
              position={[3.2, 2.5, 0.5]}
              color="#ff8c00"
              intensity={0.4}
              distance={5}
              decay={2}
            />
          </>
        )}

        {/* Stone foundation */}
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <boxGeometry args={[8.2, 0.6, 6.2]} />
          <meshStandardMaterial
            color={isDayMode ? '#6b5d45' : '#4a3f2e'}
            roughness={0.95}
            metalness={0.01}
          />
        </mesh>

        {/* Cross on top of building */}
        <group position={[0, 6.5, 0]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[0.15, 1.2, 0.15]} />
            <meshStandardMaterial
              color={isDayMode ? '#4a4a4a' : '#2a2a2a'}
              roughness={0.8}
              metalness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[0.6, 0.15, 0.15]} />
            <meshStandardMaterial
              color={isDayMode ? '#4a4a4a' : '#2a2a2a'}
              roughness={0.8}
              metalness={0.3}
            />
          </mesh>
        </group>

        {/* Steps leading to entrance */}
        <mesh position={[0, 0.15, 4.2]} receiveShadow>
          <boxGeometry args={[3, 0.3, 1]} />
          <meshStandardMaterial
            color={isDayMode ? '#8b7355' : '#6b5d45'}
            roughness={0.9}
            metalness={0.02}
          />
        </mesh>
        <mesh position={[0, 0.35, 4.6]} receiveShadow>
          <boxGeometry args={[2.5, 0.2, 0.6]} />
          <meshStandardMaterial
            color={isDayMode ? '#8b7355' : '#6b5d45'}
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
    </group>
  )
}



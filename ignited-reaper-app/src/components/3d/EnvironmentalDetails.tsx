'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface EnvironmentalDetailsProps {
  qualityTier: 'high' | 'medium' | 'low'
}

export function EnvironmentalDetails({ qualityTier }: EnvironmentalDetailsProps) {
  const { isDayMode } = useCemeteryStore()
  const leavesRef = useRef<THREE.Group>(null)
  const debrisRef = useRef<THREE.Group>(null)

  // Fallen leaves configuration
  const leaves = useMemo(() => {
    const count = qualityTier === 'high' ? 80 : qualityTier === 'medium' ? 60 : 40
    const leafPositions = []
    
    for (let i = 0; i < count; i++) {
      leafPositions.push({
        position: [
          (Math.random() - 0.5) * 90,
          0.01 + Math.random() * 0.05,
          (Math.random() - 0.5) * 90
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI
        ] as [number, number, number],
        scale: Math.random() * 0.8 + 0.4,
        color: isDayMode ? '#8b5a2b' : '#6b4423',
        phase: Math.random() * Math.PI * 2
      })
    }
    return leafPositions
  }, [qualityTier, isDayMode])

  // Debris and decay elements
  const debris = useMemo(() => {
    const count = qualityTier === 'high' ? 25 : qualityTier === 'medium' ? 18 : 12
    const debrisItems = []
    
    for (let i = 0; i < count; i++) {
      debrisItems.push({
        position: [
          (Math.random() - 0.5) * 80,
          0.02 + Math.random() * 0.1,
          (Math.random() - 0.5) * 80
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI
        ] as [number, number, number],
        scale: Math.random() * 0.6 + 0.3,
        type: Math.random() > 0.5 ? 'twig' : 'stone',
        phase: Math.random() * Math.PI * 2
      })
    }
    return debrisItems
  }, [qualityTier])

  // Moss patches on gravestones
  const mossPatches = useMemo(() => {
    const count = qualityTier === 'high' ? 15 : qualityTier === 'medium' ? 10 : 6
    const mossItems = []
    
    for (let i = 0; i < count; i++) {
      mossItems.push({
        position: [
          (Math.random() - 0.5) * 60,
          Math.random() * 2 + 0.5,
          (Math.random() - 0.5) * 60
        ] as [number, number, number],
        scale: Math.random() * 1.5 + 0.8,
        rotation: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2
      })
    }
    return mossItems
  }, [qualityTier])

  // Cobwebs
  const cobwebs = useMemo(() => {
    const count = qualityTier === 'high' ? 8 : qualityTier === 'medium' ? 6 : 4
    const webItems = []
    
    for (let i = 0; i < count; i++) {
      webItems.push({
        position: [
          (Math.random() - 0.5) * 70,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 70
        ] as [number, number, number],
        scale: Math.random() * 2 + 1,
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI
        ] as [number, number, number],
        phase: Math.random() * Math.PI * 2
      })
    }
    return webItems
  }, [qualityTier])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Animate leaves
    if (leavesRef.current) {
      leavesRef.current.children.forEach((leaf, index) => {
        const leafData = leaves[index]
        if (leafData) {
          const mesh = leaf as THREE.Mesh
          const material = mesh.material as THREE.MeshBasicMaterial
          
          // Gentle swaying
          mesh.rotation.z = Math.sin(time * 0.5 + leafData.phase) * 0.1
          mesh.position.y = leafData.position[1] + Math.sin(time * 0.3 + leafData.phase) * 0.02
          
          // Color variation
          const colorVariation = Math.sin(time * 0.2 + leafData.phase) * 0.1
          material.color.setHex(parseInt(leafData.color.replace('#', ''), 16))
          material.color.offsetHSL(colorVariation, 0, 0)
        }
      })
    }

    // Animate debris
    if (debrisRef.current) {
      debrisRef.current.children.forEach((debrisMesh, index) => {
        const debrisData = debris[index]
        if (debrisData) {
          const mesh = debrisMesh as THREE.Mesh
          
          // Slight movement
          mesh.position.y = debrisData.position[1] + Math.sin(time * 0.4 + debrisData.phase) * 0.01
          mesh.rotation.y = debrisData.rotation[1] + time * 0.1
        }
      })
    }
  })

  return (
    <group>
      {/* Fallen leaves */}
      <group ref={leavesRef}>
        {leaves.map((leaf, index) => (
          <mesh
            key={`leaf-${index}`}
            position={leaf.position}
            rotation={leaf.rotation}
            scale={leaf.scale}
          >
            <planeGeometry args={[0.8, 0.6]} />
            <meshBasicMaterial
              color={leaf.color}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Debris and decay */}
      <group ref={debrisRef}>
        {debris.map((item, index) => (
          <mesh
            key={`debris-${index}`}
            position={item.position}
            rotation={item.rotation}
            scale={item.scale}
          >
            {item.type === 'twig' ? (
              <cylinderGeometry args={[0.05, 0.08, 0.8, 6]} />
            ) : (
              <sphereGeometry args={[0.3, 8, 6]} />
            )}
            <meshStandardMaterial
              color={isDayMode ? '#8b7355' : '#5d4e37'}
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>
        ))}
      </group>

      {/* Moss patches */}
      {mossPatches.map((moss, index) => (
        <mesh
          key={`moss-${index}`}
          position={moss.position}
          rotation={[0, moss.rotation, 0]}
          scale={moss.scale}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={isDayMode ? '#4a5d23' : '#2d3a14'}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
            roughness={0.95}
            metalness={0.02}
          />
        </mesh>
      ))}

      {/* Cobwebs */}
      {cobwebs.map((web, index) => (
        <mesh
          key={`cobweb-${index}`}
          position={web.position}
          rotation={web.rotation}
          scale={web.scale}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#e2e8f0"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Weathering effects on gravestones */}
      {Array.from({ length: qualityTier === 'high' ? 12 : qualityTier === 'medium' ? 8 : 4 }).map((_, index) => (
        <mesh
          key={`weathering-${index}`}
          position={[
            (Math.random() - 0.5) * 50,
            Math.random() * 1.5 + 0.5,
            (Math.random() - 0.5) * 50
          ]}
          rotation={[0, Math.random() * Math.PI * 2, 0]}
          scale={Math.random() * 0.8 + 0.4}
        >
          <planeGeometry args={[0.5, 0.3]} />
          <meshStandardMaterial
            color={isDayMode ? '#6b7280' : '#4b5563'}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Ground cracks */}
      {Array.from({ length: qualityTier === 'high' ? 8 : qualityTier === 'medium' ? 6 : 4 }).map((_, index) => (
        <mesh
          key={`crack-${index}`}
          position={[
            (Math.random() - 0.5) * 80,
            0.005,
            (Math.random() - 0.5) * 80
          ]}
          rotation={[-Math.PI / 2, Math.random() * Math.PI * 2, 0]}
          scale={Math.random() * 3 + 2}
        >
          <planeGeometry args={[0.1, 1]} />
          <meshStandardMaterial
            color={isDayMode ? '#374151' : '#1f2937'}
            roughness={0.95}
            metalness={0.02}
          />
        </mesh>
      ))}
    </group>
  )
}










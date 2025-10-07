'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useCemeteryStore } from '@/store/cemetery'
import { SocialProfile } from '@/lib/types'
import * as THREE from 'three'

interface SimpleGravestoneProps {
  profile: SocialProfile
  position: [number, number, number]
}

export function SimpleGravestone({ profile, position }: SimpleGravestoneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { setSelectedProfile, isDayMode } = useCemeteryStore()

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        0.3,
        0.1
      )
    } else if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        0,
        0.1
      )
    }
  })

  const handleClick = () => {
    setSelectedProfile(profile)
  }

  const getGravestoneColor = () => {
    if (isDayMode) {
      return '#9ca3af'
    }
    return hovered ? profile.color : '#4b5563'
  }

  return (
    <group position={position}>
      {/* Main gravestone */}
      <RoundedBox
        ref={meshRef}
        args={[1.5, 2, 0.3]}
        radius={0.1}
        smoothness={4}
        position={[0, 1, 0]}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
        material-color={getGravestoneColor()}
        material-roughness={0.8}
        material-metalness={0.1}
      />

      {/* Platform icon area */}
      <RoundedBox
        args={[0.8, 0.8, 0.31]}
        radius={0.05}
        smoothness={4}
        position={[0, 1.4, 0.01]}
        material-color={profile.color}
      />

      {/* Base */}
      <RoundedBox
        args={[2, 0.3, 1]}
        radius={0.05}
        smoothness={4}
        position={[0, 0.15, 0]}
        receiveShadow
        material-color={isDayMode ? '#6b7280' : '#374151'}
        material-roughness={0.9}
      />

      {/* Simple particle effects for hovered state */}
      {hovered && !isDayMode && (
        <group>
          {Array.from({ length: 3 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 2,
                Math.random() * 2 + 1,
                (Math.random() - 0.5) * 1
              ]}
            >
              <sphereGeometry args={[0.02]} />
              <meshBasicMaterial 
                color={profile.color} 
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}
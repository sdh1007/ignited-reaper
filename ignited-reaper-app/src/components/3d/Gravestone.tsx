'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import { useCemeteryStore } from '@/store/cemetery'
import { SocialProfile } from '@/lib/types'
import * as THREE from 'three'

interface GravestoneProps {
  profile: SocialProfile
  position: [number, number, number]
}

export function Gravestone({ profile, position }: GravestoneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { setSelectedProfile, isDayMode } = useCemeteryStore()

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        0.3,
        0.1
      )
      if (glowRef.current && 'opacity' in glowRef.current.material) {
        (glowRef.current.material as any).opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      }
    } else if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        0,
        0.1
      )
      if (glowRef.current && 'opacity' in glowRef.current.material) {
        (glowRef.current.material as any).opacity = 0
      }
    }
  })

  const handleClick = () => {
    setSelectedProfile(profile)
  }

  const getGravestoneColor = () => {
    if (isDayMode) {
      return '#9ca3af' // Light gray for day
    }
    return '#4b5563' // Darker gray for night
  }

  const getTextColor = () => {
    if (isDayMode) {
      return '#374151'
    }
    return '#d1d5db'
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

      {/* Glow effect */}
      <RoundedBox
        ref={glowRef}
        args={[1.7, 2.2, 0.4]}
        radius={0.15}
        smoothness={4}
        position={[0, 1, 0]}
      >
        <meshBasicMaterial 
          color={profile.color}
          transparent
          opacity={0}
        />
      </RoundedBox>

      {/* Platform icon area */}
      <RoundedBox
        args={[0.8, 0.8, 0.31]}
        radius={0.05}
        smoothness={4}
        position={[0, 1.4, 0.01]}
        material-color={profile.color}
        material-emissive={profile.color}
        material-emissiveIntensity={hovered ? 0.3 : 0.1}
      />

      {/* Display name */}
      <Text
        position={[0, 0.8, 0.16]}
        fontSize={0.12}
        color={getTextColor()}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.2}
      >
        {profile.displayName}
      </Text>

      {/* Handle */}
      <Text
        position={[0, 0.6, 0.16]}
        fontSize={0.08}
        color={profile.color}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.2}
      >
        {profile.handle}
      </Text>

      {/* Year joined */}
      <Text
        position={[0, 0.4, 0.16]}
        fontSize={0.06}
        color={getTextColor()}
        anchorX="center"
        anchorY="middle"
        material-opacity={0.7}
      >
        Est. {profile.yearJoined}
      </Text>

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

      {/* Particle effects for hovered state */}
      {hovered && !isDayMode && (
        <group>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 3,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 2
              ]}
            >
              <sphereGeometry args={[0.02]} />
              <meshBasicMaterial 
                color="#fbbf24" 
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}
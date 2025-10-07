'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, Billboard } from '@react-three/drei'
import { useCemeteryStore } from '@/store/cemetery'
import type { Platform, SocialProfile, PlotStyle } from '@/lib/types'
import * as THREE from 'three'

const gravestoneDimensions: Record<string, { width: number; height: number; depth: number; radius: number }> = {
  rounded: { width: 1.4, height: 2.2, depth: 0.32, radius: 0.24 },
  obelisk: { width: 0.9, height: 2.9, depth: 0.85, radius: 0.08 },
  cross: { width: 1.8, height: 2.5, depth: 0.22, radius: 0.06 },
  wide: { width: 2.3, height: 1.7, depth: 0.36, radius: 0.18 },
  gothic: { width: 1.5, height: 2.6, depth: 0.3, radius: 0.16 },
  modern: { width: 1.6, height: 2.1, depth: 0.4, radius: 0.12 },
  angular: { width: 1.4, height: 2.2, depth: 0.35, radius: 0.05 },
  curved: { width: 1.7, height: 2.0, depth: 0.32, radius: 0.18 },
  stepped: { width: 1.8, height: 2.4, depth: 0.34, radius: 0.12 },
  tablet: { width: 1.6, height: 2.15, depth: 0.28, radius: 0.22 },
  footstone: { width: 1.1, height: 1.1, depth: 0.26, radius: 0.1 },
}

const platformShapeOptions: Partial<Record<Platform, string[]>> = {
  twitter: ['rounded', 'tablet', 'footstone'],
  instagram: ['curved', 'gothic', 'stepped'],
  tiktok: ['cross', 'angular', 'stepped'],
  youtube: ['obelisk', 'tablet', 'wide'],
  twitch: ['gothic', 'modern', 'angular'],
  linkedin: ['modern', 'obelisk', 'tablet'],
  github: ['angular', 'rounded', 'footstone'],
  discord: ['curved', 'rounded', 'stepped'],
}

const defaultShapeOptions: string[] = ['rounded', 'modern', 'gothic', 'stepped']

function createRandomGenerator(seedString: string) {
  let seed = 0
  for (let i = 0; i < seedString.length; i += 1) {
    seed = (seed << 5) - seed + seedString.charCodeAt(i)
    seed |= 0
  }
  return () => {
    seed += 1
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
}

interface OptimizedGravestoneProps {
  profile: SocialProfile
  position: [number, number, number]
  qualityTier?: 'high' | 'medium' | 'low'
}

type LODLevel = 'high' | 'medium' | 'low' | 'culled'

export const OptimizedGravestone = memo(function OptimizedGravestone({ profile, position, qualityTier = 'high' }: OptimizedGravestoneProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [lodLevel, setLodLevel] = useState<LODLevel>('high')
  const [isInFrustum, setIsInFrustum] = useState(true)

  const { setSelectedProfile, isDayMode } = useCemeteryStore()
  const selectedProfileId = useCemeteryStore((state) => state.selectedProfile?.id)
  const isSelected = selectedProfileId === profile.id

  const { camera } = useThree()
  const frustum = useMemo(() => new THREE.Frustum(), [])
  const cameraViewProjectionMatrix = useMemo(() => new THREE.Matrix4(), [])

  const variations = useMemo(() => {
    const rand = createRandomGenerator(profile.id)
    const desiredShape = profile.plotStyle
    const shapeChoices = platformShapeOptions[profile.platform] ?? defaultShapeOptions
    const shape = (desiredShape && (shapeChoices.includes(desiredShape) ? desiredShape : desiredShape)) ??
      shapeChoices[Math.floor(rand() * shapeChoices.length)]
    const base = gravestoneDimensions[shape as keyof typeof gravestoneDimensions] ?? gravestoneDimensions.rounded

    const width = base.width * (0.9 + rand() * 0.25)
    const height = base.height * (0.85 + rand() * 0.45)
    const depth = base.depth

    return {
      shape,
      dimensions: { width, height, depth },
      baseHeight: 0.12 + rand() * 0.12,
      tilt: (rand() - 0.5) * 0.1,
      floatPhase: rand() * Math.PI * 2,
      glowHeight: height * (0.55 + rand() * 0.12),
    }
  }, [profile.id, profile.platform, profile.plotStyle])

  // Frustum culling & LOD calculation
  useFrame((state) => {
    if (!meshRef.current) return

    // Update frustum
    cameraViewProjectionMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix)

    // Check if gravestone is in frustum
    const worldPosition = new THREE.Vector3(position[0], position[1], position[2])
    const inFrustum = frustum.containsPoint(worldPosition)
    
    if (inFrustum !== isInFrustum) {
      setIsInFrustum(inFrustum)
    }

    // Calculate distance-based LOD
    if (inFrustum) {
      const distance = camera.position.distanceTo(worldPosition)
      
      let newLodLevel: LODLevel
      if (distance < 15 || isSelected || hovered) {
        newLodLevel = 'high'
      } else if (distance < 35) {
        newLodLevel = 'medium'
      } else if (distance < 60) {
        newLodLevel = 'low'
      } else {
        newLodLevel = 'culled'
      }

      if (newLodLevel !== lodLevel) {
        setLodLevel(newLodLevel)
      }

      // Simple float animation (only for close stones)
      if (newLodLevel === 'high') {
        const t = state.clock.elapsedTime
        const float = Math.sin(t * 0.4 + variations.floatPhase) * 0.08
        meshRef.current.position.y = float + (hovered ? 0.08 : 0)
        meshRef.current.rotation.y = variations.tilt + Math.sin(t * 0.25 + variations.floatPhase) * 0.04
      }
    }
  })

  const handleClick = () => {
    setSelectedProfile(profile)
  }

  const baseStoneColor = isDayMode ? '#a8b2c1' : '#3a4558'

  // Don't render if culled by frustum or distance
  if (!isInFrustum || lodLevel === 'culled') {
    return null
  }

  // Simplified rendering based on LOD
  const { width, height, depth } = variations.dimensions

  // LOD: LOW - Simple box only
  if (lodLevel === 'low') {
    return (
      <group
        ref={meshRef}
        position={position}
        onClick={handleClick}
      >
        <mesh castShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color={baseStoneColor}
            roughness={0.92}
            metalness={0.02}
          />
        </mesh>
        {/* Simple glow */}
        <mesh position={[0, variations.glowHeight, 0]}>
          <sphereGeometry args={[width * 0.4]} />
          <meshBasicMaterial
            color={profile.color}
            transparent
            opacity={0.08}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    )
  }

  // LOD: MEDIUM - Box + base + simple glow
  if (lodLevel === 'medium') {
    return (
      <group
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        {/* Base */}
        <RoundedBox
          args={[width + 0.6, variations.baseHeight, depth + 0.55]}
          radius={0.08}
          position={[0, variations.baseHeight / 2, 0]}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial
            color={isDayMode ? '#5a6878' : '#0f1419'}
            roughness={0.98}
            metalness={0.01}
          />
        </RoundedBox>

        {/* Stone */}
        <group position={[0, variations.baseHeight, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={baseStoneColor}
              roughness={0.92}
              metalness={0.02}
              emissive={isDayMode ? '#0f1419' : '#05080c'}
              emissiveIntensity={hovered ? 0.12 : 0.06}
            />
          </mesh>
        </group>

        {/* Platform glow */}
        <mesh position={[0, variations.glowHeight, 0]}>
          <sphereGeometry args={[width * 0.4]} />
          <meshBasicMaterial
            color={profile.color}
            transparent
            opacity={isDayMode ? 0.08 : 0.14}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Hover indicator */}
        {hovered && (
          <Billboard position={[0, height + 0.5, 0]}>
            <mesh>
              <circleGeometry args={[0.3, 16]} />
              <meshBasicMaterial
                color={profile.color}
                transparent
                opacity={0.6}
              />
            </mesh>
          </Billboard>
        )}
      </group>
    )
  }

  // LOD: HIGH - Full detail (import from original component)
  // For now, use medium detail with extra effects
  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Base plinth */}
      <RoundedBox
        args={[width + 0.6, variations.baseHeight, depth + 0.55]}
        radius={0.08}
        position={[0, variations.baseHeight / 2, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color={isDayMode ? '#5a6878' : '#0f1419'}
          roughness={0.98}
          metalness={0.01}
        />
      </RoundedBox>

      {/* Gravestone body */}
      <group position={[0, variations.baseHeight, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color={baseStoneColor}
            roughness={0.92}
            metalness={0.02}
            emissive={isDayMode ? '#0f1419' : '#05080c'}
            emissiveIntensity={hovered ? 0.12 : 0.06}
          />
        </mesh>

        {/* Name plate */}
        <Billboard position={[0, -height * 0.2, depth / 2 + 0.01]}>
          <mesh>
            <planeGeometry args={[width * 0.7, 0.3]} />
            <meshBasicMaterial
              color={isDayMode ? '#cbd5e1' : '#94a3b8'}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Billboard>
      </group>

      {/* Platform aura - enhanced for selected/hovered */}
      <group position={[0, variations.glowHeight, 0]}>
        <mesh>
          <sphereGeometry args={[width * 0.4]} />
          <meshBasicMaterial
            color={profile.color}
            transparent
            opacity={hovered || isSelected ? 0.24 : (isDayMode ? 0.08 : 0.14)}
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <pointLight
          position={[0, 0.1, 0]}
          color={profile.color}
          distance={4}
          decay={2}
          intensity={hovered || isSelected ? 0.8 : (isDayMode ? 0.18 : 0.42)}
        />
      </group>

      {/* Selection indicator */}
      {isSelected && (
        <group position={[0, variations.baseHeight, depth / 2 + 0.45]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.24, 12]} />
            <meshStandardMaterial color={isDayMode ? '#5c6778' : '#2a303c'} roughness={0.8} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial 
              color={profile.color} 
              emissive={profile.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )}

      {/* Hover indicator */}
      {hovered && (
        <Billboard position={[0, height + variations.baseHeight + 0.5, 0]}>
          <mesh>
            <circleGeometry args={[0.4, 32]} />
            <meshBasicMaterial
              color={profile.color}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Billboard>
      )}
    </group>
  )
})

OptimizedGravestone.displayName = 'OptimizedGravestone'


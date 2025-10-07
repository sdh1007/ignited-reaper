'use client'

import { Suspense, useEffect, useMemo, useRef, useState, Component, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
// Removed PerformanceMonitor import to avoid troika-three-text warnings
import { useCemeteryStore } from '@/store/cemetery'
import { SocialProfile } from '@/lib/types'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { GraveyardElements } from './GraveyardElements'
import { CinematicCamera } from './CinematicCamera'
// Day mode components
import { DayModeLighting } from './DayModeLighting'
import { Skybox } from './Skybox'
import { RealisticGravestones } from './RealisticGravestones'
import { RealisticEnvironment } from './RealisticEnvironment'
import { EnhancedTreesFences } from './EnhancedTreesFences'
import { EnvironmentalLife } from './EnvironmentalLife'
import { WindSimulation } from './WindSimulation'
import { PostProcessingEffects } from './PostProcessingEffects'
// Night mode components
import { BalancedLighting } from './BalancedLighting'
import { EnvironmentalDepth } from './EnvironmentalDepth'
import { ConsistentGravestones } from './ConsistentGravestones'
import { GroundLevelFog } from './GroundLevelFog'
import { InteractiveElements } from './InteractiveElements'
import { VisualFraming } from './VisualFraming'
import { PerimeterElements } from './PerimeterElements'
import * as THREE from 'three'

type QualityTier = 'high' | 'medium' | 'low'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('Three.js component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1, 2, 0.2]} />
          <meshStandardMaterial color="#4a5568" roughness={0.9} metalness={0.1} />
        </mesh>
      )
    }

    return this.props.children
  }
}

interface CemeterySceneProps {
  qualityTier: QualityTier
  stones: Array<{ profile: SocialProfile; position: [number, number, number] }>
}

function CemeteryScene({ qualityTier, stones }: CemeterySceneProps) {
  const { isDayMode } = useCemeteryStore()
  const isMedium = qualityTier === 'medium'
  const isLow = qualityTier === 'low'

  const primaryMapSize = isLow ? 1024 : isMedium ? 1536 : 2048
  const secondaryIntensity = isLow ? 0.35 : isMedium ? 0.45 : 0.55
  const primarySpotIntensity = isLow ? 0.45 : isMedium ? 0.6 : 0.75
  const secondarySpotIntensity = isLow ? 0.32 : isMedium ? 0.45 : 0.6

  // Error boundary wrapper for materials
  const safeRenderComponent = (component: JSX.Element, fallback?: JSX.Element) => {
    try {
      return component
    } catch (error) {
      console.warn('Component render error:', error)
      return fallback || null
    }
  }

  return (
    <>
      {/* Background & fog */}
      <color attach="background" args={[isDayMode ? '#87ceeb' : '#0a1424']} />
      <fog attach="fog" args={[isDayMode ? '#cbd5f5' : '#1a2332', 30, isDayMode ? 120 : 90]} />

      {/* Day Mode Components */}
      {isDayMode ? (
        <>
          {/* Skybox with daytime gradient */}
          <Skybox qualityTier={qualityTier} />
          
          {/* Day mode lighting with sun and shadows */}
          <DayModeLighting qualityTier={qualityTier} />
          
          {/* Realistic environment with grass, paths, and vegetation */}
          <RealisticEnvironment 
            qualityTier={qualityTier} 
            stones={stones.map((stone) => ({ 
              position: [stone.position[0], stone.position[2]] as [number, number], 
              color: stone.profile.color 
            }))} 
          />
          
          {/* Enhanced trees and fences with realistic materials */}
          <EnhancedTreesFences qualityTier={qualityTier} />
          
          {/* Realistic gravestones with weathering and materials */}
          {stones.map((stone) => (
            stone.profile && (
              <RealisticGravestones 
                key={stone.profile.id} 
                profile={stone.profile}
                position={stone.position}
                qualityTier={qualityTier}
              />
            )
          ))}
          
          {/* Environmental life - butterflies and birds */}
          <EnvironmentalLife qualityTier={qualityTier} />
          
          {/* Wind simulation for trees and vegetation */}
          <WindSimulation qualityTier={qualityTier} />
          
          {/* Post-processing effects - vignette and color grading */}
          <PostProcessingEffects qualityTier={qualityTier} />
        </>
      ) : (
        <>
          {/* Night Mode Components */}
          {/* Balanced lighting system with cool/warm contrast */}
          <BalancedLighting qualityTier={qualityTier} />

          {/* Night sky backdrop */}
          <mesh>
            <sphereGeometry args={[200, 32, 32]} />
            <meshBasicMaterial
              color="#0a1424"
              side={THREE.BackSide}
            />
          </mesh>

          {/* Enhanced environmental depth with ground textures and perimeter features */}
          <EnvironmentalDepth qualityTier={qualityTier} stones={stones.map((stone) => ({ position: [stone.position[0], stone.position[2]] as [number, number], color: stone.profile.color }))} />

          {/* Consistent gravestones with uniform rendering */}
          {stones.map((stone) => (
            <ConsistentGravestones 
              key={stone.profile.id} 
              profile={stone.profile}
              position={stone.position}
              qualityTier={qualityTier}
            />
          ))}

          {/* Ground-level depth-responsive fog */}
          <GroundLevelFog qualityTier={qualityTier} />
          
          {/* Perimeter elements for framing */}
          <PerimeterElements qualityTier={qualityTier} />
          
          {/* Spooky graveyard elements */}
          <GraveyardElements />
          
          {/* Subtle interactive elements with cinematic polish */}
          <InteractiveElements qualityTier={qualityTier} />
          
          {/* Visual framing and starry background */}
          <VisualFraming qualityTier={qualityTier} />
        </>
      )}

      {/* Fallback gravestones for any missing profiles */}
      {stones.length === 0 && (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1, 2, 0.2]} />
          <meshStandardMaterial color="#4a5568" roughness={0.9} metalness={0.1} />
        </mesh>
      )}

      {/* Cinematic camera for both modes */}
      <CinematicCamera />
    </>
  )
}

export function SafeCemetery() {
  const { isDayMode } = useCemeteryStore()
  const [qualityTier, setQualityTier] = useState<QualityTier>('high')
  const declineStreak = useRef(0)
  const [maxDevicePixelRatio, setMaxDevicePixelRatio] = useState(1.5)

  const filteredProfiles = useCemeteryStore((state) => state.filteredProfiles)

  const arrangedStoneData = useMemo(() => {
    const profiles = filteredProfiles()
    
    const jittered = profiles.map((profile, index) => {
      const offsetX = Math.sin(profile.position.z * 0.18 + index * 0.37) * 1.4
      const offsetZ = Math.sin(profile.position.x * 0.15 + index * 0.22) * 0.9
      return {
        profile,
        position: [profile.position.x + offsetX, 0.1, profile.position.z + offsetZ] as [number, number, number], // Slightly elevated to prevent floating
      }
    })

    jittered.sort((a, b) => a.position[2] - b.position[2])
    return jittered
  }, [filteredProfiles])

  const targetDpr = useMemo(() => {
    if (typeof window === 'undefined') {
      if (qualityTier === 'high') return 1.5
      if (qualityTier === 'medium') return 1.25
      return 1.1
    }
    const native = window.devicePixelRatio || 1
    if (qualityTier === 'high') return Math.min(native, 1.6)
    if (qualityTier === 'medium') return Math.min(native, 1.3)
    return Math.min(native, 1.12)
  }, [qualityTier])

  useEffect(() => {
    setMaxDevicePixelRatio(targetDpr)
  }, [targetDpr])

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ 
          position: [0, 18, 30], 
          fov: 45,
          near: 0.1,
          far: 1000 
        }}
        shadows={qualityTier !== 'low'}
        className="w-full h-full"
        gl={{
          antialias: qualityTier !== 'low',
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
          alpha: false,
        }}
        onCreated={({ gl, scene, camera }) => {
          try {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = isDayMode ? 1.25 : 0.75
            gl.outputColorSpace = THREE.SRGBColorSpace
            gl.shadowMap.enabled = qualityTier !== 'low'
            gl.shadowMap.type = THREE.PCFSoftShadowMap
          } catch (error) {
            console.warn('WebGL setup warning:', error)
          }
        }}
        dpr={[1, maxDevicePixelRatio]}
      >
        {/* PerformanceMonitor removed to avoid troika-three-text warnings */}
        <Suspense fallback={null}>
          <ErrorBoundary>
            <CemeteryScene qualityTier={qualityTier} stones={arrangedStoneData} />
          </ErrorBoundary>
        </Suspense>
      </Canvas>

      {/* Loading fallback */}
      <Suspense fallback={<LoadingSpinner />}>
        <div />
      </Suspense>
    </div>
  )
}

function PerimeterFence() {
  const fenceGroup = useMemo(() => {
    const posts: JSX.Element[] = []
    const length = 52
    const spacing = 4
    for (let i = -length; i <= length; i += spacing) {
      posts.push(
        <mesh key={`north-${i}`} position={[i, 0.6, -28]}>
          <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
          <meshStandardMaterial color="#1a2331" roughness={0.7} metalness={0.2} />
        </mesh>
      )
      posts.push(
        <mesh key={`south-${i}`} position={[i, 0.6, 28]}>
          <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
          <meshStandardMaterial color="#1a2331" roughness={0.7} metalness={0.2} />
        </mesh>
      )
    }
    for (let z = -24; z <= 24; z += spacing) {
      posts.push(
        <mesh key={`west-${z}`} position={[-30, 0.6, z]}>
          <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
          <meshStandardMaterial color="#1a2331" roughness={0.7} metalness={0.2} />
        </mesh>
      )
      posts.push(
        <mesh key={`east-${z}`} position={[30, 0.6, z]}>
          <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
          <meshStandardMaterial color="#1a2331" roughness={0.7} metalness={0.2} />
        </mesh>
      )
    }
    const rails: JSX.Element[] = []
    rails.push(
      <mesh key="north-rail" position={[0, 1.1, -28]} rotation={[0, 0, 0]}>
        <boxGeometry args={[length * 2, 0.15, 0.3]} />
        <meshStandardMaterial color="#29303d" roughness={0.6} metalness={0.3} />
      </mesh>
    )
    rails.push(
      <mesh key="south-rail" position={[0, 1.1, 28]}>
        <boxGeometry args={[length * 2, 0.15, 0.3]} />
        <meshStandardMaterial color="#29303d" roughness={0.6} metalness={0.3} />
      </mesh>
    )
    rails.push(
      <mesh key="west-rail" position={[-30, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[length * 2, 0.15, 0.3]} />
        <meshStandardMaterial color="#29303d" roughness={0.6} metalness={0.3} />
      </mesh>
    )
    rails.push(
      <mesh key="east-rail" position={[30, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[length * 2, 0.15, 0.3]} />
        <meshStandardMaterial color="#29303d" roughness={0.6} metalness={0.3} />
      </mesh>
    )

    return { posts, rails }
  }, [])

  return (
    <group>
      {fenceGroup.posts}
      {fenceGroup.rails}
    </group>
  )
}

interface LeaflessTreeProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

function LeaflessTree({ position, rotation = [0, 0, 0], scale = 1 }: LeaflessTreeProps) {
  const branches = useMemo(() => {
    const limbs: JSX.Element[] = []
    const rng = Math.random
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Math.PI * 2 + rng() * 0.4
      const length = 2.2 + rng() * 1.2
      limbs.push(
        <mesh key={`limb-${i}`} position={[Math.cos(angle) * 0.1, 1.9 + rng() * 0.6, Math.sin(angle) * 0.1]} rotation={[Math.PI / 2 + rng() * 0.4, angle, 0]}>
          <cylinderGeometry args={[0.05, 0.01, length, 4]} />
          <meshStandardMaterial color="#1d1f26" roughness={0.9} metalness={0.05} />
        </mesh>
      )
    }
    return limbs
  }, [])

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow position={[0, 1.2, 0]}
        rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.4, 2.4, 6]} />
        <meshStandardMaterial color="#1f242f" roughness={0.95} metalness={0.05} />
      </mesh>
      {branches}
    </group>
  )
}

interface DistantMausoleumProps {
  position: [number, number, number]
}

function DistantMausoleum({ position }: DistantMausoleumProps) {
  return (
    <group position={position} scale={[1.4, 1.4, 1.4]}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[6, 2.2, 4.4]} />
        <meshStandardMaterial color="#2a3242" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 2.7, 0]} castShadow>
        <cylinderGeometry args={[0, 3.6, 1.6, 4]} />
        <meshStandardMaterial color="#333c4f" roughness={0.88} metalness={0.06} />
      </mesh>
      <mesh position={[0, 1.0, 2.2]}>
        <planeGeometry args={[2.6, 1.6]} />
        <meshStandardMaterial color="#1b2331" roughness={0.9} metalness={0.04} />
      </mesh>
    </group>
  )
}

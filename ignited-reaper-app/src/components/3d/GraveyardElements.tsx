'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

interface GhostProps {
  position: [number, number, number]
  scale?: number
  speed?: number
  phase?: number
}

function Ghost({ position, scale = 1, speed = 1, phase = 0 }: GhostProps) {
  const ghostRef = useRef<THREE.Group>(null)
  const { isDayMode } = useCemeteryStore()

  useFrame((state) => {
    if (!ghostRef.current || isDayMode) return
    
    const time = state.clock.elapsedTime * speed + phase
    const float = Math.sin(time * 0.8) * 0.3
    const sway = Math.sin(time * 0.4) * 0.2
    
    ghostRef.current.position.y = position[1] + float
    ghostRef.current.rotation.y = sway
    ghostRef.current.rotation.z = Math.sin(time * 0.6) * 0.1
  })

  if (isDayMode) return null

  return (
    <group ref={ghostRef} position={position} scale={scale}>
      {/* Ghost body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshBasicMaterial 
          color="#e2e8f0" 
          transparent 
          opacity={0.6} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Ghost tail */}
      <mesh position={[0, -0.4, 0]}>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshBasicMaterial 
          color="#e2e8f0" 
          transparent 
          opacity={0.4} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Ghost eyes */}
      <mesh position={[-0.2, 0.2, 0.7]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0.2, 0.2, 0.7]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      {/* Glow effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2]} />
        <meshBasicMaterial 
          color="#e2e8f0" 
          transparent 
          opacity={0.1} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

interface SkeletonProps {
  position: [number, number, number]
  scale?: number
  phase?: number
}

function Skeleton({ position, scale = 1, phase = 0 }: SkeletonProps) {
  const skeletonRef = useRef<THREE.Group>(null)
  const { isDayMode } = useCemeteryStore()

  useFrame((state) => {
    if (!skeletonRef.current) return
    
    const time = state.clock.elapsedTime + phase
    const sway = Math.sin(time * 0.3) * 0.1
    const headBob = Math.sin(time * 0.5) * 0.05
    
    skeletonRef.current.rotation.y = sway
    skeletonRef.current.children[0]?.position.setY(headBob) // Head bob
  })

  return (
    <group ref={skeletonRef} position={position} scale={scale}>
      {/* Skull */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={isDayMode ? "#f5f5f5" : "#e2e8f0"} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Jaw */}
      <mesh position={[0, 1.4, 0.1]}>
        <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial 
          color={isDayMode ? "#f5f5f5" : "#e2e8f0"} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Spine */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
        <meshStandardMaterial 
          color={isDayMode ? "#f5f5f5" : "#e2e8f0"} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Ribs */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 1.2 - i * 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 8]} />
          <meshStandardMaterial 
            color={isDayMode ? "#f5f5f5" : "#e2e8f0"} 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}
      
      {/* Arms */}
      <mesh position={[-0.4, 1.0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
        <meshStandardMaterial 
          color={isDayMode ? "#f5f5f5" : "#e2e8f0"} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.4, 1.0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
        <meshStandardMaterial 
          color={isDayMode ? "#f5f5f5" : "#e2e8f0"} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.2, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial 
          color={isDayMode ? "#f5f5f5" : "#e2e8f0"} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.2, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial 
          color={isDayMode ? "#f5f5f5" : "#e2e8f0"} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Glowing eyes */}
      {!isDayMode && (
        <>
          <mesh position={[-0.1, 1.65, 0.25]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          <mesh position={[0.1, 1.65, 0.25]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </>
      )}
    </group>
  )
}

interface TombstoneProps {
  position: [number, number, number]
  scale?: number
  angle?: number
}

function Tombstone({ position, scale = 1, angle = 0 }: TombstoneProps) {
  const { isDayMode } = useCemeteryStore()
  
  return (
    <group position={position} scale={scale} rotation={[0, angle, 0]}>
      {/* Main stone */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.8, 1.6, 0.2]} />
        <meshStandardMaterial 
          color={isDayMode ? "#a0a0a0" : "#4a5568"} 
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      
      {/* Cross on top */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial 
          color={isDayMode ? "#a0a0a0" : "#4a5568"} 
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial 
          color={isDayMode ? "#a0a0a0" : "#4a5568"} 
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[1.0, 0.2, 0.4]} />
        <meshStandardMaterial 
          color={isDayMode ? "#8a8a8a" : "#2d3748"} 
          roughness={0.95}
          metalness={0.02}
        />
      </mesh>
    </group>
  )
}

interface SpiderProps {
  position: [number, number, number]
  scale?: number
  phase?: number
}

function Spider({ position, scale = 1, phase = 0 }: SpiderProps) {
  const spiderRef = useRef<THREE.Group>(null)
  const { isDayMode } = useCemeteryStore()

  useFrame((state) => {
    if (!spiderRef.current) return
    
    const time = state.clock.elapsedTime + phase
    const crawl = Math.sin(time * 2) * 0.1
    const legWave = Math.sin(time * 4) * 0.2
    
    spiderRef.current.position.x = position[0] + crawl
    spiderRef.current.rotation.y = Math.sin(time * 0.5) * 0.1
    
    // Animate legs
    spiderRef.current.children.forEach((child, i) => {
      if (i > 0) { // Skip body
        child.rotation.z = Math.sin(time * 4 + i) * legWave
      }
    })
  })

  return (
    <group ref={spiderRef} position={position} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial 
          color={isDayMode ? "#2d3748" : "#1a202c"} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.2, 0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color={isDayMode ? "#2d3748" : "#1a202c"} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Legs */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 0.2
        const z = Math.sin(angle) * 0.2
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.3, 4]} />
            <meshStandardMaterial 
              color={isDayMode ? "#2d3748" : "#1a202c"} 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        )
      })}
      
      {/* Glowing eyes */}
      {!isDayMode && (
        <>
          <mesh position={[-0.03, 0.25, 0.12]}>
            <sphereGeometry args={[0.02]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          <mesh position={[0.03, 0.25, 0.12]}>
            <sphereGeometry args={[0.02]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </>
      )}
    </group>
  )
}

interface BatProps {
  position: [number, number, number]
  scale?: number
  phase?: number
}

function Bat({ position, scale = 1, phase = 0 }: BatProps) {
  const batRef = useRef<THREE.Group>(null)
  const { isDayMode } = useCemeteryStore()

  useFrame((state) => {
    if (!batRef.current || isDayMode) return
    
    const time = state.clock.elapsedTime + phase
    const flight = Math.sin(time * 0.8) * 0.2
    const flap = Math.sin(time * 8) * 0.3
    
    batRef.current.position.y = position[1] + flight
    batRef.current.rotation.x = flap
    batRef.current.position.x += Math.sin(time * 0.3) * 0.01
    batRef.current.position.z += Math.cos(time * 0.3) * 0.01
  })

  if (isDayMode) return null

  return (
    <group ref={batRef} position={position} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color="#1a202c" 
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      
      {/* Wings */}
      <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshStandardMaterial 
          color="#1a202c" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshStandardMaterial 
          color="#1a202c" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Glowing eyes */}
      <mesh position={[-0.03, 0.05, 0.08]}>
        <sphereGeometry args={[0.02]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0.03, 0.05, 0.08]}>
        <sphereGeometry args={[0.02]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </group>
  )
}

export function GraveyardElements() {
  const { isDayMode } = useCemeteryStore()
  
  // Ghosts removed
  const ghostPositions = useMemo(() => [], [])

  const skeletonPositions = useMemo(() => [
    [-12, 0, -8] as [number, number, number],
    [15, 0, -15] as [number, number, number],
  ], [])

  const tombstonePositions = useMemo(() => [
    [-25, 0, -20] as [number, number, number],
    [22, 0, -25] as [number, number, number],
    [-18, 0, 18] as [number, number, number],
    [25, 0, 20] as [number, number, number],
  ], [])

  const spiderPositions = useMemo(() => [
    [-10, 0.5, -5] as [number, number, number],
    [5, 0.3, -12] as [number, number, number],
  ], [])

  const batPositions = useMemo(() => [
    [-8, 4, -10] as [number, number, number],
    [10, 3.5, -15] as [number, number, number],
  ], [])

  return (
    <group>
      {/* Ghosts removed */}

      {/* Skeletons */}
      {skeletonPositions.map((pos, i) => (
        <Skeleton 
          key={`skeleton-${i}`} 
          position={pos} 
          scale={0.6 + Math.random() * 0.3}
          phase={i * Math.PI * 0.3}
        />
      ))}

      {/* Additional tombstones */}
      {tombstonePositions.map((pos, i) => (
        <Tombstone 
          key={`tombstone-${i}`} 
          position={pos} 
          scale={0.8 + Math.random() * 0.4}
          angle={Math.random() * Math.PI * 0.5}
        />
      ))}

      {/* Spiders */}
      {spiderPositions.map((pos, i) => (
        <Spider 
          key={`spider-${i}`} 
          position={pos} 
          scale={0.5 + Math.random() * 0.3}
          phase={i * Math.PI * 0.2}
        />
      ))}

      {/* Bats */}
      {batPositions.map((pos, i) => (
        <Bat 
          key={`bat-${i}`} 
          position={pos} 
          scale={0.6 + Math.random() * 0.4}
          phase={i * Math.PI * 0.3}
        />
      ))}
    </group>
  )
}

'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Cylinder } from '@react-three/drei'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

const STAR_COUNT = 520

type StarConfig = {
  position: [number, number, number]
  speed: number
  baseScale: number
  phase: number
}

type FogWispConfig = {
  center: [number, number, number]
  radius: number
  speed: number
  phase: number
  direction: 1 | -1
}

function useSkyTexture(isDayMode: boolean) {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null

    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const context = canvas.getContext('2d')
    if (!context) return null

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    if (isDayMode) {
      gradient.addColorStop(0, '#eef3ff')
      gradient.addColorStop(0.55, '#d1def5')
      gradient.addColorStop(1, '#b7c7e6')
    } else {
      gradient.addColorStop(0, '#0b1a2f')
      gradient.addColorStop(0.55, '#0a1424')
      gradient.addColorStop(1, '#070b14')
    }

    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)

    const stars = !isDayMode
    if (stars) {
      context.fillStyle = 'rgba(232, 238, 251, 0.08)'
      for (let i = 0; i < 800; i += 1) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height * 0.65
        const radius = Math.random() * 1.1
        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fill()
      }
    }

    const skyTexture = new THREE.CanvasTexture(canvas)
    skyTexture.needsUpdate = true
    skyTexture.colorSpace = THREE.SRGBColorSpace
    skyTexture.wrapS = THREE.ClampToEdgeWrapping
    skyTexture.wrapT = THREE.ClampToEdgeWrapping
    return skyTexture
  }, [isDayMode])

  useEffect(() => () => texture?.dispose(), [texture])

  return texture
}

interface EnhancedAtmosphereProps {
  qualityTier: 'high' | 'medium' | 'low'
}

export function EnhancedAtmosphere({ qualityTier }: EnhancedAtmosphereProps) {
  const { isDayMode } = useCemeteryStore()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const firefliesRef = useRef<THREE.Group>(null)
  const embersRef = useRef<THREE.Group>(null)
  const starMeshRef = useRef<THREE.InstancedMesh>(null)
  const fogWispRefs = useRef<Array<THREE.Mesh | null>>([])
  const skyTexture = useSkyTexture(isDayMode)

  const starDummy = useMemo(() => new THREE.Object3D(), [])
  const starUpdateRef = useRef(0)
  const fireflyUpdateRef = useRef(0)
  const emberUpdateRef = useRef(0)
  const fogUpdateRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    handleChange()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  // Generate varying firefly sizes and positions
  const isMedium = qualityTier === 'medium'
  const isLow = qualityTier === 'low'

  const starConfigs = useMemo<StarConfig[]>(() => {
    const count = prefersReducedMotion
      ? Math.floor(STAR_COUNT / 2)
      : isLow
        ? Math.floor(STAR_COUNT * 0.55)
        : isMedium
          ? Math.floor(STAR_COUNT * 0.75)
          : STAR_COUNT
    return Array.from({ length: count }, () => {
      const radius = 85 + Math.random() * 45
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * (Math.PI / 2.4)
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.sin(theta)

      return {
        position: [x, Math.abs(y) + 15, z],
        speed: 0.55 + Math.random() * 0.65,
        baseScale: 0.45 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
      }
    })
  }, [prefersReducedMotion, isLow, isMedium])

  const fogWisps = useMemo<FogWispConfig[]>(() => [
    {
      center: [-6.5, 0.08, 4.2],
      radius: 7,
      speed: 0.12,
      phase: Math.random() * Math.PI * 2,
      direction: 1,
    },
    {
      center: [6.8, 0.08, -5.5],
      radius: 6,
      speed: 0.09,
      phase: Math.random() * Math.PI * 2,
      direction: -1,
    },
  ], [])

  const fireflies = useMemo(() => {
    const count = prefersReducedMotion ? 16 : isLow ? 18 : isMedium ? 28 : 40
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: 0.02 + Math.random() * (prefersReducedMotion ? 0.04 : 0.08),
      startPos: [
        (Math.random() - 0.5) * 50,
        Math.random() * 8 + 1,
        (Math.random() - 0.5) * 50
      ] as [number, number, number],
      speed: (prefersReducedMotion ? 0.18 : 0.28) + Math.random() * (prefersReducedMotion ? 0.2 : isLow ? 0.22 : isMedium ? 0.28 : 0.4),
      phase: Math.random() * Math.PI * 2
    }))
  }, [prefersReducedMotion, isLow, isMedium])

  // Generate ember particles
  const embers = useMemo(() => {
    const count = prefersReducedMotion ? 6 : isLow ? 8 : isMedium ? 12 : 20
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: 0.01 + Math.random() * 0.03,
      startPos: [
        (Math.random() - 0.5) * 40,
        Math.random() * 2,
        (Math.random() - 0.5) * 40
      ] as [number, number, number],
      speed: (prefersReducedMotion ? 0.06 : 0.1) + Math.random() * (prefersReducedMotion ? 0.12 : isLow ? 0.14 : isMedium ? 0.16 : 0.2),
      phase: Math.random() * Math.PI * 2
    }))
  }, [prefersReducedMotion, isLow, isMedium])

  useEffect(() => {
    if (!starMeshRef.current || starConfigs.length === 0) return
    
    try {
      starMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

      starConfigs.forEach((config, index) => {
        starDummy.position.set(config.position[0], config.position[1], config.position[2])
        const scale = config.baseScale * 0.6
        starDummy.scale.setScalar(scale)
        starDummy.updateMatrix()
        starMeshRef.current?.setMatrixAt(index, starDummy.matrix)
      })
      starMeshRef.current.instanceMatrix.needsUpdate = true
    } catch (error) {
      console.warn('Failed to initialize star instances:', error)
    }
  }, [isDayMode, starConfigs, starDummy])

  useFrame((state, delta) => {
    starUpdateRef.current += delta
    fireflyUpdateRef.current += delta
    emberUpdateRef.current += delta
    fogUpdateRef.current += delta

    // Animate fireflies with varying movement patterns
    if (!isDayMode && starMeshRef.current && starConfigs.length > 0 && starUpdateRef.current >= (prefersReducedMotion ? 1 / 28 : isLow ? 1 / 32 : isMedium ? 1 / 38 : 1 / 45)) {
      starUpdateRef.current = 0
      try {
        const twinkleAmplitude = prefersReducedMotion ? 0.15 : 0.35
        starConfigs.forEach((config, index) => {
          const twinkle = config.baseScale + Math.sin(state.clock.elapsedTime * config.speed + config.phase) * twinkleAmplitude
          starDummy.position.set(config.position[0], config.position[1], config.position[2])
          starDummy.scale.setScalar(Math.max(0.2, twinkle) * 0.65)
          starDummy.updateMatrix()
          starMeshRef.current?.setMatrixAt(index, starDummy.matrix)
        })
        starMeshRef.current.instanceMatrix.needsUpdate = true
      } catch (error) {
        // Silently skip frame if there's an error
      }
    }

    if (firefliesRef.current && !isDayMode && fireflyUpdateRef.current >= (prefersReducedMotion ? 1 / 40 : isLow ? 1 / 36 : isMedium ? 1 / 45 : 1 / 55)) {
      fireflyUpdateRef.current = 0
      firefliesRef.current.children.forEach((firefly, i) => {
        const config = fireflies[i]
        const time = state.clock.elapsedTime * config.speed + config.phase
        const motionScale = prefersReducedMotion ? 0.5 : 1

        // Complex flight pattern
        firefly.position.x = config.startPos[0] + (Math.sin(time * 0.7) * 3 + Math.cos(time * 0.3) * 1.5) * motionScale
        firefly.position.y = config.startPos[1] + (Math.sin(time * 0.5) * 2 + Math.cos(time * 0.8) * 0.8) * motionScale
        firefly.position.z = config.startPos[2] + (Math.cos(time * 0.6) * 3 + Math.sin(time * 0.4) * 1.2) * motionScale

        // Flickering effect
        const material = (firefly as THREE.Mesh).material as THREE.MeshBasicMaterial
        const flickerAmplitude = prefersReducedMotion ? 0.12 : 0.3
        material.opacity = 0.4 + Math.sin(time * 5 + config.phase) * flickerAmplitude

        // Keep fireflies in bounds
        if (Math.abs(firefly.position.x) > 25) firefly.position.x *= -0.1
        if (Math.abs(firefly.position.z) > 25) firefly.position.z *= -0.1
        if (firefly.position.y > 10) firefly.position.y = 1
        if (firefly.position.y < 0.5) firefly.position.y = 8
      })
    }

    // Animate embers floating upward
    if (embersRef.current && !isDayMode && emberUpdateRef.current >= (prefersReducedMotion ? 1 / 36 : isLow ? 1 / 34 : isMedium ? 1 / 38 : 1 / 50)) {
      emberUpdateRef.current = 0
      embersRef.current.children.forEach((ember, i) => {
        const config = embers[i]
        const time = state.clock.elapsedTime * config.speed + config.phase

        // Slow upward drift with gentle sway
        const swayScale = prefersReducedMotion ? 0.5 : 1
        ember.position.x = config.startPos[0] + Math.sin(time * 0.5) * 0.5 * swayScale
        ember.position.y = config.startPos[1] + time * (prefersReducedMotion ? 0.3 : 0.5)
        ember.position.z = config.startPos[2] + Math.cos(time * 0.3) * 0.3 * swayScale

        // Reset when too high
        if (ember.position.y > 15) {
          ember.position.y = 0
          ember.position.x = (Math.random() - 0.5) * 40
          ember.position.z = (Math.random() - 0.5) * 40
        }

        // Fading effect as they rise
        const material = (ember as THREE.Mesh).material as THREE.MeshBasicMaterial
        material.opacity = Math.max(0.1, (prefersReducedMotion ? 0.6 : 0.8) - (ember.position.y / 15) * (prefersReducedMotion ? 0.45 : 0.7))
      })
    }

    // Animate fog patches
    if (fogUpdateRef.current >= (prefersReducedMotion ? 1 / 45 : isLow ? 1 / 40 : isMedium ? 1 / 50 : 1 / 60)) {
      fogUpdateRef.current = 0
      fogWispRefs.current.forEach((mesh, idx) => {
        const config = fogWisps[idx]
        if (!mesh || !config) return
        const time = state.clock.elapsedTime * config.speed + config.phase
        const xOffset = Math.sin(time) * config.radius * 0.18 * config.direction
        const zOffset = Math.cos(time * 0.85) * config.radius * 0.16 * config.direction
        mesh.position.set(config.center[0] + xOffset, config.center[1], config.center[2] + zOffset)

        const material = mesh.material as THREE.MeshBasicMaterial
        const baseOpacity = isDayMode ? 0.03 : 0.04
        material.opacity = baseOpacity + Math.sin(time * 1.2 + idx) * 0.004
      })
    }
  })

  return (
    <group>
      {/* Atmospheric sky dome */}
      {skyTexture ? (
        <mesh scale={[-180, 180, 180]} position={[0, 0, 0]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial
            map={skyTexture}
            side={THREE.BackSide}
            transparent={true}
            opacity={isDayMode ? 0.95 : 1}
            toneMapped={false}
          />
        </mesh>
      ) : (
        <mesh scale={[-180, 180, 180]} position={[0, 0, 0]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial
            color={isDayMode ? '#87CEEB' : '#0b1a2f'}
            side={THREE.BackSide}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Starfield */}
      {!isDayMode && (
        <instancedMesh
          ref={starMeshRef}
          args={[undefined, undefined, starConfigs.length]}
          frustumCulled={false}
          matrixAutoUpdate={false}
        >
          <sphereGeometry args={[0.18, 6, 6]} />
          <meshBasicMaterial
            color="#E8EEFB"
            transparent
            opacity={0.85}
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </instancedMesh>
      )}

      {/* Enhanced fireflies for night mode */}
      {!isDayMode && (
        <group ref={firefliesRef}>
          {fireflies.map((config, i) => (
            <Sphere
              key={`firefly-${i}`}
              args={[config.size]}
              position={config.startPos}
            >
              <meshBasicMaterial
                color="#fde047"
                transparent
                opacity={0.6}
              />
            </Sphere>
          ))}
        </group>
      )}

      {/* Ground fog wisps */}
      <group>
        {fogWisps.map((config, i) => (
          <mesh
            key={`fog-wisp-${i}`}
            ref={(mesh) => {
              fogWispRefs.current[i] = mesh
            }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={config.center}
          >
            <circleGeometry args={[config.radius, 48]} />
            <meshBasicMaterial
              color={isDayMode ? '#dbe4f6' : '#b5c1dc'}
              transparent
              opacity={isDayMode ? 0.03 : 0.04}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* Ember particles for night mode */}
      {!isDayMode && (
        <group ref={embersRef}>
          {embers.map((config, i) => (
            <Sphere
              key={`ember-${i}`}
              args={[config.size]}
              position={config.startPos}
            >
              <meshBasicMaterial
                color="#f97316"
                transparent
                opacity={0.5}
              />
            </Sphere>
          ))}
        </group>
      )}

      {/* Volumetric light rays for day mode */}
      {isDayMode && (
        <group>
          {Array.from({ length: prefersReducedMotion ? 3 : 6 }).map((_, i) => (
            <Cylinder
              key={`sunray-${i}`}
              args={[0.05, 1.5, 12, 8]}
              position={[
                (Math.random() - 0.5) * 30,
                6 + Math.random() * 4,
                (Math.random() - 0.5) * 30
              ]}
              rotation={[Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.3]}
            >
              <meshBasicMaterial
                color="#fde047"
                transparent
                opacity={0.08}
              />
            </Cylinder>
          ))}
        </group>
      )}

      {/* Floating dust motes for day mode */}
      {isDayMode && (
        <group>
          {Array.from({ length: prefersReducedMotion ? 12 : 25 }).map((_, i) => (
            <Sphere
              key={`dust-${i}`}
              args={[0.005 + Math.random() * 0.01]}
              position={[
                (Math.random() - 0.5) * 50,
                Math.random() * 15 + 2,
                (Math.random() - 0.5) * 50
              ]}
            >
              <meshBasicMaterial
                color="#f1f5f9"
                transparent
                opacity={prefersReducedMotion ? 0.2 : 0.3}
              />
            </Sphere>
          ))}
        </group>
      )}

      {/* Ambient light enhancement */}
      <ambientLight intensity={isDayMode ? 0.4 : 0.15} color={isDayMode ? "#f8fafc" : "#475569"} />

      {/* Hemisphere light for natural outdoor lighting */}
      <hemisphereLight
        args={[
          isDayMode ? "#87ceeb" : "#1e293b",
          isDayMode ? "#8fbc8f" : "#0f172a",
          isDayMode ? 0.6 : 0.2
        ]}
      />
    </group>
  )
}

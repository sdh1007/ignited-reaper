'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useCemeteryStore } from '@/store/cemetery'
import { OptimizedGravestone } from './OptimizedGravestone'
import { EnhancedAtmosphere } from './EnhancedAtmosphere'
import { Ground } from './Ground'
import { CameraController } from './CameraController'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { PerformanceMonitor } from '@/lib/performance'
import * as THREE from 'three'

export function Cemetery() {
  const { filteredProfiles, isDayMode, setIsMobile } = useCemeteryStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qualityTier, setQualityTier] = useState<'high' | 'medium' | 'low'>('high')
  const perfMonitor = useRef(new PerformanceMonitor()).current

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  // Performance monitoring - adjust quality tier dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      const tier = perfMonitor.getQualityTier()
      if (tier !== qualityTier) {
        setQualityTier(tier)
        console.log(`🎯 Performance: Adjusted quality tier to ${tier} (${perfMonitor.getAverageFPS().toFixed(1)} FPS)`)
      }
    }, 2000) // Check every 2 seconds

    return () => clearInterval(interval)
  }, [perfMonitor, qualityTier])

  const profiles = filteredProfiles()

  return (
    <div className="w-full h-full relative">
      <Canvas
        ref={canvasRef}
        camera={{ 
          position: [0, 42, 68], 
          fov: 58,
          near: 0.1,
          far: 1000 
        }}
        shadows
        className="w-full h-full"
        gl={{ 
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isDayMode ? 1.32 : 0.92
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          scene.background = null
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={isDayMode ? 0.6 : 0.48} color={isDayMode ? '#f8fbff' : '#2a3548'} />
          <directionalLight
            position={isDayMode ? [12, 22, 8] : [-14, 18, -6]}
            intensity={isDayMode ? 1 : 0.7}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            color={isDayMode ? '#ffffff' : '#F7B267'}
          />

          {/* Moonlight for night mode */}
          {!isDayMode && (
            <pointLight
              position={[-10, 15, -5]}
              intensity={0.5}
              color="#ddd6fe"
              distance={30}
              decay={2}
            />
          )}

          {/* Fog */}
          <fog 
            attach="fog" 
            args={[
              isDayMode ? '#cfdff6' : '#0b1524', 
              12, 
              isDayMode ? 90 : 60
            ]} 
          />

          {/* Environment */}
          <Environment 
            preset={isDayMode ? "dawn" : "night"}
            background={false}
          />

          {/* Ground */}
          <Ground qualityTier="high" stones={[]} />

          {/* Gravestones with LOD & frustum culling */}
          {profiles.map((profile) => (
          <OptimizedGravestone 
            key={profile.id} 
            profile={profile}
            position={[profile.position.x, 0, profile.position.z]}
            qualityTier={qualityTier}
          />
          ))}

          {/* Atmospheric effects */}
          <EnhancedAtmosphere qualityTier="high" />

          {/* Enhanced Camera Controls */}
          <CameraController />
        </Suspense>
      </Canvas>

      {/* Loading fallback */}
      <Suspense fallback={<LoadingSpinner />}>
        <div />
      </Suspense>
    </div>
  )
}

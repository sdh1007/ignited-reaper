'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCemeteryStore } from '@/store/cemetery'
import * as THREE from 'three'

export function Atmosphere() {
  const { isDayMode } = useCemeteryStore()
  const firefliesRef = useRef<THREE.Group>(null)
  const fogRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    // Animate fireflies
    if (firefliesRef.current && !isDayMode) {
      firefliesRef.current.children.forEach((firefly, i) => {
        const time = state.clock.elapsedTime + i
        firefly.position.x += Math.sin(time * 0.5) * 0.01
        firefly.position.y += Math.cos(time * 0.3) * 0.005
        firefly.position.z += Math.sin(time * 0.4) * 0.008
        
        // Keep fireflies in bounds
        if (Math.abs(firefly.position.x) > 20) firefly.position.x *= -0.1
        if (Math.abs(firefly.position.z) > 20) firefly.position.z *= -0.1
        if (firefly.position.y > 8) firefly.position.y = 1
        if (firefly.position.y < 1) firefly.position.y = 8
      })
    }

    // Animate fog patches
    if (fogRef.current) {
      fogRef.current.children.forEach((fog, i) => {
        const time = state.clock.elapsedTime * 0.2 + i * 0.5
        fog.position.x += Math.sin(time) * 0.002
        fog.position.z += Math.cos(time) * 0.001
      })
    }
  })

  return (
    <group>
      {/* Fireflies for night mode */}
      {!isDayMode && (
        <group ref={firefliesRef}>
          {Array.from({ length: 30 }).map((_, i) => (
            <mesh
              key={`firefly-${i}`}
              position={[
                (Math.random() - 0.5) * 40,
                Math.random() * 6 + 1,
                (Math.random() - 0.5) * 40
              ]}
            >
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial 
                color="#fbbf24"
                transparent
                opacity={0.6 + Math.sin(i * 2) * 0.3}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Floating embers for night mode */}
      {!isDayMode && (
        <group>
          {Array.from({ length: 15 }).map((_, i) => (
            <mesh
              key={`ember-${i}`}
              position={[
                (Math.random() - 0.5) * 30,
                Math.random() * 8 + 2,
                (Math.random() - 0.5) * 30
              ]}
            >
              <sphereGeometry args={[0.03]} />
              <meshBasicMaterial 
                color="#f97316"
                transparent
                opacity={0.4}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Fog patches */}
      <group ref={fogRef}>
        {Array.from({ length: isDayMode ? 5 : 12 }).map((_, i) => (
          <mesh
            key={`fog-${i}`}
            position={[
              (Math.random() - 0.5) * 50,
              0.2,
              (Math.random() - 0.5) * 50
            ]}
            rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
          >
            <planeGeometry args={[8, 8]} />
            <meshBasicMaterial 
              color={isDayMode ? "#ffffff" : "#e2e8f0"}
              transparent
              opacity={isDayMode ? 0.1 : 0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Birds for day mode */}
      {isDayMode && (
        <group>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={`bird-${i}`}
              position={[
                (Math.random() - 0.5) * 60,
                Math.random() * 15 + 10,
                (Math.random() - 0.5) * 60
              ]}
            >
              <sphereGeometry args={[0.1]} />
              <meshBasicMaterial 
                color="#374151"
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Sunbeams for day mode */}
      {isDayMode && (
        <group>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh
              key={`sunbeam-${i}`}
              position={[
                (Math.random() - 0.5) * 40,
                Math.random() * 10 + 5,
                (Math.random() - 0.5) * 40
              ]}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
            >
              <cylinderGeometry args={[0.1, 2, 15, 8]} />
              <meshBasicMaterial 
                color="#fbbf24"
                transparent
                opacity={0.1}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}
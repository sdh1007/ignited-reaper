'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const MIN_CAMERA_HEIGHT = 3 // Minimum height above ground
const GROUND_LEVEL = 0

export function CameraController() {
  const { camera, gl } = useThree()
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    // Start farther back and higher so the cemetery fits the frame immediately
    camera.position.set(0, 42, 68)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Prevent camera from going below ground
  useFrame(() => {
    // Constrain camera height
    if (camera.position.y < MIN_CAMERA_HEIGHT) {
      camera.position.y = MIN_CAMERA_HEIGHT
    }

    // Constrain camera target (look-at point)
    if (controlsRef.current) {
      const target = controlsRef.current.target
      if (target && target.y < GROUND_LEVEL) {
        target.y = GROUND_LEVEL
        controlsRef.current.update()
      }
      
      // Additional constraint: prevent camera from getting too close to ground
      const distanceToGround = camera.position.y - GROUND_LEVEL
      if (distanceToGround < MIN_CAMERA_HEIGHT) {
        camera.position.y = GROUND_LEVEL + MIN_CAMERA_HEIGHT
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={18}
      maxDistance={70}
      minPolarAngle={Math.PI / 12}
      maxPolarAngle={Math.PI / 2.2}
      minAzimuthAngle={-Math.PI / 2}
      maxAzimuthAngle={Math.PI / 2}
      enableDamping={true}
      dampingFactor={0.08}
      autoRotate={false}
      autoRotateSpeed={0}
      target={[0, 0, 0]}
      // Prevent unwanted auto-zoom behavior
      zoomSpeed={0.8}
      panSpeed={0.8}
      rotateSpeed={0.6}
      // Ensure smooth user control
      keys={{
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp', 
        RIGHT: 'ArrowRight',
        BOTTOM: 'ArrowDown'
      }}
    />
  )
}

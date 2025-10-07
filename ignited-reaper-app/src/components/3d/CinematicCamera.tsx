'use client'

import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function CinematicCamera() {
  const { camera, gl } = useThree()
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    // Set camera to human eye level (1.65m) with slight downward tilt for natural viewing
    camera.position.set(0, 1.65, 25)
    camera.lookAt(0, 1.0, 0) // Look slightly down at gravestone level

    // Create OrbitControls manually to avoid import issues
    const OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    const controls = new OrbitControls(camera, gl.domElement)
    
    // Enhanced controls for realistic eye-level navigation
    controls.enablePan = true
    controls.enableZoom = true
    controls.enableRotate = true
    controls.minDistance = 5 // Closer inspection
    controls.maxDistance = 45 // Wider view while maintaining detail
    controls.minPolarAngle = Math.PI / 8 // Limit looking too far up
    controls.maxPolarAngle = Math.PI / 1.8 // Limit looking down but allow good gravestone view
    controls.enableDamping = true
    controls.dampingFactor = 0.12 // Smoother camera movement
    controls.autoRotate = false
    controls.autoRotateSpeed = 0
    controls.target.set(0, 1.0, 0) // Target at gravestone height
    controls.zoomSpeed = 0.7
    controls.panSpeed = 0.7
    controls.rotateSpeed = 0.5
    controls.enableKeys = true
    controls.keys = {
      LEFT: 'ArrowLeft',
      UP: 'ArrowUp', 
      RIGHT: 'ArrowRight',
      BOTTOM: 'ArrowDown'
    }
    
    // Constrain vertical movement to keep realistic eye level
    controls.maxTargetRadius = 50

    controlsRef.current = controls

    // Animation loop
    const animate = () => {
      controls.update()
      requestAnimationFrame(animate)
    }
    animate()

    // Cleanup
    return () => {
      controls.dispose()
    }
  }, [camera, gl])

  return null
}

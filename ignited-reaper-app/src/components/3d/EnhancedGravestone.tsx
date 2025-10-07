'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Line, Billboard } from '@react-three/drei'
import { useCemeteryStore } from '@/store/cemetery'
import type { Platform, SocialProfile } from '@/lib/types'
import * as THREE from 'three'

type GravestoneShape =
  | 'rounded'
  | 'obelisk'
  | 'cross'
  | 'wide'
  | 'gothic'
  | 'modern'
  | 'angular'
  | 'curved'
  | 'stepped'
  | 'tablet'
  | 'footstone'

interface EnhancedGravestoneProps {
  profile: SocialProfile
  position: [number, number, number]
  qualityTier?: 'high' | 'medium' | 'low'
}

interface CrackData {
  length: number
  thickness: number
  angle: number
  offsetX: number
  offsetY: number
}

interface EmberConfig {
  radius: number
  orbitRadius: number
  heightOffset: number
  speed: number
  phase: number
}

interface CandleConfig {
  offset: [number, number, number]
  height: number
  phase: number
}

interface GravestoneVariations {
  shape: GravestoneShape
  dimensions: { width: number; height: number; depth: number }
  baseHeight: number
  tilt: number
  floatPhase: number
  cracks: CrackData[]
  glyphPath: Array<[number, number]>
  glyphScale: number
  glyphYOffset: number
  glowHeight: number
  inscriptionSize: [number, number]
  inscriptionYOffset: number
  emberConfigs: EmberConfig[]
  candleConfigs: CandleConfig[]
  orbHeight: number
  backplateHeight: number
}

const gravestoneDimensions: Record<GravestoneShape, { width: number; height: number; depth: number; radius: number }> = {
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

const platformShapeOptions: Partial<Record<Platform, GravestoneShape[]>> = {
  twitter: ['rounded', 'tablet', 'footstone'],
  instagram: ['curved', 'gothic', 'stepped'],
  tiktok: ['cross', 'angular', 'stepped'],
  youtube: ['obelisk', 'tablet', 'wide'],
  twitch: ['gothic', 'modern', 'angular'],
  linkedin: ['modern', 'obelisk', 'tablet'],
  github: ['angular', 'rounded', 'footstone'],
  discord: ['curved', 'rounded', 'stepped'],
}

const defaultShapeOptions: GravestoneShape[] = ['rounded', 'modern', 'gothic', 'stepped']

const glyphLibrary: Array<Array<[number, number]>> = [
  [
    [-0.25, 0.3],
    [0, 0.45],
    [0.25, 0.3],
    [0, -0.35],
    [-0.25, 0.3],
  ],
  [
    [-0.2, 0.35],
    [-0.2, -0.25],
    [0.2, -0.25],
    [0.2, 0.35],
    [-0.2, 0.35],
  ],
  [
    [-0.22, 0.2],
    [0.22, 0.2],
    [0, -0.35],
    [-0.22, 0.2],
  ],
  [
    [0, 0.4],
    [0.2, 0],
    [0, -0.4],
    [-0.2, 0],
    [0, 0.4],
  ],
]

type GraniteTextures = { color: string; albedo: THREE.CanvasTexture; roughness: THREE.CanvasTexture }

const graniteTextureCache = new Map<string, GraniteTextures>()

function createGraniteTextures(cacheKey: string, baseColor: string): GraniteTextures | null {
  if (typeof document === 'undefined') return null

  const existing = graniteTextureCache.get(cacheKey)
  if (existing && existing.color === baseColor) {
    return existing
  }
  if (existing) {
    existing.albedo.dispose()
    existing.roughness.dispose()
    graniteTextureCache.delete(cacheKey)
  }

  const size = 256
  const albedoCanvas = document.createElement('canvas')
  albedoCanvas.width = albedoCanvas.height = size
  const ctx = albedoCanvas.getContext('2d')!
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, size, size)

  const rng = createRandomGenerator(cacheKey)
  const speckles = 2400
  for (let i = 0; i < speckles; i += 1) {
    const x = rng() * size
    const y = rng() * size
    const radius = 0.4 + rng() * 1.4
    const shade = 170 + Math.floor(rng() * 50)
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${0.14 + rng() * 0.18})`
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const veinCount = 14
  for (let i = 0; i < veinCount; i += 1) {
    const startX = rng() * size
    const startY = rng() * size
    const length = size * (0.45 + rng() * 0.3)
    const angle = rng() * Math.PI * 2
    const thickness = 0.8 + rng() * 1.5
    ctx.strokeStyle = `rgba(210, 216, 230, ${0.04 + rng() * 0.05})`
    ctx.lineWidth = thickness
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length)
    ctx.stroke()
  }

  const albedo = new THREE.CanvasTexture(albedoCanvas)
  albedo.wrapS = albedo.wrapT = THREE.RepeatWrapping
  albedo.colorSpace = THREE.SRGBColorSpace
  albedo.needsUpdate = true

  const roughnessCanvas = document.createElement('canvas')
  roughnessCanvas.width = roughnessCanvas.height = size
  const rCtx = roughnessCanvas.getContext('2d')!
  rCtx.fillStyle = '#f1f1f1'
  rCtx.fillRect(0, 0, size, size)

  for (let i = 0; i < speckles; i += 1) {
    const x = rng() * size
    const y = rng() * size
    const radius = 0.7 + rng() * 1.8
    const darkness = 150 + Math.floor(rng() * 60)
    rCtx.fillStyle = `rgba(${darkness}, ${darkness}, ${darkness}, ${0.18 + rng() * 0.22})`
    rCtx.beginPath()
    rCtx.arc(x, y, radius, 0, Math.PI * 2)
    rCtx.fill()
  }

  const roughness = new THREE.CanvasTexture(roughnessCanvas)
  roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping
  roughness.needsUpdate = true

  const textures: GraniteTextures = { color: baseColor, albedo, roughness }
  graniteTextureCache.set(cacheKey, textures)
  return textures
}

function buildExtrudedGeometry(points: Array<[number, number]>, depth: number, bevel: number) {
  const shape = new THREE.Shape()
  const [startX, startY] = points[0]
  shape.moveTo(startX, startY)
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i]
    shape.lineTo(x, y)
  }
  shape.closePath()

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: bevel,
    bevelThickness: bevel * 0.9,
    bevelOffset: 0,
  }

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const offset = new THREE.Vector3(
    -(box.min.x + box.max.x) / 2,
    -box.min.y,
    -(box.min.z + box.max.z) / 2,
  )
  geometry.translate(offset.x, offset.y, offset.z)
  geometry.computeVertexNormals()
  return geometry
}

function createArchedTabletGeometry(width: number, height: number, depth: number) {
  const archHeight = height * 0.32
  const halfW = width / 2
  const bodyHeight = height - archHeight
  const points: Array<[number, number]> = [[-halfW, -height / 2], [-halfW, -height / 2 + bodyHeight]]
  const segments = 28
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments
    const angle = Math.PI * (1 - t)
    const x = Math.cos(angle) * halfW
    const y = -height / 2 + bodyHeight + Math.sin(angle) * archHeight
    points.push([x, y])
  }
  points.push([halfW, -height / 2])
  return buildExtrudedGeometry(points, depth, width * 0.035)
}

function createRectTabletGeometry(width: number, height: number, depth: number) {
  const halfW = width / 2
  const halfH = height / 2
  const points: Array<[number, number]> = [
    [-halfW, -halfH],
    [-halfW, halfH],
    [halfW, halfH],
    [halfW, -halfH],
  ]
  return buildExtrudedGeometry(points, depth, width * 0.03)
}

function createFootstoneGeometry(width: number, height: number, depth: number) {
  const halfW = width / 2
  const halfH = height / 2
  const points: Array<[number, number]> = [
    [-halfW, -halfH],
    [-halfW, halfH],
    [halfW, halfH],
    [halfW, -halfH],
  ]
  return buildExtrudedGeometry(points, depth, width * 0.025)
}

function createGothicGeometry(width: number, height: number, depth: number) {
  const halfW = width / 2
  const halfH = height / 2
  const baseHeight = height * 0.55 - halfH
  const tipHeight = height - (baseHeight + halfH)
  const points: Array<[number, number]> = [
    [-halfW, -halfH],
    [-halfW, baseHeight],
    [-halfW * 0.4, baseHeight + tipHeight * 0.6],
    [0, halfH],
    [halfW * 0.4, baseHeight + tipHeight * 0.6],
    [halfW, baseHeight],
    [halfW, -halfH],
  ]
  return buildExtrudedGeometry(points, depth, width * 0.03)
}

function createAngularGeometry(width: number, height: number, depth: number) {
  const halfW = width / 2
  const halfH = height / 2
  const slopeStart = halfH * 0.2
  const points: Array<[number, number]> = [
    [-halfW, -halfH],
    [-halfW, slopeStart],
    [0, halfH],
    [halfW, slopeStart * 0.85],
    [halfW, -halfH],
  ]
  return buildExtrudedGeometry(points, depth, width * 0.03)
}

function createCrossGeometry(width: number, height: number, depth: number) {
  const halfW = width / 2
  const halfH = height / 2
  const armHeight = height * 0.2
  const armWidth = width * 0.65
  const points: Array<[number, number]> = [
    [-armWidth / 2, -halfH],
    [-armWidth / 2, -armHeight / 2],
    [-halfW, -armHeight / 2],
    [-halfW, armHeight / 2],
    [-armWidth / 2, armHeight / 2],
    [-armWidth / 2, halfH],
    [armWidth / 2, halfH],
    [armWidth / 2, armHeight / 2],
    [halfW, armHeight / 2],
    [halfW, -armHeight / 2],
    [armWidth / 2, -armHeight / 2],
    [armWidth / 2, -halfH],
  ]
  return buildExtrudedGeometry(points, depth, width * 0.025)
}

const platformGlowPalette: Partial<Record<Platform, string[]>> = {
  twitter: ['#7FB4FF', '#C6DCFF'],
  tiktok: ['#9AE6FF', '#C5F4FF'],
  youtube: ['#FF7A7A', '#FFC4B8'],
  instagram: ['#FF8AB8', '#FBBFDF'],
  twitch: ['#B18AFF', '#D2C2FF'],
  linkedin: ['#81C7FF', '#BFE3FF'],
  github: ['#9FB3C8', '#D0DEEB'],
  discord: ['#95A9FF', '#CCD5FF'],
}

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

function createInscriptionTexture(primaryText: string, secondaryText: string) {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext('2d')

  if (!context) return null

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'rgba(15, 23, 42, 0)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.textAlign = 'center'
  context.textBaseline = 'middle'

  context.font = '700 58px "Times New Roman", serif'
  context.fillStyle = 'rgba(203, 213, 225, 0.55)'
  context.shadowColor = 'rgba(15, 23, 42, 0.4)'
  context.shadowBlur = 6
  context.fillText(primaryText, canvas.width / 2, canvas.height / 2 - 18)

  context.shadowBlur = 0
  context.font = '400 36px "Times New Roman", serif'
  context.fillStyle = 'rgba(148, 163, 184, 0.4)'
  context.fillText(secondaryText, canvas.width / 2, canvas.height / 2 + 22)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.anisotropy = 4
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export const EnhancedGravestone = memo(function EnhancedGravestone({ profile, position, qualityTier = 'high' }: EnhancedGravestoneProps) {
  const meshRef = useRef<THREE.Group>(null)
  const auraGroupRef = useRef<THREE.Group>(null)
  const auraMeshesRef = useRef<THREE.Mesh[]>([])
  const auraLightsRef = useRef<THREE.PointLight[]>([])
  const candleLightsRef = useRef<Array<THREE.PointLight | null>>([])
  const candleFlamesRef = useRef<Array<THREE.Mesh | null>>([])
  const emberGroupRef = useRef<THREE.Group>(null)
  const spotlightRef = useRef<THREE.SpotLight>(null)
  const groundTargetRef = useRef<THREE.Object3D>(new THREE.Object3D())
  const updateTimerRef = useRef(0)
  const [hovered, setHovered] = useState(false)

  const { setSelectedProfile, isDayMode } = useCemeteryStore()
  const selectedProfileId = useCemeteryStore((state) => state.selectedProfile?.id)
  const isSelected = selectedProfileId === profile.id
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

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

  const variations = useMemo<GravestoneVariations>(() => {
    const rand = createRandomGenerator(profile.id)
    const desiredShape = profile.plotStyle
    const shapeChoices = platformShapeOptions[profile.platform] ?? defaultShapeOptions
    const shape = (desiredShape && (shapeChoices.includes(desiredShape) ? desiredShape : desiredShape)) ??
      shapeChoices[Math.floor(rand() * shapeChoices.length)]
    const base = gravestoneDimensions[shape]

    const width = base.width * (0.9 + rand() * 0.25)
    const height = base.height * (0.85 + rand() * 0.45)
    const depth = base.depth

    const cracks = Array.from({ length: 2 + Math.floor(rand() * 3) }, () => ({
      length: 0.25 + rand() * 0.55,
      thickness: 0.01 + rand() * 0.015,
      angle: (rand() - 0.5) * 0.6,
      offsetX: (rand() - 0.5) * width * 0.6,
      offsetY: height * (0.2 + rand() * 0.55),
    }))

    const glyphPath = glyphLibrary[Math.floor(rand() * glyphLibrary.length)]

    const emberCount = qualityTier === 'medium' ? 5 : 8
    const emberConfigs = Array.from({ length: emberCount }, () => ({
      radius: 0.012 + rand() * 0.025,
      orbitRadius: 0.35 + rand() * 0.55,
      heightOffset: 0.35 + rand() * 1.4,
      speed: 0.6 + rand() * 0.6,
      phase: rand() * Math.PI * 2,
    }))

    const candleCount = qualityTier === 'medium' ? 2 : 3
    const candleConfigs = Array.from({ length: candleCount }, () => ({
      offset: [
        (rand() - 0.5) * width * 0.55,
        0,
        depth / 2 + 0.4 + (rand() - 0.5) * 0.16,
      ] as [number, number, number],
      height: 0.32 + rand() * 0.2,
      phase: rand() * Math.PI * 2,
    }))

    const orbHeight = 0.55 + rand() * 0.25
    const backplateHeight = height * (0.6 + rand() * 0.15)

    return {
      shape,
      dimensions: { width, height, depth },
      baseHeight: 0.12 + rand() * 0.12,
      tilt: (rand() - 0.5) * 0.1,
      floatPhase: rand() * Math.PI * 2,
      cracks,
      glyphPath,
      glyphScale: 0.65 + rand() * 0.25,
      glyphYOffset: height * (0.35 + rand() * 0.1),
      glowHeight: height * (0.55 + rand() * 0.12),
      inscriptionSize: [width * 0.75, 0.42],
      inscriptionYOffset: -height * 0.18,
      emberConfigs,
      candleConfigs,
      orbHeight,
      backplateHeight,
    }
  }, [profile.id, profile.platform, profile.plotStyle, qualityTier])

  const auraColors = useMemo(() => {
    const palette = platformGlowPalette[profile.platform] ?? [profile.color]
    if (qualityTier === 'low') {
      return [palette[0]]
    }
    if (qualityTier === 'medium') {
      return palette.slice(0, Math.min(2, palette.length))
    }
    return palette
  }, [profile.platform, profile.color, qualityTier])

  const runeColor = useMemo(() => {
    const base = new THREE.Color(profile.color)
    const tint = base.clone().lerp(new THREE.Color('#E8EEFB'), 0.35)
    return `#${tint.getHexString()}`
  }, [profile.color])

  const inscriptionTexture = useMemo(
    () => createInscriptionTexture(profile.displayName, profile.handle),
    [profile.displayName, profile.handle]
  )

  useEffect(() => {
    if (!spotlightRef.current || !groundTargetRef.current) return
    spotlightRef.current.target = groundTargetRef.current
  }, [])

  useEffect(() => () => inscriptionTexture?.dispose(), [inscriptionTexture])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    updateTimerRef.current += delta
    const baseInterval = prefersReducedMotion
      ? 1 / 32
      : qualityTier === 'low'
        ? 1 / 28
        : qualityTier === 'medium'
          ? 1 / 36
          : 1 / 48
    const updateInterval = hovered ? 1 / 60 : baseInterval
    const shouldUpdate = updateTimerRef.current >= updateInterval
    if (shouldUpdate) {
      updateTimerRef.current = 0
    }

    if (meshRef.current) {
      const float = Math.sin(t * 0.4 + variations.floatPhase) * 0.08
      meshRef.current.position.y = float + (hovered ? 0.08 : 0)
      meshRef.current.rotation.y = variations.tilt + Math.sin(t * 0.25 + variations.floatPhase) * 0.04
    }

    if (auraGroupRef.current) {
      auraGroupRef.current.position.y = variations.glowHeight + Math.sin(t * 0.6) * 0.05
    }

    if (shouldUpdate) {
      auraMeshesRef.current.forEach((mesh, idx) => {
        if (!mesh) return
        const material = mesh.material as THREE.MeshBasicMaterial
        const baseOpacity = hovered ? 0.24 : 0.14
        const oscillation = prefersReducedMotion ? 0.03 : 0.05
        material.opacity = baseOpacity + Math.sin(t * 2.5 + idx) * oscillation
      })

      auraLightsRef.current.forEach((light, idx) => {
        if (!light) return
        const hoverBoost = hovered ? 0.6 : 0
        const pulseAmplitude = prefersReducedMotion ? 0.03 : 0.05
        light.intensity = (isDayMode ? 0.18 : 0.42) + hoverBoost + Math.sin(t * 3 + idx) * pulseAmplitude
      })

      if (spotlightRef.current) {
        const baseIntensity = isDayMode ? 0.25 : 1.05
        const hoverBoost = hovered ? 0.65 : 0
        const flicker = 1 + Math.sin(t * 7.5 + position[0]) * (prefersReducedMotion ? 0.04 : 0.08)
        spotlightRef.current.intensity = (baseIntensity + hoverBoost) * flicker
        spotlightRef.current.color.set(profile.color)
      }

      if (emberGroupRef.current) {
        emberGroupRef.current.children.forEach((ember, idx) => {
          const config = variations.emberConfigs[idx]
          if (!config) return

          const time = t * config.speed + config.phase
          const mesh = ember as THREE.Mesh
          mesh.position.set(
            Math.sin(time) * config.orbitRadius,
            config.heightOffset + Math.cos(time * 0.8) * 0.2,
            Math.cos(time * 0.6) * config.orbitRadius * 0.6
          )
          const material = mesh.material as THREE.MeshBasicMaterial
          const emberPulse = prefersReducedMotion ? 0.08 : 0.15
          material.opacity = 0.25 + Math.sin(time * 4) * emberPulse
        })
      }

      candleLightsRef.current.forEach((light, idx) => {
        const config = variations.candleConfigs[idx]
        if (!light || !config) return
      const base = isDayMode ? 0.2 : 0.38
      const flickerAmplitude = prefersReducedMotion ? 0.03 : 0.05
      const hoverBoost = hovered ? 0.22 : 0
      const flicker = Math.sin(t * 6.4 + config.phase) * flickerAmplitude
      light.intensity = base + hoverBoost + flicker
    })

      candleFlamesRef.current.forEach((flame, idx) => {
        const config = variations.candleConfigs[idx]
        if (!flame || !config) return
        const flamePulse = prefersReducedMotion ? 0.08 : 0.12
        const liftAmplitude = prefersReducedMotion ? 0.015 : 0.025
        const opacityPulse = prefersReducedMotion ? 0.05 : 0.08
        const scaleY = 1 + Math.sin(t * 7.8 + config.phase) * flamePulse
        flame.scale.set(1, scaleY, 1)
        flame.position.y = variations.baseHeight + config.height + 0.1 + Math.sin(t * 4.6 + config.phase) * liftAmplitude
        const material = flame.material as THREE.MeshBasicMaterial
        material.opacity = 0.42 + Math.sin(t * 6.2 + config.phase) * opacityPulse
      })
    }
  })

  const handleClick = () => {
    setSelectedProfile(profile)
  }

  const baseStoneColor = isDayMode ? '#a8b2c1' : '#3a4558'
  const crackColor = isDayMode ? '#4b556b' : '#0f1419'

  const graniteKey = `${profile.id}-${isDayMode ? 'day' : 'night'}`
  const graniteTextures = useMemo(() => createGraniteTextures(graniteKey, baseStoneColor), [graniteKey, baseStoneColor])

  const stoneMaterialProps = {
    color: baseStoneColor,
    map: graniteTextures?.albedo ?? undefined,
    roughnessMap: graniteTextures?.roughness ?? undefined,
    roughness: 0.92,
    metalness: 0.02,
    envMapIntensity: 0.05,
    emissive: isDayMode ? '#0f1419' : '#05080c',
    emissiveIntensity: hovered ? 0.12 : 0.06,
  }

  const glyphPoints = useMemo(() => {
    const { glyphPath, glyphScale } = variations
    return glyphPath.map(([x, y]) =>
      new THREE.Vector3(
        x * glyphScale,
        y * glyphScale + variations.glyphYOffset,
        variations.dimensions.depth / 2 + 0.002
      )
    )
  }, [variations])

  const stoneGeometry = useMemo(() => {
    const { width, height, depth } = variations.dimensions
    switch (variations.shape) {
      case 'rounded':
        return createArchedTabletGeometry(width, height, depth)
      case 'curved':
        return createArchedTabletGeometry(width, height * 1.05, depth)
      case 'tablet':
      case 'wide':
        return createRectTabletGeometry(width, height, depth)
      case 'footstone':
        return createFootstoneGeometry(width, height * 0.85, depth)
      case 'gothic':
        return createGothicGeometry(width, height, depth)
      case 'angular':
        return createAngularGeometry(width, height, depth)
      case 'cross':
        return createCrossGeometry(width, height, depth)
      default:
        return null
    }
  }, [variations])

  const { width, height, depth } = variations.dimensions

  const renderShape = () => {
    if (stoneGeometry) {
      return (
        <mesh geometry={stoneGeometry} castShadow receiveShadow>
          <meshStandardMaterial {...stoneMaterialProps} />
        </mesh>
      )
    }

    switch (variations.shape) {
      case 'obelisk':
        return (
          <group>
            <mesh position={[0, height * 0.22, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.9, height * 0.44, depth * 0.9]} />
              <meshStandardMaterial {...stoneMaterialProps} />
            </mesh>
            <mesh position={[0, height * 0.62, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.65, height * 0.46, depth * 0.65]} />
              <meshStandardMaterial {...stoneMaterialProps} />
            </mesh>
            <mesh position={[0, height * 0.96, 0]} castShadow receiveShadow>
              <coneGeometry args={[width * 0.35, height * 0.3, 5]} />
              <meshStandardMaterial {...stoneMaterialProps} />
            </mesh>
          </group>
        )
      case 'stepped':
        return (
          <group>
            <mesh position={[0, height * 0.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.95, height * 0.4, depth * 0.95]} />
              <meshStandardMaterial {...stoneMaterialProps} />
            </mesh>
            <mesh position={[0, height * 0.48, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.78, height * 0.32, depth * 0.82]} />
              <meshStandardMaterial {...stoneMaterialProps} />
            </mesh>
            <mesh position={[0, height * 0.72, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.58, height * 0.28, depth * 0.7]} />
              <meshStandardMaterial {...stoneMaterialProps} />
            </mesh>
          </group>
        )
      case 'modern':
        return (
          <group>
            <mesh position={[0, height * 0.35, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height * 0.6, depth]} />
              <meshStandardMaterial {...stoneMaterialProps} />
            </mesh>
            <mesh position={[0, height * 0.75, 0]} castShadow receiveShadow rotation={[0, 0, -0.12]}>
              <boxGeometry args={[width * 0.85, height * 0.35, depth * 0.92]} />
              <meshStandardMaterial {...stoneMaterialProps} />
            </mesh>
          </group>
        )
      default:
        return (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial {...stoneMaterialProps} />
          </mesh>
        )
    }
  }

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      <group rotation={[0, 0, 0]}>
        {/* Base plinth */}
        <RoundedBox
          args={[variations.dimensions.width + 0.6, variations.baseHeight, variations.dimensions.depth + 0.55]}
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

        {/* Orb pedestal and brand orb */}
        {/* Candle pedestals */}
        <group>
          {variations.candleConfigs.map((config, index) => (
            <group key={`candle-${profile.id}-${index}`} position={[config.offset[0], variations.baseHeight, config.offset[2]]}>
              <mesh position={[0, config.height / 2, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.14, config.height, 16]} />
                <meshStandardMaterial
                  color={isDayMode ? '#c8d0e0' : '#6a7480'}
                  roughness={0.9}
                  metalness={0.02}
                />
              </mesh>
              <mesh
                ref={(mesh) => {
                  candleFlamesRef.current[index] = mesh
                }}
                position={[0, config.height + 0.1, 0]}
              >
                <coneGeometry args={[0.09, 0.18, 16]} />
                <meshBasicMaterial color="#ff6b35" transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
              </mesh>
              <Billboard position={[0, config.height + 0.08, 0]}>
                <mesh>
                  <circleGeometry args={[0.32, 32]} />
                  <meshBasicMaterial color="#ff6b35" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
                </mesh>
              </Billboard>
              <pointLight
                ref={(light) => {
                  candleLightsRef.current[index] = light
                }}
                position={[0, config.height + 0.05, 0]}
                color="#ff6b35"
                distance={3.8}
                decay={2.6}
                intensity={isDayMode ? 0.2 : 0.38}
              />
            </group>
          ))}
        </group>

        {isSelected && (
          <group position={[0, variations.baseHeight, variations.dimensions.depth / 2 + 0.45]}>
            <mesh position={[0, 0.12, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.18, 0.24, 12]} />
              <meshStandardMaterial color={isDayMode ? '#5c6778' : '#2a303c'} roughness={0.8} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
              <coneGeometry args={[0.12, 0.18, 14]} />
              <meshStandardMaterial color={isDayMode ? '#d97f9c' : '#b5647f'} roughness={0.65} metalness={0.1} />
            </mesh>
            <mesh position={[0.1, 0.26, -0.08]}>
              <coneGeometry args={[0.09, 0.16, 12]} />
              <meshStandardMaterial color={isDayMode ? '#f3d3a7' : '#ddb48a'} roughness={0.7} metalness={0.08} />
            </mesh>
            <mesh position={[-0.12, 0.32, -0.05]}>
              <coneGeometry args={[0.1, 0.2, 12]} />
              <meshStandardMaterial color={isDayMode ? '#9ac48c' : '#7aa36d'} roughness={0.72} metalness={0.06} />
            </mesh>
          </group>
        )}

        {/* Gravestone body */}
        <group position={[0, variations.baseHeight, 0]}>
          {renderShape()}

          {variations.shape !== 'cross' && variations.shape !== 'obelisk' && (
            <mesh
              position={[0, variations.dimensions.height * 0.38, variations.dimensions.depth / 2 + 0.001]}
              rotation={[0, 0, 0]}
              castShadow
            >
              <planeGeometry args={[variations.dimensions.width * 0.78, variations.dimensions.height * 0.52]} />
              <meshStandardMaterial
                color={baseStoneColor}
                map={graniteTextures?.albedo ?? undefined}
                roughnessMap={graniteTextures?.roughness ?? undefined}
                roughness={0.94}
                metalness={0.02}
                transparent
                opacity={0.92}
              />
            </mesh>
          )}

          {/* Cracks / glyphs */}
          {variations.cracks.map((crack, index) => (
            <mesh
              key={`crack-${profile.id}-${index}`}
              position={[crack.offsetX, crack.offsetY, variations.dimensions.depth / 2 + 0.003]}
              rotation={[0, 0, crack.angle]}
            >
              <boxGeometry args={[crack.thickness, crack.length, 0.01]} />
              <meshStandardMaterial color={crackColor} roughness={1} metalness={0} />
            </mesh>
          ))}

          {/* Glyph sigil */}
          <Line
            points={glyphPoints}
            color={hovered ? (isDayMode ? '#d9e1f4' : '#bfc9e6') : (isDayMode ? '#4b5568' : '#8d98b4')}
            lineWidth={1.5}
            transparent
            opacity={hovered ? 0.65 : 0.35}
          />

          <Billboard position={[0, variations.glyphYOffset, variations.dimensions.depth / 2 + 0.01]}>
            <mesh>
              <circleGeometry args={[0.7, 32]} />
              <meshBasicMaterial
                color={hovered ? (isDayMode ? '#f7f1d2' : '#fcd9a5') : isDayMode ? '#d9dee8' : '#5f6b80'}
                transparent
                opacity={hovered ? 0.22 : isDayMode ? 0.14 : 0.22}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </Billboard>

          {/* Inscription */}
          {inscriptionTexture && (
            <mesh
              position={[0, variations.inscriptionYOffset + variations.dimensions.height * 0.5, variations.dimensions.depth / 2 + 0.002]}
              rotation={[0, 0, 0]}
            >
              <planeGeometry args={variations.inscriptionSize} />
              <meshStandardMaterial
                map={inscriptionTexture}
                transparent
                opacity={isDayMode ? 0.55 : 0.8}
                depthWrite={false}
                color={isDayMode ? '#e2e8f0' : '#cbd5f5'}
              />
            </mesh>
          )}
        </group>

        {/* Platform aura */}
        <group ref={auraGroupRef} position={[0, variations.glowHeight, 0]}>
          {auraColors.map((color, idx) => (
            <group key={`${profile.id}-aura-${idx}`}>
              <mesh
                ref={(mesh) => {
                  if (mesh) auraMeshesRef.current[idx] = mesh
                }}
              >
                <sphereGeometry args={[variations.dimensions.width * (0.32 + idx * 0.22)]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={isDayMode ? 0.08 : 0.14}
                  depthWrite={false}
                  depthTest={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
              <pointLight
                ref={(light) => {
                  if (light) auraLightsRef.current[idx] = light
                }}
                position={[0, 0.1 + idx * 0.2, 0]}
                color={color}
                distance={4 + idx * 1.8}
                decay={2}
                intensity={isDayMode ? 0.18 : 0.42}
              />
            </group>
          ))}
        </group>

        {/* Floating embers */}
        <group ref={emberGroupRef} position={[0, 0, 0]}>
          {variations.emberConfigs.map((config, index) => (
            <mesh key={`ember-${profile.id}-${index}`}>
              <sphereGeometry args={[config.radius]} />
              <meshBasicMaterial color="#ff6b35" transparent opacity={0.5} depthWrite={false} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Spotlight for grounded shadows */}
      <spotLight
        ref={spotlightRef}
        position={[0, 3.8, 1.2]}
        angle={0.55}
        penumbra={0.6}
        decay={2.2}
        distance={12}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.00015}
      />

      <primitive object={groundTargetRef.current} position={[0, 0, 0]} />
    </group>
  )
})

EnhancedGravestone.displayName = 'EnhancedGravestone'

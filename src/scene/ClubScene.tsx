import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { AudioEngine } from '../audio/AudioEngine'
import { activeEvent, closestBeatIndex } from '../game/timeline'
import type { CueMap, Phase, Quality, Track } from '../types'

type SceneProps = {
  engine: AudioEngine
  phase: Phase
  track: Track | null
  cues: CueMap | null
  reducedMotion: boolean
  reducedFlash: boolean
  quality: Quality
}

const HERO = '#d5f8ff'
const ENEMY_COLORS = ['#fc4bbb', '#8a68f9', '#ff9e57']
const ENEMY_POSITIONS: [number, number][] = [[1.75, 0.05], [3.35, 1.35], [0.7, -2.65]]

function Fighter({
  hero = false,
  index = 0,
  x,
  z,
  engine,
  phase,
  cues,
}: {
  hero?: boolean
  index?: number
  x: number
  z: number
  engine: AudioEngine
  phase: Phase
  cues: CueMap | null
}) {
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const color = hero ? HERO : ENEMY_COLORS[index]
  const accent = hero ? '#00eaff' : color

  useFrame(({ clock }) => {
    if (!root.current || !body.current || !leftArm.current || !rightArm.current || !leftLeg.current || !rightLeg.current) return
    const inFight = phase === 'playing' || phase === 'paused' || phase === 'finished'
    const time = inFight ? engine.getTime() : clock.elapsedTime
    const ms = time * 1000
    const event = inFight && cues ? activeEvent(cues.events, ms) : null
    const age = event ? (ms - event.atMs) / 1000 : 10
    const strike = Math.exp(-Math.abs(age) * 10)
    const target = event?.targetId === `enemy-${index + 1}`
    const hit = !hero && target && age >= 0 && age < 0.4 ? Math.sin((age / 0.4) * Math.PI) : 0
    const attacking = hero && event && ['punch', 'kick', 'launch', 'finisher'].includes(event.kind)
    const kick = attacking && (event.kind === 'kick' || event.kind === 'finisher') ? strike : 0
    const punch = attacking && (event.kind === 'punch' || event.kind === 'launch') ? strike : 0
    const bob = Math.sin(time * (inFight && cues ? cues.bpm / 60 * Math.PI * 2 : 3.2)) * 0.045

    const nextEventIndex = hero && inFight && cues ? cues.events.findIndex(e => e.atMs >= ms && e.kind !== 'step') : -1
    const nextEvent = nextEventIndex >= 0 ? cues!.events[nextEventIndex] : null
    const previousEvent = nextEventIndex > 0 ? cues!.events[nextEventIndex - 1] : event
    const nextIndex = nextEvent ? Number(nextEvent.targetId.slice(-1)) - 1 : 0
    const prevIndex = previousEvent ? Number(previousEvent.targetId.slice(-1)) - 1 : 0
    const nextPosition = ENEMY_POSITIONS[nextIndex] ?? ENEMY_POSITIONS[0]
    const previousPosition = nextEventIndex === 0 ? ([-0.32, 0.37] as [number, number]) : (ENEMY_POSITIONS[prevIndex] ?? ENEMY_POSITIONS[0])
    const transition = nextEvent ? THREE.MathUtils.smoothstep(ms, nextEvent.atMs - 1000, nextEvent.atMs - 200) : 1
    const desiredX = hero && inFight ? THREE.MathUtils.lerp(previousPosition[0], nextPosition[0], transition) - 1.13 : x
    const desiredZ = hero && inFight ? THREE.MathUtils.lerp(previousPosition[1], nextPosition[1], transition) + 0.23 : z
    root.current.position.x = desiredX + hit * 0.3
    root.current.position.z = desiredZ
    root.current.position.y = bob + (hit ? 0.1 : 0)
    root.current.rotation.y = hero ? -0.48 : -0.32 + hit * 0.35
    body.current.rotation.z = hit * 0.3 + (hero ? -0.03 : 0.04) * Math.sin(time * 2)
    leftArm.current.rotation.z = (hero ? 0.2 : -0.1) + Math.sin(time * 3.3 + index) * 0.22
    rightArm.current.rotation.z = -0.2 - Math.sin(time * 3.3 + 1.2 + index) * 0.22 + punch * 1.55
    rightArm.current.rotation.x = punch * -0.75
    leftLeg.current.rotation.z = Math.sin(time * 3.1 + index) * 0.13
    rightLeg.current.rotation.z = -Math.sin(time * 3.1 + index) * 0.13 + kick * 1.05
    body.current.position.y = hit * -0.18
  })

  return (
    <group ref={root} position={[x, 0, z]} scale={hero ? 1.14 : 0.98}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <circleGeometry args={[0.65, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.14} depthWrite={false} />
      </mesh>
      <group ref={body}>
        <mesh position={[0, 1.34, 0]} castShadow>
          <boxGeometry args={[0.8, 1.0, 0.44]} />
          <meshStandardMaterial color={hero ? '#1d2946' : '#232039'} metalness={0.48} roughness={0.34} />
        </mesh>
        <mesh position={[0, 1.54, 0.245]}>
          <boxGeometry args={[0.52, 0.32, 0.035]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.45} />
        </mesh>
        <mesh position={[0, 2.12, 0]} castShadow>
          <sphereGeometry args={[0.37, 16, 12]} />
          <meshStandardMaterial color={hero ? '#d6ecff' : '#4a3c58'} metalness={0.45} roughness={0.32} />
        </mesh>
        <mesh position={[0, 2.14, 0.32]}>
          <boxGeometry args={[0.49, 0.12, 0.07]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.3} />
        </mesh>
        <mesh position={[0, 2.62, 0]}>
          <coneGeometry args={[0.18, 0.35, 4]} />
          <meshStandardMaterial color={hero ? '#05d6e7' : accent} emissive={accent} emissiveIntensity={0.75} />
        </mesh>
        <group ref={leftArm} position={[-0.54, 1.77, 0]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <capsuleGeometry args={[0.17, 0.64, 4, 8]} />
            <meshStandardMaterial color={hero ? '#a8c4dd' : '#665176'} metalness={0.45} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.88, 0]}>
            <boxGeometry args={[0.34, 0.22, 0.3]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
          </mesh>
        </group>
        <group ref={rightArm} position={[0.54, 1.77, 0]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <capsuleGeometry args={[0.17, 0.64, 4, 8]} />
            <meshStandardMaterial color={hero ? '#a8c4dd' : '#665176'} metalness={0.45} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.88, 0]}>
            <boxGeometry args={[0.34, 0.22, 0.3]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
          </mesh>
        </group>
        <group ref={leftLeg} position={[-0.23, 0.88, 0]}>
          <mesh position={[0, -0.38, 0]} castShadow>
            <capsuleGeometry args={[0.2, 0.5, 4, 8]} />
            <meshStandardMaterial color={hero ? '#253659' : '#242037'} metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.77, 0.14]} castShadow>
            <boxGeometry args={[0.4, 0.2, 0.68]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3} />
          </mesh>
        </group>
        <group ref={rightLeg} position={[0.23, 0.88, 0]}>
          <mesh position={[0, -0.38, 0]} castShadow>
            <capsuleGeometry args={[0.2, 0.5, 4, 8]} />
            <meshStandardMaterial color={hero ? '#253659' : '#242037'} metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.77, 0.14]} castShadow>
            <boxGeometry args={[0.4, 0.2, 0.68]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function DanceFloor({ accent, engine, phase, cues, reducedFlash }: Pick<SceneProps, 'engine' | 'phase' | 'cues' | 'reducedFlash'> & { accent: string }) {
  const strips = useRef<THREE.Group>(null)
  const pulse = useRef<THREE.MeshStandardMaterial>(null)
  const tiles = useMemo(() => {
    const result = []
    for (let x = -6; x <= 6; x++) for (let z = -5; z <= 5; z++) {
      if (x * x + z * z < 42) result.push({ x, z, shade: (Math.abs(x * 7 + z * 13) % 5) / 5 })
    }
    return result
  }, [])
  useFrame(({ clock }) => {
    const time = phase === 'playing' ? engine.getTime() : clock.elapsedTime
    const ms = time * 1000
    const index = cues && phase === 'playing' ? closestBeatIndex(cues.beatsMs, ms) : -1
    const distance = index >= 0 ? Math.abs(ms - cues!.beatsMs[index]) : 400
    const beat = Math.max(0, 1 - distance / 300)
    if (pulse.current) pulse.current.emissiveIntensity = reducedFlash ? 0.25 + beat * 0.25 : 0.3 + beat * 0.8
    if (strips.current) strips.current.rotation.z = Math.sin(time * 0.13) * 0.02
  })
  return (
    <group ref={strips}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[7.6, 64]} />
        <meshStandardMaterial color="#080c1d" metalness={0.8} roughness={0.25} />
      </mesh>
      {tiles.map(({ x, z, shade }) => (
        <mesh key={`${x}-${z}`} position={[x * 0.98, 0.02, z * 0.98]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.91, 0.91]} />
          <meshStandardMaterial color={shade > 0.5 ? '#111933' : '#111025'} metalness={0.7} roughness={0.28} emissive={accent} emissiveIntensity={shade * 0.07} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[6.65, 6.78, 64]} />
        <meshStandardMaterial ref={pulse} color={accent} emissive={accent} emissiveIntensity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
        <ringGeometry args={[3.65, 3.71, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.32} />
      </mesh>
    </group>
  )
}

function DJBooth({ accent, engine, phase }: Pick<SceneProps, 'engine' | 'phase'> & { accent: string }) {
  const dj = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = phase === 'playing' ? engine.getTime() : clock.elapsedTime
    if (dj.current) {
      dj.current.position.y = 3.12 + Math.sin(t * 4) * 0.075
      dj.current.rotation.z = Math.sin(t * 2.4) * 0.08
    }
  })
  return (
    <group position={[0, 0, -7.5]}>
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[5.6, 2.5, 2.0]} />
        <meshStandardMaterial color="#111127" metalness={0.58} roughness={0.36} />
      </mesh>
      <mesh position={[0, 1.5, 1.025]}>
        <boxGeometry args={[5.1, 0.65, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[0, 2.55, 0.2]}>
        <boxGeometry args={[5.8, 0.2, 2.2]} />
        <meshStandardMaterial color="#24243d" metalness={0.72} roughness={0.25} />
      </mesh>
      {[-1.25, 1.25].map(x => (
        <group key={x} position={[x, 2.7, 0.35]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.035, 32]} />
            <meshStandardMaterial color="#080d18" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
            <ringGeometry args={[0.36, 0.43, 32]} />
            <meshBasicMaterial color={accent} />
          </mesh>
        </group>
      ))}
      <group ref={dj} position={[0, 3.12, -0.32]}>
        <mesh position={[0, 0.55, 0]}>
          <capsuleGeometry args={[0.3, 0.45, 4, 10]} />
          <meshStandardMaterial color="#dfebff" metalness={0.25} roughness={0.45} />
        </mesh>
        <mesh position={[0, 1.21, 0]}>
          <sphereGeometry args={[0.27, 12, 10]} />
          <meshStandardMaterial color="#f4c7a5" roughness={0.62} />
        </mesh>
        <mesh position={[0, 1.23, 0.24]}>
          <boxGeometry args={[0.43, 0.12, 0.08]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
        </mesh>
        <mesh position={[0, 1.48, 0]}>
          <torusGeometry args={[0.28, 0.07, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#171a32" />
        </mesh>
      </group>
      <mesh position={[0, 5.8, -0.8]}>
        <boxGeometry args={[11.4, 0.35, 0.4]} />
        <meshStandardMaterial color="#1a1930" metalness={0.5} />
      </mesh>
      {[-5.2, -3.5, 3.5, 5.2].map(x => (
        <mesh key={x} position={[x, 5.5, -0.5]}>
          <sphereGeometry args={[0.24, 12, 8]} />
          <meshStandardMaterial color="#ebf5ff" emissive={accent} emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  )
}

function Crowd({ quality }: { quality: Quality }) {
  const members = useMemo(() => Array.from({ length: quality === 'high' ? 34 : 16 }, (_, i) => {
    const angle = -Math.PI * 0.1 + (i / (quality === 'high' ? 33 : 15)) * Math.PI * 1.2
    return { x: Math.cos(angle) * 9.1, z: Math.sin(angle) * 8.5 - 0.8, height: 1.25 + (i % 5) * 0.14 }
  }), [quality])
  return <group>{members.map((m, i) => (
    <group key={i} position={[m.x, 0, m.z]} rotation={[0, -Math.atan2(m.x, m.z), 0]}>
      <mesh position={[0, m.height * 0.52, 0]}>
        <capsuleGeometry args={[0.25, m.height * 0.5, 4, 6]} />
        <meshStandardMaterial color={i % 4 ? '#23203f' : '#2e2143'} roughness={1} />
      </mesh>
      <mesh position={[0, m.height + 0.15, 0]}>
        <sphereGeometry args={[0.23, 8, 6]} />
        <meshStandardMaterial color="#3e304c" roughness={1} />
      </mesh>
    </group>
  ))}</group>
}

function Impact({ engine, phase, cues, color }: Pick<SceneProps, 'engine' | 'phase' | 'cues'> & { color: string }) {
  const ring = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(() => {
    if (!ring.current || !material.current || phase !== 'playing' || !cues) {
      if (ring.current) ring.current.visible = false
      return
    }
    const ms = engine.getTime() * 1000
    const event = activeEvent(cues.events, ms, 340)
    if (!event || !['punch', 'kick', 'launch', 'finisher'].includes(event.kind)) {
      ring.current.visible = false
      return
    }
    const age = (ms - event.atMs) / 1000
    const index = Number(event.targetId.slice(-1)) - 1
    const target = ENEMY_POSITIONS[index] ?? ENEMY_POSITIONS[0]
    ring.current.visible = true
    ring.current.position.set(target[0] - 0.4, 1.5, target[1] + 0.6)
    ring.current.scale.setScalar(0.22 + age * (event.kind === 'finisher' ? 5.8 : 3.4))
    material.current.opacity = Math.max(0, 0.9 - age * 2.7)
  })
  return <mesh ref={ring} visible={false}>
    <ringGeometry args={[0.66, 1, 32]} />
    <meshBasicMaterial ref={material} color={color} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
  </mesh>
}

function Lights({ accent, engine, phase, cues, reducedFlash, quality }: Pick<SceneProps, 'engine' | 'phase' | 'cues' | 'reducedFlash' | 'quality'> & { accent: string }) {
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const point = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    const t = phase === 'playing' ? engine.getTime() : clock.elapsedTime
    const phaseBeat = cues && phase === 'playing' ? t * cues.bpm / 60 : t * 1.8
    const pulse = Math.pow(Math.max(0, Math.cos(phaseBeat * Math.PI * 2)), 8)
    if (left.current) left.current.rotation.z = Math.sin(t * 0.62) * 0.36
    if (right.current) right.current.rotation.z = -Math.sin(t * 0.59 + 1) * 0.36
    if (point.current) point.current.intensity = reducedFlash ? 7 + pulse * 2 : 8 + pulse * 7
  })
  return (
    <group>
      <pointLight ref={point} position={[0, 6, 1]} color={accent} intensity={8} distance={16} />
      <spotLight position={[-4, 9, 2]} angle={0.43} penumbra={0.8} intensity={quality === 'high' ? 70 : 35} color="#2acfff" castShadow={quality === 'high'} />
      <spotLight position={[5, 8, 1]} angle={0.42} penumbra={0.8} intensity={quality === 'high' ? 62 : 30} color="#f64acf" />
      <group ref={left} position={[-5.3, 5.7, -5]}>
        <mesh rotation={[0, 0, 0.42]} position={[1.6, -1.8, 1.6]}>
          <coneGeometry args={[1.35, 5.5, 18, 1, true]} />
          <meshBasicMaterial color="#29d8ff" transparent opacity={reducedFlash ? 0.035 : 0.065} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={right} position={[5.3, 5.7, -5]}>
        <mesh rotation={[0, 0, -0.42]} position={[-1.6, -1.8, 1.6]}>
          <coneGeometry args={[1.35, 5.5, 18, 1, true]} />
          <meshBasicMaterial color="#e846fd" transparent opacity={reducedFlash ? 0.035 : 0.065} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

function SceneContents({ engine, phase, track, cues, reducedMotion, reducedFlash, quality }: SceneProps) {
  const { camera, gl } = useThree()
  const accent = track?.colors[0] ?? '#ff4ac6'
  const isFight = phase === 'playing' || phase === 'paused' || phase === 'finished'
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 1.75 : 1.2))
  }, [gl, quality])
  useFrame(({ clock }) => {
    const time = phase === 'playing' ? engine.getTime() : clock.elapsedTime
    const targetX = isFight ? 0 : -0.3
    const targetY = isFight ? 4.4 : 4.8
    const targetZ = isFight ? 12.5 : 13.5
    const sway = reducedMotion ? 0 : Math.sin(time * 0.26) * 0.48
    camera.position.lerp(new THREE.Vector3(targetX + sway, targetY, targetZ), 0.025)
    camera.lookAt(0, 1.4, -1.0)
  })
  return (
    <>
      <color attach="background" args={['#050614']} />
      <fog attach="fog" args={['#050614', 13, 32]} />
      <ambientLight intensity={2.1} color="#8d9ec7" />
      <hemisphereLight args={['#b5c8ff', '#211335', 3.0]} />
      <DanceFloor accent={accent} engine={engine} phase={phase} cues={cues} reducedFlash={reducedFlash} />
      <DJBooth accent={accent} engine={engine} phase={phase} />
      <Crowd quality={quality} />
      <Lights accent={accent} engine={engine} phase={phase} cues={cues} reducedFlash={reducedFlash} quality={quality} />
      <Impact engine={engine} phase={phase} cues={cues} color={accent} />
      <Fighter hero x={-1.45} z={0.6} engine={engine} phase={phase} cues={cues} />
      {ENEMY_POSITIONS.map(([x, z], index) => <Fighter key={index} index={index} x={x} z={z} engine={engine} phase={phase} cues={cues} />)}
    </>
  )
}

export default function ClubScene(props: SceneProps) {
  return (
    <Canvas
      className="scene-canvas"
      camera={{ position: [0, 4.8, 13.5], fov: 44, near: 0.1, far: 80 }}
      shadows={props.quality === 'high'}
      gl={{ antialias: props.quality === 'high', powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.domElement.setAttribute('aria-hidden', 'true') }}
    >
      <SceneContents {...props} />
    </Canvas>
  )
}

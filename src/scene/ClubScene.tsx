import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { AudioEngine } from '../audio/AudioEngine'
import { closestBeatIndex } from '../game/timeline'
import type { CueMap, Phase, Quality, Track } from '../types'
import { Fighter } from './Fighter'
import type { FighterAssets } from './fighterAssets'
import { ENEMY_POSITIONS } from '../game/combat'
import { cinematicAt } from '../game/cinematography'
import { CombatEffects } from './CombatEffects'
import { HumanCrowd, HumanDJ } from './VenuePeople'

type SceneProps = { assets: FighterAssets | null;
  engine: AudioEngine
  phase: Phase
  track: Track | null
  cues: CueMap | null
  reducedMotion: boolean
  reducedFlash: boolean
  quality: Quality
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
    const time = phase === 'playing' || phase === 'paused' || phase === 'finished' ? engine.getTime() : clock.elapsedTime
    const ms = time * 1000
    const index = cues && (phase === 'playing' || phase === 'paused' || phase === 'finished') ? closestBeatIndex(cues.beatsMs, ms) : -1
    const distance = index >= 0 ? Math.abs(ms - cues!.beatsMs[index]) : 400
    const beat = Math.max(0, 1 - distance / 300)
    if (pulse.current) pulse.current.emissiveIntensity = reducedFlash ? 0.25 + beat * 0.25 : 0.3 + beat * 0.8
    if (strips.current) strips.current.rotation.z = 0
  })
  return (
    <group ref={strips}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.02, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#111326" roughness={0.85} />
      </mesh>
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

function DJBooth({ accent, assets, engine, phase, reducedMotion }: Pick<SceneProps, 'assets' | 'engine' | 'phase' | 'reducedMotion'> & { accent: string }) {
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
          <mesh>
            <cylinderGeometry args={[0.55, 0.55, 0.035, 32]} />
            <meshStandardMaterial color="#080d18" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
            <ringGeometry args={[0.36, 0.43, 32]} />
            <meshBasicMaterial color={accent} />
          </mesh>
        </group>
      ))}
      {assets && <HumanDJ assets={assets} engine={engine} phase={phase} reducedMotion={reducedMotion} />}
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

function Lights({ accent, engine, phase, cues, reducedFlash, reducedMotion, quality }: Pick<SceneProps, 'engine' | 'phase' | 'cues' | 'reducedFlash' | 'reducedMotion' | 'quality'> & { accent: string }) {
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const point = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    const t = phase === 'playing' || phase === 'paused' || phase === 'finished' ? engine.getTime() : clock.elapsedTime
    const phaseBeat = cues && (phase === 'playing' || phase === 'paused' || phase === 'finished') ? t * cues.bpm / 60 : t * 1.8
    const pulse = Math.pow(Math.max(0, Math.cos(phaseBeat * Math.PI * 2)), 8)
    if (left.current) left.current.rotation.z = reducedMotion ? 0 : Math.sin(t * 0.62) * 0.36
    if (right.current) right.current.rotation.z = reducedMotion ? 0 : -Math.sin(t * 0.59 + 1) * 0.36
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

function SceneContents({ assets, engine, phase, track, cues, reducedMotion, reducedFlash, quality }: SceneProps) {
  const { camera, gl, size } = useThree()
  const accent = track?.colors[0] ?? '#ff4ac6'
  const isFight = phase === 'playing' || phase === 'paused' || phase === 'finished'
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 1.75 : 1.2))
  }, [gl, quality])
  useFrame(({ clock }) => {
    const time = isFight ? engine.getTime() : clock.elapsedTime
    const shot = cinematicAt(isFight ? cues : null, time, size.width / size.height, reducedMotion)
    camera.position.set(...shot.position)
    camera.lookAt(...shot.target)
    camera.rotateZ(shot.roll)
    if (camera instanceof THREE.PerspectiveCamera && camera.fov !== shot.fov) {
      camera.fov = shot.fov
      camera.updateProjectionMatrix()
    }
  })
  return (
    <>
      <color attach="background" args={['#050614']} />
      <fog attach="fog" args={['#050614', 13, 32]} />
      <ambientLight intensity={2.1} color="#8d9ec7" />
      <hemisphereLight args={['#b5c8ff', '#211335', 3.0]} />
      <directionalLight position={[0, 6, 7]} intensity={2.6} color="#fff1df" />
      <DanceFloor accent={accent} engine={engine} phase={phase} cues={cues} reducedFlash={reducedFlash} />
      <DJBooth accent={accent} assets={assets} engine={engine} phase={phase} reducedMotion={reducedMotion} />
      {assets && <HumanCrowd assets={assets} quality={quality} engine={engine} phase={phase} reducedMotion={reducedMotion} />}
      <Lights accent={accent} engine={engine} phase={phase} cues={cues} reducedFlash={reducedFlash} reducedMotion={reducedMotion} quality={quality} />
      <CombatEffects engine={engine} phase={phase} cues={cues} reducedMotion={reducedMotion} reducedFlash={reducedFlash} />
      {assets && <Fighter reducedMotion={reducedMotion} assets={assets} hero x={-1.45} z={0.6} engine={engine} phase={phase} cues={cues} />}
      {assets && ENEMY_POSITIONS.map(([x, z], index) => <Fighter reducedMotion={reducedMotion} assets={assets} key={index} index={index} x={x} z={z} engine={engine} phase={phase} cues={cues} />)}
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

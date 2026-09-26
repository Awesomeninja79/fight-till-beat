import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { combatAt, ENEMY_POSITIONS, isAttack } from '../game/combat'
import { activeEvent } from '../game/timeline'
import { techniqueFor } from '../game/techniques'
import type { AudioEngine } from '../audio/AudioEngine'
import type { CueMap, Phase } from '../types'

export function CombatEffects({ engine, phase, cues, reducedMotion, reducedFlash }: {
  engine: AudioEngine; phase: Phase; cues: CueMap | null; reducedMotion: boolean; reducedFlash: boolean
}) {
  const burst = useRef<THREE.Group>(null)
  const shards = useRef<THREE.InstancedMesh>(null)
  const slash = useRef<THREE.Mesh>(null)
  const streaks = useRef<THREE.InstancedMesh>(null)
  const starMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const shardMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const slashMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const streakMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const attacks = useMemo(() => cues?.events.filter(isAttack) ?? [], [cues])
  const star = useMemo(() => {
    const shape = new THREE.Shape()
    for (let i = 0; i <= 24; i++) {
      const a = i / 24 * Math.PI * 2
      const radius = i % 2 ? 0.16 : 0.6 + (i % 3) * 0.08
      if (i === 0) shape.moveTo(Math.cos(a) * radius, Math.sin(a) * radius)
      else shape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius)
    }
    return shape
  }, [])

  useFrame(({ camera }) => {
    if (!burst.current || !shards.current || !slash.current || !streaks.current) return
    const visible = (phase === 'playing' || phase === 'paused' || phase === 'finished') && cues
    burst.current.visible = slash.current.visible = streaks.current.visible = false
    if (!visible) return
    const time = engine.getTime(), ms = time * 1000
    const state = combatAt(cues!.events, ms)
    const hit = activeEvent(attacks, ms, 380)
    const safety = reducedFlash ? 0.38 : 0.72
    if (hit) {
      const age = (ms - hit.atMs) / 1000
      const target = ENEMY_POSITIONS[Number(hit.targetId.slice(-1)) - 1]
      const heavy = hit.kind === 'finisher' || hit.kind === 'launch'
      const technique = techniqueFor(hit)
      burst.current.visible = true
      burst.current.position.set(target[0] - 0.28, technique ? technique.height * 1.48 : hit.kind === 'kick' ? 1.7 : 2.05, target[1] + 0.05)
      starMaterial.current!.color.set(technique?.motion === 'energy' ? '#b7a1ff' : '#ffe8b8')
      shardMaterial.current!.color.set(technique?.motion === 'energy' ? '#8e72ff' : '#ffd277')
      burst.current.quaternion.copy(camera.quaternion)
      burst.current.scale.setScalar(reducedMotion ? 0.6 : 0.4 + age * (heavy ? 3.4 : 2))
      starMaterial.current!.opacity = Math.max(0, 1 - age / 0.16) * safety
      shardMaterial.current!.opacity = Math.max(0, 1 - age / 0.38) * safety
      shards.current.visible = !reducedMotion
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2 + 0.13
        const radius = 0.4 + age * (2.5 + i % 4)
        dummy.position.set(Math.cos(a) * radius, Math.sin(a) * radius * 0.7, 0)
        dummy.rotation.set(0, 0, a)
        dummy.scale.set(0.15 + age * 0.7, 0.012 + (i % 3) * 0.005, 1)
        dummy.updateMatrix(); shards.current.setMatrixAt(i, dummy.matrix)
      }
      shards.current.instanceMatrix.needsUpdate = true
    }
    if (state.event && isAttack(state.event) && state.age > -0.12 && state.age < 0.2 && !reducedMotion) {
      const kick = state.event.kind === 'kick' || state.event.kind === 'finisher'
      slash.current.visible = true
      slash.current.position.set(state.x + 0.65, kick ? 1.5 : 2.0, state.z)
      slash.current.quaternion.copy(camera.quaternion)
      slash.current.rotateZ((kick ? -0.9 : 0.4) + state.age * 4)
      slash.current.scale.set(kick ? 1.1 : 0.75, kick ? 0.8 : 0.3, 1)
      slashMaterial.current!.opacity = Math.sin((state.age + 0.12) / 0.32 * Math.PI) * safety
    }
    if (state.moving && !reducedMotion) {
      streaks.current.visible = true
      streakMaterial.current!.opacity = Math.sin(state.travel * Math.PI) * safety * 0.6
      for (let i = 0; i < 10; i++) {
        dummy.position.set(state.x - 0.5 - (i % 3) * 0.18, 0.3 + i * 0.16, state.z - (i % 2) * 0.18)
        dummy.rotation.set(0, 0, -0.04)
        dummy.scale.set(0.6 + (i % 3) * 0.3, 0.012, 0.012)
        dummy.updateMatrix(); streaks.current.setMatrixAt(i, dummy.matrix)
      }
      streaks.current.instanceMatrix.needsUpdate = true
    }
  })
  return <>
    <group ref={burst} visible={false}>
      <mesh><shapeGeometry args={[star]} /><meshBasicMaterial ref={starMaterial} color="#ffe8b8" transparent depthWrite={false} toneMapped={false} /></mesh>
      <instancedMesh ref={shards} args={[undefined, undefined, 18]} frustumCulled={false}>
        <planeGeometry /><meshBasicMaterial ref={shardMaterial} color="#ffd277" transparent depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
    <mesh ref={slash} visible={false}>
      <ringGeometry args={[0.86, 0.94, 40, 1, 0, Math.PI * 1.45]} />
      <meshBasicMaterial ref={slashMaterial} color="#70f5ff" side={THREE.DoubleSide} transparent depthWrite={false} toneMapped={false} />
    </mesh>
    <instancedMesh ref={streaks} args={[undefined, undefined, 10]} frustumCulled={false} visible={false}>
      <boxGeometry /><meshBasicMaterial ref={streakMaterial} color="#67ebff" transparent depthWrite={false} toneMapped={false} />
    </instancedMesh>
  </>
}

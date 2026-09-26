import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import type { AudioEngine } from '../audio/AudioEngine'
import { attackLayersAt, combatAt, isAttack, moveEnvelope, strikeTime, waitingOffset } from '../game/combat'
import { activeEvent } from '../game/timeline'
import type { CueMap, Phase } from '../types'
import type { FighterAssets } from './fighterAssets'
import { sampleSkeletalPose } from './skeletalPose'
import { addAnimeCostume } from './animeCostume'
import { applyKick, applyTechnique } from './martialArts'
import { techniqueFor, isThrow } from '../game/techniques'

const COLORS = ['#f1549d', '#9569f5', '#ffad53']
const smooth = (x: number) => THREE.MathUtils.smoothstep(x, 0, 1)

export function Fighter({ assets, hero = false, index = 0, x, z, engine, phase, cues, reducedMotion = false }: {
  assets: FighterAssets; hero?: boolean; index?: number; x: number; z: number
  engine: AudioEngine; phase: Phase; cues: CueMap | null; reducedMotion?: boolean
}) {
  const root = useRef<THREE.Group>(null)
  const marker = useRef<THREE.Mesh>(null)
  const accent = hero ? '#35e3ed' : COLORS[index]
  const incomingHits = useMemo(() => cues?.events.filter(event => isAttack(event) && event.targetId === `enemy-${index + 1}`) ?? [], [cues, index])
  const crossIds = useMemo(() => new Set(cues?.events.filter(event => event.kind === 'punch').filter((_, i) => i % 2 === 1).map(event => event.id)), [cues])
  const actor = useMemo(() => {
    const scene = clone(assets.model.scene)
    const materials: THREE.Material[] = []
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return
      object.castShadow = true
      object.frustumCulled = false
      const originals = Array.isArray(object.material) ? object.material : [object.material]
      const copies = originals.map(original => {
        const material = original.clone() as THREE.MeshStandardMaterial
        materials.push(material)
        if (material.name === 'MI_Superhero_Male') {
          // Clothing follows the skinned surface. Mask in bind space so it never slides.
          material.onBeforeCompile = shader => {
            shader.uniforms.kitColor = { value: new THREE.Color(accent) }
            shader.vertexShader = 'varying vec3 kitPosition;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nkitPosition = position;')
            shader.fragmentShader = 'varying vec3 kitPosition; uniform vec3 kitColor;\n' + shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
              float pants = 1.0 - smoothstep(0.98, 1.01, kitPosition.y);
              float top = step(1.03, kitPosition.y) * (1.0-step(1.47,kitPosition.y)) * (1.0-smoothstep(0.19,0.26,abs(kitPosition.x)));
              float gloves = smoothstep(0.77,0.81,abs(kitPosition.x));
              float belt = step(0.94,kitPosition.y)*(1.0-step(1.0,kitPosition.y));
              float stripe = pants * step(0.13,abs(kitPosition.x)) * (1.0-step(0.165,abs(kitPosition.x)));
              vec3 cloth = mix(vec3(0.018,0.026,0.048),kitColor*0.6,max(max(gloves,belt),stripe));
              diffuseColor.rgb = mix(diffuseColor.rgb,cloth,max(max(pants,top),gloves));`)
            shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
              float shade = max(0.001, dot(outgoingLight, vec3(0.2126,0.7152,0.0722)));
              float band = floor(shade * 5.0 + 0.5) / 5.0;
              outgoingLight *= mix(1.0, max(0.16,band)/shade, 0.65);
              float rim = pow(1.0-max(0.0,dot(normal,normalize(vViewPosition))),3.0);
              outgoingLight += kitColor * rim * 0.22;
              #include <opaque_fragment>`)
          }
          material.customProgramCacheKey = () => 'fighter-anime-v2'
          material.roughness = 0.72
        }
        return material
      })
      object.material = Array.isArray(object.material) ? copies : copies[0]
    })
    const mixer = new THREE.AnimationMixer(scene)
    const guardClip = assets.clips.find(clip => clip.name === 'Punch_Jab')!.clone()
    guardClip.name = 'Guard'
    const actions = new Map([...assets.clips, guardClip].map(clip => {
      const action = mixer.clipAction(clip).play()
      action.enabled = true
      return [clip.name, action] as const
    }))
    const bones = new Map<string, THREE.Object3D>()
    scene.traverse(object => { if (object instanceof THREE.Bone) bones.set(object.name, object) })
    const basePose = [...bones.values()].map(bone => ({ bone, rotation: bone.quaternion.clone(), position: bone.position.clone() }))
    const costume = addAnimeCostume(scene, hero, accent)
    return { scene, mixer, actions, materials, bones, basePose, costume }
  }, [assets, accent, hero])

  useEffect(() => {
    // StrictMode remounts effects: rebind actions after the cleanup, too.
    for (const [name, action] of actor.actions) actor.actions.set(name, actor.mixer.clipAction(action.getClip()).play())
    return () => {
      actor.mixer.stopAllAction(); actor.mixer.uncacheRoot(actor.scene)
      actor.materials.forEach(material => material.dispose())
      actor.costume.materials.forEach(material => material.dispose())
      actor.costume.geometries.forEach(geometry => geometry.dispose())
    }
  }, [actor])

  useFrame(({ clock }) => {
    if (!root.current) return
    const fighting = phase === 'playing' || phase === 'paused' || phase === 'finished'
    const time = fighting ? engine.getTime() : clock.elapsedTime
    const state = combatAt(fighting && cues ? cues.events : [], time * 1000)
    const { event, age } = state
    const technique = techniqueFor(event)
    const hitEvent = !hero && fighting ? activeEvent(incomingHits, time * 1000, 1150) : null
    const hitAge = hitEvent ? (time * 1000 - hitEvent.atMs) / 1000 : 10
    const hitDuration = hitEvent?.kind === 'finisher' || isThrow(techniqueFor(hitEvent)) ? 1.15 : hitEvent?.kind === 'launch' ? 0.9 : 0.46
    const envelope = event ? moveEnvelope(age) : 0
    const attack = hero && event && isAttack(event)
    const kick = attack && (event.kind === 'kick' || event.kind === 'finisher')
    let name = 'Idle_Loop', weight = 0, sample = 0
    if (hero && state.moving) { name = 'Jog_Fwd_Loop'; weight = 0.95; sample = (time * 1.65) % 0.933 }
    if (hero && event) {
      name = event.kind === 'dance' ? 'Dance_Loop' : event.kind === 'dodge' ? 'Crouch_Idle_Loop'
        : event.kind === 'launch' || crossIds.has(event.id) ? 'Punch_Cross' : 'Punch_Jab'
      weight = event.kind === 'dance' ? envelope : kick ? 0 : smooth((age + 0.32) / 0.1) * (1 - smooth((age - 0.24) / 0.22))
      // The sampled punch contact sits at the cue, with anticipation before it.
      const contact = name === 'Punch_Cross' ? 0.3 : 0.2
      sample = strikeTime(age, contact)
      if (event.kind === 'dance') sample = (age + 0.32) * 1.3
    }
    if (!hero && event?.kind === 'dodge' && event.targetId === `enemy-${index + 1}`) {
      name = 'Punch_Cross'; weight = smooth((age + 0.32) / 0.12) * (1 - smooth(age / 0.46)); sample = strikeTime(age, 0.3)
    }
    if (hitEvent && hitAge < hitDuration) { name = hitEvent.kind === 'launch' || hitEvent.kind === 'finisher' ? 'Hit_Knockback' : hitEvent.move === 'hook' ? 'Hit_Head' : 'Hit_Chest'; weight = 1 - smooth(hitAge / hitDuration); sample = Math.max(0, hitAge - 0.04) * 0.75 }
    const layers = hero && fighting && cues ? attackLayersAt(cues.events, time * 1000) : []
    const motion = new Map<string, { weight: number; sample: number }>()
    let total = 0
    if (layers.length) {
      for (const layer of layers) {
        const move = layer.event.move
        const style = techniqueFor(layer.event)
        const clipName = style && ['throw', 'sacrifice', 'energy', 'palm', 'elbow', 'kick', 'knee', 'axe', 'cartwheel'].includes(style.motion) ? 'Guard' : style?.id.includes('hook') ? 'Melee_Hook' : style?.side === 'r' ? 'Punch_Cross' : style?.side === 'l' ? 'Punch_Jab' : layer.event.kind === 'kick' || layer.event.kind === 'finisher' ? 'Guard'
          : move === 'hook' ? 'Melee_Hook' : move === 'cross' || move === 'uppercut' || layer.event.kind === 'launch' || (!move && crossIds.has(layer.event.id)) ? 'Punch_Cross' : 'Punch_Jab'
        let clipSample = strikeTime(layer.age, clipName === 'Punch_Jab' || clipName === 'Melee_Hook' ? .2 : .3)
        let resolvedName = clipName
        if (clipName === 'Melee_Hook' && clipSample >= .46) { resolvedName = 'Melee_Hook_Rec'; clipSample -= .46 }
        if (clipName === 'Guard') clipSample = .06
        const existing = motion.get(resolvedName)
        const combinedWeight = (existing?.weight ?? 0) + layer.weight
        motion.set(resolvedName, { weight: combinedWeight, sample: combinedWeight > 0 ? ((existing?.sample ?? 0) * (existing?.weight ?? 0) + clipSample * layer.weight) / combinedWeight : clipSample })
        total += layer.weight
      }
    } else if (weight > 0) { motion.set(name, { weight, sample }); total = weight }
    const guard = motion.get('Guard')
    motion.set('Guard', { weight: (guard?.weight ?? 0) + Math.max(0, 1 - total), sample: guard?.sample ?? .05 })
    for (const [key, action] of actor.actions) {
      const entry = motion.get(key)
      action.enabled = true
      action.setEffectiveWeight(entry?.weight ?? 0)
      action.time = Math.min(entry?.sample ?? 0, action.getClip().duration - .001)
    }
    sampleSkeletalPose(actor.mixer, actor.basePose)
    // Add a guarded stance and authored roundhouse/uppercut accents to the clip pose.
    const rotate = (bone: string, axis: 'x' | 'y' | 'z', value: number) => {
      const b = actor.bones.get(bone); if (b) b.rotateOnAxis(axis === 'x' ? AXIS_X : axis === 'y' ? AXIS_Y : AXIS_Z, value)
    }
    const flow = Math.sin(time * 3.4 + index * 1.7)
    rotate('spine_02', 'x', flow * 0.045 * (1 - weight))
    rotate('spine_01', 'y', Math.sin(time * 1.7 + index) * 0.08 * (1 - weight))
    rotate('Head', 'z', -flow * 0.035 * (1 - weight))
    rotate('upperarm_l', 'z', flow * 0.045 * (1 - weight))
    rotate('thigh_l', 'x', Math.max(0, flow) * 0.08 * (1 - weight))
    rotate('calf_l', 'x', Math.max(0, flow) * 0.11 * (1 - weight))
    if (hero && attack && !kick) {
      const load = age < 0 ? Math.sin(smooth((age + 0.32) / 0.32) * Math.PI) : 0
      rotate('spine_01', 'y', -load * 0.25)
      rotate('spine_03', 'z', -load * 0.12)
    }
    for (const layer of layers) {
      const style = techniqueFor(layer.event)
      if (style) applyTechnique(actor.scene, actor.bones, layer.age, layer.weight, style)
      else if (layer.event.kind === 'kick' || layer.event.kind === 'finisher') {
        applyKick(actor.scene, actor.bones, layer.age, layer.weight, layer.event.move === 'side-kick' || layer.event.kind === 'finisher')
      }
    }
    if (attack && event.kind === 'launch' && !technique) rotate('upperarm_r', 'x', -0.6 * envelope)
    const recoil = hitEvent ? Math.sin(Math.min(1, hitAge / hitDuration) * Math.PI) : 0
    const launched = hitEvent?.kind === 'launch' || hitEvent?.kind === 'finisher'
    const launch = launched ? recoil * (hitEvent.kind === 'finisher' ? 1.15 : 1.0) : 0
    const jump = hero && layers.length ? layers.reduce((sum, layer) => sum + (techniqueFor(layer.event)?.air ?? 0) * moveEnvelope(layer.age) * layer.weight, 0) : 0
    const bounce = Math.sin(time * 6.8 + index) * 0.018 * (1 - weight)
    const waiting = !hero && fighting ? waitingOffset(x, z, state.x, state.z, time) : [0, 0]
    root.current.position.set(hero && fighting ? state.x : x + recoil * (launched ? 1.0 : 0.35), 0.025 + launch + jump + bounce, hero && fighting ? state.z : z)
    if (!hero) { root.current.position.x += waiting[0]; root.current.position.z += waiting[1] }
    if (hero && state.moving) { root.current.position.z += Math.sin(state.travel * Math.PI) * 0.35 }
    if (hero && attack && age < 0) root.current.position.x -= Math.sin(smooth((age + 0.32) / 0.32) * Math.PI) * 0.22
    if (kick) root.current.position.x += 0.07 * envelope
    if (hero && event?.kind === 'dodge') root.current.position.z += envelope * 0.6
    root.current.rotation.set(0, hero ? Math.PI / 2 : Math.atan2(state.x - x, state.z - z), 0)
    if (hero && state.moving) root.current.rotation.y = THREE.MathUtils.lerp(state.heading, Math.PI / 2, smooth((state.travel - 0.7) / 0.3))
    if (!fighting && !hero) root.current.rotation.y = -Math.PI / 2
    if (hero && technique && Math.abs(technique.turn) >= 6) root.current.rotation.y += technique.turn * smooth((age + .32) / .32)
    if (hero && isThrow(technique)) root.current.position.x += .38 * envelope
    if (hero && technique?.motion === 'elbow') root.current.position.x += .42 * envelope
    actor.scene.rotation.x = -recoil * (launched ? 0.75 : 0.23) + (hero && state.moving ? 0.18 * Math.sin(state.travel * Math.PI) : 0)
    actor.scene.rotation.z = hero && event?.kind === 'dodge' ? -envelope * 0.32 : flow * 0.018 * (1 - weight)
    if (hero && technique?.motion === 'cartwheel') actor.scene.rotation.z = -1.25 * envelope
    if (hero && technique?.motion === 'sacrifice') actor.scene.rotation.x = -1.1 * envelope
    if (!hero && isThrow(techniqueFor(hitEvent))) actor.scene.rotation.z = -recoil * (1.8 + Math.abs(techniqueFor(hitEvent)!.turn) * .15)
    if (marker.current) marker.current.position.y = .008 - root.current.position.y
    for (const [i, ribbon] of actor.costume.ribbons.entries()) {
      const positions = ribbon.geometry.attributes.position
      for (let v = 0; v < positions.count; v++) {
        const distance = -positions.getY(v) / 0.62
        positions.setZ(v, Math.sin(time * 8 - distance * 4 + i) * (reducedMotion ? 0.015 : 0.075) * distance)
      }
      positions.needsUpdate = true
      ribbon.rotation.x = 0.55 + (state.moving || attack ? 0.3 : 0) + Math.sin(time * 4 + i) * (reducedMotion ? 0 : 0.08)
    }
  })

  return <group ref={root} position={[x, 0, z]}>
    <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
      <ringGeometry args={[0.4, 0.44, 48]} />
      <meshBasicMaterial color={accent} transparent opacity={0.4} depthWrite={false} />
    </mesh>
    <primitive object={actor.scene} scale={hero ? 1.48 : 1.4} dispose={null} />
  </group>
}
const AXIS_X = new THREE.Vector3(1, 0, 0)
const AXIS_Y = new THREE.Vector3(0, 1, 0)
const AXIS_Z = new THREE.Vector3(0, 0, 1)

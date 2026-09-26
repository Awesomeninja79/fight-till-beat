import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import type { AudioEngine } from '../audio/AudioEngine'
import type { Phase, Quality } from '../types'
import type { FighterAssets } from './fighterAssets'
import { sampleSkeletalPose } from './skeletalPose'
import { solveLimb } from './martialArts'

type Props = { assets: FighterAssets; engine: AudioEngine; phase: Phase; reducedMotion: boolean }
const shirts = ['#8073cb', '#dcad80', '#528a99', '#b9517d', '#d6d5df', '#364565']

function Person({ assets, engine, phase, reducedMotion, index, dj = false }: Props & { index: number; dj?: boolean }) {
  const actor = useMemo(() => {
    const scene = clone(assets.model.scene)
    const materials: THREE.Material[] = []
    const geometries: THREE.BufferGeometry[] = []
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return
      const originals = Array.isArray(object.material) ? object.material : [object.material]
      const copies = originals.map(original => {
        const material = original.clone() as THREE.MeshStandardMaterial
        materials.push(material)
        if (material.name === 'MI_Superhero_Male') {
          material.roughness = 0.92
          material.onBeforeCompile = shader => {
            shader.uniforms.shirt = { value: new THREE.Color(dj ? '#dcd9e7' : shirts[index % shirts.length]) }
            shader.vertexShader = 'varying vec3 outfitPosition;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\noutfitPosition=position;')
            shader.fragmentShader = 'varying vec3 outfitPosition; uniform vec3 shirt;\n' + shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
              float pants=1.0-smoothstep(.97,1.0,outfitPosition.y);
              float top=step(1.0,outfitPosition.y)*(1.0-step(1.48,outfitPosition.y))*(1.0-smoothstep(.25,.42,abs(outfitPosition.x)));
              diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.028,.033,.058),pants);
              diffuseColor.rgb=mix(diffuseColor.rgb,shirt,top);`)
          }
          material.customProgramCacheKey = () => 'venue-outfit-v1'
        }
        return material
      })
      object.material = Array.isArray(object.material) ? copies : copies[0]
    })
    const head = scene.getObjectByName('Head')!
    scene.updateMatrixWorld(true)
    const hairMaterial = new THREE.MeshStandardMaterial({ color: dj ? '#17121f' : ['#241a20', '#78503c', '#b8a689'][index % 3], roughness: 0.95 })
    materials.push(hairMaterial)
    const hairGeometry = new THREE.SphereGeometry(0.106, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.59)
    geometries.push(hairGeometry)
    const hair = new THREE.Mesh(hairGeometry, hairMaterial)
    hair.position.set(0, 1.755, -0.012); hair.scale.set(1, 1.15, 0.95)
    scene.add(hair); head.attach(hair)
    if (dj) {
      const headphoneMaterial = new THREE.MeshStandardMaterial({ color: '#202331', metalness: 0.5, roughness: 0.4 })
      materials.push(headphoneMaterial)
      const bandGeometry = new THREE.TorusGeometry(0.12, 0.017, 8, 20, Math.PI)
      const earGeometry = new THREE.SphereGeometry(0.038, 10, 8)
      geometries.push(bandGeometry, earGeometry)
      const band = new THREE.Mesh(bandGeometry, headphoneMaterial)
      band.position.set(0, 1.76, 0); scene.add(band); head.attach(band)
      for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(earGeometry, headphoneMaterial)
        ear.position.set(side * 0.116, 1.748, 0); ear.scale.set(0.5, 1.4, 1)
        scene.add(ear); head.attach(ear)
      }
    }
    const mixer = new THREE.AnimationMixer(scene)
    const clip = assets.clips.find(c => c.name === (dj ? 'Idle_Rail_Loop' : index % 4 === 0 ? 'Idle_FoldArms_Loop' : 'Dance_Loop'))!
    const action = mixer.clipAction(clip).play()
    const bones: { bone: THREE.Object3D; rotation: THREE.Quaternion }[] = []
    scene.traverse(bone => { if (bone instanceof THREE.Bone) bones.push({ bone, rotation: bone.quaternion.clone() }) })
    return { scene, mixer, action, clip, bones, materials, geometries, head }
  }, [assets, dj, index])
  useEffect(() => {
    actor.mixer.clipAction(actor.clip).play()
    return () => { actor.mixer.stopAllAction(); actor.mixer.uncacheRoot(actor.scene); actor.materials.forEach(m => m.dispose()); actor.geometries.forEach(g => g.dispose()) }
  }, [actor])
  useFrame(({ clock }) => {
    const t = ['playing', 'paused', 'finished'].includes(phase) ? engine.getTime() : clock.elapsedTime
    const action = actor.mixer.clipAction(actor.clip)
    action.time = (reducedMotion ? index * 0.17 : t * (dj ? 0.6 : 0.65 + (index % 3) * 0.1) + index * 0.29) % actor.clip.duration
    sampleSkeletalPose(actor.mixer, actor.bones)
    if (dj && !reducedMotion) actor.head.rotateX(Math.sin(t * 3) * 0.055)
    if (dj) {
      for (const side of ['l', 'r']) {
        const sign = side === 'l' ? 1 : -1
        const hand = new THREE.Vector3(sign * (.4 + (reducedMotion ? 0 : Math.sin(t * 1.7 + sign) * .07)), .98, .63)
        const pole = new THREE.Vector3(sign * .6, 1.2, .2)
        solveLimb(actor.scene.getObjectByName(`upperarm_${side}`)!, actor.scene.getObjectByName(`lowerarm_${side}`)!, actor.scene.getObjectByName(`hand_${side}`)!, actor.scene.localToWorld(hand), actor.scene.localToWorld(pole))
      }
    }
    if (!dj) {
      const cheerTime = reducedMotion ? index * .7 : t
      const pulse = (1 + Math.sin(cheerTime * 4.6 + index * 1.9)) / 2
      for (const side of ['l', 'r']) {
        const sign = side === 'l' ? 1 : -1
        const clapping = index % 3 === 0
        const oneArm = index % 3 === 1 && side === 'l'
        const point = new THREE.Vector3(sign * (clapping ? .045 + pulse * .2 : .3), oneArm ? 1.25 : clapping ? 1.91 : 1.94 + pulse * .18, clapping ? .3 : .06)
        const pole = new THREE.Vector3(sign * .75, 1.6, .35)
        solveLimb(actor.scene.getObjectByName(`upperarm_${side}`)!, actor.scene.getObjectByName(`lowerarm_${side}`)!, actor.scene.getObjectByName(`hand_${side}`)!, actor.scene.localToWorld(point), actor.scene.localToWorld(pole))
      }
    }
  })
  return <primitive object={actor.scene} dispose={null} />
}

export function HumanDJ(props: Props) {
  return <group position={[0, 1.25, -0.7]} scale={1.48}><Person {...props} index={0} dj /></group>
}

export function HumanCrowd({ quality, ...props }: Props & { quality: Quality }) {
  const count = quality === 'high' ? 14 : 8
  return <group>{Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI + (i / (count - 1)) * Math.PI
    const x = Math.cos(angle) * 8.15, z = Math.sin(angle) * 8.4 - 0.6
    const height = 1.12 + (i % 4) * 0.07
    return <group key={i} position={[x, 0.03, z]} rotation={[0, Math.atan2(-x, -z), 0]} scale={[height * (0.86 + (i % 3) * 0.07), height, height]}>
      <Person {...props} index={i + 1} />
    </group>
  })}</group>
}

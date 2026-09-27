import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'

export type FighterAssets = { model: GLTF; clips: THREE.AnimationClip[] }
let pending: Promise<FighterAssets> | undefined

export function loadFighterAssets() {
  if (!pending) {
    const loader = new GLTFLoader()
    pending = Promise.all([
      loader.loadAsync('/models/fighter-v1.glb'),
      loader.loadAsync('/models/combat-v1.glb'),
      loader.loadAsync('/models/melee-v2.glb'),
    ]).then(([model, ...libraries]) => {
      // Preserve the character's limb lengths; only the pelvis translates.
      const clips = libraries.flatMap(library => library.animations.map(original => {
        const clip = original.clone()
        clip.tracks = clip.tracks.filter(track => track.name.endsWith('.quaternion') || track.name === 'pelvis.position')
        for (const track of clip.tracks) {
          if (track.name !== 'pelvis.position') continue
          const source = library.scene.getObjectByName('pelvis')!.position
          const target = model.scene.getObjectByName('pelvis')!.position
          for (let i = 0; i < track.values.length; i += 3) {
            track.values[i] += target.x - source.x
            track.values[i + 1] += target.y - source.y
            track.values[i + 2] += target.z - source.z
          }
        }
        return clip
      }))
      return { model, clips }
    }).catch(() => {
      pending = undefined
      throw new Error('Fighters could not be loaded. Check your connection and start the fight again.')
    })
  }
  return pending
}

import type { AnimationMixer, Object3D, Quaternion, Vector3 } from 'three'

export type SampledBone = { bone: Object3D; rotation: Quaternion; position?: Vector3 }

export function sampleSkeletalPose(mixer: AnimationMixer, pose: SampledBone[]) {
  // Mixer bindings can skip unchanged values, so remove last frame's additive
  // accents before evaluating. This also makes a paused pose frame-independent.
  for (const item of pose) { item.bone.quaternion.copy(item.rotation); if (item.position) item.bone.position.copy(item.position) }
  mixer.update(0)
  for (const item of pose) { item.rotation.copy(item.bone.quaternion); item.position?.copy(item.bone.position) }
}

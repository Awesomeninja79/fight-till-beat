import { expect, it } from 'vitest'
import { AnimationClip, AnimationMixer, Bone, Group, Quaternion, QuaternionKeyframeTrack, Vector3 } from 'three'
import { sampleSkeletalPose } from './skeletalPose'

it('does not accumulate additive kick rotation while paused, and reconstructs a backward seek', () => {
  const root = new Group(), bone = new Bone()
  bone.name = 'thigh'
  root.add(bone)
  const end = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), 0.8)
  const clip = new AnimationClip('kick', 1, [new QuaternionKeyframeTrack('thigh.quaternion', [0, 1], [0, 0, 0, 1, ...end.toArray()])])
  const mixer = new AnimationMixer(root)
  const action = mixer.clipAction(clip).play()
  const pose = [{ bone, rotation: bone.quaternion.clone() }]
  const sample = (time: number) => {
    action.time = time
    sampleSkeletalPose(mixer, pose)
    bone.rotateX(-1.65)
    return bone.quaternion.clone().normalize()
  }
  const expected = sample(0.2)
  for (let i = 0; i < 120; i++) expect(sample(0.2).angleTo(expected)).toBeLessThan(1e-6)
  expect(sample(0.8).angleTo(expected)).toBeGreaterThan(0.1)
  expect(sample(0.2).angleTo(expected)).toBeLessThan(1e-6)
})

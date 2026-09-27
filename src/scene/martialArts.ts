import * as THREE from 'three'
import { isThrow, type Technique } from '../game/techniques'

const clamp = THREE.MathUtils.clamp
const v = () => new THREE.Vector3()
const smooth = (x: number) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x) }

// C1-continuous, time-authored channels: chamber and rechamber are different poses.
const times = [-0.32, -0.20, -0.085, 0, 0.035, 0.13, 0.27, 0.46]
function channel(values: number[], time: number) {
  let i = times.findIndex(t => t > time) - 1
  if (time <= times[0]) return values[0]
  if (i < 0) return values[values.length - 1]
  const j = i + 1, dt = times[j] - times[i], t = (time - times[i]) / dt
  const slope = (k: number) => k === 0 || k === times.length - 1 ? 0 : (values[k + 1] - values[k - 1]) / (times[k + 1] - times[k - 1])
  return (2*t*t*t-3*t*t+1)*values[i] + (t*t*t-2*t*t+t)*dt*slope(i) + (-2*t*t*t+3*t*t)*values[j] + (t*t*t-t*t)*dt*slope(j)
}

export function kickPose(age: number, high = false) {
  return {
    foot: new THREE.Vector3(
      channel([-.12, -.22, -.52, -.12, -.08, -.4, -.22, -.12], age),
      channel([.09, .39, .9, high ? 1.28 : 1.02, high ? 1.28 : 1.02, .92, .45, .09], age),
      channel([-.09, .04, .18, .82, .84, .32, -.03, -.09], age)),
    hips: channel([0, -.22, -.42, .55, .58, .26, -.1, 0], age),
    lean: channel([0, .08, .14, -.3, -.32, -.2, .04, 0], age),
    crouch: channel([0, -.05, -.08, -.015, -.01, -.05, -.07, 0], age),
    weight: smooth((age + .32) / .1) * (1 - smooth((age - .29) / .17)),
  }
}

// Analytic two-bone IK retains limb lengths and bends toward a chosen knee/elbow pole.
export function solveLimb(upper: THREE.Object3D, lower: THREE.Object3D, end: THREE.Object3D, target: THREE.Vector3, pole: THREE.Vector3, weight = 1) {
  upper.updateWorldMatrix(true, true)
  const a = upper.getWorldPosition(v()), b = lower.getWorldPosition(v()), c = end.getWorldPosition(v())
  const l1 = a.distanceTo(b), l2 = b.distanceTo(c)
  const direction = target.clone().sub(a)
  const distance = clamp(direction.length(), Math.abs(l1 - l2) + .001, l1 + l2 - .001)
  direction.normalize()
  const bend = pole.clone().sub(a).addScaledVector(direction, -pole.clone().sub(a).dot(direction)).normalize()
  const along = (l1*l1 - l2*l2 + distance*distance) / (2*distance)
  const knee = a.clone().addScaledVector(direction, along).addScaledVector(bend, Math.sqrt(Math.max(0, l1*l1 - along*along)))
  const originalUpper = upper.quaternion.clone(), originalLower = lower.quaternion.clone()
  const aim = (bone: THREE.Object3D, child: THREE.Object3D, point: THREE.Vector3) => {
    const origin = bone.getWorldPosition(v())
    const from = child.getWorldPosition(v()).sub(origin).normalize()
    const to = point.clone().sub(origin).normalize()
    const rotation = new THREE.Quaternion().setFromUnitVectors(from, to).multiply(bone.getWorldQuaternion(new THREE.Quaternion()))
    bone.quaternion.copy(bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rotation))
    bone.updateWorldMatrix(false, true)
  }
  aim(upper, lower, knee)
  aim(lower, end, a.clone().addScaledVector(direction, distance))
  upper.quaternion.slerp(originalUpper, 1 - weight)
  lower.quaternion.slerp(originalLower, 1 - weight)
}

export function applyKick(scene: THREE.Object3D, bones: Map<string, THREE.Object3D>, age: number, weight: number, high: boolean, technique?: Technique) {
  const pose = kickPose(age, high)
  const side = technique?.side === 'l' ? 'l' : 'r', support = side === 'l' ? 'r' : 'l'
  const sign = side === 'l' ? -1 : 1
  if (technique) {
    const extension = smooth((age + .16) / .16) * (1 - smooth((age - .04) / .25))
    pose.foot.y += (technique.height - (high ? 1.28 : 1.02)) * extension
    pose.foot.z += (technique.reach - .82) * extension
    pose.foot.x += technique.arc * Math.sin(extension * Math.PI) * .55
    if (technique.motion === 'axe') pose.foot.y += .65 * Math.sin(smooth((age + .25) / .25) * Math.PI) * (age < 0 ? 1 : 0)
    pose.hips += technique.turn * .12 * pose.weight
    pose.crouch += technique.crouch * .3 * pose.weight
  }
  pose.foot.x *= sign
  const rotate = (name: string, x: number, y: number, z: number) => {
    const bone = bones.get(name)
    if (bone) bone.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x * weight, y * weight, z * weight)))
  }
  // The pelvis uses a Z-up local frame on this rig; spine lean is local X.
  rotate('pelvis', 0, 0, -pose.hips * .55)
  rotate('spine_01', pose.lean, 0, pose.hips * .25)
  rotate('spine_03', 0, 0, pose.hips * .3)
  rotate('upperarm_l', -.2 * pose.weight, .25 * pose.weight, -.45 * pose.weight)
  rotate('upperarm_r', .15 * pose.weight, -.3 * pose.weight, .38 * pose.weight)
  rotate('Head', -pose.lean * .25, 0, -pose.hips * .3)
  bones.get('pelvis')!.position.z += pose.crouch * weight
  scene.updateWorldMatrix(true, true)
  const point = (x: number, y: number, z: number) => scene.localToWorld(new THREE.Vector3(x, y, z))
  solveLimb(bones.get(`thigh_${side}`)!, bones.get(`calf_${side}`)!, bones.get(`foot_${side}`)!, scene.localToWorld(pose.foot), point(-.85 * sign, .7, .7), weight)
  solveLimb(bones.get(`thigh_${support}`)!, bones.get(`calf_${support}`)!, bones.get(`foot_${support}`)!, point(.13 * sign, .087, -.09), point(.3 * sign, .6, .8), weight)
  rotate(`foot_${support}`, 0, 0, pose.hips * .45)
}

export function applyTechnique(scene: THREE.Object3D, bones: Map<string, THREE.Object3D>, age: number, weight: number, technique: Technique) {
  if (['kick', 'knee', 'axe', 'cartwheel'].includes(technique.motion)) {
    applyKick(scene, bones, age, weight, technique.height > 1.2, technique)
    return
  }
  const load = age < 0 ? Math.sin(smooth((age + .32) / .32) * Math.PI) : 0
  const extension = smooth((age + .16) / .16) * (1 - smooth((age - .045) / .34))
  const amount = extension * weight
  bones.get('pelvis')!.position.z += technique.crouch * (load * .65 + extension * .35) * weight
  bones.get('spine_01')!.rotateZ(technique.turn * .12 * amount)
  bones.get('spine_02')!.rotateX((isThrow(technique) ? .3 : .08) * amount)
  scene.updateWorldMatrix(true, true)
  const sides = technique.side === 'both' || isThrow(technique) ? ['l', 'r'] : [technique.side]
  for (const side of sides) {
    const sign = side === 'l' ? 1 : -1
    const target = new THREE.Vector3(sign * .07 + technique.arc * Math.sin(extension * Math.PI), technique.height + load * (technique.kind === 'launch' ? -.45 : .13), technique.reach)
    const pole = new THREE.Vector3(sign * (.4 + Math.abs(technique.arc)), technique.motion === 'elbow' ? 1.5 : 1.02, .25)
    solveLimb(bones.get(`upperarm_${side}`)!, bones.get(`lowerarm_${side}`)!, bones.get(`hand_${side}`)!, scene.localToWorld(target), scene.localToWorld(pole), amount)
    if (['palm', 'energy', 'throw', 'sacrifice'].includes(technique.motion)) {
      for (const finger of ['index', 'middle', 'ring', 'pinky']) for (const joint of ['01', '02', '03']) {
        bones.get(`${finger}_${joint}_${side}`)?.quaternion.slerp(new THREE.Quaternion(), amount * .75)
      }
    }
  }
  // Weight stays over a stable base while the hips/shoulders and arms do the work.
  for (const side of ['l', 'r']) {
    const sign = side === 'l' ? 1 : -1
    const target = scene.localToWorld(new THREE.Vector3(sign * .18, .087, side === 'l' ? .12 : -.2))
    const pole = scene.localToWorld(new THREE.Vector3(sign * .25, .55, .7))
    solveLimb(bones.get(`thigh_${side}`)!, bones.get(`calf_${side}`)!, bones.get(`foot_${side}`)!, target, pole, weight * .8)
  }
}

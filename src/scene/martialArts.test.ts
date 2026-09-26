import { describe, expect, it } from 'vitest'
import { AnimationMixer, Bone, Group, Vector3 } from 'three'
import { readFileSync } from 'node:fs'
import { applyTechnique, kickPose, solveLimb } from './martialArts'
import { TECHNIQUES } from '../game/techniques'
import { sampleSkeletalPose } from './skeletalPose'
import { attackLayersAt } from '../game/combat'
import type { FightEvent } from '../types'

describe('connected martial arts motion', () => {
  it('keeps all 50 techniques finite and frame-independent on the shipped skeleton', () => {
    const bytes = readFileSync(new URL('../../public/models/fighter-v1.glb', import.meta.url))
    const data = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString()) as { nodes: { name: string; children?: number[]; translation?: number[]; rotation?: number[]; scale?: number[] }[]; scenes: { nodes: number[] }[]; scene: number }
    const nodes = data.nodes.map(node => {
      const bone = new Bone(); bone.name = node.name
      if (node.translation) bone.position.fromArray(node.translation)
      if (node.rotation) bone.quaternion.fromArray(node.rotation)
      if (node.scale) bone.scale.fromArray(node.scale)
      return bone
    })
    data.nodes.forEach((node, i) => node.children?.forEach(child => nodes[i].add(nodes[child])))
    const scene = new Group(); data.scenes[data.scene].nodes.forEach(i => scene.add(nodes[i]))
    const bones = new Map(nodes.map(bone => [bone.name, bone]))
    const pose = nodes.map(bone => ({ bone, rotation: bone.quaternion.clone(), position: bone.position.clone() }))
    const mixer = new AnimationMixer(scene)
    const snapshot = () => nodes.flatMap(bone => [...bone.quaternion.toArray(), ...bone.position.toArray()])
    for (const technique of TECHNIQUES) for (const age of [-.22, -.08, 0, .14, .36]) {
      sampleSkeletalPose(mixer, pose); applyTechnique(scene, bones, age, 1, technique)
      const expected = snapshot()
      expect(expected.every(Number.isFinite), technique.id).toBe(true)
      for (let frame = 0; frame < 3; frame++) {
        sampleSkeletalPose(mixer, pose); applyTechnique(scene, bones, age, 1, technique)
        const actual = snapshot()
        expect(Math.max(...actual.map((value, i) => Math.abs(value - expected[i]))), technique.id).toBeLessThan(1e-8)
      }
    }
  })
  it('solves contact without stretching limbs and bends the knee toward its pole', () => {
    const root = new Group(), thigh = new Bone(), calf = new Bone(), foot = new Bone()
    root.add(thigh); thigh.add(calf); calf.add(foot)
    calf.position.set(0, -.45, 0); foot.position.set(0, -.45, 0)
    const target = new Vector3(0, -.35, .55)
    solveLimb(thigh, calf, foot, target, new Vector3(0, 0, 1))
    root.updateMatrixWorld(true)
    expect(foot.getWorldPosition(new Vector3()).distanceTo(target)).toBeLessThan(.0001)
    expect(calf.position.length()).toBeCloseTo(.45)
    expect(foot.position.length()).toBeCloseTo(.45)
    expect(calf.getWorldPosition(new Vector3()).z).toBeGreaterThan(0)
  })
  it('chambers, extends at contact, rechambers and returns to the planted foot', () => {
    expect(kickPose(-.085).foot.z).toBeLessThan(kickPose(0).foot.z / 2)
    expect(kickPose(.13).foot.z).toBeLessThan(kickPose(0).foot.z / 2)
    expect(kickPose(-.32).foot.distanceTo(kickPose(.46).foot)).toBeLessThan(.00001)
    for (const t of [-.2, -.085, 0, .035, .13, .27]) {
      expect(kickPose(t - .00001).foot.distanceTo(kickPose(t + .00001).foot)).toBeLessThan(.001)
    }
  })
  it('keeps recovery present as the next attack enters rather than replacing its pose', () => {
    const events: FightEvent[] = [
      { id: 'a', atMs: 1000, kind: 'punch', move: 'cross', actorId: 'hero', targetId: 'enemy-1' },
      { id: 'b', atMs: 1450, kind: 'kick', move: 'roundhouse', actorId: 'hero', targetId: 'enemy-1' },
    ]
    const layers = attackLayersAt(events, 1230)
    expect(layers).toHaveLength(2)
    expect(layers.every(layer => layer.weight > 0)).toBe(true)
    expect(layers.reduce((sum, layer) => sum + layer.weight, 0)).toBeCloseTo(1)
    const before = attackLayersAt(events, 1129)[0].weight
    expect(Math.abs(attackLayersAt(events, 1131)[0].weight - before)).toBeLessThan(.02)
  })
})

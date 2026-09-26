// Reduce the CC0 Universal Animation Library to the clips used by this game.
// Usage: node scripts/prepare-combat.mjs path/to/universal-animation-library.glb
import fs from 'node:fs'
const input = fs.readFileSync(process.argv[2])
const jsonSize = input.readUInt32LE(12)
const source = JSON.parse(input.subarray(20, 20 + jsonSize))
const binary = input.subarray(28 + jsonSize)
const names = process.argv[4] ? process.argv[4].split(',') : ['Idle_Loop', 'Punch_Jab', 'Punch_Cross', 'Hit_Chest', 'Hit_Head', 'Dance_Loop', 'Jog_Fwd_Loop', 'Crouch_Idle_Loop', 'Death01']
const animations = source.animations.filter(a => names.includes(a.name))
if (animations.length !== names.length) throw new Error('Missing combat clips')
const accessors = [], bufferViews = [], chunks = [], accessorMap = new Map(), viewMap = new Map()
let offset = 0
function view(id) {
  if (viewMap.has(id)) return viewMap.get(id)
  const original = source.bufferViews[id]
  const bytes = binary.subarray(original.byteOffset || 0, (original.byteOffset || 0) + original.byteLength)
  const index = bufferViews.length
  bufferViews.push({ ...original, buffer: 0, byteOffset: offset })
  chunks.push(bytes, Buffer.alloc((4 - bytes.length % 4) % 4))
  offset += bytes.length + (4 - bytes.length % 4) % 4
  viewMap.set(id, index)
  return index
}
function accessor(id) {
  if (accessorMap.has(id)) return accessorMap.get(id)
  const a = structuredClone(source.accessors[id])
  if (a.bufferView !== undefined) a.bufferView = view(a.bufferView)
  if (a.sparse) { a.sparse.indices.bufferView = view(a.sparse.indices.bufferView); a.sparse.values.bufferView = view(a.sparse.values.bufferView) }
  const index = accessors.length
  accessors.push(a); accessorMap.set(id, index)
  return index
}
for (const animation of animations) for (const sampler of animation.samplers) {
  sampler.input = accessor(sampler.input); sampler.output = accessor(sampler.output)
}
const nodes = source.nodes.map(({ mesh, skin, ...node }) => node)
const output = { asset: source.asset, scene: source.scene, scenes: source.scenes, nodes, animations, accessors, bufferViews, buffers: [{ byteLength: offset }] }
const raw = Buffer.from(JSON.stringify(output))
const json = Buffer.concat([raw, Buffer.alloc((4 - raw.length % 4) % 4, 32)])
const header = Buffer.alloc(20)
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + offset, 8)
header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16)
const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(offset, 0); binHeader.writeUInt32LE(0x004e4942, 4)
fs.writeFileSync(process.argv[3] || 'public/models/combat-v1.glb', Buffer.concat([header, json, binHeader, ...chunks]))
console.log(`Prepared ${animations.length} combat clips, ${28 + json.length + offset} bytes`)

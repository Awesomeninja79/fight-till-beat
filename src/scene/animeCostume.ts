import * as THREE from 'three'

export function addAnimeCostume(scene: THREE.Object3D, hero: boolean, accent: string) {
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []
  const hairMaterial = new THREE.MeshToonMaterial({ color: hero ? '#d5f6ff' : '#201832' })
  const clothMaterial = new THREE.MeshToonMaterial({ color: accent, side: THREE.DoubleSide })
  materials.push(hairMaterial, clothMaterial)
  const hair = new THREE.Group()
  hair.position.set(0, 1.77, -0.014)
  const capGeometry = new THREE.SphereGeometry(1, 14, 10)
  geometries.push(capGeometry)
  const cap = new THREE.Mesh(capGeometry, hairMaterial)
  cap.scale.set(0.102, 0.071, 0.105)
  hair.add(cap)
  const spikeGeometry = new THREE.ConeGeometry(0.048, hero ? 0.18 : 0.12, 5)
  geometries.push(spikeGeometry)
  for (let i = 0; i < 7; i++) {
    const spike = new THREE.Mesh(spikeGeometry, hairMaterial)
    const angle = i * 2.4
    spike.position.set(Math.sin(angle) * 0.065, 0.055 + (i % 3) * 0.019, Math.cos(angle) * 0.058)
    spike.rotation.set(-0.25 + Math.cos(angle) * 0.35, angle, -Math.sin(angle) * 0.4)
    hair.add(spike)
  }
  scene.add(hair)
  scene.updateMatrixWorld(true)
  scene.getObjectByName('Head')?.attach(hair)
  const ribbons: THREE.Mesh[] = []
  if (hero) {
    const scarf = new THREE.Group()
    scarf.position.set(0, 1.49, -0.055)
    for (let i = 0; i < 2; i++) {
      const geometry = new THREE.PlaneGeometry(0.11, 0.62, 1, 10)
      geometry.translate(0, -0.31, 0)
      geometries.push(geometry)
      const ribbon = new THREE.Mesh(geometry, clothMaterial)
      ribbon.position.x = i ? 0.06 : -0.06
      ribbon.rotation.x = 1.05
      scarf.add(ribbon); ribbons.push(ribbon)
    }
    scene.add(scarf); scene.updateMatrixWorld(true)
    scene.getObjectByName('spine_03')?.attach(scarf)
  }
  return { geometries, materials, ribbons }
}

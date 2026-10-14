export const options = { frame: 2.2 };
export default function setup({ root, roundedBox, materials, interactive, THREE }) {
  const mesh = new THREE.Mesh(roundedBox(1.2, 2.2, .3, .12), materials.accent());
  mesh.castShadow = true; mesh.userData.onPick = () => mesh.rotation.z += .3;
  root.add(mesh); interactive.push(mesh);
  return { update(dt, s) { mesh.position.y = Math.sin(s.time) * .1; } };
}

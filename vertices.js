import * as THREE from "three/webgpu";

/**
 * Add vertex points at each corner of the cube
 * @param {THREE.Scene} scene - The scene to add vertices to
 * @param {number} x - Width of the cube
 * @param {number} y - Height of the cube
 * @param {number} z - Depth of the cube
 */
export function addVertices(scene, x, y, z) {
  const vertices = [
    // x, y, z for each corner
    [-x / 2, -y / 2, -z / 2],
    [-x / 2, -y / 2, z / 2],
    [-x / 2, y / 2, -z / 2],
    [-x / 2, y / 2, z / 2],
    [x / 2, -y / 2, -z / 2],
    [x / 2, -y / 2, z / 2],
    [x / 2, y / 2, -z / 2],
    [x / 2, y / 2, z / 2],
  ];

  vertices.forEach(([vx, vy, vz]) => {
    const pointGeometry = new THREE.SphereGeometry(0.07, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    point.position.set(vx, vy, vz);
    scene.add(point);
  });
}

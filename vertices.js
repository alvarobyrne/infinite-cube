import * as THREE from "three/webgpu";

/**
 * Add vertex points at each corner of the cube
 * @param {THREE.Scene} scene - The scene to add vertices to
 * @param {number} width - Width of the cube
 * @param {number} height - Height of the cube
 * @param {number} depth - Depth of the cube
 */
export function addVertices(scene, width, height, depth) {
  const vertices = [
    // width, height, depth for each corner
    [-width / 2, -height / 2, -depth / 2],
    [-width / 2, -height / 2, depth / 2],
    [-width / 2, height / 2, -depth / 2],
    [-width / 2, height / 2, depth / 2],
    [width / 2, -height / 2, -depth / 2],
    [width / 2, -height / 2, depth / 2],
    [width / 2, height / 2, -depth / 2],
    [width / 2, height / 2, depth / 2],
  ];

  vertices.forEach(([vx, vy, vz]) => {
    const pointGeometry = new THREE.SphereGeometry(0.07, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    point.position.set(vx, vy, vz);
    scene.add(point);
  });
}

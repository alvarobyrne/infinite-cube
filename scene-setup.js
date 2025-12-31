import * as THREE from "three/webgpu";

/**
 * Create and setup the scene with camera, renderer, and lighting
 */
export function setupScene() {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGPURenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  camera.position.y = 5;
  camera.position.x = 5;
  camera.lookAt(0, 0, 0);
  scene.add(camera);

  // scene.add(new THREE.AxesHelper(10));

  return { scene, renderer, camera };
}

/**
 * Create the cube geometry and materials
 * @param {Object} params - Parameters object
 * @param {number} params.width - Width of the cube
 * @param {number} params.height - Height of the cube
 * @param {number} params.depth - Depth of the cube
 */
export function createBlock({ width = 5, height = 1, depth = 1, color = 0x0000ff } = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth);

  // Create an array of materials for each face:
  // [right, left, top, bottom, front, back]
  const material = new THREE.MeshToonMaterial({ color });

  const cube = new THREE.Mesh(geometry, material);
  return cube;
}

export function createBlock1({ width = 5, height = 1, depth = 1 } = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth);

  // Create an array of materials for each face:
  // [right, left, top, bottom, front, back]
  const materials = [
    new THREE.MeshToonMaterial({ color: 0x0000ff }), // +X (right)  -> blue (zx plane)
    new THREE.MeshToonMaterial({ color: 0x0000ff }), // -X (left)   -> blue (zx plane)
    new THREE.MeshToonMaterial({ color: 0xff0000 }), // +Y (top)    -> red  (xy plane)
    new THREE.MeshToonMaterial({ color: 0xff0000 }), // -Y (bottom) -> red  (xy plane)
    new THREE.MeshToonMaterial({ color: 0x00ff00 }), // +Z (front)  -> green (yz plane)
    new THREE.MeshToonMaterial({ color: 0x00ff00 }), // -Z (back)   -> green (yz plane)
  ];

  const cube = new THREE.Mesh(geometry, materials);
  return cube;
}

/**
 * Create block with unified color (same as createBlock, but used with a single color for all blocks)
 * @param {Object} params - Parameters object
 * @param {number} params.width - Width of the cube
 * @param {number} params.height - Height of the cube
 * @param {number} params.depth - Depth of the cube
 * @param {number} params.color - Color for the block
 */
export function createBlock2({ width = 5, height = 1, depth = 1, color = 0xffffff } = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshToonMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  return cube;
}
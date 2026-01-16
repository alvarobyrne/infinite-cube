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

export const views = [
  {
    left: 0,
    bottom: 0,
    width: 0.5,
    height: 1.0,
    background: new THREE.Color(0.05, 0.05, 0.05),
    eye: [10, 10, 10],
    up: [0, 1, 0],
    fov: 45,
  },
  {
    left: 0.5,
    bottom: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.1, 0.1, 0.1),
    eye: [15, 0, 0],
    up: [0, 1, 0],
    fov: 45,
  },
  {
    left: 0.5,
    bottom: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.08, 0.08, 0.08),
    eye: [0, 15, 0],
    up: [0, 0, 1],
    fov: 45,
  }
];

export function setupViews(mainCamera) {
  for (let i = 0; i < views.length; i++) {
    const view = views[i];

    if (i === 0 && mainCamera) {
      view.camera = mainCamera;
      continue;
    }

    const camera = new THREE.PerspectiveCamera(
      view.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.fromArray(view.eye);
    camera.up.fromArray(view.up);
    camera.lookAt(0, 0, 0);
    view.camera = camera;
  }
}

/**
 * Create the cube geometry and materials
 * @param {Object} params - Parameters object
 * @param {number} params.width - Width of the cube
 * @param {number} params.height - Height of the cube
 * @param {number} params.depth - Depth of the cube
 * @param {number} params.color - Color of the cube
 * @param {boolean} params.isWireframe - Whether to use wireframe
 */
export function createBlock({ width = 5, height = 1, depth = 1, color = 0x0000ff, isWireframe = false, opacity = 1, transparent = false } = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  // if isWireframe, lighten the color
  if (isWireframe) {
    color = color | 0x777777;
  }

  // Create an array of materials for each face:
  // [right, left, top, bottom, front, back]
  const material = new THREE.MeshToonMaterial({ color, wireframe: isWireframe, transparent, opacity });

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
 * Create a box block with individual colors for each face
 */
export function createMultiColorBoxBlock({
  width = 5,
  height = 1,
  depth = 1,
  colorRight = 0x0000ff,
  colorLeft = 0x0000ff,
  colorTop = 0xff0000,
  colorBottom = 0xff0000,
  colorFront = 0x00ff00,
  colorBack = 0x00ff00
} = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const materials = [
    new THREE.MeshToonMaterial({ color: colorRight }),
    new THREE.MeshToonMaterial({ color: colorLeft }),
    new THREE.MeshToonMaterial({ color: colorTop }),
    new THREE.MeshToonMaterial({ color: colorBottom }),
    new THREE.MeshToonMaterial({ color: colorFront }),
    new THREE.MeshToonMaterial({ color: colorBack }),
  ];
  return new THREE.Mesh(geometry, materials);
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

/**
 * Create a block using planes, with an option to exclude specific pairs of faces
 * @param {Object} params - Parameters object
 * @param {string[]} params.exclude - Pairs of faces to exclude: 'verticals', 'horizontals', 'laterals'
 */
export function createHollowBlock({ width = 5, height = 1, depth = 1, color = 0x00ff00, exclude = [] } = {}) {
  const group = new THREE.Group();
  const material = new THREE.MeshToonMaterial({ color, side: THREE.DoubleSide });

  // Front and Back (Verticals)
  if (!exclude.includes("verticals")) {
    const verticalPlane = new THREE.PlaneGeometry(width, height);
    const front = new THREE.Mesh(verticalPlane, material);
    front.position.z = depth / 2;
    group.add(front);

    const back = new THREE.Mesh(verticalPlane, material);
    back.position.z = -depth / 2;
    back.rotation.y = Math.PI;
    group.add(back);
  }

  // Top and Bottom (Horizontals)
  if (!exclude.includes("horizontals")) {
    const horizontalPlane = new THREE.PlaneGeometry(width, depth);
    const top = new THREE.Mesh(horizontalPlane, material);
    top.position.y = height / 2;
    top.rotation.x = -Math.PI / 2;
    group.add(top);

    const bottom = new THREE.Mesh(horizontalPlane, material);
    bottom.position.y = -height / 2;
    bottom.rotation.x = Math.PI / 2;
    group.add(bottom);
  }

  // Left and Right (Laterals)
  if (!exclude.includes("laterals")) {
    const lateralPlane = new THREE.PlaneGeometry(depth, height);
    const left = new THREE.Mesh(lateralPlane, material);
    left.position.x = -width / 2;
    left.rotation.y = -Math.PI / 2;
    group.add(left);

    const right = new THREE.Mesh(lateralPlane, material);
    right.position.x = width / 2;
    right.rotation.y = Math.PI / 2;
    group.add(right);
  }

  return group;
}

/**
 * Create a block using planes, allowing separate colors for each pair of faces
 * @param {Object} params - Parameters object
 * @param {number} params.verticalColor - Color for front and back faces
 * @param {number} params.horizontalColor - Color for top and bottom faces
 * @param {number} params.lateralColor - Color for left and right faces
 * @param {string[]} params.exclude - Pairs of faces to exclude
 */
/**
 * Create a block using planes, allowing separate colors for each face
 * @param {Object} params - Parameters object
 * @param {number} params.colorFront - Color for front face
 * @param {number} params.colorBack - Color for back face
 * @param {number} params.colorTop - Color for top face
 * @param {number} params.colorBottom - Color for bottom face
 * @param {number} params.colorLeft - Color for left face
 * @param {number} params.colorRight - Color for right face
 * @param {string[]} params.exclude - Faces to exclude (e.g., 'front', 'back', 'top', 'bottom', 'left', 'right')
 */
export function createMultiColorPlaneBlock({
  width = 5,
  height = 1,
  depth = 1,
  colorFront = 0x00ff00,
  colorBack = 0x00ff00,
  colorTop = 0xff0000,
  colorBottom = 0xff0000,
  colorLeft = 0x0000ff,
  colorRight = 0x0000ff,
  exclude = []
} = {}) {
  const group = new THREE.Group();

  // Front (+Z)
  if (!exclude.includes("front")) {
    const material = new THREE.MeshToonMaterial({ color: colorFront, side: THREE.DoubleSide });
    const plane = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(plane, material);
    mesh.position.z = depth / 2;
    group.add(mesh);
  }

  // Back (-Z)
  if (!exclude.includes("back")) {
    const material = new THREE.MeshToonMaterial({ color: colorBack, side: THREE.DoubleSide });
    const plane = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(plane, material);
    mesh.position.z = -depth / 2;
    mesh.rotation.y = Math.PI;
    group.add(mesh);
  }

  // Top (+Y)
  if (!exclude.includes("top")) {
    const material = new THREE.MeshToonMaterial({ color: colorTop, side: THREE.DoubleSide });
    const plane = new THREE.PlaneGeometry(width, depth);
    const mesh = new THREE.Mesh(plane, material);
    mesh.position.y = height / 2;
    mesh.rotation.x = -Math.PI / 2;
    group.add(mesh);
  }

  // Bottom (-Y)
  if (!exclude.includes("bottom")) {
    const material = new THREE.MeshToonMaterial({ color: colorBottom, side: THREE.DoubleSide });
    const plane = new THREE.PlaneGeometry(width, depth);
    const mesh = new THREE.Mesh(plane, material);
    mesh.position.y = -height / 2;
    mesh.rotation.x = Math.PI / 2;
    group.add(mesh);
  }

  // Left (-X)
  if (!exclude.includes("left")) {
    const material = new THREE.MeshToonMaterial({ color: colorLeft, side: THREE.DoubleSide });
    const plane = new THREE.PlaneGeometry(depth, height);
    const mesh = new THREE.Mesh(plane, material);
    mesh.position.x = -width / 2;
    mesh.rotation.y = -Math.PI / 2;
    group.add(mesh);
  }

  // Right (+X)
  if (!exclude.includes("right")) {
    const material = new THREE.MeshToonMaterial({ color: colorRight, side: THREE.DoubleSide });
    const plane = new THREE.PlaneGeometry(depth, height);
    const mesh = new THREE.Mesh(plane, material);
    mesh.position.x = width / 2;
    mesh.rotation.y = Math.PI / 2;
    group.add(mesh);
  }

  return group;
}




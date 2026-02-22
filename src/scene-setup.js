import * as THREE from "three/webgpu";
import { CAMERA_TYPES, getSavedCameraType } from "./state/cameraState.js";
import { SVGRenderer } from "three/addons/renderers/SVGRenderer.js";
import { BoxLineGeometry } from "three-stdlib";
import { BarGeometryGenerator } from "./node_based/HalfSpaceGeometry.js";
import { PathManager } from "./node_based/PathManager.js";
import { themeManager } from "./theme-manager.js";
import { createGeometryFromPoints, createMeshFromPoints, generateWedgeConfigurations } from "./node_based/WedgeManager.js";
import { createTextSprite } from "./text-manager.js";

/**
 * Create and setup the scene with camera, renderer, and lighting
 * @param {Object} cameraSettings - Camera settings (fov, near, far, frustumSize)
 * @param {string} rendererType - One of 'webgl' or 'svg'
 */
export function setupScene(cameraSettings, rendererType = "webgl") {
  const scene = new THREE.Scene();
  let renderer;
  if (rendererType === "svg") {
    renderer = new SVGRenderer();
  } else {
    renderer = new THREE.WebGPURenderer({ antialias: true, alpha: true });
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Apply theme background
  const applyTheme = () => {
    const color = themeManager.colors.background;
    scene.background = new THREE.Color(color);
    if (renderer.setClearColor) {
      renderer.setClearColor(color);
    }
    // Update views backgrounds
    views.forEach(view => {
      view.background.set(color);
    });
  };

  themeManager.subscribe(applyTheme);
  applyTheme();

  const cameraType = getSavedCameraType();
  const { fov, near, far, frustumSize } = cameraSettings;
  let camera;


  if (cameraType === CAMERA_TYPES.ORTHOGRAPHIC) {
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      near,
      far
    );
  } else {
    camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      near,
      far
    );
  }

  camera.position.z = 5;
  camera.position.y = 5;
  camera.position.x = 5;
  camera.lookAt(0, 0, 0);
  scene.add(camera);

  // scene.add(new THREE.AxesHelper(10));

  return { scene, renderer, camera };
}

export const views0 = [
  {
    left: 0.5,
    bottom: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.05, 0.05, 0.05),
    eye: [10, 10, 10],
    up: [0, 1, 0],
    fov: 45,
  },
  {
    left: 0.5,
    bottom: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.05, 0.05, 0.05),
    eye: [0, 5, 50],
    lookAt: [0, 5, 0],
    up: [0, 1, 0],
    fov: 45,
  },
  {
    left: 0.0,
    bottom: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.1, 0.1, 0.1),
    eye: [33, 5, 8],
    lookAt: [0, 5, 8],
    up: [0, 1, 0],
    fov: 45,
  },
  {
    left: 0.0,
    bottom: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.08, 0.08, 0.08),
    eye: [0, 41, 5],
    lookAt: [0, 0, 5],
    up: [0, 0, 1],
    fov: 45,
  }
];
export const views2 = [
  {
    left: 0.0,
    bottom: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.05, 0.05, 0.05),
    eye: [10, 10, 10],
    up: [0, 1, 0],
    fov: 45,
  },
  {
    left: 0.0,
    bottom: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.05, 0.05, 0.05),
    eye: [0, 5, 50],
    lookAt: [0, 5, 0],
    up: [0, 1, 0],
    fov: 45,
  },
  {
    left: 0.5,
    bottom: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.1, 0.1, 0.1),
    eye: [33, 5, 8],
    lookAt: [0, 5, 8],
    up: [0, 1, 0],
    fov: 45,
  },
  {
    left: 0.5,
    bottom: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.08, 0.08, 0.08),
    eye: [0, 41, 5],
    lookAt: [0, 0, 5],
    up: [0, 0, 1],
    fov: 45,
  }
];
export const views = views2

/**
 * Setup multiple views
 * @param {THREE.Camera} mainCamera - The main camera
 * @param {Object} cameraSettings - Camera settings
 */
export function setupViews(mainCamera, cameraSettings) {
  const cameraType = getSavedCameraType();
  const aspect = window.innerWidth / window.innerHeight;
  const { fov: defaultFov, near, far, frustumSize } = cameraSettings;

  for (let i = 0; i < views.length; i++) {
    const view = views[i];

    if (i === 0 && mainCamera) {
      view.camera = mainCamera;
      continue;
    }

    let camera;
    if (cameraType === CAMERA_TYPES.ORTHOGRAPHIC) {
      camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        near,
        far
      );
    } else {
      camera = new THREE.PerspectiveCamera(
        view.fov || defaultFov,
        aspect,
        near,
        far
      );
    }

    camera.position.fromArray(view.eye);
    camera.up.fromArray(view.up);
    if (view.lookAt) {
      camera.lookAt(...view.lookAt);
    } else {
      camera.lookAt(0, 0, 0);
    }
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
export function createBlock({ width = 5, height = 1, depth = 1, color = themeManager.colors.block.tertiary, isWireframe = false, opacity = 1, transparent = false } = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  // if isWireframe, lighten the color
  if (isWireframe) {
    // color = color | 0x777777; // This bitwise OR with color string/hex might be risky if color is string. 
    // Simplify wireframe color handling or rely on material
  }

  // Create an array of materials for each face:
  // [right, left, top, bottom, front, back]
  const material = new THREE.MeshToonMaterial({ color, wireframe: isWireframe, transparent, opacity });

  const cube = new THREE.Mesh(geometry, material);
  cube.userData.largestDimension = getLargestDimension({
    width,
    height,
    depth,
  });
  return cube;
}
/**
 * Create the cube geometry and materials
 * @param {Object} params - Parameters object
 * @param {number} params.width - Width of the cube
 * @param {number} params.height - Height of the cube
 * @param {number} params.depth - Depth of the cube
 * @param {number} params.color - Color of the cube
 * @param {Object} params.relativeNodePosition - End position of the block
 * @param {number} params.t - thicknes of the block, i.e., dimension of the square section of the block
 */
export function createLinesBlock({ width = 5, height = 1, depth = 1, relativeNodePosition, t } = {}) {
  // console.log("🔍 ~ createLinesBlock ~ src/scene-setup.js:214 ~ end:", end);
  const geometry = new BoxLineGeometry(width, height, depth);

  const material = new THREE.LineBasicMaterial({ color: themeManager.colors.dimensionLine.default });
  const lines = new THREE.LineSegments(geometry, material);
  //draw a box of size t*t*t
  const g = new THREE.Group();
  g.add(lines);
  if (relativeNodePosition) {
    let thickness = t;
    const geometry2 = new BoxLineGeometry(thickness, thickness, thickness);
    const material2 = new THREE.LineBasicMaterial({ color: themeManager.colors.block.primary });
    const lines2 = new THREE.LineSegments(geometry2, material2);
    lines2.position.set(relativeNodePosition.x, relativeNodePosition.y, relativeNodePosition.z);
    g.add(lines2);
  }
  return g;
}

/**
 * Create the cube geometry and materials
 * @param {Object} params - Parameters object
 * @param {number} params.width - Width of the cube
 * @param {number} params.height - Height of the cube
 * @param {number} params.depth - Depth of the cube
 * @param {number} params.color - Color of the cube
 * @param {Object} params.relativeNodePosition - End position of the block
 * @param {number} params.t - thicknes of the block, i.e., dimension of the square section of the block
 */
export function createTrapezoidBlock({ width = 5, height = 1, depth = 1, relativeNodePosition, t, isTrapezoid, direction } = {}) {
  const geometry = new BoxLineGeometry(width, height, depth);

  const material = new THREE.LineBasicMaterial({ color: themeManager.colors.block.primary });
  const lines = new THREE.LineSegments(geometry, material);
  //draw a box of size t*t*t
  const g = new THREE.Group();
  g.add(lines);
  if (isTrapezoid) {
    let thickness = t * 0.1;
    const geometry2 = new BoxLineGeometry(thickness, thickness, thickness);
    const material2 = new THREE.LineBasicMaterial({ color: themeManager.colors.block.primary });
    const lines2 = new THREE.LineSegments(geometry2, material2);
    lines2.position.set(relativeNodePosition.x, relativeNodePosition.y, relativeNodePosition.z);
    g.add(lines2);
    const triangleShapeRight = new THREE.Shape();
    triangleShapeRight.moveTo(-t / 2, -t / 2);
    triangleShapeRight.lineTo(t / 2, -t / 2);
    triangleShapeRight.lineTo(t / 2, t / 2);
    triangleShapeRight.closePath();
    const triangleShapeLeft = new THREE.Shape();
    triangleShapeLeft.moveTo(-t / 2, -t / 2);
    triangleShapeLeft.lineTo(t / 2, -t / 2);
    triangleShapeLeft.lineTo(-t / 2, t / 2);
    triangleShapeLeft.closePath();

    const extrudeSettings = { depth: t, bevelEnabled: false };
    const triangleRightGeometry = new THREE.ExtrudeGeometry(triangleShapeRight, extrudeSettings);
    const triangleLeftGeometry = new THREE.ExtrudeGeometry(triangleShapeLeft, extrudeSettings);
    const material = new THREE.LineBasicMaterial({ color: themeManager.colors.block.secondary });
    const triangleRightLines = new THREE.LineSegments(
      new THREE.EdgesGeometry(triangleRightGeometry),
      material
    );
    triangleRightLines.position.set(relativeNodePosition.x, relativeNodePosition.y, relativeNodePosition.z - t / 2);
    g.add(triangleRightLines);
    const triangleLeftLines = new THREE.LineSegments(
      new THREE.EdgesGeometry(triangleLeftGeometry),
      material2
    );
    triangleLeftLines.position.set(direction * (width / 2 + t / 2), relativeNodePosition.y, relativeNodePosition.z - t / 2);
    g.add(triangleLeftLines);

  }
  return g;
}

export function createBlock1({ width = 5, height = 1, depth = 1, opacity = 1, transparent = false } = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth);

  // Create an array of materials for each face:
  // [right, left, top, bottom, front, back]
  const materials = [
    new THREE.MeshToonMaterial({ color: themeManager.colors.dimensionLine.depth, transparent, opacity }), // +X (right)  -> blue (zx plane)
    new THREE.MeshToonMaterial({ color: themeManager.colors.dimensionLine.depth, transparent, opacity }), // -X (left)   -> blue (zx plane)
    new THREE.MeshToonMaterial({ color: themeManager.colors.dimensionLine.width, transparent, opacity }), // +Y (top)    -> red  (xy plane)
    new THREE.MeshToonMaterial({ color: themeManager.colors.dimensionLine.width, transparent, opacity }), // -Y (bottom) -> red  (xy plane)
    new THREE.MeshToonMaterial({ color: themeManager.colors.dimensionLine.height, transparent, opacity }), // +Z (front)  -> green (yz plane)
    new THREE.MeshToonMaterial({ color: themeManager.colors.dimensionLine.height, transparent, opacity }), // -Z (back)   -> green (yz plane)
  ];

  const cube = new THREE.Mesh(geometry, materials);
  // cube.material.transparent = transparent;
  // cube.material.opacity = opacity;
  // cube.material.needsUpdate = true;
  cube.userData.largestDimension = getLargestDimension({
    width,
    height,
    depth,
  });
  return cube;
}

/**
 * Create a box block with individual colors for each face
 */
export function createMultiColorBoxBlock({
  width = 5,
  height = 1,
  depth = 1,
  colorRight = themeManager.colors.dimensionLine.depth,
  colorLeft = themeManager.colors.dimensionLine.depth,
  colorTop = themeManager.colors.dimensionLine.width,
  colorBottom = themeManager.colors.dimensionLine.width,
  colorFront = themeManager.colors.dimensionLine.height,
  colorBack = themeManager.colors.dimensionLine.height
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
export function createBlock2({ width = 5, height = 1, depth = 1, color = themeManager.colors.block.primary } = {}) {
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
export function createHollowBlock({ width = 5, height = 1, depth = 1, color = themeManager.colors.block.secondary, exclude = [] } = {}) {
  const group = new THREE.Group();
  const material = new THREE.MeshNormalMaterial({ color, side: THREE.DoubleSide });

  // Front and Back (Verticals)
  if (!exclude.includes("verticals")) {
    const verticalPlane = new THREE.PlaneGeometry(width, height);
    const front = new THREE.Mesh(verticalPlane, material);
    const back = new THREE.Mesh(verticalPlane, material);
    front.position.z = depth / 2;
    group.add(front);

    back.position.z = -depth / 2;
    back.rotation.y = Math.PI;
    group.add(back);
  }

  // Top and Bottom (Horizontals)
  if (!exclude.includes("horizontals")) {
    const horizontalPlane = new THREE.PlaneGeometry(width, depth);
    const top = new THREE.Mesh(horizontalPlane, material);
    const bottom = new THREE.Mesh(horizontalPlane, material);
    top.position.y = height / 2;
    top.rotation.x = -Math.PI / 2;
    group.add(top);

    bottom.position.y = -height / 2;
    bottom.rotation.x = Math.PI / 2;
    group.add(bottom);
  }

  // Left and Right (Laterals)
  if (!exclude.includes("laterals")) {
    const lateralPlane = new THREE.PlaneGeometry(depth, height);
    const left = new THREE.Mesh(lateralPlane, material);
    const right = new THREE.Mesh(lateralPlane, material);
    left.position.x = -width / 2;
    left.rotation.y = -Math.PI / 2;
    group.add(left);

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
  colorFront = themeManager.colors.dimensionLine.height,
  colorBack = themeManager.colors.dimensionLine.height,
  colorTop = themeManager.colors.dimensionLine.width,
  colorBottom = themeManager.colors.dimensionLine.width,
  colorLeft = themeManager.colors.dimensionLine.depth,
  colorRight = themeManager.colors.dimensionLine.depth,
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

export function createLine(node0, node1, index = null) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: themeManager.colors.block.secondary });
  const points = [];
  points.push(node0);
  points.push(node1);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  group.add(line);
  if (index !== null) {
    const textColor = themeManager.colors.textCss;
    const textMesh = createTextSprite(index, { textColor, textSize: 72 });
    textMesh.position.copy(node0);
    group.add(textMesh);
  }
  return group;
}

export function create45AngleCornerBar(whdState, nodes) {
  const { blockThickness } = whdState;
  const group = new THREE.Group();
  const colors = [
    themeManager.colors.block.primary,
    themeManager.colors.block.secondary,
    themeManager.colors.block.tertiary,
    themeManager.colors.dimensionLine.width,
    themeManager.colors.dimensionLine.height,
    themeManager.colors.dimensionLine.depth,
  ];
  const partialNodes = nodes.slice(0, 3)
  const bars = PathManager.generateBars(nodes, blockThickness, blockThickness);
  // return group
  bars.forEach((bar, index) => {
    // Generate Geometry
    const geometry = BarGeometryGenerator.generate(bar);
    geometry.computeVertexNormals(); // For smooth shading if needed, but we use flat

    const material = new THREE.MeshToonMaterial({
      color: colors[index % colors.length],
      // roughness: 0.2,
      // metalness: 0.1,
      // flatShading: true // Better for sharp edges
    });
    // Create Mesh
    const mesh = new THREE.Mesh(geometry, material);

    // Apply Transform
    // The Bar object stores the center position and rotation
    if (bar.position) mesh.position.copy(bar.position);
    if (bar.quaternion) mesh.setRotationFromQuaternion(bar.quaternion);

    group.add(mesh);

    // Wireframe for debugging
    const wireframe = new THREE.WireframeGeometry(geometry);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges);
    // line.material.depthTest = false;
    // line.material.opacity = 0.25;
    // line.material.transparent = true;
    line.position.copy(mesh.position);
    line.quaternion.copy(mesh.quaternion);
    group.add(line);
  })
  return group
}

export function createWedgeAtBarEnds(whdState, nodes) {
  const { blockThickness } = whdState;
  const configurations = generateWedgeConfigurations(nodes);
  const configValues = Object.values(configurations);
  const group = new THREE.Group();

  for (let i = 0; i < configValues.length; i++) {
    const currentConfiguration = configValues[i];
    const nextConfiguration = configValues[(i + 1) % configValues.length];

    const convexGeo = createGeometryFromPoints(currentConfiguration, nextConfiguration, blockThickness);
    if (convexGeo) {
      const material = new THREE.MeshStandardMaterial({
        color: themeManager.colors.block.primary,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        flatShading: true
      });
      const edgeWedgeMesh = new THREE.Mesh(convexGeo, material);

      // Add edges for visual clarity
      const edges = new THREE.EdgesGeometry(convexGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: themeManager.colors.block.primary }));
      edgeWedgeMesh.add(line);

      group.add(edgeWedgeMesh);

export function createWedgeMeshAtBarEnds(whdState, nodes) {
  const { blockThickness } = whdState;
  const configurations = generateWedgeConfigurations(nodes);
  const configValues = Object.values(configurations);
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color: themeManager.colors.block.primary,
    // transparent: true,
    // opacity: 0.5,
    side: THREE.DoubleSide,
    flatShading: true
  });

  for (let i = 0; i < configValues.length; i++) {
    const currentConfiguration = configValues[i];
    const nextConfiguration = configValues[(i + 1) % configValues.length];

    const wedgeMesh = createMeshFromPoints(currentConfiguration, nextConfiguration, blockThickness, material);
    
    if (wedgeMesh) {
      // Add edges for visual clarity
      const edges = new THREE.EdgesGeometry(wedgeMesh.geometry);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: themeManager.colors.block.primary }));
      wedgeMesh.add(line);

      group.add(wedgeMesh);
      wedgeMesh.name = `b${i+1}`;
      wedgeMesh.userData.isNumbered = true;
    }
  }
  
  return group;
}

/**
 * Create the cube geometry and materials
 * @param {Object} params - Parameters object
 * @param {number} params.width - Width of the cube
 * @param {number} params.height - Height of the cube
 * @param {number} params.depth - Depth of the cube
 * @returns {Object} output largest dimension info
 * @param {number} output.size - Largest dimension size
 * @param {string} output.dimension - 'width', 'height', or 'depth'
 */
function getLargestDimension(params) {
  const { width, height, depth } = params;
  const size = Math.max(width, height, depth);
  let dimension = 'width';
  if (size === height) dimension = 'height';
  if (size === depth) dimension = 'depth';
  return { size, dimension };
}
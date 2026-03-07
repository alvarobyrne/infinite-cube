const NAMESPACE = 'infinitecube.io.github.alvarobyrne'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.x = 15.5;
camera.position.y = 15.5;
camera.position.z = 15.5;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);
const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(10, 10, 10);
scene.add(light1);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}
animate();



/**
 * Generates the key points of the wedge and transforms them.
 * These are just the points that lie on the inclined plane of the wedge, the corners of the inclined plane.
 *
 * @param {Object} basis - The basis set {x, y, z} of the corner formed by the current direction of the path,
 * the previous direction of the path and the cross product of the two; the three of them are normalized.
 * @param {THREE.Vector3} position - The world position for the wedge
 * @param {number} barThickness - The thickness of the bar
 * @returns {Object} An array containing the key points of the wedge with transformations baked in.
 */
function getWedgePoints(basis, position, barThickness) {
  // 1. Create the key points of the wedge
  const t2 = barThickness / 2;

  const p1 = new THREE.Vector3(-t2, t2, -t2);
  const p2 = new THREE.Vector3(-t2, t2, t2);
  const p3 = new THREE.Vector3(t2, -t2, -t2);
  const p4 = new THREE.Vector3(t2, -t2, t2);

  // 2. Build the Transformation Matrix
  const transformMatrix = new THREE.Matrix4();
  transformMatrix.makeBasis(basis.x, basis.y, basis.z);
  transformMatrix.setPosition(position);

  // 3. Apply Matrix to Geometries
  p1.applyMatrix4(transformMatrix);
  p2.applyMatrix4(transformMatrix);
  p3.applyMatrix4(transformMatrix);
  p4.applyMatrix4(transformMatrix);

  return [p1, p2, p3, p4];
}
/**
 * Generates the ConvexGeometry from the key points of the wedges.
 *
 * @param {Object} startParams - { basis, position } for the start corner
 * @param {Object} endParams - { basis, position } for the end corner
 * @param {number} barThickness - The thickness of the bar
 * @returns {THREE.BufferGeometry|null} The generated ConvexGeometry or null if no points.
 */
function createGeometryFromPoints(startParams, endParams, barThickness, centerPosition = null, factor = 1.0) {
  const allPoints = [];
  const center = startParams.position.clone()
  .add(endParams.position)
  .multiplyScalar(0.5);
  // Wedge from Start Corner (W2)
  if (startParams) {
    const points1 = getWedgePoints(
      startParams.basis,
      startParams.position,
      barThickness
    );
    const dif = centerPosition.clone().sub(startParams.position).normalize().multiplyScalar(factor) ;
    points1.forEach(p => p.add(dif));
    allPoints.push(...points1);
  }

  // Wedge from End Corner (W1)
  if (endParams) {
    const points2 = getWedgePoints(
      endParams.basis,
      endParams.position,
      barThickness
    );
    const dif = endParams.position.clone().sub(centerPosition).normalize().multiplyScalar(-factor) ;
    points2.forEach(p => p.add(dif));
    allPoints.push(...points2);
  }

  if (allPoints.length === 0) return null;

  return new ConvexGeometry(allPoints);
}

/**
 * Creates a THREE.Mesh from wedge points instead of just geometry.
 *
 * @param {Object} startParams - { basis, position } for the start corner
 * @param {Object} endParams - { basis, position } for the end corner
 * @param {number} barThickness - The thickness of the bar
 * @param {THREE.Material} material - Optional material for the mesh (defaults to basic mesh material)
 * @returns {THREE.Mesh|null} The generated mesh or null if no points.
 */
function createMeshFromPoints(
  startParams,
  endParams,
  barThickness,
  material = null,
  centerPosition = null,
  factor = 1.0
) {
  const geometry = createGeometryFromPoints(
    startParams,
    endParams,
    barThickness,
    centerPosition,
    factor
  );

  if (!geometry) return null;

  // Use provided material or create a default one
  const meshMaterial =
    material ||
    new THREE.MeshBasicMaterial({
      color: 0x888888,
      side: THREE.DoubleSide
    });

  const mesh = new THREE.Mesh(geometry, meshMaterial);
  return mesh;
}

function createWedgeMeshAtBarEnds(whdState, nodes, configs, positions, colors = [0xffff00]) {
  const { blockThickness, opacity , isBasis, isVertexNormals,factor} = whdState;
  const configurations = generateWedgeConfigurations(nodes);
  const configValues = Object.values(configurations);
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    flatShading: true
  });
  for (let i = 0; i < configValues.length; i++) {
    const barConfig = configs[`b${i + 1}`];
    const currentConfiguration = configValues[i];
    const nextConfiguration = configValues[(i + 1) % configValues.length];
    const currentCenterOfBar = positions[(positions.length+1+i)%positions.length]

    if(isBasis) {
      const basisCurrent = currentConfiguration.basis;
      const basisNext = nextConfiguration.basis;
      const basisValues = Object.values(basisCurrent);
      const basisKeys = Object.keys(basisCurrent);
      basisValues.forEach((basis, index) => {
        const dimension = basisKeys[index];
        let color = "";
        if (dimension === "x") color = "red";
        else if (dimension === "y") color = "green";
        else if (dimension === "z") color = "blue";
        const position = currentConfiguration.position;
        group.add(new THREE.ArrowHelper(basis, position, 2, color));
      });
      const color = colors[i % colors.length];
      const material = new THREE.MeshBasicMaterial({color});
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2), material);
      sphere.position.copy(currentCenterOfBar);
      group.add(sphere);
      const factor = 0.9;
      const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.1), material);
      const d1 = currentCenterOfBar.clone().sub(currentConfiguration.position).normalize().multiplyScalar(factor)
      s1.position.copy(currentConfiguration.position.clone().add(d1));
      group.add(s1);
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.1), material);
      const d2 = nextConfiguration.position.clone().sub(currentCenterOfBar).normalize().multiplyScalar(-factor)
      s2.position.copy(nextConfiguration.position.clone().add(d2));
      group.add(s2);
    }

    const clonedMaterial = material.clone();
    clonedMaterial.color.set(colors[i % colors.length]);

    const wedgeMesh = createMeshFromPoints(
      currentConfiguration,
      nextConfiguration,
      blockThickness,
      clonedMaterial,
      currentCenterOfBar,
      factor
    );

    if (wedgeMesh) {
      // Add edges for visual clarity
      const edges = new THREE.EdgesGeometry(wedgeMesh.geometry);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color:'gray'
        })
      );
      wedgeMesh.add(line);
      if(isVertexNormals) {
        const helper = new VertexNormalsHelper(wedgeMesh, 1, 'lime');
        group.add(helper);
      }
      group.add(wedgeMesh);
    }
  }

  return group;
}

/**
 * Calculates the positions for the 18 blocks based on their configurations.
 * @param {Object} whdState - The width, height, depth state.
 * @returns {Object} An object containing x, y, z positions for 18 blocks (b1 to b18).
 */
function getNodesWHDPositions(whdState) {
  const { blockThickness: t, width: w, height: h, depth: d } = whdState;

  // Abstracted divisions for optimization
  const T2 = t * 0.5;
  const W2 = w * 0.5;

  const configs = getWHDNodesConfigs(whdState);
  // Block-specific half-dimensions
  const HB1 = configs.b1.height * 0.5;
  const HB3 = configs.b3.height * 0.5;
  const WB4 = configs.b4.width * 0.5;
  const DB5 = configs.b5.depth * 0.5;
  const WB6 = configs.b6.width * 0.5;
  const DB7 = configs.b7.depth * 0.5;
  const HB8 = configs.b8.height * 0.5;
  const DB9 = configs.b9.depth * 0.5;
  const HB10 = configs.b10.height * 0.5;
  const WB11 = configs.b11.width * 0.5;
  const HB12 = configs.b12.height * 0.5;
  const WB13 = configs.b13.width * 0.5;
  const DB14 = configs.b14.depth * 0.5;
  const WB15 = configs.b15.width * 0.5;
  const DB16 = configs.b16.depth * 0.5;
  const HB17 = configs.b17.height * 0.5;
  const DB18 = configs.b18.depth * 0.5;


  const pos = {};

  // b1 at origin
  pos.b1 = {
    x: W2 - T2,
    y: HB1 + T2,
    z: 0
  };

  // b2 relative to b1
  pos.b2 = {
    x: pos.b1.x - (W2 - T2),
    y: pos.b1.y - (HB1 + T2),
    z: pos.b1.z
  };

  // b3 relative to b1
  pos.b3 = {
    x: pos.b2.x - (W2 - T2),
    y: pos.b2.y + HB3 + T2,
    z: pos.b2.z
  };

  // b4 relative to b3
  pos.b4 = {
    x: pos.b3.x + WB4 + T2,
    y: pos.b3.y + HB3 + T2,
    z: pos.b3.z
  };

  // b5 relative to b4
  pos.b5 = {
    x: pos.b4.x + WB4 + T2,
    y: pos.b4.y,
    z: pos.b4.z + DB5 + T2
  };

  // b6 relative to b5
  pos.b6 = {
    x: pos.b5.x - WB6 - T2,
    y: pos.b5.y,
    z: pos.b5.z + DB5 + T2
  };

  // b7 relative to b6
  pos.b7 = {
    x: pos.b6.x - WB6 - T2,
    y: pos.b6.y,
    z: pos.b6.z - DB7 - T2
  };

  // b8 relative to b7
  pos.b8 = {
    x: pos.b7.x,
    y: pos.b7.y - HB8 - T2,
    z: pos.b7.z - DB7 - T2
  };

  // b9 relative to b8
  pos.b9 = {
    x: pos.b8.x,
    y: pos.b8.y - HB8 - T2,
    z: pos.b8.z + DB9 + T2
  };

  // b10 relative to b9
  pos.b10 = {
    x: pos.b9.x,
    y: pos.b9.y + HB10 + T2,
    z: pos.b9.z + DB9 + T2
  };

  // b11 relative to b10
  pos.b11 = {
    x: pos.b10.x + WB11 + T2,
    y: pos.b10.y + HB10 + T2,
    z: pos.b10.z
  };

  // b12 relative to b11
  pos.b12 = {
    x: pos.b11.x + WB11 + T2,
    y: pos.b11.y - HB12 - T2,
    z: pos.b11.z
  };

  // b13 relative to b12
  pos.b13 = {
    x: pos.b12.x - WB13 - T2,
    y: pos.b12.y - HB12 - T2,
    z: pos.b12.z
  };

  // b14 relative to b13
  pos.b14 = {
    x: pos.b13.x - WB13 - T2,
    y: pos.b13.y,
    z: pos.b13.z - DB14 - T2
  };

  // b15 relative to b14
  pos.b15 = {
    x: pos.b14.x + WB15 + T2,
    y: pos.b14.y,
    z: pos.b14.z - DB14 - T2
  };

  // b16 relative to b15
  pos.b16 = {
    x: pos.b15.x + WB15 + T2,
    y: pos.b15.y,
    z: pos.b15.z + DB16 + T2
  };

  // b17 relative to b16
  pos.b17 = {
    x: pos.b16.x,
    y: pos.b16.y + HB17 + T2,
    z: pos.b16.z + DB16 + T2
  };

  // b18 relative to b17
  pos.b18 = {
    x: pos.b17.x,
    y: pos.b17.y + HB17 + T2,
    z: pos.b17.z - DB18 - T2
  };
  const keys = Object.keys(configs)
  const nodes = {};
  keys.forEach((key, i) => {
    const c0 = configs[key];
    const p0 = pos[key];
    const absoluteNodePosition = {
      x: p0.x + c0.relativeNodePosition.x,
      y: p0.y + c0.relativeNodePosition.y,
      z: p0.z + c0.relativeNodePosition.z
    };
    nodes[key] = absoluteNodePosition;
  });
  return { positions: pos, nodes , configs};
}
/**
 * Generates the configurations for the 18 blocks used in WHD (Width, Height, Depth) strategies.
 * @param {Object} whdState - The width, height, depth state from whdState.js.
 * @returns {Object} An object containing configurations for 18 blocks (b1 to b18).
 */
function getWHDNodesConfigs(whdState) {
  const { blockThickness: t, width: w, height: h, depth: d } = whdState;

  const preConfigs = getWHDConfigs(whdState);

  const configs = Object.assign({}, preConfigs);
  configs.b1.height -= t
  configs.b2.width -= 2 * t;
  configs.b4.width -= t
  configs.b5.depth -= 2 * t
  configs.b7.depth -= t
  configs.b8.height -= 2 * t
  configs.b10.height -= t
  configs.b11.width -= 2 * t
  configs.b13.width -= t
  configs.b14.depth -= 2 * t
  configs.b16.depth -= t
  configs.b17.height -= 2 * t
  const factors = {
    b1: -1,
    b2: -1,
    b3: 1,
    b4: 1,
    b5: 1,
    b6: -1,
    b7: -1,
    b8: -1,
    b9: 1,
    b10: 1,
    b11: 1,
    b12: -1,
    b13: -1,
    b14: -1,
    b15: 1,
    b16: 1,
    b17: 1,
    b18: -1
  }
  Object.keys(configs).forEach(key => {
    configs[key].relativeNodePosition = getRelativeEnd(configs[key], factors[key]);
  });
  return configs;
}
/**
 * Figure out which key is the longest in the config object.
 * @param {Object} config 
 * @param {number} config.width 
 * @param {number} config.height 
 * @param {number} config.depth 
 * @param {number} factor : orientation factor
 */
function getRelativeEnd(config, factor) {
  const maxKey = config.maxKey;
  const max = config[maxKey];
  const p = { x: 0, y: 0, z: 0 }
  const dict = { width: 'x', height: 'y', depth: 'z' }
  const thickness = config.t;
  p[dict[config.maxKey]] = 0.5*factor * (max  + thickness );
  return p;
}

/**
 * Generates wedge configurations ensuring seamless joints.
 * For each joint between perpendicular bars, we determine which "corner" of the cross-section is removed by
 * the 45° cut.
 * 
 * @param {Array} pathOfNodes - Array of THREE.Vector3 points defining the path
 * @returns {Object} Map of configs for each bar (e.g., { b1: { ... }, b2: { ... } })
 */
function generateWedgeConfigurations(pathOfNodes) {

  const configs = {};
  const n = pathOfNodes.length - 1;
  const isClosed = true;

  for (let i = 0; i < n; i++) {
    const pPrev = i > 0 ? pathOfNodes[i - 1] : isClosed ? pathOfNodes[n - 1] : null;
    const pCurr = pathOfNodes[i];
    const pNext = pathOfNodes[i + 1];

    const dCurr = new THREE.Vector3().subVectors(pNext, pCurr).normalize();

    const cfg = {};

    cfg.basis = { y: dCurr.clone().normalize() }

    cfg.position = pCurr.clone();

    if (pPrev) {
      const dPrev = new THREE.Vector3().subVectors(pCurr, pPrev).normalize();

      cfg.basis.x = dPrev.clone().normalize();

      // Calculate Z using cross product of X and Y
      const cross = new THREE.Vector3().crossVectors(cfg.basis.x, cfg.basis.y).normalize();
      cfg.basis.z = cross;
    }

    configs[`b${i + 1}`] = cfg;
  }

  return configs;
}
/**
 * Generates the configurations for the 18 blocks used in WHD (Width, Height, Depth) strategies.
 * @param {Object} whdState - The width, height, depth state from whdState.js.
 * @returns {Object} An object containing configurations for 18 blocks (b1 to b18).
 */
function getWHDConfigs(whdState) {
  const { blockThickness: t, width: w, height: h, depth: d } = whdState;
  const { reducedWidth, w_prime, reducedHeight, h_prime, reducedDepth, d_prime } = getWHDDimensions(whdState);

  const cWidth = 'red'
  const cHeight = 'green'
  const cDepth = 'blue'

  return {
    b1: { width: t, height: h_prime, depth: t, t, color: cHeight, isWireframe: false, maxKey: "height" },
    b2: { width: w, height: t, depth: t, t, color: cWidth, isWireframe: false, maxKey: "width" },
    b3: { width: t, height: reducedHeight, depth: t, t, color: cDepth, isWireframe: false, maxKey: "height" },
    b4: { width: w_prime, height: t, depth: t, t, color: cHeight, isWireframe: false, maxKey: "width" },
    b5: { width: t, height: t, depth: d, t, color: cWidth, isWireframe: false, maxKey: "depth" },
    b6: { width: reducedWidth, height: t, depth: t, t, color: cDepth, isWireframe: false, maxKey: "width" },
    b7: { width: t, height: t, depth: d_prime, t, color: cHeight, isWireframe: false, maxKey: "depth" },
    b8: { width: t, height: h, depth: t, t, color: cWidth, isWireframe: false, maxKey: "height" },
    b9: { width: t, height: t, depth: reducedDepth, t, color: cDepth, isWireframe: false, maxKey: "depth" },
    b10: { width: t, height: h_prime, depth: t, t, color: cHeight, isWireframe: false, maxKey: "height" },
    b11: { width: w, height: t, depth: t, t, color: cWidth, isWireframe: false, maxKey: "width" },
    b12: { width: t, height: reducedHeight, depth: t, t, color: cDepth, isWireframe: false, maxKey: "height" },
    b13: { width: w_prime, height: t, depth: t, t, color: cHeight, isWireframe: false, maxKey: "width" },
    b14: { width: t, height: t, depth: d, t, color: cWidth, isWireframe: false, maxKey: "depth" },
    b15: { width: reducedWidth, height: t, depth: t, t, color: cDepth, isWireframe: false, maxKey: "width" },
    b16: { width: t, height: t, depth: d_prime, t, color: cHeight, isWireframe: false, maxKey: "depth" },
    b17: { width: t, height: h, depth: t, t, color: cWidth, isWireframe: false, maxKey: "height" },
    b18: { width: t, height: t, depth: reducedDepth, t, color: cDepth, isWireframe: false, maxKey: "depth" },
  };
}

/**
 * Calculates the dimensions for the WHD blocks.
 * @param {Object} whdState - The width, height, depth state.
 * @returns {Object} Calculated dimensions like reducedWidth, w_prime, etc.
 */
function getWHDDimensions(whdState) {
  const { blockThickness: t, gap: g, width: w, height: h, depth: d } = whdState;
  const t2 = 2 * t;
  const g_t = g + t;
  return {
    reducedWidth: w - t2,
    w_prime: w - g_t,
    reducedHeight: h - t2,
    h_prime: h - g_t,
    reducedDepth: d - t2,
    d_prime: d - g_t,
    lowerLimit: g + t2,
    t2: t2,
    g_t: g_t,
  };
}

class WHDWedgeMeshesAtBarEndsStrategy {
  execute(params) {
    const { whdState } = params;

    const { nodes, configs , positions} = getNodesWHDPositions(whdState);

    // turn the nodes object into an array
    const nodesArray = []
    const positionsArray = []
    const configsArray = []
    for (const key in nodes) {
      const obj = nodes[key];
      nodesArray.push(new THREE.Vector3(obj.x, obj.y, obj.z));
      positionsArray.push(new THREE.Vector3().copy(positions[key]));
      configsArray.push(configs[key]);
    }
    nodesArray.push(nodesArray[0])


    return { group: createWedgeMeshAtBarEnds(whdState, nodesArray, configsArray, positionsArray, colors) };
  }
}
const colors = [
  'maroon',
  'green',
  'navy',
  'olive',
  'purple',
  'teal',
  'gray',
  'orange',
  'fuchsia']//,'pink','black','white']
const state = {
  width: 20,
  height: 15,
  depth: 12,
  blockThickness: 1,
  gap: 5,
  opacity: 1.0,
  isBasis:true,
  isVertexNormals: false,
  factor:0,
}
// Minimalist scene.
const infiniteCubeStrategy = new WHDWedgeMeshesAtBarEndsStrategy();
let infiniteCube;
const gui = new GUI();

gui.add(location,'reload')

gui.add(state, 'width', 10, 30).onChange(updateScene);
gui.add(state, 'height', 10, 30).onChange(updateScene);
gui.add(state, 'depth', 10, 30).onChange(updateScene);
gui.add(state, 'blockThickness', 0.5, 5).onChange(updateScene);
gui.add(state, 'gap', 0, 5).onChange(updateScene);
gui.add(state, 'opacity', 0.0, 1.0).onChange(updateScene);
gui.add(state, 'factor', 0,2,0.01).onChange(updateScene);
gui.add(state, 'isBasis', false).onChange(updateScene);
gui.add(state, 'isVertexNormals', false).onChange(updateScene);

controls.autoRotate = true
gui.add(controls, 'autoRotate').onChange(updateScene);

gui.add({github: () => window.open('https://github.com/alvarobyrne/infinite-cube/', '_blank')}, 'github').name('code');
gui.add({github: () => window.open('https://alvarobyrne.github.io/infinite-cube/', '_blank')}, 'github').name('demo');
if(location.href.includes('localhost')) {
  gui.add({codepen: () => window.open('https://codepen.io/alvarobyrne/pen/raMBwqB', '_blank')}, 'codepen').name('codepen');
}
//empty the localStorage, add a button to
gui.add({clear: () => {
  localStorage.removeItem(NAMESPACE);
  location.reload();
}}, 'clear').name('clear saved state');

function updateScene() {
  scene.remove(infiniteCube?.group);
  infiniteCube = infiniteCubeStrategy.execute({
    whdState: state
  });
  scene.add(infiniteCube.group);
  localStorage.setItem(NAMESPACE, JSON.stringify(gui.save()));
}

// gui.close();


localStorage.getItem(NAMESPACE) && gui.load(JSON.parse(localStorage.getItem(NAMESPACE)));
updateScene()

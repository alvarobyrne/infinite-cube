import "./style.css";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three-stdlib";
import { setupScene, createBlock } from "./scene-setup.js";
import { saveCameraState, loadCameraState } from "./cameraState.js";
import { addDimensionLine } from "./dimensionLine.js";
import { addVertices } from "./vertices.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

console.log("Hello, World!", Math.random());

const transversalBlockSize = 1;

const dimension1 = transversalBlockSize * 5;
const dimension2 = transversalBlockSize * 4;
const dimension3 = transversalBlockSize * 5;
// Cube Configuration
const width = dimension1,
  height = transversalBlockSize,
  depth = transversalBlockSize;
const block1Configuration = {
  width: dimension1,
  height: transversalBlockSize,
  depth: transversalBlockSize,
  color: 0xff0000,
};
const block2Configuration = {
  width: transversalBlockSize,
  height: dimension2,
  depth: transversalBlockSize,
  color: 0x00ff00,
};
const block3Configuration = {
  width: transversalBlockSize,
  height: dimension3,
  depth: transversalBlockSize,
  color: 0x0000ff,
};

const { scene, renderer, camera } = setupScene();

// Create a group to hold all elements
const group = new THREE.Group();
scene.add(group);

const block1 = createBlock(block1Configuration);
const block2 = createBlock(block2Configuration);
const block3 = createBlock(block3Configuration);

group.add(block1);
group.add(block2);
group.add(block3);

const isAddingGaps = true;
const gapSize = isAddingGaps ? 0.05 : 0;

block2.position.x = dimension1 / 2 - transversalBlockSize / 2 ; // small offset to avoid z-fighting
block2.position.y = dimension2 / 2 + transversalBlockSize / 2 + gapSize; // small offset to avoid z-fighting
block2.position.z = 0;

block3.position.x = -dimension1 / 2 + transversalBlockSize / 2 ; // small offset to avoid z-fighting
block3.position.y = dimension3 / 2 + transversalBlockSize / 2 + gapSize; // small offset to avoid z-fighting
block3.position.z = 0;

const controls = new OrbitControls(camera, renderer.domElement);

// Load camera state if available
loadCameraState(camera, controls);

controls.addEventListener("change", () => {
  saveCameraState(camera, controls);
});

async function init() {
  await renderer.init();
  console.log("WebGPU initialized");

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

init();

// Cube Configuration
const x = width,
  y = height,
  z = depth;
const dimensionLineOffset = 0.4;
const textSize = 16;

// X dimension (along +Y, above the cube)
addDimensionLine({
  object3d: scene,
  start: new THREE.Vector3(-x / 2, y / 2 + dimensionLineOffset, z / 2),
  end: new THREE.Vector3(x / 2, y / 2 + dimensionLineOffset, z / 2),
  label: x.toString(),
  color: 0xff0000,
  textColor: "#f00",
  textSize,
});

// Y dimension (along +X, right of the cube)
addDimensionLine({
  object3d: scene,
  start: new THREE.Vector3(x / 2 + dimensionLineOffset, -y / 2, z / 2),
  end: new THREE.Vector3(x / 2 + dimensionLineOffset, y / 2, z / 2),
  label: y.toString(),
  color: 0x00ff00,
  textColor: "#0a0",
  textSize,
});

// Z dimension (along +Y, in front of the cube)
addDimensionLine({
  object3d: scene,
  start: new THREE.Vector3(-x / 2 - dimensionLineOffset, y / 2, z / 2),
  end: new THREE.Vector3(-x / 2 - dimensionLineOffset, y / 2, -z / 2),
  label: z.toString(),
  color: 0x0000ff,
  textColor: "#00f",
  textSize,
});

// Add vertices at cube corners
addVertices(scene, x, y, z);

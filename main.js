import "./style.css";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three-stdlib";
import GUI from "lil-gui";
import { setupScene, createBlock } from "./scene-setup.js";
import { saveCameraState, loadCameraState, clearCameraState } from "./cameraState.js";
import { saveDimensionState, loadDimensionState, clearDimensionState } from "./dimensionState.js";
import { addDimensionLine } from "./dimensionLine.js";
import { addVertices } from "./vertices.js";

console.log("Hello, World!", Math.random());

const transversalBlockSize = 1;

// Load dimension state or use defaults
const savedDimensionState = loadDimensionState();
const dimensionState = {
  dimension1: savedDimensionState?.dimension1 || transversalBlockSize * 8,
  dimension2: savedDimensionState?.dimension2 || transversalBlockSize * 4,
  dimension3: savedDimensionState?.dimension3 || transversalBlockSize * 5,
};

const { scene, renderer, camera } = setupScene();

const isAddingGaps = false;
const gapSize = isAddingGaps ? 0.05 : 0;

let group;
let groupClone;

function recreateScene() {
  // Clear the scene except for camera
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  // Create a group to hold all elements
  group = new THREE.Group();
  scene.add(group);
  group.add(new THREE.AxesHelper(6));

  // Update block configurations
  const block1Configuration = {
    width: dimensionState.dimension1,
    height: transversalBlockSize,
    depth: transversalBlockSize,
    color: 0xff0000,
  };
  const block2Configuration = {
    width: transversalBlockSize,
    height: dimensionState.dimension2,
    depth: transversalBlockSize,
    color: 0x00ff00,
  };
  const block3Configuration = {
    width: transversalBlockSize,
    height: dimensionState.dimension3,
    depth: transversalBlockSize,
    color: 0x0000ff,
  };

  const block1 = createBlock(block1Configuration);
  const block2 = createBlock(block2Configuration);
  const block3 = createBlock(block3Configuration);

  group.add(block1);
  group.add(block2);
  group.add(block3);

  block2.position.x = dimensionState.dimension1 / 2 - transversalBlockSize / 2; // small offset to avoid z-fighting
  block2.position.y = dimensionState.dimension2 / 2 + transversalBlockSize / 2 + gapSize; // small offset to avoid z-fighting
  block2.position.z = 0;

  block3.position.x = -dimensionState.dimension1 / 2 + transversalBlockSize / 2; // small offset to avoid z-fighting
  block3.position.y = dimensionState.dimension3 / 2 + transversalBlockSize / 2 + gapSize; // small offset to avoid z-fighting
  block3.position.z = 0;

  // Update dimension lines
  const x = dimensionState.dimension1;
  const y = transversalBlockSize;
  const z = transversalBlockSize;
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

  addDimensionLine({
    object3d: scene,
    start: new THREE.Vector3(x / 2 + dimensionLineOffset, -y / 2, -z / 2),
    end: new THREE.Vector3(x / 2 + dimensionLineOffset, y / 2, -z / 2),
    label: "d 2",
    color: 0xffffff,
    textColor: "white",
    textSize: 12,
  });

  // Add vertices at cube corners
  addVertices(scene, x, y, z);

  // Create and position the cloned group
  groupClone = group.clone();
  groupClone.rotateX(-Math.PI * 0.5);
  groupClone.rotateZ(Math.PI * 0.5);
  groupClone.position.x = -(dimensionState.dimension1*0.5-dimensionState.dimension2)
  groupClone.position.y = transversalBlockSize + dimensionState.dimension3 + gapSize * 2;
  groupClone.position.z = dimensionState.dimension1 * 0.5 - transversalBlockSize * 0.5;
  scene.add(groupClone);
}

// Initial scene creation
recreateScene();

const controls = new OrbitControls(camera, renderer.domElement);

// Load camera state if available
loadCameraState(camera, controls);

controls.addEventListener("change", () => {
  saveCameraState(camera, controls);
});

// Initialize GUI
const gui = new GUI();
gui.add(dimensionState, "dimension1", 1, 20, 0.1).onChange(() => {
  saveDimensionState(dimensionState);
  recreateScene();
});
gui.add(dimensionState, "dimension2", 1, 20, 0.1).onChange(() => {
  saveDimensionState(dimensionState);
  recreateScene();
});
gui.add(dimensionState, "dimension3", 1, 20, 0.1).onChange(() => {
  saveDimensionState(dimensionState);
  recreateScene();
});

// Add clear buttons
gui.add({ clearCamera: () => {
  clearCameraState();
  loadCameraState(camera, controls);
}}, "clearCamera").name("Clear Camera State");

gui.add({ clearDimensions: () => {
  clearDimensionState();
  location.reload();
}}, "clearDimensions").name("Clear Dimension State");

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


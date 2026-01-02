import "./style.css";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three-stdlib";
import { setupScene } from "./scene-setup.js";
import { saveCameraState, loadCameraState } from "./cameraState.js";
import { loadDimensionState } from "./dimensionState.js";
import { blockRenderState } from "./blockRenderState.js";
import { recreateScene } from "./scene-recreation.js";
import { setupGUI } from "./gui-setup.js";

console.log("Hello, World!", Math.random());

const transversalBlockSize = 1;

// Load dimension state or use defaults
const savedDimensionState = loadDimensionState();
const dimensionState = {
  dimension1: savedDimensionState?.dimension1 || transversalBlockSize * 7,
  dimension2: savedDimensionState?.dimension2 || transversalBlockSize * 5,
  dimension3: savedDimensionState?.dimension3 || transversalBlockSize * 5,
};

const { scene, renderer, camera } = setupScene();

const isAddingGaps = false;
const gapSize = isAddingGaps ? 0.05 : 0;

// Wrapper function for recreateScene that updates local variables
let group, groupClone1, groupClone2, groupClone3, groupClone4, groupClone5;

function recreateSceneWrapper() {
  const result = recreateScene({
    scene,
    dimensionState,
    blockRenderState,
    transversalBlockSize,
    gapSize,
  });
  group = result.group;
  groupClone1 = result.groupClone1;
  groupClone2 = result.groupClone2;
  groupClone3 = result.groupClone3;
  groupClone4 = result.groupClone4;
  groupClone5 = result.groupClone5;
}

// Initial scene creation
recreateSceneWrapper();

const controls = new OrbitControls(camera, renderer.domElement);

// Load camera state if available
loadCameraState(camera, controls);

controls.addEventListener("change", () => {
  saveCameraState(camera, controls);
});

// Collect all clones for GUI
const clones = {
  groupClone1,
  groupClone2,
  groupClone3,
  groupClone4,
  groupClone5,
};

// Initialize GUI
const { gui } = setupGUI({
  dimensionState,
  blockRenderState,
  recreateScene: recreateSceneWrapper,
  camera,
  controls,
  clones,
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


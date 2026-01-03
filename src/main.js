import "./style.css";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three-stdlib";
import { setupScene } from "./scene-setup.js";
import { saveCameraState, loadCameraState } from "./cameraState.js";
import { loadDimensionState } from "./dimensionState.js";
import { blockRenderState, loadBlockRenderState } from "./blockRenderState.js";
import { cloneVisibilityState, loadCloneVisibilityState, saveCloneVisibilityState } from "./cloneVisibilityState.js";
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

// Load block render state or use defaults
const savedBlockRenderState = loadBlockRenderState();
if (savedBlockRenderState) {
  Object.assign(blockRenderState, savedBlockRenderState);
}

// Load clone visibility state or use defaults
const savedCloneVisibilityState = loadCloneVisibilityState();
if (savedCloneVisibilityState) {
  Object.assign(cloneVisibilityState, savedCloneVisibilityState);
}

const { scene, renderer, camera } = setupScene();

const isAddingGaps = false;
const gapSize = isAddingGaps ? 0.05 : 0;

// Wrapper function for recreateScene that updates local variables
let group;
const clones = {
  groupClone1: null,
  groupClone2: null,
  groupClone3: null,
  groupClone4: null,
  groupClone5: null,
};

function recreateSceneWrapper() {
  const result = recreateScene({
    scene,
    dimensionState,
    blockRenderState,
    transversalBlockSize,
    gapSize,
  });
  group = result.group;
  clones.groupClone1 = result.groupClone1;
  clones.groupClone2 = result.groupClone2;
  clones.groupClone3 = result.groupClone3;
  clones.groupClone4 = result.groupClone4;
  clones.groupClone5 = result.groupClone5;

  // Apply initial visibility
  clones.groupClone1.visible = cloneVisibilityState.groupClone1;
  clones.groupClone2.visible = cloneVisibilityState.groupClone2;
  clones.groupClone3.visible = cloneVisibilityState.groupClone3;
  clones.groupClone4.visible = cloneVisibilityState.groupClone4;
  clones.groupClone5.visible = cloneVisibilityState.groupClone5;
}

// Initial scene creation
recreateSceneWrapper();

const controls = new OrbitControls(camera, renderer.domElement);

// Load camera state if available
loadCameraState(camera, controls);

controls.addEventListener("change", () => {
  saveCameraState(camera, controls);
});

// Helper to set visibility for all clones
function setAllClonesVisibility(visible) {
  for (let i = 1; i <= 5; i++) {
    const cloneName = `groupClone${i}`;
    const clone = clones[cloneName];
    if (clone) {
      clone.visible = visible;
      cloneVisibilityState[cloneName] = visible;
    }
  }
  saveCloneVisibilityState(cloneVisibilityState);
}

// Keyboard shortcuts for clone visibility
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key >= "1" && key <= "5") {
    const cloneIndex = parseInt(key);
    const cloneName = `groupClone${cloneIndex}`;
    const clone = clones[cloneName];

    if (clone) {
      // Toggle visibility
      clone.visible = !clone.visible;
      // Update state object (GUI will reflect this via .listen())
      cloneVisibilityState[cloneName] = clone.visible;
      // Persist state
      saveCloneVisibilityState(cloneVisibilityState);
    }
  } else if (key === "a") {
    setAllClonesVisibility(true);
  } else if (key === "h") {
    setAllClonesVisibility(false);
  }
});

// Initialize GUI
const { gui } = setupGUI({
  dimensionState,
  blockRenderState,
  cloneVisibilityState,
  recreateScene: recreateSceneWrapper,
  setAllClonesVisibility,
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


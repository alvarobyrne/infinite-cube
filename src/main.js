import "./style.css";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three-stdlib";
import { setupScene } from "./scene-setup.js";
import { saveCameraState, loadCameraState } from "./cameraState.js";
import { loadDimensionState } from "./dimensionState.js";
import { blockRenderState, loadBlockRenderState } from "./blockRenderState.js";
import { cloneVisibilityState, loadCloneVisibilityState } from "./cloneVisibilityState.js";
import { recreateScene } from "./scene-recreation.js";
import { setupGUI } from "./gui-setup.js";
import { loadAllClonesState } from "./object3DState.js";
import { cloneSelectorState, loadCloneSelectorState } from "./cloneSelectorState.js";
import { setAllClonesVisibility, setupKeyboardHandlers } from "./keyboard-handlers.js";

console.log("Hello, World!", Math.random());

// Load dimension state or use defaults
const savedDimensionState = loadDimensionState();
const dimensionState = {
  dimension1: savedDimensionState?.dimension1 || 14,
  dimension2: savedDimensionState?.dimension2 || 8,
  dimension3: savedDimensionState?.dimension3 || 10,
  blockThickness: savedDimensionState?.blockThickness || savedDimensionState?.transversalBlockSize || 2,
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

// Load clone selector state or use defaults
const savedCloneSelectorState = loadCloneSelectorState();
if (savedCloneSelectorState) {
  Object.assign(cloneSelectorState, savedCloneSelectorState);
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

// Position and rotation manager reference
let positionRotationManager = null;

function recreateSceneWrapper() {
  const result = recreateScene({
    scene,
    dimensionState,
    blockRenderState,
    blockThickness: dimensionState.blockThickness,
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

  // Load saved positions/rotations for all clones
  loadAllClonesState(clones);

  // If the manager has been initialized, tell it to switch/sync with the current selection
  if (positionRotationManager) {
    positionRotationManager.switchClone(cloneSelectorState.selectedCloneIndex, true);
  }
}

// Initial scene creation
recreateSceneWrapper();

const controls = new OrbitControls(camera, renderer.domElement);

// Load camera state if available
loadCameraState(camera, controls);

controls.addEventListener("change", () => {
  saveCameraState(camera, controls);
});

// Helper to set visibility for all clones (bound to local clones and state)
const setAllClonesVisibilityBound = (visible) => setAllClonesVisibility(clones, cloneVisibilityState, visible);

// Initialize GUI
const guiResult = setupGUI({
  dimensionState,
  blockRenderState,
  cloneVisibilityState,
  recreateScene: recreateSceneWrapper,
  setAllClonesVisibility: setAllClonesVisibilityBound,
  camera,
  controls,
  clones,
});

const { gui, folders, manager } = guiResult;
positionRotationManager = manager;

// Initialize Keyboard Handlers
setupKeyboardHandlers({
  clones,
  cloneVisibilityState,
  blockRenderState,
  recreateSceneWrapper,
  folders,
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


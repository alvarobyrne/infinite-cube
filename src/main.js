import "./style.css";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three-stdlib";
import { setupScene } from "./scene-setup.js";
import { saveCameraState, loadCameraState, saveCameraSettings } from "./state/cameraState.js";
import { saveDimensionState } from "./state/dimensionState.js";
import { saveWHDState } from "./width_height_depth/whdState.js";
import { blockRenderState, saveBlockRenderState } from "./state/blockRenderState.js";
import { cloneVisibilityState } from "./state/cloneVisibilityState.js";
import { recreateScene } from "./scene-recreation.js";
import { setupGUI } from "./gui-setup.js";
import { loadAllClonesState } from "./state/object3DState.js";
import { cloneSelectorState } from "./state/cloneSelectorState.js";
import { setAllClonesVisibility, setupKeyboardHandlers } from "./keyboard/keyboard-handlers.js";
import { viewState, saveViewState, VIEW_MODES, RENDERER_TYPES } from "./state/viewState.js";

import { views, setupViews } from "./scene-setup.js";
import { getWHDDimensionsSum, getWHDDimensions } from "./width_height_depth/whd-utils.js";
import { configState } from "./state/configState.js";
import { loadFont, updateBlockNumbers } from "./text-manager.js";
import { initStates } from "./init.js";


// Initialize all states
const {
  dimensionState,
  whdState,
  reportState,
  cameraSettings
} = initStates();

console.log("Hello, World!", Math.random());

const { scene, renderer, camera } = setupScene(cameraSettings, viewState.rendererType);

if (viewState.mode === VIEW_MODES.MULTI) {
  setupViews(camera, cameraSettings);
}

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
let blocksWithNumbers = [];

function recreateSceneWrapper() {
  const result = recreateScene({
    scene,
    dimensionState,
    blockRenderState,
    blockThickness: dimensionState.blockThickness,
    gapSize,
    whdState,
  });
  group = result.group;
  clones.groupClone1 = result.groupClone1;
  clones.groupClone2 = result.groupClone2;
  clones.groupClone3 = result.groupClone3;
  clones.groupClone4 = result.groupClone4;
  clones.groupClone5 = result.groupClone5;

  // Collect blocks with numbers
  blocksWithNumbers = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.userData.numberMesh) {
      blocksWithNumbers.push(child);
    }
  });

  // Apply initial visibility
  if (clones.groupClone1) clones.groupClone1.visible = cloneVisibilityState.groupClone1;
  if (clones.groupClone2) clones.groupClone2.visible = cloneVisibilityState.groupClone2;
  if (clones.groupClone3) clones.groupClone3.visible = cloneVisibilityState.groupClone3;
  if (clones.groupClone4) clones.groupClone4.visible = cloneVisibilityState.groupClone4;
  if (clones.groupClone5) clones.groupClone5.visible = cloneVisibilityState.groupClone5;

  // Load saved positions/rotations for all clones
  loadAllClonesState(clones);

  // If the manager has been initialized, tell it to switch/sync with the current selection
  if (positionRotationManager) {
    positionRotationManager.switchClone(cloneSelectorState.selectedCloneIndex, true);
  }
  // Update reports
  reportState.whdDimensionsSum = getWHDDimensionsSum(whdState);
  Object.assign(reportState, getWHDDimensions(whdState));

  scene.add(new THREE.AxesHelper(20));
}

// Initial scene creation
// recreateSceneWrapper();

const controls = new OrbitControls(camera, renderer.domElement);

// Load camera state if available
loadCameraState(camera, controls);
cameraSettings.zoom = camera.zoom;

controls.addEventListener("change", () => {
  saveCameraState(camera, controls);
  // Sync zoom for Orthographic camera
  if (camera.isOrthographicCamera) {
    cameraSettings.zoom = camera.zoom;
  }
});

// Helper to set visibility for all clones (bound to local clones and state)
const setAllClonesVisibilityBound = (visible) => setAllClonesVisibility(clones, cloneVisibilityState, visible);

// Initialize config state
configState.dimensionState = dimensionState;
configState.whdState = whdState;
configState.blockRenderState = blockRenderState;
configState.recreateScene = recreateSceneWrapper;
configState.saveDimensionState = saveDimensionState;
configState.saveWHDState = saveWHDState;
configState.saveBlockRenderState = saveBlockRenderState;

// Initialize GUI
const guiResult = setupGUI({
  dimensionState,
  whdState,
  blockRenderState,
  cloneVisibilityState,
  recreateScene: recreateSceneWrapper,
  setAllClonesVisibility: setAllClonesVisibilityBound,
  camera,
  controls,
  clones,
  viewState,
  saveViewState,
  VIEW_MODES,
  reportState,
  configState,
  cameraSettings,
  saveCameraSettings,
  views,
});

const { gui, folders, manager, commandContext } = guiResult;
positionRotationManager = manager;

// Initialize Keyboard Handlers
setupKeyboardHandlers({
  clones,
  cloneVisibilityState,
  blockRenderState,
  viewState,
  dimensionState,
  whdState,
  recreateSceneWrapper,
  folders,
  commandContext
});

async function init() {
  await loadFont();
  if (renderer.init) {
    await renderer.init();
    console.log("WebGPU initialized");
  } else {
    console.log("Renderer initialized (SVG or WebGL fallback)");
  }


  // Re-run scene creation after font is loaded to ensure numbers are created
  recreateSceneWrapper();
  configState.syncFolders?.();

  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    renderer.setSize(width, height);

    if (camera.isPerspectiveCamera) {
      camera.aspect = aspect;
    } else {
      const frustumSize = cameraSettings.frustumSize;
      camera.left = -frustumSize * aspect / 2;
      camera.right = frustumSize * aspect / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
    }
    camera.updateProjectionMatrix();
  });

  function animate() {
    controls.update();

    if (viewState.mode === VIEW_MODES.SINGLE || viewState.rendererType === RENDERER_TYPES.SVG) {
      updateBlockNumbers(blocksWithNumbers, camera);
      if (renderer.setViewport) {
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
      }
      if (renderer.setScissorTest) {
        renderer.setScissorTest(false);
      }
      renderer.render(scene, camera);
    } else {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      for (let i = 0; i < views.length; i++) {
        const view = views[i];
        const viewCamera = view.camera;

        updateBlockNumbers(blocksWithNumbers, viewCamera);

        const left = Math.floor(windowWidth * view.left);
        const bottom = Math.floor(windowHeight * view.bottom);
        const width = Math.floor(windowWidth * view.width);
        const height = Math.floor(windowHeight * view.height);

        if (renderer.setViewport) renderer.setViewport(left, bottom, width, height);
        if (renderer.setScissor) renderer.setScissor(left, bottom, width, height);
        if (renderer.setScissorTest) renderer.setScissorTest(true);
        if (renderer.setClearColor) renderer.setClearColor(view.background);

        if (viewCamera.isPerspectiveCamera) {
          viewCamera.aspect = width / height;
        } else {
          const aspect = width / height;
          const frustumSize = cameraSettings.frustumSize;
          viewCamera.left = -frustumSize * aspect / 2;
          viewCamera.right = frustumSize * aspect / 2;
          viewCamera.top = frustumSize / 2;
          viewCamera.bottom = -frustumSize / 2;
        }
        viewCamera.updateProjectionMatrix();

        renderer.render(scene, viewCamera);
      }
    }


    requestAnimationFrame(animate);
  }
  animate();
}

init();


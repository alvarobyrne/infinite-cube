import GUI from "lil-gui";
import { saveDimensionState, clearDimensionState } from "./dimensionState.js";
import { clearCameraState, loadCameraState } from "./cameraState.js";
import { clearUIState, loadUIState, saveUIState } from "./uiState.js";
import { positionAndRotationManager } from "./object3DState.js";

/**
 * Setup GUI and return folder references
 * @param {Object} params - Parameters object
 * @param {Object} params.dimensionState - Dimension state object
 * @param {Object} params.blockRenderState - Block render state object
 * @param {Function} params.recreateScene - Function to recreate the scene
 * @param {THREE.Camera} params.camera - Camera object
 * @param {Object} params.controls - OrbitControls object
 * @param {THREE.Object3D} params.groupClone5 - Reference to groupClone5 for position/rotation manager
 * @returns {Object} Object containing gui instance and all folders
 */
export function setupGUI({ dimensionState, blockRenderState, recreateScene, camera, controls, groupClone5 }) {
  const gui = new GUI();

  // Reload page control (outside folders, at the top)
  gui.add({ reload: () => {
    location.reload();
  }}, "reload").name("Reload Page");

  // Dimensions folder
  const dimensionsFolder = gui.addFolder("Dimensions");
  dimensionsFolder.add(dimensionState, "dimension1", 1, 20, 0.1).name('dimension 1, r').onChange(() => {
    saveDimensionState(dimensionState);
    recreateScene();
  });
  dimensionsFolder.add(dimensionState, "dimension2", 1, 20, 0.1).name('dimension 2, g').onChange(() => {
    saveDimensionState(dimensionState);
    recreateScene();
  });
  dimensionsFolder.add(dimensionState, "dimension3", 1, 20, 0.1).name('dimension 3, b').onChange(() => {
    saveDimensionState(dimensionState);
    recreateScene();
  });

  // Block Rendering folder
  const blockRenderingFolder = gui.addFolder("Block Rendering");
  blockRenderingFolder.add(blockRenderState, "style", ["singleColor", "coloredFaces", "unifiedColor"]).name("Block Style").onChange(() => {
    recreateScene();
  });
  blockRenderingFolder.addColor(blockRenderState, "unifiedColor").name("Unified Color").onChange(() => {
    if (blockRenderState.style === "unifiedColor") {
      recreateScene();
    }
  });

  // Clone Colors folder
  const cloneColorsFolder = gui.addFolder("Clone Colors");
  cloneColorsFolder.add(blockRenderState, "useCloneColors").name("Use Clone Colors").onChange(() => {
    if (blockRenderState.style === "unifiedColor") {
      recreateScene();
    }
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor1").name("Clone 1 Color").onChange(() => {
    if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
      recreateScene();
    }
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor2").name("Clone 2 Color").onChange(() => {
    if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
      recreateScene();
    }
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor3").name("Clone 3 Color").onChange(() => {
    if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
      recreateScene();
    }
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor4").name("Clone 4 Color").onChange(() => {
    if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
      recreateScene();
    }
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor5").name("Clone 5 Color").onChange(() => {
    if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
      recreateScene();
    }
  });

  // Actions folder
  const actionsFolder = gui.addFolder("Actions");
  actionsFolder.add({ clearCamera: () => {
    clearCameraState();
    loadCameraState(camera, controls);
  }}, "clearCamera").name("Clear Camera State");
  actionsFolder.add({ clearDimensions: () => {
    clearDimensionState();
    location.reload();
  }}, "clearDimensions").name("Clear Dimension State");
  actionsFolder.add({ clearUI: () => {
    clearUIState();
    location.reload();
  }}, "clearUI").name("Clear UI State");

  const object3DPositionRotationFolder = positionAndRotationManager(groupClone5, gui);

  // Collect all folders for UI state management
  const folders = {
    dimensions: dimensionsFolder,
    blockRendering: blockRenderingFolder,
    cloneColors: cloneColorsFolder,
    actions: actionsFolder,
    object3DPositionRotation: object3DPositionRotationFolder,
  };

  // Load UI state (folder open/closed states)
  loadUIState(folders);

  // Save UI state before page unload
  window.addEventListener("beforeunload", () => {
    saveUIState(folders);
  });

  return {
    gui,
    folders
  };
}


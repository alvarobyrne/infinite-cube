import GUI from "lil-gui";
import { saveDimensionState, clearDimensionState } from "./dimensionState.js";
import { saveWHDState, clearWHDState } from "./width_height_depth/whdState.js";
import { clearCameraState } from "./cameraState.js";
import { clearUIState, loadUIState, saveUIState } from "./uiState.js";
import { positionAndRotationManager } from "./object3DState.js";
import { saveBlockRenderState, clearBlockRenderState, BLOCK_STYLES } from "./blockRenderState.js";
import { saveCloneVisibilityState, clearCloneVisibilityState } from "./cloneVisibilityState.js";
import { cloneSelectorState, saveCloneSelectorState, clearCloneSelectorState } from "./cloneSelectorState.js";


/**
 * Setup GUI and return folder references
 * @param {Object} params - Parameters object
 * @param {Object} params.dimensionState - Dimension state object
 * @param {Object} params.blockRenderState - Block render state object
 * @param {Object} params.cloneVisibilityState - Clone visibility state object
 * @param {Function} params.recreateScene - Function to recreate the scene
 * @param {THREE.Camera} params.camera - Camera object
 * @param {Object} params.controls - OrbitControls object
 * @param {Object} params.clones - Object containing all clones (groupClone1-5)
 * @param {Object} params.viewState - View state object
 * @param {Function} params.saveViewState - Function to save view state
 * @param {Object} params.VIEW_MODES - View modes constants
 * @returns {Object} Object containing gui instance and all folders
 */
export function setupGUI({ dimensionState, whdState, blockRenderState, cloneVisibilityState, recreateScene, setAllClonesVisibility, camera, controls, clones, viewState, saveViewState, VIEW_MODES }) {
  const gui = new GUI();

  // Reload page control (outside folders, at the top)
  gui.add({
    reload: () => {
      location.reload();
    }
  }, "reload").name("Reload Page");

  // View Mode selector
  gui.add(viewState, "mode", Object.values(VIEW_MODES)).name("View Mode").onChange(() => {
    saveViewState(viewState);
    location.reload(); // Reload to re-initialize cameras and render loop
  });

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
  dimensionsFolder.add(dimensionState, "blockThickness", 0.1, 10, 0.1).name('Block Thickness').onChange(() => {
    saveDimensionState(dimensionState);
    recreateScene();
  });

  // WHD (Width, Height, Depth) folder
  const whdFolder = gui.addFolder("Width, Height, Depth (WHD)");
  whdFolder.add(whdState, "width", 1, 30, 0.1).name('Width').onChange(() => {
    saveWHDState(whdState);
    // recreateScene(); // Not using it yet as requested
  });
  whdFolder.add(whdState, "height", 1, 30, 0.1).name('Height').onChange(() => {
    saveWHDState(whdState);
    // recreateScene();
  });
  whdFolder.add(whdState, "depth", 1, 30, 0.1).name('Depth').onChange(() => {
    saveWHDState(whdState);
    // recreateScene();
  });
  whdFolder.add(whdState, "blockThickness", 0.1, 10, 0.1).name('Block Thickness').onChange(() => {
    saveWHDState(whdState);
    // recreateScene();
  });

  // Block Rendering folder
  const blockRenderingFolder = gui.addFolder("Block Rendering");
  blockRenderingFolder.add(blockRenderState, "style", BLOCK_STYLES).name("Block Style").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  }).listen();
  blockRenderingFolder.addColor(blockRenderState, "unifiedColor").name("Unified Color").onChange(() => {
    saveBlockRenderState(blockRenderState);
    if (blockRenderState.style === "unifiedColor") {
      recreateScene();
    }
  });
  blockRenderingFolder.add(blockRenderState, "showDimensionLines").name("Show Dimension Lines").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "showVertices").name("Show Vertices").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });

  // Clone Colors folder
  const cloneColorsFolder = gui.addFolder("Clone Colors");
  cloneColorsFolder.add(blockRenderState, "useCloneColors").name("Use Clone Colors").onChange(() => {
    saveBlockRenderState(blockRenderState);
    if (blockRenderState.style === "unifiedColor") {
      recreateScene();
    }
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor1").name("Clone 1 Color").onChange(() => {
    saveBlockRenderState(blockRenderState);
    if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
      recreateScene();
    }
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor2").name("Clone 2 Color").onChange(() => {
    saveBlockRenderState(blockRenderState);
    if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
      recreateScene();
    }
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor3").name("Clone 3 Color").onChange(() => {
    saveBlockRenderState(blockRenderState);
    if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
      recreateScene();
    }
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor4").name("Clone 4 Color").onChange(() => {
    saveBlockRenderState(blockRenderState);
    if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
      recreateScene();
    }
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor5").name("Clone 5 Color").onChange(() => {
    saveBlockRenderState(blockRenderState);
    if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
      recreateScene();
    }
  });

  // Multi-Color Palette folder
  const multiColorFolder = gui.addFolder("Multi-Color Palette");
  const updateMultiColor = () => {
    saveBlockRenderState(blockRenderState);
    if (["multiColorPlanes", "multiColorBox", "granularColor"].includes(blockRenderState.style)) {
      recreateScene();
    }
  };
  multiColorFolder.addColor(blockRenderState, "multiColor1").name("Color 1").onChange(updateMultiColor);
  multiColorFolder.addColor(blockRenderState, "multiColor2").name("Color 2").onChange(updateMultiColor);
  multiColorFolder.addColor(blockRenderState, "multiColor3").name("Color 3").onChange(updateMultiColor);
  multiColorFolder.addColor(blockRenderState, "multiColor4").name("Color 4").onChange(updateMultiColor);

  // Clone Visibility folder
  const visibilityFolder = gui.addFolder("Clone Visibility");
  visibilityFolder.add(cloneVisibilityState, "groupClone1").name("Clone 1").onChange((vis) => {
    clones.groupClone1.visible = vis;
    saveCloneVisibilityState(cloneVisibilityState);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone2").name("Clone 2").onChange((vis) => {
    clones.groupClone2.visible = vis;
    saveCloneVisibilityState(cloneVisibilityState);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone3").name("Clone 3").onChange((vis) => {
    clones.groupClone3.visible = vis;
    saveCloneVisibilityState(cloneVisibilityState);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone4").name("Clone 4").onChange((vis) => {
    clones.groupClone4.visible = vis;
    saveCloneVisibilityState(cloneVisibilityState);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone5").name("Clone 5").onChange((vis) => {
    clones.groupClone5.visible = vis;
    saveCloneVisibilityState(cloneVisibilityState);
  }).listen();

  visibilityFolder.add({
    showAll: () => setAllClonesVisibility(true)
  }, "showAll").name("Show All Clones (A)");
  visibilityFolder.add({
    hideAll: () => setAllClonesVisibility(false)
  }, "hideAll").name("Hide All Clones (H)");

  // Actions folder
  const actionsFolder = gui.addFolder("Actions");
  actionsFolder.add({
    clearCamera: () => {
      clearCameraState();
      //loadCameraState(camera, controls);
      location.reload();
    }
  }, "clearCamera").name("Clear Camera State");
  actionsFolder.add({
    clearDimensions: () => {
      clearDimensionState();
      location.reload();
    }
  }, "clearDimensions").name("Clear Dimension State");
  actionsFolder.add({
    clearBlockRender: () => {
      clearBlockRenderState();
      location.reload();
    }
  }, "clearBlockRender").name("Clear Block Render State");
  actionsFolder.add({
    clearCloneVisibility: () => {
      clearCloneVisibilityState();
      location.reload();
    }
  }, "clearCloneVisibility").name("Clear Clone Visibility State");
  actionsFolder.add({
    clearUI: () => {
      clearUIState();
      location.reload();
    }
  }, "clearUI").name("Clear UI State");
  actionsFolder.add({
    clearCloneSelector: () => {
      clearCloneSelectorState();
      location.reload();
    }
  }, "clearCloneSelector").name("Clear Clone Selector State");
  actionsFolder.add({
    clearWHD: () => {
      clearWHDState();
      location.reload();
    }
  }, "clearWHD").name("Clear WHD State");

  actionsFolder.add({
    clearView: () => {
      localStorage.removeItem("viewState");
      location.reload();
    }
  }, "clearView").name("Clear View State");

  // Position and rotation manager (returns folder and switch function)
  const positionRotationManager = positionAndRotationManager(clones, cloneSelectorState, gui);

  // Clone Selector folder
  const cloneSelectorFolder = gui.addFolder("Clone Selector");
  cloneSelectorFolder.add(cloneSelectorState, "selectedCloneIndex", [1, 2, 3, 4, 5])
    .name("Selected Clone")
    .onChange(() => {
      saveCloneSelectorState(cloneSelectorState);
      positionRotationManager.switchClone(cloneSelectorState.selectedCloneIndex);
    });

  // Collect all folders for UI state management
  const folders = {
    dimensions: dimensionsFolder,
    blockRendering: blockRenderingFolder,
    cloneColors: cloneColorsFolder,
    multiColorPalette: multiColorFolder,
    visibility: visibilityFolder,
    actions: actionsFolder,
    cloneSelector: cloneSelectorFolder,
    whd: whdFolder,
    object3DPositionRotation: positionRotationManager.folder,
  };

  // Load UI state (folder open/closed states)
  loadUIState(folders);

  // Save UI state before page unload
  window.addEventListener("beforeunload", () => {
    saveUIState(folders);
  });

  return {
    gui,
    folders,
    manager: positionRotationManager
  };
}


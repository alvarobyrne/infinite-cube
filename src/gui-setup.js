import GUI from "lil-gui";
import { configState } from "./configState.js";
import { saveDimensionState, clearDimensionState } from "./dimensionState.js";
import { saveWHDState, clearWHDState } from "./width_height_depth/whdState.js";
import { clearCameraState, CAMERA_TYPES, getSavedCameraType, saveCameraState } from "./cameraState.js";
import { clearUIState, loadUIState, saveUIState } from "./uiState.js";
import { positionAndRotationManager } from "./object3DState.js";
import { saveBlockRenderState, clearBlockRenderState, BLOCK_STYLES } from "./blockRenderState.js";
import { saveCloneVisibilityState, clearCloneVisibilityState } from "./cloneVisibilityState.js";
import { cloneSelectorState, saveCloneSelectorState, clearCloneSelectorState } from "./cloneSelectorState.js";
import { instructionsState } from "./instructions-manager.js";
import { STRATEGY_TYPES, activeStrategyType } from "./scene-decorators.js";
import { setItem, removeItem, getItem } from "./storage-manager.js";



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
export function setupGUI({ dimensionState, whdState, blockRenderState, cloneVisibilityState, recreateScene, setAllClonesVisibility, camera, controls, clones, viewState, saveViewState, VIEW_MODES, reportState, configState }) {
  const gui = new GUI();

  // Reload page control (outside folders, at the top)
  gui.add({
    reload: () => {
      location.reload();
    }
  }, "reload").name("Reload Page");

  // Instructions checkbox at the beginning
  gui.add(instructionsState, "visible").name("Show Instructions (H)").onChange(() => {
    const readmeContainer = document.getElementById("readme-container");
    if (readmeContainer) {
      readmeContainer.style.display = instructionsState.visible ? "block" : "none";
    }
    setItem("instructionsVisible", instructionsState.visible);
  }).listen();

  // View Mode selector
  gui.add(viewState, "mode", Object.values(VIEW_MODES)).name("View Mode").onChange(() => {
    saveViewState(viewState);
    location.reload(); // Reload to re-initialize cameras and render loop
  });

  // Dimensions folder
  const dimensionsFolder = gui.addFolder("Dimensions");
  dimensionsFolder.add(dimensionState, "dimension1", 1, 40, 0.1).name('dimension 1, r').onChange(() => {
    saveDimensionState(dimensionState);
    recreateScene();
  });
  dimensionsFolder.add(dimensionState, "dimension2", 1, 40, 0.1).name('dimension 2, g').onChange(() => {
    saveDimensionState(dimensionState);
    recreateScene();
  });
  dimensionsFolder.add(dimensionState, "dimension3", 1, 40, 0.1).name('dimension 3, b').onChange(() => {
    saveDimensionState(dimensionState);
    recreateScene();
  });
  dimensionsFolder.add(dimensionState, "blockThickness", 0.1, 10, 0.1).name('Block Thickness').onChange(() => {
    saveDimensionState(dimensionState);
    recreateScene();
  });

  // WHD (Width, Height, Depth) folder
  const whdFolder = gui.addFolder("Width, Height, Depth (WHD)");
  whdFolder.add(whdState, "width", 1, 40, 0.1).name('Width').onChange(() => {
    saveWHDState(whdState);
    recreateScene();
  });
  whdFolder.add(whdState, "height", 1, 40, 0.1).name('Height').onChange(() => {
    saveWHDState(whdState);
    recreateScene();
  });
  whdFolder.add(whdState, "depth", 1, 40, 0.1).name('Depth').onChange(() => {
    saveWHDState(whdState);
    recreateScene();
  });
  whdFolder.add(whdState, "blockThickness", 0.1, 10, 0.1).name('Block Thickness').onChange(() => {
    saveWHDState(whdState);
    recreateScene();
  });
  whdFolder.add(whdState, "gap", 0.1, 5, 0.1).name('Gap').onChange(() => {
    saveWHDState(whdState);
    recreateScene();
  });

  // Block Rendering folder
  const syncFolders = () => {
    if (activeStrategyType === STRATEGY_TYPES.WHD_BASE || activeStrategyType === STRATEGY_TYPES.NODES_BASE) {
      dimensionsFolder.hide();
      whdFolder.show();
      reportsFolder.show();
      visibilityFolder.hide();
    } else {
      reportsFolder.hide();
      visibilityFolder.show();
      dimensionsFolder.show();
      whdFolder.hide();
    }
  };

  configState.syncFolders = syncFolders;

  const refreshGUI = () => {
    const iterateFolders = (f) => {
      f.controllers.forEach(c => c.updateDisplay());
      Object.values(f.folders).forEach(iterateFolders);
    };
    iterateFolders(gui);
  };

  configState.refreshGUI = refreshGUI;

  // Block Rendering folder
  const blockRenderingFolder = gui.addFolder("Block Rendering");
  blockRenderingFolder.add(blockRenderState, "style", BLOCK_STYLES).name("Block Style").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
    syncFolders();
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
  blockRenderingFolder.add(blockRenderState, "showTopDimensionLines").name("Show Top Dimension Lines").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "showRightDimensionLines").name("Show Right Dimension Lines").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "showFrontDimensionLines").name("Show Front Dimension Lines").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "showExtraDimensionLines").name("Show Extra Dimension Lines").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "showGSGroup").name("Show gaps Group").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "showVertices").name("Show Vertices").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "isOpaque").name("Is Opaque").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  }).listen();

  blockRenderingFolder.add(blockRenderState, "showXYPlaneSquare").name("Show XY Plane Square").onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "scale", 0.1, 10, 0.1).name('Scale').onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "x", -10, 10, 0.1).name('X').onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "y", -10, 10, 0.1).name('Y').onChange(() => {
    saveBlockRenderState(blockRenderState);
    recreateScene();
  });
  blockRenderingFolder.add(blockRenderState, "z", -10, 10, 0.1).name('Z').onChange(() => {
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

  // Camera Settings folder
  const cameraSettingsFolder = gui.addFolder("Camera Settings");
  const cameraStateProxy = {
    type: getSavedCameraType(),
  };
  cameraSettingsFolder.add(cameraStateProxy, "type", Object.values(CAMERA_TYPES)).name("Camera Type").onChange(() => {
    const state = getItem("cameraState") || {};
    state.type = cameraStateProxy.type;
    setItem("cameraState", state);
    location.reload();
  });

  // Multi-Color Palette folder
  const multiColorFolder = gui.addFolder("Multi-Color Palette");
  const updateMultiColor = () => {
    saveBlockRenderState(blockRenderState);
    if (["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(blockRenderState.style)) {
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
    if (clones.groupClone1) clones.groupClone1.visible = vis;
    saveCloneVisibilityState(cloneVisibilityState);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone2").name("Clone 2").onChange((vis) => {
    if (clones.groupClone2) clones.groupClone2.visible = vis;
    saveCloneVisibilityState(cloneVisibilityState);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone3").name("Clone 3").onChange((vis) => {
    if (clones.groupClone3) clones.groupClone3.visible = vis;
    saveCloneVisibilityState(cloneVisibilityState);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone4").name("Clone 4").onChange((vis) => {
    if (clones.groupClone4) clones.groupClone4.visible = vis;
    saveCloneVisibilityState(cloneVisibilityState);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone5").name("Clone 5").onChange((vis) => {
    if (clones.groupClone5) clones.groupClone5.visible = vis;
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
      removeItem("viewState");
      location.reload();
    }
  }, "clearView").name("Clear View State");

  // Reports folder
  const reportsFolder = gui.addFolder("Reports");
  reportsFolder.add(reportState, "whdDimensionsSum").name("WHD Dimensions Sum").disable().listen();
  reportsFolder.add(reportState, "reducedWidth").name("Reduced Width").disable().listen();
  reportsFolder.add(reportState, "w_prime").name("W' (Width Prime)").disable().listen();
  reportsFolder.add(reportState, "reducedHeight").name("Reduced Height").disable().listen();
  reportsFolder.add(reportState, "h_prime").name("H' (Height Prime)").disable().listen();
  reportsFolder.add(reportState, "reducedDepth").name("Reduced Depth").disable().listen();
  reportsFolder.add(reportState, "d_prime").name("D' (Depth Prime)").disable().listen();

  // Saved Configurations folder
  const configsFolder = gui.addFolder("Saved Configurations");
  const configControls = {
    name: configsFolder.add(configState, "name").name("Config Name").listen(),
    selector: configsFolder.add(configState, "selectedConfig", Object.keys(configState.savedConfigs)).name("Saved Configs").listen(),
    save: configsFolder.add(configState, "save").name("Save New Config"),
    update: configsFolder.add(configState, "update").name("Update Current"),
    load: configsFolder.add(configState, "load").name("Load Selected"),
    delete: configsFolder.add(configState, "delete").name("Delete Selected"),
  };

  const updateConfigsDropdown = () => {
    const keys = Object.keys(configState.savedConfigs);
    configControls.selector.options(keys);
  };

  // Wrap save/delete to update dropdown
  const originalSave = configState.save;
  configState.save = () => {
    originalSave();
    updateConfigsDropdown();
  };
  const originalDelete = configState.delete;
  configState.delete = () => {
    originalDelete();
    updateConfigsDropdown();
  };

  // Position and rotation manager (returns folder and switch function)
  const positionRotationManager = positionAndRotationManager(clones, cloneSelectorState, gui);

  // Clone Selector folder - only visible in development
  const cloneSelectorFolder = gui.addFolder("Clone Selector");
  if (import.meta.env.PROD) {
    cloneSelectorFolder.hide();
  }
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
    reports: reportsFolder,
    savedConfigs: configsFolder,
    cameraSettings: cameraSettingsFolder,
    gui: gui
  };

  // Load UI state (folder open/closed states)
  loadUIState(folders);

  // Sync folder visibility based on the current strategy's instance type
  syncFolders();

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

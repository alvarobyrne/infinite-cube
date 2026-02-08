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
import { STRATEGY_TYPES, activeStrategyType, onStrategyTypeChange } from "./scene-decorators.js";
import { setItem, removeItem, getItem } from "./storage-manager.js";
import { RENDERER_TYPES } from "./viewState.js";
import { themeManager } from "./theme-manager.js";
import { commandRegistry } from "./commands/CommandRegistry.js";
import { CommandFactory } from "./commands/CommandFactory.js";


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
export function setupGUI({ dimensionState, whdState, blockRenderState, cloneVisibilityState, recreateScene, setAllClonesVisibility, camera, controls, clones, viewState, saveViewState, VIEW_MODES, reportState, configState, cameraSettings, saveCameraSettings, views }) {
  const gui = new GUI();

  // Initialize command registry with context
  const commandContext = {
    dimensionState,
    whdState,
    blockRenderState,
    cloneVisibilityState,
    cloneSelectorState,
    viewState,
    cameraSettings,
    saveDimensionState,
    saveWHDState,
    saveBlockRenderState,
    saveCloneVisibilityState,
    saveCloneSelectorState,
    saveViewState,
    saveCameraSettings,
    recreateScene,
    syncFolders: null, // Will be set later
    themeManager,
    getItem,
    setItem,
    instructionsState,
    clones,
    positionRotationManager: null, // Will be set later
    // Controller references for UI updates
    whdWidthController: null,
    whdHeightController: null,
    whdDepthController: null,
    whdBlockThicknessController: null,
    whdGapController: null,
    updateCameraProjection: null // Will be set later
  };

  commandRegistry.initializeWithContext(commandContext);

  // Reload page control (outside folders, at the top)
  gui.add({
    reload: () => {
      location.reload();
    }
  }, "reload").name("Reload Page");

  // Instructions checkbox at the beginning
  gui.add(instructionsState, "visible").name("Show Instructions (H)").onChange((value) => {
    CommandFactory.executeCommand('visible', { ...commandContext, state: instructionsState }, value);
  }).listen();

  // View Mode selector
  gui.add(viewState, "mode", Object.values(VIEW_MODES)).name("View Mode").onChange((value) => {
    CommandFactory.executeCommand('mode', { ...commandContext, state: viewState }, value);
  });

  // Renderer Type selector
  gui.add(viewState, "rendererType", Object.values(RENDERER_TYPES)).name("Renderer").onChange((value) => {
    CommandFactory.executeCommand('rendererType', { ...commandContext, state: viewState }, value);
  });

  // Theme Settings folder
  const themeSettingsFolder = gui.addFolder("Theme Settings");

  // 1. Sync themeManager with saved viewState
  if (viewState.theme && viewState.theme !== themeManager.currentTheme) {
    themeManager.setTheme(viewState.theme);
  } else {
    // Ensure default viewState matches current theme if not set (though viewState init handles default)
    themeManager.setTheme(themeManager.currentTheme);
  }

  // 2. Sync transparency
  if (viewState.transparentUI !== undefined) {
    themeManager.setTransparency(viewState.transparentUI);
  } else {
    // Initialize viewState if undefined
    viewState.transparentUI = themeManager.isTransparent;
  }

  themeSettingsFolder.add(viewState, "theme", Object.keys(themeManager.themes))
    .name("Theme")
    .onChange((value) => {
      CommandFactory.executeCommand('theme', { ...commandContext, state: viewState }, value);
    }).listen();

  themeSettingsFolder.add(viewState, "transparentUI")
    .name("Transparent GUI")
    .onChange((value) => {
      CommandFactory.executeCommand('transparentUI', { ...commandContext, state: viewState }, value);
    });


  // Dimensions folder
  const dimensionsFolder = gui.addFolder("Dimensions");
  dimensionsFolder.add(dimensionState, "dimension1", 1, 40, 0.1).name('dimension 1, r').onChange((value) => {
    CommandFactory.executeCommand('dimension1', { ...commandContext, state: dimensionState }, value);
  });
  dimensionsFolder.add(dimensionState, "dimension2", 1, 40, 0.1).name('dimension 2, g').onChange((value) => {
    CommandFactory.executeCommand('dimension2', { ...commandContext, state: dimensionState }, value);
  });
  dimensionsFolder.add(dimensionState, "dimension3", 1, 40, 0.1).name('dimension 3, b').onChange((value) => {
    CommandFactory.executeCommand('dimension3', { ...commandContext, state: dimensionState }, value);
  });
  dimensionsFolder.add(dimensionState, "blockThickness", 0.1, 10, 0.1).name('Block Thickness').onChange((value) => {
    CommandFactory.executeCommand('blockThickness', { ...commandContext, state: dimensionState }, value);
  });

  // WHD (Width, Height, Depth) folder
  const whdFolder = gui.addFolder("Width, Height, Depth (WHD)");
  const { blockThickness } = whdState;
  const t2 = 2 * blockThickness;
  const whdWidthController = whdFolder.add(whdState, "width", t2, 40, 0.1).name('Width').onChange((value) => {
    CommandFactory.executeCommand('width', { ...commandContext, state: whdState }, value);
  });
  const whdHeightController = whdFolder.add(whdState, "height", t2, 40, 0.1).name('Height').onChange((value) => {
    CommandFactory.executeCommand('height', { ...commandContext, state: whdState }, value);
  });
  const whdDepthController = whdFolder.add(whdState, "depth", t2, 40, 0.1).name('Depth').onChange((value) => {
    CommandFactory.executeCommand('depth', { ...commandContext, state: whdState }, value);
  });

  // Update command context with WHD controllers
  commandContext.whdWidthController = whdWidthController;
  commandContext.whdHeightController = whdHeightController;
  commandContext.whdDepthController = whdDepthController;

  const whdBlockThicknessController = whdFolder.add(whdState, "blockThickness", 0.1, whdState.gap, 0.1).name('Block Thickness').onChange((value) => {
    CommandFactory.executeCommand('whdBlockThickness', { ...commandContext, state: whdState }, value);
  });
  const whdGapController = whdFolder.add(whdState, "gap", whdState.blockThickness, 5, 0.1).name('Gap').onChange((value) => {
    CommandFactory.executeCommand('gap', { ...commandContext, state: whdState }, value);
  });

  // Update command context with remaining WHD controllers
  commandContext.whdBlockThicknessController = whdBlockThicknessController;
  commandContext.whdGapController = whdGapController;

  // Block Rendering folder
  const syncFolders = () => {
    // TODO: This shouldn't be done with an if statement, but rather with a more object-oriented approach
    if (activeStrategyType === STRATEGY_TYPES.WHD_BASE || activeStrategyType === STRATEGY_TYPES.NODES_BASE) {
      dimensionsFolder.hide();
      whdFolder.show();
      reportsFolder.show();
      visibilityFolder.hide();
      whdDimensionLinesFolder.show();
    } else {
      reportsFolder.hide();
      visibilityFolder.show();
      dimensionsFolder.show();
      whdFolder.hide();
      whdDimensionLinesFolder.hide();
    }
  };

  // Listen for strategy type changes and sync folders immediately
  onStrategyTypeChange(syncFolders);

  configState.syncFolders = syncFolders;

  // Update command context with syncFolders
  commandContext.syncFolders = syncFolders;

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
  blockRenderingFolder.add(blockRenderState, "style", BLOCK_STYLES).name("Block Style").onChange((value) => {
    CommandFactory.executeCommand('style', { ...commandContext, state: blockRenderState }, value);
    console.log('value: ', value)
  }).listen();
  blockRenderingFolder.addColor(blockRenderState, "unifiedColor").name("Unified Color").onChange((value) => {
    CommandFactory.executeCommand('unifiedColor', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "showDimensionLines").name("Show Dimension Lines").onChange((value) => {
    CommandFactory.executeCommand('showDimensionLines', { ...commandContext, state: blockRenderState }, value);
  });

  const whdDimensionLinesFolder = blockRenderingFolder.addFolder("WHD Dimension Lines");
  whdDimensionLinesFolder.add(blockRenderState, "showTopDimensionLines").name("Show Top Dimension Lines").onChange((value) => {
    CommandFactory.executeCommand('showTopDimensionLines', { ...commandContext, state: blockRenderState }, value);
  });
  whdDimensionLinesFolder.add(blockRenderState, "showRightDimensionLines").name("Show Right Dimension Lines").onChange((value) => {
    CommandFactory.executeCommand('showRightDimensionLines', { ...commandContext, state: blockRenderState }, value);
  });
  whdDimensionLinesFolder.add(blockRenderState, "showFrontDimensionLines").name("Show Front Dimension Lines").onChange((value) => {
    CommandFactory.executeCommand('showFrontDimensionLines', { ...commandContext, state: blockRenderState }, value);
  });
  whdDimensionLinesFolder.add(blockRenderState, "showExtraDimensionLines").name("Show Extra Dimension Lines").onChange((value) => {
    CommandFactory.executeCommand('showExtraDimensionLines', { ...commandContext, state: blockRenderState }, value);
  });
  whdDimensionLinesFolder.add(blockRenderState, "showGSGroup").name("Show gaps Group").onChange((value) => {
    CommandFactory.executeCommand('showGSGroup', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "showVertices").name("Show Vertices").onChange((value) => {
    CommandFactory.executeCommand('showVertices', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "showNumbers").name("Show Block Numbers").onChange((value) => {
    CommandFactory.executeCommand('showNumbers', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "numberType", ["number", "largestDimension", "both"]).name("Number Type").onChange((value) => {
    CommandFactory.executeCommand('numberType', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "numberSize", 0.1, 5, 0.1).name("Number Size").onChange((value) => {
    CommandFactory.executeCommand('numberSize', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "isOpaque").name("Is Opaque").onChange((value) => {
    CommandFactory.executeCommand('isOpaque', { ...commandContext, state: blockRenderState }, value);
  }).listen();

  blockRenderingFolder.add(blockRenderState, "showXYPlaneSquare").name("Show XY Plane Square").onChange((value) => {
    CommandFactory.executeCommand('showXYPlaneSquare', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "showBox").name("Show Box").onChange((value) => {
    CommandFactory.executeCommand('showBox', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "scale", 0.1, 10, 0.1).name('Scale').onChange((value) => {
    CommandFactory.executeCommand('scale', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "x", -10, 10, 0.1).name('X').onChange((value) => {
    CommandFactory.executeCommand('x', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "y", -10, 10, 0.1).name('Y').onChange((value) => {
    CommandFactory.executeCommand('y', { ...commandContext, state: blockRenderState }, value);
  });
  blockRenderingFolder.add(blockRenderState, "z", -10, 10, 0.1).name('Z').onChange((value) => {
    CommandFactory.executeCommand('z', { ...commandContext, state: blockRenderState }, value);
  });

  // Clone Colors folder
  const cloneColorsFolder = gui.addFolder("Clone Colors");
  cloneColorsFolder.add(blockRenderState, "useCloneColors").name("Use Clone Colors").onChange((value) => {
    CommandFactory.executeCommand('useCloneColors', { ...commandContext, state: blockRenderState }, value);
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor1").name("Clone 1 Color").onChange((value) => {
    CommandFactory.executeCommand('cloneColor1', { ...commandContext, state: blockRenderState }, value);
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor2").name("Clone 2 Color").onChange((value) => {
    CommandFactory.executeCommand('cloneColor2', { ...commandContext, state: blockRenderState }, value);
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor3").name("Clone 3 Color").onChange((value) => {
    CommandFactory.executeCommand('cloneColor3', { ...commandContext, state: blockRenderState }, value);
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor4").name("Clone 4 Color").onChange((value) => {
    CommandFactory.executeCommand('cloneColor4', { ...commandContext, state: blockRenderState }, value);
  });
  cloneColorsFolder.addColor(blockRenderState, "cloneColor5").name("Clone 5 Color").onChange((value) => {
    CommandFactory.executeCommand('cloneColor5', { ...commandContext, state: blockRenderState }, value);
  });

  // Camera Settings folder
  const cameraSettingsFolder = gui.addFolder("Camera Settings");
  const cameraStateProxy = {
    type: getSavedCameraType(),
  };

  const updateCameraProjection = () => {
    saveCameraSettings(cameraSettings);
    const cameras = viewState.mode === VIEW_MODES.MULTI ? views.map(v => v.camera) : [camera];
    const aspect = window.innerWidth / window.innerHeight;

    cameras.forEach(cam => {
      if (!cam) return;
      cam.near = cameraSettings.near;
      cam.far = cameraSettings.far;
      cam.zoom = cameraSettings.zoom;

      if (cam.isPerspectiveCamera) {
        cam.fov = cameraSettings.fov;
      } else {
        const frustumSize = cameraSettings.frustumSize;
        cam.left = -frustumSize * aspect / 2;
        cam.right = frustumSize * aspect / 2;
        cam.top = frustumSize / 2;
        cam.bottom = -frustumSize / 2;
      }
      cam.updateProjectionMatrix();
    });
  };

  // Update command context with updateCameraProjection
  commandContext.updateCameraProjection = updateCameraProjection;

  // Update command context with cameraStateProxy
  commandContext.cameraStateProxy = cameraStateProxy;

  cameraSettingsFolder.add(cameraStateProxy, "type", Object.values(CAMERA_TYPES)).name("Camera Type").onChange((value) => {
    CommandFactory.executeCommand('type', { ...commandContext, state: cameraStateProxy }, value);
  });

  cameraSettingsFolder.add(cameraSettings, "fov", 1, 150).name("FOV (Perspective)").onChange((value) => {
    CommandFactory.executeCommand('fov', { ...commandContext, state: cameraSettings }, value);
  });
  cameraSettingsFolder.add(cameraSettings, "frustumSize", 1, 100).name("Frustum Size (Ortho)").onChange((value) => {
    CommandFactory.executeCommand('frustumSize', { ...commandContext, state: cameraSettings }, value);
  });
  cameraSettingsFolder.add(cameraSettings, "near", 0.001, 10).name("Near").onChange((value) => {
    CommandFactory.executeCommand('near', { ...commandContext, state: cameraSettings }, value);
  });
  cameraSettingsFolder.add(cameraSettings, "far", 10, 10000).name("Far").onChange((value) => {
    CommandFactory.executeCommand('far', { ...commandContext, state: cameraSettings }, value);
  });
  cameraSettingsFolder.add(cameraSettings, "zoom", 0.1, 10).name("Zoom").onChange((value) => {
    CommandFactory.executeCommand('zoom', { ...commandContext, state: cameraSettings }, value);
  }).listen();

  // Multi-Color Palette folder
  const multiColorFolder = gui.addFolder("Multi-Color Palette");
  multiColorFolder.addColor(blockRenderState, "multiColor1").name("Color 1").onChange((value) => {
    CommandFactory.executeCommand('multiColor1', { ...commandContext, state: blockRenderState }, value);
  });
  multiColorFolder.addColor(blockRenderState, "multiColor2").name("Color 2").onChange((value) => {
    CommandFactory.executeCommand('multiColor2', { ...commandContext, state: blockRenderState }, value);
  });
  multiColorFolder.addColor(blockRenderState, "multiColor3").name("Color 3").onChange((value) => {
    CommandFactory.executeCommand('multiColor3', { ...commandContext, state: blockRenderState }, value);
  });
  multiColorFolder.addColor(blockRenderState, "multiColor4").name("Color 4").onChange((value) => {
    CommandFactory.executeCommand('multiColor4', { ...commandContext, state: blockRenderState }, value);
  });

  // Clone Visibility folder
  const visibilityFolder = gui.addFolder("Clone Visibility");
  visibilityFolder.add(cloneVisibilityState, "groupClone1").name("Clone 1").onChange((vis) => {
    CommandFactory.executeCommand('groupClone1', { ...commandContext, state: cloneVisibilityState }, vis);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone2").name("Clone 2").onChange((vis) => {
    CommandFactory.executeCommand('groupClone2', { ...commandContext, state: cloneVisibilityState }, vis);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone3").name("Clone 3").onChange((vis) => {
    CommandFactory.executeCommand('groupClone3', { ...commandContext, state: cloneVisibilityState }, vis);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone4").name("Clone 4").onChange((vis) => {
    CommandFactory.executeCommand('groupClone4', { ...commandContext, state: cloneVisibilityState }, vis);
  }).listen();
  visibilityFolder.add(cloneVisibilityState, "groupClone5").name("Clone 5").onChange((vis) => {
    CommandFactory.executeCommand('groupClone5', { ...commandContext, state: cloneVisibilityState }, vis);
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
  reportsFolder.add(reportState, "whdDimensionsSum").name("WHD Dimensions Sum").disable().listen().decimals(2);
  reportsFolder.add(reportState, "reducedWidth").name("Reduced Width").disable().listen().decimals(2);
  reportsFolder.add(reportState, "w_prime").name("W' (Width Prime)").disable().listen().decimals(2);
  reportsFolder.add(reportState, "reducedHeight").name("Reduced Height").disable().listen().decimals(2);
  reportsFolder.add(reportState, "h_prime").name("H' (Height Prime)").disable().listen().decimals(2);
  reportsFolder.add(reportState, "reducedDepth").name("Reduced Depth").disable().listen().decimals(2);
  reportsFolder.add(reportState, "d_prime").name("D' (Depth Prime)").disable().listen().decimals(2);

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

  // Update command context with positionRotationManager
  commandContext.positionRotationManager = positionRotationManager;

  // Clone Selector folder - only visible in development
  const cloneSelectorFolder = gui.addFolder("Clone Selector");
  if (import.meta.env.PROD) {
    cloneSelectorFolder.hide();
  }
  cloneSelectorFolder.add(cloneSelectorState, "selectedCloneIndex", [1, 2, 3, 4, 5])
    .name("Selected Clone")
    .onChange((value) => {
      CommandFactory.executeCommand('selectedCloneIndex', { ...commandContext, state: cloneSelectorState }, value);
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
    whdDimensionLines: whdDimensionLinesFolder,
    object3DPositionRotation: positionRotationManager.folder,
    reports: reportsFolder,
    savedConfigs: configsFolder,
    cameraSettings: cameraSettingsFolder,
    themeSettings: themeSettingsFolder,
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
    manager: positionRotationManager,
    commandContext
  };
}

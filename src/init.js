import { migrateFromLegacyKeys } from "./storage-manager.js";
import { loadDimensionState } from "./state/dimensionState.js";
import { loadWHDState } from "./width_height_depth/whdState.js";
import { getWHDDimensionsSum, getWHDDimensions } from "./width_height_depth/whd-utils.js";
import { blockRenderState, loadBlockRenderState } from "./state/blockRenderState.js";
import { cloneVisibilityState, loadCloneVisibilityState } from "./state/cloneVisibilityState.js";
import { cloneSelectorState, loadCloneSelectorState } from "./state/cloneSelectorState.js";
import { viewState, loadViewState } from "./state/viewState.js";
import { loadCameraSettings } from "./state/cameraState.js";
import { loadAllConfigs } from "./state/configState.js";

/**
 * Initializes all state variables by loading them from storage or using defaults.
 * @returns {Object} An object containing the initialized states.
 */
export function initStates() {
    // Migrate legacy localStorage keys to the new namespaced object
    migrateFromLegacyKeys();

    // Load dimension state or use defaults
    const savedDimensionState = loadDimensionState();
    const dimensionState = {
        dimension1: savedDimensionState?.dimension1 || 14,
        dimension2: savedDimensionState?.dimension2 || 8,
        dimension3: savedDimensionState?.dimension3 || 10,
        blockThickness: savedDimensionState?.blockThickness || savedDimensionState?.transversalBlockSize || 2,
    };

    // Load WHD state or use defaults
    const savedWHDState = loadWHDState();
    const whdState = {
        width: savedWHDState?.width || 14,
        height: savedWHDState?.height || 8,
        depth: savedWHDState?.depth || 10,
        blockThickness: savedWHDState?.blockThickness || 2,
        lowerLimit: savedWHDState?.lowerLimit || null,
        gap: savedWHDState?.gap || 2.5,
    };
    if (!whdState.lowerLimit) {
        whdState.lowerLimit = whdState.gap + 2 * whdState.blockThickness;
    }

    // Initialize report state
    const reportState = {
        whdDimensionsSum: getWHDDimensionsSum(whdState),
        ...getWHDDimensions(whdState),
    };

    // Load block render state and update the exported object
    const savedBlockRenderState = loadBlockRenderState();
    if (savedBlockRenderState) {
        Object.assign(blockRenderState, savedBlockRenderState);
    }

    // Load clone visibility state and update the exported object
    const savedCloneVisibilityState = loadCloneVisibilityState();
    if (savedCloneVisibilityState) {
        Object.assign(cloneVisibilityState, savedCloneVisibilityState);
    }

    // Load clone selector state and update the exported object
    const savedCloneSelectorState = loadCloneSelectorState();
    if (savedCloneSelectorState) {
        Object.assign(cloneSelectorState, savedCloneSelectorState);
    }

    // Load view state and update the exported object
    const savedViewState = loadViewState();
    if (savedViewState) {
        Object.assign(viewState, savedViewState);
    }

    // Load camera settings
    const cameraSettings = loadCameraSettings();

    // Initialize config state
    loadAllConfigs();

    return {
        dimensionState,
        whdState,
        reportState,
        cameraSettings,
    };
}

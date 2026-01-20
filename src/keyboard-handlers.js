import { saveCloneVisibilityState } from "./cloneVisibilityState.js";
import { saveBlockRenderState, BLOCK_STYLES } from "./blockRenderState.js";
import { clearWHDState } from "./width_height_depth/whdState.js";
import { toggleInstructions } from "./instructions-manager.js";

/**
 * Helper to set visibility for all clones
 * @param {Object} clones - Object containing all clones
 * @param {Object} cloneVisibilityState - Current visibility state
 * @param {boolean} visible - Visibility value to set
 */
export function setAllClonesVisibility(clones, cloneVisibilityState, visible) {
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

/**
 * Setup keyboard handlers for the application
 * @param {Object} params - Parameters object
 * @param {Object} params.clones - Object containing all clones
 * @param {Object} params.cloneVisibilityState - Current visibility state
 * @param {Object} params.blockRenderState - Current block render state
 * @param {Function} params.recreateSceneWrapper - Function to recreate the scene
 * @param {Object} params.folders - GUI folders object
 */
export function setupKeyboardHandlers({
    clones,
    cloneVisibilityState,
    blockRenderState,
    recreateSceneWrapper,
    folders
}) {
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
            setAllClonesVisibility(clones, cloneVisibilityState, true);
        } else if (key === "s") {
            setAllClonesVisibility(clones, cloneVisibilityState, false);
        } else if (key === "q") {
            // Cycle block styles
            const currentIndex = BLOCK_STYLES.indexOf(blockRenderState.style);
            const direction = event.shiftKey ? -1 : 1;
            const nextIndex = (currentIndex + direction + BLOCK_STYLES.length) % BLOCK_STYLES.length;
            const nextStyle = BLOCK_STYLES[nextIndex];

            // Find the style controller in lil-gui and update it
            const styleController = folders.blockRendering.controllers.find(
                (c) => c._name === "Block Style"
            );

            if (styleController) {
                styleController.setValue(nextStyle);
                // setValue triggers the onChange handler, which handles save and scene recreation
            } else {
                // Fallback if controller not found
                blockRenderState.style = nextStyle;
                saveBlockRenderState(blockRenderState);
                recreateSceneWrapper();
            }
        } else if (key === "w") {
            clearWHDState();
            location.reload();
        } else if (key === "z") {
            // Find the isOpaque controller and toggle it
            const opaqueController = folders.blockRendering.controllers.find(
                (c) => c._name === "Is Opaque"
            );

            if (opaqueController) {
                opaqueController.setValue(!blockRenderState.isOpaque);
            } else {
                blockRenderState.isOpaque = !blockRenderState.isOpaque;
                saveBlockRenderState(blockRenderState);
                recreateSceneWrapper();
            }
        } else if (key === "h") {


            toggleInstructions();
        }
    });
}

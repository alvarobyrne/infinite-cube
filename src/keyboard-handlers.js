import { themeManager } from "./theme-manager.js";
import { saveCloneVisibilityState } from "./cloneVisibilityState.js";
import { saveBlockRenderState, BLOCK_STYLES } from "./blockRenderState.js";
import { clearWHDState } from "./width_height_depth/whdState.js";
import { toggleInstructions } from "./instructions-manager.js";
import { CommandFactory } from "./commands/CommandFactory.js";

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
 * @param {Object} params.commandContext - Command context for command pattern
 */
export function setupKeyboardHandlers({
    clones,
    cloneVisibilityState,
    blockRenderState,
    recreateSceneWrapper,
    folders,
    commandContext
}) {
    window.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();

        if (key >= "1" && key <= "5") {
            const cloneIndex = parseInt(key);
            const cloneName = `groupClone${cloneIndex}`;
            
            // Use command pattern for clone visibility
            const currentVisibility = cloneVisibilityState[cloneName];
            const newVisibility = !currentVisibility;
            
            CommandFactory.executeCommand(cloneName, { ...commandContext, state: cloneVisibilityState }, newVisibility);
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
            
            // Update state first (like GUI dropdown does)
            blockRenderState.style = nextStyle;
            
            // Use command pattern for style change
            CommandFactory.executeCommand('style', { ...commandContext, state: blockRenderState }, nextStyle);
        } else if (key === "w") {
            clearWHDState();
            location.reload();
        } else if (key === "z") {
            // Use command pattern for opacity toggle
            const currentOpacity = blockRenderState.isOpaque;
            const newOpacity = !currentOpacity;
            
            // Update state first (like GUI dropdown does)
            blockRenderState.isOpaque = newOpacity;
            
            CommandFactory.executeCommand('isOpaque', { ...commandContext, state: blockRenderState }, newOpacity);
        } else if (key === "h") {
            toggleInstructions();
        } else if (key === "d") {
            // Use command pattern for dimension lines toggle
            const currentDimensionLines = blockRenderState.showDimensionLines;
            const newDimensionLines = !currentDimensionLines;
            
            // Update state first (like GUI dropdown does)
            blockRenderState.showDimensionLines = newDimensionLines;
            
            CommandFactory.executeCommand('showDimensionLines', { ...commandContext, state: blockRenderState }, newDimensionLines);
        } else if (key === "e") {
            // Cycle themes
            const themes = Object.keys(themeManager.themes);
            const currentIndex = themes.indexOf(themeManager.currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            const nextTheme = themes[nextIndex];

            // Use command pattern for theme change
            CommandFactory.executeCommand('theme', { ...commandContext, state: { theme: nextTheme } }, nextTheme);
        }
    });
}

import { themeManager } from "./theme-manager.js";
import { saveCloneVisibilityState } from "./cloneVisibilityState.js";
import { BLOCK_STYLES } from "./blockRenderState.js";
import { clearWHDState } from "./width_height_depth/whdState.js";
import { toggleInstructions } from "./instructions-manager.js";
import { CommandFactory } from "./commands/CommandFactory.js";
import { STRATEGY_TYPES } from "./scene-decorators.js";

/**
 * Helper to set visibility for all clones
 * @param {Object} clones - Object containing all clones
 * @param {Object} cloneVisibilityState - Current visibility state
 * @param {boolean} visible - Visibility value to set
 */
function setAllClonesVisibility(clones, cloneVisibilityState, visible) {
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
 * Base keyboard strategy with handlers common to all strategy types.
 * Handles: q (cycle styles), w (clear WHD), z (opacity), h (help), 
 *          d (dimension lines), e (cycle themes), o (ortho), p (perspective)
 */
export class BaseKeyboardStrategy {
    /**
     * Handle a keydown event
     * @param {string} key - Lowercase key pressed
     * @param {KeyboardEvent} event - Original keyboard event
     * @param {Object} context - Handler context with state and callbacks
     * @returns {boolean} - True if the key was handled
     */
    handleKeydown(key, event, context) {
        const { blockRenderState, viewState, commandContext } = context;

        if (key === "q") {
            // Cycle block styles
            const currentIndex = BLOCK_STYLES.indexOf(blockRenderState.style);
            const direction = event.shiftKey ? -1 : 1;
            const nextIndex = (currentIndex + direction + BLOCK_STYLES.length) % BLOCK_STYLES.length;
            const nextStyle = BLOCK_STYLES[nextIndex];

            blockRenderState.style = nextStyle;
            CommandFactory.executeCommand('style', { ...commandContext, state: blockRenderState }, nextStyle);
            return true;
        } else if (key === "w") {
            clearWHDState();
            location.reload();
            return true;
        } else if (key === "m") {
            // Toggle opacity
            const newOpacity = !blockRenderState.isOpaque;
            blockRenderState.isOpaque = newOpacity;
            CommandFactory.executeCommand('isOpaque', { ...commandContext, state: blockRenderState }, newOpacity);
            return true;
        } else if (key === "h") {
            toggleInstructions();
            return true;
        } else if (key === "d") {
            // Toggle dimension lines
            const newDimensionLines = !blockRenderState.showDimensionLines;
            blockRenderState.showDimensionLines = newDimensionLines;
            CommandFactory.executeCommand('showDimensionLines', { ...commandContext, state: blockRenderState }, newDimensionLines);
            return true;
        } else if (key === "e") {
            // Cycle themes
            const themes = Object.keys(themeManager.themes);
            const currentIndex = themes.indexOf(themeManager.currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            const nextTheme = themes[nextIndex];
            viewState.theme = nextTheme;
            CommandFactory.executeCommand('theme', { ...commandContext, state: viewState }, nextTheme);
            return true;
        } else if (key === "o") {
            // Set orthographic camera
            viewState.type = "orthographic";
            CommandFactory.executeCommand('type', { ...commandContext, state: viewState }, "orthographic");
            return true;
        } else if (key === "p") {
            // Set perspective camera
            viewState.type = "perspective";
            CommandFactory.executeCommand('type', { ...commandContext, state: viewState }, "perspective");
            return true;
        }

        return false;
    }
}

/**
 * Keyboard strategy for USHAPE_BASE.
 * Adds clone visibility handlers: 1-5 (toggle individual), a (show all), s (hide all)
 */
export class UshapeKeyboardStrategy extends BaseKeyboardStrategy {
    handleKeydown(key, event, context) {
        const { clones, cloneVisibilityState, commandContext } = context;

        if (key >= "1" && key <= "5") {
            const cloneIndex = parseInt(key);
            const cloneName = `groupClone${cloneIndex}`;
            const currentVisibility = cloneVisibilityState[cloneName];
            const newVisibility = !currentVisibility;

            // Update state first (like GUI dropdown does)
            cloneVisibilityState[cloneName] = newVisibility;

            CommandFactory.executeCommand(cloneName, { ...commandContext, state: cloneVisibilityState }, newVisibility);
            return true;
        } else if (key === "l") {
            // Toggle all clones visibility
            const anyVisible = Object.values(cloneVisibilityState).some(visible => visible);
            const newVisibility = !anyVisible;
            setAllClonesVisibility(clones, cloneVisibilityState, newVisibility);
            return true;
        }

        // Delegate to base for common handlers
        return super.handleKeydown(key, event, context);
    }
}

/**
 * Keyboard strategy for WHD_BASE.
 * Currently only uses common handlers, but ready for future WHD-specific keys.
 */
export class WHDKeyboardStrategy extends BaseKeyboardStrategy {
    // Inherits all common handlers from BaseKeyboardStrategy
    // Add WHD-specific handlers here when needed
}

/**
 * Keyboard strategy for NODES_BASE.
 * Currently only uses common handlers, but ready for future node-specific keys.
 */
export class NodesKeyboardStrategy extends BaseKeyboardStrategy {
    // Inherits all common handlers from BaseKeyboardStrategy
    // Add node-specific handlers here when needed
}

/**
 * Factory to get the appropriate keyboard strategy for a given strategy type
 * @param {string} strategyType - One of STRATEGY_TYPES values
 * @returns {BaseKeyboardStrategy} - Appropriate keyboard strategy instance
 */
export function getKeyboardStrategy(strategyType) {
    switch (strategyType) {
        case STRATEGY_TYPES.USHAPE_BASE:
            return new UshapeKeyboardStrategy();
        case STRATEGY_TYPES.WHD_BASE:
            return new WHDKeyboardStrategy();
        case STRATEGY_TYPES.NODES_BASE:
            return new NodesKeyboardStrategy();
        default:
            return new BaseKeyboardStrategy();
    }
}

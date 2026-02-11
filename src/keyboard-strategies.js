import { themeManager } from "./theme-manager.js";
import { saveCloneVisibilityState } from "./cloneVisibilityState.js";
import { BLOCK_STYLES } from "./blockRenderState.js";
import { clearWHDState } from "./width_height_depth/whdState.js";
import { toggleInstructions } from "./instructions-manager.js";
import { CommandFactory } from "./commands/CommandFactory.js";
import { STRATEGY_TYPES, activeStrategyType } from "./scene-decorators.js";
import { CAMERA_TYPES } from "./cameraState.js";

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
     * @returns {boolean} - True if key was handled
     */
    handleKeydown(key, event, context) {
        const { blockRenderState, viewState, dimensionState, whdState, commandContext } = context;

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
        } else if (key === "i") {
            // Toggle dimension lines
            const newDimensionLines = !blockRenderState.showDimensionLines;
            blockRenderState.showDimensionLines = newDimensionLines;
            CommandFactory.executeCommand('showDimensionLines', { ...commandContext, state: blockRenderState }, newDimensionLines);
            return true;
        } else if (key === "a" || key === "z") {
            // Increase/Decrease dimension 1 (U-shape) / width (other strategies)
            const isUshape = activeStrategyType === STRATEGY_TYPES.USHAPE_BASE;
            const state = isUshape ? dimensionState : whdState;
            const property = isUshape ? "dimension1" : "width";
            const currentValue = state[property];

            // Use dynamic bounds like GUI (blockThickness * 2 for U-shape, 0.1 for others)
            const blockThickness = isUshape ? dimensionState.blockThickness : whdState.blockThickness;
            const step = event.shiftKey ? 1 : 0.1;
            const min = isUshape ? blockThickness * 2 : whdState.lowerLimit;
            const max = 40;

            // Determine direction and new value
            const isIncrease = (key === "a");
            const newValue = isIncrease ?
                Math.min(max, currentValue + step) :
                Math.max(min, currentValue - step);

            // Update state first
            state[property] = newValue;

            // Execute appropriate command
            const commandName = isUshape ? "dimension1" : "width";
            CommandFactory.executeCommand(commandName, { ...commandContext, state }, newValue);
            return true;
        } else if (key === "s" || key === "x") {
            // Increase/Decrease dimension 2 (U-shape) / height (other strategies)
            const isUshape = activeStrategyType === STRATEGY_TYPES.USHAPE_BASE;
            const state = isUshape ? dimensionState : whdState;
            const property = isUshape ? "dimension2" : "height";
            const currentValue = state[property];

            // Use dynamic bounds like GUI (blockThickness * 2 for U-shape, 0.1 for others)
            const blockThickness = isUshape ? dimensionState.blockThickness : whdState.blockThickness;
            const step = event.shiftKey ? 1 : 0.1;
            const min = isUshape ? blockThickness * 2 : whdState.lowerLimit;
            const max = 40;

            // Determine direction and new value
            const isIncrease = (key === "s");
            const newValue = isIncrease ?
                Math.min(max, currentValue + step) :
                Math.max(min, currentValue - step);

            // Update state first
            state[property] = newValue;

            // Execute appropriate command
            const commandName = isUshape ? "dimension2" : "height";
            CommandFactory.executeCommand(commandName, { ...commandContext, state }, newValue);
            return true;
        } else if (key === "d" || key === "c") {
            // Increase/Decrease dimension 3 (U-shape) / depth (other strategies)
            const isUshape = activeStrategyType === STRATEGY_TYPES.USHAPE_BASE;
            const state = isUshape ? dimensionState : whdState;
            const property = isUshape ? "dimension3" : "depth";
            const currentValue = state[property];

            // Use dynamic bounds like GUI (blockThickness * 2 for U-shape, 0.1 for others)
            const blockThickness = isUshape ? dimensionState.blockThickness : whdState.blockThickness;
            const step = event.shiftKey ? 1 : 0.1;
            const min = isUshape ? blockThickness * 2 : whdState.lowerLimit;
            const max =  40;

            // Determine direction and new value
            const isIncrease = (key === "d");
            const newValue = isIncrease ?
                Math.min(max, currentValue + step) :
                Math.max(min, currentValue - step);

            // Update state first
            state[property] = newValue;

            // Execute appropriate command
            const commandName = isUshape ? "dimension3" : "depth";
            CommandFactory.executeCommand(commandName, { ...commandContext, state }, newValue);
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
        } else if (key === "o" || key === "p") {
            const value =   key === "o" ? CAMERA_TYPES.ORTHOGRAPHIC : CAMERA_TYPES.PERSPECTIVE;
            CommandFactory.executeCommand('type', { ...commandContext }, value);
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
        const { clones, cloneVisibilityState, commandContext, dimensionState, whdState } = context;

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

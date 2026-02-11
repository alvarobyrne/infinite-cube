import { activeStrategyType, onStrategyTypeChange } from "../scene-decorators.js";
import { getKeyboardStrategy } from "./keyboard-strategies.js";
import { saveCloneVisibilityState } from "../state/cloneVisibilityState.js";

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
 * Manages keyboard handlers and swaps strategies based on activeStrategyType.
 */
class KeyboardHandlerManager {
    constructor() {
        this.context = null;
        this.currentStrategy = null;
        this.boundHandler = this.handleKeydown.bind(this);
        this.isInitialized = false;
    }

    /**
     * Initialize the manager with the handler context
     * @param {Object} context - Context with clones, states, and callbacks
     */
    initialize(context) {
        this.context = context;

        // Set initial strategy based on current activeStrategyType
        this.setStrategy(activeStrategyType);

        // Subscribe to strategy type changes
        onStrategyTypeChange((newType) => {
            this.setStrategy(newType);
        });

        // Register global keydown listener
        if (!this.isInitialized) {
            window.addEventListener("keydown", this.boundHandler);
            this.isInitialized = true;
        }
    }

    /**
     * Set the current keyboard strategy
     * @param {string} strategyType - Strategy type from STRATEGY_TYPES
     */
    setStrategy(strategyType) {
        this.currentStrategy = getKeyboardStrategy(strategyType);
    }

    /**
     * Handle keydown events by delegating to current strategy
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeydown(event) {
        if (!this.currentStrategy || !this.context) return;

        const key = event.key.toLowerCase();
        this.currentStrategy.handleKeydown(key, event, this.context);
    }

    /**
     * Update the context (useful when clones or state objects change)
     * @param {Object} newContext - Updated context
     */
    updateContext(newContext) {
        this.context = { ...this.context, ...newContext };
    }
}

// Singleton instance
export const keyboardHandlerManager = new KeyboardHandlerManager();

/**
 * Setup keyboard handlers for the application
 * @param {Object} params - Parameters object
 * @param {Object} params.clones - Object containing all clones
 * @param {Object} params.cloneVisibilityState - Current visibility state
 * @param {Object} params.blockRenderState - Current block render state
 * @param {Object} params.viewState - Current view state
 * @param {Object} params.dimensionState - Current dimension state
 * @param {Object} params.whdState - Current WHD state
 * @param {Function} params.recreateSceneWrapper - Function to recreate the scene
 * @param {Object} params.folders - GUI folders object
 * @param {Object} params.commandContext - Command context for command pattern
 */
export function setupKeyboardHandlers({
    clones,
    cloneVisibilityState,
    blockRenderState,
    viewState,
    dimensionState,
    whdState,
    recreateSceneWrapper,
    folders,
    commandContext
}) {
    keyboardHandlerManager.initialize({
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
}

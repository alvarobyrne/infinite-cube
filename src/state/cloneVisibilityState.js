import { getItem, setItem, removeItem } from "../storage-manager.js";

/**
 * Clone visibility state
 */
export const cloneVisibilityState = {
    groupClone1: true,
    groupClone2: true,
    groupClone3: true,
    groupClone4: true,
    groupClone5: true,
};

const CLONE_VISIBILITY_STATE_KEY = "cloneVisibilityState";

/**
 * Save clone visibility state to localStorage
 */
export function saveCloneVisibilityState(state) {
    setItem(CLONE_VISIBILITY_STATE_KEY, state);
}

/**
 * Load clone visibility state from localStorage
 */
export function loadCloneVisibilityState() {
    const state = getItem(CLONE_VISIBILITY_STATE_KEY);
    if (!state) return null;
    try {
        return state;
    } catch (e) {
        // Ignore parse errors
        return null;
    }
}

/**
 * Clear clone visibility state from localStorage
 */
export function clearCloneVisibilityState() {
    removeItem(CLONE_VISIBILITY_STATE_KEY);
}


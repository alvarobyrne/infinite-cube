import { getItem, setItem, removeItem } from "../storage-manager.js";

const WHD_STATE_KEY = "whdState";

/**
 * Save WHD (Width, Height, Depth) state to localStorage
 */
export function saveWHDState(whd) {
    const state = {
        width: whd.width,
        height: whd.height,
        depth: whd.depth,
        blockThickness: whd.blockThickness,
        gap: whd.gap || 1,
    };
    setItem(WHD_STATE_KEY, state);
}

/**
 * Load WHD (Width, Height, Depth) state from localStorage
 */
export function loadWHDState() {
    const state = getItem(WHD_STATE_KEY);
    if (!state) return null;
    try {
        if (state.width !== undefined && state.height !== undefined && state.depth !== undefined) {
            return state;
        }
    } catch (e) {
        // Ignore parse errors
    }
    return null;
}

/**
 * Clear WHD state from localStorage
 */
export function clearWHDState() {
    removeItem(WHD_STATE_KEY);
}


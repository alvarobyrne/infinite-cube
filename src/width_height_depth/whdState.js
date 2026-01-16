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
    localStorage.setItem("whdState", JSON.stringify(state));
}

/**
 * Load WHD (Width, Height, Depth) state from localStorage
 */
export function loadWHDState() {
    const stateStr = localStorage.getItem("whdState");
    if (!stateStr) return null;
    try {
        const state = JSON.parse(stateStr);
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
    localStorage.removeItem("whdState");
}

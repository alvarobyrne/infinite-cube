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

/**
 * Save clone visibility state to localStorage
 */
export function saveCloneVisibilityState(state) {
    localStorage.setItem("cloneVisibilityState", JSON.stringify(state));
}

/**
 * Load clone visibility state from localStorage
 */
export function loadCloneVisibilityState() {
    const stateStr = localStorage.getItem("cloneVisibilityState");
    if (!stateStr) return null;
    try {
        return JSON.parse(stateStr);
    } catch (e) {
        // Ignore parse errors
        return null;
    }
}

/**
 * Clear clone visibility state from localStorage
 */
export function clearCloneVisibilityState() {
    localStorage.removeItem("cloneVisibilityState");
}

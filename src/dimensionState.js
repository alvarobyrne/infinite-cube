/**
 * Save dimension state to localStorage
 */
export function saveDimensionState(dimensions) {
  const state = {
    dimension1: dimensions.dimension1,
    dimension2: dimensions.dimension2,
    dimension3: dimensions.dimension3,
    transversalBlockSize: dimensions.transversalBlockSize,
  };
  localStorage.setItem("dimensionState", JSON.stringify(state));
}

/**
 * Load dimension state from localStorage
 */
export function loadDimensionState() {
  const stateStr = localStorage.getItem("dimensionState");
  if (!stateStr) return null;
  try {
    const state = JSON.parse(stateStr);
    if (state.dimension1 && state.dimension2 && state.dimension3) {
      return state;
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
}

/**
 * Clear dimension state from localStorage
 */
export function clearDimensionState() {
  localStorage.removeItem("dimensionState");
}

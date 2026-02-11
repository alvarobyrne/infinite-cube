import { getItem, setItem, removeItem } from "../storage-manager.js";

const DIMENSION_STATE_KEY = "dimensionState";

/**
 * Save dimension state to localStorage
 */
export function saveDimensionState(dimensions) {
  const state = {
    dimension1: dimensions.dimension1,
    dimension2: dimensions.dimension2,
    dimension3: dimensions.dimension3,
    blockThickness: dimensions.blockThickness,
  };
  setItem(DIMENSION_STATE_KEY, state);
}

/**
 * Load dimension state from localStorage
 */
export function loadDimensionState() {
  const state = getItem(DIMENSION_STATE_KEY);
  if (!state) return null;
  try {
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
  removeItem(DIMENSION_STATE_KEY);
}


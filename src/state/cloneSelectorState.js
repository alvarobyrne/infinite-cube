import { getItem, setItem, removeItem } from "../storage-manager.js";

/**
 * Clone selector state - tracks which clone is currently selected for position/rotation management
 */
const CLONE_SELECTOR_STATE_KEY = "cloneSelectorState";

export const cloneSelectorState = {
  selectedCloneIndex: 5, // Default to clone 5 (1-5)
  previouslySelectedCloneIndex: 5,
};

/**
 * Save clone selector state to localStorage
 */
export function saveCloneSelectorState(state) {
  setItem(CLONE_SELECTOR_STATE_KEY, state);
}

/**
 * Load clone selector state from localStorage
 */
export function loadCloneSelectorState() {
  const state = getItem(CLONE_SELECTOR_STATE_KEY);
  if (!state) return null;
  try {
    return state;
  } catch (e) {
    return null;
  }
}

/**
 * Clear clone selector state from localStorage
 */
export function clearCloneSelectorState() {
  removeItem(CLONE_SELECTOR_STATE_KEY);
}


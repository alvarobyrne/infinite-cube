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
  localStorage.setItem(CLONE_SELECTOR_STATE_KEY, JSON.stringify(state));
}

/**
 * Load clone selector state from localStorage
 */
export function loadCloneSelectorState() {
  const stateStr = localStorage.getItem(CLONE_SELECTOR_STATE_KEY);
  if (!stateStr) return null;
  try {
    return JSON.parse(stateStr);
  } catch (e) {
    return null;
  }
}

/**
 * Clear clone selector state from localStorage
 */
export function clearCloneSelectorState() {
  localStorage.removeItem(CLONE_SELECTOR_STATE_KEY);
}

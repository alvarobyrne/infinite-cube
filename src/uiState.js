const UISTATE_KEY = "uiState";

/**
 * Save UI folder states (open/closed) to localStorage
 * Uses the _closed property: false means open, true means closed
 * We save the inverse (!_closed) so true = open, false = closed in the saved state
 * @param {Object} folders - Object containing folder references
 */
export function saveUIState(folders) {
  const state = {
    dimensions: folders.dimensions ? !folders.dimensions._closed : undefined,
    blockRendering: folders.blockRendering ? !folders.blockRendering._closed : undefined,
    cloneColors: folders.cloneColors ? !folders.cloneColors._closed : undefined,
    actions: folders.actions ? !folders.actions._closed : undefined,
    object3DPositionRotation: folders.object3DPositionRotation ? !folders.object3DPositionRotation._closed : undefined,
  };
  localStorage.setItem(UISTATE_KEY, JSON.stringify(state));
}

/**
 * Load UI folder states (open/closed) from localStorage
 * Uses the _closed property: false means open, true means closed
 * Saved state: true = open, false = closed
 * @param {Object} folders - Object containing folder references
 */
export function loadUIState(folders) {
  const stateStr = localStorage.getItem(UISTATE_KEY);
  if (!stateStr) return;
  try {
    const state = JSON.parse(stateStr);
    
    // Restore folder states (state value: true = open, false = closed)
    if (folders.dimensions && state.dimensions !== undefined) {
      if (state.dimensions) {
        folders.dimensions.open();
      } else {
        folders.dimensions.close();
      }
    }
    
    if (folders.blockRendering && state.blockRendering !== undefined) {
      if (state.blockRendering) {
        folders.blockRendering.open();
      } else {
        folders.blockRendering.close();
      }
    }
    
    if (folders.cloneColors && state.cloneColors !== undefined) {
      if (state.cloneColors) {
        folders.cloneColors.open();
      } else {
        folders.cloneColors.close();
      }
    }
    
    if (folders.actions && state.actions !== undefined) {
      if (state.actions) {
        folders.actions.open();
      } else {
        folders.actions.close();
      }
    }
    
    if (folders.object3DPositionRotation && state.object3DPositionRotation !== undefined) {
      if (state.object3DPositionRotation) {
        folders.object3DPositionRotation.open();
      } else {
        folders.object3DPositionRotation.close();
      }
    }
  } catch (e) {
    // Ignore parse errors
    console.warn("Failed to load UI state:", e);
  }
}

/**
 * Clear UI state from localStorage
 */
export function clearUIState() {
  localStorage.removeItem(UISTATE_KEY);
}


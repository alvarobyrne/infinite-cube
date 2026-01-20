import { getItem, setItem, removeItem } from "./storage-manager.js";

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
    cloneSelector: folders.cloneSelector ? !folders.cloneSelector._closed : undefined,
    visibility: folders.visibility ? !folders.visibility._closed : undefined,
    object3DPositionRotation: folders.object3DPositionRotation ? !folders.object3DPositionRotation._closed : undefined,
    multiColorPalette: folders.multiColorPalette ? !folders.multiColorPalette._closed : undefined,
    whd: folders.whd ? !folders.whd._closed : undefined,
    dimensionsHidden: folders.dimensions ? folders.dimensions._hidden : undefined,
    whdHidden: folders.whd ? folders.whd._hidden : undefined,
    reports: folders.reports ? !folders.reports._closed : undefined,
    gui: folders.gui ? !folders.gui._closed : undefined
  };
  setItem(UISTATE_KEY, state);
}

/**
 * Load UI folder states (open/closed) from localStorage
 * Uses the _closed property: false means open, true means closed
 * Saved state: true = open, false = closed
 * @param {Object} folders - Object containing folder references
 */
export function loadUIState(folders) {
  const state = getItem(UISTATE_KEY);
  if (!state) return;
  try {
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

    if (folders.cloneSelector && state.cloneSelector !== undefined) {
      if (state.cloneSelector) {
        folders.cloneSelector.open();
      } else {
        folders.cloneSelector.close();
      }
    }

    if (folders.visibility && state.visibility !== undefined) {
      if (state.visibility) {
        folders.visibility.open();
      } else {
        folders.visibility.close();
      }
    }

    if (folders.object3DPositionRotation && state.object3DPositionRotation !== undefined) {
      if (state.object3DPositionRotation) {
        folders.object3DPositionRotation.open();
      } else {
        folders.object3DPositionRotation.close();
      }
    }

    if (folders.multiColorPalette && state.multiColorPalette !== undefined) {
      if (state.multiColorPalette) {
        folders.multiColorPalette.open();
      } else {
        folders.multiColorPalette.close();
      }
    }
    if (folders.whd && state.whd !== undefined) {
      if (state.whd) {
        folders.whd.open();
      } else {
        folders.whd.close();
      }
    }
    if (folders.reports && state.reports !== undefined) {
      if (state.reports) {
        folders.reports.open();
      } else {
        folders.reports.close();
      }
    }

    // Restore folder hidden states
    if (folders.dimensions && state.dimensionsHidden !== undefined) {
      if (state.dimensionsHidden) {
        folders.dimensions.hide();
      } else {
        folders.dimensions.show();
      }
    }

    if (folders.whd && state.whdHidden !== undefined) {
      if (state.whdHidden) {
        folders.whd.hide();
      } else {
        folders.whd.show();
      }
    }
    if (folders.gui && state.gui !== undefined) {
      if (state.gui) {
        folders.gui.open();
      } else {
        folders.gui.close();
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
  removeItem(UISTATE_KEY);
}



/**
 * Block rendering style state
 */
export const blockRenderState = {
  style: "singleColor", // "singleColor", "coloredFaces", "unifiedColor", "hollow", "multiColorPlanes", "multiColorBox", or "granularColor"
  unifiedColor: 0xffffff, // Color used when style is "unifiedColor"
  useCloneColors: false, // Whether to use independent colors for each cloned group
  cloneColor1: 0xff00ff, // Color for groupClone1
  cloneColor2: 0xffff00, // Color for groupClone2
  cloneColor3: 0x00ffff, // Color for groupClone3
  cloneColor4: 0xffa500, // Color for groupClone4
  cloneColor5: 0x800080, // Color for groupClone5
  showDimensionLines: true, // Whether to show dimension lines
  showVertices: true, // Whether to show vertices
};

/**
 * Save block render state to localStorage
 */
export function saveBlockRenderState(state) {
  localStorage.setItem("blockRenderState", JSON.stringify(state));
}

/**
 * Load block render state from localStorage
 */
export function loadBlockRenderState() {
  const stateStr = localStorage.getItem("blockRenderState");
  if (!stateStr) return null;
  try {
    return JSON.parse(stateStr);
  } catch (e) {
    // Ignore parse errors
    return null;
  }
}

/**
 * Clear block render state from localStorage
 */
export function clearBlockRenderState() {
  localStorage.removeItem("blockRenderState");
}

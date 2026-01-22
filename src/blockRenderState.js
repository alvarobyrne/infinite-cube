import { getItem, setItem, removeItem } from "./storage-manager.js";

export const BLOCK_STYLES = [
  "singleColor",
  "coloredFaces",
  "unifiedColor",
  "hollow",
  "multiColorPlanes",
  "multiColorBox",
  "granularColor",
  "coloredFacedWHD",
  "singleColorWHD",
  "unifiedColorWHD",
  "multiColorWHD",
  "perDimensionColorWHD",
  "perBarTypeColorWHD",
  "perBarTypeLightenColorWHD",
  "granularColorWHD",
];

export const blockRenderState = {
  style: BLOCK_STYLES[0], // "singleColor"
  unifiedColor: 0xffffff, // Color used when style is "unifiedColor"
  useCloneColors: false, // Whether to use independent colors for each cloned group
  cloneColor1: 0xff00ff, // Color for groupClone1
  cloneColor2: 0xffff00, // Color for groupClone2
  cloneColor3: 0x00ffff, // Color for groupClone3
  cloneColor4: 0xffa500, // Color for groupClone4
  cloneColor5: 0x800080, // Color for groupClone5
  showDimensionLines: true, // Whether to show dimension lines
  showTopDimensionLines: true, // Whether to show dimension lines on the top
  showRightDimensionLines: true, // Whether to show dimension lines on the right
  showFrontDimensionLines: true, // Whether to show dimension lines on the front
  showExtraDimensionLines: true, // Whether to show dimension lines on the extra
  showGSGroup: true, // Whether to show the GS group
  showVertices: true, // Whether to show vertices
  showXYPlaneSquare: false, // Whether to show the XY plane square
  showNumbers: true, // Whether to show block numbers
  multiColor1: 0xff0000,
  multiColor2: 0x00ff00,
  multiColor3: 0x0000ff,
  multiColor4: 0xffff00,
  isOpaque: true,
  scale: 1,
  x: 0,
  y: 0,
  z: 0,
};

const BLOCK_RENDER_STATE_KEY = "blockRenderState";

/**
 * Save block render state to localStorage
 */
export function saveBlockRenderState(state) {
  setItem(BLOCK_RENDER_STATE_KEY, state);
}

/**
 * Load block render state from localStorage
 */
export function loadBlockRenderState() {
  const state = getItem(BLOCK_RENDER_STATE_KEY);
  if (!state) return null;
  try {
    return state;
  } catch (e) {
    // Ignore parse errors
    return null;
  }
}

/**
 * Clear block render state from localStorage
 */
export function clearBlockRenderState() {
  removeItem(BLOCK_RENDER_STATE_KEY);
}


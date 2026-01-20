import { getItem, setItem, removeItem } from "./storage-manager.js";

const CAMERA_STATE_KEY = "cameraState";

export const CAMERA_TYPES = {
  PERSPECTIVE: "Perspective",
  ORTHOGRAPHIC: "Orthographic",
};

export const DEFAULT_FRUSTUM_SIZE = 20;

/**
 * Save camera position and controls target to localStorage
 */
export function saveCameraState(camera, controls) {
  const type = camera.isPerspectiveCamera ? CAMERA_TYPES.PERSPECTIVE : CAMERA_TYPES.ORTHOGRAPHIC;
  const state = {
    position: camera.position.toArray(),
    target: controls.target.toArray(),
    type,
    // Orthographic specific
    zoom: camera.isOrthographicCamera ? camera.zoom : 1,
  };
  setItem(CAMERA_STATE_KEY, state);
}

/**
 * Load camera position and controls target from localStorage
 */
export function loadCameraState(camera, controls) {
  const state = getItem(CAMERA_STATE_KEY);
  if (!state) return;
  try {
    if (state.position && state.target) {
      camera.position.fromArray(state.position);
      controls.target.fromArray(state.target);
      camera.lookAt(controls.target);
    }
    if (state.zoom && camera.isOrthographicCamera) {
      camera.zoom = state.zoom;
      camera.updateProjectionMatrix();
    }
  } catch (e) {
    // Ignore parse errors
  }
}

/**
 * Get the saved camera type
 */
export function getSavedCameraType() {
  const state = getItem(CAMERA_STATE_KEY);
  return state?.type || CAMERA_TYPES.PERSPECTIVE;
}

/**
 * Clear camera state from localStorage
 */
export function clearCameraState() {
  removeItem(CAMERA_STATE_KEY);
}


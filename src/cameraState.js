import { getItem, setItem, removeItem } from "./storage-manager.js";

const CAMERA_STATE_KEY = "cameraState";

/**
 * Save camera position and controls target to localStorage
 */
export function saveCameraState(camera, controls) {
  const state = {
    position: camera.position.toArray(),
    target: controls.target.toArray(),
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
  } catch (e) {
    // Ignore parse errors
  }
}

/**
 * Clear camera state from localStorage
 */
export function clearCameraState() {
  removeItem(CAMERA_STATE_KEY);
}


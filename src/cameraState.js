import { getItem, setItem, removeItem } from "./storage-manager.js";

const CAMERA_STATE_KEY = "cameraState";
const CAMERA_SETTINGS_KEY = "cameraSettings";

export const CAMERA_TYPES = {
  PERSPECTIVE: "Perspective",
  ORTHOGRAPHIC: "Orthographic",
};

export const DEFAULT_CAMERA_SETTINGS = {
  fov: 75,
  near: 0.1,
  far: 1000,
  frustumSize: 20,
  zoom: 1,
  type: CAMERA_TYPES.PERSPECTIVE,
};

/**
 * Save camera position and controls target to localStorage
 */
export function saveCameraState(camera, controls) {
  const state = getItem(CAMERA_STATE_KEY) || {};

  state.position = camera.position.toArray();
  state.target = controls.target.toArray();
  // Zoom is often changed via controls, so we keep it here
  state.zoom = camera.zoom;

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
    if (state.zoom !== undefined) {
      camera.zoom = state.zoom;
      camera.updateProjectionMatrix();
    }
  } catch (e) {
    // Ignore parse errors
  }
}

/**
 * Save camera settings (params like fov, near, far)
 */
export function saveCameraSettings(settings) {
  setItem(CAMERA_SETTINGS_KEY, settings);
}

/**
 * Load camera settings
 */
export function loadCameraSettings() {
  const settings = getItem(CAMERA_SETTINGS_KEY);
  return { ...DEFAULT_CAMERA_SETTINGS, ...settings };
}

/**
 * Get the saved camera type
 */
export function getSavedCameraType() {
  const state = getItem(CAMERA_SETTINGS_KEY);
  return state?.type || CAMERA_TYPES.PERSPECTIVE;
}

/**
 * Clear camera state from localStorage
 */
export function clearCameraState() {
  removeItem(CAMERA_STATE_KEY);
  removeItem(CAMERA_SETTINGS_KEY);
}


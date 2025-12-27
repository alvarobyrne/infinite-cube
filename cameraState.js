/**
 * Save camera position and controls target to localStorage
 */
export function saveCameraState(camera, controls) {
  const state = {
    position: camera.position.toArray(),
    target: controls.target.toArray(),
  };
  localStorage.setItem("cameraState", JSON.stringify(state));
}

/**
 * Load camera position and controls target from localStorage
 */
export function loadCameraState(camera, controls) {
  const stateStr = localStorage.getItem("cameraState");
  if (!stateStr) return;
  try {
    const state = JSON.parse(stateStr);
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
  localStorage.removeItem("cameraState");
}

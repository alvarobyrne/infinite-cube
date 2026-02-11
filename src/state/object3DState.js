import * as THREE from "three/webgpu";
import { getItem, setItem, removeItem } from "../storage-manager.js";

const OBJECT3DSTATE_KEY_PREFIX = "object3DState_clone";

/**
 * Get the localStorage key for a specific clone index
 */
function getStateKey(cloneIndex) {
  return `${OBJECT3DSTATE_KEY_PREFIX}_${cloneIndex}`;
}

/**
 * Save object3d position and rotation to localStorage for a specific clone
 */
export function saveObject3DState(object3D, cloneIndex) {
  const state = {
    position: object3D.position.toArray(),
    rotation: object3D.rotation.toArray(),
  };
  setItem(getStateKey(cloneIndex), state);
}

/**
 * Load object3d position and rotation from localStorage for a specific clone
 * @returns {boolean} True if state was loaded successfully
 */
export function loadObject3DState(object3D, cloneIndex) {
  const state = getItem(getStateKey(cloneIndex));
  if (!state) return false;
  try {
    if (state.position && state.rotation) {
      object3D.position.fromArray(state.position);
      object3D.rotation.fromArray(state.rotation);
      return true;
    }
  } catch (e) {
    // Ignore parse errors
  }
  return false;
}

/**
 * Save state for all clones (used when clearing or internal sync)
 */
export function saveAllClonesState(clones) {
  for (let i = 1; i <= 5; i++) {
    const clone = clones[`groupClone${i}`];
    if (clone) {
      saveObject3DState(clone, i);
    }
  }
}

/**
 * Load state for all clones from localStorage
 */
export function loadAllClonesState(clones) {
  for (let i = 1; i <= 5; i++) {
    const clone = clones[`groupClone${i}`];
    if (clone) {
      loadObject3DState(clone, i);
    }
  }
}

/**
 * Clear object3D state from localStorage for a specific clone or all clones
 */
export function clearObject3DState(cloneIndex = null) {
  if (cloneIndex !== null) {
    removeItem(getStateKey(cloneIndex));
  } else {
    // Clear all clone states
    for (let i = 1; i <= 5; i++) {
      removeItem(getStateKey(i));
    }
  }
}



/**
 * Create a wrapper object that syncs with the selected clone
 * @returns {THREE.Object3D} A wrapper object with position and rotation
 */
function createWrapperObject() {
  const wrapper = {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
  };
  return wrapper;
}

/**
 * Sync wrapper object from a clone
 */
function syncWrapperFromClone(wrapper, clone) {
  wrapper.position.copy(clone.position);
  wrapper.rotation.copy(clone.rotation);
}

/**
 * Sync clone from wrapper object
 */
function syncCloneFromWrapper(clone, wrapper) {
  clone.position.copy(wrapper.position);
  clone.rotation.copy(wrapper.rotation);
}

/**
 * Position and rotation manager that can switch between clones
 * @param {Object} clones - Object containing all clones (groupClone1-5)
 * @param {Object} cloneSelectorState - State object with selectedCloneIndex
 * @param {GUI} gui - GUI instance
 * @returns {Object} Object containing the folder and switch function
 */
export function positionAndRotationManager(clones, cloneSelectorState, gui) {
  // Create wrapper object that GUI controls will bind to
  const wrapper = createWrapperObject();

  // Track if this is the first initialization
  let isInitialized = false;

  // Function to switch to a different clone
  const switchClone = (newCloneIndex, skipSave = false) => {
    // Save current wrapper state to the old clone (skip if not initialized or skipSave is true)
    if (isInitialized && !skipSave) {
      const oldCloneIndex = cloneSelectorState.previouslySelectedCloneIndex;
      if (oldCloneIndex >= 1 && oldCloneIndex <= 5) {
        const oldClone = clones[`groupClone${oldCloneIndex}`];
        if (oldClone) {
          syncCloneFromWrapper(oldClone, wrapper);
          saveObject3DState(wrapper, oldCloneIndex);
        }
      }
      cloneSelectorState.previouslySelectedCloneIndex = newCloneIndex;
    }

    // Update selected index
    cloneSelectorState.selectedCloneIndex = newCloneIndex;

    // Load new clone state into wrapper
    const newClone = clones[`groupClone${newCloneIndex}`];
    if (newClone) {
      // First try to load saved state from localStorage
      const hasSavedState = loadObject3DState(wrapper, newCloneIndex);

      // If no saved state was loaded, sync from the clone's current physical state
      if (!hasSavedState) {
        syncWrapperFromClone(wrapper, newClone);
      } else {
        // If we DID load from saved state, apply it to the clone
        syncCloneFromWrapper(newClone, wrapper);
      }
    }

    isInitialized = true;
  };

  // Initialize with the selected clone
  switchClone(cloneSelectorState.selectedCloneIndex);

  const guiLocal = gui.addFolder("Object3D Position/Rotation");

  // Only visible in development
  if (import.meta.env.PROD) {
    guiLocal.hide();
  }

  // Position controls - added .listen() so sliders update when wrapper changes
  guiLocal.add(wrapper.position, "x", -20, 20, 0.1).name("X").onChange(() => {
    const cloneIndex = cloneSelectorState.selectedCloneIndex;
    const clone = clones[`groupClone${cloneIndex}`];
    if (clone) {
      clone.position.x = wrapper.position.x;
      saveObject3DState(wrapper, cloneIndex);
    }
  }).listen();
  guiLocal.add(wrapper.position, "y", -20, 20, 0.1).name("Y").onChange(() => {
    const cloneIndex = cloneSelectorState.selectedCloneIndex;
    const clone = clones[`groupClone${cloneIndex}`];
    if (clone) {
      clone.position.y = wrapper.position.y;
      saveObject3DState(wrapper, cloneIndex);
    }
  }).listen();
  guiLocal.add(wrapper.position, "z", -20, 20, 0.1).name("Z").onChange(() => {
    const cloneIndex = cloneSelectorState.selectedCloneIndex;
    const clone = clones[`groupClone${cloneIndex}`];
    if (clone) {
      clone.position.z = wrapper.position.z;
      saveObject3DState(wrapper, cloneIndex);
    }
  }).listen();

  // Rotation controls - added .listen()
  guiLocal.add(wrapper.rotation, "x", -Math.PI, Math.PI, 0.01).name("Rot X").onChange(() => {
    const cloneIndex = cloneSelectorState.selectedCloneIndex;
    const clone = clones[`groupClone${cloneIndex}`];
    if (clone) {
      clone.rotation.x = wrapper.rotation.x;
      saveObject3DState(wrapper, cloneIndex);
    }
  }).listen();
  guiLocal.add(wrapper.rotation, "y", -Math.PI, Math.PI, 0.01).name("Rot Y").onChange(() => {
    const cloneIndex = cloneSelectorState.selectedCloneIndex;
    const clone = clones[`groupClone${cloneIndex}`];
    if (clone) {
      clone.rotation.y = wrapper.rotation.y;
      saveObject3DState(wrapper, cloneIndex);
    }
  }).listen();
  guiLocal.add(wrapper.rotation, "z", -Math.PI, Math.PI, 0.01).name("Rot Z").onChange(() => {
    const cloneIndex = cloneSelectorState.selectedCloneIndex;
    const clone = clones[`groupClone${cloneIndex}`];
    if (clone) {
      clone.rotation.z = wrapper.rotation.z;
      saveObject3DState(wrapper, cloneIndex);
    }
  }).listen();

  guiLocal.add({
    clearObject3D: () => {
      clearObject3DState();
      location.reload();
    }
  }, "clearObject3D").name("Clear Object3D State");

  return {
    folder: guiLocal,
    switchClone
  };
}
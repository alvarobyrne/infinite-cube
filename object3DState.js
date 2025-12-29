const OBJECT3DSTATE_KEY = "object3DState";
/**
 * Save object3d position and rotation to localStorage
 */
export function saveObject3DState(object3D) {
  const state = {
    position: object3D.position.toArray(),
    rotation: object3D.rotation.toArray(),
  };
  localStorage.setItem(OBJECT3DSTATE_KEY, JSON.stringify(state));
}

/**
 * Load object3d position and rotation from localStorage
 */
export function loadObject3DState(object3D) {
  const stateStr = localStorage.getItem(OBJECT3DSTATE_KEY);
  if (!stateStr) return;
  try {
    const state = JSON.parse(stateStr);
    if (state.position && state.rotation) {
      object3D.position.fromArray(state.position);
      object3D.rotation.fromArray(state.rotation);
    }
  } catch (e) {
    // Ignore parse errors
  }
}

/**
 * Clear object3D state from localStorage
 */
export function clearObject3DState() {
  localStorage.removeItem(OBJECT3DSTATE_KEY);
}


/**
 * 
 * @param {*} object3D 
 * @param {*} gui 
 */
export function positionAndRotationManager(object3D, gui) {
  const guiLocal = gui.addFolder("Object3D Position/Rotation");
  guiLocal.add(object3D.position, "x", -20, 20, 0.1).name("X").onChange(() => { 
    saveObject3DState(object3D); 
  });
  guiLocal.add(object3D.position, "y", -20, 20, 0.1).name("Y").onChange(() => { 
    saveObject3DState(object3D); 
  });
  guiLocal.add(object3D.position, "z", -20, 20, 0.1).name("Z").onChange(() => { 
    saveObject3DState(object3D); 
  });
  guiLocal.add(object3D.rotation, "x", -Math.PI, Math.PI, 0.01).name("Rot X").onChange(() => { 
    saveObject3DState(object3D); 
  });
  guiLocal.add(object3D.rotation, "y", -Math.PI, Math.PI, 0.01).name("Rot Y").onChange(() => { 
    saveObject3DState(object3D); 
  });
  guiLocal.add(object3D.rotation, "z", -Math.PI, Math.PI, 0.01).name("Rot Z").onChange(() => { 
    saveObject3DState(object3D); 
  });
  guiLocal.add({ clearObject3D: () => {
    clearObject3DState();
    location.reload();
  }}, "clearObject3D").name("Clear Object3D State");
}
const NAMESPACE = "org.sandcastls.infinite-cube";

/**
 * Get the entire namespaced object from localStorage
 * @returns {Object}
 */
function getRoot() {
    const data = localStorage.getItem(NAMESPACE);
    if (!data) return {};
    try {
        return JSON.parse(data);
    } catch (e) {
        console.warn("Failed to parse storage data:", e);
        return {};
    }
}

/**
 * Save the entire namespaced object to localStorage
 * @param {Object} root 
 */
function setRoot(root) {
    localStorage.setItem(NAMESPACE, JSON.stringify(root));
}

/**
 * Get an item from the namespaced storage
 * @param {string} key 
 * @returns {any}
 */
export function getItem(key) {
    const root = getRoot();
    return root[key] !== undefined ? root[key] : null;
}


/**
 * Set an item in the namespaced storage
 * @param {string} key 
 * @param {any} value 
 */
export function setItem(key, value) {
    const root = getRoot();
    root[key] = value;
    setRoot(root);
}

/**
 * Remove an item from the namespaced storage
 * @param {string} key 
 */
export function removeItem(key) {
    const root = getRoot();
    delete root[key];
    setRoot(root);
}

/**
 * Clear all items from the namespaced storage
 */
export function clearAll() {
    localStorage.removeItem(NAMESPACE);
}

/**
 * Migration helper to move data from individual keys to the namespace
 */
export function migrateFromLegacyKeys() {
    const keys = [
        "uiState",
        "dimensionState",
        "cameraState",
        "blockRenderState",
        "cloneSelectorState",
        "cloneVisibilityState",
        "object3DState_clone_1",
        "object3DState_clone_2",
        "object3DState_clone_3",
        "object3DState_clone_4",
        "object3DState_clone_5",
        "viewState",
        "whdState",
        "instructionsVisible"
    ];
    const root = getRoot();
    let migrated = false;
    keys.forEach(key => {
        const legacyValue = localStorage.getItem(key);
        if (legacyValue !== null && root[key] === undefined) {
            try {
                root[key] = JSON.parse(legacyValue);
            } catch (e) {
                root[key] = legacyValue;
            }
            migrated = true;
            // Remove legacy key after migration
            localStorage.removeItem(key);
        }
    });

    if (migrated) {
        setRoot(root);
    }
}

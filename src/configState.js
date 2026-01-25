import { getItem, setItem } from "./storage-manager.js";
import { activeStrategyType, STRATEGY_TYPES } from "./scene-decorators.js";

const SAVED_CONFIGS_KEY = "savedConfigurations";

export const configState = {
    name: "New Config",
    selectedConfig: "",
    savedConfigs: {},
    // These will be initialized in gui-setup.js or main.js
    recreateScene: null,
    dimensionState: null,
    whdState: null,
    blockRenderState: null,
    syncFolders: null,
    refreshGUI: null,
    saveDimensionState: null,
    saveWHDState: null,
    saveBlockRenderState: null,
    // Methods for GUI
    save: saveConfig,
    load: () => loadConfig(),
    delete: () => deleteConfig(),
    update: updateConfig,
};

/**
 * Load all saved configurations from localStorage
 */
export function loadAllConfigs() {
    const configs = getItem(SAVED_CONFIGS_KEY);
    if (configs) {
        configState.savedConfigs = configs;
        const keys = Object.keys(configs);
        if (keys.length > 0) {
            configState.selectedConfig = keys[0];
        }
    }
}

/**
 * Save all configurations to localStorage
 */
function saveAllConfigs() {
    setItem(SAVED_CONFIGS_KEY, configState.savedConfigs);
}

/**
 * Save current state as a configuration
 */
export function saveConfig() {
    const name = configState.name.trim();
    if (!name) {
        alert("Please provide a name for the configuration.");
        return;
    }

    const config = {
        name: name,
        strategyType: activeStrategyType,
        blockStyle: configState.blockRenderState.style,
        blockRenderState: JSON.parse(JSON.stringify(configState.blockRenderState)),
    };

    if (activeStrategyType === STRATEGY_TYPES.WHD_BASE) {
        config.dimensions = JSON.parse(JSON.stringify(configState.whdState));
    } else if (activeStrategyType === STRATEGY_TYPES.NODES_BASE) {
        config.dimensions = JSON.parse(JSON.stringify(configState.whdState));
    } else {
        config.dimensions = JSON.parse(JSON.stringify(configState.dimensionState));
    }

    configState.savedConfigs[name] = config;
    configState.selectedConfig = name;
    saveAllConfigs();
}

/**
 * Load a configuration by name
 * @param {string} name 
 */
export function loadConfig(name) {
    const target = name || configState.selectedConfig;
    const config = configState.savedConfigs[target];
    if (!config) return;

    configState.name = config.name;

    // Restore block render state
    Object.assign(configState.blockRenderState, config.blockRenderState);

    // Restore dimensions based on strategy type
    if (config.strategyType === STRATEGY_TYPES.WHD_BASE) {
        Object.assign(configState.whdState, config.dimensions);
        if (configState.saveWHDState) configState.saveWHDState(configState.whdState);
    } else {
        Object.assign(configState.dimensionState, config.dimensions);
        if (configState.saveDimensionState) configState.saveDimensionState(configState.dimensionState);
    }

    configState.saveBlockRenderState?.(configState.blockRenderState);

    configState.recreateScene?.();

    configState.syncFolders?.();

    configState.refreshGUI?.();
}

/**
 * Delete a configuration by name
 * @param {string} name 
 */
export function deleteConfig(name) {
    const target = name || configState.selectedConfig;
    if (configState.savedConfigs[target]) {
        delete configState.savedConfigs[target];
        saveAllConfigs();

        const keys = Object.keys(configState.savedConfigs);
        configState.selectedConfig = keys.length > 0 ? keys[0] : "";
    }
}

/**
 * Update the configuration with the current name to match current state
 */
export function updateConfig() {
    const name = configState.name.trim();
    if (!name || !configState.savedConfigs[name]) {
        alert("No configuration found with this name to update.");
        return;
    }
    saveConfig();
}

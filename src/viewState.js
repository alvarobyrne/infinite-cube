import { getItem, setItem, removeItem } from "./storage-manager.js";

const VIEWSTATE_KEY = "viewState";

export const VIEW_MODES = {
    SINGLE: "single",
    MULTI: "multi",
};

export const viewState = {
    mode: VIEW_MODES.SINGLE,
};

export function saveViewState(state) {
    setItem(VIEWSTATE_KEY, state);
}

export function loadViewState() {
    const state = getItem(VIEWSTATE_KEY);
    if (state) {
        try {
            if (state && state.mode) {
                return state;
            }
        } catch (e) {
            console.warn("Failed to parse view state", e);
        }
    }
    return null;
}

export function clearViewState() {
    removeItem(VIEWSTATE_KEY);
}


const VIEWSTATE_KEY = "viewState";

export const VIEW_MODES = {
    SINGLE: "single",
    MULTI: "multi",
};

export const viewState = {
    mode: VIEW_MODES.SINGLE,
};

export function saveViewState(state) {
    localStorage.setItem(VIEWSTATE_KEY, JSON.stringify(state));
}

export function loadViewState() {
    const stateStr = localStorage.getItem(VIEWSTATE_KEY);
    if (stateStr) {
        try {
            const saved = JSON.parse(stateStr);
            if (saved && saved.mode) {
                return saved;
            }
        } catch (e) {
            console.warn("Failed to parse view state", e);
        }
    }
    return null;
}

export function clearViewState() {
    localStorage.removeItem(VIEWSTATE_KEY);
}

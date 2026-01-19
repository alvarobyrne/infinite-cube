import { html as readmeHtml } from "../README.md";

// Instructions visibility state
const instructionsState = {
  visible: true,
};

// Load instructions visibility state
function loadInstructionsState() {
  const stateStr = localStorage.getItem("instructionsVisible");
  if (stateStr !== null) {
    instructionsState.visible = JSON.parse(stateStr);
  }
}

// Save instructions visibility state
function saveInstructionsState() {
  localStorage.setItem(
    "instructionsVisible",
    JSON.stringify(instructionsState.visible),
  );
}

// Toggle instructions visibility
export function toggleInstructions() {
  instructionsState.visible = !instructionsState.visible;
  updateInstructionsDisplay();
  saveInstructionsState();
}

// Update the display of instructions
function updateInstructionsDisplay() {
  const readmeContainer = document.getElementById("readme-container");
  if (readmeContainer) {
    readmeContainer.style.display = instructionsState.visible
      ? "block"
      : "none";
  }
}

// Display README in the readme-container div
const readmeContainer = document.getElementById("readme-container");
if (readmeContainer) {
  readmeContainer.innerHTML = readmeHtml;

  // Disable text selection for readme-container
  readmeContainer.style.userSelect = "none";
  readmeContainer.style.webkitUserSelect = "none";
  readmeContainer.style.msUserSelect = "none";

  // Load instructions state
  loadInstructionsState();
  updateInstructionsDisplay();

  // Hide readme container on mouse drag
  let isMouseDown = false;
  document.addEventListener("mousedown", () => {
    isMouseDown = true;
  });

  document.addEventListener("mousemove", () => {
    if (isMouseDown) {
      instructionsState.visible = false;
      updateInstructionsDisplay();
      saveInstructionsState();
    }
  });

  document.addEventListener("mouseup", () => {
    isMouseDown = false;
  });
}

export { instructionsState };

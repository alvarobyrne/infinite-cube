import "./style.css";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three-stdlib";
import GUI from "lil-gui";
import { setupScene, createBlock, createBlock1, createBlock2 } from "./scene-setup.js";
import { saveCameraState, loadCameraState, clearCameraState } from "./cameraState.js";
import { saveDimensionState, loadDimensionState, clearDimensionState } from "./dimensionState.js";
import { addDimensionLine } from "./dimensionLine.js";
import { addVertices } from "./vertices.js";
import { loadObject3DState, positionAndRotationManager } from "./object3DState.js";

console.log("Hello, World!", Math.random());

const transversalBlockSize = 1;

// Load dimension state or use defaults
const savedDimensionState = loadDimensionState();
const dimensionState = {
  dimension1: savedDimensionState?.dimension1 || transversalBlockSize * 7,
  dimension2: savedDimensionState?.dimension2 || transversalBlockSize * 5,
  dimension3: savedDimensionState?.dimension3 || transversalBlockSize * 5,
};

const { scene, renderer, camera } = setupScene();

const isAddingGaps = false;
const gapSize = isAddingGaps ? 0.05 : 0;

// Block rendering style state
const blockRenderState = {
  style: "singleColor", // "singleColor", "coloredFaces", or "unifiedColor"
  unifiedColor: 0xffffff, // Color used when style is "unifiedColor"
  useCloneColors: false, // Whether to use independent colors for each cloned group
  cloneColor1: 0xff00ff, // Color for groupClone1
  cloneColor2: 0xffff00, // Color for groupClone2
  cloneColor3: 0x00ffff, // Color for groupClone3
  cloneColor4: 0xffa500, // Color for groupClone4
  cloneColor5: 0x800080, // Color for groupClone5
};

let group;
let groupClone1, groupClone2, groupClone3, groupClone4, groupClone5;

/**
 * Recursively change material colors in a group by cloning materials first
 * This ensures cloned groups don't share material references with the original
 * @param {THREE.Object3D} object - The object to traverse
 * @param {number} color - The color to apply
 */
function changeGroupColor(object, color) {
  object.traverse((child) => {
    if (child.isMesh) {
      if (Array.isArray(child.material)) {
        // Handle array of materials - clone each material
        child.material = child.material.map((mat) => {
          if (mat && mat.color) {
            const clonedMat = mat.clone();
            clonedMat.color.set(color);
            return clonedMat;
          }
          return mat;
        });
      } else if (child.material && child.material.color) {
        // Handle single material - clone it before modifying
        child.material = child.material.clone();
        child.material.color.set(color);
      }
    }
  });
}

function recreateScene() {
  // Clear the scene except for camera
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);
  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(10, 10, 10);
  scene.add(light1);

  // Create a group to hold all elements
  group = new THREE.Group();
  scene.add(group);
  group.add(new THREE.AxesHelper(6));

  // Update block configurations
  const block1Configuration = {
    width: dimensionState.dimension1,
    height: transversalBlockSize,
    depth: transversalBlockSize,
    color: 0xff0000,
  };
  const block2Configuration = {
    width: transversalBlockSize,
    height: dimensionState.dimension2,
    depth: transversalBlockSize,
    color: 0x00ff00,
  };
  const block3Configuration = {
    width: transversalBlockSize,
    height: dimensionState.dimension3,
    depth: transversalBlockSize,
    color: 0x0000ff,
  };

  // Choose block creation function based on render style
  let block1, block2, block3;
  
  if (blockRenderState.style === "coloredFaces") {
    // Colored faces style - uses createBlock1 which ignores color parameter
    block1 = createBlock1(block1Configuration);
    block2 = createBlock1(block2Configuration);
    block3 = createBlock1(block3Configuration);
  } else if (blockRenderState.style === "unifiedColor") {
    // Unified color style - all blocks use the same color
    block1 = createBlock2({ ...block1Configuration, color: blockRenderState.unifiedColor });
    block2 = createBlock2({ ...block2Configuration, color: blockRenderState.unifiedColor });
    block3 = createBlock2({ ...block3Configuration, color: blockRenderState.unifiedColor });
  } else {
    // Single color style - each block uses its own color
    block1 = createBlock(block1Configuration);
    block2 = createBlock(block2Configuration);
    block3 = createBlock(block3Configuration);
  }

  group.add(block1);
  group.add(block2);
  group.add(block3);

  block2.position.x = dimensionState.dimension1 / 2 - transversalBlockSize / 2; // small offset to avoid z-fighting
  block2.position.y =
    dimensionState.dimension2 / 2 + transversalBlockSize / 2 + gapSize; // small offset to avoid z-fighting
  block2.position.z = 0;

  block3.position.x = -dimensionState.dimension1 / 2 + transversalBlockSize / 2; // small offset to avoid z-fighting
  block3.position.y =
    dimensionState.dimension3 / 2 + transversalBlockSize / 2 + gapSize; // small offset to avoid z-fighting
  block3.position.z = 0;

  // Update dimension lines
  const x = dimensionState.dimension1;
  const y = transversalBlockSize;
  const z = transversalBlockSize;
  const dimensionLineOffset = 0.4;
  const textSize = 16;

  // X dimension (along +Y, above the cube)
  addDimensionLine({
    object3d: scene,
    start: new THREE.Vector3(-x / 2, y / 2 + dimensionLineOffset, z / 2),
    end: new THREE.Vector3(x / 2, y / 2 + dimensionLineOffset, z / 2),
    label: x.toString(),
    color: 0xff0000,
    textColor: "#f00",
    textSize,
  });

  // Y dimension (along +X, right of the cube)
  addDimensionLine({
    object3d: scene,
    start: new THREE.Vector3(x / 2 + dimensionLineOffset, -y / 2, z / 2),
    end: new THREE.Vector3(x / 2 + dimensionLineOffset, y / 2, z / 2),
    label: y.toString(),
    color: 0x00ff00,
    textColor: "#0a0",
    textSize,
  });

  // Z dimension (along +Y, in front of the cube)
  addDimensionLine({
    object3d: scene,
    start: new THREE.Vector3(-x / 2 - dimensionLineOffset, y / 2, z / 2),
    end: new THREE.Vector3(-x / 2 - dimensionLineOffset, y / 2, -z / 2),
    label: z.toString(),
    color: 0x0000ff,
    textColor: "#00f",
    textSize,
  });

  addDimensionLine({
    object3d: scene,
    start: new THREE.Vector3(x / 2 + dimensionLineOffset, -y / 2, -z / 2),
    end: new THREE.Vector3(x / 2 + dimensionLineOffset, y / 2, -z / 2),
    label: "d 2",
    color: 0xffffff,
    textColor: "white",
    textSize: 12,
  });

  // Add vertices at cube corners
  addVertices(scene, x, y, z);

  // Create and position the cloned group
  groupClone1 = group.clone();
  groupClone1.rotateX(-Math.PI * 0.5);
  groupClone1.rotateZ(Math.PI * 0.5);
  groupClone1.position.x = -(
    dimensionState.dimension1 * 0.5 -
    dimensionState.dimension2 -
    0.5 * transversalBlockSize
  );
  groupClone1.position.y =
    transversalBlockSize + dimensionState.dimension3 + gapSize * 2;
  groupClone1.position.z =
    dimensionState.dimension1 * 0.5 - transversalBlockSize * 0.5;
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    changeGroupColor(groupClone1, blockRenderState.cloneColor1);
  }
  scene.add(groupClone1);

  groupClone2 = group.clone();
  groupClone2.rotateX(Math.PI * 0.5);
  groupClone2.rotateY(Math.PI * 0.5);
  groupClone2.position.x = -(dimensionState.dimension1*0.5 + transversalBlockSize*0.5 - gapSize);
  groupClone2.position.y = dimensionState.dimension2 * 0.5 + transversalBlockSize * 0.5 + gapSize;
  groupClone2.position.z = transversalBlockSize;
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    changeGroupColor(groupClone2, blockRenderState.cloneColor2);
  }
  scene.add(groupClone2);
  
  groupClone3 = group.clone();
  groupClone3.rotateZ(Math.PI);
  groupClone3.position.x = -transversalBlockSize;
  groupClone3.position.y = dimensionState.dimension2
  groupClone3.position.z = dimensionState.dimension3+transversalBlockSize*2
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    changeGroupColor(groupClone3, blockRenderState.cloneColor3);
  }
  scene.add(groupClone3);
  
  groupClone4 = group.clone();
  groupClone4.rotateX(-Math.PI * 0.5);
  groupClone4.rotateZ(-Math.PI * 0.5);
  groupClone4.position.x = -(
    dimensionState.dimension1 * 0.5 -
    transversalBlockSize * 0.5
  );
  groupClone4.position.y = -transversalBlockSize;
  groupClone4.position.z =
    dimensionState.dimension1 * 0.5 + transversalBlockSize * 0.5;
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    changeGroupColor(groupClone4, blockRenderState.cloneColor4);
  }
  scene.add(groupClone4);
  
  groupClone5 = group.clone();
  groupClone5.rotateX(-Math.PI * 0.5);
  groupClone5.rotateY(Math.PI * 0.5);
  groupClone5.position.x =
    dimensionState.dimension1 * 0.5 - transversalBlockSize * 0.5;
  groupClone5.position.y =
    dimensionState.dimension2 -
    dimensionState.dimension1 * 0.5 +
    transversalBlockSize * 0.5;
  groupClone5.position.z = dimensionState.dimension1 - transversalBlockSize;
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    changeGroupColor(groupClone5, blockRenderState.cloneColor5);
  }
  scene.add(groupClone5);
}

// Initial scene creation
recreateScene();

const controls = new OrbitControls(camera, renderer.domElement);

// Load camera state if available
loadCameraState(camera, controls);

// Load object3D state if available
loadObject3DState(groupClone5);

controls.addEventListener("change", () => {
  saveCameraState(camera, controls);
});

// Initialize GUI
const gui = new GUI();
gui.add(dimensionState, "dimension1", 1, 20, 0.1).name('dimension 1, r').onChange(() => {
  saveDimensionState(dimensionState);
  recreateScene();
});
gui.add(dimensionState, "dimension2", 1, 20, 0.1).name('dimension 2, g').onChange(() => {
  saveDimensionState(dimensionState);
  recreateScene();
});
gui.add(dimensionState, "dimension3", 1, 20, 0.1).name('dimension 3, b').onChange(() => {
  saveDimensionState(dimensionState);
  recreateScene();
});

// Add block rendering style control
gui.add(blockRenderState, "style", ["singleColor", "coloredFaces", "unifiedColor"]).name("Block Style").onChange(() => {
  recreateScene();
});

// Add unified color control (only relevant when style is "unifiedColor")
gui.addColor(blockRenderState, "unifiedColor").name("Unified Color").onChange(() => {
  if (blockRenderState.style === "unifiedColor") {
    recreateScene();
  }
});

// Add clone colors controls (only relevant when style is "unifiedColor")
gui.add(blockRenderState, "useCloneColors").name("Use Clone Colors").onChange(() => {
  if (blockRenderState.style === "unifiedColor") {
    recreateScene();
  }
});

gui.addColor(blockRenderState, "cloneColor1").name("Clone 1 Color").onChange(() => {
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    recreateScene();
  }
});

gui.addColor(blockRenderState, "cloneColor2").name("Clone 2 Color").onChange(() => {
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    recreateScene();
  }
});

gui.addColor(blockRenderState, "cloneColor3").name("Clone 3 Color").onChange(() => {
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    recreateScene();
  }
});

gui.addColor(blockRenderState, "cloneColor4").name("Clone 4 Color").onChange(() => {
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    recreateScene();
  }
});

gui.addColor(blockRenderState, "cloneColor5").name("Clone 5 Color").onChange(() => {
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    recreateScene();
  }
});

// Add clear buttons
gui.add({ clearCamera: () => {
  clearCameraState();
  loadCameraState(camera, controls);
}}, "clearCamera").name("Clear Camera State");

gui.add({ clearDimensions: () => {
  clearDimensionState();
  location.reload();
}}, "clearDimensions").name("Clear Dimension State");

gui.add({ reload: () => {
  location.reload();
}}, "reload").name("Reload Page");

positionAndRotationManager(groupClone5, gui);

async function init() {
  await renderer.init();
  console.log("WebGPU initialized");

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

init();


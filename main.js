import "./style.css";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three-stdlib";
import { setupScene, createCube } from "./scene-setup.js";
import { saveCameraState, loadCameraState } from "./cameraState.js";
import { addDimensionLine } from "./dimensionLine.js";
import { addVertices } from "./vertices.js";

console.log("Hello, World!", Math.random());

// Cube dimensions
const width = 5,
  height = 1,
  depth = 1;

const { scene, renderer, camera } = setupScene();
const cube = createCube(width, height, depth);
scene.add(cube);

const controls = new OrbitControls(camera, renderer.domElement);

// Load camera state if available
loadCameraState(camera, controls);

controls.addEventListener("change", () => {
  saveCameraState(camera, controls);
});

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

// Cube dimensions
const x = width,
  y = height,
  z = depth;
const dimensionLineOffset = 0.4;
const textSize = 16;

// X dimension (along +Y, above the cube)
addDimensionLine({
  scene,
  start: new THREE.Vector3(-x / 2, y / 2 + dimensionLineOffset, z / 2),
  end: new THREE.Vector3(x / 2, y / 2 + dimensionLineOffset, z / 2),
  label: x.toString(),
  color: 0xff0000,
  textColor: "#f00",
  textSize,
});

// Y dimension (along +X, right of the cube)
addDimensionLine({
  scene,
  start: new THREE.Vector3(x / 2 + dimensionLineOffset, -y / 2, z / 2),
  end: new THREE.Vector3(x / 2 + dimensionLineOffset, y / 2, z / 2),
  label: y.toString(),
  color: 0x00ff00,
  textColor: "#0a0",
  textSize,
});

// Z dimension (along +Y, in front of the cube)
addDimensionLine({
  scene,
  start: new THREE.Vector3(-x / 2 - dimensionLineOffset, y / 2, z / 2),
  end: new THREE.Vector3(-x / 2 - dimensionLineOffset, y / 2, -z / 2),
  label: z.toString(),
  color: 0x0000ff,
  textColor: "#00f",
  textSize,
});

// Add vertices at cube corners
addVertices(scene, x, y, z);

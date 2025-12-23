import "./style.css";
console.log("Hello, World!", Math.random());
import * as THREE from "three/webgpu";
import { OrbitControls } from "three-stdlib";

const scene = new THREE.Scene();

const renderer = new THREE.WebGPURenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
camera.position.y = 5;
camera.position.x = 5;
camera.lookAt(0, 0, 0);
scene.add(camera);

const geometry = new THREE.BoxGeometry(5, 1, 1);

// Create an array of materials for each face:
// [right, left, top, bottom, front, back]
const materials = [
  new THREE.MeshBasicMaterial({ color: 0x0000ff }), // +X (right)  -> blue (zx plane)
  new THREE.MeshBasicMaterial({ color: 0x0000ff }), // -X (left)   -> blue (zx plane)
  new THREE.MeshBasicMaterial({ color: 0xff0000 }), // +Y (top)    -> red  (xy plane)
  new THREE.MeshBasicMaterial({ color: 0xff0000 }), // -Y (bottom) -> red  (xy plane)
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // +Z (front)  -> green (yz plane)
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // -Z (back)   -> green (yz plane)
];

const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

const controls = new OrbitControls(camera, renderer.domElement);

// Load camera state if available
loadCameraState(camera, controls);

controls.addEventListener("change", () => {
  saveCameraState(camera, controls);
});

scene.add(new THREE.AxesHelper(10));

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

/**
 * Adds a dimension line with arrows, perpendicular ticks, and a label.
 * @param {Object} options - Options object.
 * @param {THREE.Scene} options.scene - The scene to add to.
 * @param {THREE.Vector3} options.start - Start point of the dimension line.
 * @param {THREE.Vector3} options.end - End point of the dimension line.
 * @param {string} options.label - The text to display.
 * @param {THREE.Color} [options.color=0x000000] - Color of the line and arrows.
 * @param {number} [options.tickSize=0.2] - Length of the perpendicular ticks.
 * @param {string} [options.textColor='#000'] - CSS color for the label text.
 * @param {number} [options.textSize=32] - Font size in px for the label text.
 */
function addDimensionLine({
  scene,
  start,
  end,
  label,
  color = 0x000000,
  tickSize = 0.2,
  textColor = "#000",
  textSize = 32,
}) {
  // Calculate direction and midpoint
  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const length = start.distanceTo(end);
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  // Perpendicular vector for ticks (choose a world axis not parallel to dir)
  let perp = new THREE.Vector3(0, 1, 0);
  const perpendiculaCondition = Math.abs(dir.dot(perp)) > 0.99;
  if (perpendiculaCondition) perp = new THREE.Vector3(1, 0, 0);
  perp.cross(dir).normalize();

  // Split line into two segments (interrupted in the middle)
  const gap = 0.6; // gap for the label
  const half = length / 2 - gap / 2;
  const p1 = start.clone();
  const p2 = start.clone().add(dir.clone().multiplyScalar(half));
  const p3 = end.clone();
  const p4 = end.clone().add(dir.clone().multiplyScalar(-half));
  const lengthThreshold = 1;
  const lengthConditon = length > lengthThreshold;

  // Draw the two line segments
  [
    [p1, p2],
    [p3, p4],
  ].forEach(([a, b]) => {
    const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
    const mat = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geom, mat);
    if (lengthConditon) scene.add(line);
  });

  // Add arrows at both ends
  [start, end].forEach((point, i) => {
    // const arrowDirCondition = length > lengthThreshold ? dir : dir.clone().negate();
    const arrowDir = i !== 0 ? dir : dir.clone().negate();
    if (!lengthConditon) arrowDir.negate();
    const arrowOrigin = point; //.subVectors(point, arrowDir.clone().multiplyScalar(0.1));
    const arrowLength = 0;
    const arrowColor = color;
    const arrowHeadLength = 0.2;
    const arrowHeadWidth = 0.1;
    const arrow = new THREE.ArrowHelper(
      arrowDir,
      arrowOrigin,
      arrowLength,
      arrowColor,
      arrowHeadLength,
      arrowHeadWidth
    );
    scene.add(arrow);

    // Add perpendicular tick
    const tickGeom = new THREE.BufferGeometry().setFromPoints([
      point.clone().add(perp.clone().multiplyScalar(tickSize / 2)),
      point.clone().add(perp.clone().multiplyScalar(-tickSize / 2)),
    ]);
    const tick = new THREE.Line(
      tickGeom,
      new THREE.LineBasicMaterial({ color })
    );
    // console.log(color);
    scene.add(tick);
  });

  // Add label as a sprite
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = `${textSize}px Arial`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 128, 32);
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.5, 0.4, 1);
  sprite.position.copy(mid).add(perp.clone().multiplyScalar(tickSize * 1.2));
  scene.add(sprite);
}

// Example usage for your cube (5, 1, 1) centered at (0,0,0)
const x = 5,
  y = 1,
  z = 1;
const dimensionLineOffset = 0.4;

// X dimension (along +Y, above the cube)
addDimensionLine({
  scene,
  start: new THREE.Vector3(-x / 2, y / 2 + dimensionLineOffset, z / 2),
  end: new THREE.Vector3(x / 2, y / 2 + dimensionLineOffset, z / 2),
  label: x.toString(),
  color: 0xff0000,
  textColor: "#f00",
  textSize: 32,
});

// Y dimension (along +X, right of the cube)
addDimensionLine({
  scene,
  start: new THREE.Vector3(x / 2 + dimensionLineOffset, -y / 2, z / 2),
  end: new THREE.Vector3(x / 2 + dimensionLineOffset, y / 2, z / 2),
  label: y.toString(),
  color: 0x00ff00,
  textColor: "#0a0",
  textSize: 32,
});

// Z dimension (along +Y, in front of the cube)
addDimensionLine({
  scene,
  start: new THREE.Vector3(-x / 2 - dimensionLineOffset, y / 2, z / 2),
  end: new THREE.Vector3(-x / 2 - dimensionLineOffset, y / 2, -z / 2),
  label: z.toString(),
  color: 0x0000ff,
  textColor: "#00f",
  textSize: 32,
});

// Add a point at each vertex of the cube
const vertices = [
  // x, y, z for each corner
  [-x / 2, -y / 2, -z / 2],
  [-x / 2, -y / 2,  z / 2],
  [-x / 2,  y / 2, -z / 2],
  [-x / 2,  y / 2,  z / 2],
  [ x / 2, -y / 2, -z / 2],
  [ x / 2, -y / 2,  z / 2],
  [ x / 2,  y / 2, -z / 2],
  [ x / 2,  y / 2,  z / 2],
];

vertices.forEach(([vx, vy, vz]) => {
  const pointGeometry = new THREE.SphereGeometry(0.07, 16, 16);
  const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const point = new THREE.Mesh(pointGeometry, pointMaterial);
  point.position.set(vx, vy, vz);
  scene.add(point);
});

// Utility functions to save/load camera position and target
function saveCameraState(camera, controls) {
  const state = {
    position: camera.position.toArray(),
    target: controls.target.toArray(),
  };
  localStorage.setItem("cameraState", JSON.stringify(state));
}

function loadCameraState(camera, controls) {
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

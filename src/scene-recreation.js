import * as THREE from "three/webgpu";
import { createBlock, createBlock1, createBlock2 } from "./scene-setup.js";
import { addDimensionLine } from "./dimensionLine.js";
import { addVertices } from "./vertices.js";
import { createCloneGroups, changeGroupColor } from "./scene-utils.js";

/**
 * Recreate the scene with blocks, dimension lines, vertices, and clones
 * @param {Object} params - Parameters object
 * @param {THREE.Scene} params.scene - The scene to populate
 * @param {Object} params.dimensionState - Dimension state object
 * @param {Object} params.blockRenderState - Block render state object
 * @param {number} params.blockThickness - Size of blocks thickness
 * @param {number} params.gapSize - Gap size between blocks
 * @returns {Object} Object containing the main group and clone groups
 */
export function recreateScene({ scene, dimensionState, blockRenderState, blockThickness, gapSize }) {
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
  const group = new THREE.Group();
  scene.add(group);
  group.add(new THREE.AxesHelper(6));

  // Update block configurations
  const block1Configuration = {
    width: dimensionState.dimension1,
    height: blockThickness,
    depth: blockThickness,
    color: 0xff0000,
  };
  const block2Configuration = {
    width: blockThickness,
    height: dimensionState.dimension2,
    depth: blockThickness,
    color: 0x00ff00,
  };
  const block3Configuration = {
    width: blockThickness,
    height: dimensionState.dimension3,
    depth: blockThickness,
    color: 0x0000ff,
  };

  // Choose block creation function based on render style
  let block1, block2, block3;

  if (blockRenderState.style === "coloredFaces") {
    // Colored faces style - uses createBlock1 which ignores color parameter
    block1 = createBlock1(block1Configuration);
    block2 = createBlock1(block2Configuration);
    block3 = createBlock1(block3Configuration);
  } else {
    // Use standard block creation for singleColor and unifiedColor
    // We'll apply the unified color afterwards if needed
    block1 = createBlock(block1Configuration);
    block2 = createBlock(block2Configuration);
    block3 = createBlock(block3Configuration);
  }

  group.add(block1);
  group.add(block2);
  group.add(block3);

  // Apply unified color to the main group if selected
  if (blockRenderState.style === "unifiedColor") {
    changeGroupColor(group, blockRenderState.unifiedColor);
  }

  block2.position.x = dimensionState.dimension1 / 2 - blockThickness / 2; // small offset to avoid z-fighting
  block2.position.y =
    dimensionState.dimension2 / 2 + blockThickness / 2 + gapSize; // small offset to avoid z-fighting
  block2.position.z = 0;

  block3.position.x = -dimensionState.dimension1 / 2 + blockThickness / 2; // small offset to avoid z-fighting
  block3.position.y =
    dimensionState.dimension3 / 2 + blockThickness / 2 + gapSize; // small offset to avoid z-fighting
  block3.position.z = 0;

  // Update dimension lines
  const x = dimensionState.dimension1;
  const y = blockThickness;
  const z = blockThickness;
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

  // Create and position the cloned groups
  const clones = createCloneGroups(
    group,
    scene,
    dimensionState,
    blockThickness,
    gapSize
  );

  // Apply coloring to clones if using unified color and clone colors are enabled
  if (blockRenderState.style === "unifiedColor" && blockRenderState.useCloneColors) {
    if (clones.groupClone1) changeGroupColor(clones.groupClone1, blockRenderState.cloneColor1);
    if (clones.groupClone2) changeGroupColor(clones.groupClone2, blockRenderState.cloneColor2);
    if (clones.groupClone3) changeGroupColor(clones.groupClone3, blockRenderState.cloneColor3);
    if (clones.groupClone4) changeGroupColor(clones.groupClone4, blockRenderState.cloneColor4);
    if (clones.groupClone5) changeGroupColor(clones.groupClone5, blockRenderState.cloneColor5);
  }

  return {
    group,
    ...clones
  };

}


/**
 * Recursively change material colors in a group by cloning materials first
 * This ensures cloned groups don't share material references with the original
 * @param {THREE.Object3D} object - The object to traverse
 * @param {number} color - The color to apply
 */
export function changeGroupColor(object, color) {
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

/**
 * Create and position cloned groups
 * @param {THREE.Group} group - The original group to clone
 * @param {THREE.Scene} scene - The scene to add clones to
 * @param {Object} dimensionState - Dimension state object
 * @param {number} blockThickness - Size of blocks thickness
 * @param {number} gapSize - Gap size between blocks
 * @returns {Object} Object containing all cloned groups
 */
export function createCloneGroups(group, scene, dimensionState, blockThickness, gapSize) {
  const clones = {};

  clones.groupClone1 = group.clone();
  clones.groupClone1.rotateX(-Math.PI * 0.5);
  clones.groupClone1.rotateZ(Math.PI * 0.5);
  clones.groupClone1.position.x = -(
    dimensionState.dimension1 * 0.5 -
    dimensionState.dimension2 -
    0.5 * blockThickness
  );
  clones.groupClone1.position.y =
    blockThickness + dimensionState.dimension3 + gapSize * 2;
  clones.groupClone1.position.z =
    dimensionState.dimension1 * 0.5 - blockThickness * 0.5;
  scene.add(clones.groupClone1);

  clones.groupClone2 = group.clone();
  clones.groupClone2.rotateX(Math.PI * 0.5);
  clones.groupClone2.rotateY(Math.PI * 0.5);
  clones.groupClone2.position.x = -(dimensionState.dimension1 * 0.5 - blockThickness * 0.5) + dimensionState.dimension2 - dimensionState.dimension3 - blockThickness;
  clones.groupClone2.position.y = dimensionState.dimension3 + blockThickness * 1.5 - dimensionState.dimension1 * 0.5;
  clones.groupClone2.position.z = dimensionState.dimension1 - dimensionState.dimension2 - blockThickness
  scene.add(clones.groupClone2);

  clones.groupClone3 = group.clone();
  clones.groupClone3.rotateZ(Math.PI);
  clones.groupClone3.position.x = dimensionState.dimension2 - dimensionState.dimension3 - blockThickness
  clones.groupClone3.position.y = dimensionState.dimension3 - dimensionState.dimension1 + dimensionState.dimension2 + blockThickness * 2;
  clones.groupClone3.position.z = dimensionState.dimension1 - dimensionState.dimension2 + dimensionState.dimension3
  scene.add(clones.groupClone3);

  clones.groupClone4 = group.clone();
  clones.groupClone4.rotateX(-Math.PI * 0.5);
  clones.groupClone4.rotateZ(-Math.PI * 0.5);
  clones.groupClone4.position.x =
    -dimensionState.dimension1 * 0.5
    + dimensionState.dimension2
    - dimensionState.dimension3
    + dimensionState.dimension1
    - dimensionState.dimension2
    - blockThickness * 1.5
    ;
  clones.groupClone4.position.y =
    + dimensionState.dimension3
    - dimensionState.dimension1
    + dimensionState.dimension2
    - dimensionState.dimension3
    + blockThickness
    ;
  clones.groupClone4.position.z = dimensionState.dimension1 * 0.5 - dimensionState.dimension2 + dimensionState.dimension3 + blockThickness * 0.5;
  scene.add(clones.groupClone4);

  clones.groupClone5 = group.clone();
  clones.groupClone5.rotateX(-Math.PI * 0.5);
  clones.groupClone5.rotateY(Math.PI * 0.5);
  clones.groupClone5.position.x =
    - dimensionState.dimension1 * 0.5
    + dimensionState.dimension2
    - dimensionState.dimension3
    + dimensionState.dimension1
    - dimensionState.dimension2
    + dimensionState.dimension3
    - blockThickness * .5
  clones.groupClone5.position.y =
    + dimensionState.dimension3
    - dimensionState.dimension1
    + dimensionState.dimension2
    - dimensionState.dimension3
    + dimensionState.dimension1 * 0.5
    + blockThickness * 0.5;
  clones.groupClone5.position.z =
    + dimensionState.dimension1
    - dimensionState.dimension2
    + dimensionState.dimension3
    - dimensionState.dimension1
    + dimensionState.dimension2
    + blockThickness
  scene.add(clones.groupClone5);

  return clones;
}



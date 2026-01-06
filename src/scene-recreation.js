import * as THREE from "three/webgpu";
import { createBlock, createBlock1, createHollowBlock } from "./scene-setup.js";
import { addDimensionLine } from "./dimensionLine.js";
import { addVertices } from "./vertices.js";
import { createCloneGroups, changeGroupColor } from "./scene-utils.js";

// --- Strategy Pattern for Block Rendering ---

class RenderingStrategy {
  createBlocks(configs) {
    throw new Error("createBlocks must be implemented");
  }
  applyMainGroup(group, blockRenderState) { }
  applyClones(clones, blockRenderState) { }
}

class ColoredFacesStrategy extends RenderingStrategy {
  createBlocks({ b1, b2, b3 }) {
    return {
      block1: createBlock1(b1),
      block2: createBlock1(b2),
      block3: createBlock1(b3),
    };
  }
}

class SingleColorStrategy extends RenderingStrategy {
  createBlocks({ b1, b2, b3 }) {
    return {
      block1: createBlock(b1),
      block2: createBlock(b2),
      block3: createBlock(b3),
    };
  }
}

class HollowStrategy extends RenderingStrategy {
  createBlocks({ b1, b2, b3 }) {
    return {
      block1: createHollowBlock(b1),
      block2: createHollowBlock({ ...b2, exclude: ["horizontals"] }),
      block3: createHollowBlock({ ...b3, exclude: ["horizontals"] }),
    };
  }
}

class UnifiedColorStrategy extends SingleColorStrategy {
  applyMainGroup(group, blockRenderState) {
    changeGroupColor(group, blockRenderState.unifiedColor);
  }
  applyClones(clones, blockRenderState) {
    if (blockRenderState.useCloneColors) {
      if (clones.groupClone1) changeGroupColor(clones.groupClone1, blockRenderState.cloneColor1);
      if (clones.groupClone2) changeGroupColor(clones.groupClone2, blockRenderState.cloneColor2);
      if (clones.groupClone3) changeGroupColor(clones.groupClone3, blockRenderState.cloneColor3);
      if (clones.groupClone4) changeGroupColor(clones.groupClone4, blockRenderState.cloneColor4);
      if (clones.groupClone5) changeGroupColor(clones.groupClone5, blockRenderState.cloneColor5);
    }
  }
}

// --- Decorator Pattern for Scene Additives ---

class SceneRecreator {
  recreate(params) {
    throw new Error("recreate must be implemented");
  }
}

class BaseRecreator extends SceneRecreator {
  recreate(params) {
    const { scene, dimensionState, blockRenderState, blockThickness, gapSize } = params;

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

    const configs = {
      b1: { width: dimensionState.dimension1, height: blockThickness, depth: blockThickness, color: 0xff0000 },
      b2: { width: blockThickness, height: dimensionState.dimension2, depth: blockThickness, color: 0x00ff00 },
      b3: { width: blockThickness, height: dimensionState.dimension3, depth: blockThickness, color: 0x0000ff },
    };

    // Strategy Selection
    let strategy;
    if (blockRenderState.style === "coloredFaces") {
      strategy = new ColoredFacesStrategy();
    } else if (blockRenderState.style === "unifiedColor") {
      strategy = new UnifiedColorStrategy();
    } else if (blockRenderState.style === "hollow") {
      strategy = new HollowStrategy();
    } else if (blockRenderState.style === "singleColor") {
      strategy = new SingleColorStrategy();
    } else {
      strategy = new SingleColorStrategy();
      console.warn("Invalid block render style, using singleColor");
    }

    const { block1, block2, block3 } = strategy.createBlocks(configs);
    group.add(block1);
    group.add(block2);
    group.add(block3);

    strategy.applyMainGroup(group, blockRenderState);

    block2.position.x = dimensionState.dimension1 / 2 - blockThickness / 2;
    block2.position.y = dimensionState.dimension2 / 2 + blockThickness / 2 + gapSize;
    block2.position.z = 0;

    block3.position.x = -dimensionState.dimension1 / 2 + blockThickness / 2;
    block3.position.y = dimensionState.dimension3 / 2 + blockThickness / 2 + gapSize;
    block3.position.z = 0;

    const clones = createCloneGroups(group, scene, dimensionState, blockThickness, gapSize);
    strategy.applyClones(clones, blockRenderState);

    return { group, ...clones };
  }
}

class RecreatorDecorator extends SceneRecreator {
  constructor(component) {
    super();
    this.component = component;
  }
  recreate(params) {
    return this.component.recreate(params);
  }
}

class DimensionLineDecorator extends RecreatorDecorator {
  recreate(params) {
    const result = super.recreate(params);
    const { scene, dimensionState, blockThickness } = params;

    const x = dimensionState.dimension1;
    const y = blockThickness;
    const z = blockThickness;
    const dimensionLineOffset = 0.4;
    const textSize = 16;

    addDimensionLine({
      object3d: scene,
      start: new THREE.Vector3(-x / 2, y / 2 + dimensionLineOffset, z / 2),
      end: new THREE.Vector3(x / 2, y / 2 + dimensionLineOffset, z / 2),
      label: x.toString(),
      color: 0xff0000,
      textColor: "#f00",
      textSize,
    });

    addDimensionLine({
      object3d: scene,
      start: new THREE.Vector3(x / 2 + dimensionLineOffset, -y / 2, z / 2),
      end: new THREE.Vector3(x / 2 + dimensionLineOffset, y / 2, z / 2),
      label: y.toString(),
      color: 0x00ff00,
      textColor: "#0a0",
      textSize,
    });

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

    return result;
  }
}

class VertexDecorator extends RecreatorDecorator {
  recreate(params) {
    const result = super.recreate(params);
    const { scene, dimensionState, blockThickness } = params;
    addVertices(scene, dimensionState.dimension1, blockThickness, blockThickness);
    return result;
  }
}

/**
 * Recreate the scene with blocks, dimension lines, vertices, and clones
 */
export function recreateScene(params) {
  let recreator = new BaseRecreator();

  if (params.blockRenderState.showDimensionLines) {
    recreator = new DimensionLineDecorator(recreator);
  }

  if (params.blockRenderState.showVertices) {
    recreator = new VertexDecorator(recreator);
  }

  return recreator.recreate(params);
}

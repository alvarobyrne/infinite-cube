import * as THREE from "three/webgpu";
import { createBlock, createBlock1, createHollowBlock, createMultiColorPlaneBlock, createMultiColorBoxBlock } from "./scene-setup.js";
import { addDimensionLine } from "./dimensionLine.js";
import { addVertices } from "./vertices.js";
import { createCloneGroups, changeGroupColor, changeGroupFaceColors, granularGroupFacesColorsChange } from "./scene-utils.js";

// --- Strategy Pattern for Block Rendering ---

class RenderingStrategy {
  createBlocks(configs, blockRenderState) {
    throw new Error("createBlocks must be implemented");
  }
  applyMainGroup(group, blockRenderState) { }
  applyClones(clones, blockRenderState) { }
}

class ColoredFacesStrategy extends RenderingStrategy {
  createBlocks({ b1, b2, b3 }, blockRenderState) {
    return {
      block1: createBlock1(b1),
      block2: createBlock1(b2),
      block3: createBlock1(b3),
    };
  }
}

class SingleColorStrategy extends RenderingStrategy {
  createBlocks({ b1, b2, b3 }, blockRenderState) {
    return {
      block1: createBlock(b1),
      block2: createBlock(b2),
      block3: createBlock(b3),
    };
  }
}

class HollowStrategy extends RenderingStrategy {
  createBlocks({ b1, b2, b3 }, blockRenderState) {
    return {
      block1: createHollowBlock(b1),
      block2: createHollowBlock({ ...b2, exclude: ["horizontals"] }),
      block3: createHollowBlock({ ...b3, exclude: ["horizontals"] }),
    };
  }
}
class MultiColorPlaneStrategy extends RenderingStrategy {
  createBlocks({ b1, b2, b3 }, blockRenderState) {
    const { multiColor1, multiColor2, multiColor3, multiColor4 } = blockRenderState;
    return {
      block1: createMultiColorPlaneBlock({
        ...b1,
        colorFront: multiColor3,
        colorBack: multiColor1,
        colorTop: multiColor2,
        colorBottom: multiColor4,
        colorLeft: multiColor4,
        colorRight: multiColor4,
      }),
      block2: createMultiColorPlaneBlock({
        ...b2,
        colorFront: multiColor3,
        colorBack: multiColor1,
        colorLeft: multiColor2,
        colorRight: multiColor4,
        exclude: ["top", "bottom"],
      }),
      block3: createMultiColorPlaneBlock({
        ...b3,
        colorFront: multiColor3,
        colorBack: multiColor1,
        colorLeft: multiColor4,
        colorRight: multiColor2,
        exclude: ["top", "bottom"],
      }),
    };
  }
}

class MultiColorBoxStrategy extends RenderingStrategy {
  createBlocks({ b1, b2, b3 }, blockRenderState) {
    const { multiColor1, multiColor2, multiColor3, multiColor4 } = blockRenderState;
    return {
      block1: createMultiColorBoxBlock({
        ...b1,
        colorFront: multiColor1,
        colorBack: multiColor2,
        colorTop: multiColor3,
        colorBottom: multiColor4,
        colorLeft: multiColor4,
        colorRight: multiColor4,
      }),
      block2: createMultiColorBoxBlock({
        ...b2,
        colorFront: multiColor1,
        colorBack: multiColor2,
        colorTop: multiColor2,
        colorBottom: multiColor4,
        colorLeft: multiColor3,
        colorRight: multiColor4,
      }),
      block3: createMultiColorBoxBlock({
        ...b3,
        colorFront: multiColor1,
        colorBack: multiColor2,
        colorTop: 0,
        colorBottom: 0,
        colorLeft: multiColor4,
        colorRight: multiColor3,
      }),
    };
  }

  applyClones(clones, blockRenderState) {
    if (clones.groupClone1) {
      changeGroupFaceColors(clones.groupClone1, {
        colorFront: 0xff00ff, colorBack: 0x550055,
        colorTop: 0x00ffff, colorBottom: 0x005555,
        colorLeft: 0xffff00, colorRight: 0x555500
      });
    }
    if (clones.groupClone2) {
      changeGroupFaceColors(clones.groupClone2, {
        colorFront: 0xffa500, colorBack: 0x804000,
        colorTop: 0x800080, colorBottom: 0x400040,
        colorLeft: 0x008000, colorRight: 0x004000
      });
    }
    // and so on for other clones...
  }
}
class GranularColorStrategy extends MultiColorBoxStrategy {

  applyClones(clones, blockRenderState) {
    const { multiColor1, multiColor2, multiColor3, multiColor4 } = blockRenderState;
    const config = {
      groupClone1: {
        block1: { colorFront: multiColor4, colorBack: multiColor3, colorTop: multiColor1, colorBottom: multiColor2, colorLeft: multiColor2, colorRight: multiColor2 },
        block2: { colorFront: multiColor4, colorBack: multiColor3, colorTop: multiColor4, colorBottom: 0, colorLeft: multiColor1, colorRight: multiColor2 },
        block3: { colorFront: multiColor4, colorBack: multiColor3, colorTop: 0, colorBottom: 0, colorLeft: multiColor2, colorRight: multiColor1 },
      },
      groupClone2: {
        block1: { colorFront: multiColor1, colorBack: multiColor2, colorTop: multiColor3, colorBottom: multiColor4, colorLeft: multiColor4, colorRight: multiColor4 },
        block2: { colorFront: multiColor1, colorBack: multiColor2, colorTop: multiColor2, colorBottom: 0, colorLeft: multiColor3, colorRight: multiColor4 },
        block3: { colorFront: multiColor1, colorBack: multiColor2, colorTop: 0, colorBottom: 0, colorLeft: multiColor4, colorRight: multiColor3 },
      },
      groupClone3: {
        block1: { colorFront: multiColor4, colorBack: multiColor3, colorTop: multiColor1, colorBottom: multiColor2, colorLeft: multiColor2, colorRight: multiColor2 },
        block2: { colorFront: multiColor4, colorBack: multiColor3, colorTop: multiColor4, colorBottom: 0, colorLeft: multiColor1, colorRight: multiColor2 },
        block3: { colorFront: multiColor4, colorBack: multiColor3, colorTop: 0, colorBottom: 0, colorLeft: multiColor2, colorRight: multiColor1 },
      },
      // clone 4's color is the same as the original group so there is no need to change it
      groupClone5: {
        block1: { colorFront: multiColor4, colorBack: multiColor3, colorTop: multiColor1, colorBottom: multiColor2, colorLeft: multiColor2, colorRight: multiColor2 },
        block2: { colorFront: multiColor4, colorBack: multiColor3, colorTop: multiColor4, colorBottom: 0, colorLeft: multiColor1, colorRight: multiColor2 },
        block3: { colorFront: multiColor4, colorBack: multiColor3, colorTop: 0, colorBottom: 0, colorLeft: multiColor2, colorRight: multiColor1 },
      },

    };

    if (clones.groupClone1) granularGroupFacesColorsChange(clones.groupClone1, config.groupClone1);
    if (clones.groupClone2) granularGroupFacesColorsChange(clones.groupClone2, config.groupClone2);
    if (clones.groupClone3) granularGroupFacesColorsChange(clones.groupClone3, config.groupClone3);
    if (clones.groupClone5) granularGroupFacesColorsChange(clones.groupClone5, config.groupClone5);
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
    } else if (blockRenderState.style === "multiColorPlanes") {
      strategy = new MultiColorPlaneStrategy();
    } else if (blockRenderState.style === "multiColorBox") {
      strategy = new MultiColorBoxStrategy();
    } else if (blockRenderState.style === "granularColor") {
      strategy = new GranularColorStrategy();
    } else if (blockRenderState.style === "singleColor") {
      strategy = new SingleColorStrategy();
    } else {
      strategy = new SingleColorStrategy();
      console.warn("Invalid block render style, using singleColor");
    }

    const { block1, block2, block3 } = strategy.createBlocks(configs, blockRenderState);
    block1.name = "block1";
    block2.name = "block2";
    block3.name = "block3";
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

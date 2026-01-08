import * as THREE from "three/webgpu";
import { addDimensionLine } from "./dimensionLine.js";
import { addVertices } from "./vertices.js";
import { createCloneGroups } from "./scene-utils.js";
import {
    ColoredFacesStrategy,
    UnifiedColorStrategy,
    HollowStrategy,
    MultiColorPlaneStrategy,
    MultiColorBoxStrategy,
    GranularColorStrategy,
    SingleColorStrategy
} from "./block-strategies.js";

// --- Decorator Pattern for Scene Additives ---

export class SceneRecreator {
    recreate(params) {
        throw new Error("recreate must be implemented");
    }
}

export class BaseRecreator extends SceneRecreator {
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

export class RecreatorDecorator extends SceneRecreator {
    constructor(component) {
        super();
        this.component = component;
    }
    recreate(params) {
        return this.component.recreate(params);
    }
}

export class DimensionLineDecorator extends RecreatorDecorator {
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

export class VertexDecorator extends RecreatorDecorator {
    recreate(params) {
        const result = super.recreate(params);
        const { scene, dimensionState, blockThickness } = params;
        addVertices(scene, dimensionState.dimension1, blockThickness, blockThickness);
        return result;
    }
}

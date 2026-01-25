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
    SingleColorStrategy,
    ColoredFacedWHDStrategy,
    UshapeBaseStrategy,
    WHDBaseStrategy,
    SingleColorWHDStrategy,
    UnifiedColorWHDStrategy,
    MultiColorWHDStrategy,
    PerDimensionColorWHDStrategy,
    PerBarTypeColorWHDStrategy,
    PerBarTypeLightenColorWHDStrategy,
    GranularColorWHDStrategy
} from "./block-strategies.js";
import { createTextNumberMesh } from "./text-manager.js";


export const STRATEGY_TYPES = {
    USHAPE_BASE: "UshapeBaseStrategy",
    WHD_BASE: "WHDBaseStrategy"
};

export let activeStrategyType = STRATEGY_TYPES.USHAPE_BASE;

// --- Decorator Pattern for Scene Additives ---

export class SceneRecreator {
    recreate(params) {
        throw new Error("recreate must be implemented");
    }
}

export class BaseRecreator extends SceneRecreator {
    recreate(params) {
        const { scene, blockRenderState } = params;

        // Clear the scene except for camera
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }

        const light = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light);
        const light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(10, 10, 10);
        scene.add(light1);

        // Strategy Selection
        let strategy, whdStrategy;
        if (blockRenderState.style === "coloredFaces") {
            strategy = new ColoredFacesStrategy();//createBlock1
        } else if (blockRenderState.style === "unifiedColor") {
            strategy = new UnifiedColorStrategy();//createBlock since it extends singlecolor
        } else if (blockRenderState.style === "hollow") {
            strategy = new HollowStrategy();
        } else if (blockRenderState.style === "multiColorPlanes") {
            strategy = new MultiColorPlaneStrategy();
        } else if (blockRenderState.style === "multiColorBox") {
            strategy = new MultiColorBoxStrategy();
        } else if (blockRenderState.style === "granularColor") {
            strategy = new GranularColorStrategy();
        } else if (blockRenderState.style === "singleColor") {
            strategy = new SingleColorStrategy();//createBlock
        } else if (blockRenderState.style === "coloredFacedWHD") {
            strategy = new ColoredFacedWHDStrategy();//createBlock
        } else if (blockRenderState.style === "singleColorWHD") {
            strategy = new SingleColorWHDStrategy();//createBlock1
        } else if (blockRenderState.style === "unifiedColorWHD") {
            strategy = new UnifiedColorWHDStrategy();//createBlock1
        } else if (blockRenderState.style === "multiColorWHD") {
            strategy = new MultiColorWHDStrategy();
        } else if (blockRenderState.style === "perDimensionColorWHD") {
            strategy = new PerDimensionColorWHDStrategy();
        } else if (blockRenderState.style === "perBarTypeColorWHD") {
            strategy = new PerBarTypeColorWHDStrategy();
        } else if (blockRenderState.style === "perBarTypeLightenColorWHD") {
            strategy = new PerBarTypeLightenColorWHDStrategy();
        } else if (blockRenderState.style === "granularColorWHD") {
            strategy = new GranularColorWHDStrategy();
        } else {
            strategy = new SingleColorStrategy();
            console.warn("Invalid block render style, using singleColor");
        }

        // Set the active strategy type based on the instance's class hierarchy
        if (strategy instanceof WHDBaseStrategy) {
            activeStrategyType = STRATEGY_TYPES.WHD_BASE;
        } else if (strategy instanceof UshapeBaseStrategy) {
            activeStrategyType = STRATEGY_TYPES.USHAPE_BASE;
        } else {
            activeStrategyType = STRATEGY_TYPES.USHAPE_BASE;
        }

        const result = strategy.execute(params);
        const group = new THREE.Group();
        group.add(result.group);
        if (result.groupClone1) group.add(result.groupClone1);
        if (result.groupClone2) group.add(result.groupClone2);
        if (result.groupClone3) group.add(result.groupClone3);
        if (result.groupClone4) group.add(result.groupClone4);
        if (result.groupClone5) group.add(result.groupClone5);
        const scale = blockRenderState.scale;
        group.scale.set(scale, scale, scale);
        group.position.set(blockRenderState.x, blockRenderState.y, blockRenderState.z)
        scene.add(group);
        return result;
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

export class WHDDimensionLineDecorator extends RecreatorDecorator {
    recreate(params) {
        const result = super.recreate(params);
        if (activeStrategyType !== STRATEGY_TYPES.WHD_BASE) return result;
        const textColor = "white";
        const { scene, whdState, blockRenderState } = params;
        const { width: w, height: h, depth: d, blockThickness: t, gap: g } = whdState;
        const { showDimensionLines } = blockRenderState;
        const { showTopDimensionLines, showRightDimensionLines, showFrontDimensionLines, showExtraDimensionLines, showGSGroup } = blockRenderState;
        const gap = 0.5;
        const t2 = t / 2;
        const z = t;
        const z2 = t * 0.5 + gap;
        const margin = 0.4;
        const textSize = 35;
        const leftReal = w / 2;
        const left = w / 2 + margin;
        const realRight = -w / 2;
        const left2 = leftReal - g;
        const right = -w / 2 - margin;
        const top = h - t2;
        const bottom2 = -t2;
        const front = -t2;
        const front2 = g - t2;
        const back = front2 + d;
        const back2 = back - g;
        const rightFar = right - g;
        const realRightFar = realRight - g;

        const frontGroup = new THREE.Group();
        frontGroup.visible = showDimensionLines && showFrontDimensionLines;
        scene.add(frontGroup);
        const topGroup = new THREE.Group();
        topGroup.visible = showDimensionLines && showTopDimensionLines;
        scene.add(topGroup);
        const rightGroup = new THREE.Group();
        rightGroup.visible = showDimensionLines && showRightDimensionLines;
        scene.add(rightGroup);
        const gsGroup = new THREE.Group();
        gsGroup.visible = showDimensionLines && showGSGroup;
        scene.add(gsGroup);
        const extraGroup = new THREE.Group();
        extraGroup.visible = showDimensionLines && showExtraDimensionLines;
        scene.add(extraGroup);


        const wLine2 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(left2, top, back),
            end: new THREE.Vector3(realRightFar, top, back),
            label: 'w',
            color: 'yellow',
            textColor,
            textSize,
            tickSize: 2,
        });
        topGroup.add(wLine2);

        const tLine6 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(left2, top, back2 + gap),
            end: new THREE.Vector3(left2 - t, top, back2 + gap),
            label: 't',
            color: 'red',
            textColor,
            textSize,
            tickSize: 2,
        });
        topGroup.add(tLine6);

        const tLine7 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(realRightFar + t, top, back2 + gap),
            end: new THREE.Vector3(realRightFar, top, back2 + gap),
            label: 't',
            color: 'green',
            textColor,
            textSize,
            tickSize: 2,
        });
        topGroup.add(tLine7);

        const w_2tLine = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(realRightFar + t, top, back2 + gap),
            end: new THREE.Vector3(left2 - t, top, back2 + gap),
            label: 'w-2*t',
            color: 'blue',
            textColor,
            textSize: 25,
            tickSize: 2,
        });
        topGroup.add(w_2tLine);

        const dLine1 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(left2 + gap, top, back2),
            end: new THREE.Vector3(left2 + gap, top, front),
            label: 'd',
            color: 'white',
            textColor,
            textSize,
            tickSize: 2,
        });
        topGroup.add(dLine1);

        const wLine3 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(-w / 2, top, -z2),
            end: new THREE.Vector3(w / 2, top, -z2),
            label: 'w',
            color: 'magenta',
            textColor,
            textSize,
            tickSize: 2,
        });
        topGroup.add(wLine3);

        const gLine4 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(w / 2, top + 2 * gap, -z2),
            end: new THREE.Vector3(w / 2 - g, top + 2 * gap, -z2),
            label: 'g',
            color: 'blue',
            textColor,
            textSize,
            tickSize: 2,
        });
        topGroup.add(gLine4);

        const tLine8 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(w / 2 - g, top + 2 * gap, -z2),
            end: new THREE.Vector3(w / 2 - g - t, top + 2 * gap, -z2),
            label: 't',
            color: 'red',
            textColor,
            textSize,
            tickSize: 2,
        });
        topGroup.add(tLine8);

        const w_g_tLine9 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(w / 2 - g - t, top + 2 * gap, -z2),
            end: new THREE.Vector3(-w / 2, top + 2 * gap, -z2),
            label: 'w-g-t',
            color: 'blue',
            textColor,
            textSize: 25,
            tickSize: 2,
        });
        topGroup.add(w_g_tLine9);

        const wLine1 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(-w / 2, bottom2, -z2),
            end: new THREE.Vector3(w / 2, bottom2, -z2),
            label: 'w',
            color: 'cyan',
            textColor,
            textSize,
            tickSize: 2,
        });
        frontGroup.add(wLine1);

        const hLine1 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(right, top, -z2),
            end: new THREE.Vector3(right, -t2, -z2),
            label: 'h',
            color: 'cyan',
            textColor,
            textSize,
            tickSize: 2,
        });
        frontGroup.add(hLine1);

        const hLine2 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(left + 3 * gap, top, -z2),
            end: new THREE.Vector3(left + 3 * gap, -t2, -z2),
            label: 'h',
            color: 'cyan',
            textColor,
            textSize,
            tickSize: 2,
        });
        frontGroup.add(hLine2);

        const h_2t_Line = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(right - t2, -t * 1.5 + h, -z2),
            end: new THREE.Vector3(right - t2, t2, -z2),
            label: 'h - 2t',
            color: 'cyan',
            textColor,
            textSize: 25,
            tickSize: 2,
        });
        frontGroup.add(h_2t_Line);

        const tLine = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(right - t2, top, -z2),
            end: new THREE.Vector3(right - t2, -t * 1.5 + h, -z2),
            label: 't',
            color: 'cyan',
            textColor,
            textSize: 25,
            tickSize: 2,
        });
        frontGroup.add(tLine);

        const t2Line = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(right - t2, t2, -z2),
            end: new THREE.Vector3(right - t2, -t2, -z2),
            label: 't',
            color: 'cyan',
            textColor,
            textSize: 25,
            tickSize: 2,
        });
        frontGroup.add(t2Line);

        const gLine = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(left + gap, top, -z2),
            end: new THREE.Vector3(left + gap, -g + top, -z2),
            label: 'g',
            color: 'cyan',
            textColor,
            textSize: 25,
            tickSize: 2,
        });
        frontGroup.add(gLine);

        const h_t_gLine = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(left + gap, -g + top, -z2),
            end: new THREE.Vector3(left + gap, t2, -z2),
            label: 'h-t-g',
            color: 'cyan',
            textColor,
            textSize: 25,
            tickSize: 2,
        });
        frontGroup.add(h_t_gLine);

        const tLine2 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(left + gap, t2, -z2),
            end: new THREE.Vector3(left + gap, -t2, -z2),
            label: 't',
            color: 'cyan',
            textColor,
            textSize: 25,
            tickSize: 2,
        });
        frontGroup.add(tLine2);

        const tLine9 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(right, -t2, -t2),
            end: new THREE.Vector3(right, -t2, t - t2),
            label: 't',
            color: 'white',
            textColor,
            textSize,
            tickSize: 1,
        });
        extraGroup.add(tLine9);

        const tLine10 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(left, -t2, -t2),
            end: new THREE.Vector3(left, -t2, t - t2),
            label: 't',
            color: 'white',
            textColor,
            textSize,
            tickSize: 1,
        });
        extraGroup.add(tLine10);

        const gLine2 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(rightFar, -t2, -t2),
            end: new THREE.Vector3(rightFar, -t2, g - t2),
            label: 'g',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        gsGroup.add(gLine2);

        const dLine = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(rightFar, bottom2, front2),
            end: new THREE.Vector3(rightFar, bottom2, front2 + d),
            label: 'd',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        rightGroup.add(dLine);

        const dLine2 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(rightFar, top, front2),
            end: new THREE.Vector3(rightFar, top, front2 + d),
            label: 'd',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        rightGroup.add(dLine2);

        const tLine3 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(rightFar - 3 * gap, bottom2, front2),
            end: new THREE.Vector3(rightFar - 3 * gap, bottom2, front2 + t),
            label: 't',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        rightGroup.add(tLine3);

        let x = rightFar - 3 * gap;
        let y = top + 3 * gap;

        const tLine5 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(x, y, front2),
            end: new THREE.Vector3(x, y, front2 + t),
            label: 't',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        rightGroup.add(tLine5);

        const gLine3 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(x, y, back - g),
            end: new THREE.Vector3(x, y, back),
            label: 'g',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        rightGroup.add(gLine3);

        const d_g_tLine = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(x, y, back - g),
            end: new THREE.Vector3(x, y, front2 + t),
            label: 'd-g-t',
            color: 'orange',
            textColor,
            textSize: 25,
            tickSize: 1,
        });
        rightGroup.add(d_g_tLine);

        const d_2tLine = addDimensionLine({
            object3d: scene,
            end: new THREE.Vector3(rightFar - 6 * gap, bottom2, front2 + t + d - 2 * t),
            start: new THREE.Vector3(rightFar - 6 * gap, bottom2, front2 + t),
            label: 'd-2*t',
            color: 'orange',
            textColor,
            textSize: 25,
            tickSize: 1,
        });
        rightGroup.add(d_2tLine);

        const tLine4 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(rightFar - 3 * gap, bottom2, back),
            end: new THREE.Vector3(rightFar - 3 * gap, bottom2, back - t),
            label: 't',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        rightGroup.add(tLine4);

        const hLine = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(rightFar - 3 * gap, bottom2, front2),
            end: new THREE.Vector3(rightFar - 3 * gap, bottom2 + h, front2),
            label: 'h',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        rightGroup.add(hLine);

        const hLine3 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(rightFar - 3 * gap, bottom2, back),
            end: new THREE.Vector3(rightFar - 3 * gap, top, back),
            label: 'h',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        rightGroup.add(hLine3);

        const gLine1 = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(rightFar - 3 * gap, top, back + 3 * gap),
            end: new THREE.Vector3(rightFar - 3 * gap, top - g, back + 3 * gap),
            label: 'g',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        gsGroup.add(gLine1);

        const h_g_t = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(rightFar - 3 * gap, bottom2, back + 3 * gap),
            end: new THREE.Vector3(rightFar - 3 * gap, bottom2 + h - g - t, back + 3 * gap),
            label: 'h-g-t',
            color: 'orange',
            textColor,
            textSize: 25,
            tickSize: 1,
        });
        extraGroup.add(h_g_t);

        const tGroup = addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(rightFar - 3 * gap, top - g, back + 3 * gap),
            end: new THREE.Vector3(rightFar - 3 * gap, bottom2 + h - g - t, back + 3 * gap),
            label: 't',
            color: 'orange',
            textColor,
            textSize,
            tickSize: 1,
        });
        tGroup.visible = false;

        return result;
    }
}

export class DimensionLineDecorator extends RecreatorDecorator {
    recreate(params) {
        const result = super.recreate(params);
        if (activeStrategyType !== STRATEGY_TYPES.USHAPE_BASE) return result;
        const { scene, dimensionState, blockThickness: t } = params;
        const gap = 0.5;

        const { dimension1: d1, dimension2: d2, dimension3: d3 } = dimensionState;
        const y = t;
        const z = t;
        const z2 = t * 0.5 + gap;
        const dimensionLineOffset = 0.4;
        const textSize = 20;
        const right = d1 / 2 + dimensionLineOffset;
        const left = -d1 / 2 - dimensionLineOffset;

        addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(left, y / 2, -z2),
            end: new THREE.Vector3(d1 / 2, y / 2, -z2),
            label: d1.toString(),
            color: 'red',
            textColor: "white",
            textSize,
        });

        addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(-d1 / 2, -y / 2, -z2),
            end: new THREE.Vector3(d1 / 2, -y / 2, -z2),
            label: 'd1',
            color: 'white',
            textColor: "white",
            textSize,
        });

        addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(right, -y / 2, z / 2),
            end: new THREE.Vector3(right, y / 2, z / 2),
            label: y.toString(),
            color: 'white',
            textColor: "white",
            textSize,
        });

        addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(right, y / 2, z / 2),
            end: new THREE.Vector3(right, y / 2, -z / 2),
            label: z.toString(),
            color: 'white',
            textColor: "white",
            textSize,
        });

        addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(right, -y / 2, -z / 2),
            end: new THREE.Vector3(right, y / 2, -z / 2),
            label: "t",
            color: 0xffffff,
            textColor: "white",
            textSize,
        });

        addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(left, -y / 2 + t, -z / 2),
            end: new THREE.Vector3(left, -y / 2 + t + d3, -z / 2),
            label: "d2",
            color: 'white',
            textColor: "white",
            textSize,
        });

        addDimensionLine({
            object3d: scene,
            start: new THREE.Vector3(right, -y / 2 + t, -z / 2),
            end: new THREE.Vector3(right, -y / 2 + t + d2, -z / 2),
            label: "d3",
            color: 0xffffff,
            textColor: "white",
            textSize,
        });

        return result;
    }
}

export class BlockNumberDecorator extends RecreatorDecorator {
    recreate(params) {
        const result = super.recreate(params);
        if (!params.blockRenderState.showNumbers) return result;

        const attachNumbers = (obj) => {
            if (!obj || typeof obj !== 'object') return;

            // List of objects to check for blocks
            const objectsToCheck = [obj];
            if (obj.group) objectsToCheck.push(obj.group);

            // Add all clones to check list
            for (let i = 1; i <= 5; i++) {
                if (obj[`groupClone${i}`]) objectsToCheck.push(obj[`groupClone${i}`]);
            }

            const labelType = params.blockRenderState.numberType || "largestDimension";

            const processMesh = (mesh, identifier) => {
                if (!(mesh instanceof THREE.Mesh) || mesh.userData.numberMesh) return;

                const numRaw = identifier.replace('block', '').replace('b', '');
                const num = (numRaw && !isNaN(numRaw)) ? numRaw : null;
                const size = mesh.userData.largestDimension?.size;
                let text = null;

                if (labelType === 'number') {
                    if (num) text = num;
                } else if (labelType === 'largestDimension') {
                    if (size) text = size;
                } else if (labelType === 'both') {
                    if (num && size) text = `${num}:${size}`;
                    else if (num) text = num;
                    else if (size) text = size;
                }

                if (text !== null) {
                    const numberMesh = createTextNumberMesh(text, params.blockRenderState.numberSize);
                    if (numberMesh) {
                        mesh.userData.numberMesh = numberMesh;
                    }
                }
            };

            objectsToCheck.forEach(container => {
                if (container instanceof THREE.Object3D) {
                    container.traverse(child => {
                        processMesh(child, child.name);
                    });
                }

                // Also check top-level properties of the result object
                if (container === obj) {
                    Object.keys(obj).forEach(key => {
                        processMesh(obj[key], key);
                    });
                }
            });
        };

        attachNumbers(result);

        return result;
    }
}

export class VertexDecorator extends RecreatorDecorator {
    recreate(params) {
        const result = super.recreate(params);
        if (activeStrategyType !== STRATEGY_TYPES.USHAPE_BASE) return result;
        const { scene, dimensionState, blockThickness } = params;
        addVertices(scene, dimensionState.dimension1, blockThickness, blockThickness);
        return result;
    }
}

export class XYPlaneSquareDecorator extends RecreatorDecorator {
    recreate(params) {
        const result = super.recreate(params);
        const { scene } = params;

        const size = 2;
        const points = [];
        points.push(new THREE.Vector3(-size, -size, 0));
        points.push(new THREE.Vector3(size, -size, 0));
        points.push(new THREE.Vector3(size, size, 0));
        points.push(new THREE.Vector3(-size, size, 0));
        points.push(new THREE.Vector3(-size, -size, 0));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xff00ff });
        const line = new THREE.Line(geometry, material);

        scene.add(line);
        return result;
    }
}


import * as THREE from "three/webgpu";
import { createBlock, createBlock1, createHollowBlock, createMultiColorPlaneBlock, createMultiColorBoxBlock, createLinesBlock, createTrapezoidBlock, createLine, create45AngleCornerBar, createWedgeAtBarEnds } from "./scene-setup.js";
import { changeGroupColor, changeGroupFaceColors, granularGroupFacesColorsChange, createCloneGroups } from "./scene-utils.js";
import { getNodesWHDPositions, getWHDConfigs, getWHDNodesConfigs, getWHDPositions } from "./width_height_depth/whd-utils.js";
import { themeManager } from "./theme-manager.js";


// --- Strategy Pattern for Block Rendering ---

export class RenderingStrategy {
    execute(params) {
        throw new Error("execute must be implemented");
    }
}

/**
 * Base strategy for the "U-shape" object (3 interlocking blocks + 5 clones)
 */
export class UshapeBaseStrategy extends RenderingStrategy {
    createBlocks(configs, blockRenderState) {
        throw new Error("createBlocks must be implemented");
    }
    applyMainGroup(group, blockRenderState) { }
    applyClones(clones, blockRenderState) { }

    execute(params) {
        const { scene, dimensionState, blockRenderState, blockThickness, gapSize } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = {
            b1: { width: dimensionState.dimension1, height: blockThickness, depth: blockThickness, color: themeManager.colors.dimensionLine.width },
            b2: { width: blockThickness, height: dimensionState.dimension2, depth: blockThickness, color: themeManager.colors.dimensionLine.height },
            b3: { width: blockThickness, height: dimensionState.dimension3, depth: blockThickness, color: themeManager.colors.dimensionLine.depth },
        };

        const { block1, block2, block3 } = this.createBlocks(configs, blockRenderState);
        block1.name = "block1";
        block2.name = "block2";
        block3.name = "block3";
        group.add(block1);
        group.add(block2);
        group.add(block3);

        this.applyMainGroup(group, blockRenderState);

        block2.position.x = dimensionState.dimension1 / 2 - blockThickness / 2;
        block2.position.y = dimensionState.dimension2 / 2 + blockThickness / 2 + gapSize;
        block2.position.z = 0;

        block3.position.x = -dimensionState.dimension1 / 2 + blockThickness / 2;
        block3.position.y = dimensionState.dimension3 / 2 + blockThickness / 2 + gapSize;
        block3.position.z = 0;

        const clones = createCloneGroups(group, scene, dimensionState, blockThickness, gapSize);
        this.applyClones(clones, blockRenderState);

        return { group, ...clones };
    }
}

export class ColoredFacesStrategy extends UshapeBaseStrategy {
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        const transparent = !blockRenderState.isOpaque;
        return {
            block1: createBlock1({ ...b1, transparent, opacity }),
            block2: createBlock1({ ...b2, transparent, opacity }),
            block3: createBlock1({ ...b3, transparent, opacity }),
        };
    }
}

export class SingleColorStrategy extends UshapeBaseStrategy {
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        const transparent = !blockRenderState.isOpaque;
        return {
            block1: createBlock({ ...b1, transparent, opacity }),
            block2: createBlock({ ...b2, transparent, opacity }),
            block3: createBlock({ ...b3, transparent, opacity }),
        };
    }
}

export class HollowStrategy extends UshapeBaseStrategy {
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        return {
            block1: createHollowBlock(b1),
            block2: createHollowBlock({ ...b2, exclude: ["horizontals"] }),
            block3: createHollowBlock({ ...b3, exclude: ["horizontals"] }),
        };
    }
}

export class MultiColorPlaneStrategy extends UshapeBaseStrategy {
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

export class MultiColorBoxStrategy extends UshapeBaseStrategy {
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
    }
}

export class GranularColorStrategy extends MultiColorBoxStrategy {
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

export class UnifiedColorStrategy extends SingleColorStrategy {
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
/**
 * Base strategy for the WHD (Width, Height, Depth) object (18 independent blocks)
 */
export class WHDBaseStrategy extends RenderingStrategy {
    execute(params) {
        throw new Error("execute must be implemented");
    }
}
/**
 * Strategy that renders a single box using Width, Height, Depth (WHD) state
 */
export class ColoredFacedWHDStrategy extends WHDBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDConfigs(whdState);
        const positions = getWHDPositions(configs, whdState);
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        const transparent = !blockRenderState.isOpaque;

        const blocks = {};
        for (const key in configs) {
            const block = createBlock({ ...configs[key], transparent, opacity });
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}

export class SingleColorWHDStrategy extends WHDBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDConfigs(whdState);
        const positions = getWHDPositions(configs, whdState);
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        const transparent = !blockRenderState.isOpaque;

        const blocks = {};
        for (const key in configs) {
            const block = createBlock1({ ...configs[key], transparent, opacity });
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}

export class UnifiedColorWHDStrategy extends WHDBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDConfigs(whdState);
        const positions = getWHDPositions(configs, whdState);
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        const transparent = !blockRenderState.isOpaque;

        const blocks = {};
        for (const key in configs) {
            const block = createBlock({ ...configs[key], color: blockRenderState.unifiedColor, transparent, opacity });
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}

export class MultiColorWHDStrategy extends WHDBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDConfigs(whdState);
        const positions = getWHDPositions(configs, whdState);
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        const transparent = !blockRenderState.isOpaque;
        //array in which the firts three colors are the blockrenderstate.unifiedColor, the next three are the blockrenderstate.cloneColor1, the next three are the blockrenderstate.cloneColor2, the next three are the blockrenderstate.cloneColor3, the next three are the blockrenderstate.cloneColor4, the last three are the blockrenderstate.cloneColor5
        const colorsArray = [
            blockRenderState.unifiedColor,
            blockRenderState.cloneColor1,
            blockRenderState.cloneColor2,
            blockRenderState.cloneColor3,
            blockRenderState.cloneColor4,
            blockRenderState.cloneColor5,
        ];
        //object with keys b1 to b18 in which the colors are distributed 
        const colors = {}
        const temp = Array.from({ length: 18 }, (_, i) => i);
        for (let i = 0; i < temp.length; i++) {
            colors['b' + (i + 1)] = colorsArray[Math.floor(i / 3)];
        }

        const blocks = {};
        for (const key in configs) {
            const block = createBlock({ ...configs[key], color: colors[key], transparent, opacity });
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}

export class PerDimensionColorWHDStrategy extends WHDBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDConfigs(whdState);
        const positions = getWHDPositions(configs, whdState);
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        const transparent = !blockRenderState.isOpaque;
        const widthColor = themeManager.colors.dimensionLine.width;
        const heightColor = themeManager.colors.dimensionLine.height;
        const depthColor = themeManager.colors.dimensionLine.depth;

        //object with keys b1 to b18 in which the colors are distributed 
        const colors = {
            b1: widthColor,
            b2: heightColor,
            b3: heightColor,
            b4: widthColor,
            b5: depthColor,
            b6: widthColor,
            b7: depthColor,
            b8: heightColor,
            b9: depthColor,
            b10: heightColor,
            b11: widthColor,
            b12: heightColor,
            b13: widthColor,
            b14: depthColor,
            b15: widthColor,
            b16: depthColor,
            b17: heightColor,
            b18: depthColor,
        }


        const blocks = {};
        for (const key in configs) {
            const block = createBlock({ ...configs[key], color: colors[key], transparent, opacity });
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}

export class PerBarTypeLightenColorWHDStrategy extends WHDBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDConfigs(whdState);
        const positions = getWHDPositions(configs, whdState);
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        const transparent = !blockRenderState.isOpaque;
        const widthColor = 0xff0000; // Keep explicit or map? Let's map to theme colors but need integer for bitwise operations
        // Bitwise operations on non-integer colors will fail.
        // themeManager.colors returns strings or hex references.
        // If themeManager returns strings (e.g. 'orange'), bitwise won't work.
        // I need to ensure themeManager has hex values for these if I want to use bitwise.
        // In theme-manager.js I defined dimensionLine colors as strings ('orange', 'green').
        // I should probably skip bitwise for now or use THREE.Color to darken.
        // For now I'll leave this strategy as is, as it relies on specific bitwise darkening which expects integers.
        const heightColor = 0x00ff00;
        const depthColor = 0x0000ff;

        const darkener1 = 0x000000;
        const darkener2 = 0x666666;
        const darkener3 = 0xbbbbbb;

        //object with keys b1 to b18 in which the colors are distributed 
        const colors = {
            b1: widthColor | darkener1,
            b2: heightColor | darkener1,
            b3: heightColor | darkener2,
            b4: widthColor | darkener2,
            b5: depthColor | darkener1,
            b6: widthColor | darkener3,
            b7: depthColor | darkener2,
            b8: heightColor | darkener3,
            b9: depthColor | darkener3,
            b10: heightColor | darkener1,
            b11: widthColor | darkener1,
            b12: heightColor | darkener2,
            b13: widthColor | darkener2,
            b14: depthColor | darkener1,
            b15: widthColor | darkener3,
            b16: depthColor | darkener2,
            b17: heightColor | darkener3,
            b18: depthColor | darkener3,
        }


        const blocks = {};
        for (const key in configs) {
            const block = createBlock({ ...configs[key], color: colors[key], transparent, opacity });
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}

export class PerBarTypeColorWHDStrategy extends WHDBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDConfigs(whdState);
        const positions = getWHDPositions(configs, whdState);
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        const transparent = !blockRenderState.isOpaque;

        const color1 = 'red';
        const color2 = 'green';
        const color3 = 'blue';
        const color4 = 'cyan';
        const color5 = 'magenta';
        const color6 = 'yellow';
        const color7 = 'orange';
        const color8 = 'purple';
        const color9 = 'pink';

        //object with keys b1 to b18 in which the colors are distributed 
        const colors = {
            b1: color1,
            b2: color2,
            b3: color3,
            b4: color4,
            b5: color5,
            b6: color6,
            b7: color7,
            b8: color8,
            b9: color9,
            b10: color2,
            b11: color1,
            b12: color3,
            b13: color4,
            b14: color5,
            b15: color6,
            b16: color7,
            b17: color8,
            b18: color9,
        }

        const blocks = {};
        for (const key in configs) {
            const block = createBlock({ ...configs[key], color: colors[key], transparent, opacity });
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}

export class GranularColorWHDStrategy extends WHDBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDConfigs(whdState);
        const positions = getWHDPositions(configs, whdState);
        const { multiColor1, multiColor2, multiColor3, multiColor4 } = blockRenderState;

        const granularConfigs = {
            b1: { colorFront: multiColor1, colorBack: multiColor2, colorTop: multiColor3, colorBottom: multiColor4, colorLeft: multiColor4, colorRight: multiColor4 },
            b2: { colorFront: multiColor1, colorBack: multiColor2, colorTop: multiColor2, colorBottom: multiColor4, colorLeft: multiColor3, colorRight: multiColor4 },
            b3: { colorFront: multiColor1, colorBack: multiColor2, colorTop: multiColor3, colorBottom: multiColor4, colorLeft: multiColor4, colorRight: multiColor3 },
            b4: { colorFront: multiColor1, colorBack: multiColor2, colorTop: multiColor4, colorBottom: multiColor3, colorLeft: multiColor4, colorRight: 0 },
            b5: { colorFront: multiColor2, colorBack: multiColor2, colorTop: multiColor4, colorBottom: multiColor3, colorLeft: multiColor1, colorRight: multiColor2 },
            b6: { colorFront: multiColor2, colorBack: multiColor1, colorTop: multiColor4, colorBottom: multiColor3, colorLeft: multiColor4, colorRight: multiColor4 },
            b7: { colorFront: multiColor2, colorBack: 0, colorTop: multiColor4, colorBottom: multiColor3, colorLeft: multiColor2, colorRight: multiColor1 },
            b8: { colorFront: multiColor3, colorBack: multiColor4, colorTop: multiColor4, colorBottom: multiColor4, colorLeft: multiColor2, colorRight: multiColor1 },
            b9: { colorFront: multiColor1, colorBack: multiColor2, colorTop: multiColor3, colorBottom: multiColor4, colorLeft: multiColor2, colorRight: multiColor1 },
            b10: { colorFront: multiColor4, colorBack: multiColor3, colorTop: multiColor2, colorBottom: multiColor4, colorLeft: multiColor2, colorRight: multiColor1 },
            b11: { colorFront: multiColor4, colorBack: multiColor3, colorTop: multiColor2, colorBottom: multiColor1, colorLeft: multiColor2, colorRight: multiColor2 },
            b12: { colorFront: multiColor4, colorBack: multiColor3, colorTop: multiColor3, colorBottom: multiColor4, colorLeft: multiColor1, colorRight: multiColor2 },
            b13: { colorFront: multiColor4, colorBack: multiColor3, colorTop: multiColor1, colorBottom: multiColor2, colorLeft: multiColor1, colorRight: multiColor2 },
            b14: { colorFront: multiColor4, colorBack: multiColor4, colorTop: multiColor1, colorBottom: multiColor2, colorLeft: multiColor4, colorRight: multiColor3 },
            b15: { colorFront: multiColor3, colorBack: multiColor4, colorTop: multiColor1, colorBottom: multiColor2, colorLeft: multiColor4, colorRight: multiColor2 },
            b16: { colorFront: multiColor3, colorBack: multiColor4, colorTop: multiColor1, colorBottom: multiColor2, colorLeft: multiColor3, colorRight: multiColor4 },
            b17: { colorFront: multiColor2, colorBack: multiColor1, colorTop: multiColor2, colorBottom: multiColor2, colorLeft: multiColor3, colorRight: multiColor4 },
            b18: { colorFront: multiColor2, colorBack: multiColor2, colorTop: multiColor2, colorBottom: multiColor1, colorLeft: multiColor3, colorRight: multiColor4 },
        };

        const blocks = {};
        for (const key in configs) {
            const block = createMultiColorBoxBlock({
                ...configs[key],
                ...granularConfigs[key],
            });
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}
/**
 * Base strategy for the WHD nodes (Width, Height, Depth) object (18 independent blocks)
 */
export class WHDNodesBaseStrategy extends RenderingStrategy {
    execute(params) {
        throw new Error("execute must be implemented");
    }
}

export class WHDNodesStrategy extends WHDNodesBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDNodesConfigs(whdState);
        const positions = getNodesWHDPositions(configs, whdState).positions;

        const blocks = {};
        for (const key in configs) {
            const block = createLinesBlock({ ...configs[key] });
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}
//TODO:
export class WHDNodesLineStrategy extends WHDNodesBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDNodesConfigs(whdState);
        const nodes = getNodesWHDPositions(configs, whdState).nodes;

        const blocks = {};


        const keys = Object.keys(configs)
        const length = keys.length;
        let stringOfVector3 = "\n[\n"
        keys.forEach((key, i) => {
            const nextKey = keys[(i + 1) % length];
            const n0 = nodes[key];
            // console.log("🔍 ~ execute ~ src/block-strategies.js:641 ~ n0:", n0);
            stringOfVector3 += `    new THREE.Vector3(${n0.x.toFixed(2)}, ${n0.y.toFixed(2)}, ${n0.z.toFixed(2)}),\n`
            const n1 = nodes[nextKey];
            const line = createLine(n0, n1, i);
            line.name = key;
            group.add(line);
            blocks[key] = line;
        });
        stringOfVector3 += "]"
        console.log("🔍 ~ execute ~ src/block-strategies.js:644 ~ stringOfVector3:", stringOfVector3);

        return { group };
    }
}
export class WHDNodesHollowStrategy extends WHDNodesBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDNodesConfigs(whdState);
        const { positions, nodes } = getNodesWHDPositions(configs, whdState);
        const faceExclusion = {
            b1: { exclude: 'laterals' },
            b2: { exclude: 'horizontals', isTrapezoid: true, direction: 1 },
            b3: { exclude: 'horizontals' },
            b4: { exclude: 'laterals' },
            b5: { exclude: 'verticals' },
            b6: { exclude: 'laterals' },
            b7: { exclude: 'verticals' },
            b8: { exclude: 'horizontals' },
            b9: { exclude: 'verticals' },
            b10: { exclude: 'horizontals' },
            b11: { exclude: 'laterals', isTrapezoid: true, direction: -1 },
            b12: { exclude: 'horizontals' },
            b13: { exclude: 'laterals' },
            b14: { exclude: 'verticals' },
            b15: { exclude: 'laterals' },
            b16: { exclude: 'verticals' },
            b17: { exclude: 'horizontals' },
            b18: { exclude: 'horizontals' },
        }

        const blocks = {};
        for (const key in configs) {
            // const block = createTrapezoidBlock({ ...configs[key] });
            const block = createTrapezoidBlock({
                ...configs[key],
                ...faceExclusion[key]
            });
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}

export class WHD45DegreeEndsBarStrategy extends WHDNodesBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDNodesConfigs(whdState);
        const { positions, nodes } = getNodesWHDPositions(configs, whdState);

        // turn the nodes object into an array
        const nodesArray = []
        for (const key in nodes) {
            const obj = nodes[key];
            nodesArray.push(new THREE.Vector3(obj.x, obj.y, obj.z));
        }
        nodesArray.push(nodesArray[0])

        const block = create45AngleCornerBar(whdState, nodesArray);
        group.add(block);

        return { group };
    }
}

export class WHDWedgesAtBarEndsStrategy extends WHDNodesBaseStrategy {
    execute(params) {
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDNodesConfigs(whdState);
        const { positions, nodes } = getNodesWHDPositions(configs, whdState);

        // turn the nodes object into an array
        const nodesArray = []
        for (const key in nodes) {
            const obj = nodes[key];
            nodesArray.push(new THREE.Vector3(obj.x, obj.y, obj.z));
        }
        nodesArray.push(nodesArray[0])

        const block = createWedgeAtBarEnds(whdState, nodesArray);
        group.add(block);

        return { group };
    }
}
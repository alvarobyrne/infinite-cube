import * as THREE from "three/webgpu";
import { createBlock, createBlock1, createHollowBlock, createMultiColorPlaneBlock, createMultiColorBoxBlock } from "./scene-setup.js";
import { changeGroupColor, changeGroupFaceColors, granularGroupFacesColorsChange, createCloneGroups } from "./scene-utils.js";
import { getWHDConfigs, getWHDPositions } from "./width_height_depth/whd-utils.js";


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
            b1: { width: dimensionState.dimension1, height: blockThickness, depth: blockThickness, color: 0xff0000 },
            b2: { width: blockThickness, height: dimensionState.dimension2, depth: blockThickness, color: 0x00ff00 },
            b3: { width: blockThickness, height: dimensionState.dimension3, depth: blockThickness, color: 0x0000ff },
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
        return {
            block1: createBlock1(b1),
            block2: createBlock1(b2),
            block3: createBlock1(b3),
        };
    }
}

export class SingleColorStrategy extends UshapeBaseStrategy {
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        return {
            block1: createBlock({ ...b1, transparent: true, opacity }),
            block2: createBlock({ ...b2, transparent: true, opacity }),
            block3: createBlock({ ...b3, transparent: true, opacity }),
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
 * New strategy that renders a single box using Width, Height, Depth (WHD) state
 */
export class ColoredFacedWHDStrategy extends RenderingStrategy {
    execute(params) {
        const { scene, whdState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const configs = getWHDConfigs(whdState);
        const positions = getWHDPositions(configs, whdState);

        const blocks = {};
        for (const key in configs) {
            const block = createBlock(configs[key]);
            block.name = key;
            const pos = positions[key];
            block.position.set(pos.x, pos.y, pos.z);
            group.add(block);
            blocks[key] = block;
        }

        return { group };
    }
}


import * as THREE from "three/webgpu";
import { createBlock, createBlock1, createHollowBlock, createMultiColorPlaneBlock, createMultiColorBoxBlock } from "./scene-setup.js";
import { changeGroupColor, changeGroupFaceColors, granularGroupFacesColorsChange } from "./scene-utils.js";

// --- Strategy Pattern for Block Rendering ---

export class RenderingStrategy {
    createBlocks(configs, blockRenderState) {
        throw new Error("createBlocks must be implemented");
    }
    applyMainGroup(group, blockRenderState) { }
    applyClones(clones, blockRenderState) { }
}

export class ColoredFacesStrategy extends RenderingStrategy {
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        return {
            block1: createBlock1(b1),
            block2: createBlock1(b2),
            block3: createBlock1(b3),
        };
    }
}

export class SingleColorStrategy extends RenderingStrategy {
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        return {
            block1: createBlock(b1),
            block2: createBlock(b2),
            block3: createBlock(b3),
        };
    }
}

export class HollowStrategy extends RenderingStrategy {
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        return {
            block1: createHollowBlock(b1),
            block2: createHollowBlock({ ...b2, exclude: ["horizontals"] }),
            block3: createHollowBlock({ ...b3, exclude: ["horizontals"] }),
        };
    }
}

export class MultiColorPlaneStrategy extends RenderingStrategy {
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

export class MultiColorBoxStrategy extends RenderingStrategy {
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

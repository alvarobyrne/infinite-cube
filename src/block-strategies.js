import * as THREE from "three/webgpu";
import { createBlock, createBlock1, createHollowBlock, createMultiColorPlaneBlock, createMultiColorBoxBlock } from "./scene-setup.js";
import { changeGroupColor, changeGroupFaceColors, granularGroupFacesColorsChange, createCloneGroups } from "./scene-utils.js";

// --- Strategy Pattern for Block Rendering ---

export class RenderingStrategy {
    execute(params) {
        throw new Error("execute must be implemented");
    }
}

/**
 * Base strategy for the "Infinite Cube" object (3 interlocking blocks + 5 clones)
 */
export class InfiniteCubeBaseStrategy extends RenderingStrategy {
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

export class ColoredFacesStrategy extends InfiniteCubeBaseStrategy {
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        return {
            block1: createBlock1(b1),
            block2: createBlock1(b2),
            block3: createBlock1(b3),
        };
    }
}

export class SingleColorStrategy extends InfiniteCubeBaseStrategy {
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        const opacity = blockRenderState.isOpaque ? 1 : 0.4;
        return {
            block1: createBlock({ ...b1, transparent: true, opacity }),
            block2: createBlock({ ...b2, transparent: true, opacity }),
            block3: createBlock({ ...b3, transparent: true, opacity }),
        };
    }
}

export class HollowStrategy extends InfiniteCubeBaseStrategy {
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        return {
            block1: createHollowBlock(b1),
            block2: createHollowBlock({ ...b2, exclude: ["horizontals"] }),
            block3: createHollowBlock({ ...b3, exclude: ["horizontals"] }),
        };
    }
}

export class MultiColorPlaneStrategy extends InfiniteCubeBaseStrategy {
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

export class MultiColorBoxStrategy extends InfiniteCubeBaseStrategy {
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
        const { scene, whdState, blockRenderState } = params;

        const group = new THREE.Group();
        scene.add(group);
        group.add(new THREE.AxesHelper(6));

        const gapSize = 0.05;
        const { blockThickness } = whdState;
        const t = blockThickness;
        const factor = 1.1;
        const gap = whdState.gap;
        const g = gap;
        const { width: w, height: h, depth: d } = whdState;
        const reducedWidth = w - 2 * t;
        const w_prime = w - g - t;
        const reducedHeight = h - 2 * t;
        const h_prime = h - g - t;
        const reducedDepth = d - 2 * t;
        const d_prime = d - g - t;
        const configs = {
            b1: { width: w, height: blockThickness, depth: blockThickness, color: 'red', isWireframe: false },
            b2: { width: blockThickness, height: h_prime, depth: blockThickness, color: 'lime', isWireframe: false },
            b3: {
                width: blockThickness, height: reducedHeight, depth: blockThickness,
                color: 'lightgreen',
                color: 'blue',
                isWireframe: false
            },
        };

        const { block1, block2, block3 } = this.createBlocks(configs, blockRenderState);
        block1.name = "block1";
        block2.name = "block2";
        block3.name = "block3";

        group.add(block1);
        group.add(block2);
        group.add(block3);

        block2.position.x = block1.position.x + w / 2 - t / 2;
        block2.position.y = block1.position.y + h_prime / 2 + t / 2;
        block2.position.z = block1.position.z

        block3.position.x = block1.position.x - (w / 2 - t / 2);
        block3.position.y = block1.position.y + reducedHeight / 2 + t / 2;
        block3.position.z = block1.position.z;

        configs.b4 = {
            width: w_prime,
            height: blockThickness,
            depth: blockThickness,
            color: 0xaa0000,
            color: 'lime',
            isWireframe: false
        }

        const block4 = createBlock(configs.b4);
        block4.position.x = block3.position.x + w_prime / 2 - t / 2;
        block4.position.y = block3.position.y + configs.b3.height / 2 + t / 2;
        block4.position.z = block3.position.z;
        group.add(block4);

        configs.b5 = {
            width: blockThickness,
            height: blockThickness,
            depth: d,
            color: 'blue',
            color: 'red',
            isWireframe: false
        }
        const block5 = createBlock(configs.b5);
        block5.position.x = block4.position.x + configs.b4.width / 2 + t / 2;
        block5.position.y = block4.position.y;
        block5.position.z = block4.position.z + configs.b5.depth / 2 - blockThickness / 2;
        group.add(block5);

        configs.b6 = {
            width: reducedWidth,
            height: blockThickness,
            depth: blockThickness,
            color: 'salmon',
            color: 'blue',
            isWireframe: false
        }
        const block6 = createBlock(configs.b6);
        block6.position.x = block5.position.x - configs.b6.width / 2 - blockThickness / 2;
        block6.position.y = block5.position.y;
        block6.position.z = block5.position.z + configs.b5.depth / 2 - blockThickness / 2;
        group.add(block6);

        configs.b7 = {
            width: blockThickness,
            height: blockThickness,
            depth: d_prime,
            color: 'cyan',
            color: 'lime',
            isWireframe: false
        }

        const block7 = createBlock(configs.b7);
        block7.position.x = block6.position.x - configs.b6.width / 2 - blockThickness / 2;
        block7.position.y = block6.position.y;
        block7.position.z = block6.position.z - configs.b7.depth / 2 + blockThickness / 2;
        group.add(block7);

        configs.b8 = {
            width: blockThickness,
            height: h,
            depth: blockThickness,
            color: 'green',
            color: 'red',
            isWireframe: false
        }

        const block8 = createBlock(configs.b8);
        block8.position.x = block7.position.x;
        block8.position.y = block7.position.y - configs.b8.height / 2 + blockThickness / 2;
        block8.position.z = block7.position.z - configs.b7.depth / 2 - blockThickness / 2;
        group.add(block8);

        configs.b9 = {
            width: blockThickness,
            height: blockThickness,
            depth: reducedDepth,
            color: 'blue',
            isWireframe: false
        }

        const block9 = createBlock(configs.b9);
        block9.position.x = block8.position.x;
        block9.position.y = block8.position.y - configs.b8.height / 2 + blockThickness / 2;
        block9.position.z = block8.position.z + configs.b9.depth / 2 + blockThickness / 2;
        group.add(block9);

        configs.b10 = {
            width: blockThickness,
            height: h_prime,
            depth: blockThickness,
            color: 'lightgreen',
            color: 'lime',
            isWireframe: false
        }

        const block10 = createBlock(configs.b10);
        block10.position.x = block9.position.x;
        block10.position.y = block9.position.y + configs.b10.height / 2 - blockThickness / 2;
        block10.position.z = block9.position.z + configs.b9.depth / 2 + blockThickness / 2;
        group.add(block10);

        configs.b11 = {
            width: w,
            height: blockThickness,
            depth: blockThickness,
            color: 'magenta',
            color: 'red',
            isWireframe: false,
        }

        const block11 = createBlock(configs.b11);
        block11.position.x = block10.position.x + configs.b11.width / 2 - blockThickness / 2;
        block11.position.y = block10.position.y + configs.b10.height / 2 + blockThickness / 2;
        block11.position.z = block10.position.z;
        group.add(block11);

        configs.b12 = {
            width: blockThickness,
            height: reducedHeight,
            depth: blockThickness,
            color: 'green',
            color: 'blue',
            isWireframe: false,
        }

        const block12 = createBlock(configs.b12);
        block12.position.x = block11.position.x + configs.b11.width / 2 - blockThickness / 2;
        block12.position.y = block11.position.y - configs.b12.height / 2 - blockThickness / 2;
        block12.position.z = block11.position.z;
        group.add(block12);

        configs.b13 = {
            width: w_prime,
            height: blockThickness,
            depth: blockThickness,
            color: 'red',
            color: 'lime',
            isWireframe: false
        }

        const block13 = createBlock(configs.b13);
        block13.position.x = block12.position.x - configs.b13.width / 2 + blockThickness / 2;
        block13.position.y = block12.position.y - configs.b12.height / 2 - blockThickness / 2;
        block13.position.z = block12.position.z;
        group.add(block13);

        configs.b14 = {
            width: blockThickness,
            height: blockThickness,
            depth: d,
            color: 'blue',
            color: 'red',
            isWireframe: false
        }

        const block14 = createBlock(configs.b14);
        block14.position.x = block13.position.x - configs.b13.width / 2 - blockThickness / 2;
        block14.position.y = block13.position.y;
        block14.position.z = block13.position.z - configs.b14.depth / 2 + blockThickness / 2;
        group.add(block14);

        configs.b15 = {
            width: reducedWidth,
            height: blockThickness,
            depth: blockThickness,
            color: 'yellow',
            color: 'blue',
            isWireframe: false
        }

        const block15 = createBlock(configs.b15);
        block15.position.x = block14.position.x + configs.b15.width / 2 + blockThickness / 2;
        block15.position.y = block14.position.y;
        block15.position.z = block14.position.z - configs.b14.depth / 2 + blockThickness / 2;
        group.add(block15);

        configs.b16 = {
            width: blockThickness,
            height: blockThickness,
            depth: d_prime,
            color: 'blue',
            color: 'lime',
            isWireframe: false
        }

        const block16 = createBlock(configs.b16);
        block16.position.x = block15.position.x + configs.b15.width / 2 + blockThickness / 2;
        block16.position.y = block15.position.y;
        block16.position.z = block15.position.z + configs.b16.depth / 2 - blockThickness / 2;
        group.add(block16);

        configs.b17 = {
            width: blockThickness,
            height: h,
            depth: blockThickness,
            color: 'blue',
            color: 'red',
            isWireframe: false
        }

        const block17 = createBlock(configs.b17);
        block17.position.x = block16.position.x
        block17.position.y = block16.position.y + configs.b17.height / 2 - blockThickness / 2;
        block17.position.z = block16.position.z + configs.b16.depth / 2 + blockThickness / 2;
        group.add(block17);

        configs.b18 = {
            width: blockThickness,
            height: blockThickness,
            depth: reducedDepth,
            color: 'green',
            color: 'blue',
            isWireframe: false
        }

        const block18 = createBlock(configs.b18);
        block18.position.x = block17.position.x;
        block18.position.y = block17.position.y + configs.b17.height / 2 - blockThickness / 2;
        block18.position.z = block17.position.z - configs.b18.depth / 2 - blockThickness / 2;
        group.add(block18);

        return { group };
    }
    createBlocks({ b1, b2, b3 }, blockRenderState) {
        return {
            block1: createBlock(b1),
            block2: createBlock(b2),
            block3: createBlock(b3),
        };
    }
}

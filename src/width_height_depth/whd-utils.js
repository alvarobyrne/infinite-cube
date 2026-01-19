/**
 * Calculates the dimensions for the WHD blocks.
 * @param {Object} whdState - The width, height, depth state.
 * @returns {Object} Calculated dimensions like reducedWidth, w_prime, etc.
 */
export function getWHDDimensions(whdState) {
    const { blockThickness: t, gap: g, width: w, height: h, depth: d } = whdState;
    return {
        reducedWidth: w - 2 * t,
        w_prime: w - g - t,
        reducedHeight: h - 2 * t,
        h_prime: h - g - t,
        reducedDepth: d - 2 * t,
        d_prime: d - g - t
    };
}

/**
 * Generates the configurations for the 18 blocks used in WHD (Width, Height, Depth) strategies.
 * @param {Object} whdState - The width, height, depth state from whdState.js.
 * @returns {Object} An object containing configurations for 18 blocks (b1 to b18).
 */
export function getWHDConfigs(whdState) {
    const { blockThickness: t, width: w, height: h, depth: d } = whdState;
    const { reducedWidth, w_prime, reducedHeight, h_prime, reducedDepth, d_prime } = getWHDDimensions(whdState);

    return {
        b1: { width: w, height: t, depth: t, color: 'red', isWireframe: false },
        b2: { width: t, height: h_prime, depth: t, color: 'lime', isWireframe: false },
        b3: { width: t, height: reducedHeight, depth: t, color: 'blue', isWireframe: false },
        b4: { width: w_prime, height: t, depth: t, color: 'lime', isWireframe: false },
        b5: { width: t, height: t, depth: d, color: 'red', isWireframe: false },
        b6: { width: reducedWidth, height: t, depth: t, color: 'blue', isWireframe: false },
        b7: { width: t, height: t, depth: d_prime, color: 'lime', isWireframe: false },
        b8: { width: t, height: h, depth: t, color: 'red', isWireframe: false },
        b9: { width: t, height: t, depth: reducedDepth, color: 'blue', isWireframe: false },
        b10: { width: t, height: h_prime, depth: t, color: 'lime', isWireframe: false },
        b11: { width: w, height: t, depth: t, color: 'red', isWireframe: false },
        b12: { width: t, height: reducedHeight, depth: t, color: 'blue', isWireframe: false },
        b13: { width: w_prime, height: t, depth: t, color: 'lime', isWireframe: false },
        b14: { width: t, height: t, depth: d, color: 'red', isWireframe: false },
        b15: { width: reducedWidth, height: t, depth: t, color: 'blue', isWireframe: false },
        b16: { width: t, height: t, depth: d_prime, color: 'lime', isWireframe: false },
        b17: { width: t, height: h, depth: t, color: 'red', isWireframe: false },
        b18: { width: t, height: t, depth: reducedDepth, color: 'blue', isWireframe: false },
    };
}

/**
 * Calculates the positions for the 18 blocks based on their configurations.
 * @param {Object} configs - The configurations returned by getWHDConfigs.
 * @param {Object} whdState - The width, height, depth state.
 * @returns {Object} An object containing x, y, z positions for 18 blocks (b1 to b18).
 */
export function getWHDPositions(configs, whdState) {
    const { blockThickness: t, width: w, height: h, depth: d } = whdState;

    // Abstracted divisions for optimization
    const T2 = t * 0.5;
    const W2 = w * 0.5;
    const H2 = h * 0.5;
    const D2 = d * 0.5;

    // Block-specific half-dimensions
    const HB2 = configs.b2.height * 0.5;
    const HB3 = configs.b3.height * 0.5;
    const WB4 = configs.b4.width * 0.5;
    const DB5 = configs.b5.depth * 0.5;
    const WB6 = configs.b6.width * 0.5;
    const DB7 = configs.b7.depth * 0.5;
    const HB8 = configs.b8.height * 0.5;
    const DB9 = configs.b9.depth * 0.5;
    const HB10 = configs.b10.height * 0.5;
    const WB11 = configs.b11.width * 0.5;
    const HB12 = configs.b12.height * 0.5;
    const WB13 = configs.b13.width * 0.5;
    const DB14 = configs.b14.depth * 0.5;
    const WB15 = configs.b15.width * 0.5;
    const DB16 = configs.b16.depth * 0.5;
    const HB17 = configs.b17.height * 0.5;
    const DB18 = configs.b18.depth * 0.5;

    const pos = {};

    // b1 at origin
    pos.b1 = { x: 0, y: 0, z: 0 };

    // b2 relative to b1
    pos.b2 = {
        x: pos.b1.x + W2 - T2,
        y: pos.b1.y + HB2 + T2,
        z: pos.b1.z
    };

    // b3 relative to b1
    pos.b3 = {
        x: pos.b1.x - (W2 - T2),
        y: pos.b1.y + HB3 + T2,
        z: pos.b1.z
    };

    // b4 relative to b3
    pos.b4 = {
        x: pos.b3.x + WB4 - T2,
        y: pos.b3.y + HB3 + T2,
        z: pos.b3.z
    };

    // b5 relative to b4
    pos.b5 = {
        x: pos.b4.x + WB4 + T2,
        y: pos.b4.y,
        z: pos.b4.z + DB5 - T2
    };

    // b6 relative to b5
    pos.b6 = {
        x: pos.b5.x - WB6 - T2,
        y: pos.b5.y,
        z: pos.b5.z + DB5 - T2
    };

    // b7 relative to b6
    pos.b7 = {
        x: pos.b6.x - WB6 - T2,
        y: pos.b6.y,
        z: pos.b6.z - DB7 + T2
    };

    // b8 relative to b7
    pos.b8 = {
        x: pos.b7.x,
        y: pos.b7.y - HB8 + T2,
        z: pos.b7.z - DB7 - T2
    };

    // b9 relative to b8
    pos.b9 = {
        x: pos.b8.x,
        y: pos.b8.y - HB8 + T2,
        z: pos.b8.z + DB9 + T2
    };

    // b10 relative to b9
    pos.b10 = {
        x: pos.b9.x,
        y: pos.b9.y + HB10 - T2,
        z: pos.b9.z + DB9 + T2
    };

    // b11 relative to b10
    pos.b11 = {
        x: pos.b10.x + WB11 - T2,
        y: pos.b10.y + HB10 + T2,
        z: pos.b10.z
    };

    // b12 relative to b11
    pos.b12 = {
        x: pos.b11.x + WB11 - T2,
        y: pos.b11.y - HB12 - T2,
        z: pos.b11.z
    };

    // b13 relative to b12
    pos.b13 = {
        x: pos.b12.x - WB13 + T2,
        y: pos.b12.y - HB12 - T2,
        z: pos.b12.z
    };

    // b14 relative to b13
    pos.b14 = {
        x: pos.b13.x - WB13 - T2,
        y: pos.b13.y,
        z: pos.b13.z - DB14 + T2
    };

    // b15 relative to b14
    pos.b15 = {
        x: pos.b14.x + WB15 + T2,
        y: pos.b14.y,
        z: pos.b14.z - DB14 + T2
    };

    // b16 relative to b15
    pos.b16 = {
        x: pos.b15.x + WB15 + T2,
        y: pos.b15.y,
        z: pos.b15.z + DB16 - T2
    };

    // b17 relative to b16
    pos.b17 = {
        x: pos.b16.x,
        y: pos.b16.y + HB17 - T2,
        z: pos.b16.z + DB16 + T2
    };

    // b18 relative to b17
    pos.b18 = {
        x: pos.b17.x,
        y: pos.b17.y + HB17 - T2,
        z: pos.b17.z - DB18 - T2
    };

    return pos;
}

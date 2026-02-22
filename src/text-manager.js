import * as THREE from "three/webgpu";
import { FontLoader } from "three-stdlib";
import { themeManager } from "./theme-manager.js";

let font = null;
const fontLoader = new FontLoader();
const FONT_URL = "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json";

export async function loadFont() {
    return new Promise((resolve, reject) => {
        fontLoader.load(FONT_URL, (f) => {
            font = f;
            resolve(f);
        }, undefined, reject);
    });
}

/**
 * Creates a text mesh for a number using ShapeGeometry and outlines
 * @param {string|number} text 
 * @param {number} size
 * @returns {THREE.Group}
 */
export function createTextNumberMesh(text, size = 0.7) {
    if (!font) return new THREE.Group();

    const group = new THREE.Group();
    const message = String(text);

    // Generate shapes from the font
    const shapes = font.generateShapes(message, size);

    // Create the solid fill geometry
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();

    // Center the geometry
    const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    const yMid = -0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
    const z = 0.4;
    geometry.translate(xMid, yMid, z);

    const matLite = new THREE.MeshToonMaterial({
        color: themeManager.colors.text,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, matLite);
    group.add(mesh);
    group.name = `number_${text}`;

    // Create the outlines
    const holeShapes = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.holes && shape.holes.length > 0) {
            for (let j = 0; j < shape.holes.length; j++) {
                const hole = shape.holes[j];
                holeShapes.push(hole);
            }
        }
    }
    const allShapes = [...shapes, ...holeShapes];

    const matDark = new THREE.LineBasicMaterial({ color: themeManager.colors.dimensionLine.text });

    for (let i = 0; i < allShapes.length; i++) {
        const shape = allShapes[i];
        const points = shape.getPoints();
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        lineGeometry.translate(xMid, yMid, z);

        const lineMesh = new THREE.Line(lineGeometry, matDark);
        group.add(lineMesh);
    }

    return group;
}

/**
 * Updates a list of blocks so their numbers face the camera
 * @param {THREE.Object3D[]} blocks 
 * @param {THREE.Camera} camera 
 */
export function updateBlockNumbers(blocks, camera) {
    if (!blocks || !camera) return;

    const cameraPos = new THREE.Vector3();
    camera.getWorldPosition(cameraPos);

    blocks.forEach(block => {
        const numberMesh = block.userData.numberMesh;
        if (!numberMesh) return;

        // Sync visibility
        numberMesh.visible = block.visible;
        if (!block.visible) return;

        // Ensure numberMesh is in the scene
        if (!numberMesh.parent) {
            // Find the root scene
            let root = block;
            while (root.parent) root = root.parent;
            root.add(numberMesh);
        }

        // Get block world info
        const blockPos = new THREE.Vector3();
        if(block.userData?.isWedge){
            blockPos.copy(block.userData.position);
        } else {
            block.getWorldPosition(blockPos);
        }

        const blockRot = new THREE.Quaternion();
        block.getWorldQuaternion(blockRot);

        const blockScale = new THREE.Vector3();
        block.getWorldScale(blockScale);

        // Vector from block to camera in world space
        const toCamera = new THREE.Vector3().subVectors(cameraPos, blockPos).normalize();

        // Standard face normals in local space
        const faceNormals = [
            { normal: new THREE.Vector3(1, 0, 0), pos: 'right' },
            { normal: new THREE.Vector3(-1, 0, 0), pos: 'left' },
            { normal: new THREE.Vector3(0, 1, 0), pos: 'top' },
            { normal: new THREE.Vector3(0, -1, 0), pos: 'bottom' },
            { normal: new THREE.Vector3(0, 0, 1), pos: 'front' },
            { normal: new THREE.Vector3(0, 0, -1), pos: 'back' },
        ];

        let maxDot = -Infinity;
        let bestFace = faceNormals[0];

        faceNormals.forEach(face => {
            // Convert face normal to world space
            const worldNormal = face.normal.clone().applyQuaternion(blockRot);
            const dot = worldNormal.dot(toCamera);
            if (dot > maxDot) {
                maxDot = dot;
                bestFace = face;
            }
        });

        // Position the number slightly in front of the best face
        const offset = bestFace.normal.clone();

        // Adjust offset based on block dimensions
        // We need to account for world scale here because we are in world space
        const faceOffset = block.userData.isBar ? 0.7 : 0.005;
        if (block.geometry && block.geometry.parameters) {
            const params = block.geometry.parameters;
            const size = new THREE.Vector3(params.width, params.height, params.depth);
            size.multiply(blockScale); // Apply world scale
            // The offset is in local axis direction. We need to multiply by the corresponding half-dimension
            if (bestFace.normal.x !== 0) offset.x *= (size.x / 2 + faceOffset);
            if (bestFace.normal.y !== 0) offset.y *= (size.y / 2 + faceOffset);
            if (bestFace.normal.z !== 0) offset.z *= (size.z / 2 + faceOffset);
        } else {
            // Fallback for groups or non-standard blocks
            offset.multiplyScalar(0.5+faceOffset).multiply(blockScale);
        }

        // Apply block rotation to the offset
        const worldOffset = offset.applyQuaternion(blockRot);
        const finalWorldPos = new THREE.Vector3().copy(blockPos).add(worldOffset);

        // Set position in parent's local space (if parent is not scene)
        if (numberMesh.parent) {
            numberMesh.position.copy(numberMesh.parent.worldToLocal(finalWorldPos));
        } else {
            numberMesh.position.copy(finalWorldPos);
        }

        // Orient numberMesh to match the face normal
        const targetNormal = bestFace.normal.clone().applyQuaternion(blockRot);
        const lookTarget = finalWorldPos.clone().add(targetNormal);

        // We use worldToLocal for lookTarget too if needed, but it's easier to just use world space for lookAt
        // If we want it to look at a target in world space:
        numberMesh.lookAt(lookTarget);
    });
}
/**
 * Creates a THREE.Sprite with text rendered on a canvas texture.
 * @param {string} label - The text to display.
 * @param {Object} options - Options object.
 * @param {string} [options.textColor='#000'] - CSS color for the text.
 * @param {number} [options.textSize=32] - Font size in px.
 * @param {number} [options.canvasSize=64] - Size of the canvas (square).
 * @returns {THREE.Sprite}
 */
export function createTextSprite(label, { textColor = "#000", textSize = 32, canvasSize = 64 } = {}) {
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext("2d");
    ctx.font = `${textSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, canvas.width * 0.5, canvas.height * 0.5);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
    });
    return new THREE.Sprite(spriteMat);
}

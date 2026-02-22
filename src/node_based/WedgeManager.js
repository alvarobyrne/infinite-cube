import * as THREE from 'three';
import { ConvexGeometry } from "three-stdlib";

/**
 * Generates wedge configurations ensuring seamless joints.
 * For each joint between perpendicular bars, we determine which "corner" of the cross-section is removed by
 * the 45° cut.
 * 
 * @param {Array} pathOfNodes - Array of THREE.Vector3 points defining the path
 * @returns {Object} Map of configs for each bar (e.g., { b1: { ... }, b2: { ... } })
 */
export function generateWedgeConfigurations(pathOfNodes) {

    const configs = {};
    const n = pathOfNodes.length - 1;
    const isClosed = true;

    for (let i = 0; i < n; i++) {
        const pPrev = i > 0 ? pathOfNodes[i - 1] : isClosed ? pathOfNodes[n - 1] : null;
        const pCurr = pathOfNodes[i];
        const pNext = pathOfNodes[i + 1];

        const dCurr = new THREE.Vector3().subVectors(pNext, pCurr).normalize();

        const cfg = {
            left: { isLeft: true, rotationX: 0 },
            right: { isLeft: false, rotationX: 0 }
        };

        cfg.basis = { y: dCurr.clone().normalize() }

        cfg.position = pCurr.clone();

        if (pPrev) {
            const dPrev = new THREE.Vector3().subVectors(pCurr, pPrev).normalize();

            cfg.basis.x = dPrev.clone().normalize();

            // Calculate Z using cross product of X and Y
            const cross = new THREE.Vector3().crossVectors(cfg.basis.x, cfg.basis.y).normalize();
            cfg.basis.z = cross;
        } else {
            console.log("No previous node");
        }

        configs[`b${i + 1}`] = cfg;
    }

    return configs;
}
/**
 * Generates the ConvexGeometry from the key points of the wedges.
 * 
 * @param {Object} startParams - { basis, position } for the start corner
 * @param {Object} endParams - { basis, position } for the end corner
 * @param {number} barThickness - The thickness of the bar
 * @returns {THREE.BufferGeometry|null} The generated ConvexGeometry or null if no points.
 */
export function createGeometryFromPoints(startParams, endParams, barThickness) {
    const allPoints = [];

    // Wedge from Start Corner (W2)
    if (startParams) {
        const points1 = getWedgePoints(startParams.basis, startParams.position, barThickness);
        allPoints.push(...points1);
    }

    // Wedge from End Corner (W1)
    if (endParams) {
        const points2 = getWedgePoints(endParams.basis, endParams.position, barThickness);
        allPoints.push(...points2);
    }

    if (allPoints.length === 0) return null;

    return new ConvexGeometry(allPoints);
}


/**
 * Creates a THREE.Mesh from wedge points instead of just geometry.
 * 
 * @param {Object} startParams - { basis, position } for the start corner
 * @param {Object} endParams - { basis, position } for the end corner  
 * @param {number} barThickness - The thickness of the bar
 * @param {THREE.Material} material - Optional material for the mesh (defaults to basic mesh material)
 * @returns {THREE.Mesh|null} The generated mesh or null if no points.
 */
export function createMeshFromPoints(startParams, endParams, barThickness, material = null) {
    const geometry = createGeometryFromPoints(startParams, endParams, barThickness);
    
    if (!geometry) return null;
    
    // Use provided material or create a default one
    const meshMaterial = material || new THREE.MeshBasicMaterial({ 
        color: 0x888888,
        side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, meshMaterial);
    mesh.userData.position = startParams.position.clone().add(endParams.position).multiplyScalar(0.5);
    mesh.userData.isWedge = true;
    mesh.userData.isBar = true;
    return mesh;
}

/**
 * Generates the key points of the wedge and transforms them.
 * These are just the points that lie on the inclined plane of the wedge, the corners of the inclined plane.
 * 
 * @param {Object} basis - The basis set {x, y, z} of the corner formed by the current direction of the path, 
 * the previous direction of the path and the cross product of the two; the three of them are normalized.
 * @param {THREE.Vector3} position - The world position for the wedge
 * @param {number} barThickness - The thickness of the bar
 * @returns {Object} An array containing the key points of the wedge with transformations baked in.
 */
function getWedgePoints(basis, position, barThickness) {
    // 1. Create the key points of the wedge
    const t2 = barThickness / 2;


    const p1 = new THREE.Vector3(-t2, t2, -t2);
    const p2 = new THREE.Vector3(-t2, t2, t2);
    const p3 = new THREE.Vector3(t2, -t2, -t2);
    const p4 = new THREE.Vector3(t2, -t2, t2);



    // 2. Build the Transformation Matrix
    const transformMatrix = new THREE.Matrix4();
    transformMatrix.makeBasis(basis.x, basis.y, basis.z);
    transformMatrix.setPosition(position);

    // 3. Apply Matrix to Geometries
    p1.applyMatrix4(transformMatrix);
    p2.applyMatrix4(transformMatrix);
    p3.applyMatrix4(transformMatrix);
    p4.applyMatrix4(transformMatrix);

    return [p1, p2, p3, p4];
}
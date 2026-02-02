import * as THREE from 'three';
import { Bar } from './Bar';

export class PathManager {
    /**
     * @param {THREE.Vector3[]} points 
     * @param {number} width 
     * @param {number} height 
     */
    static generateBars(points, width, height) {
        if (points.length < 2) return [];

        const bars = [];

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            // 1. Calculate length and World Direction
            const segmentVec = new THREE.Vector3().subVectors(p1, p0);
            const length = segmentVec.length();
            const dir = segmentVec.clone().normalize();

            // 2. Determine Cut Planes (World Space Normals logic -> Local Space)

            // Check if path is closed
            const isClosed = points[0].distanceToSquared(points[points.length - 1]) < 0.000001;

            // Start Cut (at p0)
            let cutStart = null;
            let pPrev = null;

            if (i > 0) {
                pPrev = points[i - 1];
            } else if (isClosed) {
                // Wrap around: previous point is the one before the last point (since last == first)
                pPrev = points[points.length - 2];
            }

            if (pPrev) {
                const dirPrev = new THREE.Vector3().subVectors(p0, pPrev).normalize();

                // Miter Plane Normal: Bisector
                let normalWorld = new THREE.Vector3().addVectors(dirPrev, dir).normalize();

                // Handle 180 degree turn or straight line issues
                if (normalWorld.lengthSq() < 0.001) {
                    normalWorld = dir.clone().negate();
                } else {
                    normalWorld.negate();
                }

                cutStart = new THREE.Plane(normalWorld, 0);
                cutStart.constant = -p0.dot(normalWorld);
            }

            // End Cut (at p1)
            let cutEnd = null;
            let pNext = null;

            if (i < points.length - 2) {
                pNext = points[i + 2];
            } else if (isClosed && i === points.length - 2) {
                // Wrap around: next point is the second point (index 1)
                pNext = points[1];
            }

            if (pNext) {
                const dirNext = new THREE.Vector3().subVectors(pNext, p1).normalize();

                let normalWorld = new THREE.Vector3().addVectors(dir, dirNext).normalize();

                if (normalWorld.lengthSq() < 0.001) {
                    normalWorld = dir.clone();
                }

                cutEnd = new THREE.Plane(normalWorld, 0);
                cutEnd.constant = -p1.dot(normalWorld);
            }

            // 3. Transform Planes to Local Space
            // Bar Local Space:
            // Box is centered at (0,0,0) usually. 
            // -X to +X? Or 0 to L?
            // In BarGeometryGenerator I used: +/- L/2. So Centered.
            // So Local Origin = (0,0,0).
            // World Center of Bar = (p0 + p1) / 2.

            const midPoint = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);
            const parentObj = new THREE.Object3D();
            parentObj.position.copy(midPoint);
            parentObj.lookAt(p1);
            // Note: lookAt aligns +Z to target. 
            // But our Bar is aligned along X? 
            // In BarGeometryGenerator, length is along X.
            // So we need to rotate X to Z? Or change LookAt?
            // Or change Geometry to be along Z?
            // Standard Three.js `lookAt` points +Z.
            // Let's assume Bar Geometry is defined along +Z for simplicity with lookAt?
            // -Z to +Z.
            // Let's UPDATE BarGeometryGenerator to use Z axis for length?
            // " +Z (Front), -Z (Back) " in previous code was "Width".
            // Let's stick to X-axis alignment and handle rotation manually.
            // X-axis is "Right".
            // So we want Local X to point to p1.
            // parentObj.lookAt(p1) sets +Z to point to p1.
            // So we need a child rotation or just set Quaternion manually.

            // Quaternion to rotate (1,0,0) to dir.
            const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
            parentObj.quaternion.copy(quat);
            parentObj.updateMatrixWorld();

            // Transform World Plane to Local.
            // Local Plane: applies to points in Local Space.
            // P_world = M * P_local.
            // Plane_world: N dot P_world + d = 0
            // N dot (M * P_local) + d = 0
            // (M_inv_trans * N) dot P_local + d = 0 ? 
            // THREE.Plane.applyMatrix4( matrix ) applies the matrix to the plane.
            // If we have Plane_local, applying M gives Plane_world.
            // So Plane_local = Plane_world.applyMatrix4( M_inverse ).

            const matInverse = parentObj.matrixWorld.clone().invert();

            // Create local copies
            let localCutStart = null;
            if (cutStart) {
                localCutStart = cutStart.clone().applyMatrix4(matInverse);
            }

            let localCutEnd = null;
            if (cutEnd) {
                localCutEnd = cutEnd.clone().applyMatrix4(matInverse);
            }

            // Create Bar Object
            const bar = new Bar(length, width, height, localCutStart, localCutEnd);

            // Store world transform with the bar for rendering
            bar.position = midPoint;
            bar.quaternion = quat;

            bars.push(bar);
        }

        return bars;
    }
}

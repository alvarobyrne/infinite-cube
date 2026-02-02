import * as THREE from 'three';
import { ConvexGeometry } from "three-stdlib";

export class BarGeometryGenerator {
    static generate(bar) {
        const { length: L, width: W, height: H, cutStart, cutEnd } = bar;

        // 1. Define the 6 axis-aligned planes of the box
        // We assume the box is centered at (0,0,0) locally.
        // However, usually bars are laid out along X or something. 
        // Let's assume the bar extends from -L/2 to L/2 along X axis.

        const planes = [
            // +X (Right) - Normal pointing OUT
            new THREE.Plane(new THREE.Vector3(1, 0, 0), -L / 2 - W / 2),
            // -X (Left)
            new THREE.Plane(new THREE.Vector3(-1, 0, 0), -L / 2 - W / 2),
            // +Y (Top)
            new THREE.Plane(new THREE.Vector3(0, 1, 0), -H / 2),
            // -Y (Bottom)
            new THREE.Plane(new THREE.Vector3(0, -1, 0), -H / 2),
            // +Z (Front)
            new THREE.Plane(new THREE.Vector3(0, 0, 1), -W / 2),
            // -Z (Back)
            new THREE.Plane(new THREE.Vector3(0, 0, -1), -W / 2)
        ];

        // 2. Add the cut planes
        // The cut planes should also have normals pointing OUT of the valid volume.
        // The user description: "Start cut", "End cut".
        // We need to ensure the normals are correct. 
        // Usually, a cut plane keeps the side where normal points? No, Plane constant d is distance from origin.
        // In Three.js, a point P is "above" the plane if P dot N + d > 0.
        // We want the INTERSECTION of half-spaces.
        // Half-space is P dot N + d <= 0 (or >= 0 depending on convention).
        // User said: "Keep only the points that satisfy a set of plane inequalities"
        // Let's assume standard "inside" is P dot N + d <= 0. 
        // So Normals point OUTWARDS from the solid.
        // The box normals above point OUTWARDS. e.g. Right plane (1,0,0) at x=L/2.
        // P=(L/2+1, 0, 0). 1*(L/2+1) - L/2 = 1 > 0. OUTSIDE. Correct.

        // So cut planes must point OUTWARDS (away from the bar).

        if (cutStart) planes.push(cutStart);
        if (cutEnd) planes.push(cutEnd);

        // 3. Find vertices
        // Intersection of any 3 planes.
        // 8 planes choose 3 = 8*7*6 / 6 = 56 combinations max. Fast.

        const vertices = [];
        const n = planes.length;

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                for (let k = j + 1; k < n; k++) {
                    const intersection = this.intersectThreePlanes(planes[i], planes[j], planes[k]);
                    if (intersection) {
                        // Check if this point is inside all OTHER planes
                        let isInside = true;
                        for (let m = 0; m < n; m++) {
                            if (m === i || m === j || m === k) continue;
                            const dist = planes[m].distanceToPoint(intersection);
                            // Allow small epsilon for floating point errors
                            // Increased epsilon to 1e-4 to be more tolerant of grazing intersections
                            if (dist > 1e-4) {
                                isInside = false;
                                break;
                            }
                        }
                        if (isInside) {
                            vertices.push(intersection);
                        }
                    }
                }
            }
        }

        if (vertices.length < 4) {
            console.warn("Valid polyhedron not found (too few vertices)", vertices.length);
            // Return a fallback geometry to prevent crashes (e.g. WireframeGeometry needs attributes)
            return new THREE.BoxGeometry(0.1, 0.1, 0.1);
        }

        // 4. Compute Convex Hull
        // Deduplicate vertices? ConvexGeometry handles it usually, but cleaner to do it.
        // For now pass all valid points.

        return new ConvexGeometry(vertices);
    }

    static intersectThreePlanes(p1, p2, p3) {
        // Intersection of 3 planes:
        // n1.x + d1 = 0
        // n2.x + d2 = 0
        // n3.x + d3 = 0
        // Solve linear system.

        const n1 = p1.normal;
        const n2 = p2.normal;
        const n3 = p3.normal;

        const det = n1.dot(n2.clone().cross(n3)); // n1 . (n2 x n3)
        // Note: vector.cross() modifies the vector in Three.js? 
        // Wait, Vector3.cross(v) modifies 'this'. 
        // So n2.clone().cross(n3) is safer if we need n2 later.
        // But here inputs are likely reused.

        // Actually slightly cleaner:
        // Matrix3 approach or explicit formula
        // P = ( -d1(n2 x n3) - d2(n3 x n1) - d3(n1 x n2) ) / det

        if (Math.abs(det) < 1e-9) return null; // Parallel planes, no unique scalar intersection

        const term1 = n2.clone().cross(n3).multiplyScalar(-p1.constant);
        const term2 = n3.clone().cross(n1).multiplyScalar(-p2.constant);
        const term3 = n1.clone().cross(n2).multiplyScalar(-p3.constant); // n1 x n2

        return term1.add(term2).add(term3).divideScalar(det);
    }
}

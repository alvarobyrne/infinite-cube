import * as THREE from 'three';

export class Bar {
    constructor(length, width, height, cutStart, cutEnd) {
        this.length = length;
        this.width = width;
        this.height = height;
        this.cutStart = cutStart; // THREE.Plane
        this.cutEnd = cutEnd;     // THREE.Plane
        this.position = null; // Optional position if needed
        this.quaternion = null;
        this.basis = null; // Optional basis for orientation if needed
        this.p0 = null; // Optional reference point (e.g., start point of the segment)
        this.p1 = null; // Optional reference point (e.g., end point of the segment)
        this.wedgePoints = null; // Optional precomputed wedge points for optimization

        // Optional position/orientation if needed, but the Lattice Node 
        // usually holds the transform. For now, we assume the Bar is
        // defined in its local space centered at origin (or slightly different, see below).
        // The user said "Construct a convex polyhedron by slicing a box".
        // Usually box is centered at origin.
        Object.seal(this);
    }
}

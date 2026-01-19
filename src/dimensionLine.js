import * as THREE from "three/webgpu";

/**
 * Adds a dimension line with arrows, perpendicular ticks, and a label.
 * @param {Object} options - Options object.
 * @param {THREE.Object3D} options.object3d - The object to add to.
 * @param {THREE.Vector3} options.start - Start point of the dimension line.
 * @param {THREE.Vector3} options.end - End point of the dimension line.
 * @param {string} options.label - The text to display.
 * @param {THREE.Color} [options.color=0x000000] - Color of the line and arrows.
 * @param {number} [options.tickSize=0.2] - Length of the perpendicular ticks.
 * @param {string} [options.textColor='#000'] - CSS color for the label text.
 * @param {number} [options.textSize=32] - Font size in px for the label text.
 * @param {number} [options.gap=0.4] - Gap in the middle of the line for the label.
 * @param {number} [options.lengthThreshold=0.8] - Minimum length to show the line segments.
 * @param {number} [options.arrowHeadLength=0.1] - Length of the arrow head.
 * @param {number} [options.arrowHeadWidth=0.05] - Width of the arrow head.
 */
export function addDimensionLine({
  object3d,
  start,
  end,
  label,
  color = 0x000000,
  tickSize = 0.3,
  textColor = "#000",
  textSize = 32,
  gap = 0.4,
  lengthThreshold = 0.8,
  arrowHeadLength = 0.15,
  arrowHeadWidth = 0.1,
}) {
  const group = new THREE.Group();
  object3d.add(group);
  // Calculate direction and midpoint
  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const length = start.distanceTo(end);
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  // Perpendicular vector for ticks (choose a world axis not parallel to dir)
  let perp = new THREE.Vector3(0, 1, 0);
  const dotProduct = dir.dot(perp);
  const perpendiculaCondition = Math.abs(dotProduct) > 0.99;
  if (perpendiculaCondition) perp = new THREE.Vector3(1, 0, 0);
  perp.cross(dir).normalize();

  // Split line into two segments (interrupted in the middle)
  const half = length / 2 - gap / 2;
  const p1 = start.clone();
  const p2 = start.clone().add(dir.clone().multiplyScalar(half));
  const p3 = end.clone();
  const p4 = end.clone().add(dir.clone().multiplyScalar(-half));
  const lengthConditon = length > lengthThreshold;

  // Draw the two line segments
  [
    [p1, p2],
    [p3, p4],
  ].forEach(([a, b]) => {
    const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
    const mat = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geom, mat);
    if (lengthConditon) group.add(line);
  });

  // Add arrows at both ends
  [start, end].forEach((point, i) => {
    const arrowDir = i !== 0 ? dir : dir.clone().negate();
    if (!lengthConditon) arrowDir.negate();
    const arrowOrigin = point;
    const arrowLength = 0;
    const arrowColor = color;
    const arrow = new THREE.ArrowHelper(
      arrowDir,
      arrowOrigin,
      arrowLength,
      arrowColor,
      arrowHeadLength,
      arrowHeadWidth
    );
    group.add(arrow);

    // Add perpendicular tick
    const tickGeom = new THREE.BufferGeometry().setFromPoints([
      point.clone().add(perp.clone().multiplyScalar(tickSize / 2)),
      point.clone().add(perp.clone().multiplyScalar(-tickSize / 2)),
    ]);
    const tick = new THREE.Line(
      tickGeom,
      new THREE.LineBasicMaterial({ color })
    );
    group.add(tick);
  });

  // Add label as a sprite
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
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
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.copy(mid);
  group.add(sprite);
  return group;
}

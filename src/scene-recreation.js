import { BaseRecreator, DimensionLineDecorator, VertexDecorator, WHDDimensionLineDecorator, XYPlaneSquareDecorator } from "./scene-decorators.js";

/**
 * Recreate the scene with blocks, dimension lines, vertices, and clones
 */
export function recreateScene(params) {
  const { blockRenderState } = params;
  let recreator = new BaseRecreator();

  if (blockRenderState.showDimensionLines) {
    if (blockRenderState.style === "coloredFacedWHD") {
      recreator = new WHDDimensionLineDecorator(recreator);
    } else {
      recreator = new DimensionLineDecorator(recreator);
    }
  }

  if (blockRenderState.showVertices) {
    recreator = new VertexDecorator(recreator);
  }

  if (blockRenderState.showXYPlaneSquare) {
    recreator = new XYPlaneSquareDecorator(recreator);
  }

  return recreator.recreate(params);
}

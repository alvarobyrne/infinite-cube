import { BaseRecreator, DimensionLineDecorator, VertexDecorator, XYPlaneSquareDecorator } from "./scene-decorators.js";

/**
 * Recreate the scene with blocks, dimension lines, vertices, and clones
 */
export function recreateScene(params) {
  let recreator = new BaseRecreator();

  if (params.blockRenderState.showDimensionLines) {
    recreator = new DimensionLineDecorator(recreator);
  }

  if (params.blockRenderState.showVertices) {
    recreator = new VertexDecorator(recreator);
  }

  if (params.blockRenderState.showXYPlaneSquare) {
    recreator = new XYPlaneSquareDecorator(recreator);
  }

  return recreator.recreate(params);
}

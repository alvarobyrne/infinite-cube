import { BaseRecreator, DimensionLineDecorator, VertexDecorator } from "./scene-decorators.js";

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

  return recreator.recreate(params);
}

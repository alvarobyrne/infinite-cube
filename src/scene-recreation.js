import { BaseRecreator, DimensionLineDecorator, VertexDecorator, WHDDimensionLineDecorator, XYPlaneSquareDecorator, BoxDecorator, BlockNumberDecorator } from "./scene-decorators.js";

/**
 * Recreate the scene with blocks, dimension lines, vertices, and clones
 */
export function recreateScene(params) {
  const { blockRenderState } = params;
  let recreator = new BaseRecreator();

  if (blockRenderState.showDimensionLines) {
    // Both decorators are added; they check activeStrategyType internally using instanceof BaseRecreator's strategy
    recreator = new DimensionLineDecorator(recreator);
    recreator = new WHDDimensionLineDecorator(recreator);
  }

  if (blockRenderState.showVertices) {
    recreator = new VertexDecorator(recreator);
  }

  if (blockRenderState.showXYPlaneSquare) {
    recreator = new XYPlaneSquareDecorator(recreator);
  }

  if (blockRenderState.showNumbers) {
    recreator = new BlockNumberDecorator(recreator);
  }

  if (blockRenderState.showBox) {
    recreator = new BoxDecorator(recreator);
  }

  return recreator.recreate(params);
}

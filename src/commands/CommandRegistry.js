import {
  SaveStateWithRecreateCommand,
  ConditionalSaveCommand,
  SaveStateWithCallbackCommand
} from './StateCommands.js';
import {
  UIUpdateCommand,
  ThemeCommand,
  TransparencyCommand
} from './UICommands.js';
import {
  CameraProjectionCommand,
  ViewModeCommand,
  RendererTypeCommand,
  CameraTypeCommand,
  InstructionsCommand,
  CloneVisibilityCommand
} from './ComplexCommands.js';

/**
 * Command Registry - maps GUI properties to appropriate command instances
 */
class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.setupDefaultCommands();
  }

  /**
   * Register a command for a specific property
   * @param {string} property - GUI property name
   * @param {Command} command - Command instance
   */
  register(property, command) {
    this.commands.set(property, command);
  }

  /**
   * Get command for a property
   * @param {string} property - GUI property name
   * @returns {Command|null} Command instance or null if not found
   */
  get(property) {
    return this.commands.get(property) || null;
  }

  /**
   * Setup default commands for common GUI properties
   */
  setupDefaultCommands() {
    // View and renderer commands
    this.register('mode', new ViewModeCommand(() => { }));
    this.register('rendererType', new RendererTypeCommand(() => { }));
    this.register('type', new CameraTypeCommand({}, () => { }, () => { }));
    this.register('theme', new ThemeCommand({}, () => { }, true));
    this.register('transparentUI', new TransparencyCommand({}, () => { }));

    // Instructions command
    this.register('visible', new InstructionsCommand({}, () => { }));

    // Dimension commands
    this.register('dimension1', new SaveStateWithRecreateCommand(() => { }));
    this.register('dimension2', new SaveStateWithRecreateCommand(() => { }));
    this.register('dimension3', new SaveStateWithRecreateCommand(() => { }));
    this.register('blockThickness', new SaveStateWithRecreateCommand(() => { }));

    // WHD commands
    this.register('width', new SaveStateWithRecreateCommand(() => { }));
    this.register('height', new SaveStateWithRecreateCommand(() => { }));
    this.register('depth', new SaveStateWithRecreateCommand(() => { }));
    this.register('whdBlockThickness', new UIUpdateCommand(() => { }, () => { }, true));
    this.register('gap', new UIUpdateCommand(() => { }, () => { }, true));

    // Block rendering commands
    this.register('style', new SaveStateWithCallbackCommand(
      () => { },
      (context) => context.syncFolders && context.syncFolders(),
      true
    ));
    this.register('unifiedColor', new ConditionalSaveCommand(
      () => { },
      (context) => context.state.style === "unifiedColor"
    ));
    this.register('useCloneColors', new ConditionalSaveCommand(
      () => { },
      (context) => context.state.style === "unifiedColor"
    ));
    this.register('cloneColor1', new ConditionalSaveCommand(
      () => { },
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor2', new ConditionalSaveCommand(
      () => { },
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor3', new ConditionalSaveCommand(
      () => { },
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor4', new ConditionalSaveCommand(
      () => { },
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor5', new ConditionalSaveCommand(
      () => { },
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));

    // Multi-color commands
    this.register('multiColor1', new ConditionalSaveCommand(
      () => { },
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));
    this.register('multiColor2', new ConditionalSaveCommand(
      () => { },
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));
    this.register('multiColor3', new ConditionalSaveCommand(
      () => { },
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));
    this.register('multiColor4', new ConditionalSaveCommand(
      () => { },
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));

    // Dimension lines and display commands
    this.register('showDimensionLines', new SaveStateWithRecreateCommand(() => { }));
    this.register('showTopDimensionLines', new SaveStateWithRecreateCommand(() => { }));
    this.register('showRightDimensionLines', new SaveStateWithRecreateCommand(() => { }));
    this.register('showFrontDimensionLines', new SaveStateWithRecreateCommand(() => { }));
    this.register('showExtraDimensionLines', new SaveStateWithRecreateCommand(() => { }));
    this.register('showGSGroup', new SaveStateWithRecreateCommand(() => { }));
    this.register('showVertices', new SaveStateWithRecreateCommand(() => { }));
    this.register('showNumbers', new SaveStateWithRecreateCommand(() => { }));
    this.register('numberType', new SaveStateWithRecreateCommand(() => { }));
    this.register('numberSize', new SaveStateWithRecreateCommand(() => { }));
    this.register('isOpaque', new SaveStateWithRecreateCommand(() => { }));
    this.register('showXYPlaneSquare', new SaveStateWithRecreateCommand(() => { }));
    this.register('showBox', new SaveStateWithRecreateCommand(() => { }));
    this.register('scale', new SaveStateWithRecreateCommand(() => { }));
    this.register('x', new SaveStateWithRecreateCommand(() => { }));
    this.register('y', new SaveStateWithRecreateCommand(() => { }));
    this.register('z', new SaveStateWithRecreateCommand(() => { }));

    // Camera commands
    this.register('fov', new CameraProjectionCommand(() => { }));
    this.register('frustumSize', new CameraProjectionCommand(() => { }));
    this.register('near', new CameraProjectionCommand(() => { }));
    this.register('far', new CameraProjectionCommand(() => { }));
    this.register('zoom', new CameraProjectionCommand(() => { }));

    // Clone visibility commands
    this.register('groupClone1', new CloneVisibilityCommand('groupClone1', {}, () => { }));
    this.register('groupClone2', new CloneVisibilityCommand('groupClone2', {}, () => { }));
    this.register('groupClone3', new CloneVisibilityCommand('groupClone3', {}, () => { }));
    this.register('groupClone4', new CloneVisibilityCommand('groupClone4', {}, () => { }));
    this.register('groupClone5', new CloneVisibilityCommand('groupClone5', {}, () => { }));

    // Clone selector
    this.register('selectedCloneIndex', new SaveStateWithCallbackCommand(
      () => { },
      (context) => context.positionRotationManager && context.positionRotationManager.switchClone(context.state.selectedCloneIndex)
    ));
  }

  /**
   * Initialize commands with specific context (save functions, etc.)
   * This should be called after all dependencies are available
   */
  initializeWithContext(context) {
    // Re-register all commands with proper context
    this.commands.clear();

    // View and renderer commands
    this.register('mode', new ViewModeCommand(context.saveViewState));
    this.register('rendererType', new RendererTypeCommand(context.saveViewState));
    this.register('type', new CameraTypeCommand(context.clones, context.saveCameraSettings, context.recreateScene));
    this.register('theme', new ThemeCommand(context.themeManager, context.setItem, true));
    this.register('transparentUI', new TransparencyCommand(context.themeManager, context.setItem));

    // Instructions command
    this.register('visible', new InstructionsCommand(context.instructionsState, context.setItem));

    // Dimension commands
    this.register('dimension1', new SaveStateWithRecreateCommand(context.saveDimensionState));
    this.register('dimension2', new SaveStateWithRecreateCommand(context.saveDimensionState));
    this.register('dimension3', new SaveStateWithRecreateCommand(context.saveDimensionState));
    this.register('blockThickness', new SaveStateWithRecreateCommand(context.saveDimensionState));

    // WHD commands
    this.register('width', new SaveStateWithRecreateCommand(context.saveWHDState));
    this.register('height', new SaveStateWithRecreateCommand(context.saveWHDState));
    this.register('depth', new SaveStateWithRecreateCommand(context.saveWHDState));
    this.register('whdBlockThickness', new UIUpdateCommand(
      context.saveWHDState,
      (context, value) => {
        const t2 = 2 * value;
        if (context.whdWidthController) {
          context.whdWidthController.min(t2);
          context.whdWidthController.updateDisplay();
        }
        if (context.whdHeightController) {
          context.whdHeightController.min(t2);
          context.whdHeightController.updateDisplay();
        }
        if (context.whdDepthController) {
          context.whdDepthController.min(t2);
          context.whdDepthController.updateDisplay();
        }
        if (context.whdGapController) {
          context.whdGapController.min(value);
          context.whdGapController.updateDisplay();
        }
      },
      true
    ));
    this.register('gap', new UIUpdateCommand(
      context.saveWHDState,
      (context, value) => {
        if (context.whdBlockThicknessController) {
          context.whdBlockThicknessController.max(value);
          context.whdBlockThicknessController.updateDisplay();
        }
      },
      true
    ));

    // Block rendering commands
    this.register('style', new SaveStateWithCallbackCommand(
      context.saveBlockRenderState,
      (context) => { }, // No callback needed - syncFolders is now a listener
      true
    ));
    this.register('unifiedColor', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => context.state.style === "unifiedColor"
    ));
    this.register('useCloneColors', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => context.state.style === "unifiedColor"
    ));
    this.register('cloneColor1', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor2', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor3', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor4', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor5', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));

    // Multi-color commands
    this.register('multiColor1', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));
    this.register('multiColor2', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));
    this.register('multiColor3', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));
    this.register('multiColor4', new ConditionalSaveCommand(
      context.saveBlockRenderState,
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));

    // Dimension lines and display commands
    this.register('showDimensionLines', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('showTopDimensionLines', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('showRightDimensionLines', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('showFrontDimensionLines', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('showExtraDimensionLines', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('showGSGroup', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('showVertices', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('showNumbers', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('numberType', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('numberSize', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('isOpaque', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('showXYPlaneSquare', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('showBox', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('scale', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('x', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('y', new SaveStateWithRecreateCommand(context.saveBlockRenderState));
    this.register('z', new SaveStateWithRecreateCommand(context.saveBlockRenderState));

    // Camera commands
    this.register('fov', new CameraProjectionCommand(context.updateCameraProjection));
    this.register('frustumSize', new CameraProjectionCommand(context.updateCameraProjection));
    this.register('near', new CameraProjectionCommand(context.updateCameraProjection));
    this.register('far', new CameraProjectionCommand(context.updateCameraProjection));
    this.register('zoom', new CameraProjectionCommand(context.updateCameraProjection));

    // Clone visibility commands
    this.register('groupClone1', new CloneVisibilityCommand('groupClone1', context.clones, context.saveCloneVisibilityState));
    this.register('groupClone2', new CloneVisibilityCommand('groupClone2', context.clones, context.saveCloneVisibilityState));
    this.register('groupClone3', new CloneVisibilityCommand('groupClone3', context.clones, context.saveCloneVisibilityState));
    this.register('groupClone4', new CloneVisibilityCommand('groupClone4', context.clones, context.saveCloneVisibilityState));
    this.register('groupClone5', new CloneVisibilityCommand('groupClone5', context.clones, context.saveCloneVisibilityState));

    // Clone selector
    this.register('selectedCloneIndex', new SaveStateWithCallbackCommand(
      context.saveCloneSelectorState,
      (context) => context.positionRotationManager && context.positionRotationManager.switchClone(context.state.selectedCloneIndex)
    ));
  }
}

// Create singleton instance
export const commandRegistry = new CommandRegistry();

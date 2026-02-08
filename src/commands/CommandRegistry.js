import { 
  SaveStateCommand, 
  SaveStateWithRecreateCommand, 
  ConditionalSaveCommand,
  SaveStateWithCallbackCommand 
} from './StateCommands.js';
import { 
  UIUpdateCommand, 
  MultiUIUpdateCommand,
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
    this.register('mode', new ViewModeCommand(() => {}));
    this.register('rendererType', new RendererTypeCommand(() => {}));
    this.register('type', new CameraTypeCommand({}, () => {}, () => {}));
    this.register('theme', new ThemeCommand({}, () => {}, true));
    this.register('transparentUI', new TransparencyCommand({}, () => {}));

    // Instructions command
    this.register('visible', new InstructionsCommand({}, () => {}));

    // Dimension commands
    this.register('dimension1', new SaveStateWithRecreateCommand(() => {}));
    this.register('dimension2', new SaveStateWithRecreateCommand(() => {}));
    this.register('dimension3', new SaveStateWithRecreateCommand(() => {}));
    this.register('blockThickness', new SaveStateWithRecreateCommand(() => {}));

    // WHD commands
    this.register('width', new SaveStateWithRecreateCommand(() => {}));
    this.register('height', new SaveStateWithRecreateCommand(() => {}));
    this.register('depth', new SaveStateWithRecreateCommand(() => {}));
    this.register('whdBlockThickness', new UIUpdateCommand(() => {}, () => {}, true));
    this.register('gap', new UIUpdateCommand(() => {}, () => {}, true));

    // Block rendering commands
    this.register('style', new SaveStateWithCallbackCommand(
      () => {},
      (context) => context.syncFolders && context.syncFolders(),
      true
    ));
    this.register('unifiedColor', new ConditionalSaveCommand(
      () => {},
      (context) => context.state.style === "unifiedColor"
    ));
    this.register('useCloneColors', new ConditionalSaveCommand(
      () => {},
      (context) => context.state.style === "unifiedColor"
    ));
    this.register('cloneColor1', new ConditionalSaveCommand(
      () => {},
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor2', new ConditionalSaveCommand(
      () => {},
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor3', new ConditionalSaveCommand(
      () => {},
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor4', new ConditionalSaveCommand(
      () => {},
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));
    this.register('cloneColor5', new ConditionalSaveCommand(
      () => {},
      (context) => context.state.style === "unifiedColor" && context.state.useCloneColors
    ));

    // Multi-color commands
    this.register('multiColor1', new ConditionalSaveCommand(
      () => {},
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));
    this.register('multiColor2', new ConditionalSaveCommand(
      () => {},
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));
    this.register('multiColor3', new ConditionalSaveCommand(
      () => {},
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));
    this.register('multiColor4', new ConditionalSaveCommand(
      () => {},
      (context) => ["multiColorPlanes", "multiColorBox", "granularColor", "granularColorWHD"].includes(context.state.style)
    ));

    // Dimension lines and display commands
    this.register('showDimensionLines', new SaveStateWithRecreateCommand(() => {}));
    this.register('showTopDimensionLines', new SaveStateWithRecreateCommand(() => {}));
    this.register('showRightDimensionLines', new SaveStateWithRecreateCommand(() => {}));
    this.register('showFrontDimensionLines', new SaveStateWithRecreateCommand(() => {}));
    this.register('showExtraDimensionLines', new SaveStateWithRecreateCommand(() => {}));
    this.register('showGSGroup', new SaveStateWithRecreateCommand(() => {}));
    this.register('showVertices', new SaveStateWithRecreateCommand(() => {}));
    this.register('showNumbers', new SaveStateWithRecreateCommand(() => {}));
    this.register('numberType', new SaveStateWithRecreateCommand(() => {}));
    this.register('numberSize', new SaveStateWithRecreateCommand(() => {}));
    this.register('isOpaque', new SaveStateWithRecreateCommand(() => {}));
    this.register('showXYPlaneSquare', new SaveStateWithRecreateCommand(() => {}));
    this.register('showBox', new SaveStateWithRecreateCommand(() => {}));
    this.register('scale', new SaveStateWithRecreateCommand(() => {}));
    this.register('x', new SaveStateWithRecreateCommand(() => {}));
    this.register('y', new SaveStateWithRecreateCommand(() => {}));
    this.register('z', new SaveStateWithRecreateCommand(() => {}));

    // Camera commands
    this.register('fov', new CameraProjectionCommand(() => {}));
    this.register('frustumSize', new CameraProjectionCommand(() => {}));
    this.register('near', new CameraProjectionCommand(() => {}));
    this.register('far', new CameraProjectionCommand(() => {}));
    this.register('zoom', new CameraProjectionCommand(() => {}));

    // Clone visibility commands
    this.register('groupClone1', new CloneVisibilityCommand('groupClone1', {}, () => {}));
    this.register('groupClone2', new CloneVisibilityCommand('groupClone2', {}, () => {}));
    this.register('groupClone3', new CloneVisibilityCommand('groupClone3', {}, () => {}));
    this.register('groupClone4', new CloneVisibilityCommand('groupClone4', {}, () => {}));
    this.register('groupClone5', new CloneVisibilityCommand('groupClone5', {}, () => {}));

    // Clone selector
    this.register('selectedCloneIndex', new SaveStateWithCallbackCommand(
      () => {},
      (context) => context.positionRotationManager && context.positionRotationManager.switchClone(context.state.selectedCloneIndex)
    ));
  }

  /**
   * Initialize commands with specific context (save functions, etc.)
   * This should be called after all dependencies are available
   */
  initializeWithContext(context) {
    // Update all registered commands with proper context
    for (const [property, command] of this.commands) {
      // Re-create command with proper context
      if (command.saveFunction) {
        command.saveFunction = context.saveBlockRenderState;
      }
      if (command.clones) {
        command.clones = context.clones;
      }
      if (command.saveCloneVisibilityState) {
        command.saveCloneVisibilityState = context.saveCloneVisibilityState;
      }
      if (command.themeManager) {
        command.themeManager = context.themeManager;
      }
      if (command.getItem) {
        command.getItem = context.getItem;
      }
      if (command.setItem) {
        command.setItem = context.setItem;
      }
      if (command.instructionsState) {
        command.instructionsState = context.instructionsState;
      }
      if (command.recreateScene) {
        command.recreateScene = context.recreateScene;
      }
      if (command.syncFolders) {
        command.syncFolders = context.syncFolders;
      }
      if (command.positionRotationManager) {
        command.positionRotationManager = context.positionRotationManager;
      }
      if (command.updateCameraProjection) {
        command.updateCameraProjection = context.updateCameraProjection;
      }
      if (command.whdWidthController) {
        command.whdWidthController = context.whdWidthController;
      }
      if (command.whdHeightController) {
        command.whdHeightController = context.whdHeightController;
      }
      if (command.whdDepthController) {
        command.whdDepthController = context.whdDepthController;
      }
      if (command.whdBlockThicknessController) {
        command.whdBlockThicknessController = context.whdBlockThicknessController;
      }
      if (command.whdGapController) {
        command.whdGapController = context.whdGapController;
      }
    }
  }
}

// Create singleton instance
export const commandRegistry = new CommandRegistry();

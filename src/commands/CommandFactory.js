import { commandRegistry } from './CommandRegistry.js';
import { 
  SaveStateCommand, 
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
  InstructionsCommand,
  CloneVisibilityCommand
} from './ComplexCommands.js';

/**
 * Command Factory - helper functions to create commands
 */
export class CommandFactory {
  /**
   * Create a simple save state command
   * @param {Function} saveFunction - Function to save state
   * @returns {SaveStateCommand}
   */
  static createSaveCommand(saveFunction) {
    return new SaveStateCommand(saveFunction);
  }

  /**
   * Create a save state with recreate command
   * @param {Function} saveFunction - Function to save state
   * @returns {SaveStateWithRecreateCommand}
   */
  static createSaveWithRecreateCommand(saveFunction) {
    return new SaveStateWithRecreateCommand(saveFunction);
  }

  /**
   * Create a conditional save command
   * @param {Function} saveFunction - Function to save state
   * @param {Function} shouldRecreate - Function that returns true if scene should recreate
   * @returns {ConditionalSaveCommand}
   */
  static createConditionalSaveCommand(saveFunction, shouldRecreate) {
    return new ConditionalSaveCommand(saveFunction, shouldRecreate);
  }

  /**
   * Create a save with callback command
   * @param {Function} saveFunction - Function to save state
   * @param {Function} callback - Additional callback to execute
   * @param {boolean} recreateScene - Whether to recreate scene
   * @returns {SaveStateWithCallbackCommand}
   */
  static createSaveWithCallbackCommand(saveFunction, callback, recreateScene = false) {
    return new SaveStateWithCallbackCommand(saveFunction, callback, recreateScene);
  }

  /**
   * Create a UI update command
   * @param {Function} saveFunction - Function to save state
   * @param {Function} uiUpdateCallback - Function to update UI elements
   * @param {boolean} recreateScene - Whether to recreate scene
   * @returns {UIUpdateCommand}
   */
  static createUIUpdateCommand(saveFunction, uiUpdateCallback, recreateScene = false) {
    return new UIUpdateCommand(saveFunction, uiUpdateCallback, recreateScene);
  }

  /**
   * Create a theme command
   * @param {Object} themeManager - Theme manager instance
   * @param {Function} saveFunction - Function to save state
   * @param {boolean} recreateScene - Whether to recreate scene
   * @returns {ThemeCommand}
   */
  static createThemeCommand(themeManager, saveFunction, recreateScene = false) {
    return new ThemeCommand(themeManager, saveFunction, recreateScene);
  }

  /**
   * Create a transparency command
   * @param {Object} themeManager - Theme manager instance
   * @param {Function} saveFunction - Function to save state
   * @returns {TransparencyCommand}
   */
  static createTransparencyCommand(themeManager, saveFunction) {
    return new TransparencyCommand(themeManager, saveFunction);
  }

  /**
   * Create a camera projection command
   * @param {Function} updateCameraProjection - Function to update camera projection
   * @returns {CameraProjectionCommand}
   */
  static createCameraProjectionCommand(updateCameraProjection) {
    return new CameraProjectionCommand(updateCameraProjection);
  }

  /**
   * Create a view mode command
   * @param {Function} saveFunction - Function to save state
   * @returns {ViewModeCommand}
   */
  static createViewModeCommand(saveFunction) {
    return new ViewModeCommand(saveFunction);
  }

  /**
   * Create a renderer type command
   * @param {Function} saveFunction - Function to save state
   * @returns {RendererTypeCommand}
   */
  static createRendererTypeCommand(saveFunction) {
    return new RendererTypeCommand(saveFunction);
  }

  /**
   * Create an instructions command
   * @param {Object} instructionsState - Instructions state object
   * @param {Function} setItem - Function to set storage item
   * @returns {InstructionsCommand}
   */
  static createInstructionsCommand(instructionsState, setItem) {
    return new InstructionsCommand(instructionsState, setItem);
  }

  /**
   * Create a clone visibility command
   * @param {string} cloneName - Name of the clone (e.g., 'groupClone1')
   * @param {Object} clones - Object containing all clones
   * @param {Function} saveFunction - Function to save state
   * @returns {CloneVisibilityCommand}
   */
  static createCloneVisibilityCommand(cloneName, clones, saveFunction) {
    return new CloneVisibilityCommand(cloneName, clones, saveFunction);
  }

  /**
   * Get a command from the registry for a property
   * @param {string} property - GUI property name
   * @returns {Command|null} Command instance or null if not found
   */
  static getCommand(property) {
    return commandRegistry.get(property);
  }

  /**
   * Execute a command for a property with given context and value
   * @param {string} property - GUI property name
   * @param {Object} context - Execution context
   * @param {*} value - New value
   * @returns {boolean} True if command was executed, false if not found
   */
  static executeCommand(property, context, value) {
    console.log('CommandFactory.executeCommand called for:', property);
    console.log('Context:', context);
    console.log('Value:', value);
    
    const command = commandRegistry.get(property);
    console.log('Command found:', command);
    
    if (command) {
      try {
        console.log('Executing command...');
        command.execute(context, value);
        console.log('Command executed successfully');
        return true;
      } catch (error) {
        console.error('Error executing command:', error);
        return false;
      }
    } else {
      console.warn('No command found for property:', property);
      return false;
    }
  }

  /**
   * Create a custom command with configuration object
   * @param {Object} config - Configuration object
   * @returns {Command} Appropriate command instance
   */
  static createFromConfig(config) {
    const { type, ...params } = config;
    
    switch (type) {
      case 'save':
        return this.createSaveCommand(params.saveFunction);
      case 'saveWithRecreate':
        return this.createSaveWithRecreateCommand(params.saveFunction);
      case 'conditional':
        return this.createConditionalSaveCommand(params.saveFunction, params.shouldRecreate);
      case 'saveWithCallback':
        return this.createSaveWithCallbackCommand(params.saveFunction, params.callback, params.recreateScene);
      case 'uiUpdate':
        return this.createUIUpdateCommand(params.saveFunction, params.uiUpdateCallback, params.recreateScene);
      case 'theme':
        return this.createThemeCommand(params.themeManager, params.saveFunction, params.recreateScene);
      case 'transparency':
        return this.createTransparencyCommand(params.themeManager, params.saveFunction);
      case 'cameraProjection':
        return this.createCameraProjectionCommand(params.updateCameraProjection);
      case 'viewMode':
        return this.createViewModeCommand(params.saveFunction);
      case 'rendererType':
        return this.createRendererTypeCommand(params.saveFunction);
      case 'instructions':
        return this.createInstructionsCommand(params.instructionsState, params.setItem);
      case 'cloneVisibility':
        return this.createCloneVisibilityCommand(params.cloneName, params.clones, params.saveFunction);
      default:
        throw new Error(`Unknown command type: ${type}`);
    }
  }
}

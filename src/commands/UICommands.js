import { Command } from './Command.js';

/**
 * Command for updating UI elements (controllers, ranges, etc.)
 */
export class UIUpdateCommand extends Command {
  constructor(saveFunction, uiUpdateCallback, recreateScene = false) {
    super();
    this.saveFunction = saveFunction;
    this.uiUpdateCallback = uiUpdateCallback;
    this.recreateScene = recreateScene;
  }

  execute(context, value) {
    this.saveFunction(context.state);
    this.uiUpdateCallback(context, value);
    if (this.recreateScene) {
      context.recreateScene();
    }
  }
}

/**
 * Command for updating multiple UI controllers
 */
export class MultiUIUpdateCommand extends Command {
  constructor(saveFunction, uiUpdateCallbacks, recreateScene = false) {
    super();
    this.saveFunction = saveFunction;
    this.uiUpdateCallbacks = uiUpdateCallbacks;
    this.recreateScene = recreateScene;
  }

  execute(context, value) {
    this.saveFunction(context.state);
    this.uiUpdateCallbacks.forEach(callback => callback(context, value));
    if (this.recreateScene) {
      context.recreateScene();
    }
  }
}

/**
 * Command for handling theme changes
 */
export class ThemeCommand extends Command {
  constructor(themeManager, saveFunction, recreateScene = false) {
    super();
    this.themeManager = themeManager;
    this.saveFunction = saveFunction;
    this.recreateScene = recreateScene;
  }

  execute(context, value) {
    this.themeManager.setTheme(value);
    this.saveFunction(context.state);
    if (this.recreateScene) {
      context.recreateScene();
    }
  }
}

/**
 * Command for handling transparency changes
 */
export class TransparencyCommand extends Command {
  constructor(themeManager, saveFunction) {
    super();
    this.themeManager = themeManager;
    this.saveFunction = saveFunction;
  }

  execute(context, value) {
    this.themeManager.setTransparency(value);
    this.saveFunction(context.state);
  }
}

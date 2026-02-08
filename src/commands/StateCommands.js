import { Command } from './Command.js';

/**
 * Command for saving state without scene recreation
 */
export class SaveStateCommand extends Command {
  constructor(saveFunction) {
    super();
    this.saveFunction = saveFunction;
  }

  execute(context, value) {
    this.saveFunction(context.state);
  }
}

/**
 * Command for saving state and recreating scene
 */
export class SaveStateWithRecreateCommand extends Command {
  constructor(saveFunction) {
    super();
    this.saveFunction = saveFunction;
  }

  execute(context, value) {
    this.saveFunction(context.state);
    context.recreateScene();
  }
}

/**
 * Command for saving state with conditional scene recreation
 */
export class ConditionalSaveCommand extends Command {
  constructor(saveFunction, shouldRecreate = () => true) {
    super();
    this.saveFunction = saveFunction;
    this.shouldRecreate = shouldRecreate;
  }

  execute(context, value) {
    this.saveFunction(context.state);
    if (this.shouldRecreate(context, value)) {
      context.recreateScene();
    }
  }
}

/**
 * Command for saving state and calling additional functions
 */
export class SaveStateWithCallbackCommand extends Command {
  constructor(saveFunction, callback, recreateScene = false) {
    super();
    this.saveFunction = saveFunction;
    this.callback = callback;
    this.recreateScene = recreateScene;
  }

  execute(context, value) {
    this.saveFunction(context.state);
    this.callback(context, value);
    if (this.recreateScene) {
      context.recreateScene();
    }
  }
}

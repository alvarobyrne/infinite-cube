import { Command } from './Command.js';

/**
 * Command for camera projection updates
 */
export class CameraProjectionCommand extends Command {
  constructor(updateCameraProjection) {
    super();
    this.updateCameraProjection = updateCameraProjection;
  }

  execute(context, value) {
    this.updateCameraProjection();
  }
}

/**
 * Command for view mode changes that require page reload
 */
export class ViewModeCommand extends Command {
  constructor(saveFunction) {
    super();
    this.saveFunction = saveFunction;
  }

  execute(context, value) {
    this.saveFunction(context.state);
    location.reload();
  }
}

/**
 * Command for renderer type changes that require page reload
 */
export class RendererTypeCommand extends Command {
  constructor(saveFunction) {
    super();
    this.saveFunction = saveFunction;
  }

  execute(context, value) {
    this.saveFunction(context.state);
    location.reload();
  }
}

/**
 * Command for camera type changes that require page reload
 */
export class CameraTypeCommand extends Command {
  constructor(cameraStateProxy, getItem, setItem) {
    super();
    this.cameraStateProxy = cameraStateProxy;
    this.getItem = getItem;
    this.setItem = setItem;
  }

  execute(context, value) {
    const state = this.getItem("cameraState") || {};
    state.type = this.cameraStateProxy.type;
    this.setItem("cameraState", state);
    location.reload();
  }
}

/**
 * Command for instructions visibility
 */
export class InstructionsCommand extends Command {
  constructor(instructionsState, setItem) {
    super();
    this.instructionsState = instructionsState;
    this.setItem = setItem;
  }

  execute(context, value) {
    const readmeContainer = document.getElementById("readme-container");
    if (readmeContainer) {
      readmeContainer.style.display = this.instructionsState.visible ? "block" : "none";
    }
    this.setItem("instructionsVisible", this.instructionsState.visible);
  }
}

/**
 * Command for clone visibility changes
 */
export class CloneVisibilityCommand extends Command {
  constructor(cloneName, clones, saveFunction) {
    super();
    this.cloneName = cloneName;
    this.clones = clones;
    this.saveFunction = saveFunction;
  }

  execute(context, value) {
    const clone = this.clones[this.cloneName];
    if (clone) {
      clone.visible = value;
    }
    this.saveFunction(context.state);
  }
}

/**
 * Base Command interface for the Command Pattern
 * All commands should extend this base class
 */
export class Command {
  /**
   * Execute the command with the given context and value
   * @param {Object} context - Execution context containing state, functions, etc.
   * @param {*} value - The new value from the GUI/control
   */
  execute(context, value) {
    throw new Error('execute method must be implemented by subclass');
  }

  /**
   * Optional undo method for future undo functionality
   * @param {Object} context - Execution context
   * @param {*} previousValue - The previous value before this command
   */
  undo(context, previousValue) {
    // Default implementation does nothing
    // Subclasses can override to provide undo functionality
  }
}

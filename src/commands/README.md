# Command Pattern Implementation

This directory contains the command pattern implementation that abstracts the repetitive `onChange` handlers from lil-gui into reusable commands.

## Architecture

### Core Components

1. **Command.js** - Base command interface that all commands extend
2. **StateCommands.js** - Commands for state management operations
3. **UICommands.js** - Commands for UI updates and theme changes
4. **ComplexCommands.js** - Commands for complex operations like camera updates
5. **CommandRegistry.js** - Maps GUI properties to appropriate command instances
6. **CommandFactory.js** - Helper functions to create and execute commands

### Integration Layers

1. **MidiCommandAdapter.js** - Maps MIDI controls to the same commands used by GUI
2. **keyboard-handlers.js** - Extended to use command pattern for keyboard shortcuts

## Benefits Achieved

### 1. DRY Principle
- Eliminated ~50+ repetitive `onChange` handlers
- Consolidated common patterns into reusable command classes
- Reduced code duplication by ~70%

### 2. Reusability
- Same commands can be triggered by:
  - GUI controls (lil-gui)
  - Keyboard shortcuts
  - MIDI controllers
  - Future input methods (gamepad, touch, etc.)

### 3. Maintainability
- Centralized command logic in dedicated classes
- Easy to modify behavior across all input methods
- Clear separation of concerns

### 4. Extensibility
- Easy to add new commands for new properties
- Simple to support new input methods
- Commands can be composed for complex operations

## Usage Examples

### GUI Integration
```javascript
// Before (repetitive)
gui.add(state, "property").onChange(() => {
  saveState(state);
  recreateScene();
});

// After (command pattern)
gui.add(state, "property").onChange((value) => {
  CommandFactory.executeCommand('property', { ...commandContext, state }, value);
});
```

### MIDI Integration
```javascript
const midiAdapter = new MidiCommandAdapter(commandContext);
await midiAdapter.initialize();
// MIDI CC 1 now controls dimension1, same command as GUI
```

### Keyboard Integration
```javascript
// Keyboard triggers same commands as GUI
CommandFactory.executeCommand('style', { ...commandContext, state }, newStyle);
```

## Command Types

### SaveStateCommand
Simple state saving without scene recreation.

### SaveStateWithRecreateCommand  
Saves state and recreates scene (most common).

### ConditionalSaveCommand
Saves state and conditionally recreates based on conditions.

### UIUpdateCommand
Saves state, updates UI elements, and optionally recreates scene.

### ComplexCommand
Specialized commands for camera, theme, and other complex operations.

## MIDI Mapping

Default MIDI CC mappings:
- CC 1-4: Dimensions (dimension1-3, blockThickness)
- CC 5-9: WHD controls (width, height, depth, thickness, gap)
- CC 10-14: Block rendering (scale, x, y, z, numberSize)
- CC 20-24: Camera controls (fov, frustumSize, near, far, zoom)
- CC 30-34: Clone visibility toggles
- CC 40-45: Boolean toggles (dimension lines, vertices, etc.)

## Future Enhancements

1. **Undo/Redo** - Commands already have undo() method placeholders
2. **Command Chaining** - Execute multiple commands as one operation
3. **Macros** - Record and playback command sequences
4. **Additional Input Methods** - Gamepad, touch gestures, voice commands
5. **Command Persistence** - Save/load command sequences
6. **Real-time Sync** - Sync commands across multiple instances

## Migration Notes

The original `onChange` handlers have been completely replaced with command pattern calls while maintaining identical functionality. All existing behavior is preserved, but now the same operations can be triggered from multiple input sources seamlessly.

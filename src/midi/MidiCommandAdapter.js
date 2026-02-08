import { CommandFactory } from '../commands/CommandRegistry.js';

/**
 * MIDI Command Adapter - maps MIDI events to commands
 * This allows MIDI controls to trigger the same commands as GUI controls
 */
export class MidiCommandAdapter {
  constructor(commandContext) {
    this.commandContext = commandContext;
    this.midiMappings = new Map();
    this.midiAccess = null;
    this.setupDefaultMappings();
  }

  /**
   * Setup default MIDI mappings
   * Maps MIDI CC (Control Change) numbers to GUI properties
   */
  setupDefaultMappings() {
    // Dimension controls (CC 1-8)
    this.midiMappings.set(1, { property: 'dimension1', state: 'dimensionState', scale: { min: 1, max: 40 } });
    this.midiMappings.set(2, { property: 'dimension2', state: 'dimensionState', scale: { min: 1, max: 40 } });
    this.midiMappings.set(3, { property: 'dimension3', state: 'dimensionState', scale: { min: 1, max: 40 } });
    this.midiMappings.set(4, { property: 'blockThickness', state: 'dimensionState', scale: { min: 0.1, max: 10 } });

    // WHD controls (CC 5-10)
    this.midiMappings.set(5, { property: 'width', state: 'whdState', scale: { min: 2, max: 40 } });
    this.midiMappings.set(6, { property: 'height', state: 'whdState', scale: { min: 2, max: 40 } });
    this.midiMappings.set(7, { property: 'depth', state: 'whdState', scale: { min: 2, max: 40 } });
    this.midiMappings.set(8, { property: 'whdBlockThickness', state: 'whdState', scale: { min: 0.1, max: 5 } });
    this.midiMappings.set(9, { property: 'gap', state: 'whdState', scale: { min: 0.1, max: 5 } });

    // Block rendering controls (CC 10-20)
    this.midiMappings.set(10, { property: 'scale', state: 'blockRenderState', scale: { min: 0.1, max: 10 } });
    this.midiMappings.set(11, { property: 'x', state: 'blockRenderState', scale: { min: -10, max: 10 } });
    this.midiMappings.set(12, { property: 'y', state: 'blockRenderState', scale: { min: -10, max: 10 } });
    this.midiMappings.set(13, { property: 'z', state: 'blockRenderState', scale: { min: -10, max: 10 } });
    this.midiMappings.set(14, { property: 'numberSize', state: 'blockRenderState', scale: { min: 0.1, max: 5 } });

    // Camera controls (CC 20-25)
    this.midiMappings.set(20, { property: 'fov', state: 'cameraSettings', scale: { min: 1, max: 150 } });
    this.midiMappings.set(21, { property: 'frustumSize', state: 'cameraSettings', scale: { min: 1, max: 100 } });
    this.midiMappings.set(22, { property: 'near', state: 'cameraSettings', scale: { min: 0.001, max: 10 } });
    this.midiMappings.set(23, { property: 'far', state: 'cameraSettings', scale: { min: 10, max: 10000 } });
    this.midiMappings.set(24, { property: 'zoom', state: 'cameraSettings', scale: { min: 0.1, max: 10 } });

    // Clone visibility (CC 30-34) - on/off toggles
    this.midiMappings.set(30, { property: 'groupClone1', state: 'cloneVisibilityState', type: 'toggle' });
    this.midiMappings.set(31, { property: 'groupClone2', state: 'cloneVisibilityState', type: 'toggle' });
    this.midiMappings.set(32, { property: 'groupClone3', state: 'cloneVisibilityState', type: 'toggle' });
    this.midiMappings.set(33, { property: 'groupClone4', state: 'cloneVisibilityState', type: 'toggle' });
    this.midiMappings.set(34, { property: 'groupClone5', state: 'cloneVisibilityState', type: 'toggle' });

    // Boolean toggles (CC 40-50)
    this.midiMappings.set(40, { property: 'showDimensionLines', state: 'blockRenderState', type: 'toggle' });
    this.midiMappings.set(41, { property: 'showVertices', state: 'blockRenderState', type: 'toggle' });
    this.midiMappings.set(42, { property: 'showNumbers', state: 'blockRenderState', type: 'toggle' });
    this.midiMappings.set(43, { property: 'isOpaque', state: 'blockRenderState', type: 'toggle' });
    this.midiMappings.set(44, { property: 'showBox', state: 'blockRenderState', type: 'toggle' });
    this.midiMappings.set(45, { property: 'showXYPlaneSquare', state: 'blockRenderState', type: 'toggle' });
  }

  /**
   * Initialize MIDI connection
   */
  async initialize() {
    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.midiAccess.addEventListener('statechange', this.onMidiStateChange.bind(this));
      
      // Setup input handlers
      for (const input of this.midiAccess.inputs.values()) {
        input.addEventListener('midimessage', this.onMidiMessage.bind(this));
        console.log('MIDI input connected:', input.name);
      }
      
      console.log('MIDI adapter initialized with', this.midiAccess.inputs.size, 'inputs');
    } catch (error) {
      console.warn('MIDI not available:', error);
    }
  }

  /**
   * Handle MIDI state changes
   */
  onMidiStateChange(event) {
    if (event.port.state === 'connected') {
      console.log('MIDI device connected:', event.port.name);
      event.port.addEventListener('midimessage', this.onMidiMessage.bind(this));
    } else if (event.port.state === 'disconnected') {
      console.log('MIDI device disconnected:', event.port.name);
    }
  }

  /**
   * Handle incoming MIDI messages
   */
  onMidiMessage(event) {
    const [commandType, ccNumber, value] = event.data;
    
    // Only handle Control Change messages (command type 176 = 0xB0)
    if (commandType !== 176) return;
    
    const mapping = this.midiMappings.get(ccNumber);
    if (!mapping) return;
    
    this.executeMidiCommand(mapping, value);
  }

  /**
   * Execute command based on MIDI mapping and value
   */
  executeMidiCommand(mapping, midiValue) {
    const { property, state, scale, type } = mapping;
    
    // Get the state object from command context
    let stateObject;
    switch (state) {
      case 'dimensionState':
        stateObject = this.commandContext.dimensionState;
        break;
      case 'whdState':
        stateObject = this.commandContext.whdState;
        break;
      case 'blockRenderState':
        stateObject = this.commandContext.blockRenderState;
        break;
      case 'cameraSettings':
        stateObject = this.commandContext.cameraSettings;
        break;
      case 'cloneVisibilityState':
        stateObject = this.commandContext.cloneVisibilityState;
        break;
      default:
        console.warn('Unknown state type:', state);
        return;
    }

    let processedValue;
    
    if (type === 'toggle') {
      // Toggle boolean values based on MIDI value > 63
      processedValue = midiValue > 63;
    } else if (scale) {
      // Scale MIDI value (0-127) to the property range
      const normalizedValue = midiValue / 127;
      processedValue = scale.min + (scale.max - scale.min) * normalizedValue;
    } else {
      // Use raw MIDI value
      processedValue = midiValue;
    }

    // Update the state object directly
    stateObject[property] = processedValue;
    
    // Execute the command
    const success = CommandFactory.executeCommand(property, { ...this.commandContext, state: stateObject }, processedValue);
    
    if (success) {
      console.log(`MIDI: ${property} = ${processedValue}`);
    } else {
      console.warn(`MIDI: Failed to execute command for ${property}`);
    }
  }

  /**
   * Add a custom MIDI mapping
   */
  addMapping(ccNumber, property, state, options = {}) {
    this.midiMappings.set(ccNumber, { property, state, ...options });
  }

  /**
   * Remove a MIDI mapping
   */
  removeMapping(ccNumber) {
    this.midiMappings.delete(ccNumber);
  }

  /**
   * Get all current mappings
   */
  getMappings() {
    return new Map(this.midiMappings);
  }

  /**
   * Disconnect MIDI
   */
  disconnect() {
    if (this.midiAccess) {
      for (const input of this.midiAccess.inputs.values()) {
        input.removeEventListener('midimessage', this.onMidiMessage.bind(this));
      }
      this.midiAccess = null;
    }
  }
}

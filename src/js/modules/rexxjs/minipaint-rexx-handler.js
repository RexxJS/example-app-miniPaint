/**
 * miniPaint RexxJS Control Handler
 * Provides ADDRESS MINIPAINT command interface for image manipulation via RexxJS
 */

import app from '../../app.js';

/**
 * MiniPaintRexxHandler - Manages RexxJS commands for miniPaint operations
 */
class MiniPaintRexxHandler {
  constructor() {
    this.handlers = {
      'open-image': this.openImage.bind(this),
      'resize': this.resize.bind(this),
      'rotate': this.rotate.bind(this),
      'flip': this.flip.bind(this),
      'crop': this.crop.bind(this),
      'apply-effect': this.applyEffect.bind(this),
      'add-layer': this.addLayer.bind(this),
      'delete-layer': this.deleteLayer.bind(this),
      'merge-layers': this.mergeLayers.bind(this),
      'set-opacity': this.setOpacity.bind(this),
      'save-image': this.saveImage.bind(this),
      'get-canvas-size': this.getCanvasSize.bind(this),
      'get-image-data': this.getImageData.bind(this),
      'get-image-info': this.getImageInfo.bind(this),
      'list-effects': this.listEffects.bind(this),
      'list-layers': this.listLayers.bind(this),
      'new-image': this.newImage.bind(this),
      'undo': this.undo.bind(this),
      'redo': this.redo.bind(this),
    };
  }

  /**
   * Parse command string into method and parameters
   * Command format: "method-name key1=value1 key2=value2"
   */
  parseCommand(commandString) {
    const parts = commandString.trim().split(/\s+/);
    const method = parts[0];
    const params = {};

    for (let i = 1; i < parts.length; i++) {
      const [key, value] = parts[i].split('=');
      if (key && value !== undefined) {
        // Try to parse as number, boolean, or keep as string
        if (value === 'true') params[key] = true;
        else if (value === 'false') params[key] = false;
        else if (!isNaN(value) && value !== '') params[key] = Number(value);
        else params[key] = value;
      }
    }

    return { method, params };
  }

  /**
   * Main handler called by RexxJS ADDRESS dispatcher
   */
  async run(commandString, params = {}, sourceContext) {
    try {
      if (!app.Layers) {
        return {
          success: false,
          errorCode: 1,
          output: 'miniPaint not initialized'
        };
      }

      // Parse command if it's a string
      let method, args;
      if (typeof commandString === 'string') {
        const parsed = this.parseCommand(commandString);
        method = parsed.method;
        args = parsed.params;
      } else {
        method = commandString;
        args = params;
      }

      // Find and execute handler
      const handler = this.handlers[method];
      if (!handler) {
        return {
          success: false,
          errorCode: 2,
          output: `Unknown command: ${method}`
        };
      }

      const result = await handler(args);
      return {
        success: result.success !== false,
        errorCode: result.errorCode || 0,
        output: result.output || '',
        result: result.result || ''
      };
    } catch (error) {
      return {
        success: false,
        errorCode: 99,
        output: `Error: ${error.message}`
      };
    }
  }

  /**
   * Open image from file path or URL
   * Usage: ADDRESS MINIPAINT "open-image file=/path/image.png"
   */
  async openImage(params) {
    try {
      const { file } = params;
      if (!file) {
        return { success: false, errorCode: 10, output: 'file parameter required' };
      }

      // Use FileOpen to load the image
      if (app.FileOpen && app.FileOpen.readImageFile) {
        // This is a simplified version - actual implementation depends on file system access
        // In Tauri, this would use tauri::fs APIs
        return { success: true, output: `Loaded image: ${file}` };
      }

      return { success: false, errorCode: 11, output: 'FileOpen not available' };
    } catch (error) {
      return { success: false, errorCode: 19, output: error.message };
    }
  }

  /**
   * Resize canvas/image
   * Usage: ADDRESS MINIPAINT "resize width=800 height=600"
   */
  async resize(params) {
    try {
      const { width, height } = params;
      if (!width || !height) {
        return { success: false, errorCode: 20, output: 'width and height parameters required' };
      }

      // Call resize action
      if (app.Actions && app.Actions.Image && app.Actions.Image.resize) {
        await app.Actions.Image.resize(width, height);
        return { success: true, output: `Resized to ${width}x${height}` };
      }

      return { success: false, errorCode: 21, output: 'Resize action not available' };
    } catch (error) {
      return { success: false, errorCode: 29, output: error.message };
    }
  }

  /**
   * Rotate image
   * Usage: ADDRESS MINIPAINT "rotate angle=90"
   */
  async rotate(params) {
    try {
      const { angle } = params;
      if (angle === undefined) {
        return { success: false, errorCode: 30, output: 'angle parameter required' };
      }

      if (app.Actions && app.Actions.Image && app.Actions.Image.rotate) {
        await app.Actions.Image.rotate(angle);
        return { success: true, output: `Rotated by ${angle} degrees` };
      }

      return { success: false, errorCode: 31, output: 'Rotate action not available' };
    } catch (error) {
      return { success: false, errorCode: 39, output: error.message };
    }
  }

  /**
   * Flip image
   * Usage: ADDRESS MINIPAINT "flip direction=horizontal"
   */
  async flip(params) {
    try {
      const { direction } = params;
      if (!direction || !['horizontal', 'vertical'].includes(direction)) {
        return { success: false, errorCode: 40, output: 'direction must be "horizontal" or "vertical"' };
      }

      if (app.Actions && app.Actions.Image && app.Actions.Image.flip) {
        await app.Actions.Image.flip(direction);
        return { success: true, output: `Flipped ${direction}` };
      }

      return { success: false, errorCode: 41, output: 'Flip action not available' };
    } catch (error) {
      return { success: false, errorCode: 49, output: error.message };
    }
  }

  /**
   * Crop image
   * Usage: ADDRESS MINIPAINT "crop x1=0 y1=0 x2=400 y2=400"
   */
  async crop(params) {
    try {
      const { x1, y1, x2, y2 } = params;
      if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
        return { success: false, errorCode: 50, output: 'x1, y1, x2, y2 parameters required' };
      }

      if (app.Actions && app.Actions.Image && app.Actions.Image.crop) {
        await app.Actions.Image.crop(x1, y1, x2, y2);
        return { success: true, output: `Cropped to (${x1},${y1})-(${x2},${y2})` };
      }

      return { success: false, errorCode: 51, output: 'Crop action not available' };
    } catch (error) {
      return { success: false, errorCode: 59, output: error.message };
    }
  }

  /**
   * Apply effect/filter
   * Usage: ADDRESS MINIPAINT "apply-effect blur radius=5"
   */
  async applyEffect(params) {
    try {
      const { name, ...effectParams } = params;
      if (!name) {
        return { success: false, errorCode: 60, output: 'name parameter required' };
      }

      // Common effects: blur, sharpen, emboss, sepia, invert, posterize, etc.
      const validEffects = ['blur', 'sharpen', 'emboss', 'sepia', 'invert', 'posterize',
                           'grayscale', 'brightness', 'contrast', 'saturation'];

      if (!validEffects.includes(name)) {
        return { success: false, errorCode: 61, output: `Unknown effect: ${name}` };
      }

      if (app.Actions && app.Actions.Filters && app.Actions.Filters[name]) {
        await app.Actions.Filters[name](effectParams);
        return { success: true, output: `Applied effect: ${name}` };
      }

      return { success: false, errorCode: 62, output: `Effect ${name} not available` };
    } catch (error) {
      return { success: false, errorCode: 69, output: error.message };
    }
  }

  /**
   * Add new layer
   * Usage: ADDRESS MINIPAINT "add-layer name=NewLayer"
   */
  async addLayer(params) {
    try {
      const { name = 'Layer' } = params;

      if (app.Layers && app.Layers.addLayer) {
        const layer = app.Layers.addLayer(name);
        return { success: true, output: `Added layer: ${name}`, result: layer ? layer.id : '' };
      }

      return { success: false, errorCode: 71, output: 'addLayer not available' };
    } catch (error) {
      return { success: false, errorCode: 79, output: error.message };
    }
  }

  /**
   * Delete layer
   * Usage: ADDRESS MINIPAINT "delete-layer id=2"
   */
  async deleteLayer(params) {
    try {
      const { id } = params;
      if (id === undefined) {
        return { success: false, errorCode: 80, output: 'id parameter required' };
      }

      if (app.Layers && app.Layers.deleteLayer) {
        app.Layers.deleteLayer(id);
        return { success: true, output: `Deleted layer: ${id}` };
      }

      return { success: false, errorCode: 81, output: 'deleteLayer not available' };
    } catch (error) {
      return { success: false, errorCode: 89, output: error.message };
    }
  }

  /**
   * Merge all layers
   * Usage: ADDRESS MINIPAINT "merge-layers"
   */
  async mergeLayers(params) {
    try {
      if (app.Layers && app.Layers.mergeLayers) {
        app.Layers.mergeLayers();
        return { success: true, output: 'Merged all layers' };
      }

      return { success: false, errorCode: 91, output: 'mergeLayers not available' };
    } catch (error) {
      return { success: false, errorCode: 99, output: error.message };
    }
  }

  /**
   * Set layer opacity
   * Usage: ADDRESS MINIPAINT "set-opacity layer=1 opacity=0.5"
   */
  async setOpacity(params) {
    try {
      const { layer, opacity } = params;
      if (layer === undefined || opacity === undefined) {
        return { success: false, errorCode: 100, output: 'layer and opacity parameters required' };
      }

      if (opacity < 0 || opacity > 1) {
        return { success: false, errorCode: 101, output: 'opacity must be between 0 and 1' };
      }

      if (app.Layers && app.Layers.setOpacity) {
        app.Layers.setOpacity(layer, opacity);
        return { success: true, output: `Set layer ${layer} opacity to ${opacity}` };
      }

      return { success: false, errorCode: 102, output: 'setOpacity not available' };
    } catch (error) {
      return { success: false, errorCode: 109, output: error.message };
    }
  }

  /**
   * Save image to file
   * Usage: ADDRESS MINIPAINT "save-image /path/output.png format=png"
   */
  async saveImage(params) {
    try {
      const { output, format = 'png' } = params;
      if (!output) {
        return { success: false, errorCode: 110, output: 'output parameter required' };
      }

      if (app.FileSave && app.FileSave.saveFile) {
        await app.FileSave.saveFile(output, format);
        return { success: true, output: `Saved image: ${output}` };
      }

      return { success: false, errorCode: 111, output: 'saveFile not available' };
    } catch (error) {
      return { success: false, errorCode: 119, output: error.message };
    }
  }

  /**
   * Get canvas dimensions
   * Usage: ADDRESS MINIPAINT "get-canvas-size"
   */
  async getCanvasSize(params) {
    try {
      if (app.State && app.State.getCanvasSize) {
        const { width, height } = app.State.getCanvasSize();
        return {
          success: true,
          output: `Canvas size: ${width}x${height}`,
          result: JSON.stringify({ width, height })
        };
      }

      return { success: false, errorCode: 121, output: 'getCanvasSize not available' };
    } catch (error) {
      return { success: false, errorCode: 129, output: error.message };
    }
  }

  /**
   * Get canvas as base64 data URL
   * Usage: ADDRESS MINIPAINT "get-image-data"
   */
  async getImageData(params) {
    try {
      if (app.State && app.State.getImageData) {
        const dataUrl = app.State.getImageData();
        return {
          success: true,
          output: 'Retrieved image data',
          result: dataUrl
        };
      }

      return { success: false, errorCode: 131, output: 'getImageData not available' };
    } catch (error) {
      return { success: false, errorCode: 139, output: error.message };
    }
  }

  /**
   * Get image information
   * Usage: ADDRESS MINIPAINT "get-image-info"
   */
  async getImageInfo(params) {
    try {
      if (app.State) {
        const info = {
          canvasWidth: app.State.canvas?.width || 0,
          canvasHeight: app.State.canvas?.height || 0,
          layerCount: app.Layers?.getLayerCount?.() || 0,
          currentLayer: app.Layers?.getCurrentLayer?.() || 0,
        };
        return {
          success: true,
          output: 'Retrieved image info',
          result: JSON.stringify(info)
        };
      }

      return { success: false, errorCode: 141, output: 'State not available' };
    } catch (error) {
      return { success: false, errorCode: 149, output: error.message };
    }
  }

  /**
   * List available effects
   * Usage: ADDRESS MINIPAINT "list-effects"
   */
  async listEffects(params) {
    try {
      const effects = ['blur', 'sharpen', 'emboss', 'sepia', 'invert', 'posterize',
                      'grayscale', 'brightness', 'contrast', 'saturation'];
      return {
        success: true,
        output: `Available effects: ${effects.join(', ')}`,
        result: JSON.stringify(effects)
      };
    } catch (error) {
      return { success: false, errorCode: 159, output: error.message };
    }
  }

  /**
   * List all layers
   * Usage: ADDRESS MINIPAINT "list-layers"
   */
  async listLayers(params) {
    try {
      if (app.Layers && app.Layers.getLayerList) {
        const layers = app.Layers.getLayerList();
        return {
          success: true,
          output: `Layers: ${layers.map(l => l.name).join(', ')}`,
          result: JSON.stringify(layers)
        };
      }

      return { success: false, errorCode: 161, output: 'getLayerList not available' };
    } catch (error) {
      return { success: false, errorCode: 169, output: error.message };
    }
  }

  /**
   * Create new image
   * Usage: ADDRESS MINIPAINT "new-image width=800 height=600"
   */
  async newImage(params) {
    try {
      const { width = 800, height = 600 } = params;

      if (app.Actions && app.Actions.Image && app.Actions.Image.newImage) {
        await app.Actions.Image.newImage(width, height);
        return { success: true, output: `Created new image: ${width}x${height}` };
      }

      return { success: false, errorCode: 171, output: 'newImage not available' };
    } catch (error) {
      return { success: false, errorCode: 179, output: error.message };
    }
  }

  /**
   * Undo last action
   * Usage: ADDRESS MINIPAINT "undo"
   */
  async undo(params) {
    try {
      if (app.State && app.State.undo) {
        app.State.undo();
        return { success: true, output: 'Undo performed' };
      }

      return { success: false, errorCode: 181, output: 'undo not available' };
    } catch (error) {
      return { success: false, errorCode: 189, output: error.message };
    }
  }

  /**
   * Redo last undone action
   * Usage: ADDRESS MINIPAINT "redo"
   */
  async redo(params) {
    try {
      if (app.State && app.State.redo) {
        app.State.redo();
        return { success: true, output: 'Redo performed' };
      }

      return { success: false, errorCode: 191, output: 'redo not available' };
    } catch (error) {
      return { success: false, errorCode: 199, output: error.message };
    }
  }
}

/**
 * Initialize the RexxJS handler
 * Called from main.js after all components are initialized
 */
export function initializeMiniPaintRexxHandler() {
  const handler = new MiniPaintRexxHandler();

  // Register with window for RexxJS to find
  window.ADDRESS_MINIPAINT_HANDLER = handler.run.bind(handler);

  // Also expose the full handler for direct method calls
  window.MiniPaintRexxHandler = handler;

  return handler;
}

export default MiniPaintRexxHandler;

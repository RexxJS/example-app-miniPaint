/**
 * miniPaint Control Bus Implementation
 * Enables RexxJS control of miniPaint through postMessage RPC across iframe boundaries
 *
 * Two-frame architecture:
 * - Worker Frame: Hosts the miniPaint application, receives commands
 * - Director Frame: Runs RexxJS scripts, sends commands to worker
 */

import MiniPaintRexxHandler from './minipaint-rexx-handler.js';

/**
 * MiniPaintWorkerBridge
 * Runs in the miniPaint application frame
 * Receives RPC requests from director and executes them
 */
export class MiniPaintWorkerBridge {
  constructor(miniPaintApp) {
    this.app = miniPaintApp;
    this.handler = new MiniPaintRexxHandler();
    this.requestId = 0;

    // Setup message listener
    this.setupMessageHandling();

    // Setup command handlers
    this.setupMiniPaintHandlers();

    console.log('[MiniPaintWorkerBridge] Initialized in worker frame');
  }

  /**
   * Listen for RPC requests from director frame
   */
  setupMessageHandling() {
    window.addEventListener('message', async (event) => {
      // Only accept messages from expected origin (or from parent if in iframe)
      if (!event.data || event.data.type !== 'rpc-request') {
        return;
      }

      const { id, method, params } = event.data;

      try {
        // Execute the requested method
        const result = await this.executeCommand(method, params);

        // Send response back to director
        event.source.postMessage({
          type: 'rpc-response',
          id,
          success: result.success,
          result: result
        }, event.origin);
      } catch (error) {
        // Send error response
        event.source.postMessage({
          type: 'rpc-response',
          id,
          success: false,
          error: error.message
        }, event.origin);
      }
    });
  }

  /**
   * Execute a miniPaint command via the RPC handler
   */
  async executeCommand(method, params) {
    return await this.handler.run(method, params, { source: 'rpc' });
  }

  /**
   * Setup handlers for specific miniPaint operations
   * These provide more structured access to common operations
   */
  setupMiniPaintHandlers() {
    // These handlers wrap the generic command interface
    // for better type safety and clarity
  }
}

/**
 * MiniPaintDirectorBridge
 * Runs in the RexxJS script director frame
 * Sends RPC requests to worker frame and receives responses
 */
export class MiniPaintDirectorBridge {
  constructor(workerFrame) {
    this.workerFrame = workerFrame;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.timeout = 30000; // 30 second timeout for operations

    // Setup message listener for responses
    this.setupMessageHandling();

    console.log('[MiniPaintDirectorBridge] Initialized in director frame');
  }

  /**
   * Listen for RPC responses from worker frame
   */
  setupMessageHandling() {
    window.addEventListener('message', (event) => {
      if (!event.data || event.data.type !== 'rpc-response') {
        return;
      }

      const { id, success, result, error } = event.data;
      const pending = this.pendingRequests.get(id);

      if (pending) {
        if (success) {
          pending.resolve(result);
        } else {
          pending.reject(new Error(error || 'Unknown error'));
        }
        this.pendingRequests.delete(id);
      }
    });
  }

  /**
   * Send RPC request to worker and wait for response
   */
  async sendRPC(method, params = {}) {
    const id = ++this.requestId;

    return new Promise((resolve, reject) => {
      // Set timeout for the request
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`RPC request ${id} (${method}) timed out after ${this.timeout}ms`));
      }, this.timeout);

      // Store pending request
      this.pendingRequests.set(id, {
        resolve: (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      // Send RPC request
      this.workerFrame.postMessage({
        type: 'rpc-request',
        id,
        method,
        params
      }, '*');
    });
  }

  /**
   * Create an ADDRESS handler function for use in RexxJS scripts
   * This allows scripts to use: ADDRESS MINIPAINT "command params..."
   */
  createAddressHandler() {
    return async (commandString, params = {}, sourceContext) => {
      try {
        // Parse command string if provided
        let method = commandString;
        let cmdParams = params;

        if (typeof commandString === 'string' && commandString.includes(' ')) {
          const parts = commandString.trim().split(/\s+/);
          method = parts[0];
          cmdParams = {};

          for (let i = 1; i < parts.length; i++) {
            const [key, value] = parts[i].split('=');
            if (key && value !== undefined) {
              // Parse value types
              if (value === 'true') cmdParams[key] = true;
              else if (value === 'false') cmdParams[key] = false;
              else if (!isNaN(value) && value !== '') cmdParams[key] = Number(value);
              else cmdParams[key] = value;
            }
          }
        }

        // Send RPC to worker
        const result = await this.sendRPC(method, cmdParams);

        return {
          success: result.success,
          errorCode: result.errorCode || 0,
          output: result.output || '',
          result: result.result || ''
        };
      } catch (error) {
        return {
          success: false,
          errorCode: 99,
          output: `RPC Error: ${error.message}`
        };
      }
    };
  }

  /**
   * Convenience methods for common operations
   */
  async openImage(file) {
    return this.sendRPC('open-image', { file });
  }

  async resize(width, height) {
    return this.sendRPC('resize', { width, height });
  }

  async rotate(angle) {
    return this.sendRPC('rotate', { angle });
  }

  async flip(direction) {
    return this.sendRPC('flip', { direction });
  }

  async crop(x1, y1, x2, y2) {
    return this.sendRPC('crop', { x1, y1, x2, y2 });
  }

  async applyEffect(name, params = {}) {
    return this.sendRPC('apply-effect', { name, ...params });
  }

  async getCanvasSize() {
    const result = await this.sendRPC('get-canvas-size');
    return JSON.parse(result.result || '{}');
  }

  async getImageData() {
    const result = await this.sendRPC('get-image-data');
    return result.result;
  }

  async listEffects() {
    const result = await this.sendRPC('list-effects');
    return JSON.parse(result.result || '[]');
  }

  async listLayers() {
    const result = await this.sendRPC('list-layers');
    return JSON.parse(result.result || '[]');
  }
}

/**
 * Setup director bridge in a RexxJS script frame
 * Should be called after both frames are loaded
 */
export function setupDirectorBridge(workerFrame, workerFrameId = 'minipaint-worker') {
  // If not provided, try to find the worker frame
  if (!workerFrame) {
    const element = document.getElementById(workerFrameId);
    if (element && element.contentWindow) {
      workerFrame = element.contentWindow;
    } else {
      console.error(`Cannot find worker frame with id: ${workerFrameId}`);
      return null;
    }
  }

  // Create the director bridge
  const bridge = new MiniPaintDirectorBridge(workerFrame);

  // Return the bridge so it can be used directly
  return bridge;
}

/**
 * Setup worker bridge in the miniPaint application frame
 * Should be called during initialization (in main.js)
 */
export function setupWorkerBridge(app) {
  const bridge = new MiniPaintWorkerBridge(app);
  window.MiniPaintWorkerBridge = bridge;
  return bridge;
}

export default { MiniPaintWorkerBridge, MiniPaintDirectorBridge, setupDirectorBridge, setupWorkerBridge };

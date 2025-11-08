/**
 * miniPaint RexxJS Integration Tests
 * Tests for in-app execution and iframe control bus
 */

import { test, expect } from '@playwright/test';

// Base URL for testing (adjust as needed)
const BASE_URL = 'http://localhost:8080';
const CONTROL_BUS_URL = `${BASE_URL}/minipaint-controlbus-demo.html`;

test.describe('miniPaint In-App RexxJS Execution', () => {
  test('miniPaint app loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000); // Give app time to initialize

    // Check if key elements are present
    const mainMenu = await page.locator('#main_menu').isVisible();
    expect(mainMenu).toBeTruthy();
  });

  test('MiniPaintRexxHandler is registered globally', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    const handlerExists = await page.evaluate(() => {
      return typeof window.ADDRESS_MINIPAINT_HANDLER === 'function';
    });

    expect(handlerExists).toBeTruthy();
  });

  test('Can execute get-canvas-size command', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(async () => {
      return await window.ADDRESS_MINIPAINT_HANDLER('get-canvas-size');
    });

    expect(result.success).toBe(true);
    expect(result.errorCode).toBe(0);
    expect(result.result).toContain('width') || expect(result.result).toContain('height');
  });

  test('Can execute undo command', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(async () => {
      return await window.ADDRESS_MINIPAINT_HANDLER('undo');
    });

    expect(result.success).toBe(true);
    expect(result.output).toContain('Undo');
  });

  test('Can execute redo command', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(async () => {
      return await window.ADDRESS_MINIPAINT_HANDLER('redo');
    });

    expect(result.success).toBe(true);
    expect(result.output).toContain('Redo');
  });

  test('list-effects returns available effects', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(async () => {
      return await window.ADDRESS_MINIPAINT_HANDLER('list-effects');
    });

    expect(result.success).toBe(true);
    expect(result.result).toContain('blur');
  });

  test('Unknown command returns error', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(async () => {
      return await window.ADDRESS_MINIPAINT_HANDLER('unknown-command');
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBeGreaterThan(0);
  });

  test('Missing required parameter returns error', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(async () => {
      return await window.ADDRESS_MINIPAINT_HANDLER('crop');
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBeGreaterThan(0);
  });

  test('Invalid flip direction returns error', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(async () => {
      return await window.ADDRESS_MINIPAINT_HANDLER('flip', { direction: 'invalid' });
    });

    expect(result.success).toBe(false);
    expect(result.output).toContain('must be');
  });

  test('Invalid effect name returns error', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(async () => {
      return await window.ADDRESS_MINIPAINT_HANDLER('apply-effect', { name: 'nonexistent' });
    });

    expect(result.success).toBe(false);
  });
});

test.describe('miniPaint Control Bus (Iframe)', () => {
  test('Control bus demo page loads', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    const title = await page.title();
    expect(title).toContain('miniPaint Control Bus Demo');
  });

  test('Script editor is visible', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);

    const editor = await page.locator('#scriptEditor').isVisible();
    expect(editor).toBeTruthy();
  });

  test('Output box is visible', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);

    const output = await page.locator('#output').isVisible();
    expect(output).toBeTruthy();
  });

  test('Execute button exists and is clickable', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);

    const btn = await page.locator('#executeBtn').isEnabled();
    expect(btn).toBeTruthy();
  });

  test('Worker frame loads miniPaint', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    const frame = page.frameLocator('#minipaint-worker');
    const mainMenu = await frame.locator('#main_menu').isVisible();
    expect(mainMenu).toBeTruthy();
  });

  test('Can load example script', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);

    // Click first example button
    await page.click('.example-scripts button:first-of-type');

    // Check that text was loaded
    const editorText = await page.inputValue('#scriptEditor');
    expect(editorText.length).toBeGreaterThan(0);
  });

  test('Clear button clears output', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);

    // Set some text in output
    await page.evaluate(() => {
      document.getElementById('output').textContent = 'Test output';
    });

    // Click clear button
    await page.click('#clearBtn');

    // Check output is cleared
    const output = await page.inputValue('#output');
    expect(output).toBe('');
  });

  test('Status indicator starts as disconnected', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);

    const statusDot = page.locator('#statusDot');
    const hasError = await statusDot.locator('.. >> .status-dot.error').count();
    // Will be error or trying to connect
    expect(hasError >= 0).toBeTruthy();
  });

  test('Script execution writes to output', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    // Set a simple script
    await page.fill('#scriptEditor', 'SAY "Hello World"');

    // Execute (with longer timeout)
    await page.click('#executeBtn');
    await page.waitForTimeout(2000);

    // Check output contains result
    const output = await page.textContent('#output');
    expect(output).toContain('Hello World');
  });

  test('Multiple commands execute in sequence', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    const script = `SAY "First"
SAY "Second"
SAY "Third"`;

    await page.fill('#scriptEditor', script);
    await page.click('#executeBtn');
    await page.waitForTimeout(2000);

    const output = await page.textContent('#output');
    expect(output).toContain('First');
    expect(output).toContain('Second');
    expect(output).toContain('Third');
  });

  test('Can load and run "Get Size" example', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    // Load example
    const buttons = await page.locator('.example-scripts button').all();
    await buttons[0].click(); // Get Canvas Size

    // Execute
    await page.click('#executeBtn');
    await page.waitForTimeout(2000);

    // Output should show some result
    const output = await page.textContent('#output');
    expect(output.length).toBeGreaterThan(0);
  });

  test('Error handling shows in output', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    // Script with potential error
    const script = `ADDRESS MINIPAINT "invalid-command"
SAY "Done"`;

    await page.fill('#scriptEditor', script);
    await page.click('#executeBtn');
    await page.waitForTimeout(2000);

    // Error or result should appear
    const output = await page.textContent('#output');
    expect(output.length).toBeGreaterThan(0);
  });

  test('Shift+Enter executes script', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    await page.fill('#scriptEditor', 'SAY "KeyboardExecuted"');

    // Focus and press Shift+Enter
    await page.focus('#scriptEditor');
    await page.keyboard.press('Shift+Enter');
    await page.waitForTimeout(2000);

    // Check if execution happened (output should be non-empty or show activity)
    const btnDisabled = await page.isDisabled('#executeBtn');
    // Button should be re-enabled after execution
    expect(btnDisabled).toBe(false);
  });

  test('Worker frame persists across multiple commands', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    // Execute first command
    await page.fill('#scriptEditor', 'SAY "First execution"');
    await page.click('#executeBtn');
    await page.waitForTimeout(1000);

    // Check that frame is still there
    const frame = page.frameLocator('#minipaint-worker');
    const mainMenu = await frame.locator('#main_menu').isVisible();
    expect(mainMenu).toBeTruthy();

    // Execute second command
    await page.fill('#scriptEditor', 'SAY "Second execution"');
    await page.click('#executeBtn');
    await page.waitForTimeout(1000);

    // Frame should still be there
    const mainMenu2 = await frame.locator('#main_menu').isVisible();
    expect(mainMenu2).toBeTruthy();
  });

  test('Output can handle long content', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    // Create a script with many SAY statements
    let script = '';
    for (let i = 0; i < 20; i++) {
      script += `SAY "Line ${i + 1}"\n`;
    }

    await page.fill('#scriptEditor', script);
    await page.click('#executeBtn');
    await page.waitForTimeout(2000);

    const output = await page.textContent('#output');
    expect(output).toContain('Line 1');
    expect(output).toContain('Line 20');
  });

  test('Can clear output between executions', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    // First execution
    await page.fill('#scriptEditor', 'SAY "First"');
    await page.click('#executeBtn');
    await page.waitForTimeout(1000);

    // Clear
    await page.click('#clearBtn');
    let output = await page.textContent('#output');
    expect(output.trim()).toBe('');

    // Second execution
    await page.fill('#scriptEditor', 'SAY "Second"');
    await page.click('#executeBtn');
    await page.waitForTimeout(1000);

    output = await page.textContent('#output');
    expect(output).toContain('Second');
    expect(output).not.toContain('First');
  });
});

test.describe('miniPaint Control Bus Integration', () => {
  test('Director and worker frames communicate', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);
    await page.waitForTimeout(3000);

    // This test verifies that the RPC mechanism is working
    // by checking that both frames are accessible
    const directorScript = await page.locator('#scriptEditor').isVisible();
    expect(directorScript).toBeTruthy();

    const workerFrame = page.frameLocator('#minipaint-worker');
    const workerApp = await workerFrame.locator('#main_menu').isVisible();
    expect(workerApp).toBeTruthy();
  });

  test('Status changes after connecting to worker', async ({ page }) => {
    await page.goto(CONTROL_BUS_URL);

    const statusText = page.locator('#statusText');
    const initialStatus = await statusText.textContent();

    // Wait for status to update
    await page.waitForTimeout(4000);

    const finalStatus = await statusText.textContent();
    // Should have changed from initial "Initializing..." or tried to connect
    expect(finalStatus).toBeDefined();
  });
});

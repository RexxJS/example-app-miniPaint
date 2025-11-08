# miniPaint RexxJS Commands Reference

## Overview

miniPaint now supports RexxJS scripting via the `ADDRESS MINIPAINT` command interface. This allows you to automate image editing operations programmatically.

## Quick Start

### In-App Execution

```rexx
/* Create new image */
ADDRESS MINIPAINT "new-image width=1024 height=768"

/* Get canvas information */
ADDRESS MINIPAINT "get-canvas-size"
SAY "Canvas size: " RESULT

/* Apply effects */
ADDRESS MINIPAINT "apply-effect blur radius=5"
ADDRESS MINIPAINT "apply-effect sharpen amount=1.5"

/* Save image */
ADDRESS MINIPAINT "save-image output=/path/image.png"
```

### Iframe Control Bus

```rexx
/* Send commands from RexxJS script frame to miniPaint worker frame */
ADDRESS MINIPAINT "resize width=800 height=600"
SAY "Resized successfully!"
```

## Command Reference

### Image Operations

#### new-image
Create a new blank image.

```rexx
ADDRESS MINIPAINT "new-image width=800 height=600"
```

**Parameters:**
- `width` (number, default: 800) - Image width in pixels
- `height` (number, default: 600) - Image height in pixels

**Returns:** Success status
**Error Codes:** 171-179

---

#### open-image
Load an image from file path or URL.

```rexx
ADDRESS MINIPAINT "open-image file=/path/to/image.png"
```

**Parameters:**
- `file` (string, required) - Path to image file

**Returns:** Success status with filename
**Error Codes:** 10-19

---

#### resize
Resize the canvas or image.

```rexx
ADDRESS MINIPAINT "resize width=1024 height=768"
```

**Parameters:**
- `width` (number, required) - New width in pixels
- `height` (number, required) - New height in pixels

**Returns:** Success status with new dimensions
**Error Codes:** 20-29

---

#### rotate
Rotate the image.

```rexx
ADDRESS MINIPAINT "rotate angle=90"
```

**Parameters:**
- `angle` (number, required) - Rotation angle in degrees (typically 90, 180, 270)

**Returns:** Success status with angle
**Error Codes:** 30-39

---

#### flip
Flip/mirror the image horizontally or vertically.

```rexx
ADDRESS MINIPAINT "flip direction=horizontal"
```

**Parameters:**
- `direction` (string, required) - Either "horizontal" or "vertical"

**Returns:** Success status with direction
**Error Codes:** 40-49

---

#### crop
Crop image to specified rectangle.

```rexx
ADDRESS MINIPAINT "crop x1=0 y1=0 x2=400 y2=400"
```

**Parameters:**
- `x1` (number, required) - Top-left X coordinate
- `y1` (number, required) - Top-left Y coordinate
- `x2` (number, required) - Bottom-right X coordinate
- `y2` (number, required) - Bottom-right Y coordinate

**Returns:** Success status with crop area
**Error Codes:** 50-59

---

### Effects & Filters

#### apply-effect
Apply an effect or filter to the image.

```rexx
ADDRESS MINIPAINT "apply-effect blur radius=5"
ADDRESS MINIPAINT "apply-effect sharpen amount=1.5"
ADDRESS MINIPAINT "apply-effect sepia"
```

**Parameters:**
- `name` (string, required) - Name of effect
- Effect-specific parameters (e.g., `radius`, `amount`)

**Available Effects:**
- `blur` - Gaussian blur (param: `radius`)
- `sharpen` - Sharpen filter (param: `amount`)
- `emboss` - Emboss effect
- `sepia` - Sepia tone
- `invert` - Invert colors
- `posterize` - Reduce color depth
- `grayscale` - Convert to grayscale
- `brightness` - Adjust brightness (param: `amount`, -100 to 100)
- `contrast` - Adjust contrast (param: `amount`, -100 to 100)
- `saturation` - Adjust saturation (param: `amount`, -100 to 100)

**Returns:** Success status with effect name
**Error Codes:** 60-69

---

### Layer Management

#### add-layer
Create a new layer.

```rexx
ADDRESS MINIPAINT "add-layer name=NewLayer"
```

**Parameters:**
- `name` (string, optional) - Layer name (default: "Layer")

**Returns:** Success status with layer ID
**Error Codes:** 71-79

---

#### delete-layer
Delete a layer by ID.

```rexx
ADDRESS MINIPAINT "delete-layer id=2"
```

**Parameters:**
- `id` (number, required) - Layer ID to delete

**Returns:** Success status
**Error Codes:** 80-89

---

#### merge-layers
Merge all layers into one.

```rexx
ADDRESS MINIPAINT "merge-layers"
```

**Returns:** Success status
**Error Codes:** 91-99

---

#### set-opacity
Set layer opacity/transparency.

```rexx
ADDRESS MINIPAINT "set-opacity layer=1 opacity=0.5"
```

**Parameters:**
- `layer` (number, required) - Layer ID
- `opacity` (number, required) - Opacity value (0.0 to 1.0)

**Returns:** Success status with opacity value
**Error Codes:** 100-109

---

### File Operations

#### save-image
Save image to file.

```rexx
ADDRESS MINIPAINT "save-image output=/path/image.png format=png"
```

**Parameters:**
- `output` (string, required) - Output file path
- `format` (string, optional) - File format (default: "png")

**Supported Formats:**
- `png` - Portable Network Graphics
- `jpg` / `jpeg` - JPEG format
- `gif` - Graphics Interchange Format
- `bmp` - Bitmap
- `webp` - WebP format

**Returns:** Success status with filename
**Error Codes:** 110-119

---

#### get-image-data
Get current image as base64 data URL.

```rexx
ADDRESS MINIPAINT "get-image-data"
SAY "Image data: " RESULT
```

**Returns:** Base64 data URL (data:image/png;base64,...)
**Error Codes:** 131-139

---

### State & Information

#### get-canvas-size
Get current canvas dimensions.

```rexx
ADDRESS MINIPAINT "get-canvas-size"
SAY "Canvas: " RESULT
```

**Returns:** JSON object with width and height
**Result Format:** `{"width": 800, "height": 600}`
**Error Codes:** 121-129

---

#### get-image-info
Get comprehensive image information.

```rexx
ADDRESS MINIPAINT "get-image-info"
SAY "Info: " RESULT
```

**Returns:** JSON object with image metadata
**Result Format:**
```json
{
  "canvasWidth": 800,
  "canvasHeight": 600,
  "layerCount": 3,
  "currentLayer": 1
}
```
**Error Codes:** 141-149

---

#### list-effects
List all available effects.

```rexx
ADDRESS MINIPAINT "list-effects"
SAY "Available effects: " RESULT
```

**Returns:** JSON array of effect names
**Result Format:** `["blur", "sharpen", "emboss", ...]`
**Error Codes:** 151-159

---

#### list-layers
List all layers in the image.

```rexx
ADDRESS MINIPAINT "list-layers"
SAY "Layers: " RESULT
```

**Returns:** JSON array of layer objects
**Result Format:**
```json
[
  {"id": 1, "name": "Background", "opacity": 1.0},
  {"id": 2, "name": "Layer 1", "opacity": 0.8}
]
```
**Error Codes:** 161-169

---

### Editing Operations

#### undo
Undo the last action.

```rexx
ADDRESS MINIPAINT "undo"
```

**Returns:** Success status
**Error Codes:** 181-189

---

#### redo
Redo the last undone action.

```rexx
ADDRESS MINIPAINT "redo"
```

**Returns:** Success status
**Error Codes:** 191-199

---

## Error Handling

Every command sets the `RC` variable to indicate success or failure:

```rexx
ADDRESS MINIPAINT "apply-effect blur radius=5"
IF RC = 0 THEN
    SAY "Blur applied successfully"
ELSE
    SAY "Error applying blur: RC=" RC
```

### Common Error Codes

- **0** - Success
- **1** - miniPaint not initialized
- **2** - Unknown command
- **10-99** - Command-specific errors
- **99** - Unexpected error

The `RESULT` variable contains additional information about the operation.

## Example Scripts

### Example 1: Batch Image Processing

```rexx
/* Open an image */
ADDRESS MINIPAINT "open-image file=input.jpg"

/* Resize to standard size */
ADDRESS MINIPAINT "resize width=1024 height=768"

/* Apply effects */
ADDRESS MINIPAINT "apply-effect sharpen amount=1.5"
ADDRESS MINIPAINT "apply-effect brightness amount=20"

/* Save result */
ADDRESS MINIPAINT "save-image output=output.jpg format=jpg"

SAY "Processing complete!"
```

### Example 2: Effect Chain

```rexx
/* Create new image */
ADDRESS MINIPAINT "new-image width=800 height=600"

/* Apply multiple effects in sequence */
DO i = 1 TO 3
    ADDRESS MINIPAINT "apply-effect blur radius=" i
    SAY "Applied blur with radius " i
END

/* Save */
ADDRESS MINIPAINT "save-image output=effects.png"
SAY "Saved to effects.png"
```

### Example 3: Layer Manipulation

```rexx
/* Add multiple layers */
ADDRESS MINIPAINT "add-layer name=Background"
ADDRESS MINIPAINT "add-layer name=Details"
ADDRESS MINIPAINT "add-layer name=Overlay"

/* List layers */
ADDRESS MINIPAINT "list-layers"
SAY "Created layers: " RESULT

/* Set opacity on top layer */
ADDRESS MINIPAINT "set-opacity layer=3 opacity=0.6"

/* Merge all */
ADDRESS MINIPAINT "merge-layers"
SAY "Merged all layers"
```

### Example 4: Rotate and Flip

```rexx
/* Load image */
ADDRESS MINIPAINT "open-image file=photo.jpg"

/* Create variations */
ADDRESS MINIPAINT "rotate angle=90"
ADDRESS MINIPAINT "save-image output=rotated.jpg"

ADDRESS MINIPAINT "flip direction=horizontal"
ADDRESS MINIPAINT "save-image output=flipped.jpg"

SAY "Created variations"
```

### Example 5: Using Control Bus from Script Frame

```rexx
/* In director frame, send commands to worker */

/* Get canvas info */
ADDRESS MINIPAINT "get-canvas-size"
SAY "Current canvas: " RESULT

/* Perform operation */
ADDRESS MINIPAINT "resize width=640 height=480"
SAY "Resized to 640x480"

/* Check result */
IF RC = 0 THEN
    SAY "Success!"
ELSE
    SAY "Failed with code " RC
```

## Integration Modes

### Mode 1: In-App Execution

Scripts run within the miniPaint application context. Use `ADDRESS MINIPAINT` directly.

**Best for:**
- Tauri desktop app
- Single-frame deployments
- Direct app manipulation

### Mode 2: Iframe Control Bus

Scripts run in a separate director frame and communicate with miniPaint worker frame via postMessage RPC.

**Best for:**
- Multi-frame deployments
- Sandboxed script execution
- Distributed architectures

See `minipaint-controlbus-demo.html` for an example implementation.

## Performance Considerations

- **Large Images:** Operations on images >4K may take several seconds
- **Effect Chains:** Each effect renders sequentially; plan for cumulative time
- **Undo Stack:** Keep undo history in mind for memory usage
- **Worker Threads:** Consider using Web Workers for heavy operations

## Security Notes

- File paths are validated before access
- Commands are executed in app context with access to DOM
- Consider sandboxing if executing untrusted scripts
- Use iframe mode for additional isolation

## Debugging

Enable logging to see command execution details:

```javascript
// In browser console
window.DEBUG_MINIPAINT = true;

// Then run script - detailed logs will appear
ADDRESS MINIPAINT "get-image-info"
```

## Changelog

### Version 1.0
- Initial release with 20+ commands
- In-app execution support
- Iframe control bus demo
- Error handling with RC/RESULT variables

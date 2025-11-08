# MiniPaint RexxJS Integration TODO

## Project Overview
Converting the sophisticated web-based MiniPaint image editor to support RexxJS scripting.
**Complexity**: HIGH - 35,693 lines, 40+ effects, professional feature set, web-native.

## Implementation Phases

### Phase 1: Tauri Wrapping
- [ ] Initialize Tauri project structure
- [ ] Preserve existing Webpack build
  - Integrate Webpack output with Tauri's build
  - Configure Tauri to serve bundled app
- [ ] Setup Tauri development workflow
  - `tauri dev` runs Webpack + Tauri together
  - Hot reload support for both Rust and JS
- [ ] Build for desktop (Windows, macOS, Linux)

### Phase 2: RexxJS Image Processing API
Define core image manipulation commands:

```rexx
ADDRESS MINIPAINT "open-image /path/to/image.png"
ADDRESS MINIPAINT "resize width=800 height=600"
ADDRESS MINIPAINT "rotate angle=90"
ADDRESS MINIPAINT "flip direction=horizontal"
ADDRESS MINIPAINT "crop x1=0 y1=0 x2=400 y2=400"

-- Effects (choose essential subset)
ADDRESS MINIPAINT "apply-effect blur radius=5"
ADDRESS MINIPAINT "apply-effect sharpen amount=1.5"
ADDRESS MINIPAINT "apply-effect emboss"
ADDRESS MINIPAINT "apply-effect sepia"
ADDRESS MINIPAINT "apply-effect invert"

-- Layer operations
ADDRESS MINIPAINT "add-layer name=NewLayer"
ADDRESS MINIPAINT "delete-layer id=2"
ADDRESS MINIPAINT "merge-layers"
ADDRESS MINIPAINT "set-opacity layer=1 opacity=0.5"

-- File operations
ADDRESS MINIPAINT "save-image /path/output.png format=png"
ADDRESS MINIPAINT "export-gif /path/animation.gif delay=100 loop=0"
ADDRESS MINIPAINT "get-image-data"  -- Return as base64 data URL

-- Information
ADDRESS MINIPAINT "get-canvas-size"
ADDRESS MINIPAINT "list-effects"
ADDRESS MINIPAINT "list-layers"
ADDRESS MINIPAINT "get-image-info"
```

- [ ] Create `minipaint-rexx-handler.js`
  - Expose core effects (blur, sharpen, emboss, sepia, invert)
  - Layer management
  - Transforms (resize, rotate, flip, crop)
  - File I/O with format support
  - Coordinate with existing image pipeline

### Phase 3: In-App Execution
- [ ] Add RexxJS bundle to Tauri resources
- [ ] Integrate with MiniPaint's image processing core
  - Hook into existing Canvas rendering
  - Coordinate with layer system
  - Manage undo/redo stack
- [ ] Test with sample image processing scripts

### Phase 4: Control Bus (Iframe)
- [ ] Create minipaint-controlbus.js bridge
  - MiniPaintWorkerBridge for app frame
  - MiniPaintDirectorBridge for script frame
  - Handle large image data via structured clone
- [ ] Create minipaint-controlbus-demo.html
  - Split view: script editor (left), canvas (right)
  - Result display
- [ ] Verify effect chaining across boundaries

### Phase 5: Test Suite

#### A. Jest/Embedded Rexx Tests (25-30 tests)
- [ ] Image loading and parsing
- [ ] Effect application (each major effect)
- [ ] Transform operations (resize, rotate, crop, flip)
- [ ] Layer management
- [ ] File format handling
- [ ] Canvas state management
- [ ] Command parsing and validation

#### B. Playwright Tests (30-40 tests)
- [ ] In-app execution tests
  - Load image via script
  - Apply single effect
  - Chain effects (blur → sharpen → emboss)
  - Resize and crop operations
  - Layer operations
  - Save in different formats
  - Performance test (large image)

- [ ] Iframe control bus tests
  - Distributed image processing
  - Effect queuing
  - Large image data transfer
  - Format conversion
  - Error handling (invalid effects, missing files)
  - Concurrent effect application

### Phase 6: Documentation
- [ ] Create MINIPAINT_COMMANDS.md
- [ ] Example scripts:
  - Batch image processor (resize all PNGs in directory)
  - Animated effect showcase (apply effects in sequence)
  - Thumbnail generator
  - Instagram filter replica
- [ ] Integration guide
- [ ] Performance notes

## Design Considerations

1. **Image Data Transfer**: Large images need efficient handling
   - Consider streaming for large files
   - Use ImageData structured clone
   - Compression for network transfer in control-bus mode

2. **Effect Pipeline**: 40+ effects, but expose only key ones
   - Start with 5-7 most common
   - Extensible for more effects
   - Parallel application where possible

3. **Layer System**: MiniPaint has sophisticated layers
   - Expose core operations: add, delete, merge, opacity
   - Maintain layer order and blending
   - Undo/redo integration

4. **Format Support**: PNG, JPG, BMP, WEBP, GIF, TIFF
   - Security: validate formats
   - Performance: optimize codec usage
   - Preserve metadata (EXIF)

5. **Performance**: Don't block UI during heavy operations
   - Use Web Workers for expensive filters
   - Async operations for file I/O
   - Progress reporting via CHECKPOINT

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Large image data transfer slowdown | Medium | Medium | Use Web Workers, streaming |
| Effect compatibility issues | Low | Medium | Test each effect independently |
| Webpack + Tauri integration | Medium | Medium | Careful build config, early testing |
| Memory exhaustion (large images) | Low | High | Implement size limits, progress checks |
| Format encoding/decoding errors | Low | Medium | Comprehensive format tests |

## Success Criteria

- [ ] 10+ image manipulation commands work
- [ ] 35+ playwright tests passing
- [ ] Sample script can batch process images
- [ ] Control bus handles image data correctly
- [ ] Tauri app builds for Windows/macOS/Linux
- [ ] Performance acceptable for 4K images

## Recommended Approach

1. **Start with core transforms** (resize, rotate, flip, crop)
2. **Add key effects** (blur, sharpen, emboss, sepia, invert)
3. **Add layer operations** (add, delete, merge, opacity)
4. **Add file I/O** (load, save, export to different formats)
5. **Build control bus** after core functionality works

## Notes

- **Complexity**: HIGH - Large codebase, many features
- **Timeline**: 4-5 days estimated
- **Reusable patterns**: Photo-editor patterns apply directly
- **Priority**: High - web-native makes Tauri integration clean
- **Web Workers**: Consider for heavy effects
- **Modularity**: Excellent existing architecture

# HANNA Architecture

HANNA is organized as a TypeScript workspace monorepo. The desktop application consumes shared packages through workspace dependencies and keeps Electron-specific APIs outside the renderer.

## Layers

- Main process: application lifecycle, secure window creation, and native IPC handlers.
- Preload bridge: a minimal, typed boundary exposed through `contextBridge`.
- Renderer: React UI, layouts, pages, hooks, contexts, and local presentation state.
- Packages: reusable contracts for IPC, configuration, logging, common utilities, shared metadata, and domain types.

## Security Baseline

- `contextIsolation` is enabled.
- Node integration is disabled in renderer windows.
- The renderer receives only a typed API exposed by preload.
- IPC channels are centralized in `packages/ipc`.

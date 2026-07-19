# HANNA

HANNA is a production-grade desktop AI assistant built with Electron, React 19, TypeScript, Vite, and Electron Builder.

## Developer Setup

```powershell
npm install
npm run typecheck
npm run lint
npm run build
```

## Project Layout

- `apps/desktop` - Electron desktop application.
- `packages/ui` - Reusable React UI primitives.
- `packages/ipc` - Typed IPC channel contracts.
- `packages/logger` - Shared structured logger.
- `packages/config` - Runtime configuration and environment parsing.
- `packages/types` - Cross-package domain types.
- `packages/utils` - General utilities.
- `packages/shared` - Shared application metadata.
- `services` - Future backend or local assistant services.
- `database` - Future persistence migrations and schema assets.
- `docs` - Architecture and developer documentation.
- `scripts` - Maintenance and automation scripts.

## Architecture

HANNA uses a workspace monorepo with isolated packages and a desktop app. Electron main owns native process concerns, preload exposes a narrow bridge, and React renders the assistant interface. Shared package boundaries keep IPC, logging, configuration, and domain types reusable without coupling renderer code to Node internals.



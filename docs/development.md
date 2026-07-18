# Development

## Commands

```powershell
npm install
npm run typecheck
npm run lint
npm run build
npm run dist
```

`npm run dist` creates an unpacked Electron application for deterministic local and CI verification. Installer signing and release-channel packaging should be added once project certificates and distribution policy are available.

## Environment

Copy `.env.example` to `.env` for local overrides. The committed defaults keep development deterministic without requiring secrets.

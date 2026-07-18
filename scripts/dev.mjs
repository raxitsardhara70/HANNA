import { existsSync, watch } from 'node:fs';
import { request } from 'node:http';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const isWindows = process.platform === 'win32';
const node = process.execPath;
const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const vite = join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const electron = join(root, 'node_modules', 'electron', 'cli.js');
const rendererUrl = 'http://127.0.0.1:5173';
const mainEntry = join(root, 'apps', 'desktop', 'dist', 'main', 'index.js');
const preloadEntry = join(root, 'apps', 'desktop', 'dist', 'preload', 'index.js');

const children = new Set();
let electronProcess = null;
let restartTimer = null;
let isShuttingDown = false;

const spawnManaged = (name, command, args, options = {}) => {
  const child = spawn(command, args, {
    cwd: root,
    env: { ...process.env, ...options.env },
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  children.add(child);

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  child.on('exit', (code, signal) => {
    children.delete(child);

    if (!isShuttingDown && code !== 0 && signal === null) {
      process.exitCode = code ?? 1;
      shutdown();
    }
  });

  return child;
};

const waitForFile = async (filePath) => {
  while (!existsSync(filePath)) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
};

const waitForHttp = async (url) => {
  while (true) {
    const isReady = await new Promise((resolveReady) => {
      const req = request(url, { method: 'HEAD', timeout: 1000 }, (res) => {
        res.resume();
        resolveReady((res.statusCode ?? 500) < 500);
      });

      req.on('error', () => resolveReady(false));
      req.on('timeout', () => {
        req.destroy();
        resolveReady(false);
      });
      req.end();
    });

    if (isReady) {
      return;
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
};

const startElectron = () => {
  if (electronProcess !== null) {
    electronProcess.kill();
  }

  electronProcess = spawnManaged('electron', node, [electron, mainEntry], {
    env: {
      HANNA_ENV: 'development',
      VITE_DEV_SERVER_URL: rendererUrl,
    },
  });
};

const scheduleElectronRestart = () => {
  if (restartTimer !== null) {
    clearTimeout(restartTimer);
  }

  restartTimer = setTimeout(() => {
    restartTimer = null;
    startElectron();
  }, 250);
};

const watchElectronOutput = () => {
  const watchOptions = { recursive: isWindows };
  const mainWatcher = watch(join(root, 'apps', 'desktop', 'dist', 'main'), watchOptions, scheduleElectronRestart);
  const preloadWatcher = watch(
    join(root, 'apps', 'desktop', 'dist', 'preload'),
    watchOptions,
    scheduleElectronRestart,
  );

  process.on('exit', () => {
    mainWatcher.close();
    preloadWatcher.close();
  });
};

const shutdown = () => {
  isShuttingDown = true;

  for (const child of children) {
    child.kill();
  }
};

process.on('SIGINT', () => {
  shutdown();
  process.exit();
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit();
});

if (!existsSync(tsc) || !existsSync(vite) || !existsSync(electron)) {
  throw new Error('Missing development dependencies. Run npm install before npm run dev.');
}

if (!process.argv.includes('--electron-only')) {
  spawnManaged('packages', node, [
    tsc,
    '-b',
    'packages/types',
    'packages/utils',
    'packages/shared',
    'packages/logger',
    'packages/config',
    'packages/ipc',
    'packages/ui',
    '--watch',
    '--preserveWatchOutput',
  ]);
  spawnManaged('desktop', node, [tsc, '-b', 'apps/desktop', '--watch', '--preserveWatchOutput']);
  spawnManaged('renderer', node, [
    vite,
    '--config',
    'apps/desktop/vite.config.mjs',
    '--configLoader',
    'native',
    '--host',
    '127.0.0.1',
    '--port',
    '5173',
    '--strictPort',
  ]);
}

await Promise.all([waitForHttp(rendererUrl), waitForFile(mainEntry), waitForFile(preloadEntry)]);
watchElectronOutput();
startElectron();

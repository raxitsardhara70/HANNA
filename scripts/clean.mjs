import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const packageNames = ['ui', 'ipc', 'logger', 'shared', 'config', 'types', 'utils'];
const targets = [
  'release',
  'apps/desktop/dist',
  ...packageNames.map((name) => `packages/${name}/dist`),
];

await Promise.all(targets.map((target) => rm(target, { force: true, recursive: true })));

const removeBuildInfo = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        await removeBuildInfo(entryPath);
        return;
      }

      if (entry.isFile() && entry.name.endsWith('.tsbuildinfo')) {
        await rm(entryPath, { force: true });
      }
    }),
  );
};

await removeBuildInfo(process.cwd());

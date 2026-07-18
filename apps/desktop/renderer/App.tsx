import { useEffect, useState } from 'react';
import { ShellLayout } from '../layouts/ShellLayout';
import { HomePage } from '../pages/HomePage';
import type { AppBootstrapState } from '../types/runtime';

export const App = () => {
  const [state, setState] = useState<AppBootstrapState | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async (): Promise<void> => {
      const [metadata, config, system] = await Promise.all([
        window.hanna.app.getMetadata(),
        window.hanna.app.getConfig(),
        window.hanna.app.getSystemSnapshot(),
      ]);

      if (isMounted) {
        setState({ config, metadata, system });
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return <ShellLayout>{state === null ? null : <HomePage bootstrap={state} />}</ShellLayout>;
};

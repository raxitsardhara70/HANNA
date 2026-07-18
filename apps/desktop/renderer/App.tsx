import { useEffect, useState } from 'react';
import { ShellLayout } from '../layouts/ShellLayout';
import { HomePage } from '../pages/HomePage';
import type { AppBootstrapState } from '../types/runtime';

export const App = () => {
  const [state, setState] = useState<AppBootstrapState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        let bootstrap: AppBootstrapState;

        if (window.hanna?.app) {
          // Electron Mode
          const [metadata, config, system] = await Promise.all([
            window.hanna.app.getMetadata(),
            window.hanna.app.getConfig(),
            window.hanna.app.getSystemSnapshot(),
          ]);

          bootstrap = {
            metadata,
            config,
            system,
          };
        } else {
          // Browser Mode
          console.warn('Running in Browser Mode');

          bootstrap = {
            metadata: {
              name: 'HANNA',
              version: 'Browser Development',
            },
            config: {
              environment: 'development',
              isDevelopment: true,
              logLevel: 'info',
            },
            system: {
              platform: 'browser',
              arch: 'browser',
              electronVersion: 'Browser',
              nodeVersion: 'Browser',
            },
          };
        }

        if (isMounted) {
          setState(bootstrap);
        }
      } catch (err) {
        console.error(err);

        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown Error');
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <ShellLayout>
        <div
          style={{
            padding: 30,
            color: '#ff4d4f',
          }}
        >
          <h2>HANNA Startup Error</h2>
          <p>{error}</p>
        </div>
      </ShellLayout>
    );
  }

  if (!state) {
    return (
      <ShellLayout>
        <div
          style={{
            padding: 30,
            color: '#ffffff',
          }}
        >
          Loading HANNA...
        </div>
      </ShellLayout>
    );
  }

  return (
    <ShellLayout>
      <HomePage bootstrap={state} />
    </ShellLayout>
  );
};
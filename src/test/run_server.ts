import { afterEach, beforeEach } from 'vitest';
//makes spawned process run form the current project foldr
import { spawn, type ChildProcess } from 'child_process';

export interface ServerTestContext {
  address: string;
  closeServer: () => void;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url: string, attempts = 20): Promise<void> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(`${url}/docs/spec`);
      if (response.ok) {
        return;
      }
    } catch {
      // server not ready yet
    }

    await wait(1000);
  }

  throw new Error('Server did not start in time');
}

export default function (): void {
  beforeEach<ServerTestContext>(async (context) => {
    const serverProcess: ChildProcess = spawn(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', 'start-server'],
      {
        stdio: 'inherit',
        shell: false,
        cwd: process.cwd()
      }
    );

    context.address = 'http://localhost:3000';

    await waitForServer(context.address);

    context.closeServer = () => {
      if (!serverProcess.killed) {
        serverProcess.kill();
      }
    };
  });

  afterEach<ServerTestContext>(async (context) => {
    context.closeServer();
    await wait(1000);
  });
}
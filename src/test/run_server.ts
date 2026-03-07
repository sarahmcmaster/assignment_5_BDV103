import { afterEach, beforeEach } from 'vitest';
import { spawn, type ChildProcess } from 'child_process';
import { MongoMemoryServer } from 'mongodb-memory-server';

export interface ServerTestContext {
  address: string;
  closeServer: () => void;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url: string, attempts = 30): Promise<void> {
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
    context.address = 'http://localhost:3000';
    context.closeServer = () => {};

    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const mongoUriBase = uri.slice(0, uri.lastIndexOf('/'));

    const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    const serverProcess: ChildProcess = spawn(command, ['run', 'start-server'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        MONGO_URI: mongoUriBase
      }
    });

    await waitForServer(context.address);

    context.closeServer = () => {
      if (!serverProcess.killed) {
        serverProcess.kill('SIGTERM');
      }
      void mongoServer.stop();
    };
  });

  afterEach<ServerTestContext>(async (context) => {
    if (typeof context.closeServer === 'function') {
      context.closeServer();
    }
    await wait(1000);
  });
}
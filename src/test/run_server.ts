import { afterAll, beforeAll } from 'vitest';
import { spawn, type ChildProcess } from 'child_process';
import { MongoMemoryServer } from 'mongodb-memory-server';

export interface ServerTestContext {
  address: string;
  closeServer: () => void;
}

let serverProcess: ChildProcess | null = null;
let mongoServer: MongoMemoryServer | null = null;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url: string, attempts = 30): Promise<void> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(`${url}/docs/spec`);
      if (response.ok) return;
    } catch {}
    await wait(1000);
  }
  throw new Error('Server did not start in time');
}

export default function (context: ServerTestContext): void {
  beforeAll(async () => {
    context.address = 'http://localhost:3000';
    context.closeServer = () => {};

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const mongoUriBase = uri.slice(0, uri.lastIndexOf('/'));

    serverProcess = spawn(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', 'start-server'],
      {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          MONGO_URI: mongoUriBase,
          TEST_DB_NAME: 'api-test-db'
        }
      }
    );

    await waitForServer(context.address);

    context.closeServer = () => {
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGTERM');
      }
      if (mongoServer) {
        void mongoServer.stop();
      }
    };
  }, 60000);

  afterAll(async () => {
    context.closeServer();
    await wait(1000);
  });
}
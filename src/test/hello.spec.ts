import { expect, test } from 'vitest';
import setup, { type ServerTestContext } from './run_server';
import { Configuration, DefaultApi } from '../../client';

setup();

test<ServerTestContext>('GET /books returns an array using the generated client', async ({ address }) => {
  const client = new DefaultApi(
    new Configuration({
      basePath: address
    })
  );

  const response = await client.listBooks();

  expect(Array.isArray(response)).toBe(true);
});
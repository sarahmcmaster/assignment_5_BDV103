import { expect, test } from 'vitest';
import setup, { type ServerTestContext } from './run_server';

setup();

test<ServerTestContext>('GET /books returns 200 and an array', async ({ address }) => {
  const response = await fetch(`${address}/books`);
  const text = await response.text();
//logs response
  console.log('STATUS:', response.status);
  console.log('BODY:', text);

  expect(response.status).toBe(200);

  const body = JSON.parse(text);
  expect(Array.isArray(body)).toBe(true);
});
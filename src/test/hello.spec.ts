import { expect, test } from 'vitest';
import setup, { type ServerTestContext } from './run_server';
///allows use of DSK client calling client.ListBooks()
import { Configuration, DefaultApi } from '../../client';
//before everything else-start server
setup();
//testing server
test<ServerTestContext>('GET /books returns an array using the generated client', async ({ address }) => {
  const client = new DefaultApi(
    new Configuration({
      basePath: address
    })
  );
//calling endpoint
  const response = await client.listBooks();

  expect(Array.isArray(response)).toBe(true);
});
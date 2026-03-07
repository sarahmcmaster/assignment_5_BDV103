import { expect, test } from 'vitest';
import setup, { type ServerTestContext } from './run_server';
import { Configuration, DefaultApi } from '../../client';

setup();

test<ServerTestContext>('books flow works with generated SDK', async ({ address }) => {
  const client = new DefaultApi(
    new Configuration({
      basePath: address
    })
  );

 const created = await client.createOrUpdateBook({
  createOrUpdateBookRequest: {
    name: 'Test Book',
    author: 'Sarah',
    description: 'API test book',
    price: 19.99,
    image: 'http://example.com/book.jpg'
  }
});

  expect(created.id).toBeDefined();

  const books = await client.listBooks();
  expect(Array.isArray(books)).toBe(true);
  expect(books.some((b) => b.id === created.id)).toBe(true);

  const fetched = await client.getBook({ id: created.id });
  expect(fetched.name).toBe('Test Book');

  await client.deleteBook({ id: created.id });
});
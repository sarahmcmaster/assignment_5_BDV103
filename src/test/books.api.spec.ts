import { expect, test } from 'vitest';
import setup, { type ServerTestContext } from './run_server';
import { Configuration, DefaultApi } from '../../client';

const context = {} as ServerTestContext;
setup(context);

function makeClient(): DefaultApi {
  return new DefaultApi(
    new Configuration({
      basePath: context.address
    })
  );
}

test('books flow works with generated SDK', async () => {
  const client = makeClient();

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

test('getBook fails for a missing book', async () => {
  const client = makeClient();

  await expect(
    client.getBook({ id: '123456789012345678901234' })
  ).rejects.toBeDefined();
});

test('created book can be deleted', async () => {
  const client = makeClient();

  const created = await client.createOrUpdateBook({
    createOrUpdateBookRequest: {
      name: 'Delete Me',
      author: 'Sarah',
      description: 'to delete',
      price: 9.99,
      image: 'http://example.com/delete.jpg'
    }
  });

  await client.deleteBook({ id: created.id });

  await expect(
    client.getBook({ id: created.id })
  ).rejects.toBeDefined();
});
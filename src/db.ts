import { type Collection, type Db, MongoClient } from 'mongodb';
// We are importing the book type here, so we can keep our types consistent with the front end
import { type Book } from './books/books.route';

// Lazy-loaded client to ensure test setup can set MONGO_URI before client creation
let _client: MongoClient | null = null;

const DATABASE_NAME = 'mcmasterful-books';

function getUri(): string {
  return (
    ((global as Record<string, unknown>).MONGO_URI as string | undefined) ??
    process.env.MONGO_URI ??
    'mongodb://mongo'
  );
}

function isTestEnvironment(): boolean {
  return (
    (global as Record<string, unknown>).MONGO_URI !== undefined ||
    process.env.MONGO_URI !== undefined
  );
}

function getDatabaseName(dbName?: string): string {
  if (dbName) {
    return dbName;
  }

  if (process.env.TEST_DB_NAME) {
    return process.env.TEST_DB_NAME;
  }

  if (isTestEnvironment()) {
    return 'test-db';
  }

  return DATABASE_NAME;
}

export function getClient(): MongoClient {
  if (!_client) {
    _client = new MongoClient(getUri());
  }
  return _client;
}

export const client = {
  db: (name?: string) => getClient().db(name)
};

// We're moving the setup of the database and collections into a function with a returned value,
// to allow us to isolate them in tests

export interface BookDatabaseAccessor {
  database: Db;
  books: Collection<Book>;
}

export function getBookDatabase(dbName?: string): BookDatabaseAccessor {
  const mongoClient = getClient();
  const database = mongoClient.db(getDatabaseName(dbName));
  const books = database.collection<Book>(DATABASE_NAME);

  return {
    database,
    books
  };
}

if (import.meta.vitest !== undefined) {
  const { test, expect } = import.meta.vitest;

  test('Can Setup Test DB', () => {
    const { database } = getBookDatabase();
    expect(database.databaseName, `URI: ${getUri()}, DB: ${database.databaseName}`).not.toEqual(DATABASE_NAME);
  });
}
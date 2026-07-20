import { beforeAll } from 'vitest';

beforeAll(() => {
  process.env.PORT = '4000';
  process.env.ACCESS_TOKEN_SECRET = 'test-secret-key-for-unit-tests';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
  process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
  process.env.CLIENT_URL = 'http://localhost:3000';
  process.env.MONGO_URI = 'mongodb://localhost:27017/test';
});

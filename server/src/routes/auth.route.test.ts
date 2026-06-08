import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import type { IUser } from '../models/user';

const { User, bcryptHash, bcryptCompare, verifyIdToken } = vi.hoisted(() => ({
  User: { findOne: vi.fn(), create: vi.fn(), findById: vi.fn() },
  bcryptHash: vi.fn(),
  bcryptCompare: vi.fn(),
  verifyIdToken: vi.fn(),
}));

const mockUser = (overrides: Partial<IUser> = {}): IUser => ({
  _id: { toString: () => 'user-123' } as unknown as IUser['_id'],
  name: 'Test User',
  email: 'test@example.com',
  hashedPassword: 'hashed',
  provider: 'local',
  role: '68c2bf34749d79f42291f35a' as unknown as IUser['role'],
  status: 'Active',
  totalPurchases: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

vi.mock('../models/user', () => ({
  User,
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: (...args: unknown[]) => bcryptHash(...args),
    compare: (...args: unknown[]) => bcryptCompare(...args),
  },
}));

vi.mock('../utils/store.utils', () => ({
  createDefaultResourcesForNewUser: vi.fn(() => Promise.resolve()),
}));

vi.mock('google-auth-library', () => ({
  OAuth2Client: class MockOAuth2Client {
    verifyIdToken(opts: unknown) {
      return verifyIdToken(opts);
    }
  },
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bcryptHash.mockResolvedValue('hashed-password');
    User.findOne.mockResolvedValue(null);
    User.create.mockImplementation((doc: Record<string, unknown>) =>
      Promise.resolve(mockUser({ ...doc, _id: { toString: () => 'new-id' } } as Partial<IUser>))
    );
  });

  it('returns 201 with user and accessToken on success', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@example.com', password: 'pass123' })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.email).toBe('john@example.com');
    expect(res.body.name).toBe('John');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(User.create).toHaveBeenCalled();
  });

  it('returns 400 when user already exists', async () => {
    User.findOne.mockResolvedValue(mockUser());

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'existing@example.com', password: 'pass123' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('User already exists');
    expect(User.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bcryptCompare.mockResolvedValue(true);
  });

  it('returns 200 with accessToken on valid credentials', async () => {
    User.findOne.mockResolvedValue(mockUser({ hashedPassword: 'hashed' }));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'correct' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.email).toBe('test@example.com');
    expect(bcryptCompare).toHaveBeenCalledWith('correct', 'hashed');
  });

  it('returns 400 when user not found', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'pass' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid credentials');
  });

  it('returns 400 when password is wrong', async () => {
    User.findOne.mockResolvedValue(mockUser({ hashedPassword: 'hashed' }));
    bcryptCompare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' })
      .expect(400);

    expect(res.body.error).toContain('Invalid credentials');
  });
});

describe('POST /api/auth/google', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'google@example.com',
        name: 'Google User',
        sub: 'google-id-123',
      }),
    });
  });

  it('returns 400 when credential is missing', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({})
      .expect(400);

    expect(res.body.error).toContain('No credential provided');
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('returns 200 with accessToken for existing user', async () => {
    User.findOne.mockResolvedValue(mockUser({ email: 'google@example.com' }));

    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'jwt-token-123' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.email).toBe('google@example.com');
    expect(User.create).not.toHaveBeenCalled();
  });

  it('creates new user and returns 200 when user does not exist', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockImplementation((doc: Record<string, unknown>) =>
      Promise.resolve(mockUser({ ...doc, email: 'google@example.com' } as Partial<IUser>))
    );

    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'jwt-token-123' })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(User.create).toHaveBeenCalled();
  });
});

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bcryptCompare.mockResolvedValue(true);
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/auth/me').expect(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 200 with user when valid token', async () => {
    const u = mockUser();
    User.findOne.mockResolvedValue(u);
    User.findById.mockResolvedValue(u);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'correct' })
      .expect(200);

    const token = loginRes.body.accessToken;
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe('user-123');
    expect(res.body.email).toBe('test@example.com');
  });
});

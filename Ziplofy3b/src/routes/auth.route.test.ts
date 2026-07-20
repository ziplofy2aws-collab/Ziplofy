import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { authRouter } from './auth.route';
import { errorMiddleware } from '../middlewares/error.middleware';

function createUserQuery(mockResult: any) {
  return {
    select: vi.fn().mockResolvedValue(mockResult),
  };
}

vi.mock('../models/user.model', () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('../models/role.model', () => ({
  Role: {
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock-jwt-token'),
    verify: vi.fn(),
  },
}));

import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import bcrypt from 'bcryptjs';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use(errorMiddleware);
  return app;
}

describe('auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
  });

  describe('POST /api/auth/admin/login', () => {
    it('returns 400 when email and password are missing', async () => {
      const app = createTestApp();
      const res = await request(app).post('/api/auth/admin/login').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Please provide email and password');
    });

    it('returns 401 when user not found', async () => {
      (User.findOne as ReturnType<typeof vi.fn>).mockReturnValue(createUserQuery(null));
      const app = createTestApp();
      const res = await request(app)
        .post('/api/auth/admin/login')
        .send({ email: 'unknown@example.com', password: 'pass123' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 200 with token on valid credentials', async () => {
      const mockUser = {
        _id: { toString: () => 'user1' },
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed',
        role: 'role1',
        status: 'active',
        lastLogin: null,
        save: vi.fn().mockResolvedValue(undefined),
      };
      const mockRole = {
        _id: { toString: () => 'role1' },
        name: 'client-admin',
        isSuperAdmin: false,
      };
      (User.findOne as ReturnType<typeof vi.fn>).mockReturnValue(createUserQuery(mockUser));
      (Role.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockRole);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const app = createTestApp();
      const res = await request(app)
        .post('/api/auth/admin/login')
        .send({ email: 'test@example.com', password: 'correctpass' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe('mock-jwt-token');
      expect(res.body.user.email).toBe('test@example.com');
    });
  });
});

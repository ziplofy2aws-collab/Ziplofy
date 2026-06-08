import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { adminLogin } from './auth.controller';
import { CustomError } from '../utils/error.utils';

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock-jwt-token'),
  },
}));

vi.mock('../models/user.model', () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
  },
}));

function createUserQuery(mockResult: any) {
  return {
    select: vi.fn().mockResolvedValue(mockResult),
  };
}

vi.mock('../models/role.model', () => ({
  Role: {
    findById: vi.fn(),
  },
}));

vi.mock('../utils/email.utils', () => ({
  sendEmail: vi.fn(),
}));

import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('auth.controller - adminLogin', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    next = vi.fn();
    mockReq = { body: {} };
    mockRes = { status: statusMock };
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
  });

  it('calls next with 400 when email is missing', async () => {
    (mockReq as any).body = { password: 'pass123' };

    await adminLogin(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    const err = (next as any).mock.calls[0][0];
    expect(err.message).toBe('Please provide email and password');
    expect(err.statusCode).toBe(400);
  });

  it('calls next with 400 when password is missing', async () => {
    (mockReq as any).body = { email: 'test@example.com' };

    await adminLogin(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    const err = (next as any).mock.calls[0][0];
    expect(err.message).toBe('Please provide email and password');
    expect(err.statusCode).toBe(400);
  });

  it('calls next with 401 when user not found', async () => {
    (mockReq as any).body = { email: 'unknown@example.com', password: 'pass123' };
    (User.findOne as ReturnType<typeof vi.fn>).mockReturnValue(createUserQuery(null));

    await adminLogin(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    const err = (next as any).mock.calls[0][0];
    expect(err.message).toBe('Invalid credentials');
    expect(err.statusCode).toBe(401);
  });

  it('calls next with 401 when password does not match', async () => {
    const mockUser = {
      _id: { toString: () => 'user1' },
      email: 'test@example.com',
      name: 'Test',
      password: 'hashed',
      role: 'role1',
      status: 'active',
      lastLogin: null,
      save: vi.fn(),
    };
    (mockReq as any).body = { email: 'test@example.com', password: 'wrongpass' };
    (User.findOne as ReturnType<typeof vi.fn>).mockReturnValue(createUserQuery(mockUser));
    (Role.findById as ReturnType<typeof vi.fn>).mockResolvedValue({ name: 'client-admin', isSuperAdmin: false });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    await adminLogin(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    const err = (next as any).mock.calls[0][0];
    expect(err.message).toBe('Invalid credentials');
    expect(err.statusCode).toBe(401);
  });

  it('returns 200 with token and user on valid credentials', async () => {
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
    (mockReq as any).body = { email: 'test@example.com', password: 'correctpass' };
    (User.findOne as ReturnType<typeof vi.fn>).mockReturnValue(createUserQuery(mockUser));
    (Role.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockRole);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    await adminLogin(mockReq as Request, mockRes as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'mock-jwt-token',
        user: expect.objectContaining({
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com',
          roleName: 'client-admin',
        }),
      })
    );
    expect(jwt.sign).toHaveBeenCalled();
  });
});

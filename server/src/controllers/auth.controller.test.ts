import { describe, expect, it, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { signAccessToken } from './auth.controller';
import type { IUser } from '../models/user';

const mockUser: IUser = {
  _id: { toString: () => 'user-id-123' } as unknown as IUser['_id'],
  name: 'Test',
  email: 'test@example.com',
  provider: 'local',
  role: 'role-id' as unknown as IUser['role'],
  status: 'Active',
  totalPurchases: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('signAccessToken', () => {
  beforeEach(() => {
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
  });

  it('returns a valid JWT with uid, role, email', () => {
    const token = signAccessToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    const decoded = jwt.verify(token, 'test-secret') as { uid: string; role: string; email: string };
    expect(decoded.uid).toBe('user-id-123');
    expect(decoded.role).toBe('client');
    expect(decoded.email).toBe('test@example.com');
  });
});

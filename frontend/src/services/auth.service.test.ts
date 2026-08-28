import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import { registerUser, loginUser, getCurrentUser, logoutUser } from './auth.service';

vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registerUser posts to /auth/signup and returns response data', async () => {
    const mockData = { success: true, message: 'ok' };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await registerUser({
      name: 'Test',
      email: 'test@example.com',
      password: 'pass123',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/signup', {
      name: 'Test',
      email: 'test@example.com',
      password: 'pass123',
    });
    expect(result).toEqual(mockData);
  });

  it('loginUser posts to /auth/login and returns response data', async () => {
    const mockData = {
      success: true,
      message: 'ok',
      data: { token: 'abc', user: { id: '1', name: 'Test', email: 'test@example.com' } },
    };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await loginUser({ email: 'test@example.com', password: 'pass123' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'pass123',
    });
    expect(result).toEqual(mockData);
  });

  it('getCurrentUser fetches /auth/me and returns response data', async () => {
    const mockData = { success: true, data: { id: '1', name: 'Test', email: 'test@example.com' } };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await getCurrentUser();

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(mockData);
  });

  it('logoutUser posts to /auth/logout and returns response data', async () => {
    const mockData = { success: true, message: 'Logged out' };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockData });

    const result = await logoutUser();

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(result).toEqual(mockData);
  });
});
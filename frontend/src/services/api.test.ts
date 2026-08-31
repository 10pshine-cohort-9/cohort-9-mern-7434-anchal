import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequestUse = vi.fn();
const mockResponseUse = vi.fn();
const mockAxiosInstance = {
  interceptors: {
    request: { use: mockRequestUse },
    response: { use: mockResponseUse },
  },
};
const mockCreate = vi.fn(() => mockAxiosInstance);

vi.mock('axios', () => ({
  default: {
    create: mockCreate,
  },
}));

function getRequestHandlers() {
  const lastCall = mockRequestUse.mock.calls[mockRequestUse.mock.calls.length - 1];
  return { onFulfilled: lastCall[0] };
}

describe('api', () => {
  beforeEach(async () => {
    vi.resetModules();
    mockRequestUse.mockClear();
    mockResponseUse.mockClear();
    mockCreate.mockClear();
    localStorage.clear();
    await import('./api');
  });

  it('creates an axios instance with JSON content-type header', () => {
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('registers a request interceptor', () => {
    expect(mockRequestUse).toHaveBeenCalledTimes(1);
  });

  it('registers a response interceptor', () => {
    expect(mockResponseUse).toHaveBeenCalledTimes(1);
  });

  it('attaches Authorization header when a token exists in localStorage', () => {
    localStorage.setItem('token', 'abc123');
    const { onFulfilled } = getRequestHandlers();
    const config = { headers: {} as Record<string, string> };
    const result = onFulfilled(config);
    expect(result.headers.Authorization).toBe('Bearer abc123');
  });

  it('does not attach Authorization header when no token exists', () => {
    const { onFulfilled } = getRequestHandlers();
    const config = { headers: {} as Record<string, string> };
    const result = onFulfilled(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
});

